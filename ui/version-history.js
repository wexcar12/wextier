/**
 * @module ui/version-history
 * @description ФИКС 9: история версий — автоматические снапшоты тир-листа, к которым можно
 * вернуться. Снапшот сохраняется не при каждом клике (это было бы слишком часто), а не чаще
 * одного раза в 5 минут активности — так набирается осмысленная история изменений, а не мусор.
 */
import { state } from '../core/state.js';
import { renderAll } from './render.js';
import { modalManager } from './modal-manager.js';
import { eventBus } from '../core/event-bus.js';
import { sg, ss } from '../utils/storage.js';

const MAX_SNAPSHOTS = 12;
const MIN_INTERVAL_MS = 5 * 60 * 1000; // не чаще раза в 5 минут

function getSnapshots() { return sg('version_history', []); }
function setSnapshots(list) { ss('version_history', list); }

let lastSnapshotAt = 0;

export function maybeTakeSnapshot() {
  const now = Date.now();
  if (now - lastSnapshotAt < MIN_INTERVAL_MS) return;
  lastSnapshotAt = now;

  const list = getSnapshots();
  const dataStr = JSON.stringify(state.data1);
  if (list.length > 0 && list[list.length - 1].dataStr === dataStr) return; // ничего не поменялось

  list.push({ ts: now, dataStr });
  while (list.length > MAX_SNAPSHOTS) list.shift();
  setSnapshots(list);
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function openVersionHistory() {
  const list = getSnapshots().slice().reverse();

  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">История версий</h3>
    <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:12px;">
      Снапшоты сохраняются автоматически, не чаще раза в 5 минут активности. Последние ${MAX_SNAPSHOTS} версий хранятся в этом браузере.
    </p>
    <div id="versionList" style="max-height:340px;overflow-y:auto;"></div>
    <div class="modal-actions"><button class="btn btn-secondary" id="closeHistory">Закрыть</button></div>
  `;
  const close = modalManager.open(content);

  const listEl = content.querySelector('#versionList');
  if (list.length === 0) {
    listEl.innerHTML = '<div style="color:#888;text-align:center;padding:14px;">Пока нет сохранённых версий — они появятся по мере работы над тир-листом.</div>';
  } else {
    list.forEach((snap, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 12px;margin-bottom:6px;background:rgba(255,255,255,0.05);border-radius:8px;';
      row.innerHTML = `<span>${idx === 0 ? '🕐 Последняя версия — ' : ''}${formatDate(snap.ts)}</span>`;
      const restoreBtn = document.createElement('button');
      restoreBtn.className = 'btn btn-secondary';
      restoreBtn.textContent = 'Восстановить';
      restoreBtn.style.padding = '6px 12px';
      restoreBtn.onclick = () => {
        const confirmContent = document.createElement('div');
        confirmContent.style.padding = '20px';
        confirmContent.innerHTML = `
          <p style="margin-bottom:16px;color:var(--text);">Вернуться к этой версии? Текущие изменения будут заменены (их тоже можно будет найти здесь же чуть позже).</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;">
            <button class="btn btn-secondary" data-action="cancel">Отмена</button>
            <button class="btn btn-primary" data-action="ok" style="background:#ff4d6d;">Восстановить</button>
          </div>
        `;
        const closeConfirm = modalManager.open(confirmContent, { closeOnEscape: true });
        confirmContent.querySelector('[data-action="cancel"]').onclick = () => closeConfirm();
        confirmContent.querySelector('[data-action="ok"]').onclick = () => {
          closeConfirm();
          state.setData(JSON.parse(snap.dataStr), 1);
          state._save();
          renderAll();
          close();
          eventBus.emit('toast:show', { text: 'Версия восстановлена', type: 'success' });
        };
      };
      row.appendChild(restoreBtn);
      listEl.appendChild(row);
    });
  }

  content.querySelector('#closeHistory').onclick = close;
}
