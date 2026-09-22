/**
 * MathCore DS & AI — Module 5: Correlation & Information Theory Lab
 * Pearson vs. Mutual Information on Non-linear Structures
 */

function initInfoTheoryLab() {
  const canvas = document.getElementById('info-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const patternSelect = document.getElementById('info-pattern-select');
  const noiseSlider = document.getElementById('info-noise-slider');
  const nPointsSlider = document.getElementById('info-npoints-slider');

  const pearsonSpan = document.getElementById('info-pearson-val');
  const mutualInfoSpan = document.getElementById('info-mi-val');
  const entropySpan = document.getElementById('info-entropy-val');

  let points = [];

  function generatePattern() {
    const pattern = patternSelect ? patternSelect.value : 'quadratic';
    const noise = parseFloat(noiseSlider ? noiseSlider.value : 0.2);
    const n = parseInt(nPointsSlider ? nPointsSlider.value : 100);
    points = [];

    for (let i = 0; i < n; i++) {
      let x, y;
      const randN = (Math.random() - 0.5) * 2 * noise;

      if (pattern === 'linear') {
        x = -3 + (6 * i) / (n - 1);
        y = 0.8 * x + randN;
      } else if (pattern === 'quadratic') {
        x = -3 + (6 * i) / (n - 1);
        y = 0.5 * (x * x) - 2.0 + randN;
      } else if (pattern === 'circle') {
        const theta = (2 * Math.PI * i) / n;
        x = 2.5 * Math.cos(theta) + randN;
        y = 2.5 * Math.sin(theta) + randN;
      } else if (pattern === 'sinusoidal') {
        x = -3 + (6 * i) / (n - 1);
        y = 2.0 * Math.sin(2.0 * x) + randN;
      } else if (pattern === 'random') {
        x = (Math.random() - 0.5) * 6;
        y = (Math.random() - 0.5) * 6;
      }
      points.push({ x: x, y: y });
    }

    calculateMetrics();
    draw();
  }

  function calculateMetrics() {
    const n = points.length;
    if (n === 0) return;

    let sumX = 0, sumY = 0;
    points.forEach(p => { sumX += p.x; sumY += p.y; });
    const meanX = sumX / n;
    const meanY = sumY / n;

    let covXY = 0, varX = 0, varY = 0;
    points.forEach(p => {
      covXY += (p.x - meanX) * (p.y - meanY);
      varX += Math.pow(p.x - meanX, 2);
      varY += Math.pow(p.y - meanY, 2);
    });

    // Pearson Correlation
    const denom = Math.sqrt(varX * varY);
    const pearson = denom > 1e-9 ? covXY / denom : 0;

    // Approximate Mutual Information & Entropy via 2D Grid Binning (10x10)
    const bins = 10;
    let hist2D = Array.from({ length: bins }, () => Array(bins).fill(0));
    let histX = Array(bins).fill(0);
    let histY = Array(bins).fill(0);

    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 4;

    points.forEach(p => {
      let bx = Math.floor(((p.x - xMin) / (xMax - xMin)) * bins);
      let by = Math.floor(((p.y - yMin) / (yMax - yMin)) * bins);
      bx = Math.max(0, Math.min(bins - 1, bx));
      by = Math.max(0, Math.min(bins - 1, by));
      hist2D[bx][by]++;
      histX[bx]++;
      histY[by]++;
    });

    let entropyX = 0;
    let mi = 0;

    for (let i = 0; i < bins; i++) {
      const px = histX[i] / n;
      if (px > 0) entropyX -= px * Math.log2(px);
    }

    for (let i = 0; i < bins; i++) {
      for (let j = 0; j < bins; j++) {
        const pxy = hist2D[i][j] / n;
        const px = histX[i] / n;
        const py = histY[j] / n;
        if (pxy > 0 && px > 0 && py > 0) {
          mi += pxy * Math.log2(pxy / (px * py));
        }
      }
    }

    if (pearsonSpan) pearsonSpan.textContent = pearson.toFixed(3);
    if (mutualInfoSpan) mutualInfoSpan.textContent = `${Math.max(0, mi).toFixed(3)} bits`;
    if (entropySpan) entropySpan.textContent = `${entropyX.toFixed(3)} bits`;
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
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 4;

    function toScreenX(x) { return ((x - xMin) / (xMax - xMin)) * (w - 60) + 30; }
    function toScreenY(y) { return h - 30 - ((y - yMin) / (yMax - yMin)) * (h - 60); }

    // Grid lines & Axes
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let gx = -4; gx <= 4; gx += 2) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(gx), 0);
      ctx.lineTo(toScreenX(gx), h);
      ctx.stroke();
    }
    for (let gy = -4; gy <= 4; gy += 2) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(gy));
      ctx.lineTo(w, toScreenY(gy));
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0)); ctx.lineTo(w, toScreenY(0));
    ctx.moveTo(toScreenX(0), 0); ctx.lineTo(toScreenX(0), h);
    ctx.stroke();

    // Plot Points
    points.forEach(p => {
      const sx = toScreenX(p.x);
      const sy = toScreenY(p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // Listeners
  if (patternSelect) patternSelect.addEventListener('change', generatePattern);
  if (noiseSlider) {
    noiseSlider.addEventListener('input', (e) => {
      const nVal = document.getElementById('info-noise-val');
      if (nVal) nVal.textContent = parseFloat(e.target.value).toFixed(2);
      generatePattern();
    });
  }
  if (nPointsSlider) {
    nPointsSlider.addEventListener('input', (e) => {
      const npVal = document.getElementById('info-npoints-val');
      if (npVal) npVal.textContent = e.target.value;
      generatePattern();
    });
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', draw);
  setTimeout(generatePattern, 50);
}

document.addEventListener('DOMContentLoaded', initInfoTheoryLab);
