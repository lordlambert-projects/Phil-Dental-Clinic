import { $, $$ } from "../utils.js";

// The hero stays in normal document flow. On larger screens, the single hero
// image is promoted into the story layer and travels between measured anchors.
export function initCinematic() {
  const story = $("#cinematic-story"),
    hero = $("#home"),
    visual = $("#shared-visual"),
    frame = $(".image-frame", visual),
    aboutSection = $("#about"),
    about = $("#about .about-copy"),
    aboutSteps = $$(
      ".about-copy > .eyebrow,.about-copy > h2,.about-copy > p,.about-copy > #care-principles,.about-copy > .text-link",
      aboutSection,
    );
  if (!story || !hero || !visual || !frame || !aboutSection || !about) return;

  const originalParent = visual.parentElement;
  const anchor = document.createElement("div");
  anchor.className = "hero-image-anchor";
  anchor.setAttribute("aria-hidden", "true");
  originalParent.insertBefore(anchor, visual);

  const desktop = matchMedia("(min-width: 601px)"),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smooth = (value) => value * value * (3 - 2 * value);
  const mix = (from, to, progress) => from + (to - from) * progress;
  let metrics = null,
    renderFrame = 0,
    measureFrame = 0,
    promoted = false;

  function restore() {
    if (promoted) anchor.after(visual);
    promoted = false;
    story.classList.remove("cinematic-ready");
    story.style.removeProperty("--about-overlay");
    visual.classList.remove("cinematic-traveller");
    visual.removeAttribute("style");
    frame.removeAttribute("style");
    about.removeAttribute("style");
    for (const element of aboutSteps) element.removeAttribute("style");
    metrics = null;
  }

  function promote() {
    if (promoted) return;
    story.append(visual);
    visual.classList.add("cinematic-traveller");
    story.classList.add("cinematic-ready");
    promoted = true;
  }

  function measure() {
    measureFrame = 0;
    if (
      !desktop.matches ||
      reduced.matches ||
      document.body.classList.contains("ai-active")
    ) {
      restore();
      return;
    }

    promote();
    visual.style.transform = "none";
    const storyRect = story.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const aboutRect = aboutSection.getBoundingClientRect();
    const startWidth = Math.max(1, anchorRect.width);
    const startHeight = Math.max(1, anchorRect.height);
    const coverScale = Math.max(
      aboutRect.width / startWidth,
      aboutRect.height / startHeight,
    );
    const startLeft = anchorRect.left - storyRect.left;
    const startTop = anchorRect.top - storyRect.top;
    const targetLeft =
      aboutRect.left - storyRect.left + (aboutRect.width - startWidth) / 2;
    const targetTop =
      aboutRect.top - storyRect.top + (aboutRect.height - startHeight) / 2;
    const storyTop = storyRect.top + window.scrollY;
    const aboutTop = aboutRect.top + window.scrollY;

    metrics = {
      startScroll: storyTop + window.innerHeight * 0.04,
      endScroll: Math.max(
        storyTop + window.innerHeight * 0.72,
        aboutTop + window.innerHeight * 0.12,
      ),
      startLeft,
      startTop,
      x: targetLeft - startLeft,
      y: targetTop - startTop,
      scale: coverScale,
    };
    visual.style.left = `${startLeft}px`;
    visual.style.top = `${startTop}px`;
    visual.style.width = `${startWidth}px`;
    visual.style.height = `${startHeight}px`;
    render();
  }

  function render() {
    renderFrame = 0;
    if (!metrics || !promoted) return;
    const progress = clamp(
      (window.scrollY - metrics.startScroll) /
        Math.max(1, metrics.endScroll - metrics.startScroll),
    );
    const travel = smooth(progress);
    const scale = mix(1, metrics.scale, travel);
    visual.style.transform = `translate3d(${metrics.x * travel}px,${metrics.y * travel}px,0) scale(${scale})`;
    frame.style.borderRadius = `${mix(120, 0, travel)}px ${mix(14, 0, travel)}px ${mix(14, 0, travel)}px ${mix(14, 0, travel)}px`;
    story.style.setProperty(
      "--about-overlay",
      String(smooth(clamp((progress - 0.48) / 0.38))),
    );

    const reveal = smooth(clamp((progress - 0.68) / 0.27));
    about.style.pointerEvents = reveal > 0.72 ? "auto" : "none";
    aboutSteps.forEach((element, index) => {
      const step = smooth(
        clamp((progress - (0.66 + index * 0.035)) / 0.25),
      );
      element.style.opacity = String(step);
      element.style.transform = `translate3d(0,${mix(28, 0, step)}px,0)`;
    });
  }

  function queueRender() {
    if (!renderFrame) renderFrame = requestAnimationFrame(render);
  }
  function queueMeasure() {
    cancelAnimationFrame(measureFrame);
    measureFrame = requestAnimationFrame(measure);
  }

  window.addEventListener("scroll", queueRender, { passive: true });
  window.addEventListener("resize", queueMeasure, { passive: true });
  window.addEventListener("orientationchange", queueMeasure, { passive: true });
  desktop.addEventListener("change", queueMeasure);
  reduced.addEventListener("change", queueMeasure);
  new MutationObserver(queueMeasure).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"],
  });
  new ResizeObserver(queueMeasure).observe(aboutSection);
  document.fonts.ready.then(queueMeasure);
  queueMeasure();
}
