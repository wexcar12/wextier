/**
 * @module ui/analytics
 * @description Ф7-3. Минимальная локальная аналитика событий: считает, что реально
 * используется, а что мёртвый груз. Данные копятся в localStorage (wt_analytics),
 * никуда не отправляются — приватно, ноль внешних зависимостей и правил Firestore.
 *
 * Подключение развязано через eventBus: модули шлют `analytics:event` со строкой-
 * именем события, аналитике не нужно импортироваться в каждый модуль.
 *
 * Посмотреть сводку: в консоли `window.__wtAnalytics()`.
 */
import { sg, ss } from '../utils/storage.js';
import { eventBus } from '../core/event-bus.js';

const KEY = 'analytics';

// Белый список событий — мусорные/опечатанные имена не копятся, сводка остаётся читаемой.
const KNOWN_EVENTS = new Set([
  'publish',          // опубликован тир-лист
  'export_png',       // экспорт PNG
  'export_json',      // экспорт JSON
  'import_json',      // импорт JSON
  'share',            // создана ссылка-шеринг
  'template_select',  // сменён шаблон
  'community_open',   // открыты шаблоны сообщества
  'gallery_open',     // открыта галерея
  'compare_toggle',   // включён/выключен режим сравнения
  'like',             // поставлен лайк
  'comment',          // оставлен комментарий
  'draft_new',        // создан черновик
  'reset_tiers',      // сброшены тиры
  'onboarding_shown', // показан онбординг новому пользователю
  'demo_loaded'       // подгружен демо-лист
]);

export function track(event) {
  if (!event || !KNOWN_EVENTS.has(event)) return;
  const counts = sg(KEY, {});
  if (!counts || typeof counts !== 'object') {
    ss(KEY, { [event]: 1 });
    return;
  }
  counts[event] = (counts[event] || 0) + 1;
  ss(KEY, counts);
}

// Сводка для отладки: window.__wtAnalytics() → { publish: 12, ... }
export function getAnalytics() {
  const counts = sg(KEY, {});
  return (counts && typeof counts === 'object') ? counts : {};
}

export function initAnalytics() {
  eventBus.on('analytics:event', (event) => track(event));
  try { window.__wtAnalytics = getAnalytics; } catch (_) {}
}
