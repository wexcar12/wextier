/**
 * @module ui/settings
 * @description Тема, стиль, размер, фон.
 */
import { sg, ss } from '../utils/storage.js';

const B = ['aurora', 'sunset', 'ocean', 'emerald', 'violet', 'graphite'];

export function loadSettings() {
  // Тема — auto по системе, если нет сохранённого значения
  const savedTheme = sg('theme', null);
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  } else if (savedTheme === null) {
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      document.body.classList.add('light-theme');
    }
  }

  // Стиль
  const style = sg('style', 'gradient');
  const styleSelect = document.getElementById('styleSelect');
  if (styleSelect) styleSelect.value = style;
  applyStyle(style);

  // Размер
  const size = sg('size', '60');
  const sizeSelect = document.getElementById('sizeSelect');
  if (sizeSelect) sizeSelect.value = size;
  applySize(size);

  // Фон
  const bg = sg('bg', 0);
  const bgSelect = document.getElementById('bgSelect');
  if (bgSelect) bgSelect.value = bg;
  applyBg(bg);

  // Сайдбар
  if (sg('sidebar_collapsed', false)) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('collapsed');
    document.documentElement.style.setProperty('--sidebar-width', '72px');
  }
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

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const collapsed = sidebar.classList.contains('collapsed');
  ss('sidebar_collapsed', collapsed);
  document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '260px');
  setTimeout(() => { try { if (typeof lucide !== 'undefined') lucide.createIcons(); } catch (e) { /* ignore */ } }, 100);
}

export function setupSettingsEvents() {
  const bgSelect = document.getElementById('bgSelect');
  const styleSelect = document.getElementById('styleSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const themeBtn = document.getElementById('themeBtn');
  const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');

  if (bgSelect) bgSelect.addEventListener('change', function() { applyBg(parseInt(this.value, 10)); });
  if (styleSelect) styleSelect.addEventListener('change', function() { applyStyle(this.value); });
  if (sizeSelect) sizeSelect.addEventListener('change', function() { applySize(this.value); });
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
  listenSystemTheme();
}