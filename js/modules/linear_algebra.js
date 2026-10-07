/**
 * MathCore DS & AI — Module 1: Linear Algebra Lab
 * United Mathematical Hierarchy: Scalar Data -> Vector -> Matrix -> Tensor
 * Authored & Designed by Prof. Liang Li
 *
 * Layout principle: every sub-block uses the same simple template
 *   [ numbered header + math shape ]  ->  [ one clear visual ]  ->  [ one short caption ]
 * All text is auto-fitted to its block so nothing overlaps.
 */

function initLinearAlgebraLab() {
  const canvas = document.getElementById('linalg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Input & Control Elements
  const domainSelect = document.getElementById('linalg-domain-select');
  const dimSlider = document.getElementById('linalg-dim-slider');
  const sampleSlider = document.getElementById('linalg-sample-slider');
  const batchSlider = document.getElementById('linalg-batch-slider');
  const viewSelect = document.getElementById('linalg-view-mode');
  const sampleChipsContainer = document.getElementById('linalg-sample-chips');

  // Display Labels
  const dimValSpan = document.getElementById('linalg-dim-val');
  const sampleValSpan = document.getElementById('linalg-sample-val');
  const batchValSpan = document.getElementById('linalg-batch-val');

  // Metrics
  const metricScalar = document.getElementById('metric-scalar-val');
  const metricScalarSub = document.getElementById('metric-scalar-sub');
  const metricVector = document.getElementById('metric-vector-val');
  const metricVectorSub = document.getElementById('metric-vector-sub');
  const metricMatrix = document.getElementById('metric-matrix-val');
  const metricMatrixSub = document.getElementById('metric-matrix-sub');
  const metricTensor = document.getElementById('metric-tensor-val');
  const metricTensorSub = document.getElementById('metric-tensor-sub');

  // State
  let selectedSampleIdx = 0;
  let selectedFeatureIdx = 0;
  let selectedBatchIdx = 0;
  let clickableZones = [];

  // Domain Presets Metadata
  const DOMAINS = {
    health: {
      name: 'Clinical Vitals',
      rowPrefix: 'Patient',
      features: ['HeartRate', 'SystolicBP', 'Glucose', 'BMI', 'Age', 'Cholesterol', 'OxygenSat', 'Temp']
    },
    sensor: {
      name: 'IoT Sensor Grid',
      rowPrefix: 'Sensor',
      features: ['Temp', 'Pressure', 'Vibration', 'Voltage', 'Current', 'RPM', 'Acoustic', 'Humidity']
    },
    finance: {
      name: 'Market Assets',
      rowPrefix: 'Stock',
      features: ['Price', 'Volume', 'Volatility', 'Momentum', 'PE_Ratio', 'Beta', 'Yield', 'Spread']
    }
  };

  // ── Small text helpers ──────────────────────────────────────────────
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  const sup = (n) => String(n).split('').map(ch => SUP[ch] || ch).join('');
  const sub = (n) => String(n).split('').map(ch => SUB[ch] || ch).join('');
  const shape = (...dims) => 'ℝ' + dims.map(sup).join('ˣ');
  const fmt = (v, digits) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(digits);

  function getActiveDomain() {
    return DOMAINS[domainSelect ? domainSelect.value : 'health'] || DOMAINS.health;
  }

  function rankColors(pal) {
    return pal.isDark
      ? { data: '#38bdf8', vector: '#a78bfa', matrix: '#fbbf24', tensor: '#34d399' }
      : { data: '#0284c7', vector: '#7c3aed', matrix: '#d97706', tensor: '#059669' };
  }

  function hexA(hex, a) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  // Heat color for a value in [-2.5, 2.5]: blue = positive, rose = negative
  function heat(v, pal, strength = 1) {
    const a = (0.1 + Math.min(1, Math.abs(v) / 2.5) * 0.45) * strength;
    if (v >= 0) return pal.isDark ? `rgba(56, 189, 248, ${a})` : `rgba(2, 132, 199, ${a})`;
    return pal.isDark ? `rgba(251, 113, 133, ${a})` : `rgba(225, 29, 72, ${a})`;
  }

  // Set font and shrink it (then ellipsize) until text fits maxW
  function fitText(text, maxW, size, weight, family) {
    let s = size;
    ctx.font = `${weight} ${s}px ${family}`;
    while (s > 8 && ctx.measureText(text).width > maxW) {
      s -= 1;
      ctx.font = `${weight} ${s}px ${family}`;
    }
    if (ctx.measureText(text).width <= maxW) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return t + '…';
  }

  // Deterministic Float Generator in [-2.5, +2.5]
  function getDataValue(b, r, c) {
    const seed = (b + 1) * 7919 + (r + 1) * 1013 + (c + 1) * 313;
    const val = Math.sin(seed * 0.137) * 2.5;
    return parseFloat(val.toFixed(2));
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 420;
    draw();
  }

  function updateSampleChips(numSamples, rowPrefix) {
    if (!sampleChipsContainer) return;
    let html = '';
    for (let i = 0; i < numSamples; i++) {
      const isActive = i === selectedSampleIdx;
      html += `<button class="linalg-sample-chip ${isActive ? 'active' : ''}" data-idx="${i}" type="button">
        <span>${rowPrefix} #${i + 1}</span>
        <span style="opacity: 0.65; font-size: 0.7rem; margin-left: 2px;">x${sub(i + 1)}</span>
      </button>`;
    }
    sampleChipsContainer.innerHTML = html;

    sampleChipsContainer.querySelectorAll('.linalg-sample-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedSampleIdx = parseInt(btn.getAttribute('data-idx'), 10);
        updateSampleChips(numSamples, rowPrefix);
        draw();
      });
    });
  }

  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    clickableZones = [];

    const domain = getActiveDomain();
    const dim = parseInt(dimSlider ? dimSlider.value : 5, 10);
    const numSamples = parseInt(sampleSlider ? sampleSlider.value : 4, 10);
    const batch = parseInt(batchSlider ? batchSlider.value : 2, 10);
    const viewMode = viewSelect ? viewSelect.value : 'pipeline';

    // Clamp Indices
    if (selectedSampleIdx >= numSamples) selectedSampleIdx = numSamples - 1;
    if (selectedFeatureIdx >= dim) selectedFeatureIdx = dim - 1;
    if (selectedBatchIdx >= batch) selectedBatchIdx = batch - 1;

    if (dimValSpan) dimValSpan.textContent = dim;
    if (sampleValSpan) sampleValSpan.textContent = numSamples;
    if (batchValSpan) batchValSpan.textContent = batch;

    const curVal = getDataValue(selectedBatchIdx, selectedSampleIdx, selectedFeatureIdx);
    const featName = domain.features[selectedFeatureIdx] || `Feature ${selectedFeatureIdx + 1}`;

    // Metrics: short value + small count line
    if (metricScalar) metricScalar.textContent = `x = ${fmt(curVal, 2)}`;
    if (metricScalarSub) metricScalarSub.textContent = `${domain.rowPrefix} #${selectedSampleIdx + 1} · ${featName}`;
    if (metricVector) metricVector.textContent = `x${sub(selectedSampleIdx + 1)} ∈ ${shape(dim)}`;
    if (metricVectorSub) metricVectorSub.textContent = `${dim} values`;
    if (metricMatrix) metricMatrix.textContent = `X ∈ ${shape(numSamples, dim)}`;
    if (metricMatrixSub) metricMatrixSub.textContent = `${numSamples * dim} values`;
    if (metricTensor) metricTensor.textContent = `𝓧 ∈ ${shape(batch, numSamples, dim)}`;
    if (metricTensorSub) metricTensorSub.textContent = `${batch * numSamples * dim} values`;

    const pal = window.getCanvasPalette ? window.getCanvasPalette() : {
      isDark: false,
      bg: '#ffffff',
      textPrimary: '#0f172a',
      textMuted: '#64748b',
      border: 'rgba(0,0,0,0.12)'
    };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    if (viewMode === 'pipeline') {
      drawPipelineView(w, h, dim, numSamples, batch, pal, domain, curVal, featName);
    } else {
      drawTensor3DView(w, h, dim, numSamples, batch, pal);
    }
  }

  // ── Uniform panel template ──────────────────────────────────────────
  // Returns the inner body rectangle available for the visual.
  function drawPanel(x, y, w, h, pal, color, num, title, mathLabel, caption) {
    // Card
    ctx.fillStyle = pal.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff';
    ctx.strokeStyle = pal.border;
    ctx.lineWidth = 1;
    drawRoundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.stroke();

    // Top accent bar
    ctx.fillStyle = color;
    drawRoundRect(x, y, w, 3, 1.5);
    ctx.fill();

    // Number badge
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + 20, y + 21, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(num, x + 20, y + 24.5);

    // Title (left) + math shape (right)
    ctx.textAlign = 'left';
    ctx.fillStyle = pal.textPrimary;
    const titleText = fitText(title, w * 0.5, 12, '700', 'Inter, sans-serif');
    ctx.fillText(titleText, x + 36, y + 25);
    const titleW = ctx.measureText(titleText).width;

    ctx.textAlign = 'right';
    ctx.fillStyle = color;
    const mathText = fitText(mathLabel, w - titleW - 60, 13, '600', 'Fira Code, monospace');
    ctx.fillText(mathText, x + w - 12, y + 25);

    // Divider
    ctx.strokeStyle = pal.border;
    ctx.beginPath();
    ctx.moveTo(x + 10, y + 38);
    ctx.lineTo(x + w - 10, y + 38);
    ctx.stroke();

    // Caption (one line, centered)
    ctx.textAlign = 'center';
    ctx.fillStyle = pal.textMuted;
    const capText = fitText(caption, w - 20, 11, '500', 'Inter, sans-serif');
    ctx.fillText(capText, x + w / 2, y + h - 11);
    ctx.textAlign = 'left';

    return { x: x + 12, y: y + 44, w: w - 24, h: h - 44 - 26 };
  }

  // ── View 1: four simple blocks (2 × 2) ──────────────────────────────
  function drawPipelineView(w, h, dim, numSamples, batch, pal, domain, curVal, featName) {
    const col = rankColors(pal);
    const pad = 10;
    const gap = 10;
    const colW = (w - 2 * pad - gap) / 2;
    const rowH = (h - 2 * pad - gap) / 2;
    const x1 = pad, x2 = pad + colW + gap;
    const y1 = pad, y2 = pad + rowH + gap;

    // ① DATA (Scalar)
    const b1 = drawPanel(x1, y1, colW, rowH, pal, col.data, '1', 'Data (Scalar)', 'x ∈ ℝ',
      `One measurement: ${domain.rowPrefix} #${selectedSampleIdx + 1} · ${featName}`);
    drawScalarBlock(b1, curVal, pal, col);

    // ② VECTOR
    const b2 = drawPanel(x2, y1, colW, rowH, pal, col.vector, '2', 'Vector', `x${sub(selectedSampleIdx + 1)} ∈ ${shape(dim)}`,
      `${dim} numbers in a row = one ${domain.rowPrefix.toLowerCase()}`);
    drawVectorBlock(b2, dim, pal, col);

    // ③ MATRIX
    const b3 = drawPanel(x1, y2, colW, rowH, pal, col.matrix, '3', 'Matrix', `X ∈ ${shape(numSamples, dim)}`,
      `${numSamples} vectors stacked = a data table`);
    drawMatrixBlock(b3, numSamples, dim, pal, col);

    // ④ TENSOR
    const b4 = drawPanel(x2, y2, colW, rowH, pal, col.tensor, '4', 'Tensor', `𝓧 ∈ ${shape(batch, numSamples, dim)}`,
      `${batch} matrices stacked = a batch`);
    drawTensorStack(b4, batch, numSamples, dim, pal, col, { maxCellW: 20, maxCellH: 14, off: 14, showValues: false });
  }

  // ① One big number
  function drawScalarBlock(b, curVal, pal, col) {
    const boxW = Math.min(170, b.w);
    const boxH = Math.min(60, b.h - 22);
    const bx = b.x + (b.w - boxW) / 2;
    const by = b.y + (b.h - boxH - 18) / 2;

    ctx.fillStyle = hexA(col.data, pal.isDark ? 0.16 : 0.08);
    ctx.strokeStyle = col.data;
    ctx.lineWidth = 2;
    drawRoundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = pal.textPrimary;
    const valText = fitText(fmt(curVal, 2), boxW - 16, 26, '700', 'Fira Code, monospace');
    ctx.fillText(valText, bx + boxW / 2, by + boxH / 2 + 9);

    ctx.fillStyle = pal.textMuted;
    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillText('rank 0 · a single number', bx + boxW / 2, by + boxH + 16);
    ctx.textAlign = 'left';
  }

  // ② One row of d cells
  function drawVectorBlock(b, dim, pal, col) {
    const gapC = 4;
    const cellW = Math.min(50, (b.w - 12 - gapC * (dim - 1)) / dim);
    const cellH = Math.min(38, b.h - 30);
    const totalW = cellW * dim + gapC * (dim - 1);
    const sx = b.x + (b.w - totalW) / 2;
    const sy = b.y + (b.h - cellH) / 2 + 6;

    // Bracket around the whole vector
    ctx.strokeStyle = col.vector;
    ctx.lineWidth = 1.5;
    drawRoundRect(sx - 5, sy - 5, totalW + 10, cellH + 10, 7);
    ctx.stroke();

    ctx.textAlign = 'center';
    for (let j = 0; j < dim; j++) {
      const cx = sx + j * (cellW + gapC);
      const v = getDataValue(selectedBatchIdx, selectedSampleIdx, j);
      const isSel = j === selectedFeatureIdx;

      clickableZones.push({ x: cx, y: sy, w: cellW, h: cellH, r: selectedSampleIdx, c: j });

      // index label
      ctx.font = isSel ? '700 10px Fira Code, monospace' : '500 10px Fira Code, monospace';
      ctx.fillStyle = isSel ? col.data : pal.textMuted;
      ctx.fillText(`x${sub(j + 1)}`, cx + cellW / 2, sy - 10);

      // cell
      ctx.fillStyle = heat(v, pal);
      drawRoundRect(cx, sy, cellW, cellH, 4);
      ctx.fill();
      if (isSel) {
        ctx.strokeStyle = col.data;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // value
      ctx.fillStyle = pal.textPrimary;
      const vt = fitText(fmt(v, 1), cellW - 4, 11, isSel ? '700' : '500', 'Fira Code, monospace');
      ctx.fillText(vt, cx + cellW / 2, sy + cellH / 2 + 4);
    }
    ctx.textAlign = 'left';
  }

  // ③ n × d grid, selected row = vector, selected cell = scalar
  function drawMatrixBlock(b, n, dim, pal, col) {
    const labelW = 30;
    const cellW = Math.min(44, (b.w - labelW) / dim);
    const cellH = Math.min(24, b.h / n);
    const gridW = cellW * dim;
    const gridH = cellH * n;
    const gx = b.x + labelW + (b.w - labelW - gridW) / 2;
    const gy = b.y + (b.h - gridH) / 2;
    const showVals = cellW >= 30 && cellH >= 17;

    for (let r = 0; r < n; r++) {
      const ry = gy + r * cellH;
      const isSelRow = r === selectedSampleIdx;

      ctx.textAlign = 'right';
      ctx.font = isSelRow ? '700 10px Fira Code, monospace' : '500 10px Fira Code, monospace';
      ctx.fillStyle = isSelRow ? col.vector : pal.textMuted;
      ctx.fillText(`x${sub(r + 1)}ᵀ`, gx - 6, ry + cellH / 2 + 4);

      for (let c = 0; c < dim; c++) {
        const cx = gx + c * cellW;
        const v = getDataValue(selectedBatchIdx, r, c);
        clickableZones.push({ x: cx, y: ry, w: cellW, h: cellH, r: r, c: c });

        ctx.fillStyle = heat(v, pal);
        ctx.fillRect(cx + 1, ry + 1, cellW - 2, cellH - 2);

        if (showVals) {
          ctx.textAlign = 'center';
          ctx.fillStyle = pal.textPrimary;
          ctx.font = '500 10px Fira Code, monospace';
          ctx.fillText(fmt(v, 1), cx + cellW / 2, ry + cellH / 2 + 3.5);
        }
      }
    }
    ctx.textAlign = 'left';

    // Outer frame
    ctx.strokeStyle = col.matrix;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(gx - 0.5, gy - 0.5, gridW + 1, gridH + 1);

    // Selected row (the vector) and selected cell (the scalar)
    ctx.strokeStyle = col.vector;
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy + selectedSampleIdx * cellH, gridW, cellH);
    ctx.strokeStyle = col.data;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(gx + selectedFeatureIdx * cellW + 1, gy + selectedSampleIdx * cellH + 1, cellW - 2, cellH - 2);
  }

  // ④ b sheets stacked with depth offset. Each sheet = one matrix.
  // Sheet header strip is clickable to choose which matrix X_k is shown.
  function drawTensorStack(area, b, n, dim, pal, col, opts) {
    const off = opts.off;
    const header = 14;
    const cellW = Math.max(4, Math.min(opts.maxCellW, (area.w - (b - 1) * off) / dim));
    const cellH = Math.max(4, Math.min(opts.maxCellH, (area.h - (b - 1) * off - header) / n));
    const sw = cellW * dim;
    const sh = header + cellH * n;
    const totalW = sw + (b - 1) * off;
    const totalH = sh + (b - 1) * off;
    const x0 = area.x + (area.w - totalW) / 2;
    const fy = area.y + (area.h - totalH) / 2 + (b - 1) * off;

    for (let k = b - 1; k >= 0; k--) {
      const sx = x0 + k * off;
      const sy = fy - k * off;
      const isSel = k === selectedBatchIdx;

      // Opaque base so front sheets cover back sheets
      ctx.fillStyle = pal.bg;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = hexA(col.tensor, isSel ? 0.08 : 0.03);
      ctx.fillRect(sx, sy, sw, sh);

      // Header strip with label
      ctx.fillStyle = hexA(col.tensor, isSel ? 0.9 : 0.22);
      ctx.fillRect(sx, sy, sw, header);
      ctx.fillStyle = isSel ? '#ffffff' : pal.textPrimary;
      ctx.font = '700 9px Fira Code, monospace';
      ctx.fillText(`X${sub(k + 1)}`, sx + 5, sy + 10);
      clickableZones.push({ x: sx, y: sy, w: sw, h: header, batch: k });

      // Cells
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < dim; c++) {
          const cx = sx + c * cellW;
          const cy = sy + header + r * cellH;
          const v = getDataValue(k, r, c);
          ctx.fillStyle = heat(v, pal, k === 0 ? 1 : 0.6);
          ctx.fillRect(cx + 0.5, cy + 0.5, cellW - 1, cellH - 1);

          if (opts.showValues && k === 0 && cellW >= 30 && cellH >= 17) {
            ctx.textAlign = 'center';
            ctx.fillStyle = pal.textPrimary;
            ctx.font = '500 10px Fira Code, monospace';
            ctx.fillText(fmt(v, 1), cx + cellW / 2, cy + cellH / 2 + 3.5);
            ctx.textAlign = 'left';
          }
          if (k === 0) {
            clickableZones.push({ x: cx, y: cy, w: cellW, h: cellH, r: r, c: c, batch: 0 });
          }
        }
      }

      // Border
      ctx.strokeStyle = isSel ? col.tensor : hexA(col.tensor, 0.55);
      ctx.lineWidth = isSel ? 2 : 1;
      ctx.strokeRect(sx, sy, sw, sh);

      // On the selected *visible* (front) sheet, mark the vector row + scalar cell
      if (isSel && k === 0) {
        const ry = sy + header + selectedSampleIdx * cellH;
        ctx.strokeStyle = col.vector;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, ry, sw, cellH);
        ctx.strokeStyle = col.data;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + selectedFeatureIdx * cellW, ry, cellW, cellH);
      }
    }

    return { x0, fy, sw, sh, off, header };
  }

  // ── View 2: one large tensor block with three labeled axes ──────────
  function drawTensor3DView(w, h, dim, numSamples, batch, pal) {
    const col = rankColors(pal);
    const body = drawPanel(10, 10, w - 20, h - 20, pal, col.tensor, '4', 'Tensor = stack of matrices',
      `𝓧 ∈ ${shape(batch, numSamples, dim)}`,
      `torch.Size([${batch}, ${numSamples}, ${dim}])  ·  ${batch * numSamples * dim} values  ·  click a header to pick a matrix`);

    // Reserve margins so axis labels never overlap the block
    const area = { x: body.x + 36, y: body.y + 8, w: body.w - 150, h: body.h - 36 };
    const g = drawTensorStack(area, batch, numSamples, dim, pal, col,
      { maxCellW: 46, maxCellH: 28, off: 28, showValues: true });

    // Axis: features (below front sheet)
    ctx.textAlign = 'center';
    ctx.fillStyle = col.vector;
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(`d = ${dim} features →`, g.x0 + g.sw / 2, g.fy + g.sh + 18);

    // Axis: rows (left of front sheet, rotated)
    ctx.save();
    ctx.translate(g.x0 - 14, g.fy + g.header + (g.sh - g.header) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = col.matrix;
    ctx.fillText(`n = ${numSamples} rows`, 0, 0);
    ctx.restore();

    // Axis: batch depth (right of the back-most sheet)
    ctx.textAlign = 'left';
    ctx.fillStyle = col.tensor;
    const backX = g.x0 + (batch - 1) * g.off + g.sw + 10;
    const backY = g.fy - (batch - 1) * g.off + 11;
    ctx.fillText(`b = ${batch} matrices ↗`, backX, backY);
  }

  // Helper: Draw Rounded Rectangle
  function drawRoundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  }

  // ── Events ──────────────────────────────────────────────────────────
  function refreshChips() {
    updateSampleChips(parseInt(sampleSlider ? sampleSlider.value : 4, 10), getActiveDomain().rowPrefix);
  }

  if (domainSelect) {
    domainSelect.addEventListener('change', () => {
      refreshChips();
      draw();
    });
  }

  if (dimSlider) {
    dimSlider.addEventListener('input', (e) => {
      if (dimValSpan) dimValSpan.textContent = e.target.value;
      draw();
    });
  }

  if (sampleSlider) {
    sampleSlider.addEventListener('input', (e) => {
      if (sampleValSpan) sampleValSpan.textContent = e.target.value;
      if (selectedSampleIdx >= parseInt(e.target.value, 10)) selectedSampleIdx = 0;
      refreshChips();
      draw();
    });
  }

  if (batchSlider) {
    batchSlider.addEventListener('input', (e) => {
      if (batchValSpan) batchValSpan.textContent = e.target.value;
      draw();
    });
  }

  if (viewSelect) {
    viewSelect.addEventListener('change', draw);
  }

  // Click a cell (picks vector + scalar) or a tensor sheet header (picks matrix X_k)
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = clickableZones.length - 1; i >= 0; i--) {
      const zone = clickableZones[i];
      if (clickX >= zone.x && clickX <= zone.x + zone.w &&
          clickY >= zone.y && clickY <= zone.y + zone.h) {
        if (zone.batch !== undefined) selectedBatchIdx = zone.batch;
        if (zone.r !== undefined) selectedSampleIdx = zone.r;
        if (zone.c !== undefined) selectedFeatureIdx = zone.c;
        refreshChips();
        draw();
        break;
      }
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = clickableZones.some(z => mx >= z.x && mx <= z.x + z.w && my >= z.y && my <= z.y + z.h);
    canvas.style.cursor = hit ? 'pointer' : 'default';
  });

  // Preset Buttons
  document.querySelectorAll('.linalg-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-preset');
      if (preset === 'health') {
        if (domainSelect) domainSelect.value = 'health';
        if (dimSlider) dimSlider.value = 5;
        if (sampleSlider) sampleSlider.value = 4;
        if (batchSlider) batchSlider.value = 2;
      } else if (preset === 'sensor') {
        if (domainSelect) domainSelect.value = 'sensor';
        if (dimSlider) dimSlider.value = 6;
        if (sampleSlider) sampleSlider.value = 5;
        if (batchSlider) batchSlider.value = 3;
      } else if (preset === 'finance') {
        if (domainSelect) domainSelect.value = 'finance';
        if (dimSlider) dimSlider.value = 4;
        if (sampleSlider) sampleSlider.value = 4;
        if (batchSlider) batchSlider.value = 2;
      }
      selectedSampleIdx = 0;
      selectedFeatureIdx = 0;
      selectedBatchIdx = 0;
      refreshChips();
      draw();
    });
  });

  // Initial Setup
  refreshChips();
  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('themeChanged', draw);
  setTimeout(resizeCanvas, 50);
}

document.addEventListener('DOMContentLoaded', initLinearAlgebraLab);
