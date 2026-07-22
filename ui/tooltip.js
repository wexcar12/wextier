/**
 * @module ui/tooltip
 * @description Красивая всплывающая подсказка при наведении на карточку
 * (фильм/сериал/игра/актёр) — вместо стандартной серой браузерной подсказки.
 * Работает через делегирование событий, поэтому подхватывает карточки,
 * которые появляются на странице уже после загрузки (в пуле шаблонов и в тирах).
 */
let tipEl = null;
let currentTarget = null;

function ensureTip() {
  if (tipEl) return tipEl;
  tipEl = document.createElement('div');
  tipEl.id = 'itemTooltip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.appendChild(tipEl);
  return tipEl;
}

function positionTip(e) {
  if (!tipEl) return;
  const pad = 16;
  let x = e.clientX + pad;
  let y = e.clientY + pad;
  const rect = tipEl.getBoundingClientRect();
  if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - pad;
  tipEl.style.transform = `translate(${x}px, ${y}px)`;
}

export function initTooltips() {
  const tip = ensureTip();

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || !target.dataset.tooltip) return;
    if (currentTarget === target) return;
    currentTarget = target;
    tip.textContent = target.dataset.tooltip;
    tip.classList.add('show');
  });

  let moveRaf = null;
  document.addEventListener('mousemove', (e) => {
    if (!currentTarget) return;
    if (moveRaf) return;
    moveRaf = requestAnimationFrame(() => { positionTip(e); moveRaf = null; });
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tooltip]');
    if (!target || target !== currentTarget) return;
    // Не прячем, если курсор просто перешёл на дочерний элемент той же карточки
    if (target.contains(e.relatedTarget)) return;
    currentTarget = null;
    tip.classList.remove('show');
  });

  // На телефонах/планшетах наведения нет — на всякий случай прячем при скролле
  document.addEventListener('scroll', () => { currentTarget = null; tip.classList.remove('show'); }, true);
}
