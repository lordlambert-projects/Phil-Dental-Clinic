import { clinicConfig as config } from "../config.js";
import { $, escapeHTML as esc } from "../utils.js";
import { pictureHTML } from "../media.js";
export function initOptionalSections() {
  const staff = config.staff.filter((p) => p.approved);
  if (staff.length) {
    const section = document.createElement("section");
    section.className = "section container";
    section.id = "team";
    section.innerHTML = `<div class="eyebrow">THE PEOPLE BEHIND YOUR CARE</div><h2>Meet the team.</h2><div class="services-grid">${staff.map((p) => `<article class="feedback-card">${p.media ? pictureHTML(p.media, { alt: p.name }) : ""}<h3>${esc(p.name)}</h3><p>${esc(p.role || "")}</p><p>${esc(p.bio || "")}</p></article>`).join("")}</div>`;
    $("#gallery").before(section);
  }
  const approved = config.beforeAfter.filter(
    (p) => p.approved && p.before && p.after,
  );
  const comparisons = approved.length
    ? approved
    : (config.comparisonFrames || []).map((p) => ({
        ...p,
        before: "assets/images/case-frame.svg",
        after: "assets/images/case-frame.svg",
        pending: true,
        alt: "Abstract dental case frame",
        caption:
          "Treatment photographs will be added as clinical case images become available.",
      }));
  if (!comparisons.length) return;
  const section = document.createElement("section");
  section.id = "results";
  section.className = "section container";
  section.innerHTML = `<div class="section-heading"><div><div class="eyebrow">BEFORE & AFTER</div><h2>The details of<br><span class="gradient">a smile’s journey.</span></h2></div><p class="heading-aside">${approved.length ? "Individual case images, shared with permission. Results vary and do not guarantee an outcome." : "Our case collection is being prepared. Treatment photographs will be added as they become available."}</p></div><div class="comparison-grid"></div>`;
  for (const [i, pair] of comparisons.entries()) {
    const figure = document.createElement("figure");
    figure.className = "comparison-figure";
    figure.innerHTML = `<h3>${esc(pair.title || "Individual case")}</h3><div class="comparison" style="--comparison-split:50%"><img src="${esc(pair.before)}" alt="${pair.pending ? "Clinical case image frame" : `Before: ${esc(pair.alt)}`}" loading="lazy" decoding="async" width="800" height="500"><img class="comparison-after" src="${esc(pair.after)}" alt="${pair.pending ? "Clinical case image frame" : `After: ${esc(pair.alt)}`}" loading="lazy" decoding="async" width="800" height="500"><span class="comparison-label before-label">Before</span><span class="comparison-label after-label">After</span><span class="comparison-divider" aria-hidden="true"><span>⋮</span></span><label class="sr-only" for="compare-${i}">Compare before and after</label><input id="compare-${i}" class="comparison-range" type="range" min="0" max="100" value="50" aria-label="Compare before and after for ${esc(pair.title || "case " + (i + 1))}" aria-valuetext="50 percent before, 50 percent after"></div><figcaption>${esc(pair.caption || "Individual results vary.")}</figcaption>`;
    const range = $("input", figure),
      container = $(".comparison", figure);
    range.addEventListener("input", () => {
      container.style.setProperty("--comparison-split", range.value + "%");
      range.setAttribute(
        "aria-valuetext",
        `${range.value} percent before, ${100 - range.value} percent after`,
      );
    });
    $(".comparison-grid", section).append(figure);
  }
  $("#reviews").before(section);
}
