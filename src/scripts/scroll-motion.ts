/**
 * Scroll choreography shared across the site.
 *
 * `[data-reveal]` / `[data-reveal-group]` get a one-shot entrance the first
 * time they cross into view. `[data-scene]` sections publish their scroll
 * progress as CSS custom properties so pinned content can be scrubbed by CSS
 * alone.
 *
 * Both run off the shared scroll ticker rather than an IntersectionObserver:
 * the scenes need per-frame positions anyway, and sharing the pass keeps the
 * reveal from depending on observer callbacks that never arrive in embedded or
 * background contexts — content hidden until revealed must never be able to
 * stay hidden.
 */

import { onScroll, requestTick } from "./scroll-ticker";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const sceneViewport = window.matchMedia("(min-width: 761px) and (min-height: 620px)");

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/** Fraction of the viewport an element must rise past before it is revealed. */
const REVEAL_TRIGGER = 0.92;

const reveals = new Set(
  document.querySelectorAll<HTMLElement>("[data-reveal], [data-reveal-group]"),
);
const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
const sceneHeights = new WeakMap<HTMLElement, number>();

let scenesActive = false;

function show(element: HTMLElement) {
  element.dataset.revealVisible = "true";
  reveals.delete(element);
}

function revealEverything() {
  for (const element of Array.from(reveals)) show(element);
}

function measureScenes() {
  scenes.forEach((scene) => sceneHeights.set(scene, scene.offsetHeight));
}

function updateReveals(viewportHeight: number) {
  if (reveals.size === 0) return;
  const trigger = viewportHeight * REVEAL_TRIGGER;
  // Read every position before touching the DOM, so one pass costs at most one
  // layout even while many elements are still pending.
  const due: HTMLElement[] = [];
  for (const element of reveals) {
    // Anything already scrolled past counts as seen, so a mid-page reload or a
    // jump to an anchor never strands content at opacity 0.
    if (element.getBoundingClientRect().top < trigger) due.push(element);
  }
  due.forEach(show);
}

function updateScenes(viewportHeight: number) {
  if (!scenesActive) return;
  for (const scene of scenes) {
    const top = scene.getBoundingClientRect().top;
    const height = sceneHeights.get(scene) ?? scene.offsetHeight;
    const travel = Math.max(1, height - viewportHeight);
    scene.style.setProperty("--scene-progress", clamp01(-top / travel).toFixed(4));
    scene.style.setProperty("--scene-enter", clamp01((viewportHeight - top) / viewportHeight).toFixed(4));
    scene.style.setProperty("--scene-exit", clamp01(-top / height).toFixed(4));
  }
}

function update() {
  const viewportHeight = window.innerHeight;
  updateReveals(viewportHeight);
  updateScenes(viewportHeight);
}

function syncSceneMode() {
  const next = scenes.length > 0 && sceneViewport.matches && !reducedMotion.matches;
  if (next === scenesActive) return;
  scenesActive = next;
  scenes.forEach((scene) => {
    scene.dataset.sceneActive = String(scenesActive);
    if (scenesActive) return;
    scene.style.removeProperty("--scene-progress");
    scene.style.removeProperty("--scene-enter");
    scene.style.removeProperty("--scene-exit");
  });
  if (scenesActive) measureScenes();
  requestTick();
}

if (reducedMotion.matches) revealEverything();

reducedMotion.addEventListener("change", (event) => {
  if (event.matches) revealEverything();
  syncSceneMode();
});

sceneViewport.addEventListener("change", syncSceneMode);

if (typeof ResizeObserver !== "undefined" && scenes.length > 0) {
  const resizeObserver = new ResizeObserver(() => { measureScenes(); requestTick(); });
  scenes.forEach((scene) => resizeObserver.observe(scene));
}

// Registered before the ticker attaches its own, so heights are re-measured
// before the same resize triggers a read.
window.addEventListener("resize", measureScenes);

measureScenes();
syncSceneMode();
onScroll(update);

// Tells the inline gate in the document head that reveals are being driven.
document.documentElement.dataset.motionReady = "true";
