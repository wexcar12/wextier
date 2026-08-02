/**
 * @module ui/settings
 * @description Тема, стиль, размер, фон.
 */
import { sg, ss } from '../utils/storage.js';

const B = ['aurora', 'sunset', 'ocean', 'emerald', 'violet', 'graphite'];

export function loadSettings() {
  const savedTheme = sg('theme', null);
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (savedTheme === null) {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-theme');
    }
  }

  const style = sg('style', 'gradient');
  const styleSelect = document.getElementById('styleSelect');
  if (styleSelect) styleSelect.value = style;
  applyStyle(style);

  const size = sg('size', '60');
  const sizeSelect = document.getElementById('sizeSelect');
  if (sizeSelect) sizeSelect.value = size;
  applySize(size);

  const bg = sg('bg', 0);
  const bgSelect = document.getElementById('bgSelect');
  if (bgSelect) bgSelect.value = bg;
  applyBg(bg);
}

export function applyBg(idx) {
  const name = B[idx] || B[0];
  B.forEach(n => document.body.classList.remove('bg-' + n));
  document.body.classList.add('bg-' + name);
  ss('bg', idx);
}

export function applyStyle(style) {
  const containers = [document.getElementById('compareWrap'), document.getElementById('templatePoolContainer')];
  containers.forEach(el => { if (el) el.dataset.itemStyle = style; });
  ss('style', style);
}

export function applySize(size) {
  document.documentElement.style.setProperty('--item-size', size + 'px');
  ss('size', size);
}

export function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  ss('theme', isLight ? 'light' : 'dark');
}

function listenSystemTheme() {
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    const saved = sg('theme', null);
    if (saved !== null) return;
    document.body.classList.toggle('light-theme', e.matches);
  });
}

export function setupSettingsEvents() {
  const bgSelect = document.getElementById('bgSelect');
  const styleSelect = document.getElementById('styleSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const themeBtn = document.getElementById('themeBtn');

  if (bgSelect) bgSelect.addEventListener('change', function() { applyBg(parseInt(this.value, 10)); });
  if (styleSelect) styleSelect.addEventListener('change', function() { applyStyle(this.value); });
  if (sizeSelect) sizeSelect.addEventListener('change', function() { applySize(this.value); });
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  listenSystemTheme();
}