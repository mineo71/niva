"""Sentinel Hub vegetation indices. Falls back to synthetic data when no creds."""

import hashlib
from datetime import date, timedelta

import httpx

from app.core.config import settings

_TOKEN_URL = "https://services.sentinel-hub.com/oauth/token"

INDICES = ["ndvi", "evi", "ndmi", "savi"]


async def _get_token() -> str | None:
    if not (settings.sentinel_client_id and settings.sentinel_client_secret):
        return None
    async with httpx.AsyncClient(timeout=20) as client:
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
        # season-shaped curve, peak mid-period
        phase = (weeks - w) / weeks
        base = 0.25 + 0.55 * (1 - (2 * phase - 1) ** 2)  # parabola peaking at 0.8
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


async def get_indices(lon: float, lat: float) -> dict:
    """Return time series of vegetation indices for a field centroid."""
    token = await _get_token()
    if token is None:
        return {"source": "synthetic", "series": _synthetic_series(lon, lat)}
    # NOTE: real Statistical API request would go here using `token`.
    # Kept synthetic-shaped for MVP; wire real evalscript before production.
    return {"source": "synthetic", "series": _synthetic_series(lon, lat)}
