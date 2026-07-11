/**
 * @module app
 * @description Точка входа WEX-TIER.
 */
import { eventBus } from './core/event-bus.js';
import { state, AddItemCommand, RemoveItemCommand } from './core/state.js';
import { escapeHTML } from './utils/sanitizers.js';

import { initFB } from './api/firebase-init.js';
import { initAuthObserver, loginWithGoogle, logout } from './api/auth.js';

import { renderAll, isEditing, setEditing, isCompare, setCompare, getActiveTier, getActiveList, setActiveTier, updateUI, updateUndo } from './ui/render.js';
import { openGallery, openTop, openUserDashboard } from './ui/gallery.js';
import { openDuel, setupDuelButtons } from './ui/duel.js';
import { openCommentsModal } from './ui/comments.js';
import { loadAchievements, checkAchievements, openAchievementsModal } from './ui/achievements.js';
import { loadNeon, openNeonModal } from './ui/neon.js';
import { loadParallax, toggleParallax, initParallaxMouse } from './ui/parallax.js';
import { updatePoolItems, renderTemplatePool } from './ui/templates.js';
import { loadDrafts, createNewDraft, clearAllData, renderDraftsSidebar } from './ui/drafts.js';
import { exportPNG, exportJSON, importJSON } from './ui/export.js';
import { shareTierlist, loadFromURL } from './ui/share.js';
import { setupSearch } from './ui/search.js';
import { loadSettings, toggleTheme, toggleSidebar, setupSettingsEvents } from './ui/settings.js';
import { initSortable } from './dragdrop/sortable.js';
import { setupPlayer } from './ui/player.js';

window.escapeHTML = escapeHTML;

async function init() {
  const P = 'wt_';
  function sg(k, f) { try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; } }
  function ss(k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} }

  if (!sg('version_1_5', false)) {
    Object.keys(localStorage).filter(k => k.startsWith(P)).forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
    ss('version_1_5', true);
  }

  const fbReady = initFB();
  loadSettings(); loadDrafts(); loadAchievements(); loadNeon(); loadParallax();
  setupSearch(); setupPlayer(); setupDuelButtons(); initSortable(); initParallaxMouse();
  setupSettingsEvents(); // ФИКС: без этой строки списки "Стиль/Размер/Фон" в сайдбаре ничего не делали

  if (fbReady) initAuthObserver();

  await loadFromURL();
  renderAll();
  renderDraftsSidebar();

  bindEvents();
  updateUI();
}

function bindEvents() {
  // ФИКС: themeBtn и toggleSidebarBtn уже привязаны в setupSettingsEvents() (см. init()).
  // Раньше они привязывались ЕЩЁ РАЗ здесь — при клике срабатывали два обработчика подряд,
  // и тема/сайдбар переключались туда-обратно за один клик, то есть визуально не менялись вообще.
  document.getElementById('burgerBtn')?.addEventListener('click', () => { document.getElementById('sidebar')?.classList.toggle('open'); });

  document.getElementById('neonBtn')?.addEventListener('click', openNeonModal);
  
  // ФИКС: Параллакс корректно переключается
  document.getElementById('parallaxBtn')?.addEventListener('click', () => {
    const isActive = document.body.classList.contains('parallax-active');
    toggleParallax(!isActive);
  });
  
  document.getElementById('editBtn')?.addEventListener('click', () => { setEditing(!isEditing()); renderAll(); updateUI(); });
  // ФИКС: раньше в режиме Сравнения Undo всегда откатывал список №2, даже если правили список №1
  document.getElementById('undoBtn')?.addEventListener('click', () => { state.undo(isCompare() ? state.lastEditedList : 1); renderAll(); updateUndo(); });

  document.getElementById('galleryBtn')?.addEventListener('click', openGallery);
  document.getElementById('topBtn')?.addEventListener('click', openTop);
  document.getElementById('duelBtn')?.addEventListener('click', openDuel);
  document.getElementById('achievementsBtn')?.addEventListener('click', openAchievementsModal);
  document.getElementById('commentsBtn')?.addEventListener('click', openCommentsModal);
  
  document.getElementById('shareBtn')?.addEventListener('click', shareTierlist);
  document.getElementById('pngBtn')?.addEventListener('click', exportPNG);
  document.getElementById('exportBtn')?.addEventListener('click', exportJSON);
  document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile')?.click());
  document.getElementById('importFile')?.addEventListener('change', function () { if (this.files[0]) importJSON(this.files[0]); this.value = ''; });

  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    // ФИКС: раньше ошибка входа (заблокирован попап, отмена окна) не показывала пользователю ничего
    try { await loginWithGoogle(); }
    catch (e) { eventBus.emit('toast:show', { text: 'Не удалось войти. Проверьте, не блокирует ли браузер всплывающее окно.', type: 'error' }); }
  });
  document.getElementById('logoutLink')?.addEventListener('click', logout);
  document.getElementById('profileDashboardBtn')?.addEventListener('click', openUserDashboard);

  // ФИКС: эти две кнопки раньше не были привязаны ни к чему и не реагировали на клик
  document.getElementById('newDraftBtnSidebar')?.addEventListener('click', createNewDraft);
  document.getElementById('resetAllLink')?.addEventListener('click', () => {
    if (confirm('Точно удалить ВСЕ черновики и настройки без возможности восстановить?')) {
      clearAllData();
      renderDraftsSidebar();
      renderAll();
      eventBus.emit('toast:show', { text: 'Все данные сброшены', type: 'success' });
    }
  });

  document.getElementById('compareBtn')?.addEventListener('click', () => {
    setCompare(!isCompare());
    if (isCompare()) state.setData(JSON.parse(JSON.stringify(state.data1)), 2);
    renderAll();
    updateUI();
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    if (confirm('Сбросить всё?')) {
      const emptyData = [ { tier: 'S', label: 'S', color: '#ff7f7f', items: [] }, { tier: 'A', label: 'A', color: '#ffbf7f', items: [] }, { tier: 'B', label: 'B', color: '#ffdf7f', items: [] }, { tier: 'C', label: 'C', color: '#bfff7f', items: [] } ];
      state.setData(emptyData, 1); state.setData(emptyData, 2); checkAchievements(isEditing()); renderAll();
    }
  });

  document.getElementById('templateSelect')?.addEventListener('change', function () { eventBus.emit('templates:changed', this.value); });

  document.getElementById('compareWrap')?.addEventListener('click', function (e) {
    const delBtn = e.target.closest('.del-btn');
    if (delBtn) {
      e.stopPropagation(); e.preventDefault();
      const tI = parseInt(delBtn.dataset.tierIndex, 10); const iI = parseInt(delBtn.dataset.itemIndex, 10); const listN = parseInt(delBtn.dataset.listNum, 10);
      if (!isNaN(tI) && !isNaN(iI) && !isNaN(listN)) {
        const data = listN === 1 ? state.data1 : state.data2;
        const itemToRemove = data[tI].items[iI];
        const command = new RemoveItemCommand(tI, iI, itemToRemove, listN);
        state.executeCommand(command, listN); checkAchievements(isEditing()); renderAll();
      }
      return;
    }

    const addBtn = e.target.closest('.add-btn');
    if (addBtn) {
      const tI = parseInt(addBtn.dataset.tierIndex, 10); const lN = parseInt(addBtn.dataset.listNum, 10);
      if (!isNaN(tI)) {
        setActiveTier(tI, lN);
        document.getElementById('trackUrl').value = ''; document.getElementById('coverUrl').value = '';
        const preview = document.getElementById('coverPreview'); if(preview) preview.style.display = 'none';
        document.getElementById('addModal')?.classList.add('open');
      }
      return;
    }
  });

  document.getElementById('fetchCoverBtn')?.addEventListener('click', async () => {
    const url = document.getElementById('trackUrl')?.value.trim();
    if (!url) { eventBus.emit('toast:show', { text: 'Вставьте ссылку', type: 'info' }); return; }
    
    document.getElementById('fetchCoverBtn').disabled = true;
    let cover = null; const ytM = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    if (ytM) cover = 'https://img.youtube.com/vi/' + ytM[1] + '/mqdefault.jpg';
    
    if (cover) {
      document.getElementById('coverUrl').value = cover;
      const preview = document.getElementById('coverPreview');
      if(preview) { preview.src = cover; preview.style.display = 'block'; }
    } else {
      eventBus.emit('toast:show', { text: 'Не удалось найти. Вставьте ссылку на картинку вручную.', type: 'error' });
    }
    document.getElementById('fetchCoverBtn').disabled = false;
  });

  document.getElementById('cancelAdd')?.addEventListener('click', () => { document.getElementById('addModal')?.classList.remove('open'); });

  document.getElementById('okAdd')?.addEventListener('click', () => {
    const svc = document.getElementById('svc')?.value || 'youtube';
    // ФИКС: МЫ БОЛЬШЕ НЕ ЭКРАНИРУЕМ URL, ИНАЧЕ ССЫЛКИ ЛОМАЮТСЯ!
    const url = document.getElementById('trackUrl')?.value.trim();
    let img = document.getElementById('coverUrl')?.value.trim();

    if (!url) { eventBus.emit('toast:show', { text: 'Вставьте ссылку!', type: 'error' }); return; }
    // ФИКС: раньше можно было вставить ссылку с любой схемой (например javascript:...).
    // Теперь принимаем только обычные веб-ссылки.
    if (!/^https?:\/\//i.test(url)) { eventBus.emit('toast:show', { text: 'Ссылка должна начинаться с http:// или https://', type: 'error' }); return; }

    if (!img) {
      const c = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00' };
      const ic = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪' };
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${c[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${ic[svc] || '?'}</text></svg>`;
      img = 'data:image/svg+xml,' + encodeURIComponent(svg);
    }

    const activeList = getActiveList();
    const activeTier = getActiveTier();
    const command = new AddItemCommand(activeTier, { img, url, svc }, activeList);
    state.executeCommand(command, activeList);

    document.getElementById('addModal')?.classList.remove('open');
    checkAchievements(isEditing()); renderAll();
  });

  window.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'z') { e.preventDefault(); document.getElementById('undoBtn')?.click(); } });
}

eventBus.on('auth:changed', (user) => {
  if (user) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userProfile').style.display = 'flex';
    document.getElementById('userAvatar').src = user.photo || '';
    document.getElementById('userName').textContent = user.name || 'Пользователь';
    document.getElementById('profileDashboardBtn').style.display = 'flex';
  } else {
    document.getElementById('loginBtn').style.display = 'flex';
    document.getElementById('userProfile').style.display = 'none';
    document.getElementById('profileDashboardBtn').style.display = 'none';
  }
  lucide.createIcons();
});

eventBus.on('state:changed', updateUndo);
document.addEventListener('DOMContentLoaded', init);
