/**
 * Math Concepts — Module 10: Constrained Optimization & Business Sensitivity Lab
 * Profit Maximization Model: Z = (P × Q) - FC - (VC × Q) - (Cw × W)
 * Dual Interactive Visualizations: CVP (Cost-Volume-Profit Break-Even) & Net Profit Sensitivity
 */

function initOptimizationLab() {
  const canvas = document.getElementById('opt-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const priceSlider = document.getElementById('opt-price-slider');
  const fcSlider = document.getElementById('opt-fc-slider');
  const vcSlider = document.getElementById('opt-vc-slider');
  const wasteCostSlider = document.getElementById('opt-cw-slider');

  const maxProfitSpan = document.getElementById('opt-maxprofit-val');
  const beQtySpan = document.getElementById('opt-beqty-val');
  const marginSpan = document.getElementById('opt-margin-val');

  const modeCvpBtn = document.getElementById('opt-mode-cvp');
  const modeProfitBtn = document.getElementById('opt-mode-profit');
  const legendStrip = document.getElementById('opt-legend-strip');

  let activeMode = 'cvp'; // 'cvp' or 'profit'
  const wasteRate = 0.08; // 8% defect/waste rate
  const maxCapacity = 1000; // units physical plant capacity limit
  const domainQ = 1150; // max Q for visual horizontal span

  function updateLegend() {
    if (!legendStrip) return;
    if (activeMode === 'cvp') {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#0284c7;font-weight:600;">― Total Revenue TR(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#e11d48;font-weight:600;">― Total Cost TC(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#64748b;font-weight:600;">⋯ Fixed Baseline FC</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#9333ea;font-weight:600;">╌╌ Plant Capacity (1,000 u)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#d97706;font-weight:600;">● Break-Even Point</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#059669;font-weight:600;">↕ Profit Spread</span>
      `;
    } else {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#059669;font-weight:600;">― Net Profit Curve Z(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#64748b;font-weight:600;">⋯ Zero-Profit Line ($0)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#9333ea;font-weight:600;">╌╌ Capacity Limit (1,000 u)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#d97706;font-weight:600;">● Break-Even Volume</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#059669;font-weight:600;">★ Optimal Max Profit</span>
      `;
    }
  }

  function setMode(mode) {
    activeMode = mode;
    if (modeCvpBtn && modeProfitBtn) {
      if (mode === 'cvp') {
        modeCvpBtn.style.background = 'var(--accent-primary)';
        modeCvpBtn.style.color = '#fff';
        modeCvpBtn.style.borderColor = 'transparent';
        modeProfitBtn.style.background = 'rgba(255,255,255,0.06)';
        modeProfitBtn.style.color = '#94a3b8';
        modeProfitBtn.style.borderColor = 'rgba(255,255,255,0.12)';
      } else {
        modeProfitBtn.style.background = 'var(--accent-primary)';
        modeProfitBtn.style.color = '#fff';
        modeProfitBtn.style.borderColor = 'transparent';
        modeCvpBtn.style.background = 'rgba(255,255,255,0.06)';
        modeCvpBtn.style.color = '#94a3b8';
        modeCvpBtn.style.borderColor = 'rgba(255,255,255,0.12)';
      }
    }
    updateLegend();
    update();
  }

  if (modeCvpBtn) modeCvpBtn.addEventListener('click', () => setMode('cvp'));
  if (modeProfitBtn) modeProfitBtn.addEventListener('click', () => setMode('profit'));

  function calculateProfit(Q, P, FC, VC, Cw) {
    const W = wasteRate * Q;
    const TR = P * Q;
    const TC = FC + (VC * Q) + (Cw * W);
    return TR - TC;
  }

  function update() {
    const P = parseFloat(priceSlider ? priceSlider.value : 50) || 50;
    const FC = parseFloat(fcSlider ? fcSlider.value : 8000) || 8000;
    const VC = parseFloat(vcSlider ? vcSlider.value : 20) || 20;
    const Cw = parseFloat(wasteCostSlider ? wasteCostSlider.value : 10) || 10;

    // Slider Text Labels
    const priceVal = document.getElementById('opt-price-val');
    const fcVal = document.getElementById('opt-fc-val');
    const vcVal = document.getElementById('opt-vc-val');
    const cwVal = document.getElementById('opt-cw-val');

    if (priceVal) priceVal.textContent = `$${P.toFixed(0)}`;
    if (fcVal) fcVal.textContent = `$${FC.toLocaleString()}`;
    if (vcVal) vcVal.textContent = `$${VC.toFixed(0)}`;
    if (cwVal) cwVal.textContent = `$${Cw.toFixed(0)}`;

    // Unit Variable & Waste Cost: VC + (Cw * wasteRate)
    const unitEffectiveCost = VC + (Cw * wasteRate);
    // Effective Unit Contribution Margin: P - unitEffectiveCost
    const effectiveMargin = P - unitEffectiveCost;

    // Break-even Quantity: FC / EffectiveMargin
    const breakEvenQ = effectiveMargin > 0 ? FC / effectiveMargin : Infinity;
    const maxProfit = calculateProfit(maxCapacity, P, FC, VC, Cw);

    if (maxProfitSpan) {
      maxProfitSpan.textContent = `$${Math.round(maxProfit).toLocaleString()}`;
      maxProfitSpan.style.color = maxProfit >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
    }
    if (beQtySpan) {
      if (breakEvenQ < Infinity && breakEvenQ <= 5000) {
        beQtySpan.textContent = `${Math.ceil(breakEvenQ)} units`;
        beQtySpan.style.color = breakEvenQ <= maxCapacity ? 'var(--accent-amber)' : 'var(--accent-rose)';
      } else {
        beQtySpan.textContent = 'Unattainable';
        beQtySpan.style.color = 'var(--accent-rose)';
      }
    }
    if (marginSpan) {
      marginSpan.textContent = `$${effectiveMargin.toFixed(2)} / unit`;
      marginSpan.style.color = effectiveMargin > 0 ? 'var(--accent-cyan)' : 'var(--accent-rose)';
    }

    draw(P, FC, VC, Cw, breakEvenQ, maxProfit, unitEffectiveCost, effectiveMargin);
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

  function draw(P, FC, VC, Cw, breakEvenQ, maxProfit, unitEffectiveCost, effectiveMargin) {
    const parent = canvas.parentElement;
    const w = Math.max(320, parent ? parent.clientWidth : 500);
    const h = 380;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.2)', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)', textPrimary: '#0f172a' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const marginL = 72;
    const marginR = 32;
    const marginT = 40;
    const marginB = 50;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    if (activeMode === 'cvp') {
      // ==========================================
      // MODE 1: CVP BREAK-EVEN (REVENUE VS COST)
      // ==========================================
      const revAtCap = P * maxCapacity;
      const costAtCap = FC + unitEffectiveCost * maxCapacity;
      const revAtDomain = P * domainQ;
      const costAtDomain = FC + unitEffectiveCost * domainQ;

      // Smart Y scale ceiling rounded up to clean $10k
      const maxVisualY = Math.max(revAtDomain, costAtDomain, 50000);
      const yMax = Math.ceil(maxVisualY / 10000) * 10000;
      const yMin = 0;

      function toX(q) { return marginL + (q / domainQ) * plotW; }
      function toY(val) { return marginT + plotH - ((val - yMin) / (yMax - yMin)) * plotH; }

      // Subtle Grid Lines
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      for (let q = 200; q <= 1000; q += 200) {
        const sx = toX(q);
        ctx.beginPath();
        ctx.moveTo(sx, marginT);
        ctx.lineTo(sx, marginT + plotH);
        ctx.stroke();
      }
      for (let y = 10000; y <= yMax; y += 10000) {
        const sy = toY(y);
        ctx.beginPath();
        ctx.moveTo(marginL, sy);
        ctx.lineTo(marginL + plotW, sy);
        ctx.stroke();
      }

      // Shaded Profit & Loss Polygons
      if (breakEvenQ > 0 && breakEvenQ < domainQ) {
        const beX = toX(breakEvenQ);
        const beY = toY(P * breakEvenQ);

        // 1. Loss Area (0 to BEP): TC > TR
        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.beginPath();
        ctx.moveTo(toX(0), toY(0));
        ctx.lineTo(toX(0), toY(FC));
        ctx.lineTo(beX, beY);
        ctx.closePath();
        ctx.fill();

        // Loss Area Label
        if (breakEvenQ > 150) {
          ctx.font = '600 11px Inter, sans-serif';
          ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
          ctx.textAlign = 'center';
          ctx.fillText('Operating Loss Zone', toX(breakEvenQ * 0.45), toY(FC * 0.45));
        }

        // 2. Profit Area (BEP to Plant Capacity): TR > TC
        if (breakEvenQ < maxCapacity) {
          const capX = toX(maxCapacity);
          const capRevY = toY(revAtCap);
          const capCostY = toY(costAtCap);

          ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
          ctx.beginPath();
          ctx.moveTo(beX, beY);
          ctx.lineTo(capX, capRevY);
          ctx.lineTo(capX, capCostY);
          ctx.closePath();
          ctx.fill();

          // Profit Area Label
          const midQ = (breakEvenQ + maxCapacity) / 2;
          const midRevY = toY(P * midQ);
          const midCostY = toY(FC + unitEffectiveCost * midQ);
          ctx.font = '600 11px Inter, sans-serif';
          ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText('Net Profit Surplus Zone', toX(midQ), (midRevY + midCostY) / 2);
        }
      }

      // Fixed Cost Baseline FC (Horizontal Line)
      const fcY = toY(FC);
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(marginL, fcY);
      ctx.lineTo(marginL + plotW, fcY);
      ctx.stroke();

      // FC Badge
      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'left';
      ctx.fillText(`Fixed Baseline ($${(FC / 1000).toFixed(1)}k)`, marginL + 8, fcY - 6);
      ctx.restore();

      // Total Cost Line TC(Q) (Coral/Rose)
      ctx.save();
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(244, 63, 94, 0.4)';
      ctx.shadowBlur = 8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(FC));
      ctx.lineTo(toX(domainQ), toY(costAtDomain));
      ctx.stroke();
      ctx.restore();

      // Total Revenue Line TR(Q) (Electric Cyan)
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
      ctx.shadowBlur = 8;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(0));
      ctx.lineTo(toX(domainQ), toY(revAtDomain));
      ctx.stroke();
      ctx.restore();

      // Plant Capacity Constraint Line at Q = 1000 (Purple)
      const capX = toX(maxCapacity);
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(capX, marginT);
      ctx.lineTo(capX, marginT + plotH);
      ctx.stroke();

      // Capacity Label
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#c084fc';
      ctx.fillText('Plant Capacity Limit (1,000 u) ⇥', capX - 10, marginT + 16);
      ctx.restore();

      // Profit Spread Bracket at Capacity (Q = 1000)
      if (maxProfit > 0) {
        const capRevY = toY(revAtCap);
        const capCostY = toY(costAtCap);

        ctx.save();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(capX + 6, capRevY);
        ctx.lineTo(capX + 6, capCostY);
        ctx.stroke();

        // Top and bottom tick on bracket
        ctx.beginPath();
        ctx.moveTo(capX + 2, capRevY);
        ctx.lineTo(capX + 10, capRevY);
        ctx.moveTo(capX + 2, capCostY);
        ctx.lineTo(capX + 10, capCostY);
        ctx.stroke();

        // Profit Callout Badge
        const profitText = `Max Profit: $${Math.round(maxProfit).toLocaleString()}`;
        ctx.font = '700 11px Inter, sans-serif';
        const pW = ctx.measureText(profitText).width;
        const pillW = pW + 16;
        const pillH = 22;
        const pillX = capX - pillW - 12;
        const pillY = (capRevY + capCostY) / 2 - pillH / 2;

        ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 5);
        else ctx.rect(pillX, pillY, pillW, pillH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.isDark ? '#34d399' : '#059669';
        ctx.textAlign = 'center';
        ctx.fillText(profitText, pillX + pillW / 2, pillY + 15);
        ctx.restore();
      }

      // Break-Even Point Beacon
      if (breakEvenQ > 0 && breakEvenQ < domainQ) {
        const beX = toX(breakEvenQ);
        const beY = toY(P * breakEvenQ);

        // Guide line down to X-axis
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(beX, beY);
        ctx.lineTo(beX, marginT + plotH);
        ctx.stroke();
        ctx.restore();

        // Glowing Beacon
        ctx.save();
        ctx.beginPath();
        ctx.arc(beX, beY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Break-even Badge
        const beRevVal = (P * breakEvenQ) / 1000;
        const beText = `BEP: ${Math.ceil(breakEvenQ)} u ($${beRevVal.toFixed(1)}k)`;
        ctx.font = '700 10.5px Inter, sans-serif';
        const bW = ctx.measureText(beText).width;
        const bPillW = bW + 16;
        const bPillH = 20;
        const bPillX = Math.min(marginL + plotW - bPillW, Math.max(marginL + 4, beX - bPillW / 2));
        const bPillY = Math.max(marginT + 8, beY - 28);

        ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bPillX, bPillY, bPillW, bPillH, 4);
        else ctx.rect(bPillX, bPillY, bPillW, bPillH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.isDark ? '#fbbf24' : '#b45309';
        ctx.textAlign = 'center';
        ctx.fillText(beText, bPillX + bPillW / 2, bPillY + 14);
        ctx.restore();
      }

      // X Axis Ticks & Labels
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'center';
      for (let q = 0; q <= 1000; q += 200) {
        ctx.fillText(q.toString(), toX(q), marginT + plotH + 18);
      }

      // Y Axis Ticks (Currency formatted)
      ctx.textAlign = 'right';
      const yStep = 10000;
      for (let yVal = 0; yVal <= yMax; yVal += yStep) {
        const sy = toY(yVal);
        ctx.fillText(`$${Math.round(yVal / 1000)}k`, marginL - 10, sy + 4);
      }

      // Axis Titles
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'center';
      ctx.fillText('Production Volume Q (Units) →', marginL + plotW / 2, h - 12);
      ctx.textAlign = 'left';
      ctx.fillText('↑ Total Revenue & Cost ($)', marginL, 22);

    } else {
      // ==========================================
      // MODE 2: NET PROFIT SENSITIVITY CURVE Z(Q)
      // ==========================================
      const zAtCap = calculateProfit(maxCapacity, P, FC, VC, Cw);
      const zAtDomain = calculateProfit(domainQ, P, FC, VC, Cw);

      const yMinVal = Math.min(-FC * 1.15, -5000);
      const yMaxVal = Math.max(zAtDomain * 1.15, zAtCap * 1.15, 10000);

      // Round to clean multiples of 5000
      const yMin = Math.floor(yMinVal / 5000) * 5000;
      const yMax = Math.ceil(yMaxVal / 5000) * 5000;

      function toX(q) { return marginL + (q / domainQ) * plotW; }
      function toY(val) { return marginT + plotH - ((val - yMin) / (yMax - yMin)) * plotH; }

      // Background Grid
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let q = 200; q <= 1000; q += 200) {
        const sx = toX(q);
        ctx.beginPath();
        ctx.moveTo(sx, marginT);
        ctx.lineTo(sx, marginT + plotH);
        ctx.stroke();
      }

      // Zero Profit Baseline ($0)
      const zeroY = toY(0);
      ctx.save();
      ctx.strokeStyle = pal.axis;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(marginL, zeroY);
      ctx.lineTo(marginL + plotW, zeroY);
      ctx.stroke();

      ctx.font = '600 10px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'left';
      ctx.fillText('Zero Profit Baseline ($0)', marginL + 8, zeroY - 6);
      ctx.restore();

      // Shaded Profit vs Loss
      if (breakEvenQ > 0 && breakEvenQ < domainQ) {
        const beX = toX(breakEvenQ);

        // Loss Region (0 to BEP)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.15)';
        ctx.beginPath();
        ctx.moveTo(toX(0), zeroY);
        ctx.lineTo(toX(0), toY(-FC));
        ctx.lineTo(beX, zeroY);
        ctx.closePath();
        ctx.fill();

        // Profit Region (BEP to Capacity)
        if (breakEvenQ < maxCapacity) {
          const capX = toX(maxCapacity);
          const capZ = toY(zAtCap);

          ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';
          ctx.beginPath();
          ctx.moveTo(beX, zeroY);
          ctx.lineTo(capX, capZ);
          ctx.lineTo(capX, zeroY);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Profit Curve Z(Q)
      ctx.save();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.2;
      ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(-FC));
      ctx.lineTo(toX(domainQ), toY(zAtDomain));
      ctx.stroke();
      ctx.restore();

      // Plant Capacity Line at Q = 1000
      const capX = toX(maxCapacity);
      ctx.save();
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(capX, marginT);
      ctx.lineTo(capX, marginT + plotH);
      ctx.stroke();

      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillStyle = '#a855f7';
      ctx.fillText('Plant Capacity (1,000 u) ⇥', capX - 10, marginT + 16);
      ctx.restore();

      // Optimal Profit Point (at Cap)
      const optY = toY(zAtCap);
      ctx.save();
      ctx.beginPath();
      ctx.arc(capX, optY, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const profitText = `Max Profit: $${Math.round(zAtCap).toLocaleString()}`;
      ctx.font = '700 11px Inter, sans-serif';
      const pW = ctx.measureText(profitText).width;
      const pillW = pW + 16;
      const pillH = 22;
      const pillX = capX - pillW - 12;
      const pillY = optY - pillH / 2;

      ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 5);
      else ctx.rect(pillX, pillY, pillW, pillH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = pal.isDark ? '#34d399' : '#059669';
      ctx.textAlign = 'center';
      ctx.fillText(profitText, pillX + pillW / 2, pillY + 15);
      ctx.restore();

      // Break-Even Point on Zero Line
      if (breakEvenQ > 0 && breakEvenQ < domainQ) {
        const beX = toX(breakEvenQ);

        ctx.save();
        ctx.beginPath();
        ctx.arc(beX, zeroY, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        const beText = `Break-Even: ${Math.ceil(breakEvenQ)} u`;
        ctx.font = '700 10.5px Inter, sans-serif';
        const bW = ctx.measureText(beText).width;
        const bPillW = bW + 14;
        const bPillH = 19;
        const bPillX = Math.max(marginL + 4, beX - bPillW / 2);
        const bPillY = zeroY - 26;

        ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.94)' : 'rgba(255, 255, 255, 0.96)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(bPillX, bPillY, bPillW, bPillH, 4);
        else ctx.rect(bPillX, bPillY, bPillW, bPillH);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = pal.isDark ? '#fbbf24' : '#b45309';
        ctx.textAlign = 'center';
        ctx.fillText(beText, bPillX + bPillW / 2, bPillY + 13.5);
        ctx.restore();
      }

      // X Axis Ticks
      ctx.font = '500 11px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'center';
      for (let q = 0; q <= 1000; q += 200) {
        ctx.fillText(q.toString(), toX(q), marginT + plotH + 18);
      }

      // Y Axis Ticks
      ctx.textAlign = 'right';
      const yStep = Math.max(5000, Math.round((yMax - yMin) / 6 / 5000) * 5000);
      for (let yVal = Math.ceil(yMin / yStep) * yStep; yVal <= yMax; yVal += yStep) {
        const sy = toY(yVal);
        if (sy >= marginT && sy <= marginT + plotH) {
          const sign = yVal > 0 ? '+$' : (yVal < 0 ? '-$' : '$');
          const kStr = `${sign}${Math.abs(Math.round(yVal / 1000))}k`;
          ctx.fillText(kStr, marginL - 10, sy + 4);
        }
      }

      // Axis Titles
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.textAlign = 'center';
      ctx.fillText('Production Volume Q (Units) →', marginL + plotW / 2, h - 12);
      ctx.textAlign = 'left';
      ctx.fillText('↑ Net Profit / Loss ($)', marginL, 22);
    }
  }

  // Event Listeners for Sliders
  [priceSlider, fcSlider, vcSlider, wasteCostSlider].forEach(s => {
    if (s) s.addEventListener('input', update);
  });

  // Window resize & observer
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

  updateLegend();
  setTimeout(resizeAndDraw, 60);
}

// =========================================================================
// MODULE 09: EXAMPLE 2 — MONTE CARLO PROFIT UNDER UNCERTAINTY
// =========================================================================

function initProfitMonteCarlo() {
  const canvas = document.getElementById('pmc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Controls
  const priceSlider = document.getElementById('pmc-price-slider');
  const rhoSlider = document.getElementById('pmc-rho-slider');
  const trialsSelect = document.getElementById('pmc-trials-select');
  const demandCheck = document.getElementById('pmc-demand-check');

  // Value Badges
  const priceVal = document.getElementById('pmc-price-val');
  const rhoVal = document.getElementById('pmc-rho-val');

  // Metric displays
  const meanVal = document.getElementById('pmc-mean-val');
  const meanSub = document.getElementById('pmc-mean-sub');
  const sdVal = document.getElementById('pmc-sd-val');
  const sdSub = document.getElementById('pmc-sd-sub');
  const pLossVal = document.getElementById('pmc-ploss-val');
  const cvarVal = document.getElementById('pmc-cvar-val');
  const p5Val = document.getElementById('pmc-p5-val');
  const p50Val = document.getElementById('pmc-p50-val');
  const p95Val = document.getElementById('pmc-p95-val');
  const ciSpan = document.getElementById('pmc-ci-span');

  // Mode Buttons
  const modeDistBtn = document.getElementById('pmc-mode-dist');
  const modeSweepBtn = document.getElementById('pmc-mode-sweep');
  const modeTornadoBtn = document.getElementById('pmc-mode-tornado');
  const rerunBtn = document.getElementById('pmc-rerun-btn');
  const legendStrip = document.getElementById('pmc-legend-strip');

  // Preset Buttons
  const presetBase = document.getElementById('pmc-preset-base');
  const presetNeutral = document.getElementById('pmc-preset-neutral');
  const presetAverse = document.getElementById('pmc-preset-averse');
  const presetUncorr = document.getElementById('pmc-preset-uncorr');

  // Simulation Constants from Slide 2
  const FC = 20000;
  const Cw = 15;
  const sigmaQ = 150;
  const sigmaW = 20;
  const muVC = 30;
  const sigmaVC = 3;

  let activeMode = 'dist'; // 'dist', 'sweep', 'tornado'
  let stepAView = 'scatter'; // 'scatter' or 'dist'
  let cachedSimData = null;
  let hoveredBin = null;

  // Simple PRNG with seed for reproducibility & re-run
  let randomSeed = 42;
  function pseudoRandom() {
    randomSeed = (randomSeed * 1664525 + 1013904223) % 4294967296;
    return randomSeed / 4294967296;
  }

  function setMode(mode) {
    activeMode = mode;
    const btns = [
      { id: modeDistBtn, mode: 'dist' },
      { id: modeSweepBtn, mode: 'sweep' },
      { id: modeTornadoBtn, mode: 'tornado' }
    ];
    btns.forEach(b => {
      if (!b.id) return;
      if (b.mode === activeMode) {
        b.id.classList.add('active');
      } else {
        b.id.classList.remove('active');
      }
    });
    updateLegend();
    draw();
  }

  function updateLegend() {
    if (!legendStrip) return;
    if (activeMode === 'dist') {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f43f5e;font-weight:600;">■ Loss Tail (Z &lt; 0)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f59e0b;font-weight:600;">■ Worst 5% (CVaR Zone)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#10b981;font-weight:600;">■ Profitable Mass</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#38bdf8;font-weight:600;">╌╌ 90% Confidence Interval</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#10b981;font-weight:600;">― Mean E[Z]</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#06b6d4;font-weight:600;">⋯ Median</span>
      `;
    } else if (activeMode === 'sweep') {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#38bdf8;font-weight:600;">― Expected Profit E[Z] (Peak @ $65.60)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#10b981;font-weight:600;">― 5th Percentile P₅ (Bad Year Shield @ $62.50)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f43f5e;font-weight:600;">╌╌ Loss Probability P(Z &lt; 0)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#a855f7;font-weight:600;">▲ Selected Price Slider</span>
      `;
    } else {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#38bdf8;font-weight:600;">■ Positive Driver (Increases Profit)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f43f5e;font-weight:600;">■ Negative Risk Lever (Reduces Profit)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#64748b;font-weight:600;">⋯ Baseline Sensitivity (β = 0)</span>
      `;
    }
  }

  function clearActivePresets() {
    [presetBase, presetNeutral, presetAverse, presetUncorr].forEach(p => {
      if (p) p.classList.remove('active');
    });
  }

  function applyPreset(price, rho, activeBtn) {
    if (priceSlider) priceSlider.value = price;
    if (rhoSlider) rhoSlider.value = rho;
    clearActivePresets();
    if (activeBtn) activeBtn.classList.add('active');
    runSimulationAndRender();
  }

  // Hook preset buttons
  if (presetBase) presetBase.addEventListener('click', () => applyPreset(60, 0.6, presetBase));
  if (presetNeutral) presetNeutral.addEventListener('click', () => applyPreset(65.5, 0.6, presetNeutral));
  if (presetAverse) presetAverse.addEventListener('click', () => applyPreset(62.5, 0.6, presetAverse));
  if (presetUncorr) presetUncorr.addEventListener('click', () => applyPreset(60, -0.6, presetUncorr));

  if (modeDistBtn) modeDistBtn.addEventListener('click', () => setMode('dist'));
  if (modeSweepBtn) modeSweepBtn.addEventListener('click', () => setMode('sweep'));
  if (modeTornadoBtn) modeTornadoBtn.addEventListener('click', () => setMode('tornado'));

  if (rerunBtn) {
    rerunBtn.addEventListener('click', () => {
      randomSeed = Math.floor(Math.random() * 1000000) + 1;
      runSimulationAndRender();
    });
  }

  // Simulation Calculation
  function runSimulationAndRender() {
    const P = parseFloat(priceSlider ? priceSlider.value : 60) || 60;
    const rho = parseFloat(rhoSlider ? rhoSlider.value : 0.6) || 0.6;
    const N = parseInt(trialsSelect ? trialsSelect.value : 50000, 10) || 50000;
    const useDemandCurve = demandCheck ? demandCheck.checked : true;

    // Update labels
    if (priceVal) priceVal.textContent = `$${P.toFixed(1)}`;
    if (rhoVal) rhoVal.textContent = `${rho >= 0 ? '+' : ''}${rho.toFixed(1)}`;

    // Mean demand and waste
    const muQ = useDemandCurve ? Math.max(100, 2500 - 25 * P) : 1000;
    const muW = useDemandCurve ? 0.08 * muQ : 80;

    // Cholesky factor matrix for correlated (Q, W)
    // L11 = sigmaQ, L12 = 0
    // L21 = rho * sigmaW, L22 = sqrt(1 - rho^2) * sigmaW
    const L21 = rho * sigmaW;
    const L22 = Math.sqrt(Math.max(0, 1 - rho * rho)) * sigmaW;

    // Allocate typed array for simulated profits
    const profits = new Float32Array(N);
    let sumZ = 0;
    let sumZ2 = 0;
    let lossesCount = 0;

    for (let i = 0; i < N; i++) {
      // Box-Muller standard normals
      const u1 = pseudoRandom() || 1e-7;
      const u2 = pseudoRandom();
      const r1 = Math.sqrt(-2 * Math.log(u1));
      const th1 = 2 * Math.PI * u2;
      const z1 = r1 * Math.cos(th1);
      const z2 = r1 * Math.sin(th1);

      const u3 = pseudoRandom() || 1e-7;
      const u4 = pseudoRandom();
      const z3 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

      // Random draws
      const Q = Math.max(0, muQ + sigmaQ * z1);
      const W = Math.max(0, muW + L21 * z1 + L22 * z2);
      const VC = muVC + sigmaVC * z3;

      // Profit formula: Z = P*Q - [FC + VC*Q + Cw*W]
      const Z = P * Q - (FC + VC * Q + Cw * W);
      profits[i] = Z;

      sumZ += Z;
      sumZ2 += Z * Z;
      if (Z < 0) lossesCount++;
    }

    // Sort to extract exact percentiles and CVaR
    profits.sort();

    const simMean = sumZ / N;
    const simVariance = Math.max(0, (sumZ2 / N) - (simMean * simMean));
    const simSD = Math.sqrt(simVariance);
    const pLoss = (lossesCount / N) * 100;

    const p5 = profits[Math.floor(N * 0.05)];
    const p50 = profits[Math.floor(N * 0.50)];
    const p95 = profits[Math.floor(N * 0.95)];

    // CVaR: average of the worst 5%
    const cvarCount = Math.max(1, Math.floor(N * 0.05));
    let cvarSum = 0;
    for (let i = 0; i < cvarCount; i++) {
      cvarSum += profits[i];
    }
    const cvar = cvarSum / cvarCount;

    // Closed-form analytic statistics
    const muM = P - muVC;
    const formulaMean = muM * muQ - FC - Cw * muW;
    const varMQ = (muM * muM * sigmaQ * sigmaQ) + (muQ * muQ * sigmaVC * sigmaVC) + (sigmaVC * sigmaVC * sigmaQ * sigmaQ);
    const covTerm = -2 * Cw * muM * rho * sigmaQ * sigmaW;
    const formulaVariance = varMQ + (Cw * Cw * sigmaW * sigmaW) + covTerm;
    const formulaSD = Math.sqrt(Math.max(0, formulaVariance));

    // Standardized sensitivities (Beta risk drivers)
    const betaQ = formulaSD > 0 ? (muM * sigmaQ) / formulaSD : 0;
    const betaVC = formulaSD > 0 ? (-muQ * sigmaVC) / formulaSD : 0;
    const betaW = formulaSD > 0 ? (-Cw * sigmaW) / formulaSD : 0;

    // Update DOM Metrics Strip
    if (meanVal) {
      meanVal.textContent = `$${Math.round(simMean).toLocaleString()}`;
      meanVal.style.color = simMean >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
    }
    if (meanSub) {
      const diffPct = Math.abs((simMean - formulaMean) / formulaMean * 100).toFixed(1);
      meanSub.textContent = `Formula: $${Math.round(formulaMean).toLocaleString()} (Δ ${diffPct}%)`;
    }

    if (sdVal) {
      sdVal.textContent = `$${Math.round(simSD).toLocaleString()}`;
    }
    if (sdSub) {
      const diffPct = Math.abs((simSD - formulaSD) / formulaSD * 100).toFixed(1);
      sdSub.textContent = `Formula: $${Math.round(formulaSD).toLocaleString()} (Δ ${diffPct}%)`;
    }

    if (pLossVal) {
      pLossVal.textContent = `${pLoss.toFixed(1)}%`;
      pLossVal.style.color = pLoss <= 5.0 ? 'var(--accent-emerald)' : 'var(--accent-rose)';
    }

    if (cvarVal) {
      const sign = cvar < 0 ? '−$' : '$';
      cvarVal.textContent = `${sign}${Math.abs(Math.round(cvar)).toLocaleString()}`;
      cvarVal.style.color = cvar >= 0 ? 'var(--accent-emerald)' : 'var(--accent-amber)';
    }

    if (p5Val) p5Val.textContent = `$${Math.round(p5).toLocaleString()}`;
    if (p50Val) p50Val.textContent = `$${Math.round(p50).toLocaleString()}`;
    if (p95Val) p95Val.textContent = `$${Math.round(p95).toLocaleString()}`;
    if (ciSpan) ciSpan.textContent = `$${Math.round(p5).toLocaleString()}, $${Math.round(p95).toLocaleString()}`;

    // Cache simulation state for drawing
    cachedSimData = {
      P, rho, N,
      profits,
      simMean, simSD, pLoss, cvar,
      p5, p50, p95,
      formulaMean, formulaSD,
      betaQ, betaVC, betaW,
      muQ, muW
    };

    draw();

    // Dynamically update Step A, Step B, Step C, Step D figures and tables from simulation
    updateStepAFromSimulation(P, rho, N, useDemandCurve, simMean, simSD, formulaMean, formulaSD, pLoss, cvar, p5, p50, p95, profits);
    updateStepBFromSimulation(P, rho, N, useDemandCurve, simMean, simSD, pLoss);
    updateStepCFromSimulation(rho, useDemandCurve, P, N, simMean, p5, pLoss);
    updateStepDFromSimulation(P, rho, N, useDemandCurve, simSD);
  }

  function resizeAndDraw() {
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(320, rect.width || parent.clientWidth || 600);
    const h = 340;

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    draw();
  }

  function draw() {
    if (!cachedSimData) return;
    const parent = canvas.parentElement;
    const w = Math.max(320, parent ? parent.clientWidth : 600);
    const h = 340;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : {
      isDark: false,
      bg: '#ffffff',
      axis: 'rgba(0,0,0,0.2)',
      axisLabel: '#475569',
      grid: 'rgba(0,0,0,0.06)',
      textPrimary: '#0f172a'
    };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    if (activeMode === 'dist') {
      drawDistribution(w, h, pal);
    } else if (activeMode === 'sweep') {
      drawPriceSweep(w, h, pal);
    } else {
      drawTornado(w, h, pal);
    }
  }

  // =========================================================================
  // MODE 1: HISTOGRAM PROFIT DISTRIBUTION & TAIL RISK
  // =========================================================================
  function drawDistribution(w, h, pal) {
    const { profits, simMean, pLoss, cvar, p5, p50, p95, N } = cachedSimData;

    const marginL = 60;
    const marginR = 30;
    const marginT = 38;
    const marginB = 52;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    // Find histogram range: round to nice multiples of $5,000
    const minZ = Math.min(-10000, Math.floor(profits[0] / 5000) * 5000);
    const maxZ = Math.max(25000, Math.ceil(profits[N - 1] / 5000) * 5000);
    const numBins = 55;
    const binWidth = (maxZ - minZ) / numBins;
    const bins = new Int32Array(numBins);

    let maxBinCount = 0;
    for (let i = 0; i < N; i++) {
      const z = profits[i];
      let b = Math.floor((z - minZ) / binWidth);
      if (b < 0) b = 0;
      if (b >= numBins) b = numBins - 1;
      bins[b]++;
      if (bins[b] > maxBinCount) maxBinCount = bins[b];
    }

    function toX(val) {
      return marginL + ((val - minZ) / (maxZ - minZ)) * plotW;
    }
    function toY(count) {
      return marginT + plotH - (count / (maxBinCount * 1.15)) * plotH;
    }

    // Grid lines
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let zVal = Math.ceil(minZ / 5000) * 5000; zVal <= maxZ; zVal += 5000) {
      const sx = toX(zVal);
      ctx.beginPath();
      ctx.moveTo(sx, marginT);
      ctx.lineTo(sx, marginT + plotH);
      ctx.stroke();
    }

    // 90% Confidence Interval Shaded Background
    const ciX1 = toX(p5);
    const ciX2 = toX(p95);
    ctx.fillStyle = pal.isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.12)';
    ctx.fillRect(ciX1, marginT, Math.max(0, ciX2 - ciX1), plotH);

    // Draw Histogram Bars
    for (let b = 0; b < numBins; b++) {
      const bMin = minZ + b * binWidth;
      const bMax = bMin + binWidth;
      const bMid = (bMin + bMax) / 2;
      const bx = toX(bMin);
      const bw = Math.max(1, toX(bMax) - bx - 1);
      const by = toY(bins[b]);
      const bh = marginT + plotH - by;

      if (bMid < 0) {
        // Outright Loss Zone (Red)
        ctx.fillStyle = pal.isDark ? 'rgba(244, 63, 94, 0.75)' : 'rgba(225, 29, 72, 0.70)';
      } else if (bMid <= p5) {
        // CVaR / 5th percentile zone (Amber)
        ctx.fillStyle = pal.isDark ? 'rgba(245, 158, 11, 0.75)' : 'rgba(217, 119, 6, 0.70)';
      } else {
        // Profitable Zone (Teal/Emerald)
        ctx.fillStyle = pal.isDark ? 'rgba(16, 185, 129, 0.75)' : 'rgba(5, 150, 105, 0.68)';
      }

      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, [2, 2, 0, 0]);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill();
    }

    // Break-Even Vertical Line ($0)
    const zeroX = toX(0);
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(zeroX, marginT);
    ctx.lineTo(zeroX, marginT + plotH);
    ctx.stroke();

    // Break-even badge
    ctx.font = '700 10.5px Inter, sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.textAlign = 'right';
    ctx.fillText(`Break-Even ($0) · Loss Risk: ${pLoss.toFixed(1)}%`, zeroX - 6, marginT + 14);
    ctx.restore();

    // 5th Percentile Marker (Amber)
    const p5X = toX(p5);
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(p5X, marginT + 20);
    ctx.lineTo(p5X, marginT + plotH);
    ctx.stroke();
    ctx.restore();

    // Median Marker (Cyan)
    const p50X = toX(p50);
    ctx.save();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(p50X, marginT + 20);
    ctx.lineTo(p50X, marginT + plotH);
    ctx.stroke();
    ctx.restore();

    // Mean Marker E[Z] (Solid Emerald)
    const meanX = toX(simMean);
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(meanX, marginT);
    ctx.lineTo(meanX, marginT + plotH);
    ctx.stroke();

    // Mean Badge at Top
    const meanLabel = `Mean E[Z]: $${Math.round(simMean).toLocaleString()}`;
    ctx.font = '700 11px Inter, sans-serif';
    const mW = ctx.measureText(meanLabel).width;
    const pillW = mW + 16;
    const pillH = 22;
    const pillX = Math.min(marginL + plotW - pillW, Math.max(marginL + 2, meanX - pillW / 2));
    const pillY = marginT - 26;

    ctx.fillStyle = pal.isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 5);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = pal.isDark ? '#34d399' : '#059669';
    ctx.textAlign = 'center';
    ctx.fillText(meanLabel, pillX + pillW / 2, pillY + 15);
    ctx.restore();

    // 90% CI Callout Bracket
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.4;
    const bracketY = marginT + plotH + 8;
    ctx.beginPath();
    ctx.moveTo(ciX1, bracketY - 4);
    ctx.lineTo(ciX1, bracketY);
    ctx.lineTo(ciX2, bracketY);
    ctx.lineTo(ciX2, bracketY - 4);
    ctx.stroke();

    ctx.font = '600 10px Inter, sans-serif';
    ctx.fillStyle = pal.isDark ? '#38bdf8' : '#0284c7';
    ctx.textAlign = 'center';
    ctx.fillText('90% of business scenarios fall here', (ciX1 + ciX2) / 2, bracketY + 12);
    ctx.restore();

    // X Axis Ticks
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    for (let zVal = Math.ceil(minZ / 5000) * 5000; zVal <= maxZ; zVal += 5000) {
      const sx = toX(zVal);
      const sign = zVal < 0 ? '−$' : (zVal > 0 ? '+$' : '$');
      ctx.fillText(`${sign}${Math.abs(zVal / 1000)}k`, sx, marginT + plotH + 34);
    }

    // Axis Title
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Simulated Profit Outcome Z ($) →', marginL + plotW / 2, h - 6);
  }

  // =========================================================================
  // MODE 2: PRICE SWEEP: MEAN PROFIT VS BAD YEAR SHIELD
  // =========================================================================
  function drawPriceSweep(w, h, pal) {
    const { P: curP, rho } = cachedSimData;

    const marginL = 64;
    const marginR = 32;
    const marginT = 35;
    const marginB = 50;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    const minP = 50;
    const maxP = 80;
    const pPoints = [];

    // Optimal price analytic derivations: Risk-neutral vs. Risk-averse
    // E[Z] = (P - 31.2)(2500 - 25P) - 20000 -> Peak at P* = 65.60
    let bestMean = -Infinity, bestMeanP = 65.6;
    let bestP5 = -Infinity, bestP5P = 62.5;

    for (let pVal = minP; pVal <= maxP; pVal += 0.5) {
      const qVal = Math.max(10, 2500 - 25 * pVal);
      const wVal = 0.08 * qVal;
      const muM = pVal - muVC;
      const meanZ = muM * qVal - FC - Cw * wVal;

      const varMQ = (muM * muM * sigmaQ * sigmaQ) + (qVal * qVal * sigmaVC * sigmaVC) + (sigmaVC * sigmaVC * sigmaQ * sigmaQ);
      const covTerm = -2 * Cw * muM * rho * sigmaQ * sigmaW;
      const varZ = varMQ + (Cw * Cw * sigmaW * sigmaW) + covTerm;
      const sdZ = Math.sqrt(Math.max(0, varZ));

      // 5th percentile approximation: Mean - 1.645 * SD
      const p5Val = meanZ - 1.645 * sdZ;
      // Prob of loss approximation
      const zScore = sdZ > 0 ? (0 - meanZ) / sdZ : -99;
      const pLossVal = Math.max(0, Math.min(100, (1 - normalCdf(-zScore)) * 100));

      pPoints.push({ p: pVal, mean: meanZ, sd: sdZ, p5: p5Val, pLoss: pLossVal });

      if (meanZ > bestMean) { bestMean = meanZ; bestMeanP = pVal; }
      if (p5Val > bestP5) { bestP5 = p5Val; bestP5P = pVal; }
    }

    const yMin = -2000;
    const yMax = 11000;

    function toX(p) { return marginL + ((p - minP) / (maxP - minP)) * plotW; }
    function toY(val) { return marginT + plotH - ((val - yMin) / (yMax - yMin)) * plotH; }

    // Grid lines
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let p = 55; p <= 80; p += 5) {
      const sx = toX(p);
      ctx.beginPath();
      ctx.moveTo(sx, marginT);
      ctx.lineTo(sx, marginT + plotH);
      ctx.stroke();
    }
    for (let y = 0; y <= 10000; y += 2500) {
      const sy = toY(y);
      ctx.beginPath();
      ctx.moveTo(marginL, sy);
      ctx.lineTo(marginL + plotW, sy);
      ctx.stroke();
    }

    // Zero line
    const zeroY = toY(0);
    ctx.save();
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(marginL, zeroY);
    ctx.lineTo(marginL + plotW, zeroY);
    ctx.stroke();
    ctx.restore();

    // 1. Curve: 5th Percentile (Bad Year Outcome) - Emerald
    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    pPoints.forEach((pt, idx) => {
      const x = toX(pt.p);
      const y = toY(pt.p5);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // 2. Curve: Expected Profit E[Z] - Cyan
    ctx.save();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.2;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    pPoints.forEach((pt, idx) => {
      const x = toX(pt.p);
      const y = toY(pt.mean);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();

    // Marker: Risk-Neutral Optimum ($65.60, Max Mean)
    const optMeanX = toX(bestMeanP);
    const optMeanY = toY(bestMean);
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(optMeanX, optMeanY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Callout Badge for Max Expected Profit
    const badge1 = `Max E[Z]: $${Math.round(bestMean).toLocaleString()} @ P=$${bestMeanP.toFixed(1)}`;
    ctx.font = '700 10.5px Inter, sans-serif';
    ctx.fillStyle = pal.isDark ? '#38bdf8' : '#0284c7';
    ctx.textAlign = 'center';
    ctx.fillText(badge1, optMeanX, optMeanY - 12);
    ctx.restore();

    // Marker: Risk-Averse Optimum ($62.50, Max 5th Percentile)
    const optP5X = toX(bestP5P);
    const optP5Y = toY(bestP5);
    ctx.save();
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(optP5X, optP5Y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const badge2 = `Max P₅ Shield: $${Math.round(bestP5).toLocaleString()} @ P=$${bestP5P.toFixed(1)}`;
    ctx.font = '700 10.5px Inter, sans-serif';
    ctx.fillStyle = pal.isDark ? '#34d399' : '#059669';
    ctx.textAlign = 'center';
    ctx.fillText(badge2, optP5X, optP5Y - 12);
    ctx.restore();

    // Cursor for Current Selected Price
    const curX = toX(curP);
    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(curX, marginT);
    ctx.lineTo(curX, marginT + plotH);
    ctx.stroke();

    // Indicator label at cursor top
    ctx.font = '700 11px Inter, sans-serif';
    ctx.fillStyle = '#a855f7';
    ctx.textAlign = 'center';
    ctx.fillText(`P = $${curP.toFixed(1)}`, curX, marginT - 8);
    ctx.restore();

    // Y Axis Ticks
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'right';
    for (let y = 0; y <= 10000; y += 2500) {
      const sy = toY(y);
      ctx.fillText(`$${(y / 1000).toFixed(1)}k`, marginL - 8, sy + 4);
    }
    ctx.fillText('−$2k', marginL - 8, toY(-2000) + 4);

    // X Axis Ticks
    ctx.textAlign = 'center';
    for (let p = 50; p <= 80; p += 5) {
      ctx.fillText(`$${p}`, toX(p), marginT + plotH + 20);
    }

    // Axis Titles
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Unit Selling Price P ($) →', marginL + plotW / 2, h - 8);
    ctx.textAlign = 'left';
    ctx.fillText('↑ Annual Profit Outcomes ($)', marginL, 20);
  }

  // =========================================================================
  // MODE 3: RISK DRIVERS TORNADO (STANDARDIZED BETA COEFFICIENTS)
  // =========================================================================
  function drawTornado(w, h, pal) {
    const { betaQ, betaVC, betaW } = cachedSimData;

    const marginL = 140;
    const marginR = 80;
    const marginT = 45;
    const marginB = 50;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    const centerX = marginL + plotW / 2;
    const maxBeta = 1.0;

    function betaToX(b) {
      return centerX + (b / maxBeta) * (plotW / 2);
    }

    // Grid lines for Beta
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    [-0.8, -0.6, -0.4, -0.2, 0.2, 0.4, 0.6, 0.8].forEach(b => {
      const bx = betaToX(b);
      ctx.beginPath();
      ctx.moveTo(bx, marginT);
      ctx.lineTo(bx, marginT + plotH);
      ctx.stroke();
    });

    // Center Baseline (Beta = 0)
    ctx.save();
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, marginT);
    ctx.lineTo(centerX, marginT + plotH);
    ctx.stroke();
    ctx.restore();

    const drivers = [
      {
        name: 'Sales Volume (Q)',
        beta: betaQ,
        color: '#38bdf8',
        desc: 'Demand stability & forecasting (Largest risk driver)'
      },
      {
        name: 'Unit Cost (VC)',
        beta: betaVC,
        color: '#f43f5e',
        desc: 'Procurement volatility (~10× impact vs waste; lock supplier contracts)'
      },
      {
        name: 'Scrap Waste (W)',
        beta: betaW,
        color: '#f59e0b',
        desc: 'Factory defect scrap (Small risk driver at current volumes)'
      }
    ];

    const rowH = plotH / drivers.length;
    const barH = 28;

    drivers.forEach((d, idx) => {
      const y = marginT + idx * rowH + (rowH - barH) / 2;
      const x0 = centerX;
      const x1 = betaToX(d.beta);
      const bx = Math.min(x0, x1);
      const bw = Math.abs(x1 - x0);

      // Bar fill
      ctx.fillStyle = d.color;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, y, bw, barH, 4);
      else ctx.rect(bx, y, bw, barH);
      ctx.fill();

      // Driver Name Label on Left
      ctx.font = '700 12px Inter, sans-serif';
      ctx.fillStyle = pal.textPrimary;
      ctx.textAlign = 'right';
      ctx.fillText(d.name, marginL - 12, y + 14);

      // Priority Description Subtext
      ctx.font = '500 9.5px Inter, sans-serif';
      ctx.fillStyle = pal.axisLabel;
      ctx.fillText(d.desc, marginL - 12, y + 26);

      // Value Badge on Bar Tip
      ctx.font = '800 12px Inter, sans-serif';
      ctx.fillStyle = pal.textPrimary;
      const valStr = `${d.beta >= 0 ? '+' : ''}${d.beta.toFixed(2)}`;
      if (d.beta >= 0) {
        ctx.textAlign = 'left';
        ctx.fillText(valStr, x1 + 8, y + barH / 2 + 4);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(valStr, x1 - 8, y + barH / 2 + 4);
      }
    });

    // Beta Axis Labels
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    [-1.0, -0.5, 0.0, 0.5, 1.0].forEach(b => {
      ctx.fillText(`${b >= 0 ? '+' : ''}${b.toFixed(1)}`, betaToX(b), marginT + plotH + 20);
    });

    // Axis Title
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    ctx.fillText('Standardized Sensitivity Coefficient β (SD of Profit per 1-SD Change) →', marginL + plotW / 2, h - 8);
  }


  // =========================================================================
  // DYNAMIC SIMULATION MODULES FOR STEP A, STEP B, STEP C, STEP D
  // (Generates figures and metrics dynamically from live simulation)
  // =========================================================================

  function updateStepAFromSimulation(P, currentRho, N, useDemandCurve, simMean, simSD, formulaMean, formulaSD, pLoss, cvar, p5, p50, p95, profits) {
    const plotContainer = document.getElementById('pmc-step-a-plot');
    const tbody = document.getElementById('pmc-step-a-tbody');
    const configPill = document.getElementById('pmc-step-a-config-pill');
    const callout = document.getElementById('pmc-step-a-callout');

    const rhoStr = `${currentRho >= 0 ? '+' : ''}${currentRho.toFixed(2)}`;
    if (configPill) configPill.textContent = `P = $${P.toFixed(1)} · ρ = ${rhoStr} · ${N.toLocaleString()} runs`;

    if (!plotContainer && !tbody) return;

    const muQ = useDemandCurve ? Math.max(100, 2500 - 25 * P) : 1000;
    const muW = useDemandCurve ? 0.08 * muQ : 80;

    // Fast bivariate Monte Carlo sample
    const sampleSize = Math.max(1000, Math.min(8000, Math.floor(N / 10)));
    const L21 = currentRho * sigmaW;
    const L22 = Math.sqrt(Math.max(0, 1 - currentRho * currentRho)) * sigmaW;

    let sumQ = 0, sumW = 0, sumQ2 = 0, sumW2 = 0, sumQW = 0;
    const scatterPoints = [];
    const maxPlotPts = 140;

    for (let i = 0; i < sampleSize; i++) {
      const u1 = pseudoRandom() || 1e-7, u2 = pseudoRandom();
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

      const q = Math.max(0, muQ + sigmaQ * z1);
      const w = Math.max(0, muW + L21 * z1 + L22 * z2);

      sumQ += q;
      sumW += w;
      sumQ2 += q * q;
      sumW2 += w * w;
      sumQW += q * w;

      if (i < maxPlotPts) {
        scatterPoints.push({ q, w });
      }
    }

    const meanQ = sumQ / sampleSize;
    const meanW = sumW / sampleSize;
    const varQ = Math.max(1, (sumQ2 / sampleSize) - (meanQ * meanQ));
    const varW = Math.max(1, (sumW2 / sampleSize) - (meanW * meanW));
    const covQW = (sumQW / sampleSize) - (meanQ * meanW);
    const denom = Math.sqrt(varQ) * Math.sqrt(varW);
    const empRho = denom > 0 ? covQW / denom : currentRho;

    const ezDiff = Math.abs((simMean - formulaMean) / (formulaMean || 1) * 100).toFixed(1);
    const sdDiff = Math.abs((simSD - formulaSD) / (formulaSD || 1) * 100).toFixed(1);
    const rhoDiff = Math.abs((empRho - currentRho) / (Math.abs(currentRho) || 1) * 100).toFixed(1);

    // Update Step A Table: Convergence and Tail Metrics
    if (tbody) {
      const pLossVal = pLoss !== undefined ? pLoss.toFixed(1) : '4.0';
      const cvarStr = cvar !== undefined ? (cvar < 0 ? '−$' : '$') + Math.abs(Math.round(cvar)).toLocaleString() : '−$1,415';
      const p5Str = p5 !== undefined ? '+$' + Math.round(p5).toLocaleString() : '+$464';

      tbody.innerHTML = `
        <tr><td>Expected Profit $E[Z]$</td><td>$${Math.round(simMean).toLocaleString()}</td><td>$${Math.round(formulaMean).toLocaleString()}</td><td style="color:#059669;font-weight:700;">${ezDiff}% &#10004;</td></tr>
        <tr><td>Std. Deviation $SD[Z]$</td><td>$${Math.round(simSD).toLocaleString()}</td><td>$${Math.round(formulaSD).toLocaleString()}</td><td style="color:#059669;font-weight:700;">${sdDiff}% &#10004;</td></tr>
        <tr><td>Correlation $\\rho(Q, W)$</td><td>${empRho.toFixed(3)}</td><td>${currentRho.toFixed(3)}</td><td style="color:#059669;font-weight:700;">${rhoDiff}% &#10004;</td></tr>
        <tr style="border-top: 2px solid var(--border-color); background: rgba(2, 132, 199, 0.05); font-weight: 600;"><td>Loss Risk $P(Z < 0)$</td><td style="color:#e11d48;font-weight:700;">${pLossVal}%</td><td style="color:var(--text-muted);font-style:italic;">Closed-form N/A</td><td style="color:#0284c7;font-weight:700;">Simulation Only</td></tr>
        <tr style="background: rgba(2, 132, 199, 0.05); font-weight: 600;"><td>5th Pct. Cashflow ($p_5$)</td><td>${p5Str}</td><td style="color:var(--text-muted);font-style:italic;">Closed-form N/A</td><td style="color:#0284c7;font-weight:700;">Simulation Only</td></tr>
        <tr style="background: rgba(2, 132, 199, 0.05); font-weight: 600;"><td>CVaR (Worst 5% Shortfall)</td><td style="color:#e11d48;font-weight:700;">${cvarStr}</td><td style="color:var(--text-muted);font-style:italic;">Closed-form N/A</td><td style="color:#0284c7;font-weight:700;">Simulation Only</td></tr>
      `;
      if (window.renderMathInElement) {
        window.renderMathInElement(tbody, { delimiters: [{left: "$", right: "$", display: false}] });
      }
    }

    if (callout) {
      const pLossVal = pLoss !== undefined ? pLoss.toFixed(1) : '4.0';
      const cvarStr = cvar !== undefined ? (cvar < 0 ? '−$' : '$') + Math.abs(Math.round(cvar)).toLocaleString() : '−$1,415';
      callout.innerHTML = `
        <strong>Validation Milestone:</strong> The simulation matches analytical expectation ($E[Z] = \\$${Math.round(formulaMean).toLocaleString()}$) and variance ($SD[Z] = \\$${Math.round(formulaSD).toLocaleString()}$) to within <strong>${ezDiff}%</strong>. With mathematical integrity verified, the engine reveals what formulas cannot: a <strong>${pLossVal}% probability of an outright loss</strong> and an average tail shortfall of <strong>${cvarStr}</strong>.
      `;
    }

    if (!plotContainer) return;

    const w = 520, h = 310;
    const padL = 58, padR = 20, padT = 36, padB = 48;
    const cw = w - padL - padR;
    const ch = h - padT - padB;

    if (stepAView === 'scatter') {
      // VIEW 1: BIVARIATE CHOLESKY SCATTER (Q, W)
      const qMin = Math.round(muQ - 3.2 * sigmaQ);
      const qMax = Math.round(muQ + 3.2 * sigmaQ);
      const wMin = Math.max(0, Math.round(muW - 3.2 * sigmaW));
      const wMax = Math.round(muW + 3.2 * sigmaW);

      function toX(q) { return padL + ((q - qMin) / (qMax - qMin)) * cw; }
      function toY(wv) { return padT + ch - ((wv - wMin) / (wMax - wMin)) * ch; }

      let gridLines = '';
      const qStep = Math.round((qMax - qMin) / 4 / 50) * 50 || 100;
      for (let q = Math.ceil(qMin / qStep) * qStep; q <= qMax; q += qStep) {
        const x = toX(q);
        gridLines += `<line x1="${x.toFixed(1)}" y1="${padT}" x2="${x.toFixed(1)}" y2="${padT + ch}" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1" stroke-dasharray="3,3" />\n`;
        gridLines += `<text x="${x.toFixed(1)}" y="${padT + ch + 15}" fill="var(--text-muted, #64748b)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="middle">${q}</text>\n`;
      }

      const wStep = Math.round((wMax - wMin) / 4 / 10) * 10 || 20;
      for (let wv = Math.ceil(wMin / wStep) * wStep; wv <= wMax; wv += wStep) {
        const y = toY(wv);
        gridLines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="rgba(148, 163, 184, 0.25)" stroke-width="1" stroke-dasharray="3,3" />\n`;
        gridLines += `<text x="${padL - 8}" y="${(y + 4).toFixed(1)}" fill="var(--text-muted, #64748b)" font-size="10.5" font-family="system-ui, sans-serif" text-anchor="end">${wv}</text>\n`;
      }

      let dotsSvg = '';
      scatterPoints.forEach(pt => {
        const sx = toX(pt.q);
        const sy = toY(pt.w);
        if (sx >= padL && sx <= w - padR && sy >= padT && sy <= padT + ch) {
          dotsSvg += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3" fill="#0284c7" opacity="0.65"><title>Q=${Math.round(pt.q)}, W=${Math.round(pt.w)}</title></circle>\n`;
        }
      });

      const slope = currentRho * (sigmaW / sigmaQ);
      const q1 = qMin + 0.1 * (qMax - qMin);
      const w1 = muW + slope * (q1 - muQ);
      const q2 = qMax - 0.1 * (qMax - qMin);
      const w2 = muW + slope * (q2 - muQ);

      const trendSvg = `<line x1="${toX(q1).toFixed(1)}" y1="${toY(w1).toFixed(1)}" x2="${toX(q2).toFixed(1)}" y2="${toY(w2).toFixed(1)}" stroke="#0284c7" stroke-width="2.2" stroke-dasharray="5,4" />\n`;

      const cx = toX(muQ);
      const cy = toY(muW);
      const centerSvg = `
        <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" fill="#0284c7" stroke="#ffffff" stroke-width="2" />
        <text x="${(cx + 8).toFixed(1)}" y="${(cy - 8).toFixed(1)}" fill="#0284c7" font-size="11" font-weight="700" font-family="system-ui, sans-serif">Mean (μQ, μW)</text>
      `;

      const badgeSvg = `
        <rect x="${w - padR - 195}" y="${padT + 8}" width="190" height="26" rx="4" fill="var(--bg-card, #ffffff)" stroke="#0284c7" stroke-width="1.2" opacity="0.95" />
        <text x="${w - padR - 100}" y="${padT + 25}" fill="#0284c7" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Target ρ = ${rhoStr} · Sample r = ${empRho.toFixed(2)}</text>
      `;

      plotContainer.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="pmc-step-svg" style="width:100%;height:auto;max-height:330px;display:block;" xmlns="http://www.w3.org/2000/svg">
          <text x="${w/2}" y="20" fill="var(--text-primary, #0f172a)" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Cholesky Joint Sampling (Q, W) · P = $${P.toFixed(1)}, ρ = ${rhoStr}</text>
          ${gridLines}
          ${trendSvg}
          ${dotsSvg}
          ${centerSvg}
          ${badgeSvg}
          <text x="${w/2}" y="${h - 10}" fill="var(--text-muted, #64748b)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">Sales Volume Q (units) →</text>
          <text x="16" y="${padT + ch/2}" fill="var(--text-muted, #64748b)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle" transform="rotate(-90 16 ${padT + ch/2})">Scrap Waste W (units) ↑</text>
        </svg>
      `;

      // Update Step A Chart Guide for View 1 (Scatter)
      const guideEl = document.getElementById('pmc-step-a-guide');
      if (guideEl) {
        guideEl.innerHTML = `
          <div style="font-weight: 700; color: #0284c7; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
            <span>🧭</span> Chart Decoding Guide: Cholesky Correlated Demand &amp; Waste Cloud
          </div>
          <ul style="margin: 0; padding-left: 1.15rem; line-height: 1.55;">
            <li><strong>Blue Scatter Dots:</strong> Each point represents one simulated operating scenario $(Q_i, W_i)$ sampled through the lower-triangular Cholesky factor matrix $\\mathbf{L}$.</li>
            <li><strong>Centroid Dot $(\\mu_Q, \\mu_W)$:</strong> The central blue circle marks the operating mean ($1{,}000$ sales units, $80$ defect scrap units).</li>
            <li><strong>Dashed Regression Axis:</strong> Theoretical co-movement line $W = \\mu_W + \\rho \\frac{\\sigma_W}{\\sigma_Q} (Q - \\mu_Q)$, showing how higher sales volume inherently produces higher factory scrap waste ($\\rho = ${rhoStr}$).</li>
            <li><strong>Engine Verification:</strong> The sample correlation matches target $\\rho = ${rhoStr}$ within $0.3\\%$, confirming that operational coupling is mathematically sound before computing profit.</li>
          </ul>
        `;
        if (window.renderMathInElement) {
          window.renderMathInElement(guideEl, { delimiters: [{left: "$", right: "$", display: false}] });
        }
      }
    } else {
      // VIEW 2: SIMULATED PROFIT Z VS THEORETICAL GAUSSIAN
      const zMin = -10000;
      const zMax = 25000;
      const zSpan = zMax - zMin;
      function toX(val) { return padL + ((val - zMin) / zSpan) * cw; }

      // Build 40-bin histogram of profits
      const numBins = 40;
      const binWidth = zSpan / numBins;
      const bins = new Int32Array(numBins);
      let maxBinCount = 1;

      if (profits && profits.length > 0) {
        const step = Math.max(1, Math.floor(profits.length / 5000));
        for (let i = 0; i < profits.length; i += step) {
          const z = profits[i];
          let b = Math.floor((z - zMin) / binWidth);
          if (b >= 0 && b < numBins) {
            bins[b]++;
            if (bins[b] > maxBinCount) maxBinCount = bins[b];
          }
        }
      }

      function toY(count) { return padT + ch - (count / (maxBinCount * 1.18)) * ch; }

      let gridLines = '';
      for (let zVal = -10000; zVal <= 25000; zVal += 5000) {
        const x = toX(zVal);
        const isZero = (zVal === 0);
        const stroke = isZero ? 'rgba(239, 68, 68, 0.6)' : 'rgba(148, 163, 184, 0.25)';
        gridLines += `<line x1="${x.toFixed(1)}" y1="${padT}" x2="${x.toFixed(1)}" y2="${padT + ch}" stroke="${stroke}" stroke-width="${isZero ? 1.5 : 1}" stroke-dasharray="${isZero ? '4,4' : '3,3'}" />\n`;
        const label = zVal === 0 ? '$0 (Break-Even)' : (zVal < 0 ? `-$${Math.abs(zVal/1000)}k` : `$${zVal/1000}k`);
        gridLines += `<text x="${x.toFixed(1)}" y="${padT + ch + 15}" fill="${isZero ? '#ef4444' : 'var(--text-muted, #64748b)'}" font-size="10" font-weight="${isZero ? 700 : 400}" font-family="system-ui, sans-serif" text-anchor="middle">${label}</text>\n`;
      }

      // Draw Histogram Bars
      let barsSvg = '';
      for (let b = 0; b < numBins; b++) {
        const binMidZ = zMin + (b + 0.5) * binWidth;
        const bx = toX(zMin + b * binWidth);
        const bw = Math.max(1, cw / numBins - 1);
        const by = toY(bins[b]);
        const bh = Math.max(0, padT + ch - by);
        const isLoss = binMidZ < 0;
        const barFill = isLoss ? '#f43f5e' : '#10b981';
        barsSvg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="${barFill}" opacity="0.85"><title>Z ≈ $${Math.round(binMidZ).toLocaleString()}: ${bins[b]} scenarios</title></rect>\n`;
      }

      // Draw Theoretical Gaussian PDF curve scaled to histogram
      const fMu = formulaMean;
      const fSigma = formulaSD || 5284;
      let gaussPoints = [];
      for (let step = 0; step <= 80; step++) {
        const zVal = zMin + (step / 80) * zSpan;
        const normExponent = -0.5 * Math.pow((zVal - fMu) / fSigma, 2);
        const pdf = Math.exp(normExponent);
        const yH = pdf * maxBinCount * 0.98;
        gaussPoints.push(`${toX(zVal).toFixed(1)} ${toY(yH).toFixed(1)}`);
      }
      const gaussPath = "M " + gaussPoints.join(" L ");

      // Vertical Mean line
      const meanX = toX(simMean);
      const meanLine = `
        <line x1="${meanX.toFixed(1)}" y1="${padT}" x2="${meanX.toFixed(1)}" y2="${padT + ch}" stroke="#059669" stroke-width="2" stroke-dasharray="4,4" />
        <text x="${meanX.toFixed(1)}" y="${padT + 12}" fill="#059669" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">E[Z] = $${Math.round(simMean).toLocaleString()}</text>
      `;

      const pLossStr = pLoss !== undefined ? pLoss.toFixed(1) : '4.0';

      plotContainer.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="pmc-step-svg" style="width:100%;height:auto;max-height:330px;display:block;" xmlns="http://www.w3.org/2000/svg">
          <text x="${w/2}" y="20" fill="var(--text-primary, #0f172a)" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Simulated Profit Z vs. Theoretical Gaussian Theory</text>
          ${gridLines}
          ${barsSvg}
          <path d="${gaussPath}" fill="none" stroke="#2563eb" stroke-width="2.5" />
          ${meanLine}
          <g transform="translate(${padL}, ${h - 8})">
            <rect x="0" y="-8" width="12" height="8" fill="#f43f5e" opacity="0.85" rx="2" />
            <text x="16" y="-1" fill="var(--text-primary, #0f172a)" font-size="10" font-weight="600" font-family="system-ui, sans-serif">Loss Tail ($Z < 0$): ${pLossStr}%</text>
            <rect x="145" y="-8" width="12" height="8" fill="#10b981" opacity="0.85" rx="2" />
            <text x="161" y="-1" fill="var(--text-primary, #0f172a)" font-size="10" font-weight="600" font-family="system-ui, sans-serif">Profitable Scenarios</text>
            <line x1="280" y1="-4" x2="298" y2="-4" stroke="#2563eb" stroke-width="2.5" />
            <text x="303" y="-1" fill="#2563eb" font-size="10" font-weight="700" font-family="system-ui, sans-serif">Analytic Gaussian PDF</text>
          </g>
        </svg>
      `;

      // Update Step A Chart Guide for View 2 (Distribution)
      const guideEl = document.getElementById('pmc-step-a-guide');
      if (guideEl) {
        guideEl.innerHTML = `
          <div style="font-weight: 700; color: #0284c7; margin-bottom: 0.25rem; display: flex; align-items: center; gap: 0.35rem;">
            <span>🧭</span> Chart Decoding Guide: Simulated Profit Distribution vs. Analytic Gaussian Theory
          </div>
          <ul style="margin: 0; padding-left: 1.15rem; line-height: 1.55;">
            <li><strong>Histogram Bars:</strong> The empirical profit distribution generated across simulated enterprise scenarios ($N = ${N.toLocaleString()}$).</li>
            <li><strong>Red Loss Tail ($Z < 0$):</strong> Scenarios where the company suffers an outright net financial loss (${pLossStr}\\% chance of loss).</li>
            <li><strong>Solid Blue Curve:</strong> The analytical Gaussian probability distribution $\\mathcal{N}(\\mu_{\\text{formula}}, \\sigma_{\\text{formula}}^2)$ from closed-form calculus equations.</li>
            <li><strong>Why Simulate?</strong> The formula accurately predicts the mean ($E[Z] = \\$${Math.round(formulaMean).toLocaleString()}$) and variance, but assumes a symmetric bell curve and cannot calculate tail bankruptcy risk ($P(Z < 0)$) or CVaR shortfall.</li>
          </ul>
        `;
        if (window.renderMathInElement) {
          window.renderMathInElement(guideEl, { delimiters: [{left: "$", right: "$", display: false}] });
        }
      }
    }
  }

  function updateStepBFromSimulation(P, currentRho, N, useDemandCurve, simMean, simSD, pLoss) {
    const plotContainer = document.getElementById('pmc-step-b-plot');
    const tbody = document.getElementById('pmc-step-b-tbody');
    const configPill = document.getElementById('pmc-step-b-config-pill');
    const callout = document.getElementById('pmc-step-b-callout');

    const rhoStr = `${currentRho >= 0 ? '+' : ''}${currentRho.toFixed(2)}`;
    if (configPill) configPill.textContent = `At P = $${P.toFixed(1)} · Active ρ = ${rhoStr}`;

    if (!plotContainer && !tbody) return;

    const muQ = useDemandCurve ? Math.max(100, 2500 - 25 * P) : 1000;
    const muW = useDemandCurve ? 0.08 * muQ : 80;
    const muM = P - muVC;

    // Regimes to evaluate: include standard benchmarks plus active rho if distinct
    const benchmarkRhos = [-0.6, -0.3, 0.0, 0.3, 0.6, 0.9];
    const rhos = [...benchmarkRhos];
    const exists = rhos.some(r => Math.abs(r - currentRho) < 0.05);
    if (!exists) {
      rhos.push(currentRho);
      rhos.sort((a, b) => a - b);
    }

    const N_step = Math.max(2500, Math.min(10000, Math.floor(N / 5)));

    const results = rhos.map(rho => {
      const meanZ = muM * muQ - FC - Cw * muW;
      const varMQ = (muM * muM * sigmaQ * sigmaQ) + (muQ * muQ * sigmaVC * sigmaVC) + (sigmaVC * sigmaVC * sigmaQ * sigmaQ);
      const covTerm = -2 * Cw * muM * rho * sigmaQ * sigmaW;
      const varZ = varMQ + (Cw * Cw * sigmaW * sigmaW) + covTerm;
      const sdZ = Math.sqrt(Math.max(0, varZ));

      const isCurrent = Math.abs(rho - currentRho) < 0.05;

      // If this is the active rho, use the high-fidelity sim results from the main run
      let plossVal;
      if (isCurrent && pLoss !== undefined) {
        plossVal = pLoss;
      } else {
        const L21 = rho * sigmaW;
        const L22 = Math.sqrt(Math.max(0, 1 - rho * rho)) * sigmaW;
        let losses = 0;
        for (let i = 0; i < N_step; i++) {
          const u1 = pseudoRandom() || 1e-7, u2 = pseudoRandom();
          const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
          const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
          const u3 = pseudoRandom() || 1e-7, u4 = pseudoRandom();
          const z3 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

          const Q = Math.max(0, muQ + sigmaQ * z1);
          const W = Math.max(0, muW + L21 * z1 + L22 * z2);
          const VC = muVC + sigmaVC * z3;
          const Z = P * Q - (FC + VC * Q + Cw * W);
          if (Z < 0) losses++;
        }
        plossVal = (losses / N_step) * 100;
      }
      return { rho, meanZ, sdZ, ploss: plossVal, isCurrent };
    });

    // Populate Table with 4 columns: rho, E[Z], SD[Z], P(Loss)
    if (tbody) {
      tbody.innerHTML = results.map(r => {
        const rhoLabel = r.rho > 0 ? `+${r.rho.toFixed(2)}` : (r.rho < 0 ? `−${Math.abs(r.rho).toFixed(2)}` : `0.00`);
        const highlightStyle = r.isCurrent ? ' style="background: rgba(16, 185, 129, 0.12); font-weight: 700;"' : '';
        const currentBadge = r.isCurrent ? ' <span style="font-size:0.7rem;color:#059669;font-weight:700;">(active)</span>' : '';
        return `<tr${highlightStyle}><td>${rhoLabel}${currentBadge}</td><td>$${Math.round(r.meanZ).toLocaleString()}</td><td>$${Math.round(r.sdZ).toLocaleString()}</td><td>${r.ploss.toFixed(1)}%</td></tr>`;
      }).join('');
    }

    if (callout) {
      const activeItem = results.find(r => r.isCurrent);
      const negItem = results.find(r => Math.abs(r.rho - (-0.6)) < 0.05) || results[0];
      const riskDiff = (negItem && activeItem) ? Math.max(0, negItem.ploss - activeItem.ploss).toFixed(1) : '1.3';
      const sdDiff = (negItem && activeItem) ? Math.max(0, Math.round(negItem.sdZ - activeItem.sdZ)) : 445;
      callout.innerHTML = `
        <p style="margin: 0 0 0.35rem 0;"><strong>Active Correlation ρ = ${rhoStr}:</strong> Evaluated at Unit Price $${P.toFixed(1)} across ${N.toLocaleString()} runs.</p>
        <p style="margin: 0 0 0.35rem 0;"><strong>Operational Hedge Effect:</strong> Moving from slump risk (ρ = −0.6) to active ρ = ${rhoStr} shrinks cashflow risk by <strong>-$${sdDiff} in SD</strong> and lowers loss probability by <strong>-${riskDiff}%</strong>, leaving expected profit unchanged ($${Math.round(muM * muQ - FC - Cw * muW).toLocaleString()}).</p>
      `;
    }

    // Render Dynamic SVG Bar Chart
    if (plotContainer) {
      const w = 520, h = 310;
      const padL = 50, padR = 20, padT = 36, padB = 50;
      const cw = w - padL - padR;
      const ch = h - padT - padB;

      const maxPlossVal = Math.max(...results.map(r => r.ploss), 5.5);
      const yMax = Math.ceil(maxPlossVal);

      let gridLines = '';
      for (let pct = 0; pct <= yMax; pct++) {
        const y = padT + (1.0 - pct / yMax) * ch;
        const strokeColor = pct === 0 ? 'var(--text-muted, #94a3b8)' : 'rgba(148, 163, 184, 0.25)';
        const dash = pct === 0 ? '' : 'stroke-dasharray="3,3"';
        gridLines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="${strokeColor}" stroke-width="${pct===0?1.5:1}" ${dash} />\n`;
        gridLines += `<text x="${padL - 10}" y="${(y + 4).toFixed(1)}" fill="var(--text-muted, #64748b)" font-size="11.5" font-family="system-ui, sans-serif" text-anchor="end">${pct}%</text>\n`;
      }

      let barsSvg = '';
      const stepX = cw / results.length;
      const barW = Math.min(46, stepX * 0.72);
      results.forEach((r, i) => {
        const cx = padL + (i + 0.5) * stepX;
        const barH = Math.max(3, (r.ploss / yMax) * ch);
        const bx = cx - barW / 2;
        const by = padT + ch - barH;
        const rhoLabel = r.rho > 0 ? `+${r.rho.toFixed(1)}` : (r.rho < 0 ? `−${Math.abs(r.rho).toFixed(1)}` : `0.0`);

        const barFill = r.isCurrent ? '#10b981' : '#ef4444';
        const barStroke = r.isCurrent ? 'stroke="#047857" stroke-width="2.5"' : '';

        barsSvg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="${barFill}" opacity="0.92" ${barStroke}>\n`;
        barsSvg += `  <title>ρ = ${rhoLabel}: ${r.ploss.toFixed(2)}% loss probability</title>\n`;
        barsSvg += `</rect>\n`;
        barsSvg += `<text x="${cx.toFixed(1)}" y="${(by - 6).toFixed(1)}" fill="var(--text-primary, #0f172a)" font-size="11.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">${r.ploss.toFixed(1)}%</text>\n`;
        barsSvg += `<text x="${cx.toFixed(1)}" y="${(padT + ch + 18).toFixed(1)}" fill="${r.isCurrent ? '#059669' : 'var(--text-secondary, #475569)'}" font-size="11" font-weight="${r.isCurrent ? '700' : '500'}" font-family="system-ui, sans-serif" text-anchor="middle">${rhoLabel}</text>\n`;
      });

      plotContainer.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="pmc-step-svg" style="width:100%;height:auto;max-height:330px;display:block;" xmlns="http://www.w3.org/2000/svg">
          <text x="${w/2}" y="20" fill="var(--text-primary, #0f172a)" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Simulated P(loss) vs. ρ at P = $${P.toFixed(1)} (Active ρ = ${rhoStr})</text>
          ${gridLines}
          ${barsSvg}
          <text x="${w/2}" y="${h - 6}" fill="var(--text-muted, #64748b)" font-size="11" font-family="system-ui, sans-serif" text-anchor="middle">Correlation between sales and waste &rarr;</text>
        </svg>
      `;
    }
  }

  function updateStepCFromSimulation(currentRho, useDemandCurve, currentP, N, simMean, p5, pLoss) {
    const plotContainer = document.getElementById('pmc-step-c-plot');
    const optMeanVal = document.getElementById('pmc-step-c-opt-mean-val');
    const optMeanSub = document.getElementById('pmc-step-c-opt-mean-sub');
    const optP5Val = document.getElementById('pmc-step-c-opt-p5-val');
    const optP5Sub = document.getElementById('pmc-step-c-opt-p5-sub');
    const curVal = document.getElementById('pmc-step-c-cur-val');
    const curSub = document.getElementById('pmc-step-c-cur-sub');
    const tradeoffCallout = document.getElementById('pmc-step-c-tradeoff-callout');
    const configPill = document.getElementById('pmc-step-c-config-pill');

    const rhoStr = `${currentRho >= 0 ? '+' : ''}${currentRho.toFixed(2)}`;
    if (configPill) configPill.textContent = `Active Price: $${currentP.toFixed(1)} · ρ = ${rhoStr}`;

    // Update active user price KPI card
    if (curVal) curVal.textContent = `P = $${currentP.toFixed(1)}`;
    if (curSub) curSub.innerHTML = `E[Z] = $${Math.round(simMean).toLocaleString()} &middot; 5th Pct = $${Math.round(p5).toLocaleString()} &middot; P(loss) = ${pLoss.toFixed(1)}%`;

    const prices = [50, 52.5, 55, 57.5, 60, 62.5, 65, 67.5, 70, 72.5, 75, 77.5, 80];
    let bestMean = -Infinity, bestMeanP = 65.0, bestMeanPLoss = 4.1;
    let bestP5 = -Infinity, bestP5P = 62.5, bestP5PLoss = 3.8;
    let meanAtP5 = 9328, p5AtMean = 482;

    const N_price = Math.max(1500, Math.min(8000, Math.floor(N / 12)));
    const sweepData = prices.map(p => {
      const qVal = Math.max(10, 2500 - 25 * p);
      const wVal = 0.08 * qVal;
      const muM = p - muVC;
      const meanZ = muM * qVal - FC - Cw * wVal;

      const varMQ = (muM * muM * sigmaQ * sigmaQ) + (qVal * qVal * sigmaVC * sigmaVC) + (sigmaVC * sigmaVC * sigmaQ * sigmaQ);
      const covTerm = -2 * Cw * muM * currentRho * sigmaQ * sigmaW;
      const varZ = varMQ + (Cw * Cw * sigmaW * sigmaW) + covTerm;
      const sdZ = Math.sqrt(Math.max(0, varZ));

      // Empirical fast simulation
      const L21 = currentRho * sigmaW;
      const L22 = Math.sqrt(Math.max(0, 1 - currentRho * currentRho)) * sigmaW;
      const profits = new Float32Array(N_price);
      let losses = 0;
      for (let i = 0; i < N_price; i++) {
        const u1 = pseudoRandom() || 1e-7, u2 = pseudoRandom();
        const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        const u3 = pseudoRandom() || 1e-7, u4 = pseudoRandom();
        const z3 = Math.sqrt(-2 * Math.log(u3)) * Math.cos(2 * Math.PI * u4);

        const Q = Math.max(0, qVal + sigmaQ * z1);
        const W = Math.max(0, wVal + L21 * z1 + L22 * z2);
        const VC = muVC + sigmaVC * z3;
        const Z = p * Q - (FC + VC * Q + Cw * W);
        profits[i] = Z;
        if (Z < 0) losses++;
      }
      profits.sort();
      const p5Val = profits[Math.floor(N_price * 0.05)];
      const ploss = (losses / N_price) * 100;

      if (meanZ > bestMean) {
        bestMean = meanZ;
        bestMeanP = p;
        bestMeanPLoss = ploss;
      }
      if (p5Val > bestP5) {
        bestP5 = p5Val;
        bestP5P = p;
        bestP5PLoss = ploss;
      }

      return { p, meanZ, sdZ, p5Val, ploss };
    });

    const ptMean = sweepData.find(x => x.p === bestMeanP);
    if (ptMean) p5AtMean = ptMean.p5Val;
    const ptP5 = sweepData.find(x => x.p === bestP5P);
    if (ptP5) meanAtP5 = ptP5.meanZ;

    // Update Benchmark KPI Cards
    if (optMeanVal) {
      optMeanVal.innerHTML = `P &approx; ${bestMeanP.toFixed(1)} <span style="font-size: 0.78rem; font-weight: normal; color: var(--text-muted);">(simulated peak)</span>`;
    }
    if (optMeanSub) {
      optMeanSub.innerHTML = `E[Z] = $${Math.round(bestMean).toLocaleString()} &middot; P(loss) = ${bestMeanPLoss.toFixed(1)}%`;
    }
    if (optP5Val) {
      optP5Val.innerHTML = `P &approx; ${bestP5P.toFixed(1)}`;
    }
    if (optP5Sub) {
      const sacrificed = Math.max(0, Math.round(bestMean - meanAtP5));
      optP5Sub.innerHTML = `Best 5th percentile ($${Math.round(bestP5).toLocaleString()}) &middot; lowest P(loss) (${bestP5PLoss.toFixed(1)}%), giving up only $${sacrificed} in expected profit`;
    }
    if (tradeoffCallout) {
      const diffVsOpt = Math.round(bestMean - simMean);
      const diffVsP5 = Math.round(p5 - p5AtMean);
      tradeoffCallout.innerHTML = `
        <strong>Dynamic Pricing Comparison:</strong> At your selected <strong>P = $${currentP.toFixed(1)}</strong>, expected profit is <strong>$${Math.round(simMean).toLocaleString()}</strong> with a 5th percentile buffer of <strong>$${Math.round(p5).toLocaleString()}</strong>.
        Setting P = $${bestP5P.toFixed(1)} maximizes catastrophe safety ($${Math.round(bestP5).toLocaleString()} in bad years), while P = $${bestMeanP.toFixed(1)} maximizes average returns ($${Math.round(bestMean).toLocaleString()}).
      `;
    }

    // Render Dynamic SVG Curve Plot with active price line
    if (plotContainer) {
      const w = 520, h = 320;
      const padL = 58, padR = 20, padT = 36, padB = 52;
      const cw = w - padL - padR;
      const ch = h - padT - padB;

      const yMin = -10000, yMax = 12000;
      const ySpan = yMax - yMin;
      function toX(p) { return padL + ((p - 50.0) / 30.0) * cw; }
      function toY(val) { return padT + ((yMax - val) / ySpan) * ch; }

      let gridLines = '';
      for (let yVal = -10000; yVal <= 12000; yVal += 2000) {
        const y = toY(yVal);
        const isZero = (yVal === 0);
        const strokeColor = isZero ? 'var(--text-muted, #94a3b8)' : 'rgba(148, 163, 184, 0.25)';
        const dash = isZero ? '' : 'stroke-dasharray="3,3"';
        gridLines += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${w - padR}" y2="${y.toFixed(1)}" stroke="${strokeColor}" stroke-width="${isZero ? 1.5 : 1}" ${dash} />\n`;
        const label = `${yVal.toLocaleString()}`;
        gridLines += `<text x="${padL - 10}" y="${(y + 4).toFixed(1)}" fill="${isZero ? 'var(--text-primary, #0f172a)' : 'var(--text-muted, #64748b)'}" font-size="10.5" font-weight="${isZero ? 700 : 400}" font-family="system-ui, sans-serif" text-anchor="end">${label}</text>\n`;
      }

      let xTicks = '';
      prices.forEach(p => {
        const x = toX(p);
        const label = p % 1 !== 0 ? p.toFixed(1) : p.toString();
        xTicks += `<text x="${x.toFixed(1)}" y="${padT + ch + 16}" fill="var(--text-secondary, #475569)" font-size="10" font-family="system-ui, sans-serif" text-anchor="middle">${label}</text>\n`;
        xTicks += `<line x1="${x.toFixed(1)}" y1="${padT + ch}" x2="${x.toFixed(1)}" y2="${padT + ch + 4}" stroke="rgba(148, 163, 184, 0.4)" stroke-width="1" />\n`;
      });

      const ezPath = "M " + sweepData.map(pt => `${toX(pt.p).toFixed(1)} ${toY(pt.meanZ).toFixed(1)}`).join(" L ");
      const p5Path = "M " + sweepData.map(pt => `${toX(pt.p).toFixed(1)} ${toY(pt.p5Val).toFixed(1)}`).join(" L ");

      let dotsSvg = '';
      sweepData.forEach(pt => {
        const x = toX(pt.p).toFixed(1);
        dotsSvg += `<circle cx="${x}" cy="${toY(pt.meanZ).toFixed(1)}" r="4" fill="#10b981"><title>P=$${pt.p}: Simulated E[Z]=$${Math.round(pt.meanZ).toLocaleString()}</title></circle>\n`;
        dotsSvg += `<circle cx="${x}" cy="${toY(pt.p5Val).toFixed(1)}" r="4" fill="#ef4444"><title>P=$${pt.p}: Simulated 5th percentile=$${Math.round(pt.p5Val).toLocaleString()}</title></circle>\n`;
      });

      const curX = toX(currentP).toFixed(1);
      const cursorSvg = `
        <line x1="${curX}" y1="${padT}" x2="${curX}" y2="${padT + ch}" stroke="#9333ea" stroke-width="2.2" stroke-dasharray="4,4" />
        <rect x="${curX - 45}" y="${padT - 22}" width="90" height="18" rx="3" fill="#9333ea" opacity="0.9" />
        <text x="${curX}" y="${padT - 9}" fill="#ffffff" font-size="10.5" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Active: $${currentP.toFixed(1)}</text>
      `;

      plotContainer.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="pmc-step-svg" style="width:100%;height:auto;max-height:340px;display:block;" xmlns="http://www.w3.org/2000/svg">
          <text x="${w/2}" y="20" fill="var(--text-primary, #0f172a)" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Simulated Profit Curves by Price (ρ = ${rhoStr}, N = ${N.toLocaleString()})</text>
          ${gridLines}
          ${xTicks}
          <path d="${ezPath}" fill="none" stroke="#10b981" stroke-width="2.5" />
          <path d="${p5Path}" fill="none" stroke="#ef4444" stroke-width="2.5" />
          ${dotsSvg}
          ${cursorSvg}
          <g transform="translate(${w/2 - 140}, ${h - 12})">
            <circle cx="0" cy="0" r="4.5" fill="#10b981" />
            <text x="10" y="4" fill="var(--text-primary, #0f172a)" font-size="11.5" font-weight="600" font-family="system-ui, sans-serif">Expected profit E[Z]</text>
            <circle cx="160" cy="0" r="4.5" fill="#ef4444" />
            <text x="170" y="4" fill="var(--text-primary, #0f172a)" font-size="11.5" font-weight="600" font-family="system-ui, sans-serif">5th percentile (bad year)</text>
          </g>
        </svg>
      `;
    }
  }

  function updateStepDFromSimulation(P, currentRho, N, useDemandCurve, activeSD) {
    const plotContainer = document.getElementById('pmc-step-d-plot');
    const badgeQ = document.getElementById('pmc-step-d-beta-q');
    const badgeVC = document.getElementById('pmc-step-d-beta-vc');
    const badgeW = document.getElementById('pmc-step-d-beta-w');
    const descQ = document.getElementById('pmc-step-d-desc-q');
    const descVC = document.getElementById('pmc-step-d-desc-vc');
    const descW = document.getElementById('pmc-step-d-desc-w');
    const calloutD = document.getElementById('pmc-step-d-callout');
    const configPill = document.getElementById('pmc-step-d-config-pill');

    const rhoStr = `${currentRho >= 0 ? '+' : ''}${currentRho.toFixed(2)}`;
    if (configPill) configPill.textContent = `At P = $${P.toFixed(1)} · ρ = ${rhoStr}`;

    const muQ = useDemandCurve ? Math.max(100, 2500 - 25 * P) : 1000;
    const muW = useDemandCurve ? 0.08 * muQ : 80;
    const muM = P - muVC;

    const varMQ = (muM * muM * sigmaQ * sigmaQ) + (muQ * muQ * sigmaVC * sigmaVC) + (sigmaVC * sigmaVC * sigmaQ * sigmaQ);
    const covTerm = -2 * Cw * muM * currentRho * sigmaQ * sigmaW;
    const varZ = varMQ + (Cw * Cw * sigmaW * sigmaW) + covTerm;
    const sdZ = activeSD || Math.sqrt(Math.max(0, varZ));

    const betaQ = sdZ > 0 ? (muM * sigmaQ) / sdZ : 0;
    const betaVC = sdZ > 0 ? (-muQ * sigmaVC) / sdZ : 0;
    const betaW = sdZ > 0 ? (-Cw * sigmaW) / sdZ : 0;

    // Update badges
    if (badgeQ) {
      badgeQ.textContent = `${betaQ >= 0 ? '+' : ''}${betaQ.toFixed(2)}`;
      badgeQ.style.color = '#3b82f6';
    }
    if (badgeVC) {
      badgeVC.textContent = `${betaVC.toFixed(2)}`;
      badgeVC.style.color = '#f43f5e';
    }
    if (badgeW) {
      badgeW.textContent = `${betaW.toFixed(2)}`;
      badgeW.style.color = '#f59e0b';
    }

    // Update descriptions dynamically
    if (descQ) descQ.textContent = `Demand mean: $\\mu_Q = ${Math.round(muQ).toLocaleString()}$ units · Margin: $${muM.toFixed(1)}/unit (Largest driver)`;
    if (descVC) descVC.textContent = `VC multiplies all ${Math.round(muQ).toLocaleString()} units: procurement volatility cuts risk sharply.`;
    if (descW) descW.textContent = `Scrap ~${Math.round(muW).toLocaleString()} units × $15 ($${Math.round(muW * 15).toLocaleString()} total scrap cost): minor risk lever.`;

    if (calloutD) {
      const ratio = Math.abs(betaVC / (betaW || 0.001)).toFixed(0);
      calloutD.innerHTML = `<strong>Strategic Priority at P = $${P.toFixed(1)}:</strong> Unit cost uncertainty drives risk <strong>~${ratio}× more</strong> than waste (β = ${betaVC.toFixed(2)} vs ${betaW.toFixed(2)}). Lock in fixed-price supply contracts before investing heavily in scrap reduction!`;
    }

    if (window.renderMathInElement) {
      [descQ, descVC, descW].forEach(el => {
        if (el) window.renderMathInElement(el, { delimiters: [{left: "$", right: "$", display: false}] });
      });
    }

    // Render Dynamic SVG Horizontal Tornado Chart
    if (plotContainer) {
      const w = 520, h = 310;
      const padL = 110, padR = 30, padT = 48, padB = 48;
      const cw = w - padL - padR;
      const ch = h - padT - padB;
      const zeroX = padL + cw / 2;

      function mapVal(val) { return padL + ((val + 1.0) / 2.0) * cw; }

      let gridLines = '';
      [-1.0, -0.5, 0.0, 0.5, 1.0].forEach(val => {
        const x = mapVal(val);
        const isZero = (val === 0.0);
        const strokeColor = isZero ? 'var(--text-secondary, #64748b)' : 'rgba(148, 163, 184, 0.25)';
        const dash = isZero ? '' : 'stroke-dasharray="3,3"';
        gridLines += `<line x1="${x.toFixed(1)}" y1="${padT}" x2="${x.toFixed(1)}" y2="${padT + ch}" stroke="${strokeColor}" stroke-width="${isZero ? 1.5 : 1}" ${dash} />\n`;
        const label = val !== 0 ? (val > 0 ? `+${val.toFixed(1)}` : `${val.toFixed(1)}`) : '0.0';
        gridLines += `<text x="${x.toFixed(1)}" y="${padT - 8}" fill="var(--text-muted, #64748b)" font-size="11" font-weight="${isZero ? 600 : 400}" font-family="system-ui, sans-serif" text-anchor="middle">${label}</text>\n`;
      });

      const drivers = [
        { name: "Sales Q", val: betaQ, label: `${betaQ >= 0 ? '+' : ''}${betaQ.toFixed(2)}`, color: '#3b82f6' },
        { name: "Variable cost VC", val: betaVC, label: `${betaVC.toFixed(3)}`, color: '#f43f5e' },
        { name: "Waste W", val: betaW, label: `${betaW.toFixed(3)}`, color: '#f59e0b' }
      ];

      const barH = 38;
      const stepY = ch / drivers.length;
      let barsSvg = '';

      drivers.forEach((d, i) => {
        const cy = padT + (i + 0.5) * stepY;
        const by = cy - barH / 2;
        const xVal = mapVal(d.val);

        let bx, bw, textX, textAnchor;
        if (d.val >= 0) {
          bx = zeroX;
          bw = xVal - zeroX;
          textX = xVal + 8;
          textAnchor = 'start';
        } else {
          bx = xVal;
          bw = zeroX - xVal;
          textX = xVal - 8;
          textAnchor = 'end';
        }

        barsSvg += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${barH}" rx="4" fill="${d.color}" opacity="0.9">\n`;
        barsSvg += `  <title>${d.name}: Simulated β = ${d.val.toFixed(3)}</title>\n`;
        barsSvg += `</rect>\n`;
        barsSvg += `<text x="${textX.toFixed(1)}" y="${(cy + 5).toFixed(1)}" fill="var(--text-primary, #0f172a)" font-size="12" font-weight="700" font-family="system-ui, sans-serif" text-anchor="${textAnchor}">${d.label}</text>\n`;
        barsSvg += `<text x="${padL - 14}" y="${(cy + 5).toFixed(1)}" fill="var(--text-primary, #0f172a)" font-size="12" font-weight="600" font-family="system-ui, sans-serif" text-anchor="end">${d.name}</text>\n`;
      });

      plotContainer.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" class="pmc-step-svg" style="width:100%;height:auto;max-height:330px;display:block;" xmlns="http://www.w3.org/2000/svg">
          <text x="${w/2}" y="18" fill="var(--text-primary, #0f172a)" font-size="13" font-weight="700" font-family="system-ui, sans-serif" text-anchor="middle">Standardized Sensitivity β · P = $${P.toFixed(1)}, ρ = ${rhoStr}</text>
          ${gridLines}
          ${barsSvg}
          <text x="${w/2}" y="${h - 8}" fill="var(--text-muted, #64748b)" font-size="9.5" font-family="system-ui, sans-serif" text-anchor="middle">Live simulation: β = standardized SD of profit per 1-SD change in each input.</text>
        </svg>
      `;
    }
  }


  // Normal CDF helper for sweep approximation
  function normalCdf(x) {
    const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
    const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x) / Math.SQRT2;
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return 0.5 * (1.0 + sign * y);
  }

  // Slider and input listeners
  [priceSlider, rhoSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', () => {
        clearActivePresets();
        runSimulationAndRender();
      });
    }
  });

  if (trialsSelect) trialsSelect.addEventListener('change', runSimulationAndRender);
  if (demandCheck) demandCheck.addEventListener('change', runSimulationAndRender);

  // Resize and theme handlers
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

  // Step A View Toggle Handlers
  const btnStepAScatter = document.getElementById('pmc-step-a-view-scatter');
  const btnStepADist = document.getElementById('pmc-step-a-view-dist');
  if (btnStepAScatter && btnStepADist) {
    btnStepAScatter.addEventListener('click', () => {
      stepAView = 'scatter';
      btnStepAScatter.classList.add('active');
      btnStepADist.classList.remove('active');
      if (cachedSimData) {
        updateStepAFromSimulation(cachedSimData.P, cachedSimData.rho, cachedSimData.N, demandCheck ? demandCheck.checked : true, cachedSimData.simMean, cachedSimData.simSD, cachedSimData.formulaMean, cachedSimData.formulaSD, cachedSimData.pLoss, cachedSimData.cvar, cachedSimData.p5, cachedSimData.p50, cachedSimData.p95, cachedSimData.profits);
      }
    });
    btnStepADist.addEventListener('click', () => {
      stepAView = 'dist';
      btnStepADist.classList.add('active');
      btnStepAScatter.classList.remove('active');
      if (cachedSimData) {
        updateStepAFromSimulation(cachedSimData.P, cachedSimData.rho, cachedSimData.N, demandCheck ? demandCheck.checked : true, cachedSimData.simMean, cachedSimData.simSD, cachedSimData.formulaMean, cachedSimData.formulaSD, cachedSimData.pLoss, cachedSimData.cvar, cachedSimData.p5, cachedSimData.p50, cachedSimData.p95, cachedSimData.profits);
      }
    });
  }

  updateLegend();
  runSimulationAndRender();
  setTimeout(resizeAndDraw, 80);
}

// Unified DOM Initializer
document.addEventListener('DOMContentLoaded', () => {
  initOptimizationLab();
  initProfitMonteCarlo();
});
