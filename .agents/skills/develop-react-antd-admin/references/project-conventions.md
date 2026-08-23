# Project Conventions

## Key files

| Concern | Location |
| --- | --- |
| Application entry | src/main.tsx |
| Router, locale, Ant Design provider | src/App.tsx |
| Root route assembly | src/routers/index.tsx |
| Route modules | src/routers/modules/*.tsx |
| Authentication guard | src/routers/utils/authRouter.tsx |
| Redux store | src/redux/index.ts |
| Redux domains | src/redux/modules/ |
| HTTP wrapper | src/api/request.ts |
| API modules and types | src/api/modules/, src/api/interface/ |
| Page modules | src/views/ |
| Shared components | src/components/ |
| Layout | src/layouts/ |
| Global and theme styles | src/styles/ |
| Language configuration | src/language/ |
| Environment configuration | .env files and vite.config.ts |

## Change-impact checklist

| Change | Also inspect |
| --- | --- |
| New page | Route, menu, permission, tab, breadcrumb |
| Login or session | Request wrapper, auth guard, persisted Redux |
| Global theme or locale | App.tsx, useTheme, global Redux |
| API endpoint | Types, loading, error, expiry, cancellation |
| Shared component | Consumers, theme, locale, responsive layout |
| Environment variable | All environment files, Vite typings, Vite config |

The repository contains package-lock.json and yarn.lock. Continue the package-manager convention used by the active branch and do not create a third lockfile.
