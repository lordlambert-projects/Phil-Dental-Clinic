// Small synthesized tones: no audio downloads, cookies, or autoplay.
export function initSound() {
  let context = null,
    enabled = false,
    lastScroll = 0,
    lastPosition = window.scrollY;
  const toggles = [...document.querySelectorAll("[data-sound-toggle]")];
  const Audio = window.AudioContext || window.webkitAudioContext;
  function render() {
    for (const b of toggles) {
      b.textContent = enabled ? "Sound on" : "Sound off";
      b.setAttribute("aria-pressed", String(enabled));
      if (!Audio) {
        b.disabled = true;
        b.textContent = "Sound unavailable";
      }
    }
  }
  function tone(frequency, length, volume, sweep = 0) {
    if (!enabled || !context || context.state !== "running") return;
    const now = context.currentTime,
      oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, now);
    if (sweep)
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency + sweep,
        now + length,
      );
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + length + 0.025);
  }
  for (const b of toggles)
    b.addEventListener("click", async () => {
      if (!Audio) return;
      enabled = !enabled;
      try {
        context ||= new Audio();
        if (enabled) {
          await context.resume();
          tone(610, 0.12, 0.028, 260);
        } else await context.suspend();
      } catch {
        enabled = false;
      }
      render();
    });
  document.addEventListener("click", (event) => {
    if (
      !event.target.closest("button,a,summary") ||
      event.target.closest("[data-sound-toggle]")
    )
      return;
    if (!document.body.classList.contains("voice-speaking"))
      tone(720, 0.065, 0.018, 100);
  });
  document.addEventListener(
    "scroll",
    (event) => {
      if (
        !enabled ||
        document.hidden ||
        document.body.classList.contains("voice-speaking")
      )
        return;
      const now = performance.now(),
        position =
          event.target === document
            ? window.scrollY
            : event.target.scrollTop || 0;
      if (now - lastScroll > 320 && Math.abs(position - lastPosition) > 30) {
        lastScroll = now;
        tone(165, 0.08, 0.009, 55);
      }
      lastPosition = position;
    },
    { passive: true, capture: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (context && document.hidden) context.suspend();
  });
  document.addEventListener(
    "pointerdown",
    () => {
      if (enabled && context?.state === "suspended" && !document.hidden)
        context.resume().catch(() => {});
    },
    { passive: true },
  );
  render();
}
