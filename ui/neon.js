/**
 * @module ui/neon
 * @description Неон-эффекты.
 */
import { modalManager } from './modal-manager.js';

const P = 'wt_';
let neonS = { enabled: false, color: 'rainbow', target: 'all' };

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

export function loadNeon() {
  neonS = sg('neon', { enabled: false, color: 'rainbow', target: 'all' });
  applyNeon();
}

export function applyNeon() {
  if (neonS.enabled) {
    document.body.classList.add('neon-active');
    if (neonS.color === 'rainbow') {
      if (!window._neonRI) {
        const colors = [
          'rgba(255,100,100,0.9)',
          'rgba(255,200,50,0.9)',
          'rgba(100,255,100,0.9)',
          'rgba(50,150,255,0.9)',
          'rgba(200,50,255,0.9)'
        ];
        let ci = 0;
        window._neonRI = setInterval(() => {
          ci = (ci + 1) % colors.length;
          document.documentElement.style.setProperty('--neon-glow', '0 0 20px ' + colors[ci]);
        }, 600);
      }
    } else {
      if (window._neonRI) { clearInterval(window._neonRI); window._neonRI = null; }
      let c = 'rgba(245,200,66,0.9)';
      if (neonS.color === 'cyan') c = 'rgba(0,200,255,0.9)';
      else if (neonS.color === 'magenta') c = 'rgba(255,0,200,0.9)';
      document.documentElement.style.setProperty('--neon-glow', '0 0 20px ' + c);
    }
  } else {
    document.body.classList.remove('neon-active');
    document.documentElement.style.setProperty('--neon-glow', 'none');
    if (window._neonRI) { clearInterval(window._neonRI); window._neonRI = null; }
  }

  const nb = document.getElementById('neonBtn');
  if (nb) {
    if (neonS.enabled) nb.classList.add('neon-active');
    else nb.classList.remove('neon-active');
  }
}

export function openNeonModal() {
  const content = document.createElement('div');
  content.innerHTML = `
    <h3 style="color:var(--gold);">Настройки неона</h3>
    <label><input type="checkbox" id="neonToggle" ${neonS.enabled ? 'checked' : ''}> Включить неон</label><br><br>
    <select id="neonColor">
      <option value="rainbow" ${neonS.color === 'rainbow' ? 'selected' : ''}>Радужный</option>
      <option value="gold" ${neonS.color === 'gold' ? 'selected' : ''}>Золотой</option>
      <option value="cyan" ${neonS.color === 'cyan' ? 'selected' : ''}>Голубой</option>
      <option value="magenta" ${neonS.color === 'magenta' ? 'selected' : ''}>Пурпурный</option>
    </select><br><br>
    <select id="neonTarget">
      <option value="all" ${neonS.target === 'all' ? 'selected' : ''}>Всё</option>
      <option value="items" ${neonS.target === 'items' ? 'selected' : ''}>Обложки</option>
      <option value="tiers" ${neonS.target === 'tiers' ? 'selected' : ''}>Тиры</option>
      <option value="title" ${neonS.target === 'title' ? 'selected' : ''}>Заголовок</option>
    </select>
    <div class="modal-actions" style="margin-top:12px;">
      <button class="btn btn-primary" id="closeNeon">Сохранить</button>
    </div>
  `;

  const close = modalManager.open(content);

  content.querySelector('#closeNeon').onclick = () => {
    neonS.enabled = content.querySelector('#neonToggle').checked;
    neonS.color = content.querySelector('#neonColor').value;
    neonS.target = content.querySelector('#neonTarget').value;
    ss('neon', neonS);
    applyNeon();
    close();
  };
}