---
name: develop-react-antd-admin
description: Implement, modify, review, or refactor code in this agri-space-admin repository using its existing React 18, TypeScript, Vite, React Router 6, traditional Redux with redux-persist, Ant Design 4, Less, Axios, i18next, and ECharts architecture. Use for pages, components, forms, tables, layouts, routes, menus, permissions, Redux state, API modules, themes, localization, and frontend configuration in this project. Do not introduce Vue, Element Plus, Pinia, Tailwind, Redux Toolkit, Zustand, MobX, or another UI or state framework. Use build-react-openlayers-gis in addition when a task includes OpenLayers or GIS behavior.
---

# Develop the React Ant Design Admin

Implement against the repository's real code and dependencies. Keep changes small, typed, and consistent with adjacent modules.

## Inspect before editing

1. Read package.json and the files directly involved in the request.
2. Classify impact as view, component, layout, route, menu, permission, Redux, API, style, i18n, environment, or build configuration.
3. Inspect adjacent consumers and configuration.
4. Preserve unrelated working-tree changes and avoid opportunistic rewrites.

Read references/project-conventions.md when locating files or deciding which layers must change.

## Follow the architecture

1. Use React function components and Hooks.
2. Put pages under src/views and reusable components under src/components.
3. Keep layout behavior under src/layouts and page business logic out of layouts.
4. Keep page-only filters, loading, selections, and modal state local.
5. Use the traditional Redux structure only for shared, persistent, authentication, permission, menu, tab, breadcrumb, layout, or theme state.
6. Define explicit TypeScript types for API data, forms, table rows, props, route metadata, and new state.
7. Reuse the @/ alias and follow the nearest module's organization.

## Document variables, functions, and templates

1. Add an accurate semantic comment for every authored variable, constant, function, React component, Hook, and JSX template block.
2. Use JSDoc for exported symbols, components, Hooks, reusable functions, module-level constants, and configuration objects. Use concise line comments for local state, intermediate values, callbacks, and branch-specific calculations.
3. Describe purpose, business meaning, side effects, lifecycle behavior, units, or constraints. Do not use empty descriptions such as "define variable", "handle logic", or comments that merely repeat the identifier.
4. Add JSX comments to identify meaningful page sections, form areas, table regions, dialogs, charts, and repeated templates. A comment for a parent section can cover simple nested markup whose purpose is already clear.
5. Keep comments synchronized when behavior changes. Remove stale, misleading, commented-out code and redundant narration.
6. When modifying an existing file, scan the complete file for undocumented variables, functions, and template regions before finishing.

## Build UI and styles consistently

1. Use Ant Design 4 APIs. Verify compatibility before using newer Ant Design patterns.
2. Use Less and colocate page or component styles in index.less where practical.
3. Reuse existing variables, common styles, themes, SVG icons, and iconfont assets.
4. Preserve theme and locale behavior for shared or layout changes.
5. Use Ant Design Form for forms and type table columns and row keys.

## Synchronize routes and permissions

When adding or changing a page:

1. Update the appropriate src/routers/modules file.
2. Verify path, meta.title, meta.key, and requiresAuth.
3. Verify menu data and the dynamic authorization path.
4. Check menu highlighting, tabs, breadcrumbs, and redirects.
5. Keep HashRouter unless the request explicitly changes routing architecture.

## Use the existing API layer

1. Put requests under src/api and reuse src/api/request.ts.
2. Define request and response types and adapt inconsistent shapes at the API boundary.
3. Preserve token, loading, cancellation, login-expiry, and error behavior.
4. Inspect environment files and vite.config.ts before adding configuration.
5. Do not scatter repeated raw Axios calls through pages.

## Validate proportionally

1. Review the complete diff and affected adjacent modules.
2. Use only scripts present in package.json and follow the repository rule not to run build commands for validation.
3. Run relevant lint checks when the current configuration supports them.
4. Verify route, menu, persistence, API error, or visual behavior according to the changed surface.
5. State checks run, checks omitted, and remaining risk.
