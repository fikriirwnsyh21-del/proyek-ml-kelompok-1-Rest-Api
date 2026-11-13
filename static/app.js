document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('predictionForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');
  const resetBtn = document.getElementById('resetBtn');

  const initialState = document.getElementById('initialState');
  const resultContent = document.getElementById('resultContent');
  const statusBadge = document.getElementById('statusBadge');
  const resultHeading = document.getElementById('resultHeading');
  const riskPercent = document.getElementById('riskPercent');
  const riskBar = document.getElementById('riskBar');
  const noRiskPercent = document.getElementById('noRiskPercent');
  const recommendationText = document.getElementById('recommendationText');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Siapkan data JSON payload sesuai kelas Pydantic
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

    // State loading
    submitBtn.disabled = true;
    btnText.textContent = 'Memproses...';
    spinner.style.display = 'inline-block';

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal melakukan prediksi dari server.');
      }

      const result = await response.json();
      renderResult(result);
    } catch (error) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Analisis Risiko Sekarang';
      spinner.style.display = 'none';
    }
  });

  resetBtn.addEventListener('click', () => {
    initialState.style.display = 'block';
    resultContent.style.display = 'none';
  });

  function renderResult(data) {
    initialState.style.display = 'none';
    resultContent.style.display = 'block';

    const riskProb = (data.probability_risk * 100).toFixed(1);
    const noRiskProb = (data.probability_no_risk * 100).toFixed(1);

    riskPercent.textContent = `${riskProb}%`;
    noRiskPercent.textContent = `${noRiskProb}%`;
    riskBar.style.width = `${riskProb}%`;

    resultHeading.textContent = data.label;
    recommendationText.textContent = data.recommendation;

    if (data.prediction === 1) {
      statusBadge.textContent = 'Indikasi Risiko Tinggi';
      statusBadge.className = 'status-badge badge-high-risk';
      riskBar.className = 'progress-bar-fill fill-danger';
    } else {
      statusBadge.textContent = 'Kondisi Aman / Risiko Rendah';
      statusBadge.className = 'status-badge badge-low-risk';
      riskBar.className = 'progress-bar-fill fill-safe';
    }
  }
});
