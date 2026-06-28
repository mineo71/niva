"""DB-backed cache for weather. Daily-ish TTL (configurable).

Only real OpenWeatherMap data is cached; synthetic fallbacks retry next call.
"""

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import settings
from app.fields.models import Field
from app.fields.service import centroid_lonlat
from app.weather.models import WeatherCache
from app.weather.service import get_weather


async def get_field_weather(db: Session, field: Field, force: bool = False) -> dict:
    row = db.get(WeatherCache, field.id)
    if row and not force:
        age = datetime.now(timezone.utc) - row.fetched_at
        if age < timedelta(hours=settings.weather_cache_hours):
            return {
                "source": row.source,
                "current": row.current,
                "forecast": row.forecast,
                "cached": True,
            }

    lon, lat = centroid_lonlat(field.geometry)
    fresh = await get_weather(lon, lat)

    if fresh.get("source") == "openweathermap":
        if row is None:
            row = WeatherCache(field_id=field.id)
            db.add(row)
        row.source = fresh["source"]
        row.current = fresh["current"]
        row.forecast = fresh["forecast"]
        row.fetched_at = datetime.now(timezone.utc)
        db.commit()

    fresh["cached"] = False
    return fresh
