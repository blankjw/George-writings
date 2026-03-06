// George Gondron Writings Archive - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
  initThemeToggle();
  initSearch();
  initRandomEssay();
});

// Dark Mode Toggle
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check saved preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.classList.toggle('dark-mode', savedTheme === 'dark');
    updateThemeButton(savedTheme === 'dark');
  } else if (prefersDark.matches) {
    document.body.classList.add('dark-mode');
    updateThemeButton(true);
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeButton(isDark);
    });
  }
}

function updateThemeButton(isDark) {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  }
}

// Search Functionality
function initSearch() {
  const searchBox = document.getElementById('search-box');
  const essayCards = document.querySelectorAll('.essay-card');
  
  if (!searchBox) return;
  
  searchBox.addEventListener('input', function(e) {
    const query = e.target.value.toLowerCase();
    
    essayCards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const preview = card.querySelector('.essay-preview').textContent.toLowerCase();
      const type = card.querySelector('.essay-type').textContent.toLowerCase();
      
      const matches = title.includes(query) || 
                     preview.includes(query) || 
                     type.includes(query);
      
      card.style.display = matches ? 'block' : 'none';
    });
    
    // Show "no results" message if needed
    const visibleCount = Array.from(essayCards).filter(c => c.style.display !== 'none').length;
    updateNoResults(visibleCount === 0);
  });
}

function updateNoResults(show) {
  let noResults = document.getElementById('no-results');
  if (show && !noResults) {
    noResults = document.createElement('div');
    noResults.id = 'no-results';
    noResults.textContent = 'No essays found matching your search.';
    noResults.style.cssText = 'text-align: center; padding: 2rem; color: #999; font-style: italic;';
    document.querySelector('.essays-grid').appendChild(noResults);
  } else if (!show && noResults) {
    noResults.remove();
  }
}

// Random Essay Generator
function initRandomEssay() {
  const randomBtn = document.getElementById('random-btn');
  const essayCards = document.querySelectorAll('.essay-card');
  
  if (randomBtn && essayCards.length > 0) {
    randomBtn.addEventListener('click', function() {
      const randomCard = essayCards[Math.floor(Math.random() * essayCards.length)];
      randomCard.click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Share Functions
function shareTwitter(title, url) {
  const text = encodeURIComponent(`"${title}" - ${url}`);
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
}

function shareFacebook(url) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareEmail(title, url) {
  const subject = encodeURIComponent(`Check out: ${title}`);
  const body = encodeURIComponent(`Read this essay:\n\n${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
