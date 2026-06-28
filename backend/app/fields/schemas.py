from typing import Any, Literal

from pydantic import BaseModel, Field

CROPS = ["wheat", "corn", "sunflower", "soybeans", "barley", "oats", "rye", "rapeseed"]
SOILS = ["chalk", "peat", "sandy", "silt"]


class GeoPolygon(BaseModel):
    """GeoJSON Polygon geometry."""

    type: Literal["Polygon"] = "Polygon"
    coordinates: list[list[list[float]]]


class FieldCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    crop_type: str
    soil_type: str
    geometry: GeoPolygon


class FieldUpdate(BaseModel):
    name: str | None = None
    crop_type: str | None = None
    soil_type: str | None = None
    geometry: GeoPolygon | None = None


class FieldResponse(BaseModel):
    id: int
    name: str
    crop_type: str
    soil_type: str
    area_ha: float
    geometry: dict[str, Any]
    created_at: Any
    latest_ndvi: float | None = None
