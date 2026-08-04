/**
 * @module ui/onboarding
 * @description Ф7-2. Онбординг для новых пользователей: при самом первом визите
 * подгружаем готовый демо-лист (несколько карточек уже разложены по тирам), чтобы
 * сразу было видно, что делает приложение и куда тащить. Плюс слим-подсказка сверху.
 *
 * Срабатывает строго один раз (флаг wt_onboarded) и только на чистом старте:
 * ни сохранённых черновиков, ни шаренного тир-листа по URL — иначе ничего не трогаем.
 */
import { state } from '../core/state.js';
import { sg, ss } from '../utils/storage.js';
import { eventBus } from '../core/event-bus.js';
import { pImg } from '../utils/placeholder.js';

// Демо-элементы используют SVG-плейсхолдеры (pImg) — грузятся мгновенно и офлайн,
// без обращений к сети. Форма item совпадает с реальной: id/img/url/svc/title.
function demoItem(title, svc) {
  return { id: crypto.randomUUID(), img: pImg(svc), url: '#', svc, title };
}

function demoData() {
  return [
    { tier: 'S', label: 'S', color: '#ff7f7f', items: [demoItem('Любимое', 'imdb'), demoItem('Шедевр', 'steam')] },
    { tier: 'A', label: 'A', color: '#ffbf7f', items: [demoItem('Отличное', 'youtube')] },
    { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
    { tier: 'C', label: 'C', color: '#bfff7f', items: [] },
  ];
}

// Слим-подсказка над списком. Закрывается крестиком или сама при первом
// перетаскивании карточки (render:after эмитится после каждого рендера доски).
function showHint() {
  const main = document.getElementById('mainContent');
  const meta = document.getElementById('tierlistMeta');
  if (!main || document.getElementById('onboardingHint')) return;

  const hint = document.createElement('div');
  hint.id = 'onboardingHint';
  hint.className = 'onboarding-hint';
  hint.innerHTML =
    '<span>👋 Это демо. Перетаскивай карточки между тирами, меняй шаблон вверху и публикуй свой тир-лист.</span>' +
    '<button type="button" class="onboarding-hint-close" aria-label="Скрыть подсказку">✕</button>';

  main.insertBefore(hint, meta || main.firstChild);

  const close = () => { if (hint.parentNode) hint.parentNode.removeChild(hint); };
  hint.querySelector('.onboarding-hint-close').addEventListener('click', close);
}

export function maybeShowOnboarding(urlLoaded = false) {
  // Уже показывали — выходим.
  if (sg('onboarded', false)) return;

  // Шаренный тир-лист по ссылке уже загружен в state (loadFromURL к этому моменту
  // очистил query-параметры через replaceState, поэтому полагаемся на флаг, а не
  // на location.search). Не мешаем — просто помечаем визит как состоявшийся.
  if (urlLoaded) { ss('onboarded', true); return; }

  // Есть сохранённые черновики — пользователь не новый (loadDrafts только читает,
  // так что до первого сохранения ключа wt_drafts не существует).
  if (sg('drafts', null) !== null) { ss('onboarded', true); return; }

  // Чистый старт: заливаем демо в текущий лист и показываем подсказку.
  state.setData(demoData(), 1);
  ss('onboarded', true);
  eventBus.emit('analytics:event', 'onboarding_shown');
  eventBus.emit('analytics:event', 'demo_loaded');
  showHint();
}
