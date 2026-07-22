/**
 * @module ui/search
 * @description Единый поиск по элементам тир-листа и шаблонному пулу.
 */

const TRANSLIT_MAP = {
  'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i',
  'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
  'у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y',
  'ь':'','э':'e','ю':'yu','я':'ya'
};

function translit(str) {
  return str.split('').map(ch => TRANSLIT_MAP[ch] !== undefined ? TRANSLIT_MAP[ch] : ch).join('');
}

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

  const container = document.querySelector('.compare-wrap') || document.querySelector('.tier-list');
  let msg = document.getElementById('search-empty-msg');
  if (q && tierVisible === 0) {
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
