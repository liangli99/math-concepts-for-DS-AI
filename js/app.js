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

// Render the Cross-Domain Synthesis Knowledge Matrix
function renderSynthesisMatrix() {
  const tableBody = document.getElementById('synthesis-table-body');
  if (!tableBody || typeof SYNTHESIS_DATA === 'undefined') return;

  tableBody.innerHTML = SYNTHESIS_DATA.map(item => `
    <tr data-category="${item.aiCategory}">
      <td>
        <div style="display: inline-block; font-size: 0.72rem; font-weight: 700; color: var(--accent-primary); background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 4px; padding: 2px 7px; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 5px;">${item.module}</div>
        <div><strong style="color: var(--text-primary); font-size: 0.95rem;">${item.area}</strong></div>
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${item.aiCategory}</div>
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
}

// Render Academic & Industry References
function renderReferences() {
  const refGrid = document.getElementById('references-grid');
  if (!refGrid || typeof ACADEMIC_REFERENCES === 'undefined') return;

  refGrid.innerHTML = ACADEMIC_REFERENCES.map(ref => `
    <a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="ref-item">
      <div class="ref-source">${ref.author} · <span style="color: var(--text-muted); font-weight: normal;">${ref.tag}</span></div>
      <div class="ref-title">${ref.title} ↗</div>
    </a>
  `).join('');
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
      ignoredClasses: ['canvas-container', 'range-slider', 'control-value', 'metric-val'],
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'option', 'input', 'select'],
      throwOnError: false
    });
  }
}
