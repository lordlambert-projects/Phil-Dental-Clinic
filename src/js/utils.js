export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function safeURL(value, protocols = ["https:", "http:"]) {
  if (!value || !String(value).trim()) return "";
  try {
    const u = new URL(value, location.href);
    return protocols.includes(u.protocol) ? u.href : "";
  } catch {
    return "";
  }
}
export function contactDestination(c, method, message) {
  if (method === "phone" && c.phone)
    return `tel:${(c.phoneInternational || c.phone).replace(/[^+\d]/g, "")}`;
  if (method === "whatsapp" && c.whatsapp) {
    const number = c.whatsapp.replace(/\D/g, "");
    if (number.length >= 7)
      return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }
  if (method === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))
    return `mailto:${c.email}?subject=${encodeURIComponent("Appointment enquiry")}&body=${encodeURIComponent(message)}`;
  if (method === "booking" && c.bookingUrl) return safeURL(c.bookingUrl);
  return "";
}
export function closeDialog(dialog) {
  dialog.close();
}

export function linkifyPhoneNumbers(
  root,
  display = "08066310546",
  international = "+2348066310546",
) {
  if (!root || !display) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.includes(display)) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest("a,script,style,textarea,input,select"))
        return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const parts = node.nodeValue.split(display);
    const fragment = document.createDocumentFragment();
    parts.forEach((part, index) => {
      if (part) fragment.append(document.createTextNode(part));
      if (index < parts.length - 1) {
        const link = document.createElement("a");
        link.href = `tel:${international.replace(/[^+\d]/g, "")}`;
        link.className = "phone-link";
        link.setAttribute("aria-label", `Call Phil Dental Clinic on ${display}`);
        link.textContent = display;
        fragment.append(link);
      }
    });
    node.replaceWith(fragment);
  }
}
