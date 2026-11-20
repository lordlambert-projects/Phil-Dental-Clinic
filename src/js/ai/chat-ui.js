import { clinicConfig as config } from "../config.js";
import { createKnowledgeBase } from "./knowledge-base.js";
import {
  createConversationState,
  generateResponse,
  normalizeInput,
} from "./intent-engine.js";
import { aiStates, setupVoice } from "./voice.js";
import { $, $$, linkifyPhoneNumbers } from "../utils.js";

export function initChat() {
  const panel = $("#chat-panel"),
    shell = $("#chat-shell"),
    surface = $("#website-surface"),
    input = $("#chat-input"),
    messages = $("#messages"),
    suggestions = $("#suggestions"),
    chips = $("#chat-chips"),
    orb = $("#chat-orb"),
    status = $("#chat-status");
  const kb = createKnowledgeBase(config),
    reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let state = createConversationState(),
    previousFocus = null,
    open = true,
    savedScroll = 0,
    selectedSuggestion = -1,
    matching = [],
    busy = false,
    responseGeneration = 0,
    transitionTimer = null,
    keyTimer = null,
    websiteWelcomed = false;
  const typing = new Set();
  const onState = (value) => {
    const next = Object.values(aiStates).includes(value) ? value : aiStates.IDLE;
    orb.dataset.state = next;
    $("#ai-island .orb").dataset.state = next;
    document.body.dataset.aiState = next;
    if (next === aiStates.SPEAKING) {
      $("#ai-island strong").textContent = "Your smile assistant is speaking";
      $("#ai-island small").textContent =
        "You can stop voice using the controls";
    } else if (next === aiStates.LISTENING) {
      $("#ai-island strong").textContent = "Listening to your question";
      $("#ai-island small").textContent = "Speak now · tap stop when finished";
    } else if (next === aiStates.THINKING) {
      $("#ai-island strong").textContent = "Considering your question";
      $("#ai-island small").textContent = "Finding a helpful answer";
    } else {
      $("#ai-island strong").textContent =
        config.islandMessages?.[0] || "How can I help you today?";
      $("#ai-island small").textContent = "Here for your questions, anytime";
    }
  };
  const onStatus = (value) => {
    status.textContent = value;
  };
  const voice = setupVoice({
    mic: $("#mic-button"),
    voiceToggle: $("#speech-toggle"),
    input,
    note: $("#voice-note"),
    onState,
    onStatus,
    getLatest: () =>
      [...state.messages].reverse().find((m) => m.role === "assistant")?.text,
  });
  $("#chat-title").textContent = `${config.name} · your smile assistant`;

  function append(text, role, animate = true) {
    const bubble = document.createElement("div");
    bubble.className = `message ${role}`;
    const accessible = document.createElement("span");
    accessible.className = "sr-only";
    accessible.textContent = text;
    const visual = document.createElement("span");
    visual.className = "message-text";
    visual.setAttribute("aria-hidden", "true");
    const time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    bubble.append(accessible, visual, time);
    messages.append(bubble);
    state.messages.push({ role, text });
    if (role !== "assistant" || !animate || reduced.matches || !open) {
      visual.textContent = text;
      linkifyPhoneNumbers(visual, config.phone, config.phoneInternational);
      messages.scrollTop = messages.scrollHeight;
      return;
    }
    const duration = Math.min(900, Math.max(250, text.length * 3));
    let started = null,
      frame;
    const finish = () => {
      cancelAnimationFrame(frame);
      visual.textContent = text;
      linkifyPhoneNumbers(visual, config.phone, config.phoneInternational);
      bubble.classList.remove("is-writing");
      typing.delete(finish);
    };
    typing.add(finish);
    bubble.classList.add("is-writing");
    function tick(now) {
      started ??= now;
      const progress = Math.min((now - started) / duration, 1);
      visual.textContent = text.slice(0, Math.ceil(progress * text.length));
      messages.scrollTop = messages.scrollHeight;
      if (progress < 1) frame = requestAnimationFrame(tick);
      else finish();
    }
    frame = requestAnimationFrame(tick);
  }
  function startConversation(focus = true) {
    shell.classList.add("is-conversing");
    $("#welcome-choices").hidden = true;
    if (focus) input.focus({ preventScroll: true });
  }
  function setChips(appointment = false, serviceId) {
    chips.replaceChildren();
    const labels = ["Explore services", "Opening hours"];
    const sample =
      kb.services.find((s) => s.id === "laser-teeth-whitening") ||
      kb.services[0];
    if (sample) labels.splice(1, 0, sample.title);
    if (state.pendingQuestion === "name") labels.push("Skip name");
    for (const label of labels) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        startConversation();
        send(label);
      });
      chips.append(b);
    }
    if (appointment) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "Prepare an appointment enquiry";
      b.addEventListener("click", () => {
        if (serviceId) $("#appointment-service").value = serviceId;
        enterWebsite({
          target: "#appointment",
          focus: $("#appointment-form input"),
        });
      });
      chips.prepend(b);
    }
  }
  function welcome() {
    append(
      `Hello! Welcome to ${config.name}. I’m your virtual assistant for this digital dental experience. ${config.aiWelcome}\n\nMay I know your first name? You can skip this, keep chatting, or explore the website.`,
      "assistant",
    );
    setChips();
  }
  function freezeSite(y) {
    savedScroll = y;
    document.body.style.setProperty("--site-scroll", `${y}px`);
    document.body.style.position = "fixed";
    document.body.style.top = `${-y}px`;
    document.body.style.width = "100%";
    document.body.classList.add("site-frozen");
  }
  function thawSite(y) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.classList.remove("site-frozen");
    const root = document.documentElement,
      behavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, y);
    root.style.scrollBehavior = behavior;
  }
  function updateHistory(view, y, target) {
    history.pushState(
      { ...history.state, philExperience: view, philScroll: y },
      "",
      target || location.href,
    );
  }
  function openChat({ fromHistory = false, scroll, query } = {}) {
    if (open) {
      startConversation();
      if (query) send(query);
      return;
    }
    clearTimeout(transitionTimer);
    previousFocus = document.activeElement;
    const y = scroll ?? window.scrollY;
    if (!fromHistory) {
      history.replaceState(
        { ...history.state, philExperience: "website", philScroll: y },
        "",
      );
      updateHistory("assistant", y);
    }
    freezeSite(y);
    surface.inert = true;
    surface.setAttribute("aria-hidden", "true");
    panel.inert = false;
    shell.setAttribute("aria-hidden", "false");
    open = true;
    document.body.dataset.experience = "assistant";
    document.body.classList.add("ai-active");
    document.body.classList.remove("experience-entry");
    $("#ai-island").setAttribute("aria-expanded", "true");
    $("#chat-close").textContent = "Back to website";
    startConversation(false);
    if (!fromHistory) {
      voice.enableFromGesture();
      if (query) send(query);
      else
        voice.speak(
          "Welcome back. What would you like to know about your smile?",
        );
    }
    transitionTimer = setTimeout(
      () => input.focus({ preventScroll: true }),
      reduced.matches ? 0 : 800,
    );
  }
  function enterWebsite({ fromHistory = false, scroll, target, focus } = {}) {
    if (!open) return;
    try { sessionStorage.setItem("phil-welcome-seen", "1"); } catch {}
    clearTimeout(transitionTimer);
    open = false;
    voice.stop();
    typing.forEach((finish) => finish());
    onState(aiStates.IDLE);
    hideSuggestions();
    panel.inert = true;
    shell.setAttribute("aria-hidden", "true");
    document.body.classList.remove("ai-active", "experience-entry");
    document.body.dataset.experience = "website";
    $("#ai-island").setAttribute("aria-expanded", "false");
    const y = scroll ?? savedScroll;
    if (!fromHistory) {
      updateHistory("website", y, target);
      voice.enableFromGesture();
      if (!websiteWelcomed) {
        websiteWelcomed = true;
        voice.speak(
          config.voice?.welcomeOnWebsite ||
            "Welcome to your digital dental experience. Explore at your own pace. Your smile assistant is here whenever you need guidance.",
        );
      }
    }
    transitionTimer = setTimeout(
      () => {
        surface.inert = false;
        surface.setAttribute("aria-hidden", "false");
        thawSite(y);
        if (target)
          document
            .querySelector(target)
            ?.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
        (focus || previousFocus || $(".nav-book"))?.focus({
          preventScroll: true,
        });
      },
      reduced.matches ? 0 : 850,
    );
  }
  $("#continue-chat").addEventListener("click", () => {
    startConversation();
    voice.enableFromGesture();
    voice.speak(
      [...state.messages].reverse().find((m) => m.role === "assistant")?.text ||
        config.aiWelcome,
    );
  });
  $("#listen-welcome").addEventListener("click", () => {
    voice.enableFromGesture(true);
    voice.speak(
      [...state.messages].reverse().find((m) => m.role === "assistant")?.text ||
        config.aiWelcome,
    );
  });
  $("#enter-website").addEventListener("click", () => enterWebsite());
  $("#chat-close").addEventListener("click", () => enterWebsite());
  $("#platform-brand").addEventListener("click", (e) => {
    e.preventDefault();
    enterWebsite({ target: "#home" });
  });
  $$(".open-chat,#ai-island").forEach((b) =>
    b.addEventListener("click", () => openChat()),
  );
  window.addEventListener("popstate", (e) => {
    if (e.state?.philExperience === "website")
      enterWebsite({ fromHistory: true, scroll: e.state.philScroll || 0 });
    else if (e.state?.philExperience === "assistant")
      openChat({ fromHistory: true, scroll: e.state.philScroll || 0 });
  });
  function hideSuggestions() {
    suggestions.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    selectedSuggestion = -1;
  }
  function refreshSuggestions() {
    const q = normalizeInput(input.value);
    matching =
      q.length >= 2
        ? kb.services
            .filter(
              (s) =>
                s.title.toLowerCase().includes(q) ||
                s.keywords.some((k) => k.startsWith(q)),
            )
            .slice(0, 4)
        : [];
    suggestions.replaceChildren();
    selectedSuggestion = -1;
    input.removeAttribute("aria-activedescendant");
    if (!matching.length) {
      hideSuggestions();
      return;
    }
    matching.forEach((service, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.id = `suggestion-${i}`;
      b.role = "option";
      b.setAttribute("aria-selected", "false");
      b.textContent = service.title;
      b.addEventListener("click", () => selectSuggestion(i));
      suggestions.append(b);
    });
    suggestions.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }
  function selectSuggestion(i) {
    input.value = matching[i].title;
    hideSuggestions();
    input.focus();
  }
  input.addEventListener("input", () => {
    refreshSuggestions();
    $("#chat-form").classList.add("is-typing");
    clearTimeout(keyTimer);
    keyTimer = setTimeout(
      () => $("#chat-form").classList.remove("is-typing"),
      190,
    );
  });
  input.addEventListener("keydown", (e) => {
    if (suggestions.hidden) return;
    if (["ArrowDown", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      selectedSuggestion =
        (selectedSuggestion +
          (e.key === "ArrowDown" ? 1 : -1) +
          matching.length) %
        matching.length;
      $$("button", suggestions).forEach((b, i) =>
        b.setAttribute("aria-selected", String(i === selectedSuggestion)),
      );
      input.setAttribute(
        "aria-activedescendant",
        `suggestion-${selectedSuggestion}`,
      );
    } else if (e.key === "Enter" && selectedSuggestion >= 0) {
      e.preventDefault();
      selectSuggestion(selectedSuggestion);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      hideSuggestions();
    }
  });
  function send(text) {
    text = text.trim();
    if (!text || busy) return;
    startConversation(false);
    typing.forEach((finish) => finish());
    busy = true;
    const generation = ++responseGeneration;
    append(text, "user");
    input.value = "";
    hideSuggestions();
    onState(aiStates.THINKING);
    onStatus("Finding a helpful answer…");
    setTimeout(() => {
      if (generation !== responseGeneration) return;
      const result = generateResponse(text, state, kb);
      append(result.text, "assistant");
      setChips(result.appointment, result.serviceId);
      onState(aiStates.IDLE);
      onStatus("Ready when you are");
      if (open) voice.speak(result.text);
      busy = false;
    }, reduced.matches ? 0 : 360);
  }
  $("#chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    send(input.value);
  });
  $("#chat-clear").addEventListener("click", () => {
    voice.stop();
    responseGeneration++;
    busy = false;
    typing.forEach((finish) => finish());
    input.value = "";
    hideSuggestions();
    state = createConversationState();
    messages.replaceChildren();
    welcome();
    onStatus("Conversation cleared");
    input.focus();
  });
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      enterWebsite();
    }
    if (e.key === "Tab") {
      const controls = $$("button:not(:disabled),input,a[href]", panel).filter(
        (el) => !el.closest("[hidden]") && el.getClientRects().length,
      );
      const first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  document.addEventListener("click", (e) => {
    if (!suggestions.contains(e.target) && e.target !== input)
      hideSuggestions();
  });
  let islandIndex = 0;
  const islandMessages = [
    ...(config.islandMessages || [
      "How can I help you today?",
      "Have a question about your smile?",
    ]),
    ...kb.services
      .slice(0, 4)
      .map((s) => `Questions about ${s.title.toLowerCase()}?`),
  ];
  setInterval(() => {
    if (!open && !document.hidden && !voice.isSpeaking()) {
      islandIndex = (islandIndex + 1) % islandMessages.length;
      const text = $("#ai-island strong");
      text.textContent = islandMessages[islandIndex];
      text.animate?.(
        [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
    }
  }, 3600);
  // Persist only an anonymous session welcome flag, never conversation or form data.
  surface.inert = true;
  surface.setAttribute("aria-hidden", "true");
  freezeSite(0);
  document.body.dataset.experience = "assistant";
  history.replaceState(
    { ...history.state, philExperience: "assistant", philScroll: 0 },
    "",
  );
  welcome();
  let seen = false;
  try { seen = sessionStorage.getItem("phil-welcome-seen") === "1"; } catch {}
  if (seen) enterWebsite({ fromHistory: true });
  else requestAnimationFrame(() => $("#continue-chat").focus({ preventScroll: true }));
  return { openChat, closeChat: enterWebsite };
}
