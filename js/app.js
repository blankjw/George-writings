// George Gondron Writings Archive

let allEssays = [];
let activeFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();   // always first — avoids flash of wrong theme
  loadEssays();
  loadBlog();
  initSearch();
  initPills();
});

// ─── Load & Render Writings ───────────────────────────────────
async function loadEssays() {
  try {
    const res = await fetch('essays.json');
    allEssays = await res.json();
    updateCounts(allEssays);
    renderAccordion(allEssays);
    initRandom();
  } catch (e) {
    const el = document.getElementById('writings-accordion');
    if (el) el.innerHTML =
      '<p style="padding:2rem;color:#999;">Could not load writings. Please refresh.</p>';
  }
}

function updateCounts(essays) {
  const counts = { all: essays.length, essay: 0, poem: 0, haiku: 0 };
  essays.forEach(e => {
    const t = (e.type || 'essay').toLowerCase();
    if (counts[t] !== undefined) counts[t]++;
  });
  const el = (id) => document.getElementById(id);
  if (el('count-all'))   el('count-all').textContent   = counts.all;
  if (el('count-essay')) el('count-essay').textContent = counts.essay;
  if (el('count-poem'))  el('count-poem').textContent  = counts.poem;
  if (el('count-haiku')) el('count-haiku').textContent = counts.haiku;
}

function getFiltered(query) {
  return allEssays.filter(e => {
    const matchType = activeFilter === 'all' ||
      (e.type || 'essay').toLowerCase() === activeFilter;
    const matchSearch = !query ||
      (e.title || '').toLowerCase().includes(query);
    return matchType && matchSearch;
  });
}

function renderAccordion(essays) {
  const container = document.getElementById('writings-accordion');
  if (!container) return;

  // Split haikus from text writings — haikus render as image grid, never in accordion
  const haikus = essays.filter(e => (e.type || 'essay').toLowerCase() === 'haiku');
  const textItems = essays.filter(e => (e.type || 'essay').toLowerCase() !== 'haiku');

  container.innerHTML = '';

  // ── Haiku image grid (shown above accordion when haikus are in results) ──
  if (haikus.length > 0) {
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1rem;margin-bottom:2rem;';
    haikus.forEach(essay => {
      const card = document.createElement('div');
      card.style.cssText = 'cursor:pointer;border-radius:4px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.12);transition:transform .25s,box-shadow .25s;';
      card.innerHTML = `<img src="${essay.excerpt}" style="width:100%;height:140px;object-fit:cover;display:block;" alt="Haiku" loading="lazy">`;
      card.addEventListener('mouseover', () => { card.style.transform='translateY(-3px)'; card.style.boxShadow='0 6px 20px rgba(0,0,0,.2)'; });
      card.addEventListener('mouseout',  () => { card.style.transform='';               card.style.boxShadow='0 2px 8px rgba(0,0,0,.12)'; });
      card.addEventListener('click', () => viewHaikuFullscreen(essay.excerpt));
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // ── Text writings accordion ──
  if (textItems.length === 0) {
    if (haikus.length === 0) {
      container.innerHTML = '<p style="padding:2rem 0;color:var(--ink-faint);font-style:italic;">Nothing found.</p>';
    }
    return;
  }

  // Group by first letter (skip leading articles)
  const groups = {};
  textItems.forEach(e => {
    let title = (e.title || '').toUpperCase().replace(/^(A |AN |THE )/, '');
    const letter = title[0] || '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(e);
  });

  Object.keys(groups).sort().forEach(letter => {
    const items = groups[letter];
    const section = document.createElement('div');
    section.className = 'accordion-section';

    const toggle = document.createElement('button');
    toggle.className = 'accordion-toggle';
    toggle.innerHTML = `
      <span class="accordion-letter">${letter}</span>
      <span class="accordion-count">${items.length} writing${items.length > 1 ? 's' : ''}</span>
      <span class="accordion-arrow">›</span>
    `;

    const body = document.createElement('div');
    body.className = 'accordion-body';

    items.forEach(essay => {
      const typeLabel = (essay.type || 'essay').toUpperCase();
      const link = document.createElement('a');
      link.className = 'writing-entry';
      link.href = 'essays/' + essay.slug + '.html';
      link.innerHTML = `
        <span class="entry-type">${typeLabel}</span>
        <span class="entry-title">${essay.title}</span>
      `;
      body.appendChild(link);
    });

    toggle.addEventListener('click', () => {
      const isOpen = section.classList.toggle('open');
      const searchBox = document.getElementById('search-box');
      if (isOpen && searchBox && !searchBox.value) {
        document.querySelectorAll('.accordion-section.open').forEach(s => {
          if (s !== section) s.classList.remove('open');
        });
      }
    });

    section.appendChild(toggle);
    section.appendChild(body);
    container.appendChild(section);
  });
}

function viewHaikuFullscreen(imagePath) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    cursor: pointer;
  `;
  
  const img = document.createElement('img');
  img.src = imagePath;
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  `;
  
  modal.appendChild(img);
  modal.addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}

// ─── Search + Filter ──────────────────────────────────────────
function initSearch() {
  const searchBox = document.getElementById('search-box');
  if (!searchBox) return;
  searchBox.addEventListener('input', (e) => {
    const filtered = getFiltered(e.target.value);
    renderAccordion(filtered);
  });
}

function initPills() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      const searchBox = document.getElementById('search-box');
      const query = searchBox ? searchBox.value : '';
      const filtered = getFiltered(query);
      renderAccordion(filtered);
    });
  });
}

// ─── Random Writing ───────────────────────────────────────────
function initRandom() {
  const btn = document.getElementById('random-btn');
  if (!btn || allEssays.length === 0) return;
  btn.addEventListener('click', () => {
    const r = allEssays[Math.floor(Math.random() * allEssays.length)];
    const type = (r.type || 'essay').toLowerCase();
    if (type === 'haiku') {
      viewHaikuFullscreen(r.excerpt);
    } else {
      window.location.href = 'essays/' + r.slug + '.html';
    }
  });
}

// ─── Blog ─────────────────────────────────────────────────────
async function loadBlog() {
  try {
    const res = await fetch('blog.json');
    const posts = await res.json();
    const container = document.getElementById('blog-list');
    if (!container) return;
    container.innerHTML = posts.map(p => `
      <article class="blog-post">
        <time class="blog-date">${p.date}</time>
        <h3 class="blog-title">${p.title}</h3>
        <p class="blog-excerpt">${p.excerpt}</p>
      </article>
    `).join('');
  } catch (e) {
    // Blog section is optional
  }
}

// ─── Theme ────────────────────────────────────────────────────
function initTheme() {
  // Support #theme-btn (main/haiku page) and #theme-toggle (essay pages)
  const themeBtn = document.getElementById('theme-btn') || document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-btn') || document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀ Light' : '☽ Dark';
}
