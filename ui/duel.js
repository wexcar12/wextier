/**
 * @module ui/duel
 * @description Дуэли тир-листов.
 */
import { api } from '../api/firestore.js';
import { state } from '../core/state.js';
import { setCompare } from './render.js';
import { renderAll } from './render.js';
import { getCurrentTierlistId, setCurrentTierlistId } from './gallery.js';
import { eventBus } from '../core/event-bus.js';
import { modalManager } from './modal-manager.js';

let duelLeftId = null;
let duelRightId = null;

export async function openDuel() {
  if (!api) {
    eventBus.emit('toast:show', { text: 'Недоступно', type: 'error' });
    return;
  }

  const { items } = await api.fetchTierlists(20);

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
      div.innerHTML = '<input type="radio" name="duelSelect" value="' + doc.id + '"> ' + (doc.name || 'Без названия') + ' (' + (doc.wins || 0) + ' побед)';
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

    try {
      const doc = await api.loadTierlist(sel.value);
      if (doc) {
        setCompare(true);
        state.setData(JSON.parse(doc.data), 2);
        duelLeftId = getCurrentTierlistId();
        duelRightId = sel.value;

        const bar = document.getElementById('duelVoteBar');
        if (bar) bar.classList.add('show');
        const leftWins = document.getElementById('duelLeftWins');
        const rightWins = document.getElementById('duelRightWins');
        if (leftWins) leftWins.textContent = duelLeftId ? '?' : '0';
        if (rightWins) rightWins.textContent = doc.wins || 0;

        close();
        renderAll();
        eventBus.emit('toast:show', { text: 'Дуэль началась! Голосуйте за победителя!', type: 'success' });
      }
    } catch (e) {
      eventBus.emit('toast:show', { text: 'Ошибка загрузки соперника', type: 'error' });
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