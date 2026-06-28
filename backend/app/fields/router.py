from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.models import User
from app.core.db import get_db
from app.fields.models import Field
from app.fields.schemas import CROPS, SOILS, FieldCreate, FieldResponse, FieldUpdate
from app.fields.service import area_hectares, geojson_to_wkb, wkb_to_geojson
from app.sentinel.models import IndicesCache
from app.weather.models import WeatherCache

router = APIRouter(prefix="/fields", tags=["fields"])


def _to_response(f: Field, cache: IndicesCache | None = None) -> FieldResponse:
    latest = None
    trend: list[float] = []
    updated_at = None
    if cache and cache.series:
        trend = [p["ndvi"] for p in cache.series if p.get("ndvi") is not None]
        latest = trend[-1] if trend else None
        updated_at = cache.fetched_at
    return FieldResponse(
        id=f.id,
        name=f.name,
        crop_type=f.crop_type,
        soil_type=f.soil_type,
        area_ha=f.area_ha,
        geometry=wkb_to_geojson(f.geometry),
        created_at=f.created_at,
        latest_ndvi=latest,
        ndvi_trend=trend,
        ndvi_updated_at=updated_at,
    )


def _ndvi_cache(db: Session, field_id: int) -> IndicesCache | None:
    return db.get(IndicesCache, field_id)


def _owned(field_id: int, user: User, db: Session) -> Field:
    f = db.get(Field, field_id)
    if f is None or f.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Field not found")
    return f


@router.get("", response_model=list[FieldResponse])
def list_fields(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = list(
        db.scalars(select(Field).where(Field.owner_id == user.id).order_by(Field.created_at.desc()))
    )
    # batch-load cached NDVI for all fields (no external API calls)
    ids = [f.id for f in rows]
    cache_map: dict[int, IndicesCache] = {}
    if ids:
        for c in db.scalars(select(IndicesCache).where(IndicesCache.field_id.in_(ids))):
            cache_map[c.field_id] = c
    return [_to_response(f, cache_map.get(f.id)) for f in rows]


@router.post("", response_model=FieldResponse, status_code=status.HTTP_201_CREATED)
def create_field(
    body: FieldCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if body.crop_type not in CROPS:
        raise HTTPException(422, f"crop_type must be one of {CROPS}")
    if body.soil_type not in SOILS:
        raise HTTPException(422, f"soil_type must be one of {SOILS}")
    f = Field(
        owner_id=user.id,
        name=body.name,
        crop_type=body.crop_type,
        soil_type=body.soil_type,
        area_ha=area_hectares(body.geometry),
        geometry=geojson_to_wkb(body.geometry),
    )
    db.add(f)
    db.commit()
    db.refresh(f)
    return _to_response(f)


@router.get("/{field_id}", response_model=FieldResponse)
def get_field(field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = _owned(field_id, user, db)
    return _to_response(f, _ndvi_cache(db, f.id))


@router.put("/{field_id}", response_model=FieldResponse)
def update_field(
    field_id: int,
    body: FieldUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    f = _owned(field_id, user, db)
    if body.name is not None:
        f.name = body.name
    if body.crop_type is not None:
        f.crop_type = body.crop_type
    if body.soil_type is not None:
        f.soil_type = body.soil_type
    if body.geometry is not None:
        f.geometry = geojson_to_wkb(body.geometry)
        f.area_ha = area_hectares(body.geometry)
        # cached indices/weather are for the old polygon — drop them
        db.execute(delete(IndicesCache).where(IndicesCache.field_id == f.id))
        db.execute(delete(WeatherCache).where(WeatherCache.field_id == f.id))
    db.commit()
    db.refresh(f)
    return _to_response(f, _ndvi_cache(db, f.id))


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = _owned(field_id, user, db)
    db.delete(f)
    db.commit()
