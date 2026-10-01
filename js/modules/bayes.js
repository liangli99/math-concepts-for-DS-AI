/**
 * MathCore DS & AI — Module 7: Conditional Probability & Bayes' Theorem Lab
 * Dual-Supplier Root Cause Analysis & Posterior Probability Visualizer
 */

function initBayesLab() {
  const pA1Slider = document.getElementById('bayes-pa1-slider');
  const d1Slider = document.getElementById('bayes-d1-slider');
  const d2Slider = document.getElementById('bayes-d2-slider');

  const pa1ValSpan = document.getElementById('bayes-pa1-val');
  const pa2ValSpan = document.getElementById('bayes-pa2-val');
  const d1ValSpan = document.getElementById('bayes-d1-val');
  const d2ValSpan = document.getElementById('bayes-d2-val');

  const postA1Span = document.getElementById('bayes-posta1-val');
  const postA2Span = document.getElementById('bayes-posta2-val');
  const totalDefectSpan = document.getElementById('bayes-totaldef-val');
  const formulaBreakdown = document.getElementById('bayes-calc-breakdown');

  function update() {
    // Prior Probabilities: Supplier 1 (A1) and Supplier 2 (A2)
    const pA1 = parseFloat(pA1Slider ? pA1Slider.value : 0.65);
    const pA2 = 1.0 - pA1;

    // Likelihood of Defect (B = Defect) given Supplier
    const pB_given_A1 = parseFloat(d1Slider ? d1Slider.value : 0.02); // 2% defect
    const pB_given_A2 = parseFloat(d2Slider ? d2Slider.value : 0.05); // 5% defect

    // Marginal Probability of Defect P(B) by Law of Total Probability
    const pB = (pB_given_A1 * pA1) + (pB_given_A2 * pA2);

    // Posterior Probabilities via Bayes' Theorem
    const pA1_given_B = pB > 0 ? (pB_given_A1 * pA1) / pB : 0;
    const pA2_given_B = pB > 0 ? (pB_given_A2 * pA2) / pB : 0;

    // Update Slider text displays
    if (pa1ValSpan) pa1ValSpan.textContent = `${(pA1 * 100).toFixed(0)}%`;
    if (pa2ValSpan) pa2ValSpan.textContent = `${(pA2 * 100).toFixed(0)}%`;
    if (d1ValSpan) d1ValSpan.textContent = `${(pB_given_A1 * 100).toFixed(1)}%`;
    if (d2ValSpan) d2ValSpan.textContent = `${(pB_given_A2 * 100).toFixed(1)}%`;

    // Update Metric Cards
    if (postA1Span) postA1Span.textContent = `${(pA1_given_B * 100).toFixed(1)}%`;
    if (postA2Span) postA2Span.textContent = `${(pA2_given_B * 100).toFixed(1)}%`;
    if (totalDefectSpan) totalDefectSpan.textContent = `${(pB * 100).toFixed(2)}%`;

    // Dynamic LaTeX / Formula Breakdown
    if (formulaBreakdown) {
      formulaBreakdown.innerHTML = `
        <div style="font-size: 0.86rem; line-height: 1.65; text-align: left;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem;">
            <span style="font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.35rem;">
              <span>⚡</span> Live Parameter Evaluation
            </span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">
              A₁ = ${(pA1 * 100).toFixed(0)}% | A₂ = ${(pA2 * 100).toFixed(0)}%
            </span>
          </div>

          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.6rem 0.75rem; margin-bottom: 0.5rem;">
            <div style="font-size: 0.76rem; font-weight: 600; color: #0284c7; margin-bottom: 0.2rem;">
              Total Defect Rate P(B) via Law of Total Probability:
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">
              P(B) = (${pB_given_A1.toFixed(3)} × ${pA1.toFixed(2)}) + (${pB_given_A2.toFixed(3)} × ${pA2.toFixed(2)})
                   = ${(pB_given_A1 * pA1).toFixed(4)} + ${(pB_given_A2 * pA2).toFixed(4)}
                   = <strong style="color: #0284c7;">${(pB * 100).toFixed(2)}%</strong>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.6rem 0.75rem;">
              <div style="font-size: 0.76rem; font-weight: 600; color: var(--accent-primary); margin-bottom: 0.2rem;">
                Posterior P(Supplier 1 | Defect):
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.84rem; color: var(--text-primary);">
                P(A₁ | B) = ${(pB_given_A1 * pA1).toFixed(4)} / ${pB.toFixed(4)} = <strong style="color: var(--accent-primary); font-size: 0.95rem;">${(pA1_given_B * 100).toFixed(1)}%</strong>
              </div>
            </div>

            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.6rem 0.75rem;">
              <div style="font-size: 0.76rem; font-weight: 600; color: var(--accent-rose); margin-bottom: 0.2rem;">
                Posterior P(Supplier 2 | Defect):
              </div>
              <div style="font-family: var(--font-mono); font-size: 0.84rem; color: var(--text-primary);">
                P(A₂ | B) = ${(pB_given_A2 * pA2).toFixed(4)} / ${pB.toFixed(4)} = <strong style="color: var(--accent-rose); font-size: 0.95rem;">${(pA2_given_B * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    drawTree(pA1, pA2, pB_given_A1, pB_given_A2, pA1_given_B, pA2_given_B);
  }

  function drawTree(pA1, pA2, d1, d2, post1, post2) {
    const canvas = document.getElementById('bayes-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = 260;

    const w = canvas.width;
    const h = canvas.height;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axisLabel: '#475569', textPrimary: '#0f172a', cardBg: '#ffffff' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const rootX = 60, rootY = h / 2;
    const s1X = w * 0.4, s1Y = h * 0.28;
    const s2X = w * 0.4, s2Y = h * 0.72;

    const def1X = w * 0.82, def1Y = h * 0.16;
    const good1X = w * 0.82, good1Y = h * 0.40;
    const def2X = w * 0.82, def2Y = h * 0.60;
    const good2X = w * 0.82, good2Y = h * 0.84;

    ctx.lineWidth = 2;

    // Branches from Root
    drawBranch(ctx, rootX, rootY, s1X, s1Y, '#3b82f6', `Supplier 1: ${(pA1*100).toFixed(0)}%`, pal);
    drawBranch(ctx, rootX, rootY, s2X, s2Y, '#8b5cf6', `Supplier 2: ${(pA2*100).toFixed(0)}%`, pal);

    // Branches from Supplier 1
    drawBranch(ctx, s1X, s1Y, def1X, def1Y, '#f43f5e', `Defect: ${(d1*100).toFixed(1)}%`, pal);
    drawBranch(ctx, s1X, s1Y, good1X, good1Y, '#10b981', `Good: ${((1-d1)*100).toFixed(1)}%`, pal);

    // Branches from Supplier 2
    drawBranch(ctx, s2X, s2Y, def2X, def2Y, '#f43f5e', `Defect: ${(d2*100).toFixed(1)}%`, pal);
    drawBranch(ctx, s2X, s2Y, good2X, good2Y, '#10b981', `Good: ${((1-d2)*100).toFixed(1)}%`, pal);

    // Root node
    drawNode(ctx, rootX, rootY, pal.isDark ? '#fff' : '#0f172a', 'Source', pal);
    drawNode(ctx, s1X, s1Y, '#3b82f6', 'A₁ (65%)', pal);
    drawNode(ctx, s2X, s2Y, '#8b5cf6', 'A₂ (35%)', pal);

    drawNode(ctx, def1X, def1Y, '#f43f5e', `Bad → Post: ${(post1*100).toFixed(1)}%`, pal);
    drawNode(ctx, good1X, good1Y, '#10b981', `Good: ${(pA1*(1-d1)*100).toFixed(1)}%`, pal);
    drawNode(ctx, def2X, def2Y, '#f43f5e', `Bad → Post: ${(post2*100).toFixed(1)}%`, pal);
    drawNode(ctx, good2X, good2Y, '#10b981', `Good: ${(pA2*(1-d2)*100).toFixed(1)}%`, pal);
  }

  function drawBranch(ctx, x1, y1, x2, y2, color, label, pal) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = pal ? pal.axisLabel : '#64748b';
    ctx.fillText(label, (x1 + x2) / 2 - 25, (y1 + y2) / 2 - 6);
  }

  function drawNode(ctx, x, y, color, text, pal) {
    ctx.fillStyle = pal ? (pal.isDark ? '#0f1523' : '#ffffff') : '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = pal ? pal.textPrimary : '#0f172a';
    ctx.fillText(text, x + 10, y + 4);
  }

  // Listeners
  [pA1Slider, d1Slider, d2Slider].forEach(s => {
    if (s) s.addEventListener('input', update);
  });

  window.addEventListener('resize', update);
  window.addEventListener('themeChanged', update);
  setTimeout(update, 50);
}

document.addEventListener('DOMContentLoaded', initBayesLab);
