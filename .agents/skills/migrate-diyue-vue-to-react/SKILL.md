---
name: migrate-diyue-vue-to-react
description: Convert features already implemented in the sibling ../diyue-platform-frontend Vue 3 administration project into this agri-space-admin React project. Use when migrating or reproducing a Vue page, component, route, menu, permission flow, API module, type, state, asset, or style from diyue-platform-frontend. Preserve source behavior and API contracts while rewriting Vue, Element Plus, Pinia, and SCSS patterns as React 18, Ant Design 4, Redux or local state, and Less. Do not use for unrelated new features with no source implementation. Also use build-react-openlayers-gis when the migrated feature contains GIS behavior.
---

# Migrate Diyue Vue Features to React

Migrate one complete feature slice at a time from ../diyue-platform-frontend. Treat the Vue project as the functional source and the current repository as the architectural source.

## Establish scope

1. Locate the source page and its directly related components, API module, interfaces, router entry, store, assets, and styles.
2. Inspect the target module and adjacent React code before editing.
3. List behavior to preserve: filters, tables, forms, validation, dialogs, drawers, state transitions, permissions, exports, loading, empty, error, and refresh paths.
4. Keep the requested boundary. Do not migrate neighboring modules merely because they share a directory.
5. Apply $develop-react-antd-admin for all target-side implementation decisions.
6. Apply $build-react-openlayers-gis as well when the source uses OpenLayers, Turf, coordinates, layers, polygons, markers, or trajectories.

## Translate behavior, not syntax

1. Preserve business rules, field meanings, API paths, request methods, parameter shapes, response handling, and permission behavior unless the target establishes a different contract.
2. Rebuild the UI with Ant Design 4 instead of imitating Element Plus APIs.
3. Convert Composition API state and lifecycle to idiomatic React Hooks.
4. Keep page-only state local. Use existing Redux modules only for cross-page, persistent, authentication, permission, layout, menu, tab, breadcrumb, or theme state.
5. Convert scoped Vue or SCSS styles to colocated Less while preserving the target layout and theme.
6. Reuse source assets only when required and compatible.
7. Do not copy Vue components, Pinia stores, Element Plus imports, directives, or template syntax into the target.

Read references/vue-react-mapping.md when translating framework patterns.

## Recreate the target feature

1. Define or adapt explicit TypeScript models near the business module.
2. Add API functions under src/api and reuse src/api/request.ts.
3. Implement pages under src/views and create shared components only when genuinely reusable.
4. Synchronize route, menu, meta.title, meta.key, requiresAuth, permission behavior, tabs, breadcrumbs, and menu highlighting.
5. Remove the corresponding placeholder only after the migrated route is functional.

## Verify parity

1. Compare the React result with the Vue source behavior item by item.
2. Check that no Vue, Element Plus, Pinia, or source-only aliases remain.
3. Protect unrelated working-tree changes.
4. Run only repository-approved validation commands.
5. Report preserved behavior, intentional differences, unverified behavior, and remaining gaps.
