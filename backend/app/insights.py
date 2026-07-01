"""Field-level insight endpoints: indices, weather, yield, AI report."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.service import generate_report
from app.auth.deps import get_current_user
from app.auth.models import User
from app.core.db import get_db
from app.fields.models import Field
from app.sentinel.cache import get_field_indices
from app.weather.cache import get_field_weather
from app.yield_pred.service import predict, verify_agricultural_land

router = APIRouter(prefix="/fields/{field_id}", tags=["insights"])


def _owned(field_id: int, user: User, db: Session) -> Field:
    f = db.get(Field, field_id)
    if f is None or f.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Field not found")
    return f


def _verify_cropland(indices: dict) -> None:
    series = indices.get("series", [])
    is_valid, reason = verify_agricultural_land(series)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=reason)


@router.get("/indices")
async def field_indices(
    field_id: int,
    refresh: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    f = _owned(field_id, user, db)
    return await get_field_indices(db, f, force=refresh)


@router.get("/weather")
async def field_weather(
    field_id: int,
    refresh: bool = False,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    f = _owned(field_id, user, db)
    return await get_field_weather(db, f, force=refresh)


@router.post("/predict")
async def field_predict(
    field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    f = _owned(field_id, user, db)
    indices = await get_field_indices(db, f)
    _verify_cropland(indices)
    weather = await get_field_weather(db, f)
    result = predict(f.crop_type, f.soil_type, indices, weather)
    if "error" in result:
        raise HTTPException(503, result["error"])
    return result


@router.post("/report")
async def field_report(
    field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    f = _owned(field_id, user, db)
    indices = await get_field_indices(db, f)
    _verify_cropland(indices)
    weather = await get_field_weather(db, f)
    pred = predict(f.crop_type, f.soil_type, indices, weather)
    series = indices.get("series", [])
    ctx = {
        "name": f.name,
        "crop_type": f.crop_type,
        "soil_type": f.soil_type,
        "area_ha": f.area_ha,
        "latest_ndvi": series[-1]["ndvi"] if series else None,
        "weather_current": weather.get("current"),
        "yield": pred.get("yield_t_ha"),
        "confidence": pred.get("confidence"),
    }
    return await generate_report(ctx, language=user.language)
