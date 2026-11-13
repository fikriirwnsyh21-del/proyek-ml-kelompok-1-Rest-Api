# Sistem Prediksi Risiko Serangan Jantung - REST API FastAPI
**Proyek Machine Learning - Kelompok 1**

Prototipe web dan REST API berbasis Machine Learning untuk melakukan *screening* dan estimasi risiko serangan jantung berdasarkan indikator klinis dan gaya hidup.

---

## 🚀 Fitur Utama
- **Model Machine Learning Pipeline**: Menggunakan algoritma *Random Forest Classifier* dengan *preprocessor* (StandardScaler untuk fitur numerik & OneHotEncoder untuk fitur kategorikal).
- **Validasi Data Kuat**: Menggunakan kelas Pydantic untuk validasi tipe data dan batasan rentang klinis.
- **REST API FastAPI**: Kinerja tinggi, asinkron, dan dilengkapi dokumentasi interaktif Swagger UI (`/docs`).
- **Antarmuka Web Modern**: Antarmuka responsif untuk input form dan visualisasi probabilitas risiko secara *real-time*.

---

## 📁 Struktur Direktori
```text
proyek-ml-kelompok-1/
├── app.py                     # Entry point REST API FastAPI & backend
├── requirements.txt           # Daftar dependensi Python
├── heart_attack_prediction_indonesia.csv  # Dataset pelatihan
├── .gitignore                 # Filter berkas yang tidak di-push
├── model/
│   └── model_kelompok_1.joblib # Model pipeline terlatih
└── static/
    ├── index.html             # Antarmuka web pengguna (UI)
    ├── style.css              # Tata letak & tema CSS
    └── app.js                 # Logika interaksi frontend & integrasi API
```

---

## 🛠️ Cara Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Python 3.10 atau yang lebih baru.

### 2. Instalasi Dependensi
```bash
# Aktifkan virtual environment (opsional namun disarankan)
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell

# Install pustaka
pip install -r requirements.txt
```

### 3. Menjalankan Server
```bash
uvicorn app:app --reload
```
Atau jika menggunakan modul Python langsung:
```bash
python -m uvicorn app:app --reload
```

---

## 🌐 Akses Aplikasi
- **Aplikasi Web**: Buka [http://127.0.0.1:8000/](http://127.0.0.1:8000/) di browser Anda.
- **Dokumentasi Interaktif API (Swagger UI)**: Buka [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
- **Endpoint Prediksi**: `POST /predict`
- **Health Check**: `GET /health`
