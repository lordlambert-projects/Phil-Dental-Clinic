export const normalizeInput = (input) =>
  String(input)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const servicePatterns = new WeakMap();
export function matchService(input, services) {
  const q = normalizeInput(input);
  let best = null,
    bestScore = 0;
  for (const service of services) {
    let score = 0;
    let terms = servicePatterns.get(service);
    if (!terms) {
      terms = [
        ...new Set(
          [service.title, ...service.keywords, ...(service.synonyms || [])].map(
            normalizeInput,
          ),
        ),
      ].map((term) => ({
        length: term.length,
        pattern: new RegExp(
          `\\b${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:s)?\\b`,
        ),
      }));
      servicePatterns.set(service, terms);
    }
    for (const term of terms) if (term.pattern.test(q)) score += term.length;
    if (score > bestScore) {
      bestScore = score;
      best = service;
    }
  }
  return best;
}
export function detectIntent(input) {
  const q = normalizeInput(input);
  if (
    /difficulty breathing|trouble breathing|cannot breathe|cant breathe|difficulty swallowing|trouble swallowing|uncontrolled bleeding|major facial swelling/.test(
      q,
    )
  )
    return "emergency";
  if (
    /\b(emergency|urgent|severe pain|swelling|swollen|toothache|bleeding|hurt|pain)\b/.test(
      q,
    )
  )
    return "urgent";
  if (/\b(price|pricing|cost|how much|expensive|fee|fees|free)\b/.test(q))
    return "price";
  if (/\b(book|booking|appointment|enquiry|inquiry|schedule|reserve)\b/.test(q))
    return "appointment";
  if (
    /\b(hours|opening|open|closed|weekend|saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b/.test(
      q,
    )
  )
    return "hours";
  if (
    /wheelchair|accessible|accessibility|parking|car park|toilet|on site|on-site/.test(
      q,
    )
  )
    return "accessibility";
  if (/\b(location|address|where|directions|map)\b/.test(q)) return "location";
  if (/\b(contact|phone|telephone|number|email|whatsapp|call)\b/.test(q))
    return "contact";
  if (/\b(how does|process|procedure|how long|duration|what happens)\b/.test(q))
    return "process";
  if (/\b(service|services|treatment|treatments|offer|available)\b/.test(q))
    return "services";
  if (/^(hi|hey|hello|good morning|good afternoon|good evening)\b/.test(q))
    return "greeting";
  if (/\b(skip|prefer not|no thanks)\b/.test(q)) return "skip";
  if (/\b(thank|thanks|thank you)\b/.test(q)) return "thanks";
  return "unknown";
}
export function createConversationState() {
  return {
    visitorName: null,
    lastIntent: null,
    activeService: null,
    pendingQuestion: "name",
    messages: [],
  };
}
export function generateResponse(input, state, kb) {
  const q = normalizeInput(input),
    intent = detectIntent(q),
    match = matchService(q, kb.allServices);
  let selected = match ? kb.services.find((s) => s.id === match.id) : null;
  if (selected) state.activeService = selected;
  const active = selected || state.activeService;
  const unsupported =
    /veneers?|gum disease|pediatric|paediatric|cosmetic dentistry|smile makeover|bridges?/.test(
      q,
    );
  state.lastIntent = intent;
  const result = (text, extra = {}) => ({ text, ...extra });
  if (intent === "emergency")
    return result(
      "Difficulty breathing or swallowing, major facial swelling, or uncontrolled bleeding can be an emergency. Seek immediate emergency medical care or call your local emergency number. This assistant cannot assess or diagnose symptoms.",
    );
  if (intent === "urgent")
    return result(
      "I’m sorry you’re uncomfortable. Please contact a qualified dentist promptly for an assessment; I can’t diagnose symptoms or recommend medicines. Difficulty breathing or swallowing, major facial swelling, or uncontrolled bleeding needs immediate emergency medical care. Clinic urgent-visit availability has not been confirmed.",
      { appointment: true },
    );
  const named = q.match(
    /^(?:my name is|im|i am|call me)\s+([a-z][a-z -]{0,35})$/,
  );
  if (named) {
    state.visitorName = named[1]
      .split(" ")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
    state.pendingQuestion = null;
    return result(
      `Nice to meet you, ${state.visitorName}! What would you like to explore?`,
    );
  }
  if (intent === "skip") {
    state.pendingQuestion = null;
    return result(
      "Of course. You can explore without sharing a name. What would you like to know?",
    );
  }
  if (
    state.pendingQuestion === "name" &&
    intent === "unknown" &&
    !match &&
    !unsupported &&
    /^[a-z]{2,18}$/.test(q) &&
    !["yes", "no", "help", "why", "what"].includes(q)
  ) {
    state.visitorName = input.trim();
    state.pendingQuestion = null;
    return result(
      `Nice to meet you, ${state.visitorName}! I can explain services or help you prepare an enquiry.`,
    );
  }
  state.pendingQuestion = null;
  if (match && !selected)
    return result(
      `${match.title} is not listed as an available, verified service for ${kb.name}. Please ask the clinic about suitable options. I can explain the enabled services listed on this site.`,
    );
  if (intent === "accessibility")
    return result(
      `${kb.name}. ${kb.accessibility?.length ? `Accessibility features include ${kb.accessibility.join(", ").toLowerCase()}.` : "Please call to discuss specific access requirements."} Call ${kb.phone} if you would like help planning your visit.`,
    );
  if (unsupported)
    return result(
      `I don’t currently have that listed among ${kb.name}’s confirmed services. Please call ${kb.phone} for clarification. I can also explain the general dental topics listed on this website.`,
    );
  if (intent === "greeting")
    return result(
      `Hello${state.visitorName ? `, ${state.visitorName}` : ""}! Welcome to ${kb.name}. I’m your local virtual receptionist. What can I help you explore today?`,
    );
  if (intent === "price") {
    if (active?.price)
      return result(
        `${active.title}: ${active.price}. This configured price may depend on your assessment and treatment needs. Please request a current estimate from the clinic.`,
        { appointment: true },
      );
    return result(
      `I don’t have a verified price ${active ? `for ${active.title.toLowerCase()}` : "listed for this clinic"}. Costs depend on the assessment and care required. Please call the clinic for an individual estimate.`,
      { appointment: true },
    );
  }
  if (intent === "appointment")
    return result(
      `You can prepare ${active ? `a ${active.title.toLowerCase()} consultation` : "an appointment"} enquiry using the form below. Choose your preferred date and time. ${kb.email || kb.whatsapp || kb.bookingUrl ? "The contact option lets you share your request." : kb.phone ? `Call ${kb.phone} to discuss availability and your preferences. No request is sent automatically.` : "Please contact the clinic directly to confirm availability."} Only the clinic can confirm an appointment.`,
      { appointment: true, serviceId: active?.id },
    );
  if (intent === "hours")
    return result(
      kb.openingHours.length
        ? `Opening hours:\n${kb.openingHours.map((h) => (typeof h === "string" ? h : `${h.day}: ${h.hours}`)).join("\n")}\nPlease confirm holiday hours directly with the clinic.`
        : `Please call ${kb.phone || "the clinic"} to confirm current opening hours before travelling.`,
    );
  if (intent === "location")
    return result(
      kb.address
        ? `${kb.name} is located at ${kb.address}.${kb.mapsUrl ? " Use the location link in the Contact section for directions." : ""}`
        : "Please contact the clinic for its current address.",
    );
  if (/\b(payment|payments|card|cards|cash|transfer|insurance)\b/.test(q))
    return result(`The supplied payment methods are credit cards and debit cards. Please call ${kb.phone} to confirm arrangements; no other payment options have been verified.`);
  if (/\b(whatsapp|instagram)\b/.test(q))
    return result(`No official WhatsApp number or Instagram handle has been supplied. Please call ${kb.phone}; I won’t assume the telephone number is registered on WhatsApp.`);
  if (intent === "contact")
    return result(
      [
        kb.phone && `Phone: ${kb.phone}`,
        kb.email && `Email: ${kb.email}`,
        kb.whatsapp && `WhatsApp: ${kb.whatsapp}`,
      ]
        .filter(Boolean)
        .join("\n") ||
        "Please contact the clinic directly for the latest contact options.",
    );
  if (intent === "thanks")
    return result(
      "You’re very welcome. I’m here if another question comes to mind.",
    );
  if (
    active &&
    (selected ||
      intent === "process" ||
      /\b(that|it|this|suitable|safe|risk|tell me more)\b/.test(q))
  ) {
    let text =
      intent === "process" || /how long|duration/.test(q)
        ? `${active.process} The treatment timeline varies with individual needs; there is no guaranteed duration.`
        : active.fullDescription;

    return result(`${text}\n\nThis is general dental information. Availability at ${kb.name} has not been verified; please call ${kb.phone} to confirm.`, { serviceId: active.id });
  }
  if (intent === "services")
    return result(
      `You can explore general dental topics: ${kb.services.map(s=>s.title).join(", ")}. This is educational information; Phil Dental Clinic’s treatment availability has not been verified. Please call ${kb.phone} to confirm.`,
    );
  if (/\b(nervous|anxious|afraid|scared|anxiety)\b/.test(q))
    return result(
      "It’s understandable to feel nervous about a dental visit. Tell the clinic how you feel and ask what to expect, whether you can agree a pause signal, and how they support anxious visitors. A dentist can discuss your needs.",
    );
  if (
    /\b(human|real ai|language model|chatgpt|who are you|are you ai)\b/.test(q)
  )
    return result(
      "I’m a local, rule-based virtual receptionist built in JavaScript. I use the configured service library and approved general information. I’m not a person or a large language model, and I can’t diagnose health concerns.",
    );
  return result(
    "I can help with dental service information, prices when verified, opening hours, location, and appointment enquiries. I don’t have an approved answer to that question. Try a service name, or ask a qualified dentist about personal medical concerns.",
  );
}
