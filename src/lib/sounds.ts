"use client";

let audioCtx: AudioContext | null = null;
let muted = typeof window !== "undefined" ? localStorage.getItem("wordly-muted") === "true" : false;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(val: boolean) {
  muted = val;
  if (typeof window !== "undefined") {
    localStorage.setItem("wordly-muted", String(val));
  }
}

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function play(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  if (muted) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playKeyPress() {
  play(800, 0.05, "square", 0.04);
}

export function playDelete() {
  play(400, 0.06, "square", 0.04);
}

export function playFlip() {
  play(600, 0.1, "sine", 0.06);
}

export function playCorrect() {
  if (muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [523, 659, 784].forEach((freq, i) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.12;
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 * (i + 1) + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.15 * i);
      osc.stop(now + 0.15 * (i + 1) + 0.2);
    } catch {}
  });
}

export function playWrong() {
  play(200, 0.25, "sawtooth", 0.06);
}

export function playWin() {
  if (muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [523, 659, 784, 1047].forEach((freq, i) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2 * (i + 1) + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.2 * i);
      osc.stop(now + 0.2 * (i + 1) + 0.3);
    } catch {}
  });
}

export function playGameOver() {
  if (muted) return;
  const ctx = getCtx();
  const now = ctx.currentTime;
  [392, 349, 330].forEach((freq, i) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = 0.1;
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3 * (i + 1) + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.3 * i);
      osc.stop(now + 0.3 * (i + 1) + 0.3);
    } catch {}
  });
}
