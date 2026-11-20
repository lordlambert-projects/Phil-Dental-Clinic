import { clinicConfig as config } from "../config.js";
import { $, escapeHTML as esc, safeURL } from "../utils.js";
export function locationData() {
  const address = config.address || "",
    explicit = safeURL(config.location?.mapEmbedUrl || "");
  const allowed =
    explicit &&
    /^https:\/\/(www\.)?(google\.com\/maps|maps\.google\.com\/maps|openstreetmap\.org\/export\/embed)/.test(
      explicit,
    )
      ? explicit
      : "";
  return {
    address,
    title: config.name,
    label: config.location?.mapLabel || "Clinic location",
    embed: address
      ? allowed ||
        `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=14&output=embed`
      : allowed,
    directions: address
      ? safeURL(config.mapsUrl) ||
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : "",
  };
}
export function locationCardHTML(compact = false) {
  const place = locationData();
  if (!place.address && !place.embed)
    return `<div class="map-card map-unavailable"><h3>Plan your visit</h3><p>Please call <a class="phone-link" aria-label="Call Phil Dental Clinic on ${esc(config.phone)}" href="tel:${esc((config.phoneInternational || config.phone).replace(/[^+\d]/g, ""))}">${esc(config.phone)}</a> for directions.</p></div>`;
  return `<div class="map-card ${compact ? "compact-map" : ""}"><div class="map-preview"><div class="map-art" aria-hidden="true"><span class="map-road road-one"></span><span class="map-road road-two"></span><span class="map-road road-three"></span><span class="map-water"></span><span class="map-pin">●</span></div><button type="button" class="btn secondary map-load">Load clinic map</button><small>${esc(place.label)} · Google Maps loads when selected</small></div><div class="map-details"><span class="eyebrow">FIND US IN IKEJA</span><h3>${esc(place.title)}</h3><p>${esc(place.address)}</p>${config.plusCode ? `<span class="location-plus-code">Plus code · ${esc(config.plusCode)}</span>` : ""}${place.directions ? `<a class="text-link" href="${esc(place.directions)}" target="_blank" rel="noopener noreferrer">Open directions</a>` : ""}</div></div>`;
}
export function initLocation() {
  const section = document.createElement("section");
  section.id = "location";
  section.className = "section container location-section";
  section.innerHTML = `<div class="section-heading"><div><div class="eyebrow">YOUR NEXT STOP</div><h2>A little closer<br>to your next smile.</h2></div><p class="heading-aside">Find Phil Dental Clinic in Ikeja, Lagos. Please call to confirm your appointment and current opening hours before travelling.</p></div>${locationCardHTML()}`;
  $("#contact").before(section);
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".map-load");
    if (!button) return;
    const place = locationData();
    if (!place.embed) return;
    const frame = document.createElement("iframe");
    frame.src = place.embed;
    frame.title = `${config.name} location map`;
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer";
    frame.allowFullscreen = true;
    button.closest(".map-preview").replaceChildren(frame);
  });
}
