"use client";

/**
 * The pickleball "POCK".
 *
 * A real paddle-on-ball contact is an impulsive impact: a bright click of the
 * hard ball on the rigid composite face, then a few high-Q resonant modes of
 * the face + hollow ball ringing out in ~70 ms. We reproduce that with modal
 * synthesis (a noise impulse through several detuned band-pass resonators)
 * rather than a tone — so it reads as a real hit, not a beep.
 *
 * Drop a file at /public/hit.mp3 (or /hit.wav) and it auto-overrides the synth.
 *
 * Rules: created lazily on the first user gesture (autoplay-safe), muted by
 * default until the visitor opts in, choice persisted to localStorage.
 */

let ctx: AudioContext | null = null;
let muted = true;
let loaded = false;
let sample: AudioBuffer | null = null;
let sampleTried = false;
const KEY = "court-sound";
const listeners = new Set<(m: boolean) => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    muted = window.localStorage.getItem(KEY) !== "on";
  } catch {
    muted = true;
  }
}

export function isMuted(): boolean {
  ensureLoaded();
  return muted;
}

export function subscribe(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setMuted(next: boolean) {
  ensureLoaded();
  muted = next;
  try {
    window.localStorage.setItem(KEY, next ? "off" : "on");
  } catch {
    /* ignore */
  }
  if (!next) resume();
  listeners.forEach((fn) => fn(next));
}

export function toggleMuted() {
  setMuted(!isMuted());
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function resume() {
  const c = getCtx();
  if (c && c.state === "suspended") void c.resume();
  if (c) void loadSample(c);
}

async function loadSample(c: AudioContext) {
  if (sampleTried) return;
  sampleTried = true;
  for (const url of ["/hit.mp3", "/hit.wav"]) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      sample = await c.decodeAudioData(buf);
      return;
    } catch {
      /* try next / fall through to synth */
    }
  }
}

/** One modal-synthesis pock. `strength` (0..1) firms up a soft dink vs a drive. */
function synthPock(c: AudioContext, strength: number) {
  const t = c.currentTime;
  const s = Math.max(0, Math.min(1, strength));

  const out = c.createGain();
  out.gain.value = 0.9;
  out.connect(c.destination);

  // short noise impulse that excites the resonators
  const dur = 0.13;
  const buf = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    // a sharp burst that decays almost instantly = the contact impulse
    const env = Math.exp(-i / (c.sampleRate * 0.0016));
    d[i] = (Math.random() * 2 - 1) * env;
  }

  // resonant modes of the face + ball (detune slightly with strength)
  const modes = [
    { f: 1180 * (1 + s * 0.08), q: 9, g: 0.9, decay: 0.075 },
    { f: 2300 * (1 + s * 0.06), q: 16, g: 0.7, decay: 0.06 },
    { f: 3850 * (1 + s * 0.05), q: 22, g: 0.45, decay: 0.045 },
  ];
  modes.forEach((m) => {
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = m.f;
    bp.Q.value = m.q;
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(m.g * (0.5 + s * 0.5), t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + m.decay);
    src.connect(bp).connect(g).connect(out);
    src.start(t);
    src.stop(t + dur);
  });

  // bright attack "tick" of the contact
  const click = c.createBufferSource();
  click.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 3200;
  const cg = c.createGain();
  cg.gain.setValueAtTime(0.5 + s * 0.4, t);
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  click.connect(hp).connect(cg).connect(out);
  click.start(t);
  click.stop(t + 0.03);

  // a touch of low body for weight
  const body = c.createOscillator();
  body.type = "sine";
  body.frequency.setValueAtTime(260, t);
  body.frequency.exponentialRampToValueAtTime(150, t + 0.05);
  const bg = c.createGain();
  bg.gain.setValueAtTime(0.0001, t);
  bg.gain.exponentialRampToValueAtTime(0.18 * (0.4 + s * 0.6), t + 0.004);
  bg.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  body.connect(bg).connect(out);
  body.start(t);
  body.stop(t + 0.08);
}

/** Play a pock. No-ops when muted / on the server / if audio can't start. */
export function pop(strength = 0.6) {
  ensureLoaded();
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();
  void loadSample(c);

  if (sample) {
    const src = c.createBufferSource();
    src.buffer = sample;
    src.playbackRate.value = 0.94 + Math.random() * 0.12 + strength * 0.08;
    const g = c.createGain();
    g.gain.value = 0.55 + strength * 0.4;
    src.connect(g).connect(c.destination);
    src.start();
    return;
  }
  synthPock(c, strength);
}
