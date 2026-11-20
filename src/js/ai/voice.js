import { clinicConfig as config } from "../config.js";

export const aiStates = Object.freeze({
  IDLE: "idle",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
});

// Native browser voice, shared by the assistant, the island, and website controls.
// No microphone or audio starts until a visitor deliberately presses a control.
export function setupVoice({
  mic,
  voiceToggle,
  input,
  note,
  onState,
  onStatus,
  getLatest,
}) {
  const synth = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  const Recognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = Boolean(synth && Utterance);
  const toggles = [
    ...new Set([
      voiceToggle,
      ...document.querySelectorAll("[data-voice-toggle]"),
    ]),
  ];
  const stopButtons = [...document.querySelectorAll("[data-voice-stop]")];
  const micIcon = mic.innerHTML;
  let recognition = null,
    listening = false,
    starting = false,
    voiceOn = false,
    preference = null,
    speaking = false,
    generation = 0,
    activeUtterance = null,
    lastSpeech = "";

  function feedback(text, isError = false) {
    onStatus(text);
    for (const el of document.querySelectorAll("[data-voice-feedback]")) {
      el.textContent = text;
      el.dataset.error = String(isError);
    }
  }
  function render() {
    for (const button of toggles) {
      button.textContent = speechSupported
        ? voiceOn
          ? "Voice on"
          : "Enable voice"
        : "Voice unavailable";
      button.setAttribute("aria-pressed", String(voiceOn));
      button.disabled = !speechSupported;
    }
    for (const button of stopButtons)
      button.hidden = !(speaking || listening || starting);
    mic.setAttribute("aria-pressed", String(listening));
    mic.setAttribute(
      "aria-label",
      listening || starting ? "Stop voice input" : "Start voice input",
    );
    mic.innerHTML =
      listening || starting ? '<span aria-hidden="true">■</span>' : micIcon;
    document.body.classList.toggle("voice-speaking", speaking);
  }
  function stopSpeech() {
    generation++;
    speaking = false;
    activeUtterance = null;
    if (synth) synth.cancel();
    onState(listening ? aiStates.LISTENING : aiStates.IDLE);
    render();
  }
  function speak(text) {
    if (!voiceOn || !speechSupported || !String(text).trim()) return false;
    stopSpeech();
    const ticket = generation;
    lastSpeech = String(text);
    // Short chunks avoid the long-utterance stalls in some browser engines.
    const sentences = lastSpeech.match(/[^.!?\n]+(?:[.!?]+|$)/g) || [
      lastSpeech,
    ];
    const chunks = [];
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      let chunk = "";
      for (const word of words) {
        if ((chunk + " " + word).length > 210) {
          chunks.push(chunk);
          chunk = word;
        } else chunk += (chunk ? " " : "") + word;
      }
      if (chunk) chunks.push(chunk);
    }
    function next() {
      if (ticket !== generation) return;
      const chunk = chunks.shift();
      if (!chunk) {
        speaking = false;
        activeUtterance = null;
        onState(listening ? aiStates.LISTENING : aiStates.IDLE);
        render();
        feedback("Finished speaking. Ready for your next question.");
        return;
      }
      const utterance = new Utterance(chunk);
      activeUtterance = utterance;
      utterance.lang = config.voice?.language || "en-GB";
      utterance.rate = config.voice?.rate || 0.97;
      const voices = synth.getVoices?.() || [];
      utterance.voice =
        voices.find((v) => v.lang === utterance.lang && v.localService) ||
        voices.find((v) => v.lang === utterance.lang) ||
        voices.find((v) => v.lang?.startsWith("en")) ||
        null;
      utterance.onstart = () => {
        if (ticket !== generation) return;
        speaking = true;
        onState(aiStates.SPEAKING);
        render();
        feedback("Speaking · press Stop voice to pause");
      };
      utterance.onend = () => {
        if (ticket === generation) next();
      };
      utterance.onerror = (event) => {
        if (ticket !== generation) return;
        speaking = false;
        activeUtterance = null;
        onState(aiStates.IDLE);
        render();
        if (!["interrupted", "canceled"].includes(event.error))
          feedback(
            "The browser could not play this voice. Check device audio and try Enable voice again in a full browser tab.",
            true,
          );
      };
      try {
        synth.resume?.();
        synth.speak(utterance);
      } catch {
        speaking = false;
        onState(aiStates.IDLE);
        render();
        feedback(
          "Voice playback could not start. Try Chrome, Edge, or Safari in a full tab with device audio enabled.",
          true,
        );
      }
    }
    next();
    return true;
  }
  function enableFromGesture(force = false) {
    if ((!force && preference === false) || !speechSupported) return false;
    voiceOn = true;
    render();
    return true;
  }
  for (const button of toggles)
    button.addEventListener("click", () => {
      preference = !voiceOn;
      voiceOn = preference;
      render();
      if (!voiceOn) {
        stopSpeech();
        feedback("Voice is off. You can keep reading and typing.");
      } else {
        feedback("Voice enabled. Reading the latest reply.");
        speak(
          getLatest?.() ||
            lastSpeech ||
            config.voice?.welcomeOnWebsite ||
            `Welcome to ${config.name}. How can I help you?`,
        );
      }
    });
  function endRecognition() {
    listening = false;
    starting = false;
    onState(speaking ? aiStates.SPEAKING : aiStates.IDLE);
    render();
  }
  function ensureRecognition() {
    if (recognition || !Recognition) return recognition;
    try {
      recognition = new Recognition();
      recognition.lang = config.voice?.language || "en-GB";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => {
        starting = false;
        listening = true;
        onState(aiStates.LISTENING);
        render();
        feedback("Listening now. Speak, then review the text before sending.");
      };
      recognition.onresult = (event) => {
        input.value = Array.from(event.results)
          .filter((r) => r.isFinal !== false)
          .map((r) => r[0].transcript)
          .join(" ");
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
        feedback("Your words are ready. Review them and press Send.");
      };
      recognition.onerror = (event) => {
        const explanations = {
          "not-allowed":
            "Microphone permission was blocked. Allow Microphone in this site’s browser settings, then retry. If embedded, open this site in a full Chrome or Edge tab.",
          "service-not-allowed":
            "This browser or embedded view blocks speech recognition. Open the site in a full Chrome or Edge tab and allow microphone access.",
          "audio-capture":
            "No microphone was detected. Connect a microphone and check the browser’s selected input device.",
          "no-speech":
            "No speech was detected. Try again and speak after the Listening message appears.",
          network:
            "The browser’s speech-recognition service could not connect. Check your connection or keep typing.",
          "language-not-supported":
            "This browser does not support the selected recognition language. Try another supported language or keep typing.",
        };
        endRecognition();
        if (event.error !== "aborted")
          feedback(
            explanations[event.error] ||
              "Voice input could not finish. You can keep typing or retry in a full browser tab.",
            true,
          );
      };
      recognition.onend = endRecognition;
    } catch {
      recognition = null;
    }
  }
  mic.addEventListener("click", () => {
    if (listening || starting) {
      recognition?.abort();
      endRecognition();
      feedback("Voice input stopped. You can review or type your message.");
      return;
    }
    if (window.isSecureContext === false) {
      feedback(
        "Microphone input needs HTTPS or localhost. Open the HTTPS site or use a local server in VS Code.",
        true,
      );
      return;
    }
    ensureRecognition();
    if (!recognition) {
      feedback(
        "Speech recognition is unavailable in this browser or embedded view. Open this site in a full Chrome or Edge tab. Text chat still works.",
        true,
      );
      document.querySelector("#voice-help").open = true;
      return;
    }
    enableFromGesture();
    stopSpeech();
    starting = true;
    render();
    feedback(
      "Waiting for microphone permission. Choose Allow if your browser asks.",
    );
    try {
      recognition.start();
    } catch (error) {
      endRecognition();
      feedback(
        error.name === "NotAllowedError"
          ? "Microphone access was blocked. Allow Microphone in browser site settings, then retry."
          : "Voice input could not start. Try a full Chrome or Edge tab, or keep typing.",
        true,
      );
    }
  });
  for (const button of stopButtons)
    button.addEventListener("click", () => {
      recognition?.abort();
      listening = false;
      starting = false;
      stopSpeech();
      feedback("Voice stopped.");
    });
  const openTab = document.querySelector("#voice-open-tab");
  if (openTab) openTab.href = `${location.origin}${location.pathname}`;
  note.textContent = Recognition
    ? "Click the microphone, allow access, then review your words before Send. Recognition may use your browser’s online service."
    : "Microphone input isn’t supported here. Open a full Chrome or Edge tab, or type your question.";
  render();
  if (!speechSupported)
    feedback(
      "This browser does not support spoken replies. Text chat remains available; try a full Chrome, Edge, or Safari tab for voice.",
      true,
    );
  return {
    speak,
    enableFromGesture,
    stop() {
      recognition?.abort();
      listening = false;
      starting = false;
      stopSpeech();
    },
    isEnabled: () => voiceOn,
    isSpeaking: () => speaking,
  };
}
