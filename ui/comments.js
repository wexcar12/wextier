/**
 * @module ui/comments
 * @description Комментарии к тир-листам. ФИКС 16: теперь с ответами (треды в один уровень —
 * достаточно для обсуждения, без бесконечной вложенности).
 */
import { api } from '../api/firestore.js';
import { getDB } from '../api/firebase-init.js';
import { eventBus } from '../core/event-bus.js';
import { modalManager } from './modal-manager.js';
import { escapeHTML } from '../utils/sanitizers.js';
import { unlockAchievement } from './achievements.js';

let comments = [];
let ctid = null;

export function setCommentsTierlistId(id) { ctid = id; }

export async function loadComments(id) {
  ctid = id;
  if (!id || !getDB()) {
    comments = [];
    return;
  }
  try {
    comments = await api.loadComments(id);
  } catch (e) {
    comments = [];
  }
}

export async function addComment(text, parentId = null) {
  if (!text) return;

  if (!getDB() || !ctid) {
    comments.push({
      id: Date.now().toString(),
      text: text,
      parentId: parentId || null,
      createdAt: new Date()
    });
    updateCommentsDisplay();
    return;
  }

  try {
    await api.addComment(ctid, text, parentId);
    await loadComments(ctid);
    updateCommentsDisplay();
  } catch (e) {
    eventBus.emit('toast:show', { text: 'Ошибка при отправке комментария', type: 'error' });
  }
}

function formatDate(c) {
  if (!c.createdAt) return '';
  return new Date(c.createdAt.seconds ? c.createdAt.seconds * 1000 : c.createdAt).toLocaleString();
}

function renderReplyBox(parentId) {
  return `
    <div class="reply-box" id="reply-box-${parentId}" style="display:none;margin-top:8px;">
      <textarea class="reply-input" data-parent="${parentId}" placeholder="Ответить..." style="width:100%;padding:8px;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;color:var(--text);outline:none;font-family:inherit;font-size:0.85rem;"></textarea>
      <button class="btn btn-primary reply-send-btn" data-parent="${parentId}" style="padding:6px 12px;margin-top:6px;font-size:0.8rem;">Ответить</button>
    </div>
  `;
}

export function updateCommentsDisplay() {
  const list = document.getElementById('commentsList');
  if (!list) return;

  if (comments.length === 0) {
    list.innerHTML = '<div style="color:#888;text-align:center;padding:10px;">Пока нет комментариев</div>';
    return;
  }

  // ФИКС 16: разбираем на верхнеуровневые комментарии + их ответы (один уровень вложенности)
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  list.innerHTML = topLevel.map(c => {
    const childReplies = replies.filter(r => r.parentId === c.id);
    const repliesHTML = childReplies.map(r => `
      <div style="margin:6px 0 0 20px;padding:6px 8px;background:rgba(255,255,255,0.04);border-left:2px solid var(--gold);border-radius:4px;">
        <div style="font-size:0.8rem;">${escapeHTML(r.text)}</div>
        <div style="font-size:0.68rem;color:#888;margin-top:2px;">${formatDate(r)}</div>
      </div>
    `).join('');

    return '<div style="margin-bottom:8px;padding:8px;background:rgba(255,255,255,0.05);border-radius:6px;">' +
      '<div style="font-size:0.85rem;">' + escapeHTML(c.text) + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;">' +
      '<span style="font-size:0.7rem;color:#888;">' + formatDate(c) + '</span>' +
      '<span class="reply-toggle" data-target="' + c.id + '" style="font-size:0.72rem;color:var(--gold);cursor:pointer;">Ответить</span>' +
      '</div>' +
      repliesHTML +
      renderReplyBox(c.id) +
      '</div>';
  }).join('');

  // Раскрытие поля ответа по клику на "Ответить"
  list.querySelectorAll('.reply-toggle').forEach(el => {
    el.addEventListener('click', () => {
      const box = document.getElementById('reply-box-' + el.dataset.target);
      if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
  });
  // Отправка ответа
  list.querySelectorAll('.reply-send-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const parentId = btn.dataset.parent;
      const input = list.querySelector('.reply-input[data-parent="' + parentId + '"]');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      await addComment(text, parentId);
    });
  });
}

export function openCommentsModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Комментарии</h3>
    <div id="commentsList" style="max-height:260px;overflow-y:auto;margin-bottom:10px;"></div>
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
    const textarea = content.querySelector('#newComment');
    const text = textarea.value.trim();
    if (!text) return;
    // ФИКС: поле очищается только ПОСЛЕ успешной отправки — раньше текст стирался сразу
    // и терялся навсегда, если отправка падала с ошибкой (например, нет сети)
    const before = comments.length;
    await addComment(text);
    const succeeded = comments.length > before || !ctid; // локальный режим тоже считается успехом
    if (succeeded) { textarea.value = ''; unlockAchievement('commented'); }
    updateCommentsDisplay();
  };
}

eventBus.on('comments:load', (id) => {
  loadComments(id);
});
