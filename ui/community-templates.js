/**
 * @module ui/community-templates
 * @description Браузер шаблонов сообщества + создание + 18+ фильтрация.
 */
import { api } from '../api/firestore.js';
import { getCurrentUser } from '../api/auth.js';
import { modalManager } from './modal-manager.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { getDB } from '../api/firebase-init.js';
import { searchDuckDuckGo, searchWikiThumbnail } from './templates.js';

const P = 'wt_';
function sg(k, f) { try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; } }
function ss(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

function getShowAdult() { return sg('show_adult_templates', false); }
function setShowAdult(v) { ss('show_adult_templates', v); }

async function autoFindImage(title) {
  return await searchDuckDuckGo(title + ' photo')
      || await searchDuckDuckGo(title)
      || await searchWikiThumbnail(title)
      || '';
}

export async function openCommunityTemplates() {
  if (!getDB()) {
    eventBus.emit('toast:show', { text: 'Firebase недоступен', type: 'error' });
    return;
  }

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);margin-bottom:16px;">Шаблоны сообщества</h3>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
      <input type="text" id="ct-search" placeholder="🔎 Поиск шаблона..."
        style="flex:1;min-width:130px;padding:8px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.85rem;outline:none;">
      <label style="display:flex;align-items:center;gap:6px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;white-space:nowrap;">
        <input type="checkbox" id="ct-adult-toggle" ${getShowAdult() ? 'checked' : ''} style="accent-color:var(--gold);">
        Показывать 18+
      </label>
    </div>
    <div id="ct-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;max-height:380px;overflow-y:auto;padding:2px;"></div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn btn-secondary" id="ct-close">Закрыть</button>
      <button class="btn btn-primary" id="ct-create">+ Добавить шаблон</button>
    </div>
  `;

  const close = modalManager.open(content);
  const grid = content.querySelector('#ct-grid');
  const adultToggle = content.querySelector('#ct-adult-toggle');
  const searchInput = content.querySelector('#ct-search');
  let allTemplates = [];

  function renderGrid(list) {
    if (!list.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary);">Ничего не найдено</div>';
      return;
    }
    grid.innerHTML = list.map(t => `
      <div class="ct-card" data-id="${t.id}" style="background:var(--card-bg);border:1px solid var(--input-border);border-radius:12px;padding:10px;cursor:pointer;transition:border-color 0.2s,transform 0.2s;text-align:center;position:relative;">
        ${t.isAdult ? '<span style="position:absolute;top:4px;right:6px;font-size:0.65rem;background:#ff4444;color:#fff;padding:1px 5px;border-radius:6px;">18+</span>' : ''}
        <div style="display:flex;gap:3px;justify-content:center;flex-wrap:nowrap;margin-bottom:8px;height:40px;overflow:hidden;">
          ${(t.items || []).slice(0, 4).map(i => (i.img && !i.img.startsWith('data:image/svg')) ? `<img src="${escapeHTML(i.img)}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0;" alt="" loading="lazy" onerror="this.style.display='none'">` : `<span style="width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.05);border-radius:6px;flex-shrink:0;font-size:0.9rem;">🖼</span>`).join('')}
        </div>
        <div style="font-size:0.78rem;color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(t.name)}</div>
        <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:2px;">${t.items ? t.items.length : 0} элем.${t.authorName ? ' · ' + escapeHTML(t.authorName) : ''}</div>
      </div>
    `).join('');
    grid.querySelectorAll('.ct-card').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--gold)'; card.style.transform = 'translateY(-2px)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--input-border)'; card.style.transform = ''; });
      card.addEventListener('click', () => applyTemplate(card.dataset.id, close));
    });
  }

  async function loadTemplates() {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary);">Загрузка...</div>';
    allTemplates = await api.fetchCommunityTemplates(getShowAdult());
    filterAndRender();
  }

  function filterAndRender() {
    const q = searchInput.value.trim().toLowerCase();
    const filtered = q ? allTemplates.filter(t => t.name.toLowerCase().includes(q)) : allTemplates;
    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text-secondary);">' + (allTemplates.length ? 'Ничего не найдено' : 'Пока нет шаблонов. Будьте первым!') + '</div>';
      return;
    }
    renderGrid(filtered);
  }

  adultToggle.addEventListener('change', () => { setShowAdult(adultToggle.checked); loadTemplates(); });
  searchInput.addEventListener('input', filterAndRender);
  content.querySelector('#ct-close').onclick = close;
  content.querySelector('#ct-create').onclick = () => { close(); openCreateTemplate(); };

  loadTemplates();
}

async function applyTemplate(templateId, closeFn) {
  const template = await api.loadCommunityTemplate(templateId);
  if (!template || !template.items || template.items.length === 0) {
    eventBus.emit('toast:show', { text: 'Шаблон пуст или не найден', type: 'error' });
    return;
  }
  const storageKey = 'community_tpl_' + templateId;
  ss(storageKey, template.items);
  const poolContainer = document.getElementById('templatePoolContainer');
  if (poolContainer) poolContainer.style.display = 'flex';
  eventBus.emit('community:template:apply', { id: templateId, items: template.items, name: template.name });
  closeFn();
  eventBus.emit('toast:show', { text: `Шаблон "${template.name}" загружен!`, type: 'success' });
}

function openCreateTemplate() {
  const user = getCurrentUser();
  if (!user) {
    eventBus.emit('toast:show', { text: 'Войдите в аккаунт чтобы создать шаблон', type: 'error' });
    return;
  }

  const content = document.createElement('div');
  content.style.maxWidth = '540px';
  content.innerHTML = `
    <h3 style="color:var(--gold);margin-bottom:16px;">Создать шаблон</h3>
    <input type="text" id="ct-name" placeholder="Название шаблона (напр. «Хлеб», «Напитки»)" autocomplete="off"
      style="width:100%;padding:12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);margin-bottom:12px;">
    <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;margin-bottom:14px;">
      <input type="checkbox" id="ct-adult-flag" style="accent-color:#ff4444;">
      Контент 18+ (скрыт по умолчанию)
    </label>
    <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">Элементы (<span id="ct-count">0</span>):</div>
    <div id="ct-items-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:8px;min-height:60px;padding:10px;background:rgba(255,255,255,0.02);border:1px dashed var(--input-border);border-radius:10px;margin-bottom:12px;max-height:220px;overflow-y:auto;"></div>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <input type="text" id="ct-item-title" placeholder="Название элемента" autocomplete="off"
        style="flex:1;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.85rem;">
      <button class="btn btn-secondary" id="ct-add-item" style="white-space:nowrap;">+ Добавить</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px;">
      <input type="text" id="ct-item-img" placeholder="URL картинки (необязательно)" autocomplete="off"
        style="flex:1;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.8rem;">
      <button class="btn btn-secondary" id="ct-autosearch" style="white-space:nowrap;">🔍 Найти</button>
    </div>
    <div id="ct-img-preview" style="display:none;margin-bottom:10px;text-align:center;">
      <img id="ct-img-preview-img" style="max-height:80px;border-radius:8px;border:1px solid var(--input-border);" alt="">
    </div>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="ct-cancel">Отмена</button>
      <button class="btn btn-primary" id="ct-publish">Опубликовать</button>
    </div>
  `;

  const close = modalManager.open(content);
  const itemsList = content.querySelector('#ct-items-list');
  const itemTitleInput = content.querySelector('#ct-item-title');
  const itemImgInput = content.querySelector('#ct-item-img');
  const imgPreviewWrap = content.querySelector('#ct-img-preview');
  const imgPreviewEl = content.querySelector('#ct-img-preview-img');
  const addBtn = content.querySelector('#ct-add-item');
  const countEl = content.querySelector('#ct-count');
  const items = [];

  itemImgInput.addEventListener('input', () => {
    const v = itemImgInput.value.trim();
    if (v) { imgPreviewEl.src = v; imgPreviewWrap.style.display = 'block'; }
    else imgPreviewWrap.style.display = 'none';
  });

  function renderItems() {
    countEl.textContent = items.length;
    if (!items.length) {
      itemsList.innerHTML = '<span style="color:var(--text-secondary);font-size:0.8rem;grid-column:1/-1;text-align:center;padding:16px 0;">Добавьте хотя бы 3 элемента</span>';
      return;
    }
    itemsList.innerHTML = items.map((it, i) => `
      <div style="position:relative;background:var(--input-bg);border-radius:10px;padding:6px;text-align:center;border:1px solid var(--input-border);">
        <div style="width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;margin-bottom:4px;background:rgba(0,0,0,0.2);">
          ${it.img && !it.img.startsWith('data:image/svg') ? `<img src="${escapeHTML(it.img)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" alt="">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:1.5rem;">🖼</div>'}
        </div>
        <div style="font-size:0.72rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHTML(it.title)}">${escapeHTML(it.title)}</div>
        <button data-idx="${i}" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);border:none;color:#ff6b6b;cursor:pointer;width:20px;height:20px;border-radius:50%;font-size:0.75rem;display:flex;align-items:center;justify-content:center;">&times;</button>
      </div>
    `).join('');
    itemsList.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = () => { items.splice(parseInt(btn.dataset.idx), 1); renderItems(); };
    });
  }
  renderItems();

  async function addItem() {
    const title = itemTitleInput.value.trim();
    if (!title) return;
    const manualImg = itemImgInput.value.trim();
    itemTitleInput.value = '';
    itemImgInput.value = '';
    imgPreviewWrap.style.display = 'none';

    addBtn.disabled = true;
    addBtn.textContent = '⏳';

    const img = manualImg || await autoFindImage(title);

    addBtn.disabled = false;
    addBtn.textContent = '+ Добавить';
    items.push({ title, img, url: '#' });
    renderItems();
    itemTitleInput.focus();
  }

  addBtn.onclick = addItem;
  itemTitleInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });

  content.querySelector('#ct-autosearch').onclick = async () => {
    const title = itemTitleInput.value.trim();
    if (!title) { eventBus.emit('toast:show', { text: 'Введите название для поиска', type: 'info' }); return; }
    const btn = content.querySelector('#ct-autosearch');
    btn.disabled = true; btn.textContent = '⏳';
    const found = await autoFindImage(title);
    btn.disabled = false; btn.textContent = '🔍 Найти';
    if (found) {
      itemImgInput.value = found;
      imgPreviewEl.src = found;
      imgPreviewWrap.style.display = 'block';
      eventBus.emit('toast:show', { text: 'Картинка найдена!', type: 'success' });
    } else {
      eventBus.emit('toast:show', { text: 'Не нашлось — вставьте URL вручную', type: 'error' });
    }
  };

  content.querySelector('#ct-cancel').onclick = close;
  content.querySelector('#ct-publish').onclick = async () => {
    const name = content.querySelector('#ct-name').value.trim();
    const isAdult = content.querySelector('#ct-adult-flag').checked;
    if (!name) { eventBus.emit('toast:show', { text: 'Введите название шаблона', type: 'error' }); return; }
    if (items.length < 3) { eventBus.emit('toast:show', { text: 'Добавьте хотя бы 3 элемента', type: 'error' }); return; }
    const publishBtn = content.querySelector('#ct-publish');
    publishBtn.disabled = true; publishBtn.textContent = 'Публикация...';
    try {
      await api.publishTemplate({
        name, isAdult,
        items: items.map(i => ({ title: i.title, img: i.img, url: i.url })),
        authorId: user.uid,
        authorName: user.name || 'Аноним'
      });
      eventBus.emit('toast:show', { text: 'Шаблон опубликован!', type: 'success' });
      close();
    } catch (e) {
      publishBtn.disabled = false; publishBtn.textContent = 'Опубликовать';
      eventBus.emit('toast:show', { text: 'Ошибка: ' + e.message, type: 'error' });
    }
  };
}

export function initCommunityTemplates() {
  const btn = document.getElementById('openCommunityTemplatesBtn');
  if (btn) btn.addEventListener('click', openCommunityTemplates);

  // Обработка применения шаблона сообщества — загрузка его элементов в пул
  eventBus.on('community:template:apply', ({ items }) => {
    eventBus.emit('community:pool:set', items);
  });
}
