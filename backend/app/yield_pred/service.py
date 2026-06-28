"""In-process yield forecast. Loads the sklearn pipeline once at import."""

from pathlib import Path

import joblib
import pandas as pd

_MODEL_PATH = Path(__file__).parent / "model.pkl"
_BASELINE_PATH = Path(__file__).parent / "baseline.csv"

_FEATURES = [
    "soil_type",
    "crop_type",
    "ndvi_early",
    "ndvi_mid",
    "ndvi_late",
    "rain_sum_early",
    "rain_sum_mid",
    "rain_sum_late",
    "temp_sum_early",
    "temp_sum_mid",
    "temp_sum_late",
]

try:
    _model = joblib.load(_MODEL_PATH)
except Exception:  # pragma: no cover - model optional in some envs
    _model = None

try:
    _baseline = pd.read_csv(_BASELINE_PATH)
except Exception:
    _baseline = None


def _baseline_value(crop: str, soil: str, col: str) -> float:
    if _baseline is None:
        return 0.0
    subset = _baseline[(_baseline.crop_type == crop) & (_baseline.soil_type == soil)]
    if subset.empty:
        subset = _baseline[_baseline.crop_type == crop]
    if subset.empty:
        return float(_baseline[col].mean())
    return float(subset[col].mean())


def _split_phases(series: list[dict]) -> tuple[list, list, list]:
    """Split an NDVI/weather series into early/mid/late thirds."""
    n = len(series)
    if n == 0:
        return [], [], []
    third = max(1, n // 3)
    return series[:third], series[third : 2 * third], series[2 * third :]


def predict(crop: str, soil: str, indices: dict, weather: dict) -> dict:
    if _model is None:
        return {"error": "model not loaded"}

    ndvi_series = indices.get("series", [])
    e, m, l = _split_phases(ndvi_series)

    def avg(rows, key):
        vals = [r[key] for r in rows if r.get(key) is not None]
        return sum(vals) / len(vals) if vals else None

    # weather forecast as proxy for season rain/temp sums (MVP)
    wf = weather.get("forecast", [])
    we, wm, wl = _split_phases(wf)

    def rain_sum(rows):
        return sum(r.get("rain_mm", 0) for r in rows) if rows else None

    def temp_sum(rows):
        return sum(r.get("temp_c", 0) for r in rows) if rows else None

    raw = {
        "ndvi_early": avg(e, "ndvi"),
        "ndvi_mid": avg(m, "ndvi"),
        "ndvi_late": avg(l, "ndvi"),
        "rain_sum_early": rain_sum(we),
        "rain_sum_mid": rain_sum(wm),
        "rain_sum_late": rain_sum(wl),
        "temp_sum_early": temp_sum(we),
        "temp_sum_mid": temp_sum(wm),
        "temp_sum_late": temp_sum(wl),
    }

    filled = 0
    for col in raw:
        if raw[col] is None:
            raw[col] = _baseline_value(crop, soil, col)
            filled += 1

    row = {"soil_type": soil, "crop_type": crop, **raw}
    X = pd.DataFrame([row])[_FEATURES]
    pred = float(_model.predict(X)[0])

    missing_ratio = filled / 9
    confidence = "high" if missing_ratio < 0.2 else "medium" if missing_ratio < 0.5 else "low"

    return {
        "yield_t_ha": round(pred, 2),
        "confidence": confidence,
        "features_filled_from_baseline": filled,
        "inputs": row,
    }
