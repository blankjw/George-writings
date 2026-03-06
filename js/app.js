// George Gondron Writings Archive

let allEssays = [];

document.addEventListener('DOMContentLoaded', () => {
  loadEssays();
  initTheme();
  initSearch();
});

// ─── Load Essays ─────────────────────────────────────────────
async function loadEssays() {
  try {
    const res = await fetch('essays.json');
    allEssays = await res.json();
    renderList(allEssays);
    initRandom();
  } catch (e) {
    console.error('Failed to load essays:', e);
  }
}

function renderList(essays) {
  const list = document.getElementById('writings-list');
  if (!list) return;

  list.innerHTML = '';

  essays.forEach((essay, i) => {
    const row = document.createElement('a');
    row.className = 'writing-row';
    row.href = `essays/${essay.slug}.html`;

    const typeLabel = (essay.category || 'essay').toUpperCase();
    const excerpt = essay.excerpt || (essay.content || '').substring(0, 160);

    row.innerHTML = `
      <div class="writing-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="writing-body">
        <span class="writing-type">${typeLabel}</span>
        <span class="writing-title">${essay.title}</span>
        <p class="writing-excerpt">${excerpt}…</p>
      </div>
    `;

    list.appendChild(row);
  });
}

// ─── Search ───────────────────────────────────────────────────
function initSearch() {
  const box = document.getElementById('search-box');
  if (!box) return;

  box.addEventListener('input', () => {
    const q = box.value.toLowerCase().trim();
    if (!q) { renderList(allEssays); return; }

    const filtered = allEssays.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.excerpt || '').toLowerCase().includes(q) ||
      (e.content || '').toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q)
    );
    renderList(filtered);

    if (filtered.length === 0) {
      document.getElementById('writings-list').innerHTML =
        '<p style="padding: 2rem 0; color: var(--ink-faint); font-style: italic;">No writings found.</p>';
    }
  });
}

// ─── Random ───────────────────────────────────────────────────
function initRandom() {
  const btn = document.getElementById('random-btn');
  if (!btn || allEssays.length === 0) return;

  btn.addEventListener('click', () => {
    const pick = allEssays[Math.floor(Math.random() * allEssays.length)];
    window.location.href = `essays/${pick.slug}.html`;
  });
}

// ─── Dark Mode ────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark');
    btn.textContent = '☀ Light';
  }

  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀ Light' : '☽ Dark';
  });
}
