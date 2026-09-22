/**
 * Math Concepts — Module 2: Multivariable Calculus, Error Gradients & Parameter Upgrade Lab
 * Error-Driven Loss Surface L(θ) + Gradient Tangents ∇L + Parameter Upgrades Δθ = -α∇L
 */

function initCalculusLab() {
  const canvas = document.getElementById('calculus-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const lrSlider = document.getElementById('calc-lr-slider');
  const optSelect = document.getElementById('calc-opt-select');
  const startPosSlider = document.getElementById('calc-start-slider');
  const stepBtn = document.getElementById('calc-step-btn');
  const runBtn = document.getElementById('calc-run-btn');
  const resetBtn = document.getElementById('calc-reset-btn');

  const stepCountSpan = document.getElementById('calc-step-val');
  const currThetaSpan = document.getElementById('calc-theta-val');
  const currLossSpan = document.getElementById('calc-loss-val');
  const currGradSpan = document.getElementById('calc-grad-val');

  // Multi-modal non-convex loss surface: L(θ) = 0.4*θ^2 - 1.2*cos(1.8*θ) + 1.5
  // Derivative (Gradient): ∇L(θ) = 0.8*θ + 2.16*sin(1.8*θ)
  function lossFunc(t) {
    return 0.4 * (t * t) - 1.2 * Math.cos(1.8 * t) + 1.5;
  }

  function gradFunc(t) {
    return 0.8 * t + 1.2 * 1.8 * Math.sin(1.8 * t);
  }

  let theta = 3.5;
  let velocity = 0;
  let m = 0;
  let v = 0;
  let tStep = 0;
  let history = [theta];
  let isRunning = false;
  let animationId = null;

  function resetState() {
    theta = parseFloat(startPosSlider ? startPosSlider.value : 3.5);
    velocity = 0;
    m = 0;
    v = 0;
    tStep = 0;
    history = [theta];
    isRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    if (runBtn) runBtn.textContent = 'Auto Upgrade';
    updateMetrics();
    draw();
  }

  function performStep() {
    const lr = parseFloat(lrSlider ? lrSlider.value : 0.08);
    const opt = optSelect ? optSelect.value : 'sgd';
    const grad = gradFunc(theta);
    tStep++;

    if (opt === 'sgd') {
      theta = theta - lr * grad;
    } else if (opt === 'momentum') {
      const beta = 0.85;
      velocity = beta * velocity + (1 - beta) * grad;
      theta = theta - lr * velocity;
    } else if (opt === 'adam') {
      const beta1 = 0.9;
      const beta2 = 0.999;
      const eps = 1e-8;
      m = beta1 * m + (1 - beta1) * grad;
      v = beta2 * v + (1 - beta2) * (grad * grad);
      const mHat = m / (1 - Math.pow(beta1, tStep));
      const vHat = v / (1 - Math.pow(beta2, tStep));
      theta = theta - (lr / (Math.sqrt(vHat) + eps)) * mHat;
    }

    // Clamp boundary
    if (theta > 4.5) theta = 4.5;
    if (theta < -4.5) theta = -4.5;

    history.push(theta);
    updateMetrics();
    draw();
  }

  function updateMetrics() {
    const loss = lossFunc(theta);
    const grad = gradFunc(theta);
    if (stepCountSpan) stepCountSpan.textContent = tStep;
    if (currThetaSpan) currThetaSpan.textContent = theta.toFixed(3);
    if (currLossSpan) currLossSpan.textContent = loss.toFixed(3);
    if (currGradSpan) currGradSpan.textContent = `${grad >= 0 ? '+' : ''}${grad.toFixed(3)}`;
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

    draw();
  }

  function draw() {
    const parent = canvas.parentElement;
    const w = Math.max(320, parent ? parent.clientWidth : 500);
    const h = 380;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const xMin = -4.5, xMax = 4.5;
    const yMin = 0, yMax = 8;
    const marginL = 50, marginR = 30, marginT = 40, marginB = 46;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    function toX(x) { return marginL + ((x - xMin) / (xMax - xMin)) * plotW; }
    function toY(y) { return marginT + plotH - ((y - yMin) / (yMax - yMin)) * plotH; }

    // Grid Lines
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let gx = -4; gx <= 4; gx += 1) {
      const sx = toX(gx);
      ctx.beginPath();
      ctx.moveTo(sx, marginT);
      ctx.lineTo(sx, marginT + plotH);
      ctx.stroke();
    }
    for (let gy = 0; gy <= 8; gy += 2) {
      const sy = toY(gy);
      ctx.beginPath();
      ctx.moveTo(marginL, sy);
      ctx.lineTo(marginL + plotW, sy);
      ctx.stroke();
    }

    // Loss Surface Area Shading under curve
    ctx.save();
    ctx.beginPath();
    let started = false;
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = lossFunc(x);
      const sx = toX(x);
      const sy = toY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
    ctx.lineTo(toX(xMax), toY(0));
    ctx.lineTo(toX(xMin), toY(0));
    ctx.closePath();
    const fillGrad = ctx.createLinearGradient(0, marginT, 0, marginT + plotH);
    fillGrad.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
    fillGrad.addColorStop(1, 'rgba(59, 130, 246, 0.02)');
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // Plot Loss Function Curve L(θ)
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
    ctx.shadowBlur = 8;
    started = false;
    for (let x = xMin; x <= xMax; x += 0.04) {
      const y = lossFunc(x);
      const sx = toX(x);
      const sy = toY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
    ctx.restore();

    // Draw Optimization Upgrade Trajectory History
    if (history.length > 1) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < history.length; i++) {
        const hx = toX(history[i]);
        const hy = toY(lossFunc(history[i]));
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.stroke();
      ctx.restore();

      // Small historic dots
      ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
      for (let i = 0; i < history.length - 1; i++) {
        ctx.beginPath();
        ctx.arc(toX(history[i]), toY(lossFunc(history[i])), 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Current Parameter Position θ
    const currX = toX(theta);
    const currY = toY(lossFunc(theta));
    const grad = gradFunc(theta);

    // Tangent Slope Arrow (Error Gradient ∇L)
    const arrowLen = 38;
    const angle = Math.atan(-grad * (plotH / plotW) * ((xMax - xMin) / (yMax - yMin)));
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.8;
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(currX - arrowLen * Math.cos(angle), currY + arrowLen * Math.sin(angle));
    ctx.lineTo(currX + arrowLen * Math.cos(angle), currY - arrowLen * Math.sin(angle));
    ctx.stroke();
    ctx.restore();

    // Next Upgrade Step Vector Arrow Δθ = -α * ∇L
    const lr = parseFloat(lrSlider ? lrSlider.value : 0.08);
    const deltaTheta = -lr * grad;
    const nextX = toX(theta + deltaTheta);
    const nextY = toY(lossFunc(theta + deltaTheta));

    ctx.save();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(currX, currY);
    ctx.lineTo(nextX, nextY);
    ctx.stroke();
    ctx.restore();

    // Current State Particle
    ctx.save();
    ctx.beginPath();
    ctx.arc(currX, currY, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Parameter State Callout Pill
    const tagText = `θ = ${theta.toFixed(2)}, L(θ) = ${lossFunc(theta).toFixed(2)}`;
    ctx.font = '700 10.5px Inter, sans-serif';
    const tagW = ctx.measureText(tagText).width + 16;
    const tagH = 22;
    const tagX = Math.min(marginL + plotW - tagW, Math.max(marginL + 4, currX - tagW / 2));
    const tagY = Math.max(marginT + 8, currY - 30);

    ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(tagX, tagY, tagW, tagH, 5);
    else ctx.rect(tagX, tagY, tagW, tagH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pal.isDark ? '#f472b6' : '#db2777';
    ctx.textAlign = 'center';
    ctx.fillText(tagText, tagX + tagW / 2, tagY + 15);

    // X Axis Ticks
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    for (let gx = -4; gx <= 4; gx += 1) {
      ctx.fillText(gx.toString(), toX(gx), marginT + plotH + 18);
    }

    // Y Axis Ticks
    ctx.textAlign = 'right';
    for (let gy = 0; gy <= 8; gy += 2) {
      ctx.fillText(gy.toString(), marginL - 8, toY(gy) + 4);
    }

    // Axis Titles
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Model Coefficient Parameter θ →', marginL + plotW / 2, h - 12);
    ctx.textAlign = 'left';
    ctx.fillText('Loss / Residual Magnitude L(θ) ↑', marginL, 22);
  }

  // Animation Loop for Auto Upgrade
  function loop() {
    if (!isRunning) return;
    performStep();
    if (tStep >= 60 || Math.abs(gradFunc(theta)) < 0.001) {
      isRunning = false;
      if (runBtn) runBtn.textContent = 'Auto Upgrade';
      return;
    }
    setTimeout(() => {
      animationId = requestAnimationFrame(loop);
    }, 80);
  }

  // Listeners
  if (stepBtn) stepBtn.addEventListener('click', performStep);
  if (resetBtn) resetBtn.addEventListener('click', resetState);
  if (runBtn) {
    runBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      if (isRunning) {
        runBtn.textContent = 'Pause';
        loop();
      } else {
        runBtn.textContent = 'Auto Upgrade';
        if (animationId) cancelAnimationFrame(animationId);
      }
    });
  }

  if (startPosSlider) {
    startPosSlider.addEventListener('input', (e) => {
      const spVal = document.getElementById('calc-start-val');
      if (spVal) spVal.textContent = parseFloat(e.target.value).toFixed(1);
      resetState();
    });
  }

  if (lrSlider) {
    lrSlider.addEventListener('input', (e) => {
      const lrVal = document.getElementById('calc-lr-val');
      if (lrVal) lrVal.textContent = parseFloat(e.target.value).toFixed(2);
    });
  }

  if (optSelect) {
    optSelect.addEventListener('change', () => {
      // keep current theta or reset
      updateMetrics();
      draw();
    });
  }

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

  setTimeout(resetState, 60);
}

document.addEventListener('DOMContentLoaded', initCalculusLab);
