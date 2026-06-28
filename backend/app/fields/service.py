import math

from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import shape

from app.fields.schemas import GeoPolygon


def geojson_to_wkb(geom: GeoPolygon):
    """GeoJSON polygon -> WKBElement (SRID 4326)."""
    return from_shape(shape(geom.model_dump()), srid=4326)


def wkb_to_geojson(wkb) -> dict:
    return to_shape(wkb).__geo_interface__


def area_hectares(geom: GeoPolygon) -> float:
    """Approx area (ha): project lon/lat to local metric plane, shoelace area.

    Local equirectangular projection centered on centroid. Good enough for
    field-sized polygons (sub-1% error at typical latitudes).
    """
    ring = geom.coordinates[0]
    lat0 = sum(p[1] for p in ring) / len(ring)
    m_lat = 111_320.0
    m_lon = 111_320.0 * math.cos(math.radians(lat0))
    pts = [(p[0] * m_lon, p[1] * m_lat) for p in ring]
    area2 = 0.0
    for i in range(len(pts) - 1):
        x1, y1 = pts[i]
        x2, y2 = pts[i + 1]
        area2 += x1 * y2 - x2 * y1
    return round(abs(area2) / 2.0 / 10_000.0, 4)


def centroid_lonlat(wkb) -> tuple[float, float]:
    c = to_shape(wkb).centroid
    return c.x, c.y
