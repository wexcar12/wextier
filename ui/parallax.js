/**
 * @module ui/parallax
 * @description Параллакс: 3 фоновых слоя-темы (всегда работают) + опциональный слой
 * с настоящей картинкой/видео поверх них (Мой любимый / Горы / Лес / Космос / своя ссылка).
 *
 * ФИКС НАДЁЖНОСТИ: если картинка/видео не загрузится — слой просто скрывается, и остаются
 * видны красивые градиентные слои под ним. Ничего "битого" пользователь никогда не увидит.
 */

import { sg, ss } from '../utils/storage.js';

let parallaxOn = false;

// ФИКС: Unsplash с октября 2025 недоступен с российских IP (это подтверждено в новостях,
// не связано с нашим кодом) — поэтому заменил на Wikimedia Commons. Википедия и её медиа-сервер
// в России работают нормально, а Special:FilePath — официальный способ встраивания картинок
// с Commons напрямую, рекомендованный самой Wikimedia.
const PRESETS = {
  favorite: { type: 'image', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Milky%20Way%20Night%20Sky%20Black%20Rock%20Desert%20Nevada.jpg?width=1600' },
  mountains: { type: 'image', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mountain%20range.jpg?width=1600' },
  forest: { type: 'image', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Forest%20path%20to%20the%20sun.jpg?width=1600' },
  space: { type: 'image', url: 'https://commons.wikimedia.org/wiki/Special:FilePath/Orion%20Nebula%20-%20Hubble%202006%20mosaic.jpg?width=1600' }
};

function applyPhotoLayer(mode) {
  const photoEl = document.getElementById('parallaxPhoto');
  const videoEl = document.getElementById('parallaxVideo');
  if (!photoEl || !videoEl) return;

  photoEl.classList.remove('show');
  videoEl.classList.remove('show');
  videoEl.pause();

  if (mode === 'theme') return; // только градиентные слои — самый надёжный вариант

  if (mode === 'custom') {
    const url = sg('parallax_custom_url', '');
    if (!url) return;
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
      videoEl.onerror = () => { videoEl.classList.remove('show'); notifyFail(); };
      videoEl.src = url;
      videoEl.classList.add('show');
      videoEl.play().catch(() => {});
    } else {
      photoEl.onerror = () => { photoEl.classList.remove('show'); notifyFail(); };
      photoEl.onload = () => { photoEl.classList.add('show'); };
      photoEl.src = url;
    }
    return;
  }

  const preset = PRESETS[mode];
  if (!preset) return;
  photoEl.onerror = () => { photoEl.classList.remove('show'); notifyFail(); };
  photoEl.onload = () => { photoEl.classList.add('show'); };
  photoEl.src = preset.url;
}

// ФИКС: раньше при неудачной загрузке картинка просто молча пряталась — непонятно было,
// сломалось что-то или просто "не поменялось". Теперь честно говорим об этом.
function notifyFail() {
  try {
    window.dispatchEvent(new CustomEvent('parallax:load-failed'));
  } catch (e) {}
}

export function loadParallax() {
  parallaxOn = sg('parallax', false);
  const mode = sg('parallax_bg', 'theme');
  const select = document.getElementById('parallaxBgSelect');
  if (select) select.value = mode;
  if (parallaxOn) toggleParallax(true);
}

export function toggleParallax(on) {
  parallaxOn = on;
  const wrapper = document.getElementById('parallaxWrapper');
  const btn = document.getElementById('parallaxBtn');

  if (on) {
    document.body.classList.add('parallax-active');
    if (btn) btn.classList.add('primary');
    if (wrapper) wrapper.style.display = 'block';
    applyPhotoLayer(sg('parallax_bg', 'theme'));
  } else {
    document.body.classList.remove('parallax-active');
    if (btn) btn.classList.remove('primary');
    if (wrapper) { wrapper.style.display = 'none'; wrapper.style.transform = ''; }
    ['parallaxLayer1', 'parallaxLayer2', 'parallaxLayer3', 'parallaxPhoto', 'parallaxVideo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.transform = '';
    });
  }
  ss('parallax', on);
}

// Вызывается при выборе фона в выпадающем списке рядом с кнопкой "Параллакс"
export function setParallaxBg(mode) {
  if (mode === 'custom') {
    const url = prompt('Вставь ПРЯМУЮ ссылку на файл картинки или видео (должна заканчиваться на .jpg/.png/.mp4 и т.п., а не на страницу сайта):', sg('parallax_custom_url', ''));
    if (url === null) return;
    const trimmed = url.trim();
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      window.dispatchEvent(new CustomEvent('parallax:load-failed'));
      return;
    }
    ss('parallax_custom_url', trimmed);
  }
  ss('parallax_bg', mode);
  if (parallaxOn) applyPhotoLayer(mode);
}

// Настоящий 3D-эффект: слои двигаются с разной силой в зависимости от "глубины",
// плюс лёгкий 3D-наклон всей сцены — так создаётся ощущение объёма.
export function initParallaxMouse() {
  const wrapper = document.getElementById('parallaxWrapper');
  const layer1 = document.getElementById('parallaxLayer1');
  const layer2 = document.getElementById('parallaxLayer2');
  const layer3 = document.getElementById('parallaxLayer3');
  const photo = document.getElementById('parallaxPhoto');
  const video = document.getElementById('parallaxVideo');
  if (!wrapper || !layer1 || !layer2 || !layer3) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let ticking = false;

  window.addEventListener('mousemove', function(e) {
    if (!parallaxOn) return;
    targetX = (e.clientX / window.innerWidth) - 0.5;
    targetY = (e.clientY / window.innerHeight) - 0.5;
    if (!ticking) { requestAnimationFrame(applyFrame); ticking = true; }
  });

  function applyFrame() {
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    layer1.style.transform = `translate(${curX * -18}px, ${curY * -18}px)`;
    layer2.style.transform = `translate(${curX * -40}px, ${curY * -40}px)`;
    layer3.style.transform = `translate(${curX * -70}px, ${curY * -70}px) scale(1.04)`;
    // Фото/видео — "ближний" слой, двигается сильнее всех остальных, но без чрезмерного зума
    const photoTransform = `translate(${curX * -55}px, ${curY * -55}px) scale(1.02)`;
    if (photo) photo.style.transform = photoTransform;
    if (video) video.style.transform = photoTransform;
    wrapper.style.transform = `rotateY(${curX * 5}deg) rotateX(${curY * -5}deg)`;

    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      requestAnimationFrame(applyFrame);
    } else {
      ticking = false;
    }
  }
}
