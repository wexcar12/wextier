/**
 * @module ui/render
 * @description Рендер тир-листов.
 */
import { state, MoveItemCommand, RemoveItemCommand, EditTierCommand, AddTierCommand, RemoveTierCommand, ResetTiersCommand, defaultTiers } from '../core/state.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHTML, safeUrl, safeHref } from '../utils/sanitizers.js';
import { pImg } from '../utils/placeholder.js';
import { returnItemsToPool } from './templates.js';
import { attachPosterFallback } from '../utils/image-resolve.js';
import { modalManager } from './modal-manager.js';

const SVG_X = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const SVG_PLUS = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const SVG_TRASH = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

const tierCache = new Map();

// ФИКС ЛАГОВ: перенос одной карточки пересобирает целиком строки исходного и целевого
// тира (дифф идёт по тиру, а не по карточке). Каждая пересозданная карточка получала класс
// skeleton (шиммер), который снимается лишь по img.onload — а для картинки, уже загруженной
// ранее, onload срабатывает на следующий кадр, из-за чего по обеим строкам пробегала волна
// мерцания на КАЖДЫЙ дроп. Запоминаем уже загруженные URL и не вешаем skeleton повторно —
// карточка со знакомой картинкой появляется сразу, без мигания.
const loadedImages = new Set();

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
  const command = new MoveItemCommand(sel.tierIndex, tierIndex, sel.itemIndex, targetLength, sel.listNum);
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
  syncMetaFields();
  updateHistoryButtons();
  eventBus.emit('render:after', { listNum: isCompare() ? 2 : 1 });
}

// Активность кнопок «Отменить/Вернуть». Раньше стояла только в updateUI(), который
// вызывается не после каждого действия (drag, добавление и т.п. зовут лишь renderAll),
// поэтому кнопки залипали в disabled и клик молчал, хотя Ctrl+Z работал.
export function updateHistoryButtons() {
  const activeList = isCompare() ? getActiveList() : 1;
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.disabled = !state.canUndo(activeList);
  if (redoBtn) redoBtn.disabled = !state.canRedo(activeList);
}

// Заголовок и описание — единственное место, откуда они читаются в DOM.
// Синхронизируем поля при каждом рендере, но не перезаписываем, пока поле в фокусе
// (чтобы не стирать ввод при перерисовке в момент набора).
export function syncMetaFields() {
  const t = document.getElementById('tierlistTitle');
  const d = document.getElementById('tierlistDesc');
  if (t && document.activeElement !== t) t.value = state.title || '';
  if (d && document.activeElement !== d) {
    d.value = state.desc || '';
    d.style.height = 'auto';
    d.style.height = d.scrollHeight + 'px';
  }
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
  if (healed) { tierCache.delete(cacheKey); state.save(); }

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
    destroyRowSortables(el);
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
      // ФИКС ЛАГОВ/УТЕЧКИ: старая строка тира содержит .tier-items с живым экземпляром
      // SortableJS. При replaceChild узел просто открепляется, но экземпляр Sortable со
      // своими слушателями не уничтожается — на каждый дроп оставалось по 2 «осиротевших»
      // Sortable. За сессию их накапливались сотни, и перетаскивание всё сильнее тормозило.
      // Теперь перед заменой корректно уничтожаем Sortable снятой строки.
      destroyRowSortables(el.children[ti]);
      el.replaceChild(newRow, el.children[ti]);
    }
  });
  tierCache.set(cacheKey, newFingerprints);
}

// Уничтожает все экземпляры SortableJS внутри переданного поддерева (или самого узла),
// чтобы при пересборке строк тиров не копились неиспользуемые экземпляры со слушателями.
function destroyRowSortables(rootEl) {
  if (!rootEl) return;
  const nodes = rootEl.classList && rootEl.classList.contains('tier-items')
    ? [rootEl]
    : rootEl.querySelectorAll ? rootEl.querySelectorAll('.tier-items') : [];
  nodes.forEach(node => {
    if (node._sortable) {
      try { node._sortable.destroy(); } catch (e) { /* ignore */ }
      node._sortable = null;
    }
  });
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
    const newLabel = labelInput.value.trim() || t.label;
    const newColor = currentColor;
    pop.remove();
    document.removeEventListener('mousedown', outside);
    // Правку проводим через историю, только если что-то реально изменилось.
    // Ищем тир по ссылке в обоих списках, чтобы знать индекс и номер списка.
    if (newLabel !== t.label || newColor !== (t.color || '')) {
      let listNum = 1;
      let tierIndex = state.data1.indexOf(t);
      if (tierIndex === -1) { tierIndex = state.data2.indexOf(t); listNum = 2; }
      if (tierIndex !== -1) {
        const cmd = new EditTierCommand(tierIndex, t.label, t.color, newLabel, newColor, listNum);
        state.executeCommand(cmd, listNum);
      } else {
        // Тир не найден в состоянии (маловероятно) — правим напрямую, чтобы не потерять ввод.
        t.label = newLabel; t.color = newColor; state.save();
      }
    }
    eventBus.emit('achievements:check');
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
    const imgWasLoaded = item.img && loadedImages.has(item.img);
    div.className = 'item' + (imgWasLoaded ? '' : ' skeleton');
    div.dataset.svc = item.svc;
    div.dataset.tierIndex = ti;
    div.dataset.itemIndex = ii;
    div.dataset.listNum = listNum;
    div.dataset.url = item.url || '';
    if (item.title) div.dataset.tooltip = item.title;

    const a = document.createElement('a');
    a.href = safeHref(item.url || '#');
    a.target = '_blank';
    a.rel = 'noopener';

    const img = document.createElement('img');
    img.src = safeUrl(item.img) || pImg(item.svc);
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onload = () => {
      div.classList.remove('skeleton');
      if (item.img) loadedImages.add(item.img);
    };
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

  // Кнопка удаления тира показывается всегда. Раньше она была только у пустого
  // тира — из-за этого заполненный тир нельзя было убрать, не растащив карточки
  // вручную. Теперь непустой тир удаляется с подтверждением (карточки вернутся в пул).
  const dt = document.createElement('button');
  dt.className = 'del-btn del-btn--tier';
  dt.innerHTML = SVG_TRASH;
  dt.setAttribute('aria-label', 'Удалить тир');
  dt.dataset.tierIndex = ti;
  dt.dataset.listNum = listNum;
  row.appendChild(dt);

  return row;
}

export function updateUI() {
  const compare = isCompare();
  document.body.classList.add('editing');

  const col2 = document.getElementById('col2');
  if (col2) col2.style.display = compare ? 'block' : 'none';

  const wrap = document.getElementById('compareWrap');
  if (wrap) wrap.classList.toggle('compare-active', compare);

  // Кнопки под списком показываем только когда соответствующая колонка видима
  // (col2 скрыт вне режима сравнения, иначе кнопки второго списка видны зря).
  document.querySelectorAll('.tier-list-actions').forEach(actions => {
    const listNum = parseInt(actions.querySelector('[data-list-num]')?.dataset.listNum, 10);
    actions.style.display = (compare || listNum === 1) ? '' : 'none';
  });

  // Кнопки истории: активный список зависит от режима сравнения (по умолчанию — 1).
  updateHistoryButtons();
}

// --- УПРАВЛЕНИЕ ТИРАМИ -------------------------------------------------
// Раньше тиры можно было только удалять (и то — пустые). Теперь: добавление,
// сброс к стандартному набору и удаление любого тира — всё через историю команд,
// чтобы работал Ctrl+Z/Ctrl+Y (раньше удаление стирало всю историю через setData).

// Простой диалог подтверждения поверх modalManager.
export function confirmDialog(text, confirmLabel = 'Удалить') {
  return new Promise(resolve => {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3 class="m-modal-title">Подтверждение</h3>
      <p style="margin:6px 0 18px;color:var(--text-secondary);font-size:0.92rem;line-height:1.5;">${escapeHTML(text)}</p>
      <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
        <button class="btn btn-primary" data-action="ok">${escapeHTML(confirmLabel)}</button>
      </div>
    `;
    const close = modalManager.open(content, { closeOnEscape: true });
    let settled = false;
    const done = val => {
      if (settled) return;
      settled = true;
      close();
      resolve(val);
    };
    content.querySelector('[data-action="ok"]').onclick = () => done(true);
    content.querySelector('[data-action="cancel"]').onclick = () => done(false);
  });
}

// Модальный аналог prompt(): запрос строки. Возвращает введённую строку или null (отмена).
export function promptDialog(text, defaultValue = '', { confirmLabel = 'OK', placeholder = '' } = {}) {
  return new Promise(resolve => {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3 class="m-modal-title">Ввод</h3>
      <p style="margin:6px 0 12px;color:var(--text-secondary);font-size:0.9rem;line-height:1.5;">${escapeHTML(text)}</p>
      <input type="text" data-role="input" value="${escapeHTML(defaultValue)}" placeholder="${escapeHTML(placeholder)}"
        style="width:100%;padding:10px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);outline:none;">
      <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
        <button class="btn btn-primary" data-action="ok">${escapeHTML(confirmLabel)}</button>
      </div>
    `;
    const close = modalManager.open(content, { closeOnEscape: true });
    const input = content.querySelector('[data-role="input"]');
    if (input) { input.focus(); input.select(); }
    let settled = false;
    const done = val => { if (settled) return; settled = true; close(); resolve(val); };
    content.querySelector('[data-action="ok"]').onclick = () => done(input ? input.value : '');
    content.querySelector('[data-action="cancel"]').onclick = () => done(null);
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); done(input.value); } });
  });
}

// Автоназвание нового тира: следующая свободная буква (S, A, B, C → D → E...;
// после исчерпания — «Новый N»). Цвет берётся из палитры по кругу.
export function createDefaultTier(listNum = 1) {
  const data = listNum === 1 ? state.data1 : state.data2;
  const existing = new Set(data.map(t => (t.label || '').trim().toUpperCase()));
  let label = null;
  const letters = ['S','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','T','U','V','W','X','Y','Z'];
  for (const L of letters) { if (!existing.has(L)) { label = L; break; } }
  if (!label) {
    let n = 1;
    while (existing.has(('НОВЫЙ ' + n))) n++;
    label = 'Новый ' + n;
  }
  const color = TIER_PRESET_COLORS[data.length % TIER_PRESET_COLORS.length] || '#ff7f7f';
  return { tier: label, label, color, items: [] };
}

// Добавить тир в конец списка.
export function addTier(listNum) {
  const cmd = new AddTierCommand(createDefaultTier(listNum), listNum);
  state.executeCommand(cmd, listNum);
  eventBus.emit('achievements:check');
  renderAll();
}

// Сброс набора тиров к стандартному (S/A/B/C). Непустые тиры сбрасываются только
// после подтверждения, карточки при этом не теряются — возвращаются в пул.
export function resetTiers(listNum) {
  const data = listNum === 1 ? state.data1 : state.data2;
  const oldTiers = data.map(t => structuredClone(t));
  const newTiers = defaultTiers();
  const nonEmpty = oldTiers.filter(t => t.items && t.items.length > 0);
  // Если карточки уходят в пул — снимок для отмены хранит тиры ПУСТЫМИ, иначе
  // Ctrl+Z вернул бы их второй раз (дубликаты: те же карточки уже в пуле).
  const apply = (toPool) => {
    const snapshot = toPool ? oldTiers.map(t => ({ ...t, items: [] })) : oldTiers;
    const cmd = new ResetTiersCommand(snapshot, newTiers, listNum);
    state.executeCommand(cmd, listNum);
    eventBus.emit('achievements:check');
    eventBus.emit('analytics:event', 'reset_tiers');
    renderAll();
  };
  if (nonEmpty.length > 0) {
    confirmDialog(`В ${nonEmpty.length} тир(ах) есть карточки — они вернутся в пул. Сбросить тиры к S/A/B/C?`, 'Сбросить')
      .then(ok => { if (ok) { returnItemsToPool(nonEmpty.flatMap(t => t.items)); apply(true); } });
  } else {
    apply(false);
  }
}

// Удаление тира: пустой — сразу, непустой — после подтверждения, а карточки
// возвращаются в пул (чтобы ничего не потерять). Само удаление идёт через
// RemoveTierCommand, поэтому Ctrl+Z восстановит тир (карточки останутся в пуле).
export function deleteTier(tierIndex, listNum) {
  const data = listNum === 1 ? state.data1 : state.data2;
  const tier = data[tierIndex];
  if (!tier) return;
  // При возврате карточек в пул снимок для отмены хранится без items — undo
  // вернёт пустой тир, карточки останутся в пуле (без дублирования).
  const remove = (toPool) => {
    const snapshot = toPool ? { ...tier, items: [] } : tier;
    const cmd = new RemoveTierCommand(tierIndex, snapshot, listNum);
    state.executeCommand(cmd, listNum);
    eventBus.emit('achievements:check');
    renderAll();
  };
  if (tier.items.length > 0) {
    confirmDialog(`Удалить тир «${tier.label}»? Его карточки (${tier.items.length}) вернутся в пул.`, 'Удалить')
      .then(ok => { if (ok) { returnItemsToPool(tier.items); remove(true); } });
  } else {
    remove(false);
  }
}
