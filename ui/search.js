/**
 * @module ui/search
 * @description Поиск и фильтры.
 */

let currentFilter = 'all';

export function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
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

  document.querySelectorAll('.item').forEach(el => {
    const a = el.querySelector('a');
    const u = a ? a.href.toLowerCase() : '';
    const sv = el.dataset.svc || '';
    el.style.opacity = ((!q || u.includes(q)) && (currentFilter === 'all' || sv === currentFilter)) ? '1' : '0.25';
  });
}