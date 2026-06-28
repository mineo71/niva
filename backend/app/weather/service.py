"""OpenWeatherMap fetch. Falls back to synthetic data when no API key."""

import hashlib
from datetime import date, timedelta

import httpx

from app.core.config import settings

_CURRENT = "https://api.openweathermap.org/data/2.5/weather"
_FORECAST = "https://api.openweathermap.org/data/2.5/forecast"


def _synthetic(lon: float, lat: float) -> dict:
    seed = int(hashlib.sha256(f"{lon:.2f},{lat:.2f}".encode()).hexdigest(), 16)
    base_t = 12 + (seed % 15)
    today = date.today()
    forecast = []
    for i in range(7):
        d = today + timedelta(days=i)
        t = base_t + ((seed >> i) & 0x7) - 3
        forecast.append(
            {
                "date": d.isoformat(),
                "temp_c": round(t, 1),
                "rain_mm": round(((seed >> (i + 3)) & 0xF) * 0.6, 1),
                "humidity": 50 + ((seed >> i) & 0x1F),
            }
        )
    return {
        "source": "synthetic",
        "current": {"temp_c": base_t, "humidity": 60, "description": "scattered clouds"},
        "forecast": forecast,
    }


async def get_weather(lon: float, lat: float) -> dict:
    if not settings.owm_api_key:
        return _synthetic(lon, lat)
    params = {"lat": lat, "lon": lon, "appid": settings.owm_api_key, "units": "metric"}
    async with httpx.AsyncClient(timeout=20) as client:
        cur = await client.get(_CURRENT, params=params)
        cur.raise_for_status()
        c = cur.json()
        fc = await client.get(_FORECAST, params=params)
        fc.raise_for_status()
        f = fc.json()
    daily: dict[str, dict] = {}
    for item in f.get("list", []):
        d = item["dt_txt"][:10]
        daily.setdefault(d, {"temps": [], "rain": 0.0, "hum": []})
        daily[d]["temps"].append(item["main"]["temp"])
        daily[d]["rain"] += item.get("rain", {}).get("3h", 0.0)
        daily[d]["hum"].append(item["main"]["humidity"])
    forecast = [
        {
            "date": d,
            "temp_c": round(sum(v["temps"]) / len(v["temps"]), 1),
            "rain_mm": round(v["rain"], 1),
            "humidity": round(sum(v["hum"]) / len(v["hum"])),
        }
        for d, v in sorted(daily.items())
    ][:7]
    return {
        "source": "openweathermap",
        "current": {
            "temp_c": round(c["main"]["temp"], 1),
            "humidity": c["main"]["humidity"],
            "description": c["weather"][0]["description"],
        },
        "forecast": forecast,
    }
