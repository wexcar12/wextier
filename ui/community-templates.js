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
import { searchDuckDuckGo, searchWikiThumbnail, updatePoolItems, renderTemplatePool } from './templates.js';

const P = 'wt_';
function sg(k, f) { try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; } }
function ss(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

function getShowAdult() { return sg('show_adult_templates', false); }
function setShowAdult(v) { ss('show_adult_templates', v); }

export async function openCommunityTemplates() {
  if (!getDB()) {
    eventBus.emit('toast:show', { text: 'Firebase недоступен', type: 'error' });
    return;
  }

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);margin-bottom:16px;">Шаблоны сообщества</h3>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px;">
      <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;">
        <input type="checkbox" id="ct-adult-toggle" ${getShowAdult() ? 'checked' : ''} style="accent-color:var(--gold);">
        Показывать 18+
      </label>
    </div>
    <div id="ct-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;max-height:400px;overflow-y:auto;padding:4px;"></div>
    <div class="modal-actions" style="margin-top:16px;">
      <button class="btn btn-secondary" id="ct-close">Закрыть</button>
      <button class="btn btn-primary" id="ct-create">+ Добавить шаблон</button>
    </div>
  `;

  const close = modalManager.open(content);
  const grid = content.querySelector('#ct-grid');
  const adultToggle = content.querySelector('#ct-adult-toggle');

  async function loadTemplates() {
    grid.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary);">Загрузка...</div>';
    const templates = await api.fetchCommunityTemplates(getShowAdult());
    if (templates.length === 0) {
      grid.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-secondary);">Пока нет шаблонов. Будьте первым!</div>';
      return;
    }
    grid.innerHTML = templates.map(t => `
      <div class="ct-card" data-id="${t.id}" style="background:var(--card-bg);border:1px solid var(--input-border);border-radius:12px;padding:10px;cursor:pointer;transition:border-color 0.2s,transform 0.2s;text-align:center;position:relative;">
        ${t.isAdult ? '<span style="position:absolute;top:4px;right:6px;font-size:0.65rem;background:#ff4444;color:#fff;padding:1px 5px;border-radius:6px;">18+</span>' : ''}
        <div style="display:flex;gap:2px;justify-content:center;flex-wrap:wrap;margin-bottom:8px;height:48px;overflow:hidden;">
          ${(t.items || []).slice(0, 4).map(i => `<img src="${escapeHTML(i.img || '')}" style="width:22px;height:22px;object-fit:cover;border-radius:4px;" alt="">`).join('')}
        </div>
        <div style="font-size:0.78rem;color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(t.name)}</div>
        <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:2px;">${t.items ? t.items.length : 0} элементов</div>
      </div>
    `).join('');

    grid.querySelectorAll('.ct-card').forEach(card => {
      card.addEventListener('mouseenter', () => { card.style.borderColor = 'var(--gold)'; card.style.transform = 'translateY(-2px)'; });
      card.addEventListener('mouseleave', () => { card.style.borderColor = 'var(--input-border)'; card.style.transform = ''; });
      card.addEventListener('click', () => applyTemplate(card.dataset.id, close));
    });
  }

  adultToggle.addEventListener('change', () => {
    setShowAdult(adultToggle.checked);
    loadTemplates();
  });

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
  // Сохраняем как custom_items для текущего типа "community_<id>"
  const storageKey = 'community_tpl_' + templateId;
  ss(storageKey, template.items);

  // Применяем: загружаем элементы шаблона в пул
  const poolContainer = document.getElementById('templatePoolContainer');
  if (poolContainer) poolContainer.style.display = 'flex';

  // Эмитим событие для загрузки шаблона сообщества
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
    <input type="text" id="ct-name" placeholder="Название шаблона" autocomplete="off" style="width:100%;padding:12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);margin-bottom:12px;">
    <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;margin-bottom:14px;">
      <input type="checkbox" id="ct-adult-flag" style="accent-color:#ff4444;">
      Контент 18+ (будет скрыт по умолчанию)
    </label>
    <div style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:8px;">Элементы шаблона (<span id="ct-count">0</span>):</div>
    <div id="ct-items-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;min-height:60px;padding:12px;background:rgba(255,255,255,0.02);border:1px dashed var(--input-border);border-radius:10px;margin-bottom:12px;max-height:240px;overflow-y:auto;"></div>
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:stretch;">
      <input type="text" id="ct-item-title" placeholder="Название элемента" autocomplete="off" style="flex:1;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.85rem;">
      <button class="btn btn-secondary" id="ct-add-item" style="white-space:nowrap;min-width:90px;">+ Добавить</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;">
      <input type="text" id="ct-item-img" placeholder="URL картинки (необязательно)" autocomplete="off" style="flex:1;padding:10px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);font-size:0.8rem;">
      <span style="font-size:0.72rem;color:var(--text-secondary);white-space:nowrap;">или автопоиск</span>
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
  const addBtn = content.querySelector('#ct-add-item');
  const countEl = content.querySelector('#ct-count');
  const items = [];

  function renderItems() {
    countEl.textContent = items.length;
    if (items.length === 0) {
      itemsList.innerHTML = '<span style="color:var(--text-secondary);font-size:0.8rem;grid-column:1/-1;text-align:center;padding:16px 0;">Добавьте хотя бы 3 элемента</span>';
      return;
    }
    itemsList.innerHTML = items.map((it, i) => `
      <div class="ct-item-card" style="position:relative;background:var(--input-bg);border-radius:10px;padding:6px;text-align:center;border:1px solid var(--input-border);transition:border-color 0.2s;">
        <div style="width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;margin-bottom:4px;background:rgba(0,0,0,0.2);">
          ${it.img && !it.img.startsWith('data:image/svg') ? `<img src="${escapeHTML(it.img)}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);font-size:1.5rem;">🖼</div>'}
        </div>
        <div style="font-size:0.72rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHTML(it.title)}">${escapeHTML(it.title)}</div>
        <button data-idx="${i}" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);border:none;color:#ff6b6b;cursor:pointer;width:20px;height:20px;border-radius:50%;font-size:0.75rem;line-height:1;display:flex;align-items:center;justify-content:center;">&times;</button>
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

    addBtn.disabled = true;
    addBtn.textContent = '⏳';

    let img = '';
    if (manualImg) {
      img = manualImg;
    } else {
      img = await searchDuckDuckGo(title + ' photo') || await searchWikiThumbnail(title) || '';
    }

    addBtn.disabled = false;
    addBtn.textContent = '+ Добавить';

    items.push({ title, img, url: '#' });
    renderItems();
    itemTitleInput.focus();
  }

  addBtn.onclick = addItem;
  itemTitleInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(); }
  });

  content.querySelector('#ct-cancel').onclick = close;
  content.querySelector('#ct-publish').onclick = async () => {
    const name = content.querySelector('#ct-name').value.trim();
    const isAdult = content.querySelector('#ct-adult-flag').checked;

    if (!name) { eventBus.emit('toast:show', { text: 'Введите название шаблона', type: 'error' }); return; }
    if (items.length < 3) { eventBus.emit('toast:show', { text: 'Добавьте хотя бы 3 элемента', type: 'error' }); return; }

    const publishBtn = content.querySelector('#ct-publish');
    publishBtn.disabled = true;
    publishBtn.textContent = 'Публикация...';

    try {
      await api.publishTemplate({
        name,
        isAdult,
        items: items.map(i => ({ title: i.title, img: i.img, url: i.url })),
        authorId: user.uid,
        authorName: user.name || 'Аноним'
      });
      eventBus.emit('toast:show', { text: 'Шаблон опубликован!', type: 'success' });
      close();
    } catch (e) {
      publishBtn.disabled = false;
      publishBtn.textContent = 'Опубликовать';
      eventBus.emit('toast:show', { text: 'Ошибка публикации: ' + e.message, type: 'error' });
    }
  };
}

export function initCommunityTemplates() {
  const btn = document.getElementById('openCommunityTemplatesBtn');
  if (btn) btn.addEventListener('click', openCommunityTemplates);

  // Обработка применения шаблона сообщества — загрузка его элементов в пул
  eventBus.on('community:template:apply', ({ items, name }) => {
    // Устанавливаем кастомный шаблон: сохраняем как custom_items для спец-типа
    ss('custom_items_community', items);
    // Переключаем select на music (чтобы не конфликтовать с встроенным) и сразу рендерим пул вручную
    const select = document.getElementById('templateSelect');
    if (select) select.value = 'music';
    // Напрямую ставим пул из шаблона сообщества
    eventBus.emit('community:pool:set', items);
  });
}
