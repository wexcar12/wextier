/**
 * @module ui/settings
 * @description Тема, стиль, размер, фон.
 */

const P = 'wt_';
const B = [
  'https://i.pinimg.com/originals/f2/86/bb/f286bb13e259a1565b0154d7a9310d16.jpg',
  'https://i.pinimg.com/originals/e7/29/81/e729811d65432283f14d04b3402a7604.jpg',
  'https://i.pinimg.com/originals/b1/fb/e0/b1fbe00a51bd64ed14aa7193af834456.jpg',
  'https://i.pinimg.com/originals/12/08/9b/12089ba4009236d30d3d5188d9d2d002.jpg',
  'https://i.pinimg.com/originals/e1/a7/b4/e1a7b44a3711d48afe510af6a905587c.jpg',
  'https://images.steamusercontent.com/ugc/13054916979645448/3247B76A919A45A67793B1747716F68C9C53499F/'
];

function sg(k, f) {
  try { const r = localStorage.getItem(P + k); return r !== null ? JSON.parse(r) : f; } catch (e) { return f; }
}
function ss(k, v) {
  try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
}

export function loadSettings() {
  // Тема
  if (sg('theme', 'dark') === 'light') {
    document.body.classList.add('light-theme');
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
  document.documentElement.style.setProperty('--bg-img', 'url(\'' + B[idx] + '\')');
  ss('bg', idx);
}

export function applyStyle(style) {
  document.querySelectorAll('.item').forEach(el => {
    el.classList.remove('style-gradient', 'style-shadow', 'style-border', 'style-circle');
    el.classList.add('style-' + style);
  });
  ss('style', style);
}

export function applySize(size) {
  document.querySelectorAll('.item img').forEach(img => {
    img.style.width = size + 'px';
    img.style.height = size + 'px';
  });
  const customBtn = document.getElementById('addCustomPoolItemBtn');
  if (customBtn) {
    customBtn.style.width = size + 'px';
    customBtn.style.height = size + 'px';
  }
  ss('size', size);
}

export function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  ss('theme', isLight ? 'light' : 'dark');
}

export function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const collapsed = sidebar.classList.contains('collapsed');
  ss('sidebar_collapsed', collapsed);
  document.documentElement.style.setProperty('--sidebar-width', collapsed ? '72px' : '260px');
  setTimeout(() => lucide.createIcons(), 100);
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
}