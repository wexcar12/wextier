/**
 * @module ui/search
 * @description Единый поиск по элементам тир-листа и шаблонному пулу.
 */
import { translit } from '../utils/translit.js';

let debounceTimer = null;

export function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(filterAll, 200);
    });
  }
}

function filterAll() {
  const q = (document.getElementById('searchInput')?.value || '').trim().toLowerCase();
  const qTranslit = q ? translit(q) : '';

  let tierVisible = 0;
  document.querySelectorAll('.tier-items .item, .compare-wrap .item').forEach(el => {
    if (el.closest('#templatePool')) return;
    const tooltip = (el.getAttribute('data-tooltip') || '').toLowerCase();
    const match = !q || tooltip.includes(q) || (qTranslit !== q && tooltip.includes(qTranslit));
    el.classList.toggle('search-hidden', !match);
    if (match) tierVisible++;
  });

  document.querySelectorAll('#templatePool .item').forEach(el => {
    const title = (el.dataset.tooltip || '').toLowerCase();
    const matches = !q || title.includes(q) || (qTranslit !== q && title.includes(qTranslit));
    el.classList.toggle('search-hidden', !matches);
  });

  const container = document.querySelector('.compare-wrap');
  let msg = document.getElementById('search-empty-msg');
  if (q && tierVisible === 0) {
    if (!msg && container) {
      msg = document.createElement('div');
      msg.id = 'search-empty-msg';
      msg.textContent = 'Ничего не найдено';
      msg.style.cssText = 'text-align:center;padding:20px;color:var(--text-secondary);';
      container.appendChild(msg);
    }
  } else if (msg) {
    msg.remove();
  }
}
