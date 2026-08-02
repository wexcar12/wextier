/**
 * @module app
 * @description Точка входа WEX-TIER.
 */
import { eventBus } from './core/event-bus.js';
import { state, AddItemCommand, RemoveItemCommand } from './core/state.js';

import { initFB } from './api/firebase-init.js';
import { initAuthObserver, loginWithGoogle, logout } from './api/auth.js';

import { renderAll, isCompare, setCompare, getActiveTier, getActiveList, setActiveTier, updateUI, getSelectedItem, clearSelectedItem, moveSelectedItemToTier, deleteSelectedItem, setSelectedItemKey, getSelectedItemKey } from './ui/render.js';
import { openGallery, openTop, openUserDashboard } from './ui/gallery.js';
import { openCommentsModal } from './ui/comments.js';
import { loadAchievements, checkAchievements, openAchievementsModal } from './ui/achievements.js';
import { loadNeon, openNeonModal } from './ui/neon.js';
import { loadParallax, toggleParallax, initParallaxMouse, setParallaxBg } from './ui/parallax.js';
import { loadDrafts, createNewDraft, renderDraftsSidebar } from './ui/drafts.js';
import { exportPNG, exportJSON, importJSON } from './ui/export.js';
import { shareTierlist, loadFromURL } from './ui/share.js';
import { setupSearch } from './ui/search.js';
import { loadSettings, setupSettingsEvents } from './ui/settings.js';
import { initSortable } from './dragdrop/sortable.js';
import { setupPlayer } from './ui/player.js';
import { initTooltips } from './ui/tooltip.js';
import { maybeTakeSnapshot } from './ui/version-history.js';
import { modalManager } from './ui/modal-manager.js';
import { enhanceAllSelects } from './ui/custom-select.js';
import { initBottomSheet } from './ui/bottom-sheet.js';
import { initContextMenu } from './ui/context-menu.js';
import { initCommunityTemplates } from './ui/community-templates.js';
import './ui/toast.js';

function safeCreateIcons() {
  try { if (typeof lucide !== 'undefined') lucide.createIcons(); }
  catch (e) { console.warn('Lucide icons error:', e); }
}

async function init() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW registration failed:', e));
  }

  let fbReady = false;
  try { fbReady = initFB(); } catch (e) { console.warn('Firebase init failed:', e); }

  try { loadSettings(); } catch (e) { console.warn('loadSettings failed:', e); }
  try { loadDrafts(); } catch (e) { console.warn('loadDrafts failed:', e); }
  try { loadAchievements(); } catch (e) { console.warn('loadAchievements failed:', e); }
  try { loadNeon(); } catch (e) { console.warn('loadNeon failed:', e); }
  try { loadParallax(); } catch (e) { console.warn('loadParallax failed:', e); }

  try { setupSearch(); } catch (e) { console.warn('setupSearch failed:', e); }
  try { setupPlayer(); } catch (e) { console.warn('setupPlayer failed:', e); }
  try { initSortable(); } catch (e) { console.warn('initSortable failed:', e); }
  try { initParallaxMouse(); } catch (e) { console.warn('initParallaxMouse failed:', e); }
  try { initTooltips(); } catch (e) { console.warn('initTooltips failed:', e); }

  try { enhanceAllSelects(); } catch (e) { console.warn('enhanceAllSelects failed:', e); }
  safeCreateIcons();
  try { initBottomSheet(); } catch (e) { console.warn('initBottomSheet failed:', e); }
  try { initContextMenu(); } catch (e) { console.warn('initContextMenu failed:', e); }
  try { initCommunityTemplates(); } catch (e) { console.warn('initCommunityTemplates failed:', e); }
  try { setupSettingsEvents(); } catch (e) { console.warn('setupSettingsEvents failed:', e); }

  if (fbReady) try { initAuthObserver(); } catch (e) { console.warn('initAuthObserver failed:', e); }

  try { await loadFromURL(); } catch (e) { console.warn('loadFromURL failed:', e); }
  renderAll();
  try { renderDraftsSidebar(); } catch (e) { console.warn('renderDraftsSidebar failed:', e); }

  window.addEventListener('beforeunload', () => state.flushSave());

  bindEvents();
  updateUI();
}

function initHeaderDropdowns() {
  const triggers = document.querySelectorAll('.header-dropdown-trigger');

  triggers.forEach(trigger => {
    const wrap = trigger.closest('.header-dropdown-wrap');
    const dropdown = wrap?.querySelector('.header-dropdown');
    if (!dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) {
        dropdown.classList.add('open');
        trigger.classList.add('active');
      }
    });
  });

  // Аватар тоже открывает dropdown
  const avatar = document.getElementById('userAvatar');
  const userDropdown = document.getElementById('userDropdown');
  if (avatar && userDropdown) {
    avatar.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = userDropdown.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) userDropdown.classList.add('open');
    });
  }

  document.addEventListener('click', closeAllDropdowns);
}

function closeAllDropdowns() {
  document.querySelectorAll('.header-dropdown.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.header-dropdown-trigger.active').forEach(t => t.classList.remove('active'));
}

function bindEvents() {
  initHeaderDropdowns();

  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;
    panel.style.display = 'block';
    panel._cleanup = () => {
      document.body.appendChild(panel);
      panel.style.display = 'none';
    };
    const close = modalManager.open(panel, { closeOnEscape: true });
    const closeBtn = panel.querySelector('#closeSettingsPanel');
    if (closeBtn) closeBtn.onclick = () => close();
    safeCreateIcons();
  });

  document.getElementById('neonBtn')?.addEventListener('click', openNeonModal);

  document.getElementById('parallaxBtn')?.addEventListener('click', () => {
    const isActive = document.body.classList.contains('parallax-active');
    toggleParallax(!isActive);
  });
  document.getElementById('parallaxBgSelect')?.addEventListener('change', (e) => { setParallaxBg(e.target.value); });
  window.addEventListener('parallax:load-failed', () => {
    eventBus.emit('toast:show', { text: 'Эта картинка не загрузилась (возможно, сайт-источник недоступен в твоей сети). Оставлен обычный фон.', type: 'error' });
  });

  // Автосохранение — snapshot при каждом сохранении
  eventBus.on('save:done', () => { maybeTakeSnapshot(); });

  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
    if (!getSelectedItem()) return;

    if (e.key >= '1' && e.key <= '9') {
      const tierIndex = parseInt(e.key, 10) - 1;
      if (moveSelectedItemToTier(tierIndex)) e.preventDefault();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteSelectedItem();
    } else if (e.key === 'Escape') {
      clearSelectedItem();
    }
  });

  document.getElementById('galleryBtn')?.addEventListener('click', openGallery);
  document.getElementById('topBtn')?.addEventListener('click', openTop);
  document.getElementById('achievementsBtn')?.addEventListener('click', openAchievementsModal);
  document.getElementById('commentsBtn')?.addEventListener('click', openCommentsModal);

  document.getElementById('shareBtn')?.addEventListener('click', shareTierlist);
  document.getElementById('pngBtn')?.addEventListener('click', exportPNG);
  document.getElementById('exportBtn')?.addEventListener('click', exportJSON);
  document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile')?.click());
  document.getElementById('importFile')?.addEventListener('change', function () { if (this.files[0]) importJSON(this.files[0]); this.value = ''; });

  document.getElementById('loginBtn')?.addEventListener('click', async () => {
    try { await loginWithGoogle(); }
    catch (e) { eventBus.emit('toast:show', { text: 'Не удалось войти. Проверьте, не блокирует ли браузер всплывающее окно.', type: 'error' }); }
  });
  document.getElementById('logoutLink')?.addEventListener('click', () => { logout(); closeAllDropdowns(); });
  document.getElementById('profileDashboardBtn')?.addEventListener('click', openUserDashboard);

  document.getElementById('newDraftBtnSidebar')?.addEventListener('click', createNewDraft);

  document.getElementById('compareBtn')?.addEventListener('click', () => {
    setCompare(!isCompare());
    if (isCompare()) state.setData(JSON.parse(JSON.stringify(state.data1)), 2);
    renderAll();
    updateUI();
    closeAllDropdowns();
  });

  document.getElementById('templateSelect')?.addEventListener('change', function () { eventBus.emit('templates:changed', this.value); });

  const compareWrap = document.getElementById('compareWrap');
  if (compareWrap) {
    compareWrap.addEventListener('click', function (e) {
      const delBtn = e.target.closest('.del-btn');
      if (delBtn) {
        e.stopPropagation(); e.preventDefault();
        const tI = parseInt(delBtn.dataset.tierIndex, 10); const iI = parseInt(delBtn.dataset.itemIndex, 10); const listN = parseInt(delBtn.dataset.listNum, 10);
        if (delBtn.classList.contains('del-btn--tier') && !isNaN(tI) && !isNaN(listN)) {
          const data = listN === 1 ? state.data1 : state.data2;
          if (data[tI] && data[tI].items.length === 0) {
            data.splice(tI, 1);
            state.setData(data, listN); renderAll();
          }
          return;
        }
        if (!isNaN(tI) && !isNaN(iI) && !isNaN(listN)) {
          const data = listN === 1 ? state.data1 : state.data2;
          if (!data[tI] || iI >= data[tI].items.length) return;
          const itemToRemove = data[tI].items[iI];
          const command = new RemoveItemCommand(tI, iI, itemToRemove, listN);
          state.executeCommand(command, listN); checkAchievements(true); renderAll();
        }
        return;
      }

      const addBtn = e.target.closest('.add-btn');
      if (addBtn) {
        const tI = parseInt(addBtn.dataset.tierIndex, 10); const lN = parseInt(addBtn.dataset.listNum, 10);
        if (!isNaN(tI)) {
          setActiveTier(tI, lN);
          const trackUrlEl = document.getElementById('trackUrl');
          const coverUrlEl = document.getElementById('coverUrl');
          if (trackUrlEl) trackUrlEl.value = '';
          if (coverUrlEl) { coverUrlEl.value = ''; coverUrlEl.dataset.source = ''; }
          const preview = document.getElementById('coverPreview'); if(preview) preview.style.display = 'none';
          const templateType = document.getElementById('templateSelect')?.value || 'music';
          const modalTitle = document.querySelector('#addModal .modal-box h3');
          const titles = { music: 'Добавить трек', movies: 'Добавить фильм', games: 'Добавить игру', actors: 'Добавить актёра', musicians: 'Добавить музыканта', athletes: 'Добавить спортсмена', bloggers: 'Добавить блогера', anime: 'Добавить аниме' };
          if (modalTitle) modalTitle.textContent = titles[templateType] || 'Добавить элемент';
          const svcSelect = document.getElementById('svc')?.closest('.custom-select-wrapper') || document.getElementById('svc');
          if (svcSelect) svcSelect.style.display = templateType === 'music' ? '' : 'none';
          document.getElementById('addModal')?.classList.add('open');
        }
        return;
      }

      const item = e.target.closest('.item');
      if (!item || item.closest('#templatePool')) return;

      if (item.dataset.svc === 'youtube') {
        const url = item.dataset.url || '';
        const v = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
        if (v) {
          e.preventDefault();
          const frame = document.getElementById('playerFrame');
          const modal = document.getElementById('playerModal');
          if (frame && modal) {
            frame.src = 'https://www.youtube.com/embed/' + v[1] + '?autoplay=1';
            modal.classList.add('open');
          }
          return;
        }
      }

      e.preventDefault();
      const key = item.dataset.tierIndex + '-' + item.dataset.itemIndex + '-' + item.dataset.listNum;
      const prev = document.querySelector('.item.selected');
      if (prev && prev !== item) prev.classList.remove('selected');
      if (getSelectedItemKey() === key) {
        item.classList.remove('selected');
        setSelectedItemKey(null);
      } else {
        item.classList.add('selected');
        setSelectedItemKey(key);
      }
    });

    compareWrap.addEventListener('dragstart', function (e) {
      if (e.target.tagName === 'IMG') e.preventDefault();
    });
  }

  async function fetchCoverForTrack(svc, url) {
    if (!url) return null;
    if (svc === 'youtube') {
      const m = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
      return m ? 'https://img.youtube.com/vi/' + m[1] + '/mqdefault.jpg' : null;
    }
    if (svc === 'spotify') {
      try {
        const res = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
        if (!res.ok) return null;
        const data = await res.json();
        return data.thumbnail_url || null;
      } catch (e) { return null; }
    }
    return null;
  }

  async function runCoverAutoSearch(showErrorToast) {
    const svc = document.getElementById('svc')?.value || 'youtube';
    const url = document.getElementById('trackUrl')?.value.trim();
    const coverInput = document.getElementById('coverUrl');
    const preview = document.getElementById('coverPreview');
    if (!url) { if (showErrorToast) eventBus.emit('toast:show', { text: 'Вставьте ссылку', type: 'info' }); return; }
    if (!coverInput) return;
    if (coverInput.value.trim() && coverInput.dataset.source === 'manual') return;

    const fetchBtn = document.getElementById('fetchCoverBtn');
    if (fetchBtn) fetchBtn.disabled = true;
    const cover = await fetchCoverForTrack(svc, url);
    if (cover) {
      coverInput.value = cover;
      coverInput.dataset.source = 'auto';
      if (preview) { preview.src = cover; preview.style.display = 'block'; }
    } else if (showErrorToast) {
      eventBus.emit('toast:show', { text: 'Не удалось найти обложку автоматически. Вставьте ссылку на картинку вручную.', type: 'error' });
    }
    if (fetchBtn) fetchBtn.disabled = false;
  }

  document.getElementById('coverUrl')?.addEventListener('input', (e) => { e.target.dataset.source = 'manual'; });

  document.getElementById('fetchCoverBtn')?.addEventListener('click', () => {
    const coverInput = document.getElementById('coverUrl');
    if (!coverInput) return;
    coverInput.value = ''; coverInput.dataset.source = '';
    runCoverAutoSearch(true);
  });

  let coverAutoSearchTimer = null;
  document.getElementById('trackUrl')?.addEventListener('input', () => {
    clearTimeout(coverAutoSearchTimer);
    coverAutoSearchTimer = setTimeout(() => runCoverAutoSearch(false), 700);
  });
  document.getElementById('svc')?.addEventListener('change', () => {
    const coverInput = document.getElementById('coverUrl');
    if (!coverInput) return;
    coverInput.value = ''; coverInput.dataset.source = '';
    runCoverAutoSearch(false);
  });

  document.getElementById('cancelAdd')?.addEventListener('click', () => { document.getElementById('addModal')?.classList.remove('open'); });

  document.getElementById('okAdd')?.addEventListener('click', () => {
    const svc = document.getElementById('svc')?.value || 'youtube';
    const url = document.getElementById('trackUrl')?.value.trim();
    let img = document.getElementById('coverUrl')?.value.trim();

    if (!url) { eventBus.emit('toast:show', { text: 'Вставьте ссылку!', type: 'error' }); return; }
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
    checkAchievements(true); renderAll();
  });
}

eventBus.on('auth:changed', (user) => {
  if (user) {
    document.getElementById('loginBtn')?.style.setProperty('display', 'none');
    document.getElementById('userProfile')?.style.setProperty('display', 'flex');
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.src = user.photo || '';
    const name = document.getElementById('userName');
    if (name) name.textContent = user.name || 'Пользователь';
    document.getElementById('profileDashboardBtn')?.style.setProperty('display', 'flex');
  } else {
    document.getElementById('loginBtn')?.style.setProperty('display', 'flex');
    document.getElementById('userProfile')?.style.setProperty('display', 'none');
    document.getElementById('profileDashboardBtn')?.style.setProperty('display', 'none');
  }
  safeCreateIcons();
});

document.addEventListener('DOMContentLoaded', init);
