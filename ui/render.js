/**
 * @module ui/render
 * @description Рендер тир-листов.
 */
import { state, MoveItemCommand, RemoveItemCommand } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { attachPosterFallback } from './templates.js';

const SVG_X = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const SVG_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const SVG_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

const tierCache = new Map();

// Баннер "ты смотришь чужой тир-лист" — показывается, когда открыли список другого
// автора (из галереи/топа), скрывается при работе со своим черновиком.
export function showForeignBanner() {
  document.getElementById('foreignBanner')?.classList.remove('hidden');
}
export function hideForeignBanner() {
  document.getElementById('foreignBanner')?.classList.add('hidden');
}

export function isEditing() { return state.ui.editing; }
export function isCompare() { return state.ui.compare; }
export function setCompare(val) { state.setUI('compare', val); }
export function getActiveTier() { return state.ui.activeTier; }
export function getActiveList() { return state.ui.activeList; }
export function setActiveTier(t, l) { state.setUI('activeTier', t); state.setUI('activeList', l); }


// ГОРЯЧИЕ КЛАВИШИ: какая карточка сейчас выделена кликом (ключ = "тир-индекс-список")
let selectedItemKey = null;

export function getSelectedItem() {
  if (!selectedItemKey) return null;
  const [tierIndex, itemIndex, listNum] = selectedItemKey.split('-').map(Number);
  return { tierIndex, itemIndex, listNum };
}
export function clearSelectedItem() {
  selectedItemKey = null;
  document.querySelectorAll('.item.selected').forEach(el => el.classList.remove('selected'));
}
export function setSelectedItemKey(key) { selectedItemKey = key; }
export function getSelectedItemKey() { return selectedItemKey; }
// Двигает выделенную карточку в тир с номером tierIndex (используется клавишами 1-9)
export function moveSelectedItemToTier(tierIndex) {
  const sel = getSelectedItem();
  if (!sel) return false;
  const data = sel.listNum === 1 ? state.data1 : state.data2;
  if (!data[tierIndex] || sel.tierIndex === tierIndex) return false;
  const targetLength = data[tierIndex].items.length;
  const command = new MoveItemCommand('item', sel.tierIndex, tierIndex, sel.itemIndex, targetLength, sel.listNum);
  state.executeCommand(command, sel.listNum);
  selectedItemKey = tierIndex + '-' + targetLength + '-' + sel.listNum;
  renderAll();
  return true;
}
// Удаляет выделенную карточку (клавиша Delete/Backspace) — так же, как кнопка "x" на карточке
export function deleteSelectedItem() {
  const sel = getSelectedItem();
  if (!sel) return false;
  const data = sel.listNum === 1 ? state.data1 : state.data2;
  const item = data[sel.tierIndex].items[sel.itemIndex];
  const command = new RemoveItemCommand(sel.tierIndex, sel.itemIndex, item, sel.listNum);
  state.executeCommand(command, sel.listNum);
  selectedItemKey = null;
  renderAll();
  return true;
}

export function renderAll() {
  render(1);
  if (isCompare()) render(2);
  eventBus.emit('render:after', { listNum: isCompare() ? 2 : 1 });
}

export function render(listNum) {
  const el = document.getElementById(listNum === 1 ? 'list1' : 'list2');
  if (!el) return;

  const data = listNum === 1 ? state.data1 : state.data2;
  const cacheKey = listNum;

  function tierFingerprint(t, ti) {
    return t.label + '|' + (t.color || '') + '|' + t.items.map(i => i.img + '|' + i.url + '|' + i.svc + '|' + (i.title || '')).join(';') + '|' + ti;
  }

  const newFingerprints = data.map((t, ti) => tierFingerprint(t, ti));
  const oldFingerprints = tierCache.get(cacheKey);
  const tierCountChanged = !oldFingerprints || oldFingerprints.length !== newFingerprints.length;

  let totalPlaced = 0;
  data.forEach(t => { totalPlaced += t.items.length; });

  if (!tierCountChanged && oldFingerprints.every((fp, i) => fp === newFingerprints[i])) {
    eventBus.emit('progress:update', { listNum, placed: totalPlaced });
    return;
  }

  if (tierCountChanged) {
    el.innerHTML = '';
    const frag = document.createDocumentFragment();
    data.forEach((t, ti) => {
      frag.appendChild(buildTierRow(t, ti, listNum));
    });
    el.appendChild(frag);
    tierCache.set(cacheKey, newFingerprints);
    eventBus.emit('progress:update', { listNum, placed: totalPlaced });
    return;
  }

  data.forEach((t, ti) => {
    if (oldFingerprints[ti] !== newFingerprints[ti]) {
      const newRow = buildTierRow(t, ti, listNum);
      el.replaceChild(newRow, el.children[ti]);
    }
  });
  tierCache.set(cacheKey, newFingerprints);
  eventBus.emit('progress:update', { listNum, placed: totalPlaced });
}

function buildTierRow(t, ti, listNum) {
  const row = document.createElement('div');
  row.className = 'tier-row';
  row.style.setProperty('--tier-glow', t.color || '#ff7f7f');

  const lbl = document.createElement('div');
  lbl.className = 'tier-label';
  lbl.style.backgroundColor = t.color || '#ff7f7f';
  lbl.title = 'Двойной клик — переименовать';

  lbl.innerHTML = `
    <span>${escapeHTML(t.label)}</span>
    <div class="tier-count">${t.items.length}</div>
  `;

  lbl.ondblclick = () => {
    if (!isEditing() || lbl.querySelector('input')) return;

    lbl.innerHTML = '';
    lbl.style.display = 'flex';
    lbl.style.flexDirection = 'column';
    lbl.style.padding = '0';

    const ci = document.createElement('input');
    ci.type = 'color';
    ci.value = t.color || '#ff7f7f';
    ci.style.cssText = 'flex:1;width:100%;border:none;cursor:pointer;padding:0;min-height:0;';

    const ni = document.createElement('input');
    ni.value = t.label;
    ni.style.cssText = 'flex:1;width:100%;background:transparent;border:1px solid rgba(0,0,0,0.3);text-align:center;font-weight:900;font-size:1.1rem;color:#111;outline:none;min-height:0;';

    lbl.appendChild(ci);
    lbl.appendChild(ni);
    ci.focus();

    const done = () => {
      t.label = ni.value.trim() || t.label;
      t.color = ci.value;
      state._save();
      eventBus.emit('achievements:check');
      renderAll();
    };
    ni.onblur = done;
    ni.onkeypress = e => { if (e.key === 'Enter') ni.blur(); };
  };

  row.appendChild(lbl);

  const itemsDiv = document.createElement('div');
  itemsDiv.className = 'tier-items';
  itemsDiv.dataset.tierIndex = ti;
  itemsDiv.dataset.listNum = listNum;
  itemsDiv.dataset.tierColor = t.color || '#ff7f7f';

  t.items.forEach((item, ii) => {
    const div = document.createElement('div');
    div.className = 'item';
    div.dataset.svc = item.svc;
    div.dataset.tierIndex = ti;
    div.dataset.itemIndex = ii;
    div.dataset.listNum = listNum;
    div.dataset.url = item.url || '';
    if (item.title) div.dataset.tooltip = item.title;

    const a = document.createElement('a');
    a.href = item.url;
    a.target = '_blank';
    a.rel = 'noopener';

    const img = document.createElement('img');
    img.src = item.img || pImg(item.svc);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (item.svc === 'imdb') {
      attachPosterFallback(img, item);
    } else {
      img.onerror = function() { this.onerror = null; this.src = pImg(item.svc); };
    }

    a.appendChild(img);
    div.appendChild(a);

    const delBtn = document.createElement('button');
    delBtn.className = 'del-btn';
    delBtn.innerHTML = SVG_X;
    delBtn.setAttribute('aria-label', 'Удалить элемент');
    delBtn.dataset.tierIndex = ti;
    delBtn.dataset.itemIndex = ii;
    delBtn.dataset.listNum = listNum;
    div.appendChild(delBtn);

    itemsDiv.appendChild(div);
  });

  const addBtn = document.createElement('button');
  addBtn.className = 'add-btn';
  addBtn.innerHTML = SVG_PLUS;
  addBtn.title = "Добавить элемент";
  addBtn.setAttribute('aria-label', 'Добавить элемент');
  addBtn.dataset.tierIndex = ti;
  addBtn.dataset.listNum = listNum;
  itemsDiv.appendChild(addBtn);

  row.appendChild(itemsDiv);

  if (t.items.length === 0) {
    const dt = document.createElement('button');
    dt.className = 'del-btn del-btn--tier';
    dt.innerHTML = SVG_TRASH;
    dt.setAttribute('aria-label', 'Удалить тир');
    dt.dataset.tierIndex = ti;
    dt.dataset.listNum = listNum;
    row.appendChild(dt);
  }

  return row;
}

function pImg(svc) {
  const colors = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
  const icons = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${colors[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${icons[svc] || '?'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

export function updateUI() {
  const compare = isCompare();

  document.body.classList.add('editing');

  const col2 = document.getElementById('col2');
  if (col2) col2.style.display = compare ? 'block' : 'none';

  updateUndo();
}

export function updateUndo() {
  const listNum = isCompare() ? state.lastEditedList : 1;
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = !state.canUndo(listNum);
  if (redoBtn) redoBtn.disabled = !state.canRedo(listNum);
}
