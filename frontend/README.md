# Нива — Frontend

Satellite intelligence platform for agricultural fields. Built with Vite + React 19 + TypeScript + TailwindCSS v4.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:8000        # Your backend URL
VITE_MAPBOX_TOKEN=pk.your_token_here     # Get from mapbox.com (free tier available)
```

> **Mapbox token**: Sign up at [mapbox.com](https://www.mapbox.com/), go to Account → Tokens. A free token handles ~50k map loads/month.

### 3. Start development server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (HMR) |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint with TypeScript rules |

## Stack

| Layer | Library |
|---|---|
| Bundler | Vite 6 + `@vitejs/plugin-react` |
| UI | React 19, TypeScript 5.7 |
| Styling | TailwindCSS v4 (`@tailwindcss/vite`) |
| State | Zustand v5 with `persist` middleware |
| Routing | React Router 7 (`createBrowserRouter`) |
| HTTP | Axios (auto token inject + 401→refresh) |
| i18n | react-i18next, default `uk` locale |
| Map | Mapbox GL + `@mapbox/mapbox-gl-draw` |
| Area calc | `@turf/turf` |
| Charts | Recharts |
| Forms | react-hook-form + yup |
| Icons | lucide-react |
| Toasts | react-toastify |
| Fonts | Syne (display) · Outfit (body) · JetBrains Mono (data) |

## Architecture

```
src/
├── api/          # Thin API wrappers (auth, fields, insights, stats)
├── components/
│   ├── ui/       # Primitives: Button, Input, Card, Dialog, Select, Badge, Skeleton
│   ├── layout/   # DashboardLayout, Sidebar, Topbar
│   └── charts/   # NDVIChart, WeatherChart
├── lib/          # axios client, i18n init, NDVI color scale, utils
├── pages/
│   ├── Landing.tsx
│   ├── auth/     # Login, Signup
│   └── dashboard/ # Overview, Fields, FieldDetail, Map, Settings
├── routes/       # createBrowserRouter, PrivateRoute, PublicRoute
├── stores/       # authStore (JWT + user), uiStore (language, sidebar)
└── types/        # All API types (FieldResponse, etc.)
```

## Authentication Flow

- JWT Bearer token stored in Zustand (persisted to localStorage via `niva-auth` key)
- Axios request interceptor injects `Authorization: Bearer <token>`
- Axios response interceptor: on 401 → POST `/auth/refresh` (httpOnly cookie) → retry once → on failure clears auth + redirects to `/auth/login`

## Locale files

- `public/locales/uk/translation.json` — Ukrainian (default)
- `public/locales/en/translation.json` — English stub

Language toggle is in the Topbar and Settings page. Persisted to localStorage.

## Map Page

Requires a valid `VITE_MAPBOX_TOKEN`. Without it, a graceful fallback placeholder is shown. When the token is present:

- Mapbox GL map loads with satellite-streets style centered on Ukraine
- `@mapbox/mapbox-gl-draw` polygon tool is activated by default
- Drawing a polygon triggers area calculation with `@turf/turf`
- Fill in field name, crop type, and soil type in the sidebar
- Save → POST `/fields` → redirect to new field detail page
- Edit mode (`/dashboard/map/:id`) loads existing geometry and updates via PUT `/fields/:id`

## NDVI Color Scale

`src/lib/ndvi.ts` exports `ndviToHex(value)` — maps NDVI values (−1 to 1) to a brown→yellow→green gradient. Used in charts and the `NDVIChip`/`NDVIColorScale` components.

## Design System

Dark Earth Terminal aesthetic:
- Background: `#070d09` / `#040a06`
- Surface: `#0d1a14`
- Accent: `#4ade80` (lime green)
- Warning: `#f59e0b` (amber)
- Danger: `#ef4444`
- Text: `#f0f4f1` / muted `#6b9e78`
- Border: `#1e3022`
- Fonts: Syne (display) + Outfit (body) + JetBrains Mono (data)
