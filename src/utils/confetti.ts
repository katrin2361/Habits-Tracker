export function triggerConfetti(originElement?: HTMLElement | null) {
  const colors = ['#10b981', '#fd761a', '#71a1ff', '#6ffbbe', '#f59e0b', '#ec4899'];
  const count = 16;
  const rect = originElement ? originElement.getBoundingClientRect() : {
    left: window.innerWidth / 2 - 20,
    top: window.innerHeight / 2 - 20,
    width: 40,
    height: 40
  };

  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'fixed pointer-events-none z-50 rounded-full';
    const size = Math.floor(Math.random() * 6) + 4;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = `${originX}px`;
    el.style.top = `${originY}px`;
    document.body.appendChild(el);

    const angle = (i / count) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
    const distance = 40 + Math.random() * 45;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 15;

    el.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 650,
      easing: 'cubic-bezier(0.1, 1, 0.1, 1)'
    }).onfinish = () => el.remove();
  }
}
