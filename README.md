# 🌾 Niva

> Satellite intelligence for your fields.

Niva (Ukrainian *нива* — a field of grain) is a precision-agriculture platform.
Draw your fields on a map and get satellite vegetation analytics (NDVI), weather,
ML-based yield forecasts, and AI-generated field-health reports.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + TypeScript, Tailwind v4, Zustand, Mapbox GL, Recharts, i18next |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2 + GeoAlchemy2 |
| Database | PostgreSQL + PostGIS |
| ML | scikit-learn (RandomForest yield forecast, in-process) |
| AI | Groq API (field-health reports) |
| Satellite / Weather | Sentinel Hub, OpenWeatherMap (synthetic fallback without keys) |

## Features

- 🔐 Email/password auth (JWT access + refresh)
- 🗺️ Draw & manage field polygons (PostGIS, auto area)
- 🛰️ NDVI / EVI / NDMI / SAVI vegetation indices
- 🌦️ Current weather + 7-day forecast
- 📈 ML yield forecast (t/ha) with confidence
- 🤖 AI field-health report (Groq)
- 📊 Dashboard stats & crop distribution
- 🌍 i18n (Ukrainian default, English ready)

## Run

```bash
# whole stack (api + postgis)
docker compose up --build
# api: http://localhost:8000  (docs at /docs)

# frontend
cd frontend
cp .env.example .env   # set VITE_API_URL + VITE_MAPBOX_TOKEN
npm install
npm run dev            # http://localhost:5173
```

Backend works without external API keys — it serves synthetic NDVI/weather data
so the full flow is demoable out of the box. Add real keys in `backend/.env`.

## Structure

```
niva/
├── backend/          FastAPI + ML + PostGIS
│   └── app/          auth, fields, sentinel, weather, yield_pred, ai, stats
├── frontend/         React + Vite SPA
└── docker-compose.yml
```
