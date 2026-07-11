/**
 * @module ui/parallax
 * @description Параллакс-эффект — теперь настоящий 3D из трёх слоёв, следящих за мышью.
 */

const P = 'wt_';
let parallaxOn = false;

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

export function loadParallax() {
  parallaxOn = sg('parallax', false);
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
  } else {
    document.body.classList.remove('parallax-active');
    if (btn) btn.classList.remove('primary');
    if (wrapper) { wrapper.style.display = 'none'; wrapper.style.transform = ''; }
    // Возвращаем слои в исходное положение, чтобы при следующем включении не было рывка
    ['parallaxLayer1', 'parallaxLayer2', 'parallaxLayer3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.transform = '';
    });
  }
  ss('parallax', on);
}

// ФИКС/АПГРЕЙД: раньше был один плоский слой с чужой картинкой (Pinterest), который двигался
// от мыши. Теперь три слоя с разной "глубиной" (ближний двигается сильнее дальнего) плюс лёгкий
// 3D-наклон всей сцены — получается настоящее ощущение объёма, а не просто сдвиг картинки.
export function initParallaxMouse() {
  const wrapper = document.getElementById('parallaxWrapper');
  const layer1 = document.getElementById('parallaxLayer1');
  const layer2 = document.getElementById('parallaxLayer2');
  const layer3 = document.getElementById('parallaxLayer3');
  if (!wrapper || !layer1 || !layer2 || !layer3) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0;
  let ticking = false;

  window.addEventListener('mousemove', function(e) {
    if (!parallaxOn) return;
    // -0.5..0.5 по каждой оси относительно центра экрана
    targetX = (e.clientX / window.innerWidth) - 0.5;
    targetY = (e.clientY / window.innerHeight) - 0.5;
    if (!ticking) { requestAnimationFrame(applyFrame); ticking = true; }
  });

  function applyFrame() {
    // Плавное сглаживание движения (инерция), чтобы эффект не был дёрганым
    curX += (targetX - curX) * 0.08;
    curY += (targetY - curY) * 0.08;

    layer1.style.transform = `translate(${curX * -18}px, ${curY * -18}px)`;
    layer2.style.transform = `translate(${curX * -40}px, ${curY * -40}px)`;
    layer3.style.transform = `translate(${curX * -70}px, ${curY * -70}px) scale(1.04)`;
    wrapper.style.transform = `rotateY(${curX * 5}deg) rotateX(${curY * -5}deg)`;

    if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
      requestAnimationFrame(applyFrame);
    } else {
      ticking = false;
    }
  }
}
