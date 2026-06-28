"""AI field-health report via Groq. Falls back to a templated report w/o key."""

import json

from groq import AsyncGroq

from app.core.config import settings

_SYSTEM = (
    "You are an agronomy assistant for the Niva platform. "
    "Given field data (crop, soil, NDVI vegetation indices, weather, yield forecast), "
    "produce a concise, practical field-health report for a farmer. "
    "Respond in the requested language. Be specific and actionable."
)


def _prompt(ctx: dict) -> str:
    return (
        f"Field: {ctx['name']} ({ctx['crop_type']}, soil: {ctx['soil_type']}, "
        f"{ctx['area_ha']} ha)\n"
        f"Latest NDVI: {ctx.get('latest_ndvi')}\n"
        f"Weather now: {ctx.get('weather_current')}\n"
        f"Yield forecast: {ctx.get('yield')} t/ha (confidence: {ctx.get('confidence')})\n\n"
        "Return JSON with keys: summary (string), health (one of good/moderate/poor), "
        "risks (array of strings), recommendations (array of strings)."
    )


def _fallback(ctx: dict) -> dict:
    ndvi = ctx.get("latest_ndvi") or 0
    health = "good" if ndvi > 0.6 else "moderate" if ndvi > 0.4 else "poor"
    return {
        "source": "fallback",
        "summary": (
            f"{ctx['name']}: {ctx['crop_type']} on {ctx['soil_type']} soil. "
            f"Latest NDVI {ndvi} indicates {health} canopy vigor. "
            f"Forecast yield {ctx.get('yield')} t/ha."
        ),
        "health": health,
        "risks": ["Verify with ground inspection", "Monitor upcoming rainfall"],
        "recommendations": [
            "Maintain current irrigation schedule",
            "Scout low-NDVI zones for pests or nutrient stress",
        ],
    }


async def generate_report(ctx: dict, language: str = "uk") -> dict:
    if not settings.groq_api_key:
        return _fallback(ctx)
    client = AsyncGroq(api_key=settings.groq_api_key)
    try:
        resp = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": _SYSTEM},
                {"role": "user", "content": f"Language: {language}\n\n{_prompt(ctx)}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.4,
        )
        data = json.loads(resp.choices[0].message.content)
        data["source"] = "groq"
        return data
    except Exception:
        return _fallback(ctx)
