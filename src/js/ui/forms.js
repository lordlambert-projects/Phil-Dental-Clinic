import { clinicConfig as config, enabledServices } from "../config.js";
import {
  $,
  escapeHTML as esc,
  contactDestination,
  linkifyPhoneNumbers,
} from "../utils.js";
import { locationCardHTML } from "./location.js";
export function initForms() {
  const form = $("#appointment-form"),
    method = $("#contact-method"),
    result = $("#form-result"),
    dialog = $("#request-dialog");
  $("#appointment-service").insertAdjacentHTML(
    "beforeend",
    enabledServices()
      .map((s) => `<option value="${esc(s.id)}">${esc(s.title)}</option>`)
      .join(""),
  );
  const channels = [
    ...(config.whatsapp ? [["whatsapp", "WhatsApp"]] : []),
    ...(config.email ? [["email", "Email"]] : []),
    ...(config.bookingUrl ? [["booking", "Clinic booking page"]] : []),
    ...(config.phone
      ? [["phone", "Call the clinic with these preferences"]]
      : []),
  ];
  if (!channels.length) channels.push(["preview", "Prepare a request preview"]);
  method.innerHTML = channels
    .map(([value, title]) => `<option value="${value}">${title}</option>`)
    .join("");
  $("#booking-note").textContent =
    channels[0][0] === "preview"
      ? "Prepare your preferences, then contact the clinic. No appointment is confirmed automatically."
      : "Review your enquiry before opening your chosen contact destination.";
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  $("#appointment-date").min = d.toISOString().slice(0, 10);
  if (!config.demoMode && channels[0][0] === "preview") {
    form.querySelector('[type="submit"]').disabled = true;
    $("#booking-note").textContent =
      "Appointment enquiries are unavailable until the clinic supplies a contact destination.";
  }
  form.addEventListener("input", () => {
    form.elements.contact.setCustomValidity("");
    result.replaceChildren();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    const contactValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contact) ||
      /^[+\d][\d\s()-]{6,24}$/.test(values.contact);
    form.elements.contact.setCustomValidity(
      contactValid ? "" : "Please enter a valid email address or phone number.",
    );
    if (!form.reportValidity()) return;
    const service = enabledServices().find((s) => s.id === values.service);
    if (!service) return;
    const message = `Appointment enquiry for ${config.name}\nName: ${values.name}\nContact: ${values.contact}\nService: ${service.title}\nPreferred date: ${values.date}\nPreferred time: ${values.time}\n\nPlease confirm availability. This is an enquiry, not a confirmed appointment.`;
    const content = $("#request-dialog-content");
    content.innerHTML = `<div class="eyebrow">YOUR NEXT STEP IS READY</div><h2>Appointment request prepared.</h2><p class="request-status">${values.method === "preview" ? "Your preferences are ready. Nothing has been sent and no appointment has been booked." : "Your preferences are ready. Call the clinic or use your selected contact option to discuss availability. Only the clinic can confirm an appointment."}</p><div class="request-summary"><p><strong>Service</strong>${esc(service.title)}</p><p><strong>Preferred visit</strong>${esc(values.date)} · ${esc(values.time)}</p></div><details class="request-text"><summary>Review the complete request</summary><textarea aria-label="Appointment enquiry preview" readonly></textarea></details><div id="request-actions" class="dialog-actions"></div><h3 class="request-location-heading">${config.address ? "Plan your visit" : "Find the clinic"}</h3>${locationCardHTML(true)}`;
    const text = $("textarea", content);
    text.value = message;
    const destination = contactDestination(config, values.method, message),
      actions = $("#request-actions");
    if (destination) {
      const a = document.createElement("a");
      a.href = destination;
      a.className = "btn primary";
      a.textContent =
        values.method === "phone"
          ? `Call ${config.phone}`
          : values.method === "booking"
            ? "Open clinic booking page"
            : `Continue to ${values.method === "email" ? "Email" : "WhatsApp"}`;
      if (!/^(mailto:|tel:)/.test(destination)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }
      actions.append(a);
    }
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "btn secondary";
    copy.textContent = "Copy request";
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(message);
        copy.textContent = "Copied";
      } catch {
        text.closest("details").open = true;
        text.focus();
        text.select();
        copy.textContent = "Select and copy above";
      }
    });
    actions.append(copy);
    linkifyPhoneNumbers(content, config.phone, config.phoneInternational);
    result.textContent =
      "Your appointment preferences are ready. Review the details and call the clinic to confirm availability.";
    dialog.showModal();
  });
}
