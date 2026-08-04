/**
 * @module ui/cover-search
 * @description Авто-поиск обложки трека по ссылке (YouTube/Spotify) в модалке «Добавить».
 *              Вынесено из монолита bindEvents (app.js) — самодостаточный кластер,
 *              зависит только от DOM-элементов модалки и eventBus.
 */
import { eventBus } from '../core/event-bus.js';

// Достаём обложку по ссылке на трек. YouTube — из thumbnail по video id (без сети),
// Spotify — через публичный oembed. Остальные сервисы обложку не отдают.
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

export function setupCoverSearch() {
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
}
