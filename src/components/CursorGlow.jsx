import { useEffect, useRef, useState } from 'react';

export default function CursorGlow() {
  const [enabled] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const haloRef = useRef(null);
  const pulseRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const halo = haloRef.current;
    const pulse = pulseRef.current;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const haloPos = { ...target };

    let rafId = 0;
    let running = false;
    let visible = false;
    let touching = false;
    let hideTimer = 0;

    function tick() {
      const ease = touching ? 0.45 : 0.24;
      haloPos.x += (target.x - haloPos.x) * ease;
      haloPos.y += (target.y - haloPos.y) * ease;

      halo.style.transform = 'translate3d(' + haloPos.x.toFixed(1) + 'px, ' + haloPos.y.toFixed(1) + 'px, 0)';

      const settled =
        Math.abs(target.x - haloPos.x) < 0.25 &&
        Math.abs(target.y - haloPos.y) < 0.25;

      if (!settled) {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    }

    function startLoop() {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function updateMode(targetEl, isTouch) {
      if (isTouch) {
        halo.dataset.mode = 'touch';
        return;
      }
      if (!targetEl || !targetEl.closest) {
        halo.dataset.mode = 'idle';
        return;
      }
      const isTextField = targetEl.closest('input:not([type="checkbox"]):not([type="radio"]):not([type="date"]), textarea');
      const isInteractive = targetEl.closest('a, button, select, label, [role="switch"], [role="button"]');

      if (isTextField) {
        halo.dataset.mode = 'text';
      } else if (isInteractive) {
        halo.dataset.mode = 'interactive';
      } else {
        halo.dataset.mode = 'idle';
      }
    }

    function showAt(x, y, snap) {
      target.x = x;
      target.y = y;
      if (!visible || snap) {
        visible = true;
        haloPos.x = x;
        haloPos.y = y;
        halo.style.transform = 'translate3d(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px, 0)';
      }
      halo.style.opacity = '1';
      startLoop();
    }

    function triggerPulse(x, y) {
      if (!pulse) return;
      pulse.style.left = x + 'px';
      pulse.style.top = y + 'px';
      pulse.classList.remove('is-active');
      void pulse.offsetWidth;
      pulse.classList.add('is-active');
    }

    function scheduleTouchHide() {
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        touching = false;
        visible = false;
        halo.dataset.pressed = 'false';
        halo.style.opacity = '0';
      }, 360);
    }

    function handleMouseMove(event) {
      if (event.pointerType === 'touch' || touching) return;
      clearTimeout(hideTimer);
      showAt(event.clientX, event.clientY, false);
      updateMode(event.target, false);
    }

    function handleMouseDown(event) {
      if (event.pointerType === 'touch' || touching) return;
      halo.dataset.pressed = 'true';
      updateMode(event.target, false);
      showAt(event.clientX, event.clientY, false);
      triggerPulse(event.clientX, event.clientY);
    }

    function handleMouseUp(event) {
      if (event.pointerType === 'touch' || touching) return;
      halo.dataset.pressed = 'false';
    }

    function handleTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      clearTimeout(hideTimer);
      touching = true;
      halo.dataset.pressed = 'true';
      updateMode(event.target, true);
      showAt(touch.clientX, touch.clientY, true);
      triggerPulse(touch.clientX, touch.clientY);
    }

    function handleTouchMove(event) {
      const touch = event.touches[0];
      if (!touch) return;
      clearTimeout(hideTimer);
      touching = true;
      updateMode(event.target, true);
      showAt(touch.clientX, touch.clientY, false);
    }

    function handleTouchEnd() {
      halo.dataset.pressed = 'false';
      scheduleTouchHide();
    }

    function handleLeave() {
      if (touching) return;
      visible = false;
      halo.style.opacity = '0';
    }

    window.addEventListener('pointermove', handleMouseMove, { passive: true });
    window.addEventListener('pointerdown', handleMouseDown, { passive: true });
    window.addEventListener('pointerup', handleMouseUp, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    document.documentElement.addEventListener('pointerleave', handleLeave);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(hideTimer);
      window.removeEventListener('pointermove', handleMouseMove);
      window.removeEventListener('pointerdown', handleMouseDown);
      window.removeEventListener('pointerup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      document.documentElement.removeEventListener('pointerleave', handleLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div ref={pulseRef} className="cursor-pulse" />
      <div ref={haloRef} className="cursor-halo" data-mode="idle" />
    </div>
  );
}
