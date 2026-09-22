/**
 * MathCore DS & AI — Module 4: Neural Network & Non-Linear Activation Lab
 */

function initNeuralNetworkLab() {
  const canvas = document.getElementById('nn-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const actSelect = document.getElementById('nn-act-select');
  const weight1Slider = document.getElementById('nn-w1-slider');
  const weight2Slider = document.getElementById('nn-w2-slider');
  const biasSlider = document.getElementById('nn-bias-slider');

  const outValSpan = document.getElementById('nn-output-val');
  const gradValSpan = document.getElementById('nn-grad-val');
  const formulaValSpan = document.getElementById('nn-formula-val');

  // Activation functions & derivatives
  const activations = {
    relu: {
      fn: (z) => Math.max(0, z),
      dfn: (z) => (z > 0 ? 1 : 0),
      label: '\\sigma(z) = \\max(0, z)'
    },
    sigmoid: {
      fn: (z) => 1 / (1 + Math.exp(-z)),
      dfn: (z) => {
        const s = 1 / (1 + Math.exp(-z));
        return s * (1 - s);
      },
      label: '\\sigma(z) = \\frac{1}{1 + e^{-z}}'
    },
    tanh: {
      fn: (z) => Math.tanh(z),
      dfn: (z) => 1 - Math.pow(Math.tanh(z), 2),
      label: '\\sigma(z) = \\tanh(z)'
    },
    gelu: {
      fn: (z) => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * Math.pow(z, 3)))),
      dfn: (z) => {
        const c = Math.sqrt(2 / Math.PI);
        const inner = c * (z + 0.044715 * Math.pow(z, 3));
        const tanhInner = Math.tanh(inner);
        return 0.5 * (1 + tanhInner) + 0.5 * z * (1 - Math.pow(tanhInner, 2)) * c * (1 + 3 * 0.044715 * z * z);
      },
      label: '\\text{GELU}(z) \\approx 0.5z(1 + \\tanh(\\sqrt{2/\\pi}(z+0.0447z^3)))'
    },
    leaky_relu: {
      fn: (z) => (z > 0 ? z : 0.1 * z),
      dfn: (z) => (z > 0 ? 1 : 0.1),
      label: '\\sigma(z) = \\max(0.1z, z)'
    }
  };

  function update() {
    const actKey = actSelect ? actSelect.value : 'relu';
    const act = activations[actKey] || activations.relu;
    const w1 = parseFloat(weight1Slider ? weight1Slider.value : 1.5);
    const w2 = parseFloat(weight2Slider ? weight2Slider.value : -0.8);
    const b = parseFloat(biasSlider ? biasSlider.value : 0.2);

    // Fixed test input sample x = [0.8, -0.5]
    const x1 = 0.8, x2 = -0.5;
    const z = w1 * x1 + w2 * x2 + b;
    const a = act.fn(z);
    const da = act.dfn(z);

    if (outValSpan) outValSpan.textContent = a.toFixed(3);
    if (gradValSpan) gradValSpan.textContent = da.toFixed(3);
    if (formulaValSpan) formulaValSpan.textContent = `z=${z.toFixed(2)} → a=${a.toFixed(2)}`;

    draw(act, z);
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 320;
    update();
  }

  function draw(act, currentZ) {
    const w = canvas.width;
    const h = canvas.height;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const xMin = -4, xMax = 4;
    const yMin = -2, yMax = 3.5;

    function toScreenX(x) { return ((x - xMin) / (xMax - xMin)) * (w - 60) + 30; }
    function toScreenY(y) { return h - 30 - ((y - yMin) / (yMax - yMin)) * (h - 60); }

    // Grid Lines & Axes
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let gx = -4; gx <= 4; gx += 1) {
      ctx.beginPath();
      ctx.moveTo(toScreenX(gx), 0);
      ctx.lineTo(toScreenX(gx), h);
      ctx.stroke();
    }
    for (let gy = -2; gy <= 3; gy += 1) {
      ctx.beginPath();
      ctx.moveTo(0, toScreenY(gy));
      ctx.lineTo(w, toScreenY(gy));
      ctx.stroke();
    }

    // Axes lines
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin), toScreenY(0));
    ctx.lineTo(toScreenX(xMax), toScreenY(0));
    ctx.moveTo(toScreenX(0), toScreenY(yMin));
    ctx.lineTo(toScreenX(0), toScreenY(yMax));
    ctx.stroke();

    // Plot Activation Curve σ(z)
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = act.fn(x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();

    // Plot Derivative Curve σ'(z)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    started = false;
    for (let x = xMin; x <= xMax; x += 0.05) {
      const y = act.dfn(x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!started) { ctx.moveTo(sx, sy); started = true; }
      else { ctx.lineTo(sx, sy); }
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Highlight Current Operating Point z
    const curX = toScreenX(currentZ);
    const curY = toScreenY(act.fn(currentZ));

    // Vertical line to z
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(curX, toScreenY(0));
    ctx.lineTo(curX, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Operating point circle
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ec4899';
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Legend
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#8b5cf6';
    ctx.fillText('— Activation σ(z)', 40, 25);
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('-- Derivative σ\'(z) [Gradient]', 180, 25);
  }

  // Listeners
  if (actSelect) actSelect.addEventListener('change', update);
  [weight1Slider, weight2Slider, biasSlider].forEach(s => {
    if (s) {
      s.addEventListener('input', (e) => {
        const valSpan = document.getElementById(`${e.target.id}-val`);
        if (valSpan) valSpan.textContent = parseFloat(e.target.value).toFixed(1);
        update();
      });
    }
  });

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', update);
  setTimeout(update, 50);
}

document.addEventListener('DOMContentLoaded', initNeuralNetworkLab);
