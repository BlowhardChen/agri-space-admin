# GIS Conventions

## Coordinate boundary

Use a canonical application shape:

    interface GeographicPoint {
        lng: number;
        lat: number;
    }

Use EPSG:4326 for geographic API data and transform to the configured view projection, normally EPSG:3857, when constructing OpenLayers geometry. Never infer coordinate order from numeric magnitude when the API contract can establish it.

## React ownership

| Value | Recommended owner |
| --- | --- |
| Map container | DOM useRef |
| Map, View, layers, sources | useRef or dedicated map hook/service |
| Business records | Typed component or application state |
| Selected business ID | Local state or Redux only when shared |
| Base-layer preference | Local or persisted serializable state |
| Temporary drawing | OpenLayers source plus serialized save result |

## Cleanup checklist

1. Unregister map and source listeners with matching handlers or event keys.
2. Remove draw, modify, select, snap, and measure interactions.
3. Remove overlays and observers owned by the component.
4. Clear timers, subscriptions, geolocation watches, and pending requests.
5. Call map.setTarget(undefined).

## Domain guidance

For land polygons, keep a stable land ID, land type, name, and acreage as feature attributes. For farm and patrol trajectories, preserve timestamp or sequence ordering before building a LineString. Run Turf calculations on EPSG:4326 GeoJSON-compatible coordinates and transform results for display afterward.
