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

    // Create a grid for haikus, list for others
    const hasHaikus = items.some(e => (e.type || 'essay').toLowerCase() === 'haiku');
    if (hasHaikus) {
      body.style.display = 'grid';
      body.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
      body.style.gap = '1rem';
    }

    items.forEach(essay => {
      const type = (essay.type || 'essay').toLowerCase();
      const typeLabel = type.toUpperCase();
      
      if (type === 'haiku') {
        // Render as image card
        const card = document.createElement('div');
        card.className = 'haiku-card';
        card.style.cursor = 'pointer';
        card.style.borderRadius = '4px';
        card.style.overflow = 'hidden';
        card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        card.style.transition = 'transform 0.3s, box-shadow 0.3s';
        card.innerHTML = `<img src="${essay.excerpt}" style="width:100%;height:150px;object-fit:cover;display:block;" alt="Haiku" loading="lazy">`;
        card.addEventListener('mouseover', () => {
          card.style.transform = 'scale(1.05)';
          card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
        card.addEventListener('mouseout', () => {
          card.style.transform = 'scale(1)';
          card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        });
        // Click to view full-screen
        card.addEventListener('click', () => viewHaikuFullscreen(essay.excerpt));
        body.appendChild(card);
      } else {
        // Render as text link
        const link = document.createElement('a');
        link.className = 'writing-entry';
        link.href = 'essays/' + essay.slug + '.html';
        link.innerHTML = `
          <span class="entry-type">${typeLabel}</span>
          <span class="entry-title">${essay.title}</span>
        `;
        body.appendChild(link);
      }
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
  // Support both #theme-btn (main page) and #theme-toggle (essay pages)
  const themeBtn = document.getElementById('theme-btn') || document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  if (themeBtn) themeBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });
}

function setTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
  // Update whichever button exists on this page
  const btn = document.getElementById('theme-btn') || document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀ Light' : '☽ Dark';
}
