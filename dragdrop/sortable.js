/**
 * @module dragdrop/sortable
 */
import { state, MoveItemCommand, MoveCrossListCommand, AddItemCommand, RemoveItemCommand } from '../core/state.js';
import { renderAll, isEditing } from '../ui/render.js';
import { getPoolItems, updatePoolItems } from '../ui/templates.js';
import { eventBus } from '../core/event-bus.js';

let currentPoolItems = [];
let lastHighlighted = null;

// ФИКС 4 (визуальный отклик): помечаем body классом на всё время перетаскивания —
// по нему CSS подсвечивает все пустые тиры лёгкой пульсацией, чтобы было видно,
// куда вообще можно бросить карточку, ещё до наведения на конкретный тир.
function handleDragStart() { document.body.classList.add('wex-dragging'); }
function handleDragStop() { document.body.classList.remove('wex-dragging'); }

// ФИКС 2: подсвечиваем тир ЕГО СОБСТВЕННЫМ цветом, когда карточку тащат прямо над ним
// (раньше подсветка была одинаковая золотая для всех тиров).
function handleDragMove(evt) {
  const toRow = evt.to && evt.to.closest ? evt.to.closest('.tier-row') : null;
  if (lastHighlighted && lastHighlighted !== toRow) {
    lastHighlighted.style.removeProperty('--drag-glow');
    lastHighlighted.classList.remove('drag-target');
  }
  if (toRow && toRow !== lastHighlighted) {
    const color = evt.to.dataset.tierColor;
    if (color) toRow.style.setProperty('--drag-glow', color);
    toRow.classList.add('drag-target');
  }
  lastHighlighted = toRow;
  return true;
}
function clearDragHighlight() {
  if (lastHighlighted) { lastHighlighted.style.removeProperty('--drag-glow'); lastHighlighted.classList.remove('drag-target'); }
  lastHighlighted = null;
}

// ФИКС 3: маленький салют из конфетти, когда весь пул шаблонов разобран по тирам
function fireConfettiIfPoolEmpty() {
  if (currentPoolItems.length !== 0) return;
  const colors = ['#f5c542', '#ff6b6b', '#4d96ff', '#6bffb8', '#c56bff'];
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (1.6 + Math.random() * 1.2) + 's';
    piece.style.animationDelay = (Math.random() * 0.3) + 's';
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3200);
  }
  eventBus.emit('toast:show', { text: '🎉 Все карточки разложены!', type: 'success' });
}

function handleSortableMove(evt) {
  clearDragHighlight();
  const isFromPool = evt.from.id === 'templatePool';
  const isToPool = evt.to.id === 'templatePool';

  // Из пула -> В тир
  if (isFromPool) {
    const item = currentPoolItems.splice(evt.oldIndex, 1)[0];
    if (!isToPool) {
      const toTier = parseInt(evt.to.dataset.tierIndex, 10);
      const listNum = parseInt(evt.to.dataset.listNum, 10) || 1;
      const newItem = { img: item.img, url: item.url, svc: item.svc, title: item.title };
      const command = new AddItemCommand(toTier, newItem, listNum, evt.newIndex);
      state.executeCommand(command, listNum);
      fireConfettiIfPoolEmpty();
    } else {
      currentPoolItems.splice(evt.newIndex, 0, item);
    }
    if (typeof gsap !== 'undefined') gsap.fromTo(evt.item, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    eventBus.emit('achievements:check');
    renderAll();
    return;
  }

  // Из тира -> В пул
  if (isToPool) {
    const fromTier = parseInt(evt.from.dataset.tierIndex, 10);
    const fromList = parseInt(evt.from.dataset.listNum, 10) || 1;
    const data = fromList === 1 ? state.data1 : state.data2;
    const item = data[fromTier].items[evt.oldIndex];
    
    const command = new RemoveItemCommand(fromTier, evt.oldIndex, item, fromList);
    state.executeCommand(command, fromList);
    
    currentPoolItems.splice(evt.newIndex, 0, { img: item.img, url: item.url, svc: item.svc, title: item.title || '' });
    eventBus.emit('achievements:check');
    renderAll();
    return;
  }

  // Из тира -> В тир
  const fromTier = parseInt(evt.from.dataset.tierIndex, 10);
  const toTier = parseInt(evt.to.dataset.tierIndex, 10);
  const fromList = parseInt(evt.from.dataset.listNum, 10) || 1;
  const toList = parseInt(evt.to.dataset.listNum, 10) || 1;

  if (fromList === toList) {
    const command = new MoveItemCommand('item', fromTier, toTier, evt.oldIndex, evt.newIndex, fromList);
    state.executeCommand(command, fromList);
  } else {
    // ФИКС: перенос между разными списками логируется в историю списка НАЗНАЧЕНИЯ,
    // чтобы кнопка "Отменить" могла его найти (раньше всегда писалось в список 1 — Undo не находил).
    const command = new MoveCrossListCommand(fromTier, toTier, evt.oldIndex, evt.newIndex, fromList, toList);
    state.executeCommand(command, toList);
  }

  eventBus.emit('achievements:check');
  renderAll();
}

function refreshSortableInstances() {
  // ФИКС: перетаскивание разрешено только в режиме "Редактировать"
  const disabled = !isEditing();
  document.querySelectorAll('.tier-items').forEach(el => {
    if (el._sortable) el._sortable.option('disabled', disabled);
  });
  const poolEl = document.getElementById('templatePool');
  if (poolEl && poolEl._sortable) poolEl._sortable.option('disabled', disabled);
}

export function initSortable() {
  eventBus.on('render:after', () => {
    currentPoolItems = getPoolItems();
    setTimeout(() => {
      const disabled = !isEditing();
      document.querySelectorAll('.tier-items').forEach(el => {
        if (el._sortable) el._sortable.destroy();
        el._sortable = new Sortable(el, { group: 'shared', animation: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', onEnd: handleSortableMove, onMove: handleDragMove, onStart: handleDragStart, onUnchoose: handleDragStop, disabled });
      });
      const poolEl = document.getElementById('templatePool');
      if (poolEl) {
        if (poolEl._sortable) poolEl._sortable.destroy();
        poolEl._sortable = new Sortable(poolEl, { group: 'shared', animation: 220, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', onEnd: handleSortableMove, onMove: handleDragMove, onStart: handleDragStart, onUnchoose: handleDragStop, disabled });
      }
      lucide.createIcons();
    }, 0);
  });

  // ФИКС: когда переключают "Редактировать" — сразу включаем/выключаем перетаскивание, без пересборки Sortable
  eventBus.on('ui:state:changed', ({ key }) => {
    if (key === 'editing') refreshSortableInstances();
  });
}
