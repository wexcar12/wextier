// Единый генератор SVG-заглушки по сервису. Использовался в трёх местах
// (render.js, templates.js, community-templates.js) — теперь одна реализация.
const PLACEHOLDER_COLORS = { youtube: '#ff0000', spotify: '#1db954', apple: '#fc3c44', yandex: '#ffcc00', steam: '#171a21', imdb: '#f5c518' };
const PLACEHOLDER_ICONS = { youtube: '▶', spotify: '●', apple: '♫', yandex: '♪', steam: '🎮', imdb: '🎬' };

export function pImg(svc) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="${PLACEHOLDER_COLORS[svc] || '#555'}" width="64" height="64" rx="8"/><text fill="white" x="32" y="36" text-anchor="middle" font-size="20">${PLACEHOLDER_ICONS[svc] || '?'}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}
