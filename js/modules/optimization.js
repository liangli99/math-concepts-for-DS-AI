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
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#38bdf8;font-weight:600;">― Total Revenue TR(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#f43f5e;font-weight:600;">― Total Cost TC(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#94a3b8;">⋯ Fixed Baseline FC</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#c084fc;">╌╌ Plant Capacity (1,000 u)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#fbbf24;">● Break-Even Point</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#34d399;">↕ Profit Spread</span>
      `;
    } else {
      legendStrip.innerHTML = `
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#34d399;font-weight:600;">― Net Profit Curve Z(Q)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#94a3b8;">⋯ Zero-Profit Line ($0)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#c084fc;">╌╌ Capacity Limit (1,000 u)</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#fbbf24;">● Break-Even Volume</span>
        <span style="display:inline-flex;align-items:center;gap:0.35rem;color:#10b981;font-weight:600;">★ Optimal Max Profit</span>
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

document.addEventListener('DOMContentLoaded', initOptimizationLab);
