/**
 * @module ui/gallery
 * @description Галерея, публикация. Полная XSS-защита.
 */
import { api } from '../api/firestore.js';
import { getCurrentUser } from '../api/auth.js';
import { modalManager } from './modal-manager.js';
import { state } from '../core/state.js';
import { renderAll, showForeignBanner, hideForeignBanner } from './render.js';
import { eventBus } from '../core/event-bus.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { getDB } from '../api/firebase-init.js';
import { unlockAchievement } from './achievements.js';
import { openCommentsModal } from './comments.js';

let ctid = null;

// ФИКС: показываем баннер "чужой тир-лист", если у документа есть автор и это не текущий
// пользователь. Для черновиков без authorId (или своих) баннер скрываем.
function applyForeignBanner(doc) {
  const user = getCurrentUser();
  const isForeign = doc.authorId && doc.authorId !== 'anonymous' && (!user || doc.authorId !== user.uid);
  if (isForeign) showForeignBanner(); else hideForeignBanner();
}

// Открыть документ тир-листа (из галереи или из личного кабинета). Единый путь загрузки:
// парсим data → грузим в state → баннер «чужой» → синхронизируем тип шаблона → комментарии.
function openTierlistDoc(doc, closeFn) {
  let parsed;
  try { parsed = JSON.parse(doc.data); } catch { eventBus.emit('toast:show', { text: 'Ошибка загрузки тир-листа', type: 'error' }); return; }
  state.setData(parsed, 1);
  state.setMeta(doc.name || '', doc.description || '');
  ctid = doc.id;
  applyForeignBanner(doc);
  if (doc.templateType) {
    document.getElementById('templateSelect').value = doc.templateType;
    eventBus.emit('templates:changed', doc.templateType);
  }
  eventBus.emit('comments:load', ctid);
  if (closeFn) closeFn();
  renderAll();
}

export async function openGallery() {
  if (!getDB()) {
    eventBus.emit('toast:show', { text: 'Галерея недоступна', type: 'error' });
    return;
  }
  eventBus.emit('analytics:event', 'gallery_open');

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 class="m-modal-title">Галерея тир-листов</h3>
    <input type="text" id="gallerySearchInput" placeholder="Поиск по названию..." autocomplete="off"
      style="width:100%;padding:10px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);margin-bottom:10px;">
    <div id="galleryList" class="m-scroll"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeGallery">Закрыть</button>
      <button class="btn btn-primary" id="galleryPublishBtn">Опубликовать свой</button>
    </div>
  `;

  const close = modalManager.open(content);
  const list = content.querySelector('#galleryList');

  // ФИКС 7: скелетон-загрузка вместо пустого экрана, пока идёт запрос к серверу
  list.innerHTML = Array.from({ length: 5 }).map(() =>
    '<div class="skeleton-row"><div class="skeleton-line" style="width:60%"></div><div class="skeleton-line" style="width:35%"></div></div>'
  ).join('');

  // ФИКС ПОИСКА: раньше в галерее не было строки поиска вообще — можно было только
  // листать первые 20 тир-листов и всё. Firestore не умеет искать по тексту "из коробки",
  // поэтому подгружаем список побольше и ищем по названию прямо в браузере.
  const { items } = await api.fetchTierlists(60);
  let likedIds;
  try { likedIds = new Set(JSON.parse(localStorage.getItem('wt_liked_lists') || '[]')); }
  catch { likedIds = new Set(); }

  function renderList(filterText) {
    const q = (filterText || '').trim().toLowerCase();
    const filtered = q ? items.filter(doc => (doc.name || 'без названия').toLowerCase().includes(q)) : items;

    list.innerHTML = '';
    if (items.length === 0) {
      list.innerHTML = '<div class="m-empty">Пока пусто...</div>';
      return;
    }
    if (filtered.length === 0) {
      list.innerHTML = '<div class="m-empty">Ничего не найдено по запросу «' + escapeHTML(filterText) + '»</div>';
      return;
    }
    filtered.forEach(doc => {
      const div = document.createElement('div');
      div.className = 'm-row';
      const info = document.createElement('div');
      info.style.cursor = 'pointer';
      info.style.flex = '1';
      // XSS-ЗАЩИТА: escapeHTML для всех пользовательских данных
      info.innerHTML = '<strong>' + escapeHTML(doc.name || 'Без названия') + '</strong> (' + (doc.trackCount || 0) + ' треков)';
      info.onclick = () => openTierlistDoc(doc, close);

      // ФИКС 14: лайки — раньше поле likes в базе существовало, но нигде не показывалось
      const likeBtn = document.createElement('button');
      likeBtn.className = 'like-btn' + (likedIds.has(doc.id) ? ' liked' : '');
      likeBtn.innerHTML = '❤️ <span>' + (doc.likesCount || 0) + '</span>';
      likeBtn.disabled = likedIds.has(doc.id);
      likeBtn.onclick = async (e) => {
        e.stopPropagation();
        if (likedIds.has(doc.id)) return;
        likeBtn.disabled = true;
        const newCount = await api.likeTierlist(doc.id);
        if (newCount === 0) { likeBtn.disabled = false; return; }
        likeBtn.innerHTML = '❤️ <span>' + newCount + '</span>';
        likeBtn.classList.add('liked');
        likedIds.add(doc.id);
        localStorage.setItem('wt_liked_lists', JSON.stringify([...likedIds]));
        eventBus.emit('analytics:event', 'like');
        unlockAchievement('liked_list');
      };

      // Ф4-7: комментарии показываем контекстно — на карточке опубликованного листа
      // в галерее (там они реально сохраняются в БД), а не в глобальном меню «Ещё».
      const commentBtn = document.createElement('button');
      commentBtn.className = 'gallery-comment-btn';
      commentBtn.title = 'Комментарии';
      commentBtn.innerHTML = '💬';
      commentBtn.onclick = (e) => {
        e.stopPropagation();
        eventBus.emit('comments:load', doc.id);
        openCommentsModal();
      };

      div.appendChild(info);
      div.appendChild(commentBtn);
      div.appendChild(likeBtn);
      list.appendChild(div);
    });
  }

  // Ф6-4: debounce поиска — раньше renderList дёргался на каждый символ (перерисовка
  // до 60 карточек с картинками на каждое нажатие). 180 мс достаточно, чтобы дождаться
  // паузы в наборе.
  let searchTimer = null;
  content.querySelector('#gallerySearchInput').addEventListener('input', (e) => {
    const val = e.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => renderList(val), 180);
  });
  renderList('');

  content.querySelector('#closeGallery').onclick = close;

  content.querySelector('#galleryPublishBtn').onclick = () => publishCurrent(close);
}

// Публикация текущего тир-листа. Вынесено из обработчика галереи (Ф4-1), чтобы кнопку
// «Опубликовать» можно было вызывать и прямо из шапки, без открытия галереи.
// closeFn (необязателен) — колбэк закрытия галереи, если публикация идёт из неё.
export async function publishCurrent(closeFn) {
  if (!getDB()) {
    eventBus.emit('toast:show', { text: 'Публикация недоступна', type: 'error' });
    return;
  }
  const data = state.data1;
  if (!data || data.length === 0 || data.every(t => t.items.length === 0)) {
    eventBus.emit('toast:show', { text: 'Тир-лист пуст!', type: 'error' });
    return;
  }

  const meta = await publishMetaDialog(state.title || 'Мой тир-лист', state.desc || '');
  if (!meta) return;
  const { name, description } = meta;
  if (!name) return;

  const user = getCurrentUser();
  try {
    const templateType = document.getElementById('templateSelect')?.value || 'music';
    const id = await api.publishTierlist({
      name: name,
      description: description,
      templateType: templateType,
      data: JSON.stringify(data),
      trackCount: data.reduce((s, t) => s + t.items.length, 0),
      likes: [],
      likesCount: 0,
      visibility: 'public',
      authorId: user ? user.uid : 'anonymous',
      // ФИКС: у объекта пользователя Firebase Auth нет поля "name" — только displayName.
      // Раньше имя автора всегда сохранялось пустым для залогиненных пользователей.
      authorName: user ? (user.name || user.email || 'Без имени') : 'Аноним'
    });
    ctid = id;
    eventBus.emit('comments:load', id);
    eventBus.emit('analytics:event', 'publish');
    eventBus.emit('toast:show', { text: 'Опубликовано!', type: 'success' });
    unlockAchievement('first_publish');
    if (closeFn) closeFn();
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка публикации', type: 'error' });
  }
}

// Модалка публикации: название + описание. Возвращает {name, description} или null (отмена).
function publishMetaDialog(defName, defDesc) {
  return new Promise(resolve => {
    const content = document.createElement('div');
    content.innerHTML = `
      <h3 class="m-modal-title">Публикация тир-листа</h3>
      <label style="display:block;font-size:0.82rem;color:var(--text-secondary);margin:10px 0 4px;">Название</label>
      <input type="text" id="pub-name" maxlength="80" value="${escapeHTML(defName)}"
        style="width:100%;padding:10px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);outline:none;">
      <label style="display:block;font-size:0.82rem;color:var(--text-secondary);margin:12px 0 4px;">Описание</label>
      <textarea id="pub-desc" maxlength="300" rows="3" placeholder="Необязательно…"
        style="width:100%;padding:10px 12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);outline:none;resize:vertical;font-family:inherit;">${escapeHTML(defDesc)}</textarea>
      <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:10px;margin-top:16px;">
        <button class="btn btn-secondary" data-action="cancel">Отмена</button>
        <button class="btn btn-primary" data-action="ok">Опубликовать</button>
      </div>
    `;
    const close = modalManager.open(content, { closeOnEscape: true });
    const nameEl = content.querySelector('#pub-name');
    const descEl = content.querySelector('#pub-desc');
    if (nameEl) { nameEl.focus(); nameEl.select(); }
    let settled = false;
    const done = val => { if (settled) return; settled = true; close(); resolve(val); };
    content.querySelector('[data-action="ok"]').onclick = () =>
      done({ name: (nameEl?.value || '').trim(), description: (descEl?.value || '').trim() });
    content.querySelector('[data-action="cancel"]').onclick = () => done(null);
  });
}

export async function openUserDashboard() {
  const user = getCurrentUser();
  if (!user) {
    eventBus.emit('toast:show', { text: 'Пожалуйста, авторизуйтесь', type: 'error' });
    return;
  }

  const items = await api.fetchUserLists(user.uid);

  const content = document.createElement('div');
  content.style.width = '600px';
  content.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <img src="${escapeHTML(user.photo || '')}" alt="" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid var(--gold);${user.photo ? '' : 'display:none;'}">
      <div>
        <h3 style="color:var(--gold);margin:0;">${escapeHTML(user.name || 'Личный кабинет')}</h3>
        <span style="font-size:0.78rem;color:var(--text-secondary);">${escapeHTML(user.email || '')}</span>
      </div>
    </div>
    <div style="display:flex;gap:20px;margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.02);border-radius:10px;border:1px solid var(--input-border);">
      <div>📊 Всего: <strong style="color:var(--gold);" id="statTotalLists">${items.length}</strong></div>
      <div>❤️ Лайков: <strong style="color:var(--gold);" id="statTotalLikes">${items.reduce((s, d) => s + (d.likesCount || 0), 0)}</strong></div>
    </div>
    <div id="userCreatedLists" style="max-height:250px;overflow-y:auto;"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeDashboard">Закрыть</button>
    </div>
  `;

  const close = modalManager.open(content);

  const list = content.querySelector('#userCreatedLists');
  if (items.length === 0) {
    list.innerHTML = '<div class="m-empty">Вы еще не опубликовали ни одного тир-листа</div>';
  } else {
    items.forEach(doc => {
      const div = document.createElement('div');
      div.className = 'm-row';
      // XSS-ЗАЩИТА
      div.innerHTML = '<div><strong>' + escapeHTML(doc.name || 'Без названия') + '</strong></div>' +
        '<button class="btn btn-secondary" style="padding:4px 10px;font-size:0.8rem;">Открыть</button>';
      div.querySelector('button').onclick = () => openTierlistDoc(doc, close);
      list.appendChild(div);
    });
  }

  content.querySelector('#closeDashboard').onclick = close;
}
