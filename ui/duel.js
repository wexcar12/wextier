/**
 * @module ui/duel
 * @description Дуэли тир-листов.
 */
import { api } from '../api/firestore.js';
import { getCurrentUser } from '../api/auth.js';
import { state } from '../core/state.js';
import { setCompare } from './render.js';
import { renderAll } from './render.js';
import { getCurrentTierlistId, setCurrentTierlistId } from './gallery.js';
import { eventBus } from '../core/event-bus.js';
import { modalManager } from './modal-manager.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { unlockAchievement } from './achievements.js';

let duelLeftId = null;
let duelRightId = null;

export async function openDuel() {
  if (!api) {
    eventBus.emit('toast:show', { text: 'Недоступно', type: 'error' });
    return;
  }

  const { items } = await api.fetchTierlists(20);
  unlockAchievement('duel_participant');

  const content = document.createElement('div');
  content.style.width = '600px';
  content.innerHTML = `
    <h3 style="color:var(--gold);">Дуэль тир-листов</h3>
    <p style="color:var(--text-secondary);margin-bottom:8px;">Выберите соперника и начните дуэль.</p>
    <div id="duelList" style="max-height:300px;overflow-y:auto;"></div>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-secondary" id="closeDuel">Закрыть</button>
      <button class="btn btn-primary" id="startDuelBtn">Начать дуэль</button>
    </div>
  `;

  const close = modalManager.open(content);

  const list = content.querySelector('#duelList');
  if (items.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Пусто...</div>';
  } else {
    items.forEach(doc => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:8px;margin-bottom:4px;background:rgba(255,255,255,0.05);border-radius:6px;';
      // ФИКС: раньше имя соперника вставлялось в HTML БЕЗ escapeHTML — это дыра для XSS
      // (кто угодно мог опубликовать тир-лист с вредоносным кодом в названии).
      div.innerHTML = '<input type="radio" name="duelSelect" value="' + doc.id + '"> ' + escapeHTML(doc.name || 'Без названия') + ' (' + (doc.wins || 0) + ' побед)';
      list.appendChild(div);
    });
  }

  content.querySelector('#closeDuel').onclick = close;

  content.querySelector('#startDuelBtn').onclick = async () => {
    const sel = content.querySelector('input[name="duelSelect"]:checked');
    if (!sel) {
      eventBus.emit('toast:show', { text: 'Выберите соперника', type: 'error' });
      return;
    }

    const startBtn = content.querySelector('#startDuelBtn');
    startBtn.disabled = true;

    try {
      const doc = await api.loadTierlist(sel.value);
      if (!doc) throw new Error('opponent not found');

      // ФИКС: раньше id "своего" тир-листа брался только если его открывали через Галерею —
      // в обычном сценарии (сразу нажали "Дуэль" из бокового меню) он был пустым, и кнопка
      // "Левый" всегда отвечала "Опубликуйте тир-лист". Теперь публикуем автоматически.
      let leftId = getCurrentTierlistId();
      let leftWinsCount = 0;
      if (!leftId) {
        const data = state.data1;
        if (!data || data.every(t => t.items.length === 0)) {
          eventBus.emit('toast:show', { text: 'Сначала добавьте хотя бы один элемент в свой тир-лист', type: 'error' });
          startBtn.disabled = false;
          return;
        }
        const user = getCurrentUser();
        leftId = await api.publishTierlist({
          name: 'Мой тир-лист',
          templateType: document.getElementById('templateSelect')?.value || 'music',
          data: JSON.stringify(data),
          trackCount: data.reduce((s, t) => s + t.items.length, 0),
          wins: 0, likes: [], likesCount: 0, visibility: 'public',
          authorId: user ? user.uid : 'anonymous',
          authorName: user ? user.name : 'Аноним'
        });
        setCurrentTierlistId(leftId);
      } else {
        const leftDoc = await api.loadTierlist(leftId);
        leftWinsCount = (leftDoc && leftDoc.wins) || 0;
      }

      setCompare(true);
      state.setData(JSON.parse(doc.data), 2);
      duelLeftId = leftId;
      duelRightId = sel.value;

      const bar = document.getElementById('duelVoteBar');
      if (bar) bar.classList.add('show');
      const leftWins = document.getElementById('duelLeftWins');
      const rightWins = document.getElementById('duelRightWins');
      // ФИКС: раньше здесь всегда показывался буквальный знак "?" вместо числа побед
      if (leftWins) leftWins.textContent = leftWinsCount;
      if (rightWins) rightWins.textContent = doc.wins || 0;

      close();
      renderAll();
      eventBus.emit('toast:show', { text: 'Дуэль началась! Голосуйте за победителя!', type: 'success' });
    } catch (e) {
      eventBus.emit('toast:show', { text: 'Ошибка загрузки соперника', type: 'error' });
    } finally {
      startBtn.disabled = false;
    }
  };
}

export async function voteFor(side) {
  const id = side === 'left' ? duelLeftId : duelRightId;
  if (!api) {
    eventBus.emit('toast:show', { text: 'Голосование недоступно', type: 'error' });
    return;
  }
  if (!id || id === 'local') {
    eventBus.emit('toast:show', { text: 'Опубликуйте тир-лист, чтобы участвовать', type: 'error' });
    return;
  }

  try {
    const newWins = await api.voteFor(id);
    // ФИКС: раньше счётчик на экране не обновлялся вообще после голоса
    const counterEl = document.getElementById(side === 'left' ? 'duelLeftWins' : 'duelRightWins');
    if (counterEl) counterEl.textContent = newWins;
    eventBus.emit('toast:show', { text: 'Голос учтён! Всего побед: ' + newWins, type: 'success' });

    const bar = document.getElementById('duelVoteBar');
    if (bar) bar.classList.remove('show');
    duelLeftId = null;
    duelRightId = null;
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка голосования', type: 'error' });
  }
}

export function setupDuelButtons() {
  const voteLeft = document.getElementById('voteLeftBtn');
  const voteRight = document.getElementById('voteRightBtn');
  if (voteLeft) voteLeft.onclick = () => voteFor('left');
  if (voteRight) voteRight.onclick = () => voteFor('right');
}