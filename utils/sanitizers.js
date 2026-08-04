/**
 * @module utils/sanitizers
 * @description Защита от XSS-атак и очистка данных.
 */

export function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

export function escapeAttr(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag]||tag));
}

// Для src/href: разрешает только https?://, data:image/, blob:
export function safeUrl(str) {
  if (typeof str !== 'string' || str === '') return '';
  if (!/^(https?:\/\/|data:image\/|blob:)/i.test(str)) return '';
  return escapeAttr(str);
}

// Для href-ссылок: блокирует javascript:, разрешает всё остальное
export function safeHref(str) {
  if (typeof str !== 'string' || str === '') return '#';
  if (/^javascript:/i.test(str)) return '#';
  return escapeAttr(str);
}
