/**
 * @module ui/search
 * @description Поиск и фильтры.
 */

let currentFilter = 'all';
let debounceTimer = null;

export function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterItems, 200);
    });
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active-filter'));
      this.classList.add('active-filter');
      currentFilter = this.dataset.filter;
      filterItems();
    });
  });
}

function filterItems() {
  const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
  let visibleCount = 0;

  document.querySelectorAll('.item').forEach(el => {
    const tooltip = (el.getAttribute('data-tooltip') || '').toLowerCase();
    const sv = el.dataset.svc || '';
    const match = (!q || tooltip.includes(q)) && (currentFilter === 'all' || sv === currentFilter);
    el.classList.toggle('search-hidden', !match);
    if (match) visibleCount++;
  });

  const container = document.querySelector('.items-container') || document.querySelector('.tier-list');
  let msg = document.getElementById('search-empty-msg');
  if (visibleCount === 0) {
    if (!msg && container) {
      msg = document.createElement('div');
      msg.id = 'search-empty-msg';
      msg.textContent = 'Ничего не найдено';
      msg.style.cssText = 'text-align:center;padding:20px;color:#888;';
      container.appendChild(msg);
    }
  } else if (msg) {
    msg.remove();
  }
}