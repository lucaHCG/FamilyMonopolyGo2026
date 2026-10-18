(() => {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const storageKey = "family-go-audio-enabled";
  const tempo = 104;
  const stepLength = 60 / tempo / 2;
  const melody = [
    74, null, 78, 81, 78, null, 76, 74,
    71, null, 74, 78, 76, 74, null, 71,
    67, null, 71, 74, 71, null, 69, 67,
    69, 73, 76, null, 73, 71, 69, null
  ];
  const roots = [50, 47, 43, 45];
  const chords = [[0, 4, 7], [0, 3, 7], [0, 4, 7], [0, 4, 7]];

  let context;
  let masterGain;
  let musicGain;
  let effectsGain;
  let schedulerId;
  let nextStepTime = 0;
  let currentStep = 0;
  let enabled = true;

  try {
    enabled = window.localStorage.getItem(storageKey) !== "false";
  } catch (_) {
    enabled = true;
  }

  function frequency(midiNote) {
    return 440 * (2 ** ((midiNote - 69) / 12));
  }

  function ensureAudio() {
    if (!AudioContextClass || context) return Boolean(context);
    context = new AudioContextClass();
    masterGain = context.createGain();
    musicGain = context.createGain();
    effectsGain = context.createGain();
    masterGain.gain.value = 0.72;
    musicGain.gain.value = 0.17;
    effectsGain.gain.value = 0.38;
    musicGain.connect(masterGain);
    effectsGain.connect(masterGain);
    masterGain.connect(context.destination);
    return true;
  }

  function playTone(note, start, duration, options = {}) {
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const peak = options.gain ?? 0.12;
    const attack = options.attack ?? 0.018;
    const release = Math.min(options.release ?? 0.12, duration * 0.7);

    oscillator.type = options.type || "triangle";
    oscillator.frequency.setValueAtTime(frequency(note), start);
    if (options.slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(frequency(options.slideTo), start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, Math.max(start + attack, start + duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(options.destination || effectsGain);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  function playBeat(start) {
    playTone(38, start, 0.12, {
      type: "sine",
      gain: 0.07,
      slideTo: 26,
      release: 0.08,
      destination: musicGain
    });
  }

  function scheduleStep(step, time) {
    const bar = Math.floor(step / 8) % roots.length;
    const position = step % 8;

    if (position === 0) {
      chords[bar].forEach((interval, index) => {
        playTone(roots[bar] + 12 + interval, time + index * 0.012, stepLength * 7.6, {
          type: "sine",
          gain: 0.035,
          attack: 0.28,
          release: 0.7,
          destination: musicGain
        });
      });
    }

    if (position === 0 || position === 4) {
      playTone(roots[bar], time, stepLength * 1.55, {
        type: "triangle",
        gain: 0.07,
        attack: 0.02,
        release: 0.2,
        destination: musicGain
      });
      playBeat(time);
    }

    const note = melody[step % melody.length];
    if (note) {
      playTone(note, time, stepLength * 0.78, {
        type: step % 4 === 0 ? "square" : "triangle",
        gain: step % 4 === 0 ? 0.045 : 0.038,
        attack: 0.01,
        release: 0.1,
        destination: musicGain
      });
    }
  }

  function scheduler() {
    if (!context || context.state !== "running" || !enabled) return;
    if (nextStepTime < context.currentTime - 0.5) nextStepTime = context.currentTime + 0.06;
    while (nextStepTime < context.currentTime + 0.35) {
      scheduleStep(currentStep, nextStepTime);
      currentStep = (currentStep + 1) % melody.length;
      nextStepTime += stepLength;
    }
  }

  function updateButton() {
    const button = document.querySelector("#audio-toggle");
    if (!button) return;
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", enabled ? "Mute music and sounds" : "Turn on music and sounds");
    button.title = enabled ? "Mute music and sounds" : "Turn on music and sounds";
    button.querySelector("span").textContent = enabled ? "🔊" : "🔇";
  }

  async function start() {
    if (!enabled || !ensureAudio()) {
      updateButton();
      return;
    }
    await context.resume();
    nextStepTime = context.currentTime + 0.08;
    if (!schedulerId) schedulerId = window.setInterval(scheduler, 100);
    scheduler();
    updateButton();
  }

  async function toggle() {
    enabled = !enabled;
    try {
      window.localStorage.setItem(storageKey, String(enabled));
    } catch (_) {
      // Audio preference still works for the current session.
    }

    if (enabled) {
      await start();
      cue("on");
    } else if (context) {
      await context.suspend();
    }
    updateButton();
  }

  function duckMusic(duration = 1.2) {
    if (!context || !musicGain) return;
    const now = context.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(Math.max(musicGain.gain.value, 0.001), now);
    musicGain.gain.linearRampToValueAtTime(0.055, now + 0.06);
    musicGain.gain.linearRampToValueAtTime(0.17, now + duration);
  }

  function cue(name) {
    if (!enabled || !ensureAudio()) return;
    context.resume();
    const now = context.currentTime + 0.025;

    if (name === "chance") {
      duckMusic(1.25);
      [74, 78, 81, 86].forEach((note, index) => {
        playTone(note, now + index * 0.105, 0.32, { type: "square", gain: 0.11, release: 0.16 });
      });
      playTone(90, now + 0.48, 0.55, { type: "sine", gain: 0.08, release: 0.4 });
    } else if (name === "jail") {
      duckMusic(1.55);
      [50, 48, 45, 38].forEach((note, index) => {
        playTone(note, now + index * 0.16, index === 3 ? 0.58 : 0.25, {
          type: index === 3 ? "sawtooth" : "square",
          gain: index === 3 ? 0.095 : 0.075,
          release: 0.14
        });
      });
      playTone(86, now + 0.5, 0.08, { type: "square", gain: 0.06, release: 0.04 });
      playTone(82, now + 0.59, 0.1, { type: "square", gain: 0.05, release: 0.05 });
    } else if (name === "build") {
      duckMusic(2.6);
      [48, 48, 52, 52].forEach((note, index) => {
        playTone(note, now + index * 0.38, 0.14, { type: "square", gain: 0.055, release: 0.06 });
      });
      [69, 74, 78, 81, 86].forEach((note, index) => {
        playTone(note, now + 1.42 + index * 0.12, 0.46, { type: "triangle", gain: 0.085, release: 0.28 });
      });
    } else if (name === "on") {
      [74, 78, 81].forEach((note, index) => {
        playTone(note, now + index * 0.08, 0.24, { type: "triangle", gain: 0.08 });
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#audio-toggle")?.addEventListener("click", toggle);
    updateButton();
  });

  window.FamilyAudio = { start, cue };
})();
