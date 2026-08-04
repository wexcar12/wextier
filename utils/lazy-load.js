/**
 * @module utils/lazy-load
 * @description Ленивая загрузка внешних скриптов по требованию (Ф6-3). Тяжёлые
 * библиотеки (html2canvas и т.п.) не тянутся при старте страницы, а подгружаются
 * только в момент первого использования. Промис на каждый URL кэшируется, чтобы
 * параллельные вызовы не вставляли тег дважды.
 */

const _cache = new Map();

/**
 * Загружает внешний скрипт по URL. Возвращает промис, который резолвится после
 * успешной загрузки (или сразу, если скрипт уже был загружен ранее).
 * @param {string} url
 * @returns {Promise<void>}
 */
export function loadScript(url) {
  if (_cache.has(url)) return _cache.get(url);

  const p = new Promise((resolve, reject) => {
    // Скрипт мог быть уже добавлен в разметку (например, как fallback) — не дублируем.
    const existing = document.querySelector('script[data-lazy-src="' + CSS.escape(url) + '"]');
    if (existing && existing.dataset.loaded === '1') { resolve(); return; }

    const s = document.createElement('script');
    s.src = url;
    s.async = true;
    s.dataset.lazySrc = url;
    s.onload = () => { s.dataset.loaded = '1'; resolve(); };
    s.onerror = () => { _cache.delete(url); reject(new Error('Не удалось загрузить ' + url)); };
    document.head.appendChild(s);
  });

  _cache.set(url, p);
  return p;
}
