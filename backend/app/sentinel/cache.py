"""DB-backed cache for Sentinel vegetation indices.

Sentinel-2 revisits every ~5 days, so re-fetching on every page load wastes
Processing Units. We cache the latest real series per field and only re-fetch
once it goes stale (configurable TTL). Synthetic/fallback results are never
cached, so the next request retries the real API.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.fields.models import Field
from app.fields.service import centroid_lonlat, wkb_to_geojson
from app.sentinel.models import IndicesCache
from app.sentinel.service import get_indices


async def get_field_indices(db: Session, field: Field, force: bool = False) -> dict:
    row = db.get(IndicesCache, field.id)
    if row and not force:
        age = datetime.now(timezone.utc) - row.fetched_at
        if age < timedelta(days=settings.ndvi_cache_days):
            return {"source": row.source, "series": row.series, "cached": True}

    lon, lat = centroid_lonlat(field.geometry)
    fresh = await get_indices(lon, lat, wkb_to_geojson(field.geometry))

    # only persist genuine satellite data; let fallbacks retry next time
    if fresh.get("source") == "sentinel-hub":
        if row is None:
            row = IndicesCache(field_id=field.id)
            db.add(row)
        row.source = fresh["source"]
        row.series = fresh["series"]
        row.fetched_at = datetime.now(timezone.utc)
        db.commit()

    fresh["cached"] = False
    return fresh
