/**
 * app.js - Integrasi Frontend Web (Langkah 6 Sesuai Modul 10)
 * Proyek Machine Learning Kelompok 1 - S1 Sistem Informasi Universitas Bengkulu
 * Komunikasi asinkron ke REST API FastAPI endpoint /predict via Fetch API
 * Mengarahkan hasil analisis ke halaman khusus (/result)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referensi Elemen Form & Tombol
  const form = document.getElementById('predictionForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  const resetBtn = document.getElementById('resetBtn');
  const errorBox = document.getElementById('errorBox');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');

  // Referensi Preset Test Cases
  const btnSampleLowRisk = document.getElementById('btnSampleLowRisk');
  const btnSampleHighRisk = document.getElementById('btnSampleHighRisk');

  // Data Preset Kasus Uji Sesuai Dataset & Domain Kesehatan
  const PRESET_LOW_RISK = {
    age: 32,
    waist_circumference: 78.0,
    blood_pressure_systolic: 115,
    blood_pressure_diastolic: 75,
    cholesterol_level: 165,
    sleep_hours: 8.0,
    hypertension: 0,
    diabetes: 0,
    obesity: 0,
    previous_heart_disease: 0,
    family_history: 0,
    smoking_status: 'Never',
  };

  const PRESET_HIGH_RISK = {
    age: 64,
    waist_circumference: 104.0,
    blood_pressure_systolic: 165,
    blood_pressure_diastolic: 100,
    cholesterol_level: 285,
    sleep_hours: 5.0,
    hypertension: 1,
    diabetes: 1,
    obesity: 1,
    previous_heart_disease: 1,
    family_history: 1,
    smoking_status: 'Current',
  };

  /**
   * Mengisi form dengan data preset pengujian
   */
  function applyPreset(data) {
    hideError();
    for (const [key, value] of Object.entries(data)) {
      const el = document.getElementById(key);
      if (el) {
        el.value = value;
      }
    }
  }

  if (btnSampleLowRisk) {
    btnSampleLowRisk.addEventListener('click', () => applyPreset(PRESET_LOW_RISK));
  }

  if (btnSampleHighRisk) {
    btnSampleHighRisk.addEventListener('click', () => applyPreset(PRESET_HIGH_RISK));
  }

  /**
   * Helper Menampilkan Pesan Error
   */
  function showError(title, msg) {
    errorTitle.textContent = title;
    errorMessage.textContent = msg;
    errorBox.style.display = 'flex';
    errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Helper Menyembunyikan Pesan Error
   */
  function hideError() {
    errorBox.style.display = 'none';
    errorMessage.textContent = '';
  }

  /**
   * Event Listener Submit Form (Menggunakan fetch('/predict', { method: 'POST', ... }))
   */
  form.addEventListener('submit', async (e) => {
    // 1. Mencegah reload halaman secara default (Wajib berbasis AJAX/Fetch)
    e.preventDefault();
    hideError();

    // 2. Ekstraksi dan Validasi Tipe Data sesuai Pydantic Schema
    const payload = {
      age: parseFloat(document.getElementById('age').value),
      blood_pressure_systolic: parseFloat(document.getElementById('blood_pressure_systolic').value),
      blood_pressure_diastolic: parseFloat(document.getElementById('blood_pressure_diastolic').value),
      cholesterol_level: parseFloat(document.getElementById('cholesterol_level').value),
      waist_circumference: parseFloat(document.getElementById('waist_circumference').value),
      sleep_hours: parseFloat(document.getElementById('sleep_hours').value),
      hypertension: parseInt(document.getElementById('hypertension').value, 10),
      diabetes: parseInt(document.getElementById('diabetes').value, 10),
      obesity: parseInt(document.getElementById('obesity').value, 10),
      family_history: parseInt(document.getElementById('family_history').value, 10),
      smoking_status: document.getElementById('smoking_status').value,
      previous_heart_disease: parseInt(document.getElementById('previous_heart_disease').value, 10),
    };

    // Validasi kelengkapan form di sisi klien
    for (const [key, value] of Object.entries(payload)) {
      if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
        showError('Data Tidak Lengkap', `Kolom '${key}' belum diisi atau format nilainya tidak valid.`);
        return;
      }
    }

    // 3. Set State Loading pada Tombol
    submitBtn.disabled = true;
    btnText.textContent = 'Menganalisis & Menyiapkan Hasil...';
    spinner.style.display = 'inline-block';

    try {
      // 4. Integrasi Fetch API ke endpoint POST /predict
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // 5. Penanganan Error HTTP (misal validasi Pydantic HTTP 422)
      if (!response.ok) {
        let errMessage = 'Terjadi kesalahan pada server saat memproses prediksi.';
        try {
          const errData = await response.json();
          if (Array.isArray(errData.detail)) {
            const details = errData.detail.map(d => `${d.loc ? d.loc.join('.') : 'Field'}: ${d.msg}`).join(', ');
            errMessage = `Validasi Input Gagal: ${details}`;
          } else if (typeof errData.detail === 'string') {
            errMessage = errData.detail;
          }
        } catch (_) {
          errMessage = `Server mengembalikan status error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errMessage);
      }

      // 6. Dapatkan Hasil Prediksi dari Server
      const result = await response.json();

      // 7. Simpan Hasil Prediksi dan Input ke sessionStorage untuk Ditampilkan di Halaman Hasil (/result)
      sessionStorage.setItem('predictionResult', JSON.stringify(result));
      sessionStorage.setItem('patientData', JSON.stringify(payload));

      // 8. Navigasi Mulus ke Halaman Hasil Analisis (/result)
      window.location.href = '/result';

    } catch (error) {
      console.error('Error saat request ke /predict:', error);
      showError('Gagal Memproses Prediksi', error.message);
      submitBtn.disabled = false;
      btnText.textContent = 'Analisis Risiko & Lihat Hasil ➔';
      spinner.style.display = 'none';
    }
  });

  /**
   * Reset Form
   */
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      hideError();
    });
  }
});
