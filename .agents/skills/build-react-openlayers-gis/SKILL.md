---
name: build-react-openlayers-gis
description: Implement, modify, review, or debug React and OpenLayers GIS functionality in this agri-space-admin project. Use for maps, OpenLayers setup, map lifecycle, base layers, tile sources, vector layers, features, markers, labels, land polygons, drawing, selection, merging, spatial calculations, Turf operations, fitting extents, geolocation, coordinate conversion, EPSG projections, farm or patrol trajectories, and map interaction performance. Apply develop-react-antd-admin at the same time for project architecture. Do not use for ordinary React pages without GIS behavior or for a different map engine.
---

# Build React OpenLayers GIS Features

Implement OpenLayers as a React-managed imperative subsystem. Keep domain data serializable and OpenLayers instances inside component or map-service lifecycles.

## Confirm the GIS contract

1. Inspect package.json before importing ol or Turf. Add only dependencies required by the requested GIS feature and follow repository package-manager constraints.
2. Define source coordinates, display projection, coordinate order, geometry type, expected interactions, and backend persistence shape.
3. Confirm whether the feature needs base maps, labels, polygons, drawing, selection, merging, markers, geolocation, trajectories, measurements, or exports.
4. Apply $develop-react-antd-admin for the surrounding page, API, route, state, and styles.
5. When porting GIS from the sibling Vue project, also apply $migrate-diyue-vue-to-react.

Read references/gis-conventions.md before implementing coordinate conversion, feature ownership, or cleanup.

## Own the map lifecycle in React

1. Store the container and OpenLayers instances in useRef, not render state.
2. Create the map in an effect only after the container exists.
3. Separate one-time construction from effects that synchronize data, filters, selections, or visibility.
4. Keep references to layers, sources, interactions, overlays, and handlers that must be updated or removed.
5. On cleanup, unregister listeners, remove owned interactions and overlays, cancel related work, and detach the map target.
6. Avoid recreating the map or all layers on every render.

## Model coordinates explicitly

1. Use [longitude, latitude] for geographic tuples unless an external contract differs.
2. Treat backend longitude and latitude as EPSG:4326 unless verified otherwise.
3. Transform to the view projection at the OpenLayers boundary and transform back before persistence.
4. Normalize { lng, lat }, { lon, lat }, and tuple inputs through typed adapters.
5. Preserve vertex order, polygon closure, geometry identity, and trajectory order.
6. State area and distance units explicitly and convert them in one shared utility.

## Manage layers and interactions safely

1. Group layers by responsibility: base map, labels, land polygons, selected features, trajectories, and temporary drawing.
2. Update vector sources incrementally when practical and use stable feature IDs.
3. Put domain IDs and lightweight display attributes on features; keep full records in typed application data.
4. Make draw, modify, select, merge, and measure modes clear and remove obsolete interactions.
5. Fit only non-empty extents and apply sensible padding and maximum zoom.
6. Avoid private OpenLayers fields such as values_ or style internals; use public APIs.

## Protect configuration and performance

1. Keep tile URLs, tokens, and keys in the existing environment/configuration system. Do not copy hardcoded credentials.
2. Prefer HTTPS tile services and handle attribution and cross-origin requirements deliberately.
3. Avoid one vector layer per feature for large collections; prefer a shared vector source and styled features.
4. Do not store Map, Feature, Layer, Source, geometry, or interaction instances in persisted Redux.
5. Store only serializable preferences and business identifiers in Redux when they cross page boundaries.

## Verify GIS behavior

1. Check known coordinates, projection direction, alignment, extent fitting, selection, cleanup, and repeated navigation.
2. Check empty collections, invalid coordinates, one point, short trajectories, and failed tile or API requests.
3. Review listener and layer counts for duplication after rerenders or route re-entry.
4. Run only repository-approved checks and report visual or interaction behavior not verified locally.
