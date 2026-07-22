/**
 * @module app
 * @description Точка входа WEX-TIER.
 */
import { eventBus } from './core/event-bus.js';
import { state, AddItemCommand, RemoveItemCommand, AddTierCommand } from './core/state.js';

import { escapeHTML } from './utils/sanitizers.js';

import { initFB } from './api/firebase-init.js';
import { initAuthObserver, loginWithGoogle, logout } from './api/auth.js';

import { renderAll, isCompare, setCompare, getActiveTier, getActiveList, setActiveTier, updateUI, updateUndo, getSelectedItem, clearSelectedItem, moveSelectedItemToTier, deleteSelectedItem, setSelectedItemKey, getSelectedItemKey } from './ui/render.js';
import { openGallery, openTop, openUserDashboard } from './ui/gallery.js';
import { openCommentsModal } from './ui/comments.js';
import { loadAchievements, checkAchievements, openAchievementsModal, unlockAchievement } from './ui/achievements.js';
import { loadNeon, openNeonModal } from './ui/neon.js';
import { loadParallax, toggleParallax, initParallaxMouse, setParallaxBg } from './ui/parallax.js';
import { updatePoolItems, getPoolItems } from './ui/templates.js';
import { loadDrafts, createNewDraft, clearAllData, renderDraftsSidebar } from './ui/drafts.js';
import { exportPNG, exportJSON, importJSON } from './ui/export.js';
import { shareTierlist, loadFromURL } from './ui/share.js';
import { setupSearch } from './ui/search.js';
import { loadSettings, setupSettingsEvents } from './ui/settings.js';
import { initSortable } from './dragdrop/sortable.js';
import { setupPlayer } from './ui/player.js';
import { initTooltips } from './ui/tooltip.js';
import { openVersionHistory, maybeTakeSnapshot } from './ui/version-history.js';
import { modalManager } from './ui/modal-manager.js';
import { enhanceAllSelects } from './ui/custom-select.js';
import { initSidebarAnimations } from './ui/sidebar-anim.js';
import { initBottomSheet } from './ui/bottom-sheet.js';
import { initContextMenu } from './ui/context-menu.js';
import { initCommunityTemplates } from './ui/community-templates.js';
import './ui/toast.js';

/** Безопасный вызов lucide.createIcons() — не крашит приложение, если CDN не загрузился */
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
  try { initSidebarAnimations(); } catch (e) { console.warn('initSidebarAnimations failed:', e); }
  try { initBottomSheet(); } catch (e) { console.warn('initBottomSheet failed:', e); }
  try { initContextMenu(); } catch (e) { console.warn('initContextMenu failed:', e); }
  try { initCommunityTemplates(); } catch (e) { console.warn('initCommunityTemplates failed:', e); }
  try { setupSettingsEvents(); } catch (e) { console.warn('setupSettingsEvents failed:', e); }

  if (fbReady) try { initAuthObserver(); } catch (e) { console.warn('initAuthObserver failed:', e); }

  try { await loadFromURL(); } catch (e) { console.warn('loadFromURL failed:', e); }
  renderAll();
  try { renderDraftsSidebar(); } catch (e) { console.warn('renderDraftsSidebar failed:', e); }

  bindEvents();
  updateUI();
}

function showConfirmModal(text, onConfirm) {
  const el = document.createElement('div');
  el.style.cssText = 'text-align:center;padding:20px;';
  el.innerHTML = `
    <p style="margin-bottom:20px;font-size:1rem;">${escapeHTML(text)}</p>
    <div style="display:flex;gap:10px;justify-content:center;">
      <button class="btn btn-secondary" data-action="cancel">Отмена</button>
      <button class="btn btn-primary" data-action="confirm" style="background:#ff4d6d;">Подтвердить</button>
    </div>`;
  const close = modalManager.open(el, { closeOnBackdrop: true, closeOnEscape: true });
  el.querySelector('[data-action="cancel"]').onclick = () => close();
  el.querySelector('[data-action="confirm"]').onclick = () => { close(); onConfirm(); };
}

function bindEvents() {
  // ФИКС: панель "Настройки" — физически перемещает существующие элементы
  // (Тема/Неон/Параллакс/Стиль/Размер/Фон) внутрь модалки и обратно, ничего не пересоздавая.
  document.getElementById('settingsBtn')?.addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    if (!panel) return;
    panel.style.display = 'block';
    const close = modalManager.open(panel);
    const closeBtn = panel.querySelector('#closeSettingsPanel');
    if (closeBtn) closeBtn.onclick = close;
    safeCreateIcons();
  });
  // ФИКС: themeBtn и toggleSidebarBtn уже привязаны в setupSettingsEvents() (см. init()).
  // Раньше они привязывались ЕЩЁ РАЗ здесь — при клике срабатывали два обработчика подряд,
  // и тема/сайдбар переключались туда-обратно за один клик, то есть визуально не менялись вообще.
  document.getElementById('burgerBtn')?.addEventListener('click', () => { document.getElementById('sidebar')?.classList.toggle('open'); });

  // Закрытие мобильного сайдбара по клику вне его
  document.getElementById('mainContent')?.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) sidebar.classList.remove('open');
  });

  document.getElementById('neonBtn')?.addEventListener('click', openNeonModal);
  
  // ФИКС: Параллакс корректно переключается
  document.getElementById('parallaxBtn')?.addEventListener('click', () => {
    const isActive = document.body.classList.contains('parallax-active');
    toggleParallax(!isActive);
  });
  document.getElementById('parallaxBgSelect')?.addEventListener('change', (e) => { setParallaxBg(e.target.value); });
  window.addEventListener('parallax:load-failed', () => {
    eventBus.emit('toast:show', { text: 'Эта картинка не загрузилась (возможно, сайт-источник недоступен в твоей сети). Оставлен обычный фон.', type: 'error' });
  });
  
  // ФИКС: кнопка "Редактировать" убрана — редактирование теперь всегда включено (см. core/state.js)

  // Рандомайзер — раскидывает всё, что осталось в пуле шаблонов, по тирам случайно
  document.getElementById('randomizeBtn')?.addEventListener('click', () => {
    const poolItemsData = getPoolItems().slice();
    if (poolItemsData.length === 0 || state.data1.length === 0) {
      eventBus.emit('toast:show', { text: 'Нечего раскидывать — пул пуст или выбери шаблон', type: 'info' });
      return;
    }
    const data = structuredClone(state.data1);
    poolItemsData.forEach(item => {
      const tierIndex = Math.floor(Math.random() * data.length);
      data[tierIndex].items.push({ img: item.img, url: item.url, svc: item.svc, title: item.title });
    });
    state.setData(data, 1);
    updatePoolItems(document.getElementById('templateSelect')?.value || 'music');
    eventBus.emit('templates:renderPool');
    unlockAchievement('randomizer_used');
    checkAchievements(true);
    renderAll();
  });

  // ФИКС 9: история версий
  document.getElementById('historyBtn')?.addEventListener('click', openVersionHistory);


  // ФИКС 8: индикатор автосохранения "Сохранено ✓"
  let saveIndicatorTimer = null;
  eventBus.on('save:start', () => {
    const el = document.getElementById('autosaveIndicator');
    if (el) { el.textContent = 'Сохранение...'; el.style.opacity = '1'; }
  });
  eventBus.on('save:done', () => {
    maybeTakeSnapshot(); // ФИКС 9: заодно проверяем, не пора ли сделать снапшот версии
    const el = document.getElementById('autosaveIndicator');
    if (!el) return;
    el.textContent = 'Сохранено ✓';
    clearTimeout(saveIndicatorTimer);
    saveIndicatorTimer = setTimeout(() => { el.style.opacity = '0'; }, 1500);
  });

  // ФИКС 6: счётчик "размещено / всего" в шапке + прогресс-бар
  eventBus.on('progress:update', ({ listNum, placed }) => {
    if (listNum !== 1) return;
    const el = document.getElementById('progressIndicator');
    const barWrap = document.getElementById('progressBarWrap');
    const barFill = document.getElementById('progressBarFill');
    const poolLen = document.querySelectorAll('#templatePool .item').length;
    const total = placed + poolLen;
    if (!el) return;
    if (total === 0) {
      el.style.display = 'none';
      if (barWrap) barWrap.style.display = 'none';
      return;
    }
    el.style.display = 'block';
    el.textContent = 'Размещено: ' + placed + ' / ' + total;
    if (barWrap && barFill) {
      barWrap.style.display = 'block';
      const pct = Math.round((placed / total) * 100);
      barFill.style.width = pct + '%';
      if (pct === 100) barFill.style.background = 'linear-gradient(90deg, #6bffb8, #4d96ff)';
      else barFill.style.background = 'linear-gradient(90deg, var(--gold), #ffcc00)';
    }
  });

  // ФИКС 10: горячие клавиши. Кликни по карточке в режиме редактирования, чтобы выделить,
  // затем 1-9 — перекинуть в нужный тир, Delete/Backspace — удалить, Escape — снять выделение.
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return; // не мешаем печатать текст
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
  // ФИКС: раньше в режиме Сравнения Undo всегда откатывал список №2, даже если правили список №1
  document.getElementById('undoBtn')?.addEventListener('click', () => { state.undo(isCompare() ? state.lastEditedList : 1); renderAll(); updateUndo(); });
  document.getElementById('redoBtn')?.addEventListener('click', () => { state.redo(isCompare() ? state.lastEditedList : 1); renderAll(); updateUndo(); });

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
    // ФИКС: раньше ошибка входа (заблокирован попап, отмена окна) не показывала пользователю ничего
    try { await loginWithGoogle(); }
    catch (e) { eventBus.emit('toast:show', { text: 'Не удалось войти. Проверьте, не блокирует ли браузер всплывающее окно.', type: 'error' }); }
  });
  document.getElementById('logoutLink')?.addEventListener('click', logout);
  document.getElementById('profileDashboardBtn')?.addEventListener('click', openUserDashboard);

  // ФИКС: эти две кнопки раньше не были привязаны ни к чему и не реагировали на клик
  document.getElementById('newDraftBtnSidebar')?.addEventListener('click', createNewDraft);
  document.getElementById('resetAllLink')?.addEventListener('click', () => {
    clearAllData();
  });

  document.getElementById('compareBtn')?.addEventListener('click', () => {
    setCompare(!isCompare());
    if (isCompare()) state.setData(JSON.parse(JSON.stringify(state.data1)), 2);
    renderAll();
    updateUI();
  });

  document.getElementById('resetBtn')?.addEventListener('click', () => {
    showConfirmModal('Сбросить всё?', () => {
      state.setData(state.getDefaultData(), 1); state.setData(state.getDefaultData(), 2); checkAchievements(true); renderAll();
    });
  });

  document.getElementById('addTierBtn')?.addEventListener('click', () => {
    const data = state.data1;
    const letters = 'SABCDEF';
    const colors = ['#ff7f7f','#ffbf7f','#ffdf7f','#ffff7f','#bfff7f','#7fff7f','#7fffff'];
    const used = new Set(data.map(t => t.tier));
    let label = 'New';
    let color = '#cccccc';
    for (let i = 0; i < letters.length; i++) {
      if (!used.has(letters[i])) { label = letters[i]; color = colors[i]; break; }
    }
    const cmd = new AddTierCommand({ tier: label, label, color, items: [] }, 1);
    state.executeCommand(cmd, 1);
    renderAll();
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
          document.getElementById('trackUrl').value = ''; document.getElementById('coverUrl').value = ''; document.getElementById('coverUrl').dataset.source = '';
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
          document.getElementById('playerFrame').src = 'https://www.youtube.com/embed/' + v[1] + '?autoplay=1';
          document.getElementById('playerModal').classList.add('open');
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

  // ФИКС АВТО-ПОИСКА ОБЛОЖКИ: раньше "Авто-поиск" умел находить картинку только для YouTube,
  // а для Spotify/Apple/Yandex всегда писал "не удалось найти". Теперь для Spotify обложка
  // тоже находится автоматически (через официальный публичный oEmbed Spotify, без ключа).
  // Apple Music и Яндекс.Музыка не отдают обложку без личного API-ключа разработчика — для них
  // остаётся ручная вставка ссылки (это ограничение самих сервисов, а не сайта).
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
    // ФИКС БАГА: раньше проверялось "поле не пустое" — но поле оставалось "не пустым" и
    // после ПРЕДЫДУЩЕГО авто-поиска, поэтому при смене ссылки на трек поиск не запускался
    // заново. Теперь различаем "я сам вписал картинку" (manual) и "нашлось само" (auto) —
    // не трогаем только то, что пользователь ввёл своими руками.
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

  // Если человек сам печатает/вставляет в поле картинки — помечаем как "ручное", чтобы
  // авто-поиск больше не пытался его перезаписать
  document.getElementById('coverUrl')?.addEventListener('input', (e) => { e.target.dataset.source = 'manual'; });

  // Резервная кнопка — можно нажать вручную в любой момент (например, если авто-поиск не сработал)
  document.getElementById('fetchCoverBtn')?.addEventListener('click', () => {
    const coverInput = document.getElementById('coverUrl');
    coverInput.value = ''; coverInput.dataset.source = ''; // разрешаем повторный поиск по кнопке
    runCoverAutoSearch(true);
  });

  // ГЛАВНЫЙ ФИКС: обложка теперь ищется САМА, как только вставлена ссылка — без нажатий.
  // Кнопка и поле "Ссылка на картинку" остаются как резерв, если авто-поиск не найдёт обложку.
  let coverAutoSearchTimer = null;
  document.getElementById('trackUrl')?.addEventListener('input', () => {
    clearTimeout(coverAutoSearchTimer);
    coverAutoSearchTimer = setTimeout(() => runCoverAutoSearch(false), 700);
  });
  document.getElementById('svc')?.addEventListener('change', () => {
    const coverInput = document.getElementById('coverUrl');
    coverInput.value = ''; coverInput.dataset.source = '';
    runCoverAutoSearch(false);
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
    checkAchievements(true); renderAll();
  });

  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); document.getElementById('undoBtn')?.click(); }
    if (e.ctrlKey && e.key === 'y') { e.preventDefault(); document.getElementById('redoBtn')?.click(); }
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

eventBus.on('state:changed', updateUndo);
document.addEventListener('DOMContentLoaded', init);
