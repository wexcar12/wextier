/**
 * @module ui/custom-select
 * @description Кастомный dropdown поверх нативного <select>.
 *
 * АРХИТЕКТУРНОЕ РЕШЕНИЕ: нативный <select> физически нельзя до конца стилизовать
 * кросс-браузерно (сам выпадающий список опций рисует ОС/браузер, а не CSS) —
 * отсюда и "белые пятна" в интерфейсе. Полная замена на кастомный компонент с нуля
 * потребовала бы переписать весь код, который слушает 'change' на этих select'ах.
 *
 * Вместо этого — Progressive Enhancement: настоящий <select> остаётся в DOM и
 * продолжает работать как раньше (весь существующий код в app.js/settings.js его
 * не замечает и работает без изменений), но визуально прячется, а поверх рисуется
 * наш стеклянный dropdown. Выбор в кастомном UI просто программно меняет .value
 * у настоящего select и диспатчит на нём 'change' — то есть для остального кода
 * ничего не поменялось. Это безопаснее и почти вдвое меньше кода, чем полная замена.
 */

export function enhanceSelect(select) {
  if (!select || select.dataset.enhanced) return;
  select.dataset.enhanced = '1';

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select-wrapper';
  select.parentNode.insertBefore(wrapper, select);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'custom-select-trigger';
  if (select.className.includes('sidebar-select')) trigger.classList.add('sidebar-select');

  const panel = document.createElement('div');
  panel.className = 'custom-select-panel';

  function syncTriggerLabel() {
    const opt = select.options[select.selectedIndex];
    trigger.innerHTML = '<span>' + (opt ? opt.textContent : '') + '</span><i data-lucide="chevron-down"></i>';
    if (window.lucide) lucide.createIcons();
  }

  function buildPanel() {
    panel.innerHTML = '';
    Array.from(select.options).forEach((opt, i) => {
      const item = document.createElement('div');
      item.className = 'custom-select-option' + (i === select.selectedIndex ? ' active' : '');
      item.textContent = opt.textContent;
      item.addEventListener('click', () => {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncTriggerLabel();
        closePanel();
      });
      panel.appendChild(item);
    });
  }

  function openPanel() {
    document.querySelectorAll('.custom-select-panel.open').forEach(p => { if (p !== panel) p.classList.remove('open'); });
    buildPanel();
    panel.classList.add('open');
    trigger.classList.add('open');
  }
  function closePanel() {
    panel.classList.remove('open');
    trigger.classList.remove('open');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    panel.classList.contains('open') ? closePanel() : openPanel();
  });
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) closePanel();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  // ФИКС СИНХРОНИЗАЦИИ: раньше здесь стоял MutationObserver — но он не видит программную
  // запись select.value (это JS-свойство, а не HTML-атрибут, MutationObserver его не ловит).
  // Из-за этого, например, при открытии тир-листа из галереи с другим шаблоном
  // (templateSelect.value = doc.templateType) кнопка визуально не обновлялась.
  // Теперь перехватываем сам сеттер value — обновление гарантированно, независимо от того,
  // кто и как меняет значение.
  const proto = Object.getPrototypeOf(select);
  const desc = Object.getOwnPropertyDescriptor(proto, 'value') || Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  Object.defineProperty(select, 'value', {
    get() { return desc.get.call(select); },
    set(v) { desc.set.call(select, v); syncTriggerLabel(); buildPanel(); },
    configurable: true
  });
  select.addEventListener('change', syncTriggerLabel);

  syncTriggerLabel();
  wrapper.appendChild(trigger);
  wrapper.appendChild(panel);
  wrapper.appendChild(select); // сам select остаётся в DOM, но визуально скрыт CSS'ом
}

// Применить сразу ко всем select с классом sidebar-select / data-enhance
export function enhanceAllSelects(root = document) {
  root.querySelectorAll('select.sidebar-select, select[data-enhance]').forEach(enhanceSelect);
}
