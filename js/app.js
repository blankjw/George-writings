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

  if (essays.length === 0) {
    container.innerHTML = '<p style="padding:2rem 0;color:var(--ink-faint);font-style:italic;">Nothing found.</p>';
    return;
  }

  // Group by first letter (skip leading articles)
  const groups = {};
  essays.forEach(e => {
    let title = (e.title || '').toUpperCase();
    // Strip leading "A ", "AN ", "THE "
    title = title.replace(/^(A |AN |THE )/, '');
    const letter = title[0] || '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(e);
  });

  const letters = Object.keys(groups).sort();
  container.innerHTML = '';

  letters.forEach(letter => {
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
      const link = document.createElement('a');
      link.className = 'writing-entry';
      link.href = 'essays/' + essay.slug + '.html';
      const typeLabel = (essay.type || 'essay').toUpperCase();
      link.innerHTML = `
        <span class="entry-type">${typeLabel}</span>
        <span class="entry-title">${essay.title}</span>
      `;
      body.appendChild(link);
    });

    toggle.addEventListener('click', () => {
      const isOpen = section.classList.toggle('open');
      // Close others if search is empty (full browsing mode)
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

// ─── Search ───────────────────────────────────────────────────
function initSearch() {
  const box = document.getElementById('search-box');
  if (!box) return;
  box.addEventListener('input', () => {
    const q = box.value.toLowerCase().trim();
    const filtered = getFiltered(q);

    // In search mode, open all matching groups
    renderAccordion(filtered);
    if (q) {
      document.querySelectorAll('.accordion-section').forEach(s => s.classList.add('open'));
    }
  });
}

// ─── Filter Pills ─────────────────────────────────────────────
function initPills() {
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      const searchBox = document.getElementById('search-box');
      const q = searchBox ? searchBox.value.toLowerCase().trim() : '';
      renderAccordion(getFiltered(q));
    });
  });
}

// ─── Random ───────────────────────────────────────────────────
function initRandom() {
  const btn = document.getElementById('random-btn');
  if (!btn || !allEssays.length) return;
  btn.addEventListener('click', () => {
    const pick = allEssays[Math.floor(Math.random() * allEssays.length)];
    window.location.href = 'essays/' + pick.slug + '.html';
  });
}

// ─── Blog ─────────────────────────────────────────────────────
async function loadBlog() {
  try {
    const res = await fetch('blog.json');
    const posts = await res.json();
    const list = document.getElementById('blog-list');
    if (!list) return;

    list.innerHTML = '';
    posts.forEach(post => {
      const article = document.createElement('article');
      article.className = 'blog-post';
      const dateStr = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      article.innerHTML = `
        <time class="blog-date">${dateStr}</time>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
      `;
      list.appendChild(article);
    });
  } catch (e) {
    // Blog fails silently
  }
}

// ─── Dark Mode ────────────────────────────────────────────────
function initTheme() {
  // Works on both homepage (id="theme-btn") and essay pages (id="theme-toggle")
  const btn = document.getElementById('theme-btn') || document.getElementById('theme-toggle');

  // Apply saved theme immediately (before any button interaction)
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDarkOnLoad = saved === 'dark' || (!saved && prefersDark);
  if (isDarkOnLoad) {
    document.body.classList.add('dark');
  }

  if (!btn) return;

  // Set button label to match current state
  btn.textContent = isDarkOnLoad ? '☀ Light' : '☽ Dark';

  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    btn.textContent = isDark ? '☀ Light' : '☽ Dark';
  });
}
