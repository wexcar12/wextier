/**
 * @module app
 * @description Точка входа WEX-TIER. Инициализация всех модулей.
 */

// Core
import { eventBus } from './core/event-bus.js';
import { state, MoveItemCommand, AddItemCommand, RemoveItemCommand } from './core/state.js';

// API
import { initFB } from './api/firebase-init.js';
import { initAuthObserver, getCurrentUser, loginWithGoogle, logout } from './api/auth.js';

// UI
import { modalManager } from './ui/modal-manager.js';
import { toastManager } from './ui/toast.js';
import {
  renderAll, render, updateUI, updateUndo,
  isEditing, setEditing, isCompare, setCompare,
  getActiveTier, getActiveList, setActiveTier
} from './ui/render.js';
import { openGallery, openTop, openUserDashboard, getCurrentTierlistId } from './ui/gallery.js';
import { openDuel, setupDuelButtons, voteFor } from './ui/duel.js';
import { openCommentsModal, loadComments, setCommentsTierlistId } from './ui/comments.js';
import { loadAchievements, checkAchievements, openAchievementsModal } from './ui/achievements.js';
import { loadNeon, applyNeon, openNeonModal } from './ui/neon.js';
import { loadParallax, toggleParallax, initParallaxMouse } from './ui/parallax.js';
import { setupPlayer } from './ui/player.js';
import { updatePoolItems, renderTemplatePool } from './ui/templates.js';
import { loadDrafts, saveDrafts, renderDraftsSidebar, createNewDraft, clearAllData } from './ui/drafts.js';
import { exportPNG, exportJSON, importJSON } from './ui/export.js';
import { shareTierlist, loadFromURL } from './ui/share.js';
import { setupSearch } from './ui/search.js';
import { loadSettings, setupSettingsEvents, applySize } from './ui/settings.js';
import { initSortable } from './dragdrop/sortable.js';

// Utils
import { escapeHTML } from './utils/sanitizers.js';
window.escapeHTML = escapeHTML;

// Toast-функция для обратной совместимости
window.toast = function (text) {
  eventBus.emit('toast:show', { text, type: 'info' });
};

// Инициализация приложения
async function init() {
  const P = 'wt_';
  function sg(k, f) {
    try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
  }
  function ss(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
  }

  if (!sg('version_1_1', false)) {
    Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });
    ss('version_1_1', true);
  }

  const fbReady = initFB();

  loadSettings();
  loadDrafts();
  loadAchievements();
  loadNeon();
  loadParallax();

  setupSearch();
  setupPlayer();
  setupDuelButtons();
  setupSettingsEvents();
  initSortable();
  initParallaxMouse();

  if (fbReady) {
    initAuthObserver();
  }

  const loaded = await loadFromURL();
  renderAll();
  renderDraftsSidebar();

  bindEvents();
  initParticles();
  updateUI();
}

function bindEvents() {
  // Бургер-меню
  const burgerBtn = document.getElementById('burgerBtn');
  if (burgerBtn) {
    burgerBtn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // Редактирование
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      setEditing(!isEditing());
      renderAll();
      updateUI();
    });
  }

  // Отмена (Undo)
  const undoBtn = document.getElementById('undoBtn');
  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      state.undo(isCompare() ? 2 : 1);
      renderAll();
      updateUndo();
    });
  }

  // Сброс
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Сбросить всё?')) {
        state.setData([
          { tier: 'S', label: 'S', color: '#ff7f7f', items: [] },
          { tier: 'A', label: 'A', color: '#ffbf7f', items: [] },
          { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
          { tier: 'C', label: 'C', color: '#bfff7f', items: [] }
        ], 1);
        state.setData([
          { tier: 'S', label: 'S', color: '#ff7f7f', items: [] },
          { tier: 'A', label: 'A', color: '#ffbf7f', items: [] },
          { tier: 'B', label: 'B', color: '#ffdf7f', items: [] },
          { tier: 'C', label: 'C', color: '#bfff7f', items: [] }
        ], 2);
        eventBus.emit('achievements:check');
        renderAll();
      }
    });
  }

  // Добавить тир
  const addTierBtn = document.getElementById('addTierBtn');
  if (addTierBtn) {
    addTierBtn.addEventListener('click', () => {
      if (!isEditing()) return;
      const letters = 'EFGHIJKLMNOPQRSTUVWXYZ';
      const exist = state.data1.map(t => t.tier);
      let next = 'E';
      for (let i = 0; i < letters.length; i++) {
        if (!exist.includes(letters[i])) { next = letters[i]; break; }
      }
      const TC = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#bfff7f', '#7fffff', '#bfbfff', '#df7fff', '#ff9fcf'];
      state.data1.push({ tier: next, label: next, color: TC[state.data1.length % TC.length], items: [] });
      state._save();
      renderAll();
    });
  }

  // Сравнение
  const compareBtn = document.getElementById('compareBtn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      setCompare(!isCompare());
      if (isCompare()) {
        state.setData(JSON.parse(JSON.stringify(state.data1)), 2);
      }
      renderAll();
    });
  }

  // Плеер (YouTube плейлист)
  const playlistBtn = document.getElementById('playlistBtn');
  if (playlistBtn) {
    playlistBtn.addEventListener('click', () => {
      const yt = state.data1.flatMap(t => t.items).filter(i => i.svc === 'youtube');
      if (yt.length === 0) {
        eventBus.emit('toast:show', { text: 'Нет YouTube треков', type: 'info' });
        return;
      }
      const ids = yt.map(i => {
        const m = i.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        return m ? m[1] : null;
      }).filter(Boolean);
      if (ids.length > 0) {
        window.open('https://www.youtube.com/watch_videos?video_ids=' + ids.join(','), '_blank');
      }
    });
  }

  // Поделиться
  const shareBtn = document.getElementById('shareBtn');
  if (shareBtn) shareBtn.addEventListener('click', shareTierlist);

  // Экспорт
  const pngBtn = document.getElementById('pngBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  if (pngBtn) pngBtn.addEventListener('click', exportPNG);
  if (exportBtn) exportBtn.addEventListener('click', exportJSON);
  if (importBtn) importBtn.addEventListener('click', () => importFile?.click());
  if (importFile) importFile.addEventListener('change', function () {
    if (this.files[0]) importJSON(this.files[0]);
    this.value = '';
  });

  // Галерея
  const galleryBtn = document.getElementById('galleryBtn');
  if (galleryBtn) galleryBtn.addEventListener('click', openGallery);

  // Топ
  const topBtn = document.getElementById('topBtn');
  if (topBtn) topBtn.addEventListener('click', openTop);

  // Дуэль
  const duelBtn = document.getElementById('duelBtn');
  if (duelBtn) duelBtn.addEventListener('click', openDuel);

  // Достижения
  const achievementsBtn = document.getElementById('achievementsBtn');
  if (achievementsBtn) achievementsBtn.addEventListener('click', openAchievementsModal);

  // Неон
  const neonBtn = document.getElementById('neonBtn');
  if (neonBtn) neonBtn.addEventListener('click', openNeonModal);

  // Параллакс
  const parallaxBtn = document.getElementById('parallaxBtn');
  if (parallaxBtn) {
    parallaxBtn.addEventListener('click', () => {
      const isActive = document.body.classList.contains('parallax-active');
      toggleParallax(!isActive);
    });
  }

  // Комментарии
  const commentsBtn = document.getElementById('commentsBtn');
  if (commentsBtn) commentsBtn.addEventListener('click', openCommentsModal);

  // Авторизация
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', loginWithGoogle);

  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) logoutLink.addEventListener('click', logout);

  // Личный кабинет
  const dashboardBtn = document.getElementById('profileDashboardBtn');
  if (dashboardBtn) dashboardBtn.addEventListener('click', openUserDashboard);

  // Тема
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      const P = 'wt_';
      try { localStorage.setItem(P + 'theme', JSON.stringify(isLight ? 'light' : 'dark')); } catch (e) {}
    });
  }

  // Шаблоны
  const templateSelect = document.getElementById('templateSelect');
  if (templateSelect) {
    templateSelect.addEventListener('change', function () {
      updatePoolItems(this.value);
      renderTemplatePool();
    });
  }

  // Новый черновик
  const newDraftBtn = document.getElementById('newDraftBtnSidebar');
  if (newDraftBtn) newDraftBtn.addEventListener('click', createNewDraft);

  // Сброс данных
  const resetAllLink = document.getElementById('resetAllLink');
  if (resetAllLink) {
    resetAllLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Удалить ВСЕ данные?')) {
        clearAllData();
        setEditing(false);
        setCompare(false);
        document.body.classList.remove('light-theme', 'neon-active', 'parallax-active');
        if (window._neonRI) { clearInterval(window._neonRI); window._neonRI = null; }
        const wrapper = document.getElementById('parallaxWrapper');
        if (wrapper) wrapper.style.display = 'none';
        const duelBar = document.getElementById('duelVoteBar');
        if (duelBar) duelBar.classList.remove('show');
        document.documentElement.style.setProperty('--bg-img', 'url(\'https://i.pinimg.com/originals/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg\')');
        const bgSelect = document.getElementById('bgSelect');
        if (bgSelect) bgSelect.value = '0';
        toggleParallax(false);
        renderAll();
        updateUI();
      }
    });
  }

  // Обработчик для кнопок внутри compareWrap
  document.getElementById('compareWrap')?.addEventListener('click', function (e) {
    const delBtn = e.target.closest('.del-btn');
    if (delBtn) {
      e.stopPropagation();
      e.preventDefault();
      const tI = parseInt(delBtn.dataset.tierIndex, 10);
      const iI = parseInt(delBtn.dataset.itemIndex, 10);
      const listN = parseInt(delBtn.dataset.listNum, 10);
      if (!isNaN(tI) && !isNaN(iI) && !isNaN(listN)) {
        const data = listN === 1 ? state.data1 : state.data2;
        const item = data[tI].items[iI];
        const command = new RemoveItemCommand(tI, iI, item, listN);
        state.executeCommand(command, listN);
        eventBus.emit('achievements:check');
        renderAll();
      }
      return;
    }

    const addBtn = e.target.closest('.add-btn');
    if (addBtn) {
      const tI = parseInt(addBtn.dataset.tierIndex, 10);
      const lN = parseInt(addBtn.dataset.listNum, 10);
      if (!isNaN(tI)) {
        setActiveTier(tI, lN);
        document.getElementById('trackUrl').value = '';
        document.getElementById('coverUrl').value = '';
        document.getElementById('coverPreview').style.display = 'none';
        document.getElementById('addModal')?.classList.add('open');
      }
      return;
    }
  });

  // Модалка добавления трека
  const cancelAdd = document.getElementById('cancelAdd');
  const okAdd = document.getElementById('okAdd');
  const fetchCoverBtn = document.getElementById('fetchCoverBtn');
  const coverUrlInput = document.getElementById('coverUrl');
  const coverPreview = document.getElementById('coverPreview');

  if (cancelAdd) cancelAdd.addEventListener('click', () => {
    document.getElementById('addModal')?.classList.remove('open');
  });

  if (fetchCoverBtn) {
    fetchCoverBtn.addEventListener('click', async () => {
      const url = document.getElementById('trackUrl')?.value.trim();
      if (!url) {
        eventBus.emit('toast:show', { text: 'Вставьте ссылку', type: 'info' });
        return;
      }
      fetchCoverBtn.textContent = '...';
      fetchCoverBtn.disabled = true;
      let cover = null;
      const ytM = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      if (ytM) cover = 'https://img.youtube.com/vi/' + ytM[1] + '/mqdefault.jpg';
      if (cover) {
        if (coverUrlInput) coverUrlInput.value = cover;
        if (coverPreview) {
          coverPreview.src = cover;
          coverPreview.style.display = 'block';
        }
      } else {
        eventBus.emit('toast:show', { text: 'Не удалось. Вставьте ссылку на картинку вручную.', type: 'info' });
      }
      fetchCoverBtn.textContent = 'Авто-поиск обложки';
      fetchCoverBtn.disabled = false;
    });
  }

  if (coverUrlInput) {
    coverUrlInput.addEventListener('input', function () {
      const url = this.value.trim();
      if (coverPreview) {
        if (url) {
          coverPreview.src = url;
          coverPreview.style.display = 'block';
        } else {
          coverPreview.style.display = 'none';
        }
      }
    });
  }

  if (okAdd) {
    okAdd.addEventListener('click', () => {
      const svc = document.getElementById('svc')?.value || 'youtube';
      const url = document.getElementById('trackUrl')?.value.trim();
      let img = document.getElementById('coverUrl')?.value.trim();

      if (!url) {
        eventBus.emit('toast:show', { text: 'Вставьте ссылку!', type: 'error' });
        return;
      }

      if (!img) {
        const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00' };
        const ic = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪' };
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="' + (c[svc] || '#555') + '" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">' + (ic[svc] || '?') + '</text></svg>';
        img = 'data:image/svg+xml,' + encodeURIComponent(svg);
      }

      const activeList = getActiveList();
      const activeTier = getActiveTier();
      const newItem = { img, url, svc };

      const command = new AddItemCommand(activeTier, newItem, activeList);
      state.executeCommand(command, activeList);

      document.getElementById('addModal')?.classList.remove('open');
      eventBus.emit('achievements:check');
      renderAll();
    });
  }

  // Закрытие модалок по клику на оверлей
  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', function (e) {
      if (e.target === this && this.id !== 'neonModal') {
        this.classList.remove('open');
        if (this.id === 'playerModal') {
          const frame = document.getElementById('playerFrame');
          if (frame) frame.src = 'about:blank';
        }
      }
    });
  });

  // Ctrl+Z
  window.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      state.undo(isCompare() ? 2 : 1);
      renderAll();
      updateUndo();
    }
  });
}

// Частицы
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function create() {
    particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        sx: (Math.random() - 0.5) * 0.5,
        sy: (Math.random() - 0.5) * 0.5,
        o: Math.random() * 0.5 + 0.2
      });
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.x += p.sx;
      p.y += p.sy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,200,66,' + p.o + ')';
      ctx.fill();
    });
    requestAnimationFrame(animate);
  }

  resize();
  create();
  animate();
  window.addEventListener('resize', () => { resize(); create(); });
}

// Слушатели событий Event Bus
eventBus.on('auth:changed', (user) => {
  const loginBtn = document.getElementById('loginBtn');
  const userProfile = document.getElementById('userProfile');
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const dashboardBtn = document.getElementById('profileDashboardBtn');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    if (userAvatar) userAvatar.src = user.photo || '';
    if (userName) userName.textContent = user.name || 'Пользователь';
    if (dashboardBtn) dashboardBtn.style.display = 'flex';
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
    if (dashboardBtn) dashboardBtn.style.display = 'none';
  }
  lucide.createIcons();
});

eventBus.on('state:changed', () => {
  updateUndo();
});

// Запуск
document.addEventListener('DOMContentLoaded', init);
