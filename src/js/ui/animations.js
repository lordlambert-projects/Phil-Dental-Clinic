import { $, $$ } from "../utils.js";
export function initAnimations() {
  const motion = matchMedia("(prefers-reduced-motion: reduce)"),
    fine = matchMedia("(pointer:fine)");
  const lowPower =
    navigator.connection?.saveData ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  document.body.classList.toggle("low-power", Boolean(lowPower));
  let observer;
  if (!motion.matches) {
    document.body.classList.add("motion-enabled");
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px 35px 0px" },
    );
    $$(".reveal,.card-enter").forEach((el) => observer.observe(el));
    const changes = new MutationObserver(() => {
      $$(".card-enter:not(.visible)", $("#services-grid")).forEach((el) =>
        observer.observe(el),
      );
    });
    changes.observe($("#services-grid"), { childList: true });
  }
  const orbObserver = new IntersectionObserver(
    (entries) => {
      for (const e of entries)
        e.target.classList.toggle("is-offscreen", !e.isIntersecting);
    },
    { rootMargin: "100px" },
  );
  $$(".feature-orb").forEach((el) => orbObserver.observe(el));
  let pointerFrame = 0,
    pointer = null;
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!fine.matches || motion.matches || document.hidden) return;
      const el = event.target.closest("[data-tilt]");
      if (!el) return;
      pointer = { el, x: event.clientX, y: event.clientY };
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(() => {
        pointerFrame = 0;
        const { el, x: clientX, y: clientY } = pointer;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (clientX - rect.left) / rect.width - 0.5,
          y = (clientY - rect.top) / rect.height - 0.5;
        el.classList.add("is-hovered");
        el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
        el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
        el.style.transform = `perspective(1000px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) translateY(-2px)`;
      });
    },
    { passive: true },
  );
  document.addEventListener("pointerout", (event) => {
    const el = event.target.closest("[data-tilt]");
    if (el && !el.contains(event.relatedTarget)) {
      if (pointer?.el === el) {
        cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
      }
      el.style.transform = "";
      el.classList.remove("is-hovered");
    }
  });
  const light = $(".hero-light"),
    images = $$(".about-visual img");
  let scrollFrame = 0;
  window.addEventListener(
    "scroll",
    () => {
      if (
        scrollFrame ||
        motion.matches ||
        !fine.matches ||
        lowPower ||
        document.hidden ||
        document.body.classList.contains("ai-active")
      )
        return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const reads = images.map((image) => ({
          image,
          rect: image.getBoundingClientRect(),
        }));
        light.style.transform = `translateY(${Math.min(window.scrollY / 600, 1) * 60}px)`;
        for (const { image, rect } of reads)
          if (rect.bottom > 0 && rect.top < window.innerHeight)
            image.style.setProperty(
              "--image-scale",
              String(
                1 +
                  Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight)) *
                    0.045,
              ),
            );
      });
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    document.body.classList.toggle("document-hidden", document.hidden);
    if (document.hidden) {
      cancelAnimationFrame(pointerFrame);
      cancelAnimationFrame(scrollFrame);
      pointerFrame = 0;
      scrollFrame = 0;
    }
  });
  motion.addEventListener("change", () => {
    if (motion.matches) {
      document.body.classList.remove("motion-enabled");
      $$("[data-tilt]").forEach((el) => (el.style.transform = ""));
    }
  });
}
