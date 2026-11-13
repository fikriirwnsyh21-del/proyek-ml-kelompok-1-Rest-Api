"""
Backend REST API FastAPI untuk Prediksi Risiko Serangan Jantung (Heart Attack Prediction)
Kelompok 1
"""

from pathlib import Path
from typing import Literal
from collections import UserList
import sklearn.compose._column_transformer as ct

# Kompatibilitas unpickle scikit-learn antar-versi
if not hasattr(ct, "_RemainderColsList"):
    class _RemainderColsList(UserList):
        def __init__(self, columns, *args, **kwargs):
            super().__init__(columns)
    ct._RemainderColsList = _RemainderColsList

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Inisialisasi Path
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "model_kelompok_1.joblib"
STATIC_DIR = BASE_DIR / "static"

# Load model pipeline
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file tidak ditemukan di {MODEL_PATH}")

try:
    model_pipeline = joblib.load(MODEL_PATH)
except Exception as e:
    raise RuntimeError(f"Gagal memuat model joblib: {e}")

# Inisialisasi FastAPI
app = FastAPI(
    title="Heart Attack Prediction API - Kelompok 1",
    description="REST API untuk memprediksi risiko serangan jantung berbasis Machine Learning Pipeline.",
    version="1.0.0",
)

# Middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Urutan fitur sesuai training dataset & preprocessor
FEATURE_NAMES = [
    "age",
    "blood_pressure_systolic",
    "blood_pressure_diastolic",
    "cholesterol_level",
    "waist_circumference",
    "sleep_hours",
    "hypertension",
    "diabetes",
    "obesity",
    "family_history",
    "smoking_status",
    "previous_heart_disease",
]

CLASS_LABELS = {
    0: "Risiko Rendah (Tidak Terindikasi Serangan Jantung)",
    1: "Risiko Tinggi (Terindikasi Risiko Serangan Jantung)",
}


class HeartAttackPayload(BaseModel):
    """
    Kelas Pydantic untuk memvalidasi atribut payload JSON input prediksi
    """
    age: float = Field(..., ge=18, le=120, description="Usia pasien (tahun, 18-120)")
    blood_pressure_systolic: float = Field(..., ge=60, le=260, description="Tekanan darah sistolik (mmHg, 60-260)")
    blood_pressure_diastolic: float = Field(..., ge=40, le=160, description="Tekanan darah diastolik (mmHg, 40-160)")
    cholesterol_level: float = Field(..., ge=80, le=600, description="Kadar kolesterol total (mg/dL)")
    waist_circumference: float = Field(..., ge=40, le=200, description="Lingkar pinggang (cm, 40-200)")
    sleep_hours: float = Field(..., ge=1, le=24, description="Rata-rata jam tidur per hari (jam, 1-24)")
    hypertension: int = Field(..., ge=0, le=1, description="Riwayat hipertensi (0: Tidak, 1: Ya)")
    diabetes: int = Field(..., ge=0, le=1, description="Riwayat diabetes (0: Tidak, 1: Ya)")
    obesity: int = Field(..., ge=0, le=1, description="Riwayat obesitas (0: Tidak, 1: Ya)")
    family_history: int = Field(..., ge=0, le=1, description="Riwayat penyakit jantung keluarga (0: Tidak, 1: Ya)")
    smoking_status: Literal["Never", "Past", "Current"] = Field(
        ...,
        description="Status merokok ('Never', 'Past', atau 'Current')",
    )
    previous_heart_disease: int = Field(..., ge=0, le=1, description="Riwayat sakit jantung sebelumnya (0: Tidak, 1: Ya)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "age": 52.0,
                "blood_pressure_systolic": 135.0,
                "blood_pressure_diastolic": 85.0,
                "cholesterol_level": 220.0,
                "waist_circumference": 88.0,
                "sleep_hours": 6.5,
                "hypertension": 1,
                "diabetes": 0,
                "obesity": 0,
                "family_history": 1,
                "smoking_status": "Past",
                "previous_heart_disease": 0,
            }
        }
    }


class PredictionResponse(BaseModel):
    status: str
    prediction: int
    label: str
    probability_no_risk: float
    probability_risk: float
    recommendation: str


# Mount static files jika direktori static ada
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def serve_index():
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Selamat datang di Heart Attack Prediction API Kelompok 1. Kunjungi /docs untuk Swagger UI."}


@app.get("/health", tags=["Status"])
def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "features_count": len(FEATURE_NAMES),
    }


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict_heart_attack(payload: HeartAttackPayload):
    try:
        # Konversi payload Pydantic ke DataFrame sesuai urutan fitur
        input_dict = payload.model_dump()
        df_input = pd.DataFrame([input_dict])[FEATURE_NAMES]

        # Prediksi menggunakan pipeline scikit-learn
        pred_class = int(model_pipeline.predict(df_input)[0])

        proba_no_risk = 0.0
        proba_risk = 0.0
        if hasattr(model_pipeline, "predict_proba"):
            probabilities = model_pipeline.predict_proba(df_input)[0]
            proba_no_risk = round(float(probabilities[0]), 4)
            proba_risk = round(float(probabilities[1]), 4)

        label = CLASS_LABELS.get(pred_class, "Tidak Diketahui")

        if pred_class == 1:
            recommendation = (
                "Perhatian: Indikator menunjukkan risiko serangan jantung yang perlu diwaspadai. "
                "Disarankan untuk segera berkonsultasi dengan dokter spesialis jantung, "
                "memantau tekanan darah dan kolesterol secara teratur, serta menjaga pola hidup sehat."
            )
        else:
            recommendation = (
                "Kondisi menunjukkan risiko serangan jantung yang relatif rendah. "
                "Tetap pertahankan pola makan seimbang, rutin berolahraga, dan lakukan pemeriksaan kesehatan berkala."
            )

        return PredictionResponse(
            status="success",
            prediction=pred_class,
            label=label,
            probability_no_risk=proba_no_risk,
            probability_risk=proba_risk,
            recommendation=recommendation,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat memproses prediksi: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
