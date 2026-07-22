export function initBottomSheet() {
  const container = document.getElementById('templatePoolContainer');
  const handle = document.getElementById('bsHandle');
  const toggleBtn = document.getElementById('bsToggleBtn');
  if (!container || !handle || !toggleBtn) return;

  const mq = window.matchMedia('(max-width: 768px)');
  let startY = 0, startTranslate = 0, currentY = 0, dragging = false;

  function getTranslateY() {
    const st = getComputedStyle(container);
    const m = new DOMMatrix(st.transform);
    return m.m42;
  }

  function open() {
    container.classList.add('bs-peek');
    toggleBtn.classList.add('hidden');
  }

  function close() {
    container.classList.remove('bs-peek');
    toggleBtn.classList.remove('hidden');
  }

  function onTouchStart(e) {
    if (!mq.matches) return;
    dragging = true;
    startY = e.touches[0].clientY;
    startTranslate = getTranslateY();
    container.classList.add('bs-dragging');
  }

  function onTouchMove(e) {
    if (!dragging) return;
    e.preventDefault();
    currentY = e.touches[0].clientY;
    let dy = currentY - startY;
    let newY = startTranslate + dy;
    if (newY < 0) newY = 0;
    container.style.transform = `translateY(${newY}px)`;
  }

  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    container.classList.remove('bs-dragging');
    container.style.transform = '';
    const dy = currentY - startY;
    if (dy > 60) {
      close();
    } else {
      open();
    }
  }

  handle.addEventListener('touchstart', onTouchStart, { passive: true });
  handle.addEventListener('touchmove', onTouchMove, { passive: false });
  handle.addEventListener('touchend', onTouchEnd);

  handle.addEventListener('click', () => {
    if (!mq.matches) return;
    container.classList.contains('bs-peek') ? close() : open();
  });

  toggleBtn.addEventListener('click', () => open());

  const observer = new MutationObserver(() => {
    if (!mq.matches) return;
    const visible = container.style.display !== 'none';
    toggleBtn.style.display = visible ? '' : 'none';
  });
  observer.observe(container, { attributes: true, attributeFilter: ['style'] });
}
