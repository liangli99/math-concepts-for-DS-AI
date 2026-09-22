/**
 * MathCore DS & AI — Module 1: Linear Algebra Lab
 * 2D Vector & Matrix Transformations, Eigenvalues, and SVD Intuition
 */

function initLinearAlgebraLab() {
  const canvas = document.getElementById('linalg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Matrix Transformation sliders
  const m11Input = document.getElementById('m11-slider');
  const m12Input = document.getElementById('m12-slider');
  const m21Input = document.getElementById('m21-slider');
  const m22Input = document.getElementById('m22-slider');

  const detVal = document.getElementById('matrix-det-val');
  const traceVal = document.getElementById('matrix-trace-val');
  const eigenVal = document.getElementById('matrix-eigen-val');

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 320;
    draw();
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const originX = w / 2;
    const originY = h / 2;
    const scale = 38; // pixels per unit

    const m11 = parseFloat(m11Input ? m11Input.value : 1);
    const m12 = parseFloat(m12Input ? m12Input.value : 0);
    const m21 = parseFloat(m21Input ? m21Input.value : 0);
    const m22 = parseFloat(m22Input ? m22Input.value : 1);

    // Update displays
    const det = (m11 * m22 - m12 * m21);
    const tr = m11 + m22;
    const disc = tr * tr - 4 * det;

    if (detVal) detVal.textContent = det.toFixed(2);
    if (traceVal) traceVal.textContent = tr.toFixed(2);
    if (eigenVal) {
      if (disc >= 0) {
        const l1 = (tr + Math.sqrt(disc)) / 2;
        const l2 = (tr - Math.sqrt(disc)) / 2;
        eigenVal.textContent = `λ₁=${l1.toFixed(2)}, λ₂=${l2.toFixed(2)}`;
      } else {
        eigenVal.textContent = `Complex (Rotational)`;
      }
    }

    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', grid: 'rgba(0,0,0,0.06)' };

    // Clear background
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    // Draw Grid Lines (Original / Transformed)
    ctx.lineWidth = 1;

    // Transformed Grid
    for (let x = -6; x <= 6; x++) {
      ctx.beginPath();
      ctx.strokeStyle = (x === 0) ? pal.axis : (pal.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.25)');
      
      const p1X = originX + (m11 * x + m12 * -6) * scale;
      const p1Y = originY - (m21 * x + m22 * -6) * scale;
      const p2X = originX + (m11 * x + m12 * 6) * scale;
      const p2Y = originY - (m21 * x + m22 * 6) * scale;

      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.stroke();
    }

    for (let y = -6; y <= 6; y++) {
      ctx.beginPath();
      ctx.strokeStyle = (y === 0) ? pal.axis : (pal.isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.25)');
      
      const p1X = originX + (m11 * -6 + m12 * y) * scale;
      const p1Y = originY - (m21 * -6 + m22 * y) * scale;
      const p2X = originX + (m11 * 6 + m12 * y) * scale;
      const p2Y = originY - (m21 * 6 + m22 * y) * scale;

      ctx.moveTo(p1X, p1Y);
      ctx.lineTo(p2X, p2Y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, originY); ctx.lineTo(w, originY);
    ctx.moveTo(originX, 0); ctx.lineTo(originX, h);
    ctx.stroke();

    // Basis Vector i-hat (Transformed: [m11, m21])
    drawVector(originX, originY, m11 * scale, -m21 * scale, '#06b6d4', 'i-hat [W·e₁]');

    // Basis Vector j-hat (Transformed: [m12, m22])
    drawVector(originX, originY, m12 * scale, -m22 * scale, '#ec4899', 'j-hat [W·e₂]');

    // Area / Determinant Parallelogram
    ctx.fillStyle = det >= 0 ? 'rgba(6, 182, 212, 0.18)' : 'rgba(244, 63, 94, 0.18)';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX + m11 * scale, originY - m21 * scale);
    ctx.lineTo(originX + (m11 + m12) * scale, originY - (m21 + m22) * scale);
    ctx.lineTo(originX + m12 * scale, originY - m22 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = det >= 0 ? 'rgba(6, 182, 212, 0.5)' : 'rgba(244, 63, 94, 0.5)';
    ctx.stroke();
  }

  function drawVector(fromX, fromY, dx, dy, color, label) {
    const toX = fromX + dx;
    const toY = fromY + dy;
    const headlen = 10;
    const angle = Math.atan2(dy, dx);

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Text Label
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(label, toX + 8, toY - 4);
  }

  // Event Listeners
  [m11Input, m12Input, m21Input, m22Input].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', (e) => {
        const valSpan = document.getElementById(`${e.target.id}-val`);
        if (valSpan) valSpan.textContent = parseFloat(e.target.value).toFixed(1);
        draw();
      });
    }
  });

  // Preset Buttons
  const presetBtns = document.querySelectorAll('.linalg-preset');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-preset');
      if (type === 'identity') { setMatrix(1, 0, 0, 1); }
      else if (type === 'shear') { setMatrix(1, 1.2, 0, 1); }
      else if (type === 'rotate') { setMatrix(0, -1, 1, 0); }
      else if (type === 'scale') { setMatrix(1.5, 0, 0, 0.5); }
      else if (type === 'reflection') { setMatrix(-1, 0, 0, 1); }
      draw();
    });
  });

  function setMatrix(a, b, c, d) {
    if (m11Input) { m11Input.value = a; document.getElementById('m11-slider-val').textContent = a.toFixed(1); }
    if (m12Input) { m12Input.value = b; document.getElementById('m12-slider-val').textContent = b.toFixed(1); }
    if (m21Input) { m21Input.value = c; document.getElementById('m21-slider-val').textContent = c.toFixed(1); }
    if (m22Input) { m22Input.value = d; document.getElementById('m22-slider-val').textContent = d.toFixed(1); }
  }

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', draw);
  setTimeout(resizeCanvas, 50);
}

document.addEventListener('DOMContentLoaded', initLinearAlgebraLab);
