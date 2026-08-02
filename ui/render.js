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

// Сброс кэша диффа — нужен после операций, меняющих ПОРЯДОК строк-тиров в DOM
// (перетаскивание тиров), чтобы render() пересобрал все .tier-items с верными
// dataset.tierIndex, а не переиспользовал старые узлы по индексу.
export function invalidateRenderCache() { tierCache.clear(); }

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

  // Самоизлечение: убираем битые тиры/элементы (undefined, без items), чтобы
  // одна повреждённая запись не роняла весь рендер и всё приложение.
  let healed = false;
  for (let ti = data.length - 1; ti >= 0; ti--) {
    const t = data[ti];
    if (!t || typeof t !== 'object') { data.splice(ti, 1); healed = true; continue; }
    if (!Array.isArray(t.items)) { t.items = []; healed = true; }
    const before = t.items.length;
    t.items = t.items.filter(i => i && typeof i === 'object');
    if (t.items.length !== before) healed = true;
  }
  if (healed) { tierCache.delete(cacheKey); state._save(); }

  function tierFingerprint(t, ti) {
    return t.label + '|' + (t.color || '') + '|' + t.items.map(i => i.img + '|' + i.url + '|' + i.svc + '|' + (i.title || '')).join(';') + '|' + ti;
  }

  const newFingerprints = data.map((t, ti) => tierFingerprint(t, ti));
  const oldFingerprints = tierCache.get(cacheKey);
  const tierCountChanged = !oldFingerprints || oldFingerprints.length !== newFingerprints.length;

  if (!tierCountChanged && oldFingerprints.every((fp, i) => fp === newFingerprints[i])) {
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
    return;
  }

  data.forEach((t, ti) => {
    if (oldFingerprints[ti] !== newFingerprints[ti]) {
      const newRow = buildTierRow(t, ti, listNum);
      el.replaceChild(newRow, el.children[ti]);
    }
  });
  tierCache.set(cacheKey, newFingerprints);
}

const TIER_PRESET_COLORS = ['#ff7f7f','#ffbf7f','#ffdf7f','#ffff7f','#bfff7f','#7fff7f','#7fffff','#7fbfff','#bf7fff','#ff7fbf','#ffffff','#888888'];

function openTierEditor(t, lbl) {
  document.querySelector('.tier-edit-popover')?.remove();
  const pop = document.createElement('div');
  pop.className = 'tier-edit-popover';
  const rect = lbl.getBoundingClientRect();
  pop.style.cssText = `position:fixed;z-index:9999;top:${rect.top}px;left:${rect.right + 8}px;background:var(--modal-bg,#1a1a2e);border:1px solid var(--input-border);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:200px;box-shadow:0 8px 32px rgba(0,0,0,0.5);`;

  const labelRow = document.createElement('div');
  labelRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
  const labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.value = t.label;
  labelInput.maxLength = 12;
  labelInput.style.cssText = 'flex:1;padding:7px 10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:1rem;font-weight:700;text-align:center;outline:none;width:0;';
  labelRow.appendChild(labelInput);
  pop.appendChild(labelRow);

  const swatches = document.createElement('div');
  swatches.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:5px;';
  let currentColor = t.color || '#ff7f7f';
  TIER_PRESET_COLORS.forEach(c => {
    const sw = document.createElement('button');
    sw.style.cssText = `width:26px;height:26px;border-radius:6px;border:2px solid ${c === currentColor ? 'var(--gold)' : 'transparent'};box-shadow:${c === currentColor ? '0 0 0 1px var(--gold)' : 'none'};background:${c};cursor:pointer;transition:border-color 0.15s;`;
    sw.title = c;
    sw.onclick = () => {
      currentColor = c;
      colorInput.value = c;
      swatches.querySelectorAll('button').forEach(b => { const on = b.title === c; b.style.borderColor = on ? 'var(--gold)' : 'transparent'; b.style.boxShadow = on ? '0 0 0 1px var(--gold)' : 'none'; });
    };
    swatches.appendChild(sw);
  });
  pop.appendChild(swatches);

  const colorRow = document.createElement('div');
  colorRow.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:0.8rem;color:var(--text-secondary);';
  colorRow.textContent = 'Свой цвет: ';
  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = currentColor;
  colorInput.style.cssText = 'width:36px;height:28px;border:none;background:none;cursor:pointer;padding:0;border-radius:6px;';
  colorInput.oninput = () => {
    currentColor = colorInput.value;
    swatches.querySelectorAll('button').forEach(b => { b.style.borderColor = 'transparent'; b.style.boxShadow = 'none'; });
  };
  colorRow.appendChild(colorInput);
  pop.appendChild(colorRow);

  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:8px;';
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Отмена';
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.style.cssText = 'flex:1;padding:7px;font-size:0.82rem;';
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Сохранить';
  saveBtn.className = 'btn btn-primary';
  saveBtn.style.cssText = 'flex:1;padding:7px;font-size:0.82rem;';
  btnRow.appendChild(cancelBtn);
  btnRow.appendChild(saveBtn);
  pop.appendChild(btnRow);

  document.body.appendChild(pop);
  labelInput.focus();
  labelInput.select();

  let saved = false;
  const save = () => {
    if (saved) return;
    saved = true;
    t.label = labelInput.value.trim() || t.label;
    t.color = currentColor;
    state._save();
    eventBus.emit('achievements:check');
    pop.remove();
    document.removeEventListener('mousedown', outside);
    renderAll();
  };
  const dismiss = () => {
    if (saved) return;
    saved = true;
    pop.remove();
    document.removeEventListener('mousedown', outside);
  };
  const outside = e => { if (!pop.contains(e.target) && e.target !== lbl) save(); };
  saveBtn.onclick = save;
  cancelBtn.onclick = dismiss;
  labelInput.onkeydown = e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') dismiss(); };

  setTimeout(() => {
    document.addEventListener('mousedown', outside);
  }, 0);
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

  lbl.ondblclick = () => { if (!isEditing()) return; openTierEditor(t, lbl); };

  row.appendChild(lbl);

  const itemsDiv = document.createElement('div');
  itemsDiv.className = 'tier-items';
  itemsDiv.dataset.tierIndex = ti;
  itemsDiv.dataset.listNum = listNum;
  itemsDiv.dataset.tierColor = t.color || '#ff7f7f';

  t.items.forEach((item, ii) => {
    const div = document.createElement('div');
    div.className = 'item skeleton';
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
    img.onload = () => div.classList.remove('skeleton');
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

  const wrap = document.getElementById('compareWrap');
  if (wrap) wrap.classList.toggle('compare-active', compare);
}
