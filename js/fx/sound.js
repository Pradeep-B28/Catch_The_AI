// Web Audio synthesizer for key ticks, timer countdown, catch chimes, and miss thuds.
// Uses Web Audio API without audio files; respects config.features.sound and cta-muted.
// Used across play typing, timer warnings, reveal states, and result fanfare.

import { CONFIG } from "../../config.js";
import { on, emit } from "../events.js";

let ctx = null;
let masterGain = null;
let isMuted = false;
let lastKeyTick = 0;

// Initialize mute state from localStorage safely
try {
  if (typeof window !== "undefined" && window.localStorage) {
    isMuted = window.localStorage.getItem("cta-muted") === "true";
  }
} catch {
  isMuted = false;
}

function getContext() {
  if (!CONFIG.features.sound) return null;
  if (!ctx && typeof window !== "undefined") {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.25, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
  }
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Toggle mute state and synchronize with localStorage.
 * @param {boolean} [forced]
 * @returns {boolean} Current muted state
 */
export function toggleMute(forced) {
  isMuted = typeof forced === "boolean" ? forced : !isMuted;
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("cta-muted", String(isMuted));
    }
  } catch {}

  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(isMuted ? 0 : 0.25, ctx.currentTime);
  }

  emit("sound:toggle", { muted: isMuted });
  return isMuted;
}

export function isSoundMuted() {
  return isMuted;
}

/**
 * Quiet typing key tick: 8 ms click with random pitch, at most once per 40 ms.
 */
export function playKeyTick() {
  if (isMuted || !CONFIG.features.sound) return;
  const now = performance.now();
  if (now - lastKeyTick < 40) return;
  lastKeyTick = now;

  const audio = getContext();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  const freq = 400 + Math.random() * 300;

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, audio.currentTime);

  gain.gain.setValueAtTime(0.04, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.008);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(audio.currentTime);
  osc.stop(audio.currentTime + 0.008);
}

/**
 * Timer tick: once a second in the last 5 seconds.
 */
export function playTimerTick() {
  if (isMuted || !CONFIG.features.sound) return;
  const audio = getContext();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, audio.currentTime);

  gain.gain.setValueAtTime(0.12, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(audio.currentTime);
  osc.stop(audio.currentTime + 0.05);
}

/**
 * Catch sound: two rising sine notes, 523 Hz then 784 Hz, 120 ms each.
 */
export function playCatchSound() {
  if (isMuted || !CONFIG.features.sound) return;
  const audio = getContext();
  if (!audio) return;

  const t0 = audio.currentTime;
  const osc1 = audio.createOscillator();
  const gain1 = audio.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(523, t0);
  gain1.gain.setValueAtTime(0.2, t0);
  gain1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
  osc1.connect(gain1);
  gain1.connect(masterGain);
  osc1.start(t0);
  osc1.stop(t0 + 0.12);

  const t1 = t0 + 0.12;
  const osc2 = audio.createOscillator();
  const gain2 = audio.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(784, t1);
  gain2.gain.setValueAtTime(0.25, t1);
  gain2.gain.exponentialRampToValueAtTime(0.001, t1 + 0.15);
  osc2.connect(gain2);
  gain2.connect(masterGain);
  osc2.start(t1);
  osc2.stop(t1 + 0.15);
}

/**
 * Miss sound: one soft 160 Hz triangle note, 180 ms.
 */
export function playMissSound() {
  if (isMuted || !CONFIG.features.sound) return;
  const audio = getContext();
  if (!audio) return;

  const t0 = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(160, t0);

  gain.gain.setValueAtTime(0.25, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(t0);
  osc.stop(t0 + 0.18);
}

/**
 * Result fanfare: short 3-note arpeggio (523, 659, 784 Hz) and optional sparkle.
 * @param {boolean} [isPerfect=false]
 */
export function playResultFanfare(isPerfect = false) {
  if (isMuted || !CONFIG.features.sound) return;
  const audio = getContext();
  if (!audio) return;

  const notes = [523, 659, 784];
  const start = audio.currentTime;

  notes.forEach((freq, idx) => {
    const t = start + idx * 0.12;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  });

  if (isPerfect) {
    const sparkT = start + 0.45;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1046, sparkT);
    gain.gain.setValueAtTime(0.15, sparkT);
    gain.gain.exponentialRampToValueAtTime(0.001, sparkT + 0.3);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(sparkT);
    osc.stop(sparkT + 0.3);
  }
}
