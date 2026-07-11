/**
 * @module ui/parallax
 * @description Параллакс: 3 фоновых слоя-темы (всегда работают) + опциональный слой
 * с настоящей картинкой/видео поверх них (Мой любимый / Горы / Лес / Космос / своя ссылка).
 *
 * ФИКС НАДЁЖНОСТИ: если картинка/видео не загрузится — слой просто скрывается, и остаются
 * видны красивые градиентные слои под ним. Ничего "битого" пользователь никогда не увидит.
 */

const P = 'wt_';
let parallaxOn = false;

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

// ФИКС: вернул твою любимую картинку (была первой в старом списке фонов) + добавил
// проверенные вручную рабочие фото с Unsplash (официально разрешено встраивать их
// напрямую, в отличие от Pinterest — там ссылки время от времени переставали работать).
const PRESETS = {
  favorite: { type: 'image', url: 'https://i.pinimg.com/originals/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg' },
  mountains: { type: 'image', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80' },
  forest: { type: 'image', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80' },
  space: { type: 'image', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80' }
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
      videoEl.src = url;
      videoEl.onerror = () => { videoEl.classList.remove('show'); }; // молча прячем, останется красивый фон
      videoEl.classList.add('show');
      videoEl.play().catch(() => {});
    } else {
      photoEl.onerror = () => { photoEl.classList.remove('show'); };
      photoEl.src = url;
      photoEl.classList.add('show');
    }
    return;
  }

  const preset = PRESETS[mode];
  if (!preset) return;
  photoEl.onerror = () => { photoEl.classList.remove('show'); };
  photoEl.src = preset.url;
  photoEl.classList.add('show');
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
    const url = prompt('Вставь ссылку на картинку или видео (.mp4/.webm) для параллакса:', sg('parallax_custom_url', ''));
    if (url === null) return; // отмена — оставляем как было
    ss('parallax_custom_url', url.trim());
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
    // Фото/видео — "ближний" слой, двигается сильнее всех остальных
    const photoTransform = `translate(${curX * -95}px, ${curY * -95}px) scale(1.08)`;
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
