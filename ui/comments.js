/**
 * @module ui/comments
 * @description Комментарии к тир-листам.
 */
import { api } from '../api/firestore.js';
import { eventBus } from '../core/event-bus.js';
import { modalManager } from './modal-manager.js';

let comments = [];
let ctid = null;

export function setCommentsTierlistId(id) { ctid = id; }

export async function loadComments(id) {
  ctid = id;
  if (!id || !api) {
    comments = [];
    return;
  }
  try {
    comments = await api.loadComments(id);
  } catch (e) {
    comments = [];
  }
}

export async function addComment(text) {
  if (!text) return;

  if (!api || !ctid) {
    comments.push({
      id: Date.now().toString(),
      text: text,
      createdAt: new Date()
    });
    updateCommentsDisplay();
    return;
  }

  try {
    await api.addComment(ctid, text);
    await loadComments(ctid);
    updateCommentsDisplay();
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка при отправке комментария', type: 'error' });
  }
}

export function updateCommentsDisplay() {
  const list = document.getElementById('commentsList');
  if (!list) return;

  if (comments.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Пока нет комментариев</div>';
    return;
  }

  list.innerHTML = comments.map(c => {
    return '<div style="margin-bottom:6px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">' +
      '<div style="font-size:0.85rem;">' + escapeHTML(c.text) + '</div>' +
      (c.createdAt ? '<div style="font-size:0.7rem;color:#888;margin-top:4px;">' + new Date(c.createdAt.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleString() + '</div>' : '') +
      '</div>';
  }).join('');
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[tag] || tag));
}

export function openCommentsModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Комментарии</h3>
    <div id="commentsList" style="max-height:200px;overflow-y:auto;margin-bottom:10px;"></div>
    <textarea id="newComment" placeholder="Оставьте комментарий..." style="width:100%;padding:12px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:10px;color:var(--text);outline:none;margin-bottom:12px;font-family:inherit;"></textarea>
    <div class="modal-actions">
      <button class="btn btn-secondary" id="closeComments">Закрыть</button>
      <button class="btn btn-primary" id="addCommentBtn">Отправить</button>
    </div>
  `;

  const close = modalManager.open(content);

  updateCommentsDisplay();

  content.querySelector('#closeComments').onclick = close;
  content.querySelector('#addCommentBtn').onclick = async () => {
    const text = content.querySelector('#newComment').value.trim();
    if (!text) return;
    content.querySelector('#newComment').value = '';
    await addComment(text);
    updateCommentsDisplay();
  };
}

// Подписка на события
eventBus.on('comments:load', (id) => {
  loadComments(id);
});