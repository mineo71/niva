"""Sentinel Hub vegetation indices via the Statistical API.

Falls back to synthetic data when no creds are set or the API errors.
"""

import hashlib
from datetime import date, datetime, timedelta, timezone

import httpx

from app.core.config import settings

_TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"
_STATS_URL = "https://services.sentinel-hub.com/api/v1/statistics"

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
