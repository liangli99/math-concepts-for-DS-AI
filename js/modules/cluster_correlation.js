/**
 * MathNexus DS & AI — Module 9: Clustering & Correlation Analysis Lab
 * Bivariate Feature Coordinates (X, Y), Centroids, WCSS, and Simpson's Paradox
 */

function initClusterCorrelationLab() {
  const canvas = document.getElementById('cluster-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const topologySelect = document.getElementById('cluster-topology-select');
  const sepSlider = document.getElementById('cluster-sep-slider');
  const noiseSlider = document.getElementById('cluster-noise-slider');
  const nPointsSlider = document.getElementById('cluster-npoints-slider');

  const sepVal = document.getElementById('cluster-sep-val');
  const noiseVal = document.getElementById('cluster-noise-val');
  const nPointsVal = document.getElementById('cluster-npoints-val');

  const globalCorrSpan = document.getElementById('cluster-global-corr-val');
  const intraCorrSpan = document.getElementById('cluster-intra-corr-val');
  const inertiaSpan = document.getElementById('cluster-inertia-val');
  const statusSpan = document.getElementById('cluster-status-val');

  let clusters = [];
  let allPoints = [];

  const CLUSTER_COLORS = [
    { main: '#38bdf8', glow: 'rgba(56, 189, 248, 0.25)', name: 'Cluster A' },
    { main: '#c084fc', glow: 'rgba(192, 132, 252, 0.25)', name: 'Cluster B' },
    { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)', name: 'Cluster C' }
  ];

  // Pseudo-random generator for reproducible patterns
  let seed = 12345;
  function pseudoRand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280.0;
  }
  function gaussianRand() {
    const u1 = Math.max(1e-6, pseudoRand());
    const u2 = pseudoRand();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }

  function generateData(topology, separation, noise, n) {
    seed = 42;
    clusters = [];
    allPoints = [];

    if (topology === 'simpson') {
      // 3 Clusters: Each has strong positive internal slope, but centers trend downwards!
      const centers = [
        { x: -separation * 0.85, y: separation * 0.75 },
        { x: 0, y: 0 },
        { x: separation * 0.85, y: -separation * 0.75 }
      ];
      const ptsPerCluster = Math.floor(n / 3);

      centers.forEach((c, idx) => {
        const pts = [];
        for (let i = 0; i < ptsPerCluster; i++) {
          const spreadX = (pseudoRand() - 0.5) * 2.2;
          const px = c.x + spreadX;
          // Strong positive slope within cluster
          const py = c.y + 0.85 * spreadX + gaussianRand() * noise * 0.7;
          pts.push({ x: px, y: py, clusterId: idx });
          allPoints.push({ x: px, y: py, clusterId: idx });
        }
        clusters.push({
          id: idx,
          color: CLUSTER_COLORS[idx].main,
          glow: CLUSTER_COLORS[idx].glow,
          name: CLUSTER_COLORS[idx].name,
          center: c,
          points: pts
        });
      });

    } else if (topology === 'twoclusters') {
      // 2 Distinct Customer Segments
      const centers = [
        { x: -separation * 0.75, y: -separation * 0.5 },
        { x: separation * 0.75, y: separation * 0.5 }
      ];
      const ptsPerCluster = Math.floor(n / 2);

      centers.forEach((c, idx) => {
        const pts = [];
        for (let i = 0; i < ptsPerCluster; i++) {
          const spreadX = (pseudoRand() - 0.5) * 2.5;
          const px = c.x + spreadX;
          const py = c.y + 0.6 * spreadX + gaussianRand() * noise * 0.8;
          pts.push({ x: px, y: py, clusterId: idx });
          allPoints.push({ x: px, y: py, clusterId: idx });
        }
        clusters.push({
          id: idx,
          color: CLUSTER_COLORS[idx].main,
          glow: CLUSTER_COLORS[idx].glow,
          name: CLUSTER_COLORS[idx].name,
          center: c,
          points: pts
        });
      });

    } else if (topology === 'gaussian3') {
      // 3 Isotropic clusters
      const centers = [
        { x: -separation * 0.9, y: -separation * 0.5 },
        { x: 0, y: separation * 0.8 },
        { x: separation * 0.9, y: -separation * 0.5 }
      ];
      const ptsPerCluster = Math.floor(n / 3);

      centers.forEach((c, idx) => {
        const pts = [];
        for (let i = 0; i < ptsPerCluster; i++) {
          const px = c.x + gaussianRand() * (noise * 1.1);
          const py = c.y + gaussianRand() * (noise * 1.1);
          pts.push({ x: px, y: py, clusterId: idx });
          allPoints.push({ x: px, y: py, clusterId: idx });
        }
        clusters.push({
          id: idx,
          color: CLUSTER_COLORS[idx].main,
          glow: CLUSTER_COLORS[idx].glow,
          name: CLUSTER_COLORS[idx].name,
          center: c,
          points: pts
        });
      });

    } else {
      // Single continuous bivariate Gaussian with tunable linear correlation
      const pts = [];
      for (let i = 0; i < n; i++) {
        const px = (pseudoRand() - 0.5) * 6;
        const py = 0.75 * px + gaussianRand() * noise * 1.5;
        pts.push({ x: px, y: py, clusterId: 0 });
        allPoints.push({ x: px, y: py, clusterId: 0 });
      }
      clusters.push({
        id: 0,
        color: CLUSTER_COLORS[0].main,
        glow: CLUSTER_COLORS[0].glow,
        name: 'Single Cohort',
        center: { x: 0, y: 0 },
        points: pts
      });
    }

    // Compute empirical centroids and within-cluster OLS line for each cluster
    clusters.forEach(cl => {
      let sumX = 0, sumY = 0;
      cl.points.forEach(p => { sumX += p.x; sumY += p.y; });
      cl.centroid = { x: sumX / cl.points.length, y: sumY / cl.points.length };

      // Compute intra-cluster correlation
      cl.corr = calcPearson(cl.points);

      // Regression line within cluster
      const ols = calcOLS(cl.points);
      cl.slope = ols.slope;
      cl.intercept = ols.intercept;
    });
  }

  function calcPearson(pts) {
    if (!pts || pts.length < 2) return 0;
    let sumX = 0, sumY = 0;
    pts.forEach(p => { sumX += p.x; sumY += p.y; });
    const mx = sumX / pts.length;
    const my = sumY / pts.length;

    let num = 0, denX = 0, denY = 0;
    pts.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    });
    if (denX === 0 || denY === 0) return 0;
    return num / Math.sqrt(denX * denY);
  }

  function calcOLS(pts) {
    if (!pts || pts.length < 2) return { slope: 0, intercept: 0 };
    let sumX = 0, sumY = 0;
    pts.forEach(p => { sumX += p.x; sumY += p.y; });
    const mx = sumX / pts.length;
    const my = sumY / pts.length;

    let num = 0, den = 0;
    pts.forEach(p => {
      num += (p.x - mx) * (p.y - my);
      den += (p.x - mx) * (p.x - mx);
    });
    const slope = den !== 0 ? num / den : 0;
    const intercept = my - slope * mx;
    return { slope, intercept };
  }

  function calculateMetrics() {
    // 1. Global correlation across all pooled points
    const rGlobal = calcPearson(allPoints);
    if (globalCorrSpan) {
      globalCorrSpan.textContent = (rGlobal >= 0 ? '+' : '') + rGlobal.toFixed(3);
      globalCorrSpan.style.color = rGlobal >= 0 ? 'var(--accent-cyan)' : '#f43f5e';
    }

    // 2. Average intra-cluster correlation
    let sumIntra = 0;
    clusters.forEach(cl => { sumIntra += cl.corr; });
    const rIntra = clusters.length > 0 ? sumIntra / clusters.length : 0;
    if (intraCorrSpan) {
      intraCorrSpan.textContent = (rIntra >= 0 ? '+' : '') + rIntra.toFixed(3);
      intraCorrSpan.style.color = rIntra >= 0 ? '#10b981' : '#f43f5e';
    }

    // 3. Cluster Inertia / WCSS
    let wcss = 0;
    clusters.forEach(cl => {
      cl.points.forEach(p => {
        const dx = p.x - cl.centroid.x;
        const dy = p.y - cl.centroid.y;
        wcss += dx * dx + dy * dy;
      });
    });
    if (inertiaSpan) {
      inertiaSpan.textContent = wcss.toFixed(1);
    }

    // 4. Simpson's paradox detection
    if (statusSpan) {
      if (rIntra > 0.4 && rGlobal < -0.15) {
        statusSpan.innerHTML = `<span style="color:#f59e0b; font-weight:700;">⚠ Simpson's Paradox</span><span style="display:block; font-size:0.75rem; color:#f59e0b; opacity:0.9; margin-top:2px;">Local (+) vs Global (-)</span>`;
      } else if (rIntra < -0.4 && rGlobal > 0.15) {
        statusSpan.innerHTML = `<span style="color:#f59e0b; font-weight:700;">⚠ Simpson's Paradox</span><span style="display:block; font-size:0.75rem; color:#f59e0b; opacity:0.9; margin-top:2px;">Local (-) vs Global (+)</span>`;
      } else {
        statusSpan.innerHTML = `<span style="color:#10b981; font-weight:700;">✓ Aligned Trends</span><span style="display:block; font-size:0.75rem; color:#10b981; opacity:0.9; margin-top:2px;">Local & Global Match</span>`;
      }
    }
  }

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = 340;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (ctx.resetTransform) ctx.resetTransform();
    else ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    update();
  }

  function draw() {
    const w = canvas.parentElement.getBoundingClientRect().width;
    const h = 340;
    const pal = window.getCanvasPalette ? window.getCanvasPalette() : { isDark: false, bg: '#ffffff', axis: 'rgba(0,0,0,0.25)', axisLabel: '#475569', grid: 'rgba(0,0,0,0.06)' };

    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, w, h);

    const marginL = 52, marginR = 24, marginT = 38, marginB = 52;
    const plotW = w - marginL - marginR;
    const plotH = h - marginT - marginB;

    const xMin = -5.0, xMax = 5.0;
    const yMin = -5.0, yMax = 5.0;

    function toScreenX(x) { return marginL + ((x - xMin) / (xMax - xMin)) * plotW; }
    function toScreenY(y) { return marginT + plotH - ((y - yMin) / (yMax - yMin)) * plotH; }

    // Subtle background grid
    ctx.strokeStyle = pal.grid;
    ctx.lineWidth = 1;
    for (let g = -4; g <= 4; g += 2) {
      // vertical
      ctx.beginPath();
      ctx.moveTo(toScreenX(g), marginT);
      ctx.lineTo(toScreenX(g), h - marginB);
      ctx.stroke();
      // horizontal
      ctx.beginPath();
      ctx.moveTo(marginL, toScreenY(g));
      ctx.lineTo(w - marginR, toScreenY(g));
      ctx.stroke();
    }

    // Origin cross axes (X=0, Y=0)
    ctx.strokeStyle = pal.axis;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(marginL, toScreenY(0));
    ctx.lineTo(w - marginR, toScreenY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toScreenX(0), marginT);
    ctx.lineTo(toScreenX(0), h - marginB);
    ctx.stroke();

    // Axis tick numbers
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillStyle = pal.axisLabel;
    ctx.textAlign = 'center';
    for (let gx = -4; gx <= 4; gx += 2) {
      ctx.fillText(gx.toString(), toScreenX(gx), h - marginB + 16);
    }
    ctx.textAlign = 'right';
    for (let gy = -4; gy <= 4; gy += 2) {
      if (gy !== 0) ctx.fillText(gy.toString(), marginL - 8, toScreenY(gy) + 4);
    }

    // Standalone Axis Headers - Completely separated from numbers!
    ctx.font = '600 11px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    // X Axis Title: Centered at bottom below tick numbers
    ctx.textAlign = 'center';
    ctx.fillText('Feature X (Dimension 1) →', marginL + plotW / 2, h - 10);

    // Y Axis Title: Placed well above top margin
    ctx.textAlign = 'left';
    ctx.fillText('↑ Feature Y (Dimension 2)', marginL, 20);

    // 1. Draw Global Pooled Regression Line (Dashed Luminous Line)
    const globalOLS = calcOLS(allPoints);
    ctx.save();
    ctx.strokeStyle = 'rgba(241, 245, 249, 0.7)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([7, 6]);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.35)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(toScreenX(xMin), toScreenY(globalOLS.slope * xMin + globalOLS.intercept));
    ctx.lineTo(toScreenX(xMax), toScreenY(globalOLS.slope * xMax + globalOLS.intercept));
    ctx.stroke();
    ctx.restore();

    // 2. Draw Cluster Boundaries, Regression Lines, Points, and Centroids
    clusters.forEach(cl => {
      const cx = toScreenX(cl.centroid.x);
      const cy = toScreenY(cl.centroid.y);

      // A. Draw clean, crisp cluster contour boundary (Airy and sharp)
      if (cl.points.length > 2) {
        ctx.save();
        ctx.translate(cx, cy);
        const theta = Math.atan(-cl.slope);
        ctx.rotate(theta);
        ctx.beginPath();
        const rx = Math.max(30, plotW * 0.13);
        const ry = Math.max(16, plotH * 0.07);
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = cl.color;
        ctx.globalAlpha = 0.07;
        ctx.fill();
        ctx.strokeStyle = cl.color;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
      }

      // B. Intra-cluster regression slope line
      if (cl.points.length > 2) {
        let minX = 999, maxX = -999;
        cl.points.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
        });
        const x1 = Math.max(xMin, minX - 0.45);
        const x2 = Math.min(xMax, maxX + 0.45);

        ctx.save();
        ctx.strokeStyle = cl.color;
        ctx.lineWidth = 2.8;
        ctx.shadowColor = cl.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(toScreenX(x1), toScreenY(cl.slope * x1 + cl.intercept));
        ctx.lineTo(toScreenX(x2), toScreenY(cl.slope * x2 + cl.intercept));
        ctx.stroke();
        ctx.restore();
      }

      // C. Cluster observation points
      cl.points.forEach(p => {
        const px = toScreenX(p.x);
        const py = toScreenY(p.y);
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = cl.color;
        ctx.shadowColor = cl.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#080c16';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      });

      // D. Centroid Diamond Marker (cₖ)
      ctx.save();
      ctx.fillStyle = cl.color;
      ctx.shadowColor = pal.isDark ? '#fff' : 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 9);
      ctx.lineTo(cx + 9, cy);
      ctx.lineTo(cx, cy + 9);
      ctx.lineTo(cx - 9, cy);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner white dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Clean floating centroid label pill (Above centroid)
      const labelText = `c${cl.id + 1}`;
      const badgeW = 24;
      const badgeH = 17;
      const badgeX = cx - badgeW / 2;
      const badgeY = cy - 26;

      ctx.fillStyle = pal.isDark ? 'rgba(8, 12, 22, 0.92)' : 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = cl.color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.stroke();

      ctx.font = '700 10px Inter, sans-serif';
      ctx.fillStyle = pal.isDark ? '#ffffff' : '#0f172a';
      ctx.textAlign = 'center';
      ctx.fillText(labelText, badgeX + badgeW / 2, badgeY + 12);
      ctx.restore();
    });
  }

  function update() {
    const topology = topologySelect ? topologySelect.value : 'simpson';
    const separation = parseFloat(sepSlider ? sepSlider.value : 2.5);
    const noise = parseFloat(noiseSlider ? noiseSlider.value : 0.35);
    const n = parseInt(nPointsSlider ? nPointsSlider.value : 120);

    if (sepVal) sepVal.textContent = separation.toFixed(1);
    if (noiseVal) noiseVal.textContent = noise.toFixed(2);
    if (nPointsVal) nPointsVal.textContent = n.toString();

    generateData(topology, separation, noise, n);
    calculateMetrics();
    draw();
  }

  // Listeners
  if (topologySelect) topologySelect.addEventListener('change', update);
  [sepSlider, noiseSlider, nPointsSlider].forEach(s => {
    if (s) s.addEventListener('input', update);
  });

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      resizeCanvas();
    });
    ro.observe(canvas.parentElement);
  } else {
    window.addEventListener('resize', resizeCanvas);
  }

  window.addEventListener('themeChanged', () => {
    resizeCanvas();
  });

  setTimeout(resizeCanvas, 50);
}

document.addEventListener('DOMContentLoaded', initClusterCorrelationLab);
