/**
 * @module ui/gallery
 * @description Галерея, топ, публикация.
 */
import { api } from '../api/firestore.js';
import { getCurrentUser } from '../api/auth.js';
import { modalManager } from './modal-manager.js';
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { eventBus } from '../core/event-bus.js';

let ctid = null;

export function getCurrentTierlistId() { return ctid; }
export function setCurrentTierlistId(id) { ctid = id; }

export async function openGallery() {
  if (!api) {
    window.toast('Галерея недоступна');
    return;
  }

  const { items } = await api.fetchTierlists(20);

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Галерея тир-листов</h3>
    <div id="galleryList" style="max-height:350px;overflow-y:auto;"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeGallery">Закрыть</button>
      <button class="btn btn-primary" id="publishBtn">Опубликовать свой</button>
    </div>
  `;

  const close = modalManager.open(content);

  const list = content.querySelector('#galleryList');
  if (items.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Пока пусто...</div>';
  } else {
    items.forEach(doc => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';
      div.innerHTML = '<strong>' + (doc.name || 'Без названия') + '</strong> (' + (doc.wins || 0) + ' побед, ' + (doc.trackCount || 0) + ' треков)';
      div.onclick = async () => {
        state.setData(JSON.parse(doc.data), 1);
        ctid = doc.id;
        if (doc.templateType) {
          document.getElementById('templateSelect').value = doc.templateType;
          eventBus.emit('templates:changed', doc.templateType);
        }
        eventBus.emit('comments:load', ctid);
        close();
        renderAll();
      };
      list.appendChild(div);
    });
  }

  content.querySelector('#closeGallery').onclick = close;

  content.querySelector('#publishBtn').onclick = async () => {
    const data = state.data1;
    if (!data || data.length === 0 || data.every(t => t.items.length === 0)) {
      eventBus.emit('toast:show', { text: 'Тир-лист пуст!', type: 'error' });
      return;
    }

    const name = prompt('Название:', 'Мой тир-лист');
    if (!name) return;

    const user = getCurrentUser();
    try {
      const templateType = document.getElementById('templateSelect')?.value || 'music';
      const id = await api.publishTierlist({
        name: name,
        templateType: templateType,
        data: JSON.stringify(data),
        trackCount: data.reduce((s, t) => s + t.items.length, 0),
        wins: 0,
        likes: [],
        likesCount: 0,
        visibility: 'public',
        authorId: user ? user.uid : 'anonymous',
        authorName: user ? user.name : 'Аноним'
      });
      ctid = id;
      eventBus.emit('toast:show', { text: 'Опубликовано!', type: 'success' });
      close();
    } catch (e) {
      eventBus.emit('toast:show', { text: 'Ошибка публикации', type: 'error' });
    }
  };
}

export async function openTop() {
  if (!api) {
    window.toast('Недоступно');
    return;
  }

  const items = await api.fetchTopTierlists(20);

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Топ тир-листов</h3>
    <div id="topList" style="max-height:350px;overflow-y:auto;"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeTop">Закрыть</button>
    </div>
  `;

  const close = modalManager.open(content);

  const list = content.querySelector('#topList');
  let rank = 1;
  const filtered = items.filter(d => d.wins && d.wins > 0);

  if (filtered.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Пока никто не побеждал...</div>';
  } else {
    filtered.forEach(doc => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;cursor:pointer;';
      let medal = '';
      if (rank === 1) medal = '🥇';
      else if (rank === 2) medal = '🥈';
      else if (rank === 3) medal = '🥉';
      div.innerHTML = medal + ' <strong>#' + rank + '</strong> ' + (doc.name || 'Без названия') + ' (' + (doc.wins || 0) + ' побед)';
      div.onclick = async () => {
        state.setData(JSON.parse(doc.data), 1);
        ctid = doc.id;
        if (doc.templateType) {
          document.getElementById('templateSelect').value = doc.templateType;
          eventBus.emit('templates:changed', doc.templateType);
        }
        eventBus.emit('comments:load', ctid);
        close();
        renderAll();
      };
      list.appendChild(div);
      rank++;
    });
  }

  content.querySelector('#closeTop').onclick = close;
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
    <h3 style="color:var(--gold);">Личный кабинет</h3>
    <div style="display:flex;gap:20px;margin-bottom:16px;padding:12px;background:rgba(255,255,255,0.02);border-radius:10px;border:1px solid var(--input-border);">
      <div>📊 Всего: <strong style="color:var(--gold);" id="statTotalLists">${items.length}</strong></div>
      <div>🏆 Побед: <strong style="color:var(--gold);" id="statTotalWins">${items.reduce((s, d) => s + (d.wins || 0), 0)}</strong></div>
    </div>
    <div id="userCreatedLists" style="max-height:250px;overflow-y:auto;"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeDashboard">Закрыть</button>
    </div>
  `;

  const close = modalManager.open(content);

  const list = content.querySelector('#userCreatedLists');
  if (items.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Вы еще не опубликовали ни одного тир-листа</div>';
  } else {
    items.forEach(doc => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:10px;margin-bottom:6px;background:rgba(255,255,255,0.04);border-radius:8px;display:flex;justify-content:space-between;align-items:center;';
      div.innerHTML = '<div><strong>' + (doc.name || 'Без названия') + '</strong><br><span style="font-size:0.75rem;color:var(--gold);">Побед: ' + (doc.wins || 0) + '</span></div>' +
        '<button class="btn btn-secondary" style="padding:4px 10px;font-size:0.8rem;">Открыть</button>';
      div.querySelector('button').onclick = () => {
        state.setData(JSON.parse(doc.data), 1);
        ctid = doc.id;
        if (doc.templateType) {
          document.getElementById('templateSelect').value = doc.templateType;
          eventBus.emit('templates:changed', doc.templateType);
        }
        eventBus.emit('comments:load', ctid);
        close();
        renderAll();
      };
      list.appendChild(div);
    });
  }

  content.querySelector('#closeDashboard').onclick = close;
}