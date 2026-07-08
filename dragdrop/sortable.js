/**
 * @module dragdrop/sortable
 */
import { state, MoveItemCommand, AddItemCommand, RemoveItemCommand } from '../core/state.js';
import { renderAll } from '../ui/render.js';
import { getPoolItems } from '../ui/templates.js';
import { eventBus } from '../core/event-bus.js';

let currentPoolItems = [];

function handleSortableMove(evt) {
  const isFromPool = evt.from.id === 'templatePool';
  const isToPool = evt.to.id === 'templatePool';

  if (isFromPool) {
    const item = currentPoolItems.splice(evt.oldIndex, 1)[0];
    
    if (!isToPool) {
      const toTier = parseInt(evt.to.dataset.tierIndex, 10);
      const listNum = parseInt(evt.to.dataset.listNum, 10) || 1;
      const newItem = { img: item.img, url: item.url, svc: item.svc, title: item.title };
      const data = listNum === 1 ? state.data1 : state.data2;
      data[toTier].items.splice(evt.newIndex, 0, newItem);
      state._save();
    } else {
      currentPoolItems.splice(evt.newIndex, 0, item);
    }

    if (typeof gsap !== 'undefined') gsap.fromTo(evt.item, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
    eventBus.emit('achievements:check');
    renderAll();
    return;
  }

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

  const fromTier = parseInt(evt.from.dataset.tierIndex, 10);
  const toTier = parseInt(evt.to.dataset.tierIndex, 10);
  const fromList = parseInt(evt.from.dataset.listNum, 10) || 1;
  const toList = parseInt(evt.to.dataset.listNum, 10) || 1;
  const command = new MoveItemCommand('item', fromTier, toTier, evt.oldIndex, evt.newIndex, fromList === toList ? fromList : 1);

  if (fromList === toList) {
    state.executeCommand(command, fromList);
  } else {
    const fromData = fromList === 1 ? state.data1 : state.data2;
    const toData = toList === 1 ? state.data1 : state.data2;
    const item = fromData[fromTier].items.splice(evt.oldIndex, 1)[0];
    toData[toTier].items.splice(evt.newIndex, 0, item);
    state._save();
  }

  eventBus.emit('achievements:check');
  renderAll();
}

export function initSortable() {
  eventBus.on('render:after', () => {
    currentPoolItems = getPoolItems();

    setTimeout(() => {
      document.querySelectorAll('.tier-items').forEach(el => {
        if (el._sortable) el._sortable.destroy();
        el._sortable = new Sortable(el, {
          group: 'shared',
          animation: 200,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          onEnd: function(evt) { handleSortableMove(evt); }
        });
      });

      const poolEl = document.getElementById('templatePool');
      if (poolEl) {
        if (poolEl._sortable) poolEl._sortable.destroy();
        poolEl._sortable = new Sortable(poolEl, {
          group: 'shared',
          animation: 200,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          onEnd: function(evt) { handleSortableMove(evt); }
        });
      }
      lucide.createIcons();
    }, 0);
  });
}
