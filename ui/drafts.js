/**
 * @module ui/drafts
 * @description Черновики (localStorage).
 */
import { state } from '../core/state.js';
import { renderAll, hideForeignBanner } from './render.js';
import { eventBus } from '../core/event-bus.js';
import { sg, ss } from '../utils/storage.js';
import { modalManager } from './modal-manager.js';
import { escapeHTML } from '../utils/sanitizers.js';

let DRAFTS = [];
let ad = 0;

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
  hideForeignBanner();
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
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';

    const btn = document.createElement('button');
    btn.className = 'sidebar-btn' + (i === ad ? ' primary' : '');
    btn.style.flex = '1';
    btn.textContent = (i === ad ? '● ' : '') + d.name;
    btn.onclick = () => {
      if (i === ad) return;
      saveDrafts();
      ad = i;
      state.setData(JSON.parse(JSON.stringify(DRAFTS[i].data)), 1);
      hideForeignBanner();
      renderAll();
      renderDraftsSidebar();
    };
    div.appendChild(btn);

    // Rename button (pencil icon)
    const renameBtn = document.createElement('button');
    renameBtn.className = 'sidebar-btn';
    renameBtn.style.cssText = 'padding:4px 8px;font-size:0.85rem;flex:none;';
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Переименовать';
    renameBtn.onclick = (e) => {
      e.stopPropagation();
      openRenameDraftModal(i);
    };
    div.appendChild(renameBtn);

    // Delete button (trash icon) - not shown if this is the only draft
    if (DRAFTS.length > 1) {
      const delBtn = document.createElement('button');
      delBtn.className = 'sidebar-btn';
      delBtn.style.cssText = 'padding:4px 8px;font-size:0.85rem;flex:none;';
      delBtn.textContent = '🗑️';
      delBtn.title = 'Удалить';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        openDeleteDraftModal(i);
      };
      div.appendChild(delBtn);
    }

    list.appendChild(div);
  });
}

function openRenameDraftModal(index) {
  const draft = DRAFTS[index];
  if (!draft) return;
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.innerHTML = `
    <h3 style="margin-bottom:16px;">Переименовать черновик</h3>
    <input type="text" id="renameDraftInput" class="modal-input" value="${escapeHTML(draft.name)}"
      style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text);font-size:0.95rem;margin-bottom:16px;"
      maxlength="30" autofocus>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-secondary" data-action="cancel">Отмена</button>
      <button class="btn btn-primary" data-action="ok">Сохранить</button>
    </div>
  `;
  const close = modalManager.open(content, { closeOnEscape: true });
  const input = content.querySelector('#renameDraftInput');
  if (input) { input.focus(); input.select(); }

  const doRename = () => {
    const name = (input?.value || '').trim();
    if (!name) return;
    close();
    DRAFTS[index].name = name;
    saveDrafts();
    renderDraftsSidebar();
  };
  content.querySelector('[data-action="ok"]')?.addEventListener('click', doRename);
  content.querySelector('[data-action="cancel"]')?.addEventListener('click', () => close());
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') doRename(); });
}

function openDeleteDraftModal(index) {
  const draft = DRAFTS[index];
  if (!draft || DRAFTS.length <= 1) return;
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.innerHTML = `
    <h3 style="margin-bottom:16px;">Удалить черновик</h3>
    <p style="margin-bottom:16px;color:var(--text-secondary);">Удалить черновик «${escapeHTML(draft.name)}»? Это действие нельзя отменить.</p>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-secondary" data-action="cancel">Отмена</button>
      <button class="btn btn-primary" data-action="ok" style="background:var(--danger,#e74c3c);">Удалить</button>
    </div>
  `;
  const close = modalManager.open(content, { closeOnEscape: true });
  content.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
    close();
    DRAFTS.splice(index, 1);
    if (ad >= DRAFTS.length) ad = DRAFTS.length - 1;
    if (ad < 0) ad = 0;
    state.setData(JSON.parse(JSON.stringify(DRAFTS[ad].data)), 1);
    hideForeignBanner();
    saveDrafts();
    renderAll();
    renderDraftsSidebar();
  });
  content.querySelector('[data-action="cancel"]')?.addEventListener('click', () => close());
}

export function createNewDraft() {
  const defaultName = 'Черновик ' + (DRAFTS.length + 1);
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.innerHTML = `
    <h3 style="margin-bottom:16px;">Новый черновик</h3>
    <input type="text" id="draftNameInput" class="modal-input" value="${defaultName}"
      style="width:100%;padding:10px 14px;border-radius:10px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text);font-size:0.95rem;margin-bottom:16px;"
      maxlength="30" autofocus>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-secondary" data-action="cancel">Отмена</button>
      <button class="btn btn-primary" data-action="ok">Создать</button>
    </div>
  `;
  const close = modalManager.open(content, { closeOnEscape: true });
  const input = content.querySelector('#draftNameInput');
  if (input) { input.focus(); input.select(); }
  const doCreate = () => {
    const name = (input?.value || '').trim();
    if (!name) return;
    close();
    DRAFTS.push({ name, data: defaultData() });
    ad = DRAFTS.length - 1;
    state.setData(JSON.parse(JSON.stringify(DRAFTS[ad].data)), 1);
    hideForeignBanner();
    saveDrafts();
    renderAll();
    renderDraftsSidebar();
  };
  content.querySelector('[data-action="ok"]')?.addEventListener('click', doCreate);
  content.querySelector('[data-action="cancel"]')?.addEventListener('click', () => close());
  input?.addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); });
}

export function clearAllData() {
  const content = document.createElement('div');
  content.style.padding = '20px';
  content.innerHTML = `
    <h3 style="margin-bottom:16px;color:var(--danger,#e74c3c);">Сброс всех данных</h3>
    <p style="margin-bottom:16px;color:var(--text-secondary);">Точно удалить ВСЕ черновики и настройки без возможности восстановить?</p>
    <div style="display:flex;gap:10px;justify-content:flex-end;">
      <button class="btn btn-secondary" data-action="cancel">Отмена</button>
      <button class="btn btn-primary" data-action="ok" style="background:var(--danger,#e74c3c);">Удалить всё</button>
    </div>
  `;
  const close = modalManager.open(content, { closeOnEscape: true });
  content.querySelector('[data-action="ok"]')?.addEventListener('click', () => {
    close();
    Object.keys(localStorage).filter(k => k.startsWith('wt_')).forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    DRAFTS = [{ name: 'Основной', data: defaultData() }];
    ad = 0;
    state.setData(JSON.parse(JSON.stringify(DRAFTS[0].data)), 1);
    saveDrafts();
    renderDraftsSidebar();
    renderAll();
    eventBus.emit('toast:show', { text: 'Все данные сброшены', type: 'success' });
  });
  content.querySelector('[data-action="cancel"]')?.addEventListener('click', () => close());
}

// Автосохранение при изменении состояния
// ФИКС 8: эмитим события для индикатора "Сохранено ✓" в сайдбаре
eventBus.on('state:needsSave', () => {
  eventBus.emit('save:start');
  saveDrafts();
  eventBus.emit('save:done');
});
