const touchTimers = new WeakMap();

export function spotlightMove(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  if (!point) return;

  card.style.setProperty('--mx', (point.clientX - rect.left) + 'px');
  card.style.setProperty('--my', (point.clientY - rect.top) + 'px');
}

export function spotlightTouchStart(event) {
  const card = event.currentTarget;
  spotlightMove(event);
  card.classList.add('is-touched');
  clearTimeout(touchTimers.get(card));
}

export function spotlightTouchEnd(event) {
  const card = event.currentTarget;
  clearTimeout(touchTimers.get(card));
  const timer = window.setTimeout(() => {
    card.classList.remove('is-touched');
  }, 320);
  touchTimers.set(card, timer);
}
