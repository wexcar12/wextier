import { state, AddItemCommand, RemoveItemCommand, MoveItemCommand } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';
import { isEditing } from './render.js';

let menu = null;
let longPressTimer = null;
let currentTarget = null;

function create() {
  menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.style.display = 'none';
  document.body.appendChild(menu);

  document.addEventListener('click', (e) => {
    if (menu && !menu.contains(e.target)) hide();
  });
  document.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
}

function hide() {
  if (menu) { menu.style.display = 'none'; menu.innerHTML = ''; }
  currentTarget = null;
}

function show(x, y, item) {
  if (!menu) create();
  const tI = parseInt(item.dataset.tierIndex, 10);
  const iI = parseInt(item.dataset.itemIndex, 10);
  const listNum = parseInt(item.dataset.listNum, 10);
  if (isNaN(tI) || isNaN(iI) || isNaN(listNum)) return;

  const data = listNum === 1 ? state.data1 : state.data2;
  const itemData = data[tI]?.items[iI];
  if (!itemData) return;

  currentTarget = { tI, iI, listNum, itemData };
  menu.innerHTML = '';

  if (itemData.url && itemData.url !== '#') {
    addAction('🔗 Открыть ссылку', () => { window.open(itemData.url, '_blank', 'noopener'); });
  }

  if (isEditing()) {
    data.forEach((tier, idx) => {
      if (idx === tI) return;
      addAction(`➡️ В тир ${tier.label}`, () => {
        const targetIndex = data[idx].items.length;
        const cmd = new MoveItemCommand('item', tI, idx, iI, targetIndex, listNum);
        state.executeCommand(cmd, listNum);
        renderAll();
      });
    });

    addAction('🗑️ Удалить', () => {
      const cmd = new RemoveItemCommand(tI, iI, itemData, listNum);
      state.executeCommand(cmd, listNum);
      renderAll();
    }, true);
  }

  menu.style.display = 'block';

  const rect = menu.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (x + rect.width > vw) x = vw - rect.width - 8;
  if (y + rect.height > vh) y = vh - rect.height - 8;
  if (x < 4) x = 4;
  if (y < 4) y = 4;
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function addAction(label, fn, danger) {
  const btn = document.createElement('button');
  btn.className = 'ctx-menu-item' + (danger ? ' ctx-danger' : '');
  btn.textContent = label;
  btn.onclick = () => { hide(); fn(); };
  menu.appendChild(btn);
}

export function initContextMenu() {
  create();

  const wrap = document.getElementById('compareWrap');
  if (!wrap) return;

  wrap.addEventListener('contextmenu', (e) => {
    const item = e.target.closest('.item');
    if (!item || item.closest('#templatePool')) return;
    e.preventDefault();
    show(e.clientX, e.clientY, item);
  });

  wrap.addEventListener('touchstart', (e) => {
    const item = e.target.closest('.item');
    if (!item || item.closest('#templatePool')) return;
    clearTimeout(longPressTimer);
    const touch = e.touches[0];
    const startX = touch.clientX, startY = touch.clientY;
    longPressTimer = setTimeout(() => {
      show(startX, startY, item);
    }, 500);
  }, { passive: true });

  wrap.addEventListener('touchmove', () => clearTimeout(longPressTimer));
  wrap.addEventListener('touchend', () => clearTimeout(longPressTimer));
}
