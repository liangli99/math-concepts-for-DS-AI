/**
 * MathCore DS & AI — Main Application Controller & Dynamic UI
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderSynthesisMatrix();
  renderReferences();
  initNavigation();
  initSearch();
  initKaTeX();
});

// Theme Management (Light Mode by Default as Requested, with Dark Mode Option)
function initTheme() {
  const savedTheme = localStorage.getItem('math_theme') || 'light';
  setTheme(savedTheme);

  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const nextTheme = isDark ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  }
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('math_theme', theme);

  const iconEl = document.getElementById('theme-toggle-icon');
  const textEl = document.getElementById('theme-toggle-text');
  if (iconEl && textEl) {
    if (theme === 'dark') {
      iconEl.textContent = '☀️';
      textEl.textContent = 'Light Mode';
    } else {
      iconEl.textContent = '🌙';
      textEl.textContent = 'Dark Mode';
    }
  }

  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

window.isDarkTheme = function() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
};

window.getCanvasPalette = function() {
  const isDark = window.isDarkTheme();
  return {
    isDark,
    bg: isDark ? '#080c16' : '#ffffff',
    bgCard: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
    axis: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    axisLabel: isDark ? '#94a3b8' : '#475569',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.12)'
  };
};

// Render the Cross-Domain Synthesis Knowledge Matrix with Live Filters & Search
function renderSynthesisMatrix() {
  const tableBody = document.getElementById('synthesis-table-body');
  if (!tableBody || typeof SYNTHESIS_DATA === 'undefined') return;

  tableBody.innerHTML = SYNTHESIS_DATA.map(item => `
    <tr data-category="${item.aiCategory}" data-module="${item.module}" data-search="${(item.module + ' ' + item.area + ' ' + item.coreIdea + ' ' + item.exampleTechnique + ' ' + item.applications).toLowerCase()}">
      <td>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
          <span style="font-size: 0.72rem; font-weight: 700; color: var(--accent-primary); background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 4px; padding: 2px 7px; text-transform: uppercase; letter-spacing: 0.04em;">${item.module}</span>
          <span style="font-size: 0.70rem; color: var(--text-muted); font-weight: 600;">${item.complexity}</span>
        </div>
        <div><strong style="color: var(--text-primary); font-size: 0.95rem;">${item.area}</strong></div>
        <div style="font-size: 0.74rem; color: var(--text-muted); margin: 4px 0 6px 0;">${item.aiCategory}</div>
        <a href="#${item.targetSectionId}" class="matrix-jump-btn">Go to Lab ↗</a>
      </td>
      <td>
        <div style="font-size: 0.86rem; line-height: 1.5; color: var(--text-secondary); margin-bottom: 6px;">${item.coreIdea}</div>
        <div class="matrix-formula-block" style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-cyan); background: var(--formula-bg); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--formula-border); line-height: 1.6; overflow-x: auto;">
          $$${item.formula}$$
        </div>
      </td>
      <td>
        <span class="matrix-tech-badge">${item.exampleTechnique}</span>
      </td>
      <td style="font-size: 0.85rem; line-height: 1.55; color: var(--text-secondary);">
        ${item.applications}
      </td>
    </tr>
  `).join('');

  // Setup Matrix Toolbar Interactions
  initMatrixToolbar();
}

function initMatrixToolbar() {
  const pills = document.querySelectorAll('#matrix-filter-pills .filter-pill');
  const searchInput = document.getElementById('matrix-search-input');
  const rows = document.querySelectorAll('#synthesis-table-body tr');

  let currentCategory = 'all';
  let currentSearch = '';

  function applyFilters() {
    rows.forEach(row => {
      const rowCat = row.getAttribute('data-category') || '';
      const rowSearch = row.getAttribute('data-search') || '';

      const matchCat = (currentCategory === 'all') || rowCat.toLowerCase().includes(currentCategory.toLowerCase());
      const matchSearch = (!currentSearch) || rowSearch.includes(currentSearch);

      if (matchCat && matchSearch) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category') || 'all';
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }
}

// Render Academic & Industry References with Category Tabs & Rich Cards
function renderReferences() {
  const refGrid = document.getElementById('references-grid');
  if (!refGrid || typeof ACADEMIC_REFERENCES === 'undefined') return;

  // Update Tab Counts
  const countAll = document.getElementById('ref-count-all');
  const countTextbook = document.getElementById('ref-count-textbook');
  const countVideo = document.getElementById('ref-count-video');
  const countPrimer = document.getElementById('ref-count-primer');

  if (countAll) countAll.textContent = ACADEMIC_REFERENCES.length;
  if (countTextbook) countTextbook.textContent = ACADEMIC_REFERENCES.filter(r => r.category === 'textbook').length;
  if (countVideo) countVideo.textContent = ACADEMIC_REFERENCES.filter(r => r.category === 'video').length;
  if (countPrimer) countPrimer.textContent = ACADEMIC_REFERENCES.filter(r => r.category === 'primer').length;

  refGrid.innerHTML = ACADEMIC_REFERENCES.map(ref => `
    <a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="ref-item" data-category="${ref.category}" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span class="ref-category-badge ${ref.category}">${ref.categoryName}</span>
          <span class="ref-module-tag">${ref.modules}</span>
        </div>
        <div class="ref-title">${ref.title} ↗</div>
        <div class="ref-source" style="margin-top: 0.25rem;">${ref.author}</div>
        <div class="ref-institution">${ref.institution} · ${ref.publisher} (${ref.year})</div>
      </div>
      <div class="ref-topics">
        ${ref.topics.map(t => `<span class="ref-topic-pill">${t}</span>`).join('')}
      </div>
    </a>
  `).join('');

  // Setup Category Tabs
  const tabBtns = document.querySelectorAll('#ref-tab-strip .ref-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedCat = btn.getAttribute('data-category');
      const items = refGrid.querySelectorAll('.ref-item');

      items.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (selectedCat === 'all' || itemCat === selectedCat) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

// Sidebar Navigation and Scrollspy
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.module-section, #overview, #synthesis, #references');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          navItems.forEach(n => n.classList.remove('active'));
          item.classList.add('active');
        }
      }
    });
  });

  // Scrollspy observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(sec => observer.observe(sec));

  // Mobile navigation drawer toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// Global Instant Search / Filter
function initSearch() {
  const searchInput = document.getElementById('global-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const sections = document.querySelectorAll('.module-section');
    const tableRows = document.querySelectorAll('#synthesis-table-body tr');

    // Filter module sections
    sections.forEach(sec => {
      const text = sec.innerText.toLowerCase();
      if (query === '' || text.includes(query)) {
        sec.style.display = 'block';
      } else {
        sec.style.display = 'none';
      }
    });

    // Filter synthesis matrix rows
    tableRows.forEach(row => {
      const text = row.innerText.toLowerCase();
      if (query === '' || text.includes(query)) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
}

// Render KaTeX Math Expressions
function initKaTeX() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      ignoredClasses: ['canvas-container', 'range-slider', 'control-value', 'metric-val', 'currency', 'katex-ignore', 'pmc-metric-sub', 'pmc-percentiles-chips', 'pmc-percentiles-legend'],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option', 'input', 'select', 'button'],
      throwOnError: false
    });
  }
}
