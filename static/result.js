/**
 * result.js - Kontroller Halaman Hasil Analisis (Dedicated Result View)
 * Proyek Machine Learning Kelompok 1 - S1 Sistem Informasi Universitas Bengkulu
 * Fitur: Dropdown toggle rincian data pasien & render visualisasi probabilitas
 */

document.addEventListener('DOMContentLoaded', () => {
  const noDataState = document.getElementById('noDataState');
  const resultMain = document.getElementById('resultMain');

  // Ambil data hasil prediksi dan payload dari sessionStorage
  const rawResult = sessionStorage.getItem('predictionResult');
  const rawPatient = sessionStorage.getItem('patientData');

  if (!rawResult || !rawPatient) {
    noDataState.style.display = 'block';
    resultMain.style.display = 'none';
    return;
  }

  let resultData = null;
  let patientData = null;

  try {
    resultData = JSON.parse(rawResult);
    patientData = JSON.parse(rawPatient);
  } catch (err) {
    console.error('Gagal membaca data dari sessionStorage:', err);
    noDataState.style.display = 'block';
    resultMain.style.display = 'none';
    return;
  }

  // Tampilkan container hasil
  noDataState.style.display = 'none';
  resultMain.style.display = 'block';

  // Format Waktu Pemeriksaan
  const reportTimestamp = document.getElementById('reportTimestamp');
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (reportTimestamp) {
    reportTimestamp.textContent = `Waktu Pemeriksaan: ${dateStr} WIB`;
  }

  // Elemen Visual Hero
  const resultBadge = document.getElementById('resultBadge');
  const resultIcon = document.getElementById('resultIcon');
  const resultTitle = document.getElementById('resultTitle');
  const resultDescription = document.getElementById('resultDescription');
  const riskMainPercent = document.getElementById('riskMainPercent');
  const probPill = document.getElementById('probPill');
  const heroProgressBar = document.getElementById('heroProgressBar');
  const probSafeText = document.getElementById('probSafeText');
  const probDangerText = document.getElementById('probDangerText');
  const recText = document.getElementById('recText');
  const recBox = document.getElementById('recBox');

  const riskPercentVal = (resultData.probability_risk * 100).toFixed(1);
  const noRiskPercentVal = (resultData.probability_no_risk * 100).toFixed(1);

  // Set Nilai Metrik Probabilitas
  riskMainPercent.textContent = `${riskPercentVal}%`;
  probSafeText.textContent = `${noRiskPercentVal}%`;
  probDangerText.textContent = `${riskPercentVal}%`;
  heroProgressBar.style.width = `${Math.max(5, Math.min(100, riskPercentVal))}%`;

  resultTitle.textContent = resultData.label;
  recText.textContent = resultData.recommendation;

  // Konfigurasi Badge dan Indikator Berdasarkan Hasil Prediksi (0 vs 1)
  if (resultData.prediction === 1) {
    resultBadge.textContent = '⚠️ TERINDIKASI RISIKO TINGGI';
    resultBadge.className = 'status-badge badge-high-risk';
    resultIcon.textContent = '🚨';
    resultDescription.textContent =
      'Berdasarkan pemodelan Machine Learning Random Forest, kombinasi parameter klinis dan faktor gaya hidup pasien menunjukkan indikasi risiko tinggi terhadap serangan jantung.';
    heroProgressBar.className = 'progress-bar-fill fill-danger';
    probPill.textContent = 'Kategori: Perlu Konsultasi Dokter Spesialis';
    probPill.className = 'prob-pill pill-danger';
    recBox.className = 'rec-box rec-danger';
  } else {
    resultBadge.textContent = '✅ RISIKO RENDAH (KONDISI STABIL)';
    resultBadge.className = 'status-badge badge-low-risk';
    resultIcon.textContent = '🫀';
    resultDescription.textContent =
      'Berdasarkan pemodelan Machine Learning Random Forest, parameter klinis dan gaya hidup pasien saat ini tergolong dalam batas risiko rendah.';
    heroProgressBar.className = 'progress-bar-fill fill-safe';
    probPill.textContent = 'Kategori: Kondisi Terkendali / Stabil';
    probPill.className = 'prob-pill pill-safe';
    recBox.className = 'rec-box rec-safe';
  }

  // ========================================================
  // Fitur Dropdown Toggle Rincian Data Pasien (Di Kanan Atas)
  // Default: Disembunyikan (Collapsed) Sesuai Permintaan User
  // ========================================================
  const toggleDetailBtn = document.getElementById('toggleDetailBtn');
  const toggleBtnText = document.getElementById('toggleBtnText');
  const tableCollapseWrapper = document.getElementById('tableCollapseWrapper');

  if (toggleDetailBtn && tableCollapseWrapper) {
    toggleDetailBtn.addEventListener('click', () => {
      const isExpanded = tableCollapseWrapper.classList.contains('show');
      
      if (isExpanded) {
        // Tutup Tabel
        tableCollapseWrapper.classList.remove('show');
        toggleDetailBtn.classList.remove('active');
        toggleDetailBtn.setAttribute('aria-expanded', 'false');
        toggleBtnText.textContent = 'Buka Rincian Data Pasien';
      } else {
        // Buka Tabel
        tableCollapseWrapper.classList.add('show');
        toggleDetailBtn.classList.add('active');
        toggleDetailBtn.setAttribute('aria-expanded', 'true');
        toggleBtnText.textContent = 'Tutup Rincian Data Pasien';
      }
    });
  }

  // Render Tabel 12 Parameter
  renderPatientTable(patientData);

  function renderPatientTable(data) {
    const tableBody = document.getElementById('patientTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // Penilaian Kategori Standar Klinis
    const bpSystolicCat = data.blood_pressure_systolic >= 140 ? 'Hipertensi' : data.blood_pressure_systolic >= 120 ? 'Pre-Hipertensi' : 'Normal';
    const bpDiastolicCat = data.blood_pressure_diastolic >= 90 ? 'Hipertensi' : data.blood_pressure_diastolic >= 80 ? 'Pre-Hipertensi' : 'Normal';
    const cholCat = data.cholesterol_level >= 240 ? 'Tinggi (&ge; 240)' : data.cholesterol_level >= 200 ? 'Ambang Batas (200-239)' : 'Optimal (< 200)';
    const waistCat = data.waist_circumference > 90 ? 'Risiko Sentral (> 90)' : 'Dalam Batas Normal';
    const sleepCat = data.sleep_hours < 6 ? 'Kurang (< 6 jam)' : data.sleep_hours > 9 ? 'Berlebih (> 9 jam)' : 'Optimal (6–9 jam)';
    const ageCat = data.age >= 60 ? 'Lansia (&ge; 60)' : data.age >= 45 ? 'Paruh Baya (45–59)' : 'Dewasa Muda (< 45)';

    const tableRows = [
      { no: 1, name: 'Usia Pasien', value: data.age, unit: 'Tahun', cat: ageCat },
      { no: 2, name: 'Tekanan Darah Sistolik', value: data.blood_pressure_systolic, unit: 'mmHg', cat: bpSystolicCat },
      { no: 3, name: 'Tekanan Darah Diastolik', value: data.blood_pressure_diastolic, unit: 'mmHg', cat: bpDiastolicCat },
      { no: 4, name: 'Kadar Kolesterol Total', value: data.cholesterol_level, unit: 'mg/dL', cat: cholCat },
      { no: 5, name: 'Lingkar Pinggang', value: data.waist_circumference, unit: 'cm', cat: waistCat },
      { no: 6, name: 'Durasi Tidur Harian', value: data.sleep_hours, unit: 'Jam / Hari', cat: sleepCat },
      { no: 7, name: 'Riwayat Hipertensi', value: data.hypertension === 1 ? 'Memiliki Riwayat' : 'Tidak Ada', unit: 'Biner (0/1)', cat: data.hypertension === 1 ? 'Faktor Risiko Aktif' : 'Normal' },
      { no: 8, name: 'Riwayat Diabetes', value: data.diabetes === 1 ? 'Menderita Diabetes' : 'Tidak Menderita', unit: 'Biner (0/1)', cat: data.diabetes === 1 ? 'Faktor Risiko Aktif' : 'Normal' },
      { no: 9, name: 'Status Obesitas', value: data.obesity === 1 ? 'Obesitas' : 'Tidak Obesitas', unit: 'Biner (0/1)', cat: data.obesity === 1 ? 'Faktor Risiko Aktif' : 'Normal' },
      { no: 10, name: 'Riwayat Jantung Sebelumnya', value: data.previous_heart_disease === 1 ? 'Pernah Mengalami' : 'Belum Pernah', unit: 'Biner (0/1)', cat: data.previous_heart_disease === 1 ? 'Riwayat Medis Signifikan' : 'Normal' },
      { no: 11, name: 'Riwayat Jantung Keluarga', value: data.family_history === 1 ? 'Ada Riwayat Keluarga' : 'Tidak Ada', unit: 'Biner (0/1)', cat: data.family_history === 1 ? 'Faktor Risiko Genetik' : 'Normal' },
      { no: 12, name: 'Status Merokok', value: data.smoking_status === 'Current' ? 'Perokok Aktif (Current)' : data.smoking_status === 'Past' ? 'Mantan Perokok (Past)' : 'Tidak Pernah Merokok (Never)', unit: 'Kategorikal', cat: data.smoking_status === 'Current' ? 'Faktor Risiko Gaya Hidup' : 'Bukan Perokok Aktif' },
    ];

    tableRows.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="cell-center cell-bold">${row.no}</td>
        <td><strong>${row.name}</strong></td>
        <td><span class="val-strong">${row.value}</span></td>
        <td style="color: var(--secondary-text);">${row.unit}</td>
        <td><span class="badge-tag">${row.cat}</span></td>
      `;
      tableBody.appendChild(tr);
    });
  }
});
