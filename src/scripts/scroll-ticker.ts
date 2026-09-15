/**
 * One rAF-coalesced ticker for everything that reads scroll position.
 *
 * Animation frames stop in a hidden or heavily throttled tab. Anything that
 * decides what is visible must not stall there, so a queued frame that does not
 * arrive in time is abandoned and the work runs inline instead.
 */

type Tick = () => void;

/** How long a queued frame may stay unclaimed before we stop waiting for it. */
const FRAME_STALL_MS = 250;

const listeners = new Set<Tick>();

let queued = false;
let queuedAt = 0;
let attached = false;

function run() {
  queued = false;
  for (const listener of listeners) listener();
}

export function requestTick() {
  if (queued && performance.now() - queuedAt < FRAME_STALL_MS) return;
  if (queued || document.hidden) {
    run();
    return;
  }
  queued = true;
  queuedAt = performance.now();
  requestAnimationFrame(run);
}

function attach() {
  if (attached) return;
  attached = true;
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  window.addEventListener("load", requestTick);
  window.addEventListener("pageshow", requestTick);
  document.addEventListener("visibilitychange", () => { queued = false; requestTick(); });
}

/** Register `tick`, run it once, and return an unsubscribe function. */
export function onScroll(tick: Tick) {
  attach();
  listeners.add(tick);
  tick();
  return () => listeners.delete(tick);
}
