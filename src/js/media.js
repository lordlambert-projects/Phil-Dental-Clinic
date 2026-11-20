import { escapeHTML as esc } from "./utils.js";
export function pictureHTML(
  media,
  {
    alt = "",
    sizes = "(max-width: 600px) 92vw, 45vw",
    eager = false,
    className = "",
  } = {},
) {
  if (!media) return "";
  const set = (type) =>
    media[type]?.map((item) => `${item.src} ${item.width}w`).join(", ");
  return `<picture class="${esc(className)}">${set("avif") ? `<source type="image/avif" srcset="${esc(set("avif"))}" sizes="${esc(sizes)}">` : ""}${set("webp") ? `<source type="image/webp" srcset="${esc(set("webp"))}" sizes="${esc(sizes)}">` : ""}<img src="${esc(media.src)}" ${set("webp") ? `srcset="${esc(set("webp"))}" sizes="${esc(sizes)}"` : ""} alt="${esc(alt)}" width="${media.width}" height="${media.height}" loading="${eager ? "eager" : "lazy"}" decoding="async" ${eager ? 'fetchpriority="high"' : ""}></picture>`;
}
export function applyImage(img, media, alt, { eager = false, sizes } = {}) {
  if (!img || !media) return;
  if (
    img.parentElement.tagName === "PICTURE" &&
    img.getAttribute("src") === media.src &&
    img.getAttribute("srcset")
  ) {
    img.alt = alt;
    return;
  }
  const wrapper = document.createElement("div");
  wrapper.innerHTML = pictureHTML(media, { alt, eager, sizes });
  const picture = wrapper.firstElementChild;
  picture.querySelector("img").id = img.id;
  if (img.parentElement.tagName === "PICTURE")
    img.parentElement.replaceWith(picture);
  else img.replaceWith(picture);
}
