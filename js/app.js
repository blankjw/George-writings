// George Gondron Writings Archive

let allEssays = [];

document.addEventListener('DOMContentLoaded', () => {
  loadEssays();
  initTheme();
});

async function loadEssays() {
  try {
    const res = await fetch('essays.json');
    allEssays = await res.json();
    renderList(allEssays);
    initSearch();
    initRandom();
  } catch (e) {
    document.getElementById('writings-list').innerHTML =
      '<p style="padding:2rem 0;color:#999;">Could not load writings. Please refresh.</p>';
  }
}

function renderList(essays) {
  const list = document.getElementById('writings-list');
  if (!list) return;
  list.innerHTML = '';

  essays.forEach((essay, i) => {
    const row = document.createElement('a');
    row.className = 'writing-row';
    row.href = 'essays/' + essay.slug + '.html';

    const typeLabel = (essay.type || 'essay').toUpperCase();

    row.innerHTML = `
      <div class="writing-num">${String(i + 1).padStart(2, '0')}</div>
      <div class="writing-body">
        <span class="writing-type">${typeLabel}</span>
        <span class="writing-title">${essay.title}</span>
      </div>
    `;
    list.appendChild(row);
  });
}

function initSearch() {
  const box = document.getElementById('search-box');
  if (!box) return;
  box.addEventListener('input', () => {
    const q = box.value.toLowerCase().trim();
    const filtered = !q ? allEssays : allEssays.filter(e =>
      (e.title || '').toLowerCase().includes(q) ||
      (e.type || '').toLowerCase().includes(q)
    );
    renderList(filtered);
    if (filtered.length === 0) {
      document.getElementById('writings-list').innerHTML =
        '<p style="padding:2rem 0;color:#999;font-style:italic;">Nothing found.</p>';
    }
  });
}

function initRandom() {
  const btn = document.getElementById('random-btn');
  if (!btn || !allEssays.length) return;
  btn.addEventListener('click', () => {
    const pick = allEssays[Math.floor(Math.random() * allEssays.length)];
    window.location.href = 'essays/' + pick.slug + '.html';
  });
}

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
