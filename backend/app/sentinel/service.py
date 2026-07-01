"""Sentinel Hub vegetation indices via the Statistical API.

Falls back to synthetic data when no creds are set or the API errors.
"""

import base64
import hashlib
from datetime import date, datetime, timedelta, timezone

import httpx

from app.core.config import settings

_TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"
_STATS_URL = "https://services.sentinel-hub.com/api/v1/statistics"
_PROCESS_URL = "https://services.sentinel-hub.com/api/v1/process"

INDICES = ["ndvi", "evi", "ndmi", "savi"]

# computes NDVI/EVI/NDMI/SAVI per pixel; Statistical API returns per-band means
_EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02", "B04", "B08", "B11", "dataMask"] }],
    output: [
      { id: "indices", bands: 4 },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  let evi = 2.5 * ((s.B08 - s.B04) / (s.B08 + 6 * s.B04 - 7.5 * s.B02 + 1));
  let ndmi = (s.B08 - s.B11) / (s.B08 + s.B11);
  let savi = ((s.B08 - s.B04) / (s.B08 + s.B04 + 0.5)) * 1.5;
  return { indices: [ndvi, evi, ndmi, savi], dataMask: [s.dataMask] };
}
"""


async def _get_token(client: httpx.AsyncClient) -> str:
    r = await client.post(
        _TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": settings.sentinel_client_id,
            "client_secret": settings.sentinel_client_secret,
        },
    )
    r.raise_for_status()
    return r.json()["access_token"]


def _synthetic_series(lon: float, lat: float, weeks: int = 12) -> list[dict]:
    """Deterministic pseudo-NDVI time series seeded by location."""
    seed = int(hashlib.sha256(f"{lon:.3f},{lat:.3f}".encode()).hexdigest(), 16)
    today = date.today()
    out = []
    for w in range(weeks, 0, -1):
        d = today - timedelta(weeks=w)
        phase = (weeks - w) / weeks
        base = 0.25 + 0.55 * (1 - (2 * phase - 1) ** 2)
        jitter = ((seed >> (w % 16)) & 0xFF) / 255.0 * 0.08 - 0.04
        ndvi = round(max(0.05, min(0.95, base + jitter)), 3)
        out.append(
            {
                "date": d.isoformat(),
                "ndvi": ndvi,
                "evi": round(ndvi * 0.9, 3),
                "ndmi": round(ndvi * 0.6 + 0.1, 3),
                "savi": round(ndvi * 0.95, 3),
            }
        )
    return out


def _polygon_4326(lon: float, lat: float, geometry: dict | None) -> dict:
    """Use the field polygon if provided, else a tiny box around the centroid."""
    if geometry and geometry.get("type") == "Polygon":
        return geometry
    d = 0.002  # ~200 m box
    return {
        "type": "Polygon",
        "coordinates": [
            [
                [lon - d, lat - d],
                [lon + d, lat - d],
                [lon + d, lat + d],
                [lon - d, lat + d],
                [lon - d, lat - d],
            ]
        ],
    }


def _parse_stats(payload: dict) -> list[dict]:
    series: list[dict] = []
    for item in payload.get("data", []):
        if item.get("outputs", {}).get("indices", {}).get("bands") is None:
            continue
        bands = item["outputs"]["indices"]["bands"]
        # skip intervals with no valid pixels
        sample = bands.get("B0", {}).get("stats", {})
        if not sample or sample.get("sampleCount", 0) == sample.get("noDataCount", 0):
            continue

        def mean(b):
            return bands.get(b, {}).get("stats", {}).get("mean")

        ndvi = mean("B0")
        if ndvi is None:
            continue
        series.append(
            {
                "date": item["interval"]["from"][:10],
                "ndvi": round(ndvi, 3),
                "evi": round(mean("B1"), 3) if mean("B1") is not None else None,
                "ndmi": round(mean("B2"), 3) if mean("B2") is not None else None,
                "savi": round(mean("B3"), 3) if mean("B3") is not None else None,
            }
        )
    return series


async def _fetch_real(lon: float, lat: float, geometry: dict | None) -> dict:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=120)
    body = {
        "input": {
            "bounds": {
                "geometry": _polygon_4326(lon, lat, geometry),
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"},
            },
            "data": [
                {"type": "sentinel-2-l2a", "dataFilter": {"mosaickingOrder": "leastCC"}}
            ],
        },
        "aggregation": {
            "timeRange": {
                "from": start.strftime("%Y-%m-%dT00:00:00Z"),
                "to": now.strftime("%Y-%m-%dT23:59:59Z"),
            },
            "aggregationInterval": {"of": "P10D"},
            "evalscript": _EVALSCRIPT,
            # resx/resy are in the bounds CRS units (degrees for EPSG:4326);
            # ~0.0001 deg ≈ 10 m pixels, within the S2L2A resolution limits.
            "resx": 0.0001,
            "resy": 0.0001,
        },
    }
    async with httpx.AsyncClient(timeout=60) as client:
        token = await _get_token(client)
        r = await client.post(
            _STATS_URL, json=body, headers={"Authorization": f"Bearer {token}"}
        )
        r.raise_for_status()
        series = _parse_stats(r.json())
    if not series:
        raise ValueError("no Sentinel data in range")
    return {"source": "sentinel-hub", "series": series}


async def get_indices(lon: float, lat: float, geometry: dict | None = None) -> dict:
    """Vegetation index time series for a field. Real Sentinel Hub or synthetic."""
    if not (settings.sentinel_client_id and settings.sentinel_client_secret):
        return {"source": "synthetic", "series": _synthetic_series(lon, lat)}
    try:
        return await _fetch_real(lon, lat, geometry)
    except Exception:
        return {"source": "synthetic_fallback", "series": _synthetic_series(lon, lat)}


# ── NDVI timeline (per-date mean + area-class distribution) ────────────────────

# single-band NDVI for the Statistics API (with histogram calculation)
_NDVI_EVALSCRIPT = """//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [{ id: "ndvi", bands: 1 }, { id: "dataMask", bands: 1 }],
  };
}
function evaluatePixel(s) {
  let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  return { ndvi: [ndvi], dataMask: [s.dataMask] };
}
"""

# per-pixel NDVI → red→yellow→green RGBA heatmap (transparent outside field/no data)
_HEATMAP_EVALSCRIPT = """//VERSION=3
function setup() {
  return { input: ["B04", "B08", "dataMask"], output: { bands: 4 } };
}
function evaluatePixel(s) {
  if (s.dataMask === 0) return [0, 0, 0, 0];
  let n = (s.B08 - s.B04) / (s.B08 + s.B04);
  let t = Math.max(0, Math.min(1, n));
  let r, g;
  if (t < 0.5) { r = 1; g = 2 * t; }
  else { r = 1 - (t - 0.5) * 2; g = 1; }
  return [r, g, 0, 1];
}
"""

# histogram bins aligned to health classes: poor <0.3, moderate 0.3–0.5,
# good 0.5–0.7, excellent 0.7–1.0. All-float to satisfy the API.
_HIST_BINS = [-1.0, 0.3, 0.5, 0.7, 1.0000001]
_CLASS_KEYS = ["poor", "moderate", "good", "excellent"]


def _bins_to_distribution(bins: list[dict]) -> dict | None:
    """Sentinel histogram bins → percentage per health class."""
    ordered = sorted(bins, key=lambda b: b.get("lowEdge", 0))
    counts = [b.get("count", 0) for b in ordered]
    total = sum(counts)
    if total <= 0 or len(counts) < 4:
        return None
    return {k: round(counts[i] / total * 100) for i, k in enumerate(_CLASS_KEYS)}


def _synthetic_distribution(ndvi: float) -> dict:
    """Plausible class split centred on the mean NDVI (demo fallback)."""
    if ndvi >= 0.6:
        return {"excellent": 25, "good": 55, "moderate": 15, "poor": 5}
    if ndvi >= 0.45:
        return {"excellent": 10, "good": 50, "moderate": 30, "poor": 10}
    if ndvi >= 0.3:
        return {"excellent": 3, "good": 27, "moderate": 45, "poor": 25}
    return {"excellent": 0, "good": 8, "moderate": 32, "poor": 60}


async def _fetch_timeline(geometry: dict, days: int) -> dict:
    now = datetime.now(timezone.utc)
    start = now - timedelta(days=days)
    body = {
        "input": {
            "bounds": {
                "geometry": geometry,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"},
            },
            "data": [
                {"type": "sentinel-2-l2a", "dataFilter": {"maxCloudCoverage": 30}}
            ],
        },
        "aggregation": {
            "timeRange": {
                "from": start.strftime("%Y-%m-%dT00:00:00Z"),
                "to": now.strftime("%Y-%m-%dT23:59:59Z"),
            },
            "aggregationInterval": {"of": "P1D"},
            "resx": 0.0001,
            "resy": 0.0001,
            "evalscript": _NDVI_EVALSCRIPT,
        },
        "calculations": {"ndvi": {"histograms": {"default": {"bins": _HIST_BINS}}}},
    }
    async with httpx.AsyncClient(timeout=60) as client:
        token = await _get_token(client)
        r = await client.post(
            _STATS_URL, json=body, headers={"Authorization": f"Bearer {token}"}
        )
        r.raise_for_status()
        payload = r.json()

    dates: list[dict] = []
    for item in payload.get("data", []):
        band = item.get("outputs", {}).get("ndvi", {}).get("bands", {}).get("B0", {})
        stats = band.get("stats", {})
        mean = stats.get("mean")
        if mean is None or stats.get("sampleCount", 0) == stats.get("noDataCount", 0):
            continue
        dist = _bins_to_distribution(band.get("histogram", {}).get("bins", []))
        dates.append(
            {
                "date": item["interval"]["from"][:10],
                "ndvi": round(mean, 3),
                "distribution": dist or _synthetic_distribution(mean),
            }
        )
    if not dates:
        raise ValueError("no Sentinel data in range")
    dates.sort(key=lambda d: d["date"])
    return {"source": "sentinel-hub", "dates": dates}


def _synthetic_timeline(lon: float, lat: float, days: int) -> dict:
    weeks = max(4, days // 7)
    out = []
    for row in _synthetic_series(lon, lat, weeks=weeks):
        out.append(
            {
                "date": row["date"],
                "ndvi": row["ndvi"],
                "distribution": _synthetic_distribution(row["ndvi"]),
            }
        )
    return {"source": "synthetic", "dates": out}


async def get_timeline(
    lon: float, lat: float, geometry: dict | None, days: int = 75
) -> dict:
    """Per-date NDVI mean + health-class distribution for a field."""
    if not (settings.sentinel_client_id and settings.sentinel_client_secret) or not geometry:
        return _synthetic_timeline(lon, lat, days)
    try:
        return await _fetch_timeline(geometry, days)
    except Exception:
        return {**_synthetic_timeline(lon, lat, days), "source": "synthetic_fallback"}


# ── NDVI heatmap image (per-pixel raster clipped to the field) ─────────────────


def _bbox(geometry: dict) -> tuple[float, float, float, float]:
    ring = geometry["coordinates"][0]
    lons = [p[0] for p in ring]
    lats = [p[1] for p in ring]
    return min(lons), min(lats), max(lons), max(lats)


async def get_heatmap(geometry: dict | None, day: str) -> dict | None:
    """Colored NDVI PNG for a field on a given date. None if unavailable."""
    if not (settings.sentinel_client_id and settings.sentinel_client_secret) or not geometry:
        return None
    try:
        target = datetime.strptime(day, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        return None

    frm = (target - timedelta(days=2)).strftime("%Y-%m-%dT00:00:00Z")
    to = (target + timedelta(days=2)).strftime("%Y-%m-%dT23:59:59Z")

    min_lon, min_lat, max_lon, max_lat = _bbox(geometry)
    # output size follows the bbox aspect ratio, capped at 512 px on the long side
    ar = (max_lon - min_lon) / max(max_lat - min_lat, 1e-9)
    if ar >= 1:
        w, h = 512, max(64, int(512 / ar))
    else:
        w, h = max(64, int(512 * ar)), 512

    body = {
        "input": {
            "bounds": {
                "geometry": geometry,
                "properties": {"crs": "http://www.opengis.net/def/crs/EPSG/0/4326"},
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {"from": frm, "to": to},
                        "maxCloudCoverage": 40,
                        "mosaickingOrder": "leastCC",
                    },
                }
            ],
        },
        "output": {
            "width": w,
            "height": h,
            "responses": [{"identifier": "default", "format": {"type": "image/png"}}],
        },
        "evalscript": _HEATMAP_EVALSCRIPT,
    }
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            token = await _get_token(client)
            r = await client.post(
                _PROCESS_URL,
                json=body,
                headers={"Authorization": f"Bearer {token}", "Accept": "image/png"},
            )
            r.raise_for_status()
            png = r.content
    except Exception:
        return None
    if not png:
        return None

    b64 = base64.b64encode(png).decode()
    return {
        "date": day,
        "image": f"data:image/png;base64,{b64}",
        # Mapbox image-source corner order: TL, TR, BR, BL
        "coordinates": [
            [min_lon, max_lat],
            [max_lon, max_lat],
            [max_lon, min_lat],
            [min_lon, min_lat],
        ],
    }
