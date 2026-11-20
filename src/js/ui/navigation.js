import { $, $$ } from "../utils.js";
export function initNavigation() {
  const toggle = $("#menu-toggle"),
    nav = $("#navigation");
  const close = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute(
      "aria-label",
      open ? "Close navigation" : "Open navigation",
    );
    if (open) $("a", nav).focus();
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", close));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      close();
      toggle.focus();
    }
    if (e.key === "Tab" && nav.classList.contains("open")) {
      const links = $$("a", nav);
      if (e.shiftKey && document.activeElement === links[0]) {
        e.preventDefault();
        toggle.focus();
      } else if (!e.shiftKey && document.activeElement === links.at(-1)) {
        e.preventDefault();
        toggle.focus();
      } else if (document.activeElement === toggle) {
        e.preventDefault();
        (e.shiftKey ? links.at(-1) : links[0]).focus();
      }
    }
  });
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) close();
  });
  let headerFrame = 0;
  const updateHeader = () => {
    headerFrame = 0;
    $("#header").classList.toggle("compact", window.scrollY > 40);
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && headerFrame) {
      cancelAnimationFrame(headerFrame);
      headerFrame = 0;
    }
  });
  updateHeader();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) {
          $$("a", nav).forEach((a) =>
            a.classList.toggle("active", a.hash === `#${entry.target.id}`),
          );
        }
    },
    { rootMargin: "-15% 0px -60% 0px", threshold: 0 },
  );
  $$("main section[id]").forEach((s) => observer.observe(s));
}
