/**
 * @module ui/achievements
 * @description Система достижений. ФИКС 18: список расширен, добавлен счётчик прогресса.
 */
import { state } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';
import { modalManager } from './modal-manager.js';

const ACH = [
  { id: 'first_edit', icon: 'trophy', name: 'Первый среди всех', desc: 'Внести первое изменение' },
  { id: 'twenty_tracks', icon: 'music', name: 'Чистый звук', desc: 'Добавить 20+ треков' },
  { id: 'shared', icon: 'upload', name: 'У тебя нет друзей', desc: 'Использовать кнопку «Поделиться»' },
  { id: 'rainbow', icon: 'palette', name: 'Радужный', desc: 'Все тиры разных цветов' },
  { id: 'five_s', icon: 'flame', name: 'Нужно больше', desc: '5 треков в S-тире' },
  { id: 'all_empty', icon: 'skull', name: 'Бесконечная Пустота', desc: 'Все тиры пустые' },
  { id: 'first_publish', icon: 'globe', name: 'Публичная персона', desc: 'Опубликовать тир-лист в галерее' },
  { id: 'commented', icon: 'message-circle', name: 'Есть мнение', desc: 'Оставить комментарий' },
  { id: 'duel_participant', icon: 'swords', name: 'На арену!', desc: 'Поучаствовать в дуэли тир-листов' },
  { id: 'liked_list', icon: 'heart', name: 'Доброе сердце', desc: 'Поставить лайк чужому тир-листу' },
  { id: 'randomizer_used', icon: 'shuffle', name: 'Доверяю судьбе', desc: 'Использовать случайную раскладку' },
  { id: 'ten_tiers', icon: 'layers', name: 'Архитектор', desc: 'Создать 10 и более тиров' },
  { id: 'night_owl', icon: 'moon-star', name: 'Полуночник', desc: 'Редактировать тир-лист после полуночи' }
];

const P = 'wt_';
let unlocked = [];

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

export function loadAchievements() {
  unlocked = sg('achievements', []);
}

// Достижения за конкретные действия (публикация, лайк, комментарий и т.п.) —
// вызывается напрямую из соответствующих модулей, без опроса состояния.
export function unlockAchievement(id) {
  if (unlocked.includes(id)) return;
  unlocked.push(id);
  const a = ACH.find(x => x.id === id);
  eventBus.emit('toast:show', { text: '🏆 Достижение: ' + (a ? a.name : id), type: 'success' });
  ss('achievements', unlocked);
}

export function checkAchievements(editing) {
  const data = state.data1;
  const total = data.reduce((s, t) => s + t.items.length, 0);
  const sT = data.find(t => t.tier === 'S');
  const allEmpty = data.every(t => t.items.length === 0);
  const colors = data.map(t => t.color);
  const allDifferent = new Set(colors).size === data.length && data.length > 1;
  const firstEdit = sg('first_edit_done', false);
  const hour = new Date().getHours();

  const checks = {
    first_edit: firstEdit || editing,
    twenty_tracks: total >= 20,
    rainbow: allDifferent,
    five_s: sT && sT.items.length >= 5,
    all_empty: allEmpty,
    ten_tiers: data.length >= 10,
    night_owl: editing && (hour >= 0 && hour < 5)
  };

  for (const id in checks) {
    if (checks[id]) unlockAchievement(id);
  }

  if (!firstEdit && editing) ss('first_edit_done', true);
}

export function openAchievementsModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Достижения</h3>
    <div id="achProgress" style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:12px;"></div>
    <div id="achievementsList"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeAchievements">Закрыть</button>
    </div>
  `;

  const close = modalManager.open(content);

  content.querySelector('#achProgress').textContent = 'Открыто ' + unlocked.length + ' из ' + ACH.length;

  const list = content.querySelector('#achievementsList');
  list.innerHTML = ACH.map(a => {
    const u = unlocked.includes(a.id);
    return '<div style="padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;opacity:' + (u ? '1' : '0.4') + ';display:flex;align-items:center;gap:10px;">' +
      '<i data-lucide="' + (u ? a.icon : 'lock') + '"></i>' +
      '<div><strong>' + (u ? a.name : '???') + '</strong><br><small>' + (u ? a.desc : 'Ещё не открыто') + '</small></div>' +
      '</div>';
  }).join('');

  content.querySelector('#closeAchievements').onclick = close;
  lucide.createIcons();
}

eventBus.on('achievements:check', () => {
  checkAchievements(true);
});
