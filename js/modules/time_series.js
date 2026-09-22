/**
 * Math Concepts — Module 1 (Integrated Subsection): Time Series Analysis and Forecasting Lab
 * Multi-component synthesis (Trend, Seasonality, Cyclical, Noise) + ARIMA Forecast Horizon + Error Residuals (e_t)
 */

function initTimeSeriesLab() {
  const canvas = document.getElementById('ts-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const trendSlider = document.getElementById('ts-trend-slider');
  const seasonSlider = document.getElementById('ts-season-slider');
  const noiseSlider = document.getElementById('ts-noise-slider');
  const modeSelect = document.getElementById('ts-mode-select');

  const slopeSpan = document.getElementById('ts-slope-val');
  const rmseSpan = document.getElementById('ts-rmse-val');
  const maeSpan = document.getElementById('ts-mae-val');
  const forecastSpan = document.getElementById('ts-forecast-val');

  function update() {
    const trendSlope = parseFloat(trendSlider ? trendSlider.value : 0.4) || 0.4;
    const seasonAmp = parseFloat(seasonSlider ? seasonSlider.value : 1.5) || 1.5;
    const noiseLevel = parseFloat(noiseSlider ? noiseSlider.value : 0.5) || 0.5;
    const mode = modeSelect ? modeSelect.value : 'all';

    // Slider Text values
    const trendValSpan = document.getElementById('ts-trend-val');
    const seasonValSpan = document.getElementById('ts-season-val');
    const noiseValSpan = document.getElementById('ts-noise-input-val');

    if (trendValSpan) trendValSpan.textContent = trendSlope.toFixed(2);
    if (seasonValSpan) seasonValSpan.textContent = seasonAmp.toFixed(1);
    if (noiseValSpan) noiseValSpan.textContent = noiseLevel.toFixed(1);

    if (slopeSpan) slopeSpan.textContent = `${trendSlope >= 0 ? '+' : ''}${trendSlope.toFixed(2)} / step`;
    if (forecastSpan) forecastSpan.textContent = `+12 steps`;

    draw(trendSlope, seasonAmp, noiseLevel, mode);
  }

  function resizeAndDraw() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(320, rect.width || parent.clientWidth || 500);
    const h = 380;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    update();
  }

  function draw(slope, amp, noise, mode) {
    const parent = canvas.parentElement;
    const w = Math.max(320, parent ? parent.clientWidth : 500);
    const h = 380;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const nPoints = 48; // 48 historical time steps
    const nForecast = 12; // 12 forecast horizon steps
    const totalT = nPoints + nForecast;

    let observed = [];
    let trend = [];
    let seasonal = [];
    let fittedModel = [];
    let forecast = [];
    let futureActual = [];
    let residuals = [];

    // Deterministic pseudo-random sequence for consistent exploration
    let seed = 42;
    function pseudoRand() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280.0;
    }

    let sumSqErr = 0;
    let sumAbsErr = 0;

    // Generate historical observed data
    for (let t = 0; t < nPoints; t++) {
      const tr = 5.0 + slope * t;
      const se = amp * Math.sin((2 * Math.PI * t) / 12);
      const cy = 0.8 * Math.cos((2 * Math.PI * t) / 24);
      const fit = tr + se + cy;
      const no = (pseudoRand() - 0.5) * 2 * noise;
      const ob = fit + no;

      const err = ob - fit;
      sumSqErr += err * err;
      sumAbsErr += Math.abs(err);

      trend.push(tr);
      seasonal.push(se);
      fittedModel.push(fit);
      observed.push(ob);
      residuals.push(err);
    }

    // Generate future forecasts & ground truth realizations
    for (let i = 0; i < nForecast; i++) {
      const t = nPoints + i;
      const tr = 5.0 + slope * t;
      const se = amp * Math.sin((2 * Math.PI * t) / 12);
      const cy = 0.8 * Math.cos((2 * Math.PI * t) / 24);
      const fc = tr + se + cy;
      const futNoise = (pseudoRand() - 0.5) * 2 * noise * Math.sqrt(1 + 0.15 * i);
      const act = fc + futNoise;

      forecast.push(fc);
      futureActual.push(act);
    }

    const rmse = Math.sqrt(sumSqErr / nPoints);
    const mae = sumAbsErr / nPoints;

    if (rmseSpan) rmseSpan.textContent = rmse.toFixed(3);
    if (maeSpan) maeSpan.textContent = mae.toFixed(3);

    const marginL = 54, marginR = 28, marginT = 40, marginB = 46;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    let allY = [...observed, ...forecast, ...futureActual];
    const yMin = Math.max(0, Math.floor(Math.min(...allY) - 2));
    const yMax = Math.ceil(Math.max(...allY) + 3);

    function toX(t) { return marginL + (t / totalT) * plotW; }
    function toY(val) { return marginT + plotH - ((val - yMin) / (yMax - yMin)) * plotH; }

    // Background Grid
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    for (let t = 0; t <= totalT; t += 12) {
      const sx = toX(t);
      ctx.beginPath();
      ctx.moveTo(sx, marginT);
      ctx.lineTo(sx, marginT + plotH);
      ctx.stroke();
    }
    const yStep = Math.max(2, Math.round((yMax - yMin) / 5));
    for (let y = yMin; y <= yMax; y += yStep) {
      const sy = toY(y);
      ctx.beginPath();
      ctx.moveTo(marginL, sy);
      ctx.lineTo(marginL + plotW, sy);
      ctx.stroke();
    }

    // Historical vs Forecast Split Divider
    const splitX = toX(nPoints);
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(splitX, marginT);
    ctx.lineTo(splitX, marginT + plotH);
    ctx.stroke();

    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = '#c084fc';
    ctx.textAlign = 'right';
    ctx.fillText('Forecast Horizon Origin (t = 48) ⇥', splitX - 8, marginT + 14);
    ctx.restore();

    // Mode: Trend Component Only
    if (mode === 'trend') {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let t = 0; t < nPoints; t++) {
        const sx = toX(t), sy = toY(trend[t]);
        if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();
    }
    // Mode: Seasonal Component Only
    else if (mode === 'season') {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t < nPoints; t++) {
        const sx = toX(t), sy = toY(5.0 + seasonal[t]);
        if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();
    }
    // Mode: All or Errors
    else {
      // 1. Forecast Confidence Cone Shading
      ctx.save();
      const coneGrad = ctx.createLinearGradient(splitX, 0, toX(totalT - 1), 0);
      coneGrad.addColorStop(0, 'rgba(16, 185, 129, 0.24)');
      coneGrad.addColorStop(1, 'rgba(16, 185, 129, 0.06)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(splitX, toY(observed[nPoints - 1]));
      for (let i = 0; i < nForecast; i++) {
        const t = nPoints + i;
        const stdUncertainty = noise * Math.sqrt(1 + 0.3 * i);
        ctx.lineTo(toX(t), toY(forecast[i] + 1.96 * stdUncertainty));
      }
      for (let i = nForecast - 1; i >= 0; i--) {
        const t = nPoints + i;
        const stdUncertainty = noise * Math.sqrt(1 + 0.3 * i);
        ctx.lineTo(toX(t), toY(forecast[i] - 1.96 * stdUncertainty));
      }
      ctx.closePath();
      ctx.fill();

      // Cone Boundary lines
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      for (let i = 0; i < nForecast; i++) {
        const t = nPoints + i;
        const stdUncertainty = noise * Math.sqrt(1 + 0.3 * i);
        const sx = toX(t), sy = toY(forecast[i] + 1.96 * stdUncertainty);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.beginPath();
      for (let i = 0; i < nForecast; i++) {
        const t = nPoints + i;
        const stdUncertainty = noise * Math.sqrt(1 + 0.3 * i);
        const sx = toX(t), sy = toY(forecast[i] - 1.96 * stdUncertainty);
        if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 2. Residual Error Spikes (e_t = Y_t - Fitted_t)
      ctx.save();
      ctx.strokeStyle = mode === 'errors' ? '#f43f5e' : 'rgba(244, 63, 94, 0.45)';
      ctx.lineWidth = mode === 'errors' ? 2 : 1.2;
      for (let t = 0; t < nPoints; t++) {
        const sx = toX(t);
        const obY = toY(observed[t]);
        const fitY = toY(fittedModel[t]);
        ctx.beginPath();
        ctx.moveTo(sx, fitY);
        ctx.lineTo(sx, obY);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Fitted Model Base Line (Gold dashed)
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let t = 0; t < nPoints; t++) {
        const sx = toX(t), sy = toY(fittedModel[t]);
        if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();

      // 4. Observed Series Line (Electric Cyan)
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.4;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.35)';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let t = 0; t < nPoints; t++) {
        const sx = toX(t), sy = toY(observed[t]);
        if (t === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.restore();

      // Observed Points
      ctx.fillStyle = '#38bdf8';
      for (let t = 0; t < nPoints; t += 2) {
        ctx.beginPath();
        ctx.arc(toX(t), toY(observed[t]), 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Point Forecast Curve (Emerald Green)
      ctx.save();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(52, 211, 153, 0.5)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(toX(nPoints - 1), toY(observed[nPoints - 1]));
      for (let i = 0; i < nForecast; i++) {
        ctx.lineTo(toX(nPoints + i), toY(forecast[i]));
      }
      ctx.stroke();
      ctx.restore();

      // 6. Ground Truth Future Realization (Faint dotted)
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(toX(nPoints - 1), toY(observed[nPoints - 1]));
      for (let i = 0; i < nForecast; i++) {
        ctx.lineTo(toX(nPoints + i), toY(futureActual[i]));
      }
      ctx.stroke();
      ctx.restore();

      // Ground truth future dots
      ctx.fillStyle = '#94a3b8';
      for (let i = 0; i < nForecast; i++) {
        ctx.beginPath();
        ctx.arc(toX(nPoints + i), toY(futureActual[i]), 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Error annotation callout on chart
      if (mode === 'errors') {
        const annT = 24;
        const annX = toX(annT);
        const annObY = toY(observed[annT]);
        const annFitY = toY(fittedModel[annT]);
        const annErr = (observed[annT] - fittedModel[annT]).toFixed(2);

        ctx.save();
        ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.2;
        const errTag = `Residual e_{24} = ${annErr > 0 ? '+' : ''}${annErr}`;
        ctx.font = '700 10.5px Inter, sans-serif';
        const tagW = ctx.measureText(errTag).width + 14;
        const tagH = 20;
        const tagX = annX + 6;
        const tagY = (annObY + annFitY) / 2 - tagH / 2;

        if (ctx.roundRect) ctx.roundRect(tagX, tagY, tagW, tagH, 4);
        else ctx.rect(tagX, tagY, tagW, tagH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.isDark ? '#fb7185' : '#e11d48';
        ctx.textAlign = 'left';
        ctx.fillText(errTag, tagX + 7, tagY + 14);
        ctx.restore();
      }
    }

    // X Axis Ticks
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    for (let t = 0; t <= totalT; t += 12) {
      ctx.fillText(`t=${t}`, toX(t), marginT + plotH + 18);
    }

    // Y Axis Ticks
    ctx.textAlign = 'right';
    for (let y = yMin; y <= yMax; y += yStep) {
      ctx.fillText(y.toFixed(0), marginL - 8, toY(y) + 4);
    }

    // Axis Titles
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Time Sequence Index t (Months / Intervals) →', marginL + plotW / 2, h - 12);
    ctx.textAlign = 'left';
    ctx.fillText('Observation & Forecast Magnitude Y_t ↑', marginL, 22);
  }

  // Listeners
  [trendSlider, seasonSlider, noiseSlider, modeSelect].forEach(el => {
    if (el) el.addEventListener('input', update);
    if (el && el.tagName === 'SELECT') el.addEventListener('change', update);
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resizeAndDraw();
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', resizeAndDraw);
  }

  window.addEventListener('themeChanged', () => {
    resizeAndDraw();
  });

  setTimeout(resizeAndDraw, 60);
}

document.addEventListener('DOMContentLoaded', initTimeSeriesLab);
