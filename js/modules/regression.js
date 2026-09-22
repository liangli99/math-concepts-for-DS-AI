/**
 * MathCore DS & AI — Module 3: Statistical Regression Lab
 * Polynomial Fitter, OLS Residuals, R-Squared & Loss Diagnostics
 */

function initRegressionLab() {
  const canvas = document.getElementById('regression-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const degreeSlider = document.getElementById('reg-degree-slider');
  const noiseSlider = document.getElementById('reg-noise-slider');
  const nPointsSlider = document.getElementById('reg-npoints-slider');
  const regenBtn = document.getElementById('reg-regen-btn');

  const r2Span = document.getElementById('reg-r2-val');
  const mseSpan = document.getElementById('reg-mse-val');
  const equationSpan = document.getElementById('reg-equation-val');

  let dataPoints = [];

  function generateData() {
    const n = parseInt(nPointsSlider ? nPointsSlider.value : 25);
    const noise = parseFloat(noiseSlider ? noiseSlider.value : 1.2);
    dataPoints = [];

    for (let i = 0; i < n; i++) {
      const x = -3.5 + (7.0 * i) / (n - 1);
      // Underlying true ground truth: y = 0.5*x^3 - 0.2*x^2 - 2*x + 1.5
      const trueY = 0.08 * Math.pow(x, 3) - 0.2 * Math.pow(x, 2) - 0.6 * x + 1.0;
      const randNoise = (Math.random() - 0.5) * 2 * noise;
      dataPoints.push({ x: x, y: trueY + randNoise });
    }
    updateModelAndDraw();
  }

  // Polynomial Regression via Normal Equation (X^T X)^{-1} X^T y
  function fitPolynomial(points, degree) {
    const m = points.length;
    const k = degree + 1;

    // Build matrix X (m x k) and vector Y (m x 1)
    let XtX = Array.from({ length: k }, () => Array(k).fill(0));
    let XtY = Array(k).fill(0);

    for (let i = 0; i < m; i++) {
      const px = points[i].x;
      const py = points[i].y;

      let xPowers = [];
      for (let p = 0; p < k; p++) {
        xPowers.push(Math.pow(px, p));
      }

      for (let r = 0; r < k; r++) {
        XtY[r] += xPowers[r] * py;
        for (let c = 0; c < k; c++) {
          XtX[r][c] += xPowers[r] * xPowers[c];
        }
      }
    }

    // Solve linear system XtX * beta = XtY using Gaussian elimination with partial pivoting
    const beta = solveLinearSystem(XtX, XtY);
    return beta;
  }

  function solveLinearSystem(A, B) {
    const n = B.length;
    let M = A.map((row, i) => [...row, B[i]]);

    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(M[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(M[k][i]) > maxEl) {
          maxEl = Math.abs(M[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < n + 1; k++) {
        let tmp = M[maxRow][k];
        M[maxRow][k] = M[i][k];
        M[i][k] = tmp;
      }

      if (Math.abs(M[i][i]) < 1e-12) {
        M[i][i] = 1e-12; // Regularize singular matrices
      }

      for (let k = i + 1; k < n; k++) {
        let c = -M[k][i] / M[i][i];
        for (let j = i; j < n + 1; j++) {
          if (i === j) M[k][j] = 0;
          else M[k][j] += c * M[i][j];
        }
      }
    }

    let x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = M[i][n] / M[i][i];
      for (let k = i - 1; k >= 0; k--) {
        M[k][n] -= M[k][i] * x[i];
      }
    }
    return x;
  }

  function evaluatePoly(beta, x) {
    let y = 0;
    for (let i = 0; i < beta.length; i++) {
      y += beta[i] * Math.pow(x, i);
    }
    return y;
  }

  function updateModelAndDraw() {
    if (dataPoints.length === 0) return;
    const degree = parseInt(degreeSlider ? degreeSlider.value : 1);
    const beta = fitPolynomial(dataPoints, degree);

    // Calculate MSE and R^2
    let sse = 0;
    let sst = 0;
    let yMean = dataPoints.reduce((acc, p) => acc + p.y, 0) / dataPoints.length;

    dataPoints.forEach(p => {
      const pred = evaluatePoly(beta, p.x);
      sse += Math.pow(p.y - pred, 2);
      sst += Math.pow(p.y - yMean, 2);
    });

    const mse = sse / dataPoints.length;
    const r2 = sst > 0 ? Math.max(0, 1 - (sse / sst)) : 1.0;

    if (r2Span) r2Span.textContent = r2.toFixed(3);
    if (mseSpan) mseSpan.textContent = mse.toFixed(3);

    // Format equation string
    if (equationSpan) {
      let eqParts = [];
      for (let i = beta.length - 1; i >= 0; i--) {
        const coef = beta[i];
        if (Math.abs(coef) < 0.001 && beta.length > 1) continue;
        const sign = (coef >= 0 && eqParts.length > 0) ? '+ ' : (coef < 0 ? '- ' : '');
        const absVal = Math.abs(coef).toFixed(2);
        if (i === 0) eqParts.push(`${sign}${absVal}`);
        else if (i === 1) eqParts.push(`${sign}${absVal}x`);
        else eqParts.push(`${sign}${absVal}x^${i}`);
      }
      equationSpan.textContent = `y = ${eqParts.join(' ') || '0'}`;
    }

    draw(beta);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 320;
    updateModelAndDraw();
  }

  function draw(beta) {
    const w = canvas.width;
    const h = canvas.height;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const xMin = -4, xMax = 4;
    const yMin = -4, yMax = 5;

    function toScreenX(x) { return ((x - xMin) / (xMax - xMin)) * (w - 60) + 30; }
    function toScreenY(y) { return h - 30 - ((y - yMin) / (yMax - yMin)) * (h - 60); }

    // Grid lines & Axes
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let gx = -4; gx <= 4; gx += 1) {
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

    // Residual Drop Lines
    if (beta) {
      dataPoints.forEach(p => {
        const pred = evaluatePoly(beta, p.x);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(p.x), toScreenY(p.y));
        ctx.lineTo(toScreenX(p.x), toScreenY(pred));
        ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    // Draw Fitted Regression Curve
    if (beta) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      let started = false;
      for (let x = xMin; x <= xMax; x += 0.05) {
        const y = evaluatePoly(beta, x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else { ctx.lineTo(sx, sy); }
      }
      ctx.stroke();
    }

    // Draw Data Points
    dataPoints.forEach(p => {
      const sx = toScreenX(p.x);
      const sy = toScreenY(p.y);
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // Event Listeners
  if (degreeSlider) {
    degreeSlider.addEventListener('input', (e) => {
      const degVal = document.getElementById('reg-degree-val');
      if (degVal) degVal.textContent = e.target.value;
      updateModelAndDraw();
    });
  }

  if (noiseSlider) {
    noiseSlider.addEventListener('input', (e) => {
      const noiseVal = document.getElementById('reg-noise-val');
      if (noiseVal) noiseVal.textContent = parseFloat(e.target.value).toFixed(1);
      generateData();
    });
  }

  if (nPointsSlider) {
    nPointsSlider.addEventListener('input', (e) => {
      const npVal = document.getElementById('reg-npoints-val');
      if (npVal) npVal.textContent = e.target.value;
      generateData();
    });
  }

  if (regenBtn) regenBtn.addEventListener('click', generateData);

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', () => {
    updateModelAndDraw();
  });
  setTimeout(generateData, 50);
}

document.addEventListener('DOMContentLoaded', initRegressionLab);
