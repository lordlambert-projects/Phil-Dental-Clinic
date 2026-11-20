export function initBrandLogo(config) {
  const logos = [...document.querySelectorAll("[data-logo]")];
  if (!logos.length) return;

  const wrappers = logos.map((image) => {
    image.alt = config.name;
    image.width = 320;
    image.height = 209;
    image.decoding = "async";
    image.srcset = config.logoSrcset || "";
    image.sizes = "(max-width: 600px) 132px, 150px";
    image.classList.add("official-logo-image");
    image.addEventListener(
      "error",
      () => {
        if (config.logoFallback && !image.src.endsWith(config.logoFallback))
          image.src = config.logoFallback;
      },
      { once: true },
    );

    const wrapper = document.createElement("span");
    wrapper.className = "brand-logo3d";
    wrapper.style.setProperty("--brand-logo", `url("${config.logo}")`);
    image.before(wrapper);
    wrapper.append(image);
    for (let index = 0; index < 4; index += 1) {
      const segment = document.createElement("i");
      segment.className = "logo-wave-segment";
      segment.style.setProperty("--segment", index);
      segment.setAttribute("aria-hidden", "true");
      wrapper.append(segment);
    }
    return wrapper;
  });

  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const visible = new Set();
  let timer = 0;

  function clearCycle() {
    clearTimeout(timer);
    timer = 0;
    wrappers.forEach((logo) => logo.classList.remove("is-waving"));
  }

  function schedule() {
    clearTimeout(timer);
    if (document.hidden || reduced.matches || !visible.size) return;
    timer = window.setTimeout(() => {
      visible.forEach((logo) => logo.classList.add("is-waving"));
      window.setTimeout(
        () => visible.forEach((logo) => logo.classList.remove("is-waving")),
        1450,
      );
      schedule();
    }, 9000);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      schedule();
    },
    { rootMargin: "80px", threshold: 0.05 },
  );
  wrappers.forEach((logo) => observer.observe(logo));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearCycle();
    else schedule();
  });
  reduced.addEventListener("change", () => {
    if (reduced.matches) clearCycle();
    else schedule();
  });
}
