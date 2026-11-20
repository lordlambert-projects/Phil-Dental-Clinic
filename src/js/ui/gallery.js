import { approvedGallery, clinicConfig as config } from "../config.js";
import { pictureHTML } from "../media.js";
import { $, $$, escapeHTML as esc } from "../utils.js";

// Grid images are capped at 640px. Larger files are only assigned in an open dialog.
export function thumbnailMedia(media) {
  if (!media) return null;
  const small = (type) => {
    const items = media[type] || [];
    return items.filter((item) => item.width <= 640).length
      ? items.filter((item) => item.width <= 640)
      : items.slice(0, 1);
  };
  const webp = small("webp");
  return {
    ...media,
    src: webp.at(-1)?.src || media.src,
    webp,
    avif: small("avif"),
  };
}
export function initGallery() {
  const gallery = approvedGallery(),
    section = $("#gallery"),
    grid = $("#gallery-grid"),
    box = $("#lightbox"),
    stage = $("#lightbox-stage"),
    motion = matchMedia("(prefers-reduced-motion: reduce)");
  const nav = $('nav a[href="#gallery"]');
  if (!gallery.length) {
    section.hidden = true;
    if (nav) nav.hidden = true;
    return;
  }
  section.hidden = false;
  if (nav) nav.hidden = false;
  const previewIndexes = [0, 1, 3, 6, 8].filter(
    (index) => index < gallery.length,
  );
  grid.dataset.count = String(gallery.length);
  grid.dataset.previewCount = String(previewIndexes.length);
  const generated = gallery.filter((g) => g.kind === "generated");
  $(".section-heading h2", section).textContent =
    config.galleryHeading || "Take a look around.";
  $(".section-heading .eyebrow", section).textContent = "CLINIC GALLERY";
  const intro = $(".section-heading .heading-aside", section);
  intro.textContent =
    config.galleryIntro ||
    "A closer look at spaces that feel welcoming, calm, and considered.";
  if (generated.length) {
    const disclosure = document.createElement("p");
    disclosure.className = "gallery-disclosure";
    disclosure.innerHTML =
      '<span aria-hidden="true">✧</span><span>Illustrative clinic environments. Generated visuals shown here are not photographs of Phil Dental Clinic.</span>';
    grid.before(disclosure);
  }
  grid.innerHTML =
    previewIndexes
      .map((galleryIndex, previewIndex) => {
        const g = gallery[galleryIndex];
      const alt = g.alt || g.caption || g.title || "Dental clinic environment";
        return `<div class="gallery-item reveal gallery-reveal${g.featured ? " gallery-featured" : ""}" aria-hidden="true" style="--reveal-delay:${previewIndex * 75}ms">${g.media ? pictureHTML(thumbnailMedia(g.media), { alt: "", sizes: "(max-width: 600px) 92vw, (max-width: 1000px) 45vw, 34vw" }) : `<img src="${esc(g.src)}" alt="" width="${g.width || 1000}" height="${g.height || 667}" loading="lazy" decoding="async">`}${g.kind === "generated" ? '<span class="gallery-kind">Illustrative visual</span>' : ""}<div><span class="gallery-index">${String(galleryIndex + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}</span>${g.title ? `<h3>${esc(g.title)}</h3>` : ""}</div></div>`;
      })
      .join("") +
    `<button class="gallery-entry" type="button" data-gallery="0" aria-label="Explore the complete gallery of ${gallery.length} images"><span aria-hidden="true" class="gallery-entry-icon">✦</span><strong>Explore the Gallery</strong><small>View all ${gallery.length} images</small></button>`;
  let image = $("#lightbox-image"),
    picture = image.closest("picture");
  if (!picture) {
    picture = document.createElement("picture");
    picture.id = "lightbox-picture";
    image.before(picture);
    picture.append(image);
  }
  const avif = document.createElement("source"),
    webp = document.createElement("source");
  avif.type = "image/avif";
  webp.type = "image/webp";
  picture.prepend(avif, webp);
  image.loading = "eager";
  image.decoding = "async";
  const status = document.createElement("span");
  status.id = "gallery-status";
  status.className = "gallery-status";
  status.setAttribute("role", "status");
  stage.append(status);
  let current = 0,
    opener = null,
    playing = false,
    timer = null,
    swipe = null,
    requestId = 0,
    loaded = false;
  const duration = 4800,
    animations = new Set();
  $("#gallery-dots").innerHTML = gallery
    .map(
      (g, i) =>
        `<button type="button" data-slide="${i}" aria-label="View image ${i + 1}: ${esc(g.title || g.alt || "Clinic environment")}" aria-pressed="false"></button>`,
    )
    .join("");
  function clearTimer() {
    clearTimeout(timer);
    timer = null;
    box.classList.remove("is-playing");
    $(".gallery-progress span", box)
      ?.getAnimations?.()
      .forEach((a) => a.cancel());
  }
  function updatePlay() {
    const button = $("#gallery-play");
    button.textContent = playing ? "Pause slideshow" : "Play slideshow";
    button.setAttribute("aria-pressed", String(playing));
  }
  function schedule() {
    clearTimer();
    if (!playing || !loaded || !box.open || document.hidden) return;
    box.classList.add("is-playing");
    if (!motion.matches)
      $(".gallery-progress span", box)?.animate?.(
        [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
        { duration, fill: "forwards", easing: "linear" },
      );
    timer = setTimeout(() => show(current + 1), duration);
  }
  function animate(element, frames, options, remove = false) {
    if (!element.animate) {
      if (remove) element.remove();
      return;
    }
    const a = element.animate(frames, options);
    animations.add(a);
    a.finished
      .then(() => {
        animations.delete(a);
        a.cancel();
        if (remove) element.remove();
      })
      .catch(() => {
        animations.delete(a);
        if (remove) element.remove();
      });
  }
  function setImage(item) {
    const full = item.media,
      sizes = "(max-width: 600px) 94vw, 1080px";
    for (const [source, type] of [
      [avif, "avif"],
      [webp, "webp"],
    ]) {
      if (full?.[type]?.length) {
        source.srcset = full[type]
          .map((v) => `${v.src} ${v.width}w`)
          .join(", ");
        source.sizes = sizes;
      } else {
        source.removeAttribute("srcset");
        source.removeAttribute("sizes");
      }
    }
    if (full?.webp?.length) {
      image.srcset = full.webp.map((v) => `${v.src} ${v.width}w`).join(", ");
      image.sizes = sizes;
    } else {
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
    }
    image.width = full?.width || item.width || 1000;
    image.height = full?.height || item.height || 667;
    image.alt =
      item.alt || item.caption || item.title || "Dental clinic environment";
    image.src = full?.src || item.src;
  }
  async function show(index, transition = true) {
    clearTimer();
    animations.forEach((a) => a.cancel());
    animations.clear();
    $$(".gallery-outgoing", stage).forEach((el) => el.remove());
    const ticket = ++requestId,
      next = (index + gallery.length) % gallery.length,
      direction = index < current ? -1 : 1,
      item = gallery[next];
    const outgoing =
      transition && loaded && !motion.matches ? picture.cloneNode(true) : null;
    if (outgoing) {
      outgoing.removeAttribute("id");
      outgoing
        .querySelectorAll("[id]")
        .forEach((el) => el.removeAttribute("id"));
      outgoing.querySelector("img").alt = "";
      outgoing.setAttribute("aria-hidden", "true");
      outgoing.classList.add("gallery-outgoing");
      stage.append(outgoing);
    }
    loaded = false;
    current = next;
    status.textContent = "Loading image…";
    box.dataset.imageState = "loading";
    $("#gallery-counter").textContent =
      `${String(current + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}`;
    $("#lightbox-title").textContent = item.title || "";
    $("#lightbox-caption").textContent =
      item.kind === "generated"
        ? "Generated clinic-environment visual · not a photograph of Phil Dental Clinic."
        : item.caption || "";
    $$("[data-slide]", box).forEach((b, i) =>
      b.setAttribute("aria-pressed", String(i === current)),
    );
    setImage(item);
    try {
      if (typeof image.decode === "function") await image.decode();
    } catch {
      if (ticket !== requestId || !box.open) {
        outgoing?.remove();
        return;
      }
      status.textContent = "This image could not load. Try another image.";
      box.dataset.imageState = "error";
      playing = false;
      updatePlay();
      outgoing?.remove();
      return;
    }
    if (ticket !== requestId || !box.open) {
      outgoing?.remove();
      return;
    }
    status.textContent = "";
    box.dataset.imageState = "ready";
    loaded = true;
    if (outgoing) {
      animate(
        outgoing,
        [
          { transform: "translateX(0) scale(1)", opacity: 1 },
          {
            transform: `translateX(${-direction * 35}px) scale(1.045)`,
            opacity: 0,
          },
        ],
        { duration: 700, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
        true,
      );
      animate(
        picture,
        [
          {
            transform: `translateX(${direction * 40}px) scale(1.025)`,
            opacity: 0,
          },
          { transform: "translateX(0) scale(1)", opacity: 1 },
        ],
        { duration: 850, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" },
      );
    }
    const connection = navigator.connection;
    if (
      !connection?.saveData &&
      !/^(slow-2g|2g)$/.test(connection?.effectiveType || "")
    ) {
      const neighbour = gallery[(current + 1) % gallery.length];
      const preload = new Image();
      preload.decoding = "async";
      preload.fetchPriority = "low";
      const neighbourImage = grid.querySelector(
        `[data-gallery="${(current + 1) % gallery.length}"] img`,
      );
      preload.src =
        neighbourImage?.currentSrc ||
        thumbnailMedia(neighbour.media)?.src ||
        neighbour.src;
    }
    schedule();
  }
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery]");
    if (!button) return;
    opener = button;
    box.showModal();
    document.body.classList.add("gallery-open");
    playing = !motion.matches;
    updatePlay();
    show(Number(button.dataset.gallery), false);
  });
  $("#gallery-prev").addEventListener("click", () => show(current - 1));
  $("#gallery-next").addEventListener("click", () => show(current + 1));
  $("#gallery-dots").addEventListener("click", (event) => {
    const button = event.target.closest("[data-slide]");
    if (button) show(Number(button.dataset.slide));
  });
  $("#gallery-play").addEventListener("click", () => {
    playing = !playing;
    updatePlay();
    schedule();
  });
  box.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      box.close();
    }
  });
  stage.addEventListener("pointerdown", (event) => {
    swipe = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  stage.addEventListener("pointerup", (event) => {
    if (swipe) {
      const dx = event.clientX - swipe.x,
        dy = event.clientY - swipe.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.2)
        show(current + (dx < 0 ? 1 : -1));
    }
    swipe = null;
  });
  stage.addEventListener("pointercancel", () => (swipe = null));
  box.addEventListener("close", () => {
    ++requestId;
    playing = false;
    loaded = false;
    updatePlay();
    document.body.classList.remove("gallery-open");
    box.dataset.imageState = "idle";
    clearTimer();
    animations.forEach((a) => a.cancel());
    animations.clear();
    $$(".gallery-outgoing", stage).forEach((el) => el.remove());
    avif.removeAttribute("srcset");
    webp.removeAttribute("srcset");
    image.removeAttribute("srcset");
    image.removeAttribute("src");
    status.textContent = "";
    opener?.focus({ preventScroll: true });
  });
  document.addEventListener("visibilitychange", schedule);
  motion.addEventListener("change", () => {
    if (motion.matches) {
      playing = false;
      updatePlay();
      clearTimer();
      animations.forEach((a) => a.cancel());
    }
  });
}
