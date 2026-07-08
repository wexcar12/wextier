/**
 * @module ui/parallax
 * @description Параллакс-эффект.
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
  const layer = document.getElementById('parallaxLayer');
  const btn = document.getElementById('parallaxBtn');

  if (on) {
    document.body.classList.add('parallax-active');
    if (btn) btn.classList.add('primary');
    if (wrapper) wrapper.style.display = 'block';
    if (layer) {
      const bgSelect = document.getElementById('bgSelect');
      const B = [
        'https://i.pinimg.com/originals/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg',
        'https://i.pinimg.com/originals/e7/29/81/e729811d65432283f14d04b3402a7604.jpg',
        'https://i.pinimg.com/originals/b1/fb/e0/b1fbe00a51bd64ed14aa7193af834456.jpg',
        'https://i.pinimg.com/originals/12/08/9b/12089ba4009236d30d3d5188d9d2d002.jpg',
        'https://i.pinimg.com/originals/e1/a7/b4/e1a7b44a3711d48afe510af6a905587c.jpg',
        'https://images.steamusercontent.com/ugc/13054916979645448/3247B76A919A45A67793B1747716F68C9C53499F/'
      ];
      const idx = bgSelect ? parseInt(bgSelect.value, 10) : 0;
      layer.style.backgroundImage = 'url(\'' + B[idx] + '\')';
    }
  } else {
    document.body.classList.remove('parallax-active');
    if (btn) btn.classList.remove('primary');
    if (wrapper) wrapper.style.display = 'none';
    if (layer) layer.style.transform = 'translateX(0px) translateY(0px)';
  }
  ss('parallax', on);
}

export function initParallaxMouse() {
  const layer = document.getElementById('parallaxLayer');
  if (!layer) return;

  window.addEventListener('mousemove', function(e) {
    if (!parallaxOn) return;
    const x = (window.innerWidth / 2 - e.pageX) / 25;
    const y = (window.innerHeight / 2 - e.pageY) / 25;
    layer.style.transform = 'translateX(' + x + 'px) translateY(' + y + 'px)';
  });
}