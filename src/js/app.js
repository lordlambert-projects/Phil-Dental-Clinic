import { clinicConfig as config, enabledServices } from "./config.js";
import {
  $,
  $$,
  escapeHTML as esc,
  safeURL,
  linkifyPhoneNumbers,
} from "./utils.js";
import { applyImage, pictureHTML } from "./media.js";
import { initChat } from "./ai/chat-ui.js";
import { initNavigation } from "./ui/navigation.js";
import { initAnimations } from "./ui/animations.js";
import { initForms } from "./ui/forms.js";
import { initGallery } from "./ui/gallery.js";
import { initLocation } from "./ui/location.js";
import { initSound } from "./ui/sound.js";
import { initCinematic } from "./ui/cinematic.js";
import { initOptionalSections } from "./ui/optional-sections.js";
import { initBrandLogo } from "./ui/brand-logo.js";
const icons = {
  General:
    '<path d="M16 11c-7-5-13 0-11 8 1 6 3 14 6 14s1-10 5-10 2 10 5 10 5-8 6-14c2-8-4-13-11-8Z"/><path d="M30 5v9m-4-4h8"/>',
  Cosmetic:
    '<path d="M16 11c-7-5-13 0-11 8 1 6 3 14 6 14s1-10 5-10 2 10 5 10 5-8 6-14c2-8-4-13-11-8Z"/><path d="m29 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/>',
  Restorative:
    '<path d="M12 8h14l-2 10H14L12 8Zm7 10v17m-5-14 10 3m-10 2 10 3m-10 2 10 3M15 4h8"/><path d="M8 17c-4 6-3 15 2 19m20-19c4 6 3 15-2 19"/>',
  Orthodontic:
    '<path d="M5 12c8-5 22-5 30 0v16c-8 5-22 5-30 0V12Z"/><path d="M5 20h30M12 10v20m8-21v22m8-21v20"/><path d="M9 17h6v6H9zm8 0h6v6h-6zm8 0h6v6h-6Z"/>',
};
const icon = (s) =>
  `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[s.icon] || icons.General}</svg>`;
function applyConfig() {
  $$("[data-brand]").forEach((el) => {
    el.textContent = config.name;
    el.classList.add("brand-name-visually-hidden");
  });
  $$("[data-logo]").forEach((el) => (el.src = config.logo));
  $('link[rel="icon"]').href = "assets/brand/phil-logo-favicon.png";
  $('link[rel="icon"]').type = "image/png";
  $('meta[name="theme-color"]').content = config.theme.background || "#050917";
  document.title = config.seo.title || `${config.name} — ${config.tagline}`;
  $('meta[name="description"]').content =
    config.seo.description || config.description;
  $('meta[property="og:title"]').content = document.title;
  $('meta[property="og:description"]').content =
    config.seo.description || config.description;
  const themeTokens = {
    primary: "--blue",
    secondary: "--violet",
    accent: "--cyan",
    background: "--bg",
    backgroundSecondary: "--bg2",
    surface: "--surface",
    card: "--card",
    text: "--white",
    muted: "--muted",
  };
  for (const [key, value] of Object.entries(config.theme)) {
    if (themeTokens[key])
      document.documentElement.style.setProperty(themeTokens[key], value);
  }
  $("#hero-line-one").textContent = config.hero.headline[0];
  $("#hero-line-two").textContent = config.hero.headline[1];
  for (const id of ["hero-line-one", "hero-line-two"]) { const el = $("#"+id); el.innerHTML = el.textContent.split(" ").map((word,i)=>`<span class="hero-word" style="--word-delay:${i*90}ms">${esc(word)}</span>`).join(" "); }
  $("#hero-description").textContent = config.hero.description;
  if (config.hero.media)
    applyImage($("#hero-image"), config.hero.media, config.hero.alt, {
      eager: true,
      sizes: "(max-width: 600px) 92vw, 100vw",
    });
  else {
    $("#hero-image").src = config.hero.image;
    $("#hero-image").alt = config.hero.alt;
  }
  const aboutImage = $(".about-visual img");
  if (config.about.media)
    applyImage(
      aboutImage,
      config.about.media,
      config.about.alt || "Phil Dental Clinic",
      { sizes: "(max-width: 600px) 90vw, 42vw" },
    );
  else {
    aboutImage.src = config.about.image;
    aboutImage.alt = "Phil Dental Clinic brand mark";
    $(".about-visual").classList.add("brand-visual");
  }
  $("#about-title").textContent = config.about.title;
  $("#about-description").textContent = config.about.description;
  $("#care-principles").innerHTML = config.about.principles
    .map(
      ([n, t, d]) =>
        `<div class="principle"><span>${esc(n)}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`,
    )
    .join("");
  $("#footer-description").textContent = config.description;
  $("#copyright").textContent =
    `© ${new Date().getFullYear()} ${config.name}. ${config.tagline}`;
  if (!config.demoMode) $$(".demo-only").forEach((el) => (el.hidden = true));
  const contact = [];
  if (config.address) contact.push(`<p>${esc(config.address)}</p>`);
  if (config.phone)
    contact.push(
      `<p><a href="tel:${esc((config.phoneInternational || config.phone).replace(/[^+\d]/g, ""))}">${esc(config.phone)}</a></p>`,
    );
  if (config.email)
    contact.push(
      `<p><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></p>`,
    );
  if (config.whatsapp)
    contact.push(
      `<p><a href="https://wa.me/${esc(config.whatsapp.replace(/\D/g, ""))}" target="_blank" rel="noopener">WhatsApp</a></p>`,
    );
  if (safeURL(config.mapsUrl))
    contact.push(
      `<p><a href="${esc(safeURL(config.mapsUrl))}" target="_blank" rel="noopener">Get directions</a></p>`,
    );
  if (config.openingHours.length)
    contact.push(
      `<p>${config.openingHours.map((h) => esc(typeof h === "string" ? h : `${h.day}: ${h.hours}`)).join("<br>")}</p>`,
    );
  $("#contact-details").innerHTML = contact.length
    ? contact.join("")
    : `<p>${config.demoMode ? "Make this space yours." : "Clinic information will appear here."}</p><small>${config.demoMode ? "Clinic address, opening hours, and contact details<br>can be added in the template configuration." : "Contact information is currently unavailable."}</small>`;
  if (!config.demoMode && config.address && config.phone) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Dentist",
      name: config.name,
      description: config.description,
      address: config.address,
      telephone: config.phone,
    });
    document.head.append(schema);
  }
}
let category = "All",
  expanded = false;
const featured = [
  "scaling-polishing",
  "laser-teeth-whitening",
  "dental-implants-crowns",
  "braces-invisalign",
  "dental-consultation",
  "teeth-fillings",
];
function renderServices() {
  const all = enabledServices().filter(
    (s) => category === "All" || s.category === category,
  );
  const ordered =
    category === "All"
      ? [
          ...featured.map((id) => all.find((s) => s.id === id)).filter(Boolean),
          ...all.filter((s) => !featured.includes(s.id)),
        ]
      : all;
  const list = expanded ? ordered : ordered.slice(0, 6);
  $("#services-grid").innerHTML = list
    .map(
      (s) =>
        `<button class="service-card card-enter" style="--card-delay:${list.indexOf(s) * 65}ms" data-service="${esc(s.id)}" data-tilt>${s.media ? pictureHTML(s.media, {alt: "AI-generated illustrative dental scene", sizes: "(max-width: 600px) 92vw, 32vw", className: "care-card-image"}) : ""}<span class="service-icon">${icon(s)}</span><span class="card-category">${esc(s.category.toUpperCase())}</span><h3>${esc(s.title)}</h3><p>${esc(s.shortDescription)}</p><span class="service-read">Explore this topic <span class="card-plus" aria-hidden="true">+</span></span></button>`,
    )
    .join("");
  $("#service-count").textContent = `${list.length} OF ${all.length} CARE TOPICS`;
  $("#show-all").hidden = all.length <= 6;
  $("#show-all").innerHTML = expanded
    ? "Show fewer services"
    : `View all ${all.length} services`;
  if (!all.length)
    $("#services-grid").innerHTML =
      "<p>No verified services have been configured yet.</p>";
}
const dialog = $("#detail-dialog");
let detailOpener = null;
function showService(id) {
  const service = enabledServices().find((s) => s.id === id);
  if (!service) return;
  detailOpener = document.activeElement;
  const steps = service.steps || [
    "Talk through your concerns, goals, and relevant medical history.",
    "Let a qualified dentist assess your teeth, gums, and any necessary imaging.",
    "Discuss suitable options, risks, costs, and aftercare before you decide.",
  ];
  $("#dialog-content").innerHTML =
    `<div class="eyebrow">${esc(service.category.toUpperCase())} DENTISTRY</div><h2>${esc(service.title)}</h2>${!service.verified ? '<p class="topic-note">General information · call to confirm clinic availability</p>' : ""}<div class="service-detail-body">${service.video ? `<video class="service-video" controls playsinline preload="none" ${service.video.poster ? `poster="${esc(service.video.poster)}"` : ""}><source src="${esc(service.video.src)}" type="${esc(service.video.type || "video/mp4")}"></video>` : service.media ? pictureHTML(service.media, { alt: service.title, sizes: "(max-width: 600px) 90vw, 700px", className: "service-media" }) : `<div class="service-visual" aria-hidden="true"><span>${icon(service)}</span><small>YOUR CARE, EXPLAINED</small></div>`}<p class="service-overview">${esc(service.fullDescription)}</p><div class="service-detail-grid"><section><h3>What your consultation covers</h3><ol>${steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol></section><section class="service-considerations"><h3>Before you decide</h3><p>${esc(service.considerations || "Your dentist should explain suitability, alternatives, potential risks, maintenance, and an individual estimate. You can ask questions and take time to decide.")}</p><p>${esc(service.process)}</p></section></div><div class="faqs">${service.faq.map((f) => `<details><summary>${esc(f.q)}<span>+</span></summary><p>${esc(f.a)}</p></details>`).join("")}</div><p class="clinical-note">General information only. A dentist must assess your individual needs. ${service.price ? `Configured price: ${esc(service.price)}. Confirm your estimate.` : "No verified price is listed."}</p></div><div class="dialog-actions service-dialog-actions"><button class="btn primary" id="service-book">Appointment enquiry</button><button class="btn secondary" id="service-ask-ai">Ask AI about this treatment</button></div>`;
  linkifyPhoneNumbers(
    $("#dialog-content"),
    config.phone,
    config.phoneInternational,
  );
  dialog.showModal();
  $("#service-ask-ai").addEventListener("click", () => {
    dialog.close();
    chat.openChat({ query: `Tell me more about ${service.title}` });
  });
  $("#service-book").addEventListener("click", () => {
    $("#appointment-service").value = service.id;
    dialog.close();
    $("#appointment").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion:reduce)").matches
        ? "auto"
        : "smooth",
    });
    $("#appointment-form input").focus({ preventScroll: true });
  });
}
function renderTestimonials() {
  const reviews = config.testimonials.filter((r) => r.approved);
  const highlights = config.reviewHighlights || [];
  if (reviews.length) {
    $("#testimonial-content").innerHTML =
      `<div class="section-heading reveal"><div><div class="eyebrow">PATIENT REVIEWS</div><h2>Kind words. Thoughtful care.</h2></div><p class="heading-aside">Faithful excerpts from feedback shared with Phil Dental Clinic. No patient identities or ratings have been added.</p></div><div class="feedback-grid reviews-grid">${reviews.map((r, i) => `<article class="feedback-card reveal" style="--reveal-delay:${i * 90}ms"><span class="review-quote" aria-hidden="true">“</span><p>“${esc(r.text)}”</p><h3>${esc(r.author || "Patient feedback")}</h3><small>${esc(r.source || "")}</small></article>`).join("")}</div>`;
    return;
  }
  if (!highlights.length) {
    $("#reviews").hidden = true;
    return;
  }
  $("#testimonial-content").innerHTML =
    `<div class="section-heading"><div><div class="eyebrow">PATIENT FEEDBACK</div><h2>What patients value.</h2></div><p class="heading-aside">Themes from the patient feedback shared with Phil Dental Clinic.</p></div><div class="feedback-grid">${highlights.map((item, i) => `<article class="feedback-card reveal"><span class="feedback-index">0${i + 1}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("")}</div>`;
}
function renderAccessibility() {
  if (!config.accessibility?.length) return;
  const section = document.createElement("section");
  section.className = "container accessibility-panel reveal";
  section.id = "accessibility";
  section.innerHTML = `<div><div class="eyebrow">PLAN A COMFORTABLE VISIT</div><h2>Access, considered.</h2><p>Appointments are required. Call ahead to discuss your visit and confirm opening hours.</p></div><ul>${config.accessibility.map((item) => `<li><span aria-hidden="true">✓</span>${esc(item)}</li>`).join("")}</ul>`;
  $("#cinematic-story").after(section);
}
applyConfig();
initBrandLogo(config);
renderServices();
renderTestimonials();
renderAccessibility();
initForms();
initGallery();
initOptionalSections();
initLocation();
linkifyPhoneNumbers(document.body, config.phone, config.phoneInternational);
initSound();
initNavigation();
initAnimations();
initCinematic();
const chat = initChat();
$("#service-tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-category]");
  if (!b) return;
  category = b.dataset.category;
  expanded = false;
  $$("button", $("#service-tabs")).forEach((el) => {
    el.classList.toggle("selected", el === b);
    el.setAttribute("aria-pressed", String(el === b));
  });
  renderServices();
});
$("#show-all").addEventListener("click", () => {
  expanded = !expanded;
  renderServices();
  if (!expanded) $("#services").scrollIntoView({ behavior: "smooth" });
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-service]");
  if (b) showService(b.dataset.service);
});
$("#footer-services").innerHTML = enabledServices()
  .filter((s) =>
    [
      "scaling-polishing",
      "laser-teeth-whitening",
      "dental-implants-crowns",
      "braces-invisalign",
    ].includes(s.id),
  )
  .map((s) => `<button data-service="${esc(s.id)}">${esc(s.title)}</button>`)
  .join("");
$$(".close-dialog").forEach((b) =>
  b.addEventListener("click", () => b.closest("dialog").close()),
);
$$("dialog").forEach((d) => {
  d.addEventListener("click", (e) => {
    if (e.target === d) {
      const r = d.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        d.close();
    }
  });
  d.addEventListener("close", () => {
    $$("video", d).forEach((video) => {
      video.pause();
      video.removeAttribute("src");
      $$("source", video).forEach((source) => source.removeAttribute("src"));
      video.load();
    });
    if (d === dialog) detailOpener?.focus({ preventScroll: true });
  });
});
$("#privacy-button").addEventListener("click", () => {
  detailOpener = document.activeElement;
  $("#dialog-content").innerHTML =
    `<div class="eyebrow">YOUR PRIVACY</div><h2>A little transparency.</h2><p>The virtual receptionist uses local rules and clinic information. It provides general information, not a diagnosis or a guaranteed treatment recommendation. A qualified dentist must assess individual concerns.</p><p>An anonymous session flag remembers whether you have dismissed the welcome screen. Chat and appointment preferences stay in browser memory. This website does not save them in localStorage or send them to an appointment server. Clear chat or reload to reset the conversation. Choosing to call the clinic opens your device’s phone application; availability must be confirmed directly.</p><p>Optional browser speech recognition may use your browser provider’s online service and requires microphone permission. Spoken replies and interface sound begin only after an appropriate click. Maps connect to Google Maps only when you choose to load them. Fonts and the clinic assistant’s knowledge are hosted with this website.</p><p>For clinic-specific privacy enquiries, please call ${esc(config.phone)}.</p>`;
  linkifyPhoneNumbers(
    $("#dialog-content"),
    config.phone,
    config.phoneInternational,
  );
  dialog.showModal();
});
