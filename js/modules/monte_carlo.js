/**
 * MathCore DS & AI — Module 8: Monte Carlo Simulation Studio
 */

function initMonteCarloLab() {
  const canvas = document.getElementById('mc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const trialsSlider = document.getElementById('mc-trials-slider');
  const meanSlider = document.getElementById('mc-mean-slider');
  const volSlider = document.getElementById('mc-vol-slider');
  const runBtn = document.getElementById('mc-run-btn');

  const meanValSpan = document.getElementById('mc-mean-val');
  const stdValSpan = document.getElementById('mc-std-val');
  const var95ValSpan = document.getElementById('mc-var95-val');
  const ciValSpan = document.getElementById('mc-ci-val');

  let simulationResults = [];

  // Box-Muller transform for generating standard normal random numbers
  function randomNormal(mu = 0, sigma = 1) {
    let u1 = Math.random();
    let u2 = Math.random();
    while (u1 === 0) u1 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mu + z0 * sigma;
  }

  function runSimulation() {
    const N = parseInt(trialsSlider ? trialsSlider.value : 5000);
    const expectedReturn = parseFloat(meanSlider ? meanSlider.value : 8.0); // % expected return
    const volatility = parseFloat(volSlider ? volSlider.value : 15.0); // % volatility

    simulationResults = [];
    const initialCapital = 10000; // $10,000 baseline investment

    for (let i = 0; i < N; i++) {
      // Annual portfolio outcome: Capital * exp((mu - 0.5*sigma^2) + sigma * Z)
      const r = randomNormal(expectedReturn / 100, volatility / 100);
      const finalVal = initialCapital * (1 + r);
      simulationResults.push(finalVal);
    }

    simulationResults.sort((a, b) => a - b);
    calculateMetrics(initialCapital);
    draw();
  }

  function calculateMetrics(initialCapital) {
    const N = simulationResults.length;
    if (N === 0) return;

    const sum = simulationResults.reduce((acc, v) => acc + v, 0);
    const mean = sum / N;

    const variance = simulationResults.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / N;
    const stdDev = Math.sqrt(variance);

    // 5th percentile (95% Value-at-Risk)
    const p5Index = Math.floor(0.05 * N);
    const valAtRisk95 = initialCapital - simulationResults[p5Index];

    // 90% Confidence Interval [5th percentile, 95th percentile]
    const p95Index = Math.floor(0.95 * N);
    const ciLow = simulationResults[p5Index];
    const ciHigh = simulationResults[p95Index];

    if (meanValSpan) meanValSpan.textContent = `$${mean.toFixed(0)}`;
    if (stdValSpan) stdValSpan.textContent = `±$${stdDev.toFixed(0)}`;
    if (var95ValSpan) var95ValSpan.textContent = `$${Math.max(0, valAtRisk95).toFixed(0)}`;
    if (ciValSpan) ciValSpan.textContent = `[$${ciLow.toFixed(0)}, $${ciHigh.toFixed(0)}]`;
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 320;
    draw();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    if (simulationResults.length === 0) return;

    const N = simulationResults.length;
    const bins = 35;
    const minVal = simulationResults[0];
    const maxVal = simulationResults[N - 1];
    const binWidth = (maxVal - minVal) / bins;

    let counts = Array(bins).fill(0);
    simulationResults.forEach(v => {
      let bIdx = Math.floor((v - minVal) / binWidth);
      if (bIdx >= bins) bIdx = bins - 1;
      counts[bIdx]++;
    });

    const maxCount = Math.max(...counts);

    const marginL = 50, marginR = 30, marginT = 20, marginB = 40;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    // Grid lines
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const gy = marginT + (plotH / 5) * i;
      ctx.beginPath();
      ctx.moveTo(marginL, gy);
      ctx.lineTo(w - marginR, gy);
      ctx.stroke();
    }

    // Draw Histogram Bars
    const barW = plotW / bins;
    for (let i = 0; i < bins; i++) {
      const barH = (counts[i] / maxCount) * plotH;
      const bx = marginL + i * barW;
      const by = marginT + (plotH - barH);

      const binVal = minVal + (i + 0.5) * binWidth;
      // Color coding: Red if loss (< 10000), Emerald if profit
      ctx.fillStyle = binVal < 10000 ? 'rgba(244, 63, 94, 0.65)' : 'rgba(16, 185, 129, 0.65)';
      ctx.fillRect(bx + 1, by, barW - 2, barH);
      ctx.strokeStyle = binVal < 10000 ? 'rgba(244, 63, 94, 0.9)' : 'rgba(16, 185, 129, 0.9)';
      ctx.strokeRect(bx + 1, by, barW - 2, barH);
    }

    // Baseline Line at Initial Capital ($10,000)
    const baseRatio = (10000 - minVal) / (maxVal - minVal);
    if (baseRatio >= 0 && baseRatio <= 1) {
      const baseX = marginL + baseRatio * plotW;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(baseX, marginT);
      ctx.lineTo(baseX, h - marginB);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('Initial $10K', baseX + 6, marginT + 15);
    }

    // Axis Labels
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.fillText(`$${(minVal).toFixed(0)}`, marginL, h - 15);
    ctx.fillText(`$${(maxVal).toFixed(0)}`, w - marginR - 60, h - 15);
  }

  // Listeners
  if (runBtn) runBtn.addEventListener('click', runSimulation);
  if (trialsSlider) {
    trialsSlider.addEventListener('input', (e) => {
      const tVal = document.getElementById('mc-trials-val');
      if (tVal) tVal.textContent = e.target.value;
      runSimulation();
    });
  }
  if (meanSlider) {
    meanSlider.addEventListener('input', (e) => {
      const mVal = document.getElementById('mc-mean-input-val');
      if (mVal) mVal.textContent = `${parseFloat(e.target.value).toFixed(1)}%`;
      runSimulation();
    });
  }
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const vVal = document.getElementById('mc-vol-val');
      if (vVal) vVal.textContent = `${parseFloat(e.target.value).toFixed(1)}%`;
      runSimulation();
    });
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', draw);
  setTimeout(runSimulation, 50);
}

document.addEventListener('DOMContentLoaded', initMonteCarloLab);
