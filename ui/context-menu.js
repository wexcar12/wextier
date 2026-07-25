import { state, AddItemCommand, RemoveItemCommand, MoveItemCommand } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';
import { isEditing } from './render.js';
import { searchDuckDuckGo, searchWikiThumbnail } from './templates.js';
import { modalManager } from './modal-manager.js';

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
    addAction('✏️ Редактировать', () => openItemEditor(currentTarget));

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

function openItemEditor({ tI, iI, listNum, itemData }) {
  const content = document.createElement('div');
  content.style.minWidth = '300px';
  content.innerHTML = `
    <h3 style="color:var(--gold);margin-bottom:14px;">Редактировать элемент</h3>
    <input type="text" id="ie-title" placeholder="Название" value="${itemData.title ? itemData.title.replace(/"/g,'&quot;') : ''}"
      style="width:100%;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);margin-bottom:10px;">
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <input type="text" id="ie-img" placeholder="URL картинки" value="${(itemData.img||'').replace(/"/g,'&quot;')}"
        style="flex:1;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.85rem;">
      <button class="btn btn-secondary" id="ie-search" style="white-space:nowrap;">🔍 Найти</button>
    </div>
    <div id="ie-preview" style="${itemData.img ? '' : 'display:none;'}margin-bottom:10px;text-align:center;">
      <img id="ie-preview-img" src="${itemData.img||''}" style="max-height:80px;border-radius:8px;border:1px solid var(--input-border);" alt="">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="ie-cancel">Отмена</button>
      <button class="btn btn-primary" id="ie-save">Сохранить</button>
    </div>
  `;
  const close = modalManager.open(content);
  const imgInput = content.querySelector('#ie-img');
  const preview = content.querySelector('#ie-preview');
  const previewImg = content.querySelector('#ie-preview-img');

  imgInput.addEventListener('input', () => {
    const v = imgInput.value.trim();
    if (v) { previewImg.src = v; preview.style.display = 'block'; }
    else preview.style.display = 'none';
  });

  content.querySelector('#ie-search').onclick = async () => {
    const title = content.querySelector('#ie-title').value.trim() || itemData.title || '';
    if (!title) return;
    const btn = content.querySelector('#ie-search');
    btn.disabled = true; btn.textContent = '⏳';
    const found = await searchDuckDuckGo(title + ' photo') || await searchDuckDuckGo(title) || await searchWikiThumbnail(title);
    btn.disabled = false; btn.textContent = '🔍 Найти';
    if (found) { imgInput.value = found; previewImg.src = found; preview.style.display = 'block'; }
    else eventBus.emit('toast:show', { text: 'Не нашлось — вставьте URL вручную', type: 'error' });
  };

  content.querySelector('#ie-cancel').onclick = close;
  content.querySelector('#ie-save').onclick = () => {
    const data = listNum === 1 ? state.data1 : state.data2;
    const item = data[tI]?.items[iI];
    if (!item) { close(); return; }
    const newTitle = content.querySelector('#ie-title').value.trim();
    const newImg = imgInput.value.trim();
    if (newTitle) item.title = newTitle;
    if (newImg) item.img = newImg;
    state._save();
    eventBus.emit('achievements:check');
    renderAll();
    close();
  };
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
