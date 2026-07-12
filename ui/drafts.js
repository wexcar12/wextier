/**
 * @module ui/drafts
 * @description Черновики (localStorage).
 */
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';

const P = 'wt_';
let DRAFTS = [];
let ad = 0;

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

function defaultData() {
  return [
    { tier: 'S', label: 'S', color: '#ff7f7f', items: [] },
    { tier: 'A', label: 'A', color: '#ffbf7f', items: [] },
    { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
    { tier: 'C', label: 'C', color: '#bfff7f', items: [] }
  ];
}

export function loadDrafts() {
  const s = sg('drafts', null);
  DRAFTS = (s && Array.isArray(s) && s.length > 0 && s[0].data) ? s : [{ name: 'Основной', data: defaultData() }];
  ad = parseInt(sg('active_draft', '0'), 10);
  if (isNaN(ad) || !DRAFTS[ad]) ad = 0;
  if (!DRAFTS[ad].data) DRAFTS[ad].data = defaultData();
  state.setData(JSON.parse(JSON.stringify(DRAFTS[ad].data)), 1);
}

export function saveDrafts() {
  if (DRAFTS[ad]) DRAFTS[ad].data = JSON.parse(JSON.stringify(state.data1));
  ss('drafts', DRAFTS);
  ss('active_draft', ad);
}

export function renderDraftsSidebar() {
  const list = document.getElementById('draftListSidebar');
  if (!list) return;

  list.innerHTML = '';
  DRAFTS.forEach((d, i) => {
    const div = document.createElement('button');
    div.className = 'sidebar-btn' + (i === ad ? ' primary' : '');
    div.textContent = (i === ad ? '● ' : '') + d.name;
    div.onclick = () => {
      if (i === ad) return;
      saveDrafts();
      ad = i;
      state.setData(JSON.parse(JSON.stringify(DRAFTS[i].data)), 1);
      renderAll();
    };
    list.appendChild(div);
  });
}

export function createNewDraft() {
  const name = prompt('Название:', 'Черновик ' + (DRAFTS.length + 1));
  if (name && name.trim()) {
    DRAFTS.push({ name: name.trim(), data: defaultData() });
    ad = DRAFTS.length - 1;
    state.setData(JSON.parse(JSON.stringify(DRAFTS[ad].data)), 1);
    saveDrafts();
    renderAll();
  }
}

export function clearAllData() {
  Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => {
    try { localStorage.removeItem(k); } catch (e) {}
  });
  DRAFTS = [{ name: 'Основной', data: defaultData() }];
  ad = 0;
  state.setData(JSON.parse(JSON.stringify(DRAFTS[0].data)), 1);
  saveDrafts();
}

// Автосохранение при изменении состояния
// ФИКС 8: эмитим события для индикатора "Сохранено ✓" в сайдбаре
eventBus.on('state:needsSave', () => {
  eventBus.emit('save:start');
  saveDrafts();
  eventBus.emit('save:done');
});