/**
 * @module ui/sidebar-anim
 * @description Premium GSAP-анимации для группированного сайдбара.
 */

export function initSidebarAnimations() {
  if (typeof gsap === 'undefined') return;

  const groups = document.querySelectorAll('.sidebar-group');
  if (!groups.length) return;

  groups.forEach((group, i) => {
    const header = group.querySelector('.sidebar-group-header');
    const body = group.querySelector('.sidebar-group-body');
    if (!header || !body) return;

    header.addEventListener('click', () => {
      const isCollapsed = group.classList.contains('collapsed');
      if (isCollapsed) expandGroup(group, body);
      else collapseGroup(group, body);
    });

    // Staggered entrance — безопасно: сначала ставим видимость через CSS,
    // анимация только мягко подтягивает вверх
    group.style.opacity = '1';
    gsap.from(group, {
      opacity: 0, y: 10,
      duration: 0.4,
      delay: 0.06 * i,
      ease: 'power2.out',
      clearProps: 'opacity,transform'
    });
  });

  document.querySelectorAll('.sidebar-group-body .sidebar-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { scale: 1.02, duration: 0.2, ease: 'back.out(2)' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' });
    });
  });
}

function expandGroup(group, body) {
  group.classList.remove('collapsed');
  body.style.overflow = 'hidden';
  body.style.maxHeight = 'none';
  const h = body.scrollHeight;
  body.style.maxHeight = '0px';
  body.style.opacity = '0';

  gsap.to(body, {
    maxHeight: h + 'px',
    opacity: 1,
    duration: 0.4,
    ease: 'power2.out',
    onComplete: () => {
      body.style.maxHeight = '600px';
      body.style.overflow = 'visible';
    }
  });

  const children = body.querySelectorAll('.sidebar-btn, .sidebar-select, .custom-select-wrapper');
  gsap.fromTo(children,
    { opacity: 0, x: -8 },
    { opacity: 1, x: 0, duration: 0.25, stagger: 0.04, ease: 'power2.out', delay: 0.1, clearProps: 'opacity,transform' }
  );
}

function collapseGroup(group, body) {
  body.style.overflow = 'hidden';
  const h = body.scrollHeight;
  body.style.maxHeight = h + 'px';

  gsap.to(body, {
    maxHeight: '0px',
    opacity: 0,
    duration: 0.35,
    ease: 'power2.inOut',
    onComplete: () => { group.classList.add('collapsed'); }
  });
}
