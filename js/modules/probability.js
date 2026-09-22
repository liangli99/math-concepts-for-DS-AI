/**
 * MathCore DS & AI — Module 05: Probability Distributions & Interactive Visualizer
 * Redesigned with High-DPI support, smooth gradient fills, clean non-overlapping annotations, and interactive inspection.
 */

function initProbabilityLab() {
  const canvas = document.getElementById('prob-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const distSelect = document.getElementById('prob-dist-select');
  const param1Slider = document.getElementById('prob-p1-slider');
  const param2Slider = document.getElementById('prob-p2-slider');
  const p1Label = document.getElementById('prob-p1-label');
  const p2Label = document.getElementById('prob-p2-label');

  const meanSpan = document.getElementById('prob-mean-val');
  const varSpan = document.getElementById('prob-var-val');
  const intervalSpan = document.getElementById('prob-interval-val');

  let hoverX = null;
  let isHovered = false;

  function onDistChange() {
    const dist = distSelect ? distSelect.value : 'normal';
    if (dist === 'normal') {
      if (param1Slider) { param1Slider.min = '-3'; param1Slider.max = '3'; param1Slider.step = '0.1'; param1Slider.value = '0.0'; }
      if (param2Slider) { param2Slider.min = '0.4'; param2Slider.max = '2.5'; param2Slider.step = '0.1'; param2Slider.value = '1.2'; param2Slider.style.display = 'block'; }
      if (p2Label) p2Label.style.display = 'flex';
    } else if (dist === 'exponential') {
      if (param1Slider) { param1Slider.min = '0.2'; param1Slider.max = '3.0'; param1Slider.step = '0.1'; param1Slider.value = '1.0'; }
      if (param2Slider) param2Slider.style.display = 'none';
      if (p2Label) p2Label.style.display = 'none';
    } else if (dist === 'uniform') {
      if (param1Slider) { param1Slider.min = '-4'; param1Slider.max = '1'; param1Slider.step = '0.5'; param1Slider.value = '-2.0'; }
      if (param2Slider) { param2Slider.min = '0'; param2Slider.max = '5'; param2Slider.step = '0.5'; param2Slider.value = '2.0'; param2Slider.style.display = 'block'; }
      if (p2Label) p2Label.style.display = 'flex';
    }
    update();
  }

  function update() {
    const dist = distSelect ? distSelect.value : 'normal';
    const p1 = parseFloat(param1Slider ? param1Slider.value : 0);
    const p2 = parseFloat(param2Slider ? param2Slider.value : 1);

    let mean = 0, variance = 0, intervalText = '';

    if (dist === 'normal') {
      const mu = p1;
      const sigma = Math.max(0.3, p2);
      if (p1Label) p1Label.innerHTML = `Mean (μ): <span class="control-value">${mu.toFixed(1)}</span>`;
      if (p2Label) {
        p2Label.style.display = 'flex';
        p2Label.innerHTML = `Std Dev (σ): <span class="control-value">${sigma.toFixed(1)}</span>`;
      }
      if (param2Slider) param2Slider.style.display = 'block';

      mean = mu;
      variance = sigma * sigma;
      intervalText = `68.3% in [${(mean - sigma).toFixed(2)}, ${(mean + sigma).toFixed(2)}], 95.4% in [${(mean - 2*sigma).toFixed(2)}, ${(mean + 2*sigma).toFixed(2)}]`;
    } else if (dist === 'exponential') {
      const lambda = Math.max(0.1, p1);
      if (p1Label) p1Label.innerHTML = `Rate (λ): <span class="control-value">${lambda.toFixed(1)}</span>`;
      if (p2Label) p2Label.style.display = 'none';
      if (param2Slider) param2Slider.style.display = 'none';

      mean = 1 / lambda;
      variance = 1 / (lambda * lambda);
      intervalText = `E[X] = 1/λ = ${mean.toFixed(2)}, Var(X) = 1/λ² = ${variance.toFixed(2)}`;
    } else if (dist === 'uniform') {
      const a = p1;
      const b = Math.max(a + 0.5, p2);
      if (p1Label) p1Label.innerHTML = `Lower Bound (a): <span class="control-value">${a.toFixed(1)}</span>`;
      if (p2Label) {
        p2Label.style.display = 'flex';
        p2Label.innerHTML = `Upper Bound (b): <span class="control-value">${b.toFixed(1)}</span>`;
      }
      if (param2Slider) param2Slider.style.display = 'block';

      mean = (a + b) / 2;
      variance = Math.pow(b - a, 2) / 12;
      intervalText = `PDF Height = 1/(b-a) = ${(1 / (b - a)).toFixed(3)} on [${a.toFixed(1)}, ${b.toFixed(1)}]`;
    }

    if (meanSpan) meanSpan.textContent = mean.toFixed(2);
    if (varSpan) varSpan.textContent = variance.toFixed(2);
    if (intervalSpan) intervalSpan.textContent = intervalText;

    draw(dist, p1, p2);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = rect.width || 600;
    const displayHeight = 340;

    canvas.width = Math.floor(displayWidth * dpr);
    canvas.height = Math.floor(displayHeight * dpr);
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';

    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    ctx.scale(dpr, dpr);
    update();
  }

  function drawRoundRect(c, x, y, width, height, radius) {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + width - radius, y);
    c.quadraticCurveTo(x + width, y, x + width, y + radius);
    c.lineTo(x + width, y + height - radius);
    c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    c.lineTo(x + radius, y + height);
    c.quadraticCurveTo(x, y + height, x, y + height - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }

  function draw(dist, p1, p2) {
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 600;
    const h = rect.height || 340;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.2)', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)', textPrimary: '#0f172a' };

    // Background fill
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    // Subtle Radial Glow in Center if Dark Mode
    if (pal.isDark) {
      const bgGlow = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.6);
      bgGlow.addColorStop(0, 'rgba(15, 23, 42, 0.6)');
      bgGlow.addColorStop(1, 'rgba(8, 13, 26, 1)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);
    }

    const xMin = -6, xMax = 6;

    // PDF evaluation function
    function getPDF(x) {
      if (dist === 'normal') {
        const mu = p1;
        const sigma = Math.max(0.3, p2);
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
      } else if (dist === 'exponential') {
        const lambda = Math.max(0.1, p1);
        return x >= 0 ? lambda * Math.exp(-lambda * x) : 0;
      } else if (dist === 'uniform') {
        const a = p1;
        const b = Math.max(a + 0.5, p2);
        return (x >= a && x <= b) ? 1 / (b - a) : 0;
      }
      return 0;
    }

    // Dynamic Peak calculation
    let peak = 0.5;
    if (dist === 'normal') {
      const sigma = Math.max(0.3, p2);
      peak = 1 / (sigma * Math.sqrt(2 * Math.PI));
    } else if (dist === 'exponential') {
      peak = Math.max(0.1, p1);
    } else if (dist === 'uniform') {
      const a = p1;
      const b = Math.max(a + 0.5, p2);
      peak = 1 / (b - a);
    }

    const marginL = 50, marginR = 30, marginT = 55, marginB = 40;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    const yMin = 0;
    const yMax = Math.max(0.4, peak * 1.25);

    function toScreenX(x) { return marginL + ((x - xMin) / (xMax - xMin)) * plotW; }
    function toScreenY(y) { return marginT + plotH - ((y - yMin) / (yMax - yMin)) * plotH; }
    function toMathX(sx) { return xMin + ((sx - marginL) / plotW) * (xMax - xMin); }

    // 1. Grid Lines (Vertical & Horizontal)
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let gx = -6; gx <= 6; gx += 2) {
      const sx = toScreenX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, marginT);
      ctx.lineTo(sx, h - marginB);
      ctx.stroke();
    }

    // Horizontal reference lines (Y levels)
    const yStep = yMax > 0.8 ? 0.4 : 0.2;
    for (let gy = yStep; gy < yMax; gy += yStep) {
      const sy = toScreenY(gy);
      ctx.beginPath();
      ctx.setLineDash([2, 4]);
      ctx.moveTo(marginL, sy);
      ctx.lineTo(w - marginR, sy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Y-axis label
      ctx.font = '500 10px "Fira Code", monospace';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'right';
      ctx.fillText(gy.toFixed(1), marginL - 8, sy + 3);
    }

    // Baseline (X Axis)
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(marginL, h - marginB);
    ctx.lineTo(w - marginR, h - marginB);
    ctx.stroke();

    // X Axis Ticks & Labels
    ctx.font = '500 11px "Fira Code", monospace';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    for (let gx = -6; gx <= 6; gx += 2) {
      const sx = toScreenX(gx);
      // Small tick
      ctx.beginPath();
      ctx.strokeStyle = pal.axis;
      ctx.moveTo(sx, h - marginB);
      ctx.lineTo(sx, h - marginB + 5);
      ctx.stroke();

      ctx.fillText(gx > 0 ? `+${gx}` : `${gx}`, sx, h - marginB + 18);
    }

    // 2. Modern Clean Legend Header Bar (No overlapping badges!)
    if (dist === 'normal') {
      const mu = p1;
      const sigma = Math.max(0.3, p2);
      const left2Sig = Math.max(xMin, mu - 2 * sigma);
      const right2Sig = Math.min(xMax, mu + 2 * sigma);
      const left1Sig = Math.max(xMin, mu - sigma);
      const right1Sig = Math.min(xMax, mu + sigma);

      // Clean Sleek Top Legend
      const legendY = 22;
      ctx.font = '600 11px Inter, sans-serif';
      
      // Item 1: 68.3% Central (Cyan)
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(marginL, legendY - 8, 10, 10);
      ctx.fillStyle = pal.textPrimary;
      ctx.textAlign = 'left';
      ctx.fillText('±1σ Central (68.3%)', marginL + 16, legendY);

      // Item 2: 95.4% Normal (Emerald)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(marginL + 155, legendY - 8, 10, 10);
      ctx.fillStyle = pal.textPrimary;
      ctx.fillText('±2σ Range (95.4%)', marginL + 171, legendY);

      // Item 3: Outliers (Rose)
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(marginL + 305, legendY - 8, 10, 10);
      ctx.fillStyle = pal.textPrimary;
      ctx.fillText('Outlier Tails (4.6%)', marginL + 321, legendY);

      // --- Shading Under the Curve ---

      // 1. Shaded Outlier Tails (< -2σ and > +2σ) in Alert Rose Gradient
      const roseGrad = ctx.createLinearGradient(0, marginT, 0, h - marginB);
      roseGrad.addColorStop(0, 'rgba(244, 63, 94, 0.40)');
      roseGrad.addColorStop(1, 'rgba(244, 63, 94, 0.05)');
      ctx.fillStyle = roseGrad;

      // Left Tail
      if (left2Sig > xMin) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(xMin), toScreenY(0));
        for (let x = xMin; x <= left2Sig; x += 0.04) {
          ctx.lineTo(toScreenX(x), toScreenY(getPDF(x)));
        }
        ctx.lineTo(toScreenX(left2Sig), toScreenY(0));
        ctx.closePath();
        ctx.fill();
      }
      // Right Tail
      if (right2Sig < xMax) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(right2Sig), toScreenY(0));
        for (let x = right2Sig; x <= xMax; x += 0.04) {
          ctx.lineTo(toScreenX(x), toScreenY(getPDF(x)));
        }
        ctx.lineTo(toScreenX(xMax), toScreenY(0));
        ctx.closePath();
        ctx.fill();
      }

      // 2. Shaded 95.4% Region (Emerald / Teal Gradient)
      const emeraldGrad = ctx.createLinearGradient(0, marginT, 0, h - marginB);
      emeraldGrad.addColorStop(0, 'rgba(16, 185, 129, 0.28)');
      emeraldGrad.addColorStop(1, 'rgba(16, 185, 129, 0.04)');
      ctx.fillStyle = emeraldGrad;

      ctx.beginPath();
      ctx.moveTo(toScreenX(left2Sig), toScreenY(0));
      for (let x = left2Sig; x <= right2Sig; x += 0.04) {
        ctx.lineTo(toScreenX(x), toScreenY(getPDF(x)));
      }
      ctx.lineTo(toScreenX(right2Sig), toScreenY(0));
      ctx.closePath();
      ctx.fill();

      // 3. Shaded Inner 68.3% Region (Cyan Gradient)
      const cyanGrad = ctx.createLinearGradient(0, marginT, 0, h - marginB);
      cyanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      cyanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.08)');
      ctx.fillStyle = cyanGrad;

      ctx.beginPath();
      ctx.moveTo(toScreenX(left1Sig), toScreenY(0));
      for (let x = left1Sig; x <= right1Sig; x += 0.04) {
        ctx.lineTo(toScreenX(x), toScreenY(getPDF(x)));
      }
      ctx.lineTo(toScreenX(right1Sig), toScreenY(0));
      ctx.closePath();
      ctx.fill();

      // Vertical Boundary Guidelines
      // ±2σ Lines (Rose)
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      if (left2Sig > xMin) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(left2Sig), toScreenY(0));
        ctx.lineTo(toScreenX(left2Sig), toScreenY(getPDF(left2Sig)));
        ctx.stroke();
      }
      if (right2Sig < xMax) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(right2Sig), toScreenY(0));
        ctx.lineTo(toScreenX(right2Sig), toScreenY(getPDF(right2Sig)));
        ctx.stroke();
      }

      // ±1σ Lines (Cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      if (left1Sig > xMin) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(left1Sig), toScreenY(0));
        ctx.lineTo(toScreenX(left1Sig), toScreenY(getPDF(left1Sig)));
        ctx.stroke();
      }
      if (right1Sig < xMax) {
        ctx.beginPath();
        ctx.moveTo(toScreenX(right1Sig), toScreenY(0));
        ctx.lineTo(toScreenX(right1Sig), toScreenY(getPDF(right1Sig)));
        ctx.stroke();
      }

      // Center Mean (μ) Line (Gold / Amber)
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(toScreenX(mu), toScreenY(0));
      ctx.lineTo(toScreenX(mu), toScreenY(peak));
      ctx.stroke();
      ctx.setLineDash([]);

      // Mean marker dot & clean text at peak
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(toScreenX(mu), toScreenY(peak), 4, 0, Math.PI * 2);
      ctx.fill();

      // Peak annotation tag
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1;
      const tagW = 74, tagH = 20;
      drawRoundRect(ctx, toScreenX(mu) - tagW / 2, toScreenY(peak) - 26, tagW, tagH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = '600 10.5px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`μ = ${mu.toFixed(1)}`, toScreenX(mu), toScreenY(peak) - 12);

    } else if (dist === 'exponential') {
      const lambda = Math.max(0.1, p1);

      // Legend
      const legendY = 22;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(marginL, legendY - 8, 10, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(`Exponential Distribution  f(x) = ${lambda.toFixed(1)}e^{-${lambda.toFixed(1)}x}`, marginL + 16, legendY);

      // Gradient Fill
      const expGrad = ctx.createLinearGradient(0, marginT, 0, h - marginB);
      expGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
      expGrad.addColorStop(1, 'rgba(6, 182, 212, 0.03)');
      ctx.fillStyle = expGrad;

      ctx.beginPath();
      ctx.moveTo(toScreenX(0), toScreenY(0));
      for (let x = 0; x <= xMax; x += 0.04) {
        ctx.lineTo(toScreenX(x), toScreenY(getPDF(x)));
      }
      ctx.lineTo(toScreenX(xMax), toScreenY(0));
      ctx.closePath();
      ctx.fill();

      // Mean Line (E[X] = 1/lambda)
      const meanX = 1 / lambda;
      if (meanX <= xMax) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(toScreenX(meanX), toScreenY(0));
        ctx.lineTo(toScreenX(meanX), toScreenY(getPDF(meanX)));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '600 10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`E[X]=${meanX.toFixed(2)}`, toScreenX(meanX), toScreenY(getPDF(meanX)) - 10);
      }

    } else if (dist === 'uniform') {
      const a = p1;
      const b = Math.max(a + 0.5, p2);
      const height = 1 / (b - a);

      // Legend
      const legendY = 22;
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(marginL, legendY - 8, 10, 10);
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'left';
      ctx.fillText(`Uniform Density  f(x) = ${(height).toFixed(3)} on [${a.toFixed(1)}, ${b.toFixed(1)}]`, marginL + 16, legendY);

      // Gradient Fill Box
      const uniGrad = ctx.createLinearGradient(0, toScreenY(height), 0, h - marginB);
      uniGrad.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
      uniGrad.addColorStop(1, 'rgba(168, 85, 247, 0.05)');
      ctx.fillStyle = uniGrad;

      ctx.beginPath();
      ctx.moveTo(toScreenX(a), toScreenY(0));
      ctx.lineTo(toScreenX(a), toScreenY(height));
      ctx.lineTo(toScreenX(b), toScreenY(height));
      ctx.lineTo(toScreenX(b), toScreenY(0));
      ctx.closePath();
      ctx.fill();

      // Outline
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toScreenX(a), toScreenY(0));
      ctx.lineTo(toScreenX(a), toScreenY(height));
      ctx.lineTo(toScreenX(b), toScreenY(height));
      ctx.lineTo(toScreenX(b), toScreenY(0));
      ctx.stroke();

      // Mean line
      const uniMean = (a + b) / 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(toScreenX(uniMean), toScreenY(0));
      ctx.lineTo(toScreenX(uniMean), toScreenY(height));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#fbbf24';
      ctx.font = '600 10px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`μ=${uniMean.toFixed(1)}`, toScreenX(uniMean), toScreenY(height) - 8);
    }

    // 3. Glowing Smooth Main PDF Curve
    if (dist !== 'uniform') {
      // Outer glow pass
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      let started = false;
      for (let x = xMin; x <= xMax; x += 0.03) {
        const y = getPDF(x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else { ctx.lineTo(sx, sy); }
      }
      ctx.stroke();

      // Sharp Crisp Core Curve
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      started = false;
      for (let x = xMin; x <= xMax; x += 0.03) {
        const y = getPDF(x);
        const sx = toScreenX(x);
        const sy = toScreenY(y);
        if (!started) { ctx.moveTo(sx, sy); started = true; }
        else { ctx.lineTo(sx, sy); }
      }
      ctx.stroke();
    }

    // 4. Interactive Hover Inspector
    if (isHovered && hoverX !== null) {
      const hx = toMathX(hoverX);
      if (hx >= xMin && hx <= xMax) {
        const hy = getPDF(hx);
        const screenHX = toScreenX(hx);
        const screenHY = toScreenY(hy);

        // Vertical tracker guide line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(screenHX, marginT);
        ctx.lineTo(screenHX, h - marginB);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glowing cursor marker dot
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(screenHX, screenHY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Tooltip box
        const tooltipW = 140;
        const tooltipH = 38;
        let ttX = screenHX + 12;
        if (ttX + tooltipW > w - marginR) ttX = screenHX - tooltipW - 12;
        let ttY = screenHY - 20;
        if (ttY < marginT) ttY = marginT + 10;

        ctx.fillStyle = pal.isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = pal.isDark ? 'rgba(6, 182, 212, 0.6)' : 'rgba(2, 132, 199, 0.6)';
        ctx.lineWidth = 1.2;
        drawRoundRect(ctx, ttX, ttY, tooltipW, tooltipH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.textPrimary;
        ctx.font = '600 10.5px "Fira Code", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`x = ${hx.toFixed(2)}`, ttX + 10, ttY + 16);

        ctx.fillStyle = '#06b6d4';
        ctx.font = '500 10px "Fira Code", monospace';
        ctx.fillText(`f(x) = ${hy.toFixed(4)}`, ttX + 10, ttY + 30);
      }
    }
  }

  // Interactive Hover Event Handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    hoverX = e.clientX - rect.left;
    isHovered = true;
    const dist = distSelect ? distSelect.value : 'normal';
    const p1 = parseFloat(param1Slider ? param1Slider.value : 0);
    const p2 = parseFloat(param2Slider ? param2Slider.value : 1);
    draw(dist, p1, p2);
  });

  canvas.addEventListener('mouseleave', () => {
    isHovered = false;
    hoverX = null;
    const dist = distSelect ? distSelect.value : 'normal';
    const p1 = parseFloat(param1Slider ? param1Slider.value : 0);
    const p2 = parseFloat(param2Slider ? param2Slider.value : 1);
    draw(dist, p1, p2);
  });

  // Listeners
  if (distSelect) distSelect.addEventListener('change', onDistChange);
  [param1Slider, param2Slider].forEach(s => {
    if (s) s.addEventListener('input', update);
  });

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', update);
  setTimeout(resizeCanvas, 50);
}

document.addEventListener('DOMContentLoaded', initProbabilityLab);
