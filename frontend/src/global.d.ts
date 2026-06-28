// @turf/turf has types at index.d.ts but they're blocked by the package "exports"
// field when using moduleResolution "bundler". Re-declare to satisfy TypeScript.
declare module '@turf/turf' {
  // area returns square meters for GeoJSON features
  export function area(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry): number
  export function bbox(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection | GeoJSON.Geometry): [number, number, number, number]
  export function centroid(geojson: GeoJSON.Feature | GeoJSON.FeatureCollection): GeoJSON.Feature<GeoJSON.Point>
  export function polygon(coordinates: number[][][], properties?: Record<string, unknown>): GeoJSON.Feature<GeoJSON.Polygon>
}
