from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user
from app.auth.models import User
from app.core.db import get_db
from app.fields.models import Field
from app.fields.schemas import CROPS, SOILS, FieldCreate, FieldResponse, FieldUpdate
from app.fields.service import area_hectares, geojson_to_wkb, wkb_to_geojson

router = APIRouter(prefix="/fields", tags=["fields"])


def _to_response(f: Field) -> FieldResponse:
    return FieldResponse(
        id=f.id,
        name=f.name,
        crop_type=f.crop_type,
        soil_type=f.soil_type,
        area_ha=f.area_ha,
        geometry=wkb_to_geojson(f.geometry),
        created_at=f.created_at,
    )


def _owned(field_id: int, user: User, db: Session) -> Field:
    f = db.get(Field, field_id)
    if f is None or f.owner_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Field not found")
    return f


@router.get("", response_model=list[FieldResponse])
def list_fields(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Field).where(Field.owner_id == user.id).order_by(Field.created_at.desc()))
    return [_to_response(f) for f in rows]


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
    return _to_response(_owned(field_id, user, db))


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
    db.commit()
    db.refresh(f)
    return _to_response(f)


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_field(field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = _owned(field_id, user, db)
    db.delete(f)
    db.commit()
