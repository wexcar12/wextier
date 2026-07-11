/**
 * @module dragdrop/sortable
 */
import { state, MoveItemCommand, MoveCrossListCommand, AddItemCommand, RemoveItemCommand } from '../core/state.js';
import { renderAll, isEditing } from '../ui/render.js';
import { getPoolItems, updatePoolItems } from '../ui/templates.js';
import { eventBus } from '../core/event-bus.js';

let currentPoolItems = [];

function handleSortableMove(evt) {
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
        el._sortable = new Sortable(el, { group: 'shared', animation: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', onEnd: handleSortableMove, disabled });
      });
      const poolEl = document.getElementById('templatePool');
      if (poolEl) {
        if (poolEl._sortable) poolEl._sortable.destroy();
        poolEl._sortable = new Sortable(poolEl, { group: 'shared', animation: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', onEnd: handleSortableMove, disabled });
      }
      lucide.createIcons();
    }, 0);
  });

  // ФИКС: когда переключают "Редактировать" — сразу включаем/выключаем перетаскивание, без пересборки Sortable
  eventBus.on('ui:state:changed', ({ key }) => {
    if (key === 'editing') refreshSortableInstances();
  });
}
