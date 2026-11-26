// Audio: música generativa (WebAudio) y efectos sintetizados.
// No usa archivos de audio: todo se genera en el navegador.
import { settings } from './state.js';

const A4 = 440;
const hz = (m) => A4 * Math.pow(2, (m - 69) / 12); // nota MIDI -> Hz

// Estados de ánimo musicales (la música cambia según el escenario / emoción).
const MOODS = {
  menu:     { bpm: 96,  root: 60, chords: [[0, 4, 7], [9, -3, 4], [5, 9, 0], [7, 11, 2]], scale: [0, 2, 4, 7, 9], arp: 'up',   hat: true,  kick: false, lead: 0.5, wave: 'triangle' },
  alegre:   { bpm: 108, root: 60, chords: [[0, 4, 7], [7, 11, 2], [9, 0, 4], [5, 9, 0]],  scale: [0, 2, 4, 7, 9], arp: 'up',   hat: true,  kick: false, lead: 0.7, wave: 'triangle' },
  triste:   { bpm: 66,  root: 57, chords: [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], scale: [0, 3, 5, 7, 10], arp: 'slow', hat: false, kick: false, lead: 0.4, wave: 'sine' },
  enojado:  { bpm: 120, root: 50, chords: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], scale: [0, 3, 5, 7, 10], arp: 'drive', hat: true, kick: true, lead: 0.3, wave: 'sawtooth' },
  asustado: { bpm: 72,  root: 52, chords: [[0, 3, 6], [1, 4, 8], [0, 3, 6], [-1, 2, 5]], scale: [0, 1, 3, 6, 7], arp: 'sparse', hat: false, kick: false, lead: 0.5, wave: 'sine' },
  final:    { bpm: 112, root: 62, chords: [[0, 4, 7], [5, 9, 0], [7, 11, 2], [0, 4, 7]],   scale: [0, 2, 4, 7, 9], arp: 'up',   hat: true,  kick: false, lead: 0.8, wave: 'triangle' },
};

class Engine {
  constructor() {
    this.ctx = null; this.master = null; this.musicBus = null; this.sfxBus = null;
    this.mood = null; this.timer = null; this.nextTime = 0; this.step = 0; this.bar = 0;
    this.noise = null;
  }

  // Los navegadores exigen un gesto del usuario antes de reproducir audio.
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      const comp = this.ctx.createDynamicsCompressor();
      this.musicBus = this.ctx.createGain();
      this.sfxBus = this.ctx.createGain();
      this.musicBus.connect(comp); this.sfxBus.connect(comp);
      comp.connect(this.master); this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0.9, t, 0.05);
    this.musicBus.gain.setTargetAtTime(settings.music ? 0.32 * settings.volume : 0, t, 0.15);
    this.sfxBus.gain.setTargetAtTime(settings.sfx ? 0.9 * settings.volume : 0, t, 0.05);
  }

  // ---------------------------------------------------------------- notas básicas
  tone(freq, when, dur, { type = 'sine', gain = 0.25, slideTo = null, attack = 0.005, bus = 'sfx', filter = null, detune = 0 } = {}) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, when); o.detune.value = detune;
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, when + dur);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    let node = o;
    if (filter) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); node = f; }
    node.connect(g); g.connect(bus === 'music' ? this.musicBus : this.sfxBus);
    o.start(when); o.stop(when + dur + 0.05);
  }

  hat(when, gain = 0.05, bus = 'music') {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(gain, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    s.connect(f); f.connect(g); g.connect(bus === 'music' ? this.musicBus : this.sfxBus);
    s.start(when, 0, 0.08);
  }

  whoosh(when = this.ctx.currentTime, dur = 0.35, gain = 0.12) {
    const s = this.ctx.createBufferSource(); s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(300, when); f.frequency.exponentialRampToValueAtTime(3200, when + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + dur * 0.4); g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxBus); s.start(when, 0, dur + 0.05);
  }

  // ---------------------------------------------------------------- efectos
  sfx(name) {
    if (!settings.sfx || !this.unlock()) return;
    const t = this.ctx.currentTime + 0.01;
    const T = (f, d, o, w = 0) => this.tone(f, t + w, d, o);
    switch (name) {
      case 'tap':     T(520, 0.09, { type: 'sine', gain: 0.22, slideTo: 760 }); break;
      case 'pop':     T(700, 0.1, { type: 'triangle', gain: 0.25, slideTo: 980 }); break;
      case 'select':  T(440, 0.08, { type: 'triangle', gain: 0.22 }); T(660, 0.1, { type: 'triangle', gain: 0.2 }, 0.06); break;
      case 'back':    T(560, 0.12, { type: 'sine', gain: 0.2, slideTo: 340 }); break;
      case 'whoosh':  this.whoosh(t, 0.4, 0.1); break;
      case 'jump':    T(260, 0.22, { type: 'sine', gain: 0.25, slideTo: 760 }); break;
      case 'correct': [523, 659, 784, 1047].forEach((f, i) => T(f, 0.28, { type: 'triangle', gain: 0.24 }, i * 0.07)); T(1568, 0.5, { type: 'sine', gain: 0.1 }, 0.28); break;
      case 'wrong':   T(392, 0.22, { type: 'sine', gain: 0.22, slideTo: 330 }); T(311, 0.3, { type: 'sine', gain: 0.2, slideTo: 262 }, 0.18); break;
      case 'error':   T(240, 0.16, { type: 'triangle', gain: 0.2, slideTo: 200 }); break;
      case 'coin':    T(988, 0.07, { type: 'square', gain: 0.08 }); T(1319, 0.25, { type: 'square', gain: 0.08 }, 0.07); break;
      case 'star':    [1175, 1568, 2093].forEach((f, i) => T(f, 0.35, { type: 'sine', gain: 0.18 }, i * 0.09)); break;
      case 'sticker': T(600, 0.1, { type: 'triangle', gain: 0.25, slideTo: 1000 }); [1319, 1760].forEach((f, i) => T(f, 0.3, { type: 'sine', gain: 0.15 }, 0.1 + i * 0.1)); break;
      case 'unlock':  [392, 494, 587, 784, 988].forEach((f, i) => T(f, 0.4, { type: 'triangle', gain: 0.22 }, i * 0.1)); T(1568, 0.8, { type: 'sine', gain: 0.12 }, 0.5); break;
      case 'fanfare': [[523, 0], [523, 0.14], [523, 0.28], [659, 0.5], [784, 0.62], [1047, 0.8]].forEach(([f, w]) => { T(f, 0.35, { type: 'triangle', gain: 0.24 }, w); T(f / 2, 0.35, { type: 'sine', gain: 0.18 }, w); }); break;
      case 'toggle':  T(500, 0.07, { type: 'sine', gain: 0.2 }); T(750, 0.09, { type: 'sine', gain: 0.2 }, 0.05); break;
      case 'giggle':  [0, 1, 2].forEach((i) => T(600 + i * 90, 0.08, { type: 'square', gain: 0.07, slideTo: 800 + i * 90 }, i * 0.07)); break;
      case 'combo':   [659, 784, 988, 1319].forEach((f, i) => T(f, 0.18, { type: 'triangle', gain: 0.22 }, i * 0.05)); break;
      default: break;
    }
  }

  // ---------------------------------------------------------------- música
  setMood(name) {
    if (!MOODS[name]) name = 'menu';
    if (this.mood === name && this.timer) return;
    this.mood = name;
    if (!this.ctx) return; // se inicia al primer gesto
    this.startMusic();
  }

  startMusic() {
    if (!this.ctx || this.timer) return;
    this.nextTime = this.ctx.currentTime + 0.1; this.step = 0; this.bar = 0;
    this.timer = setInterval(() => this.schedule(), 60);
  }

  stopMusic() { clearInterval(this.timer); this.timer = null; }

  schedule() {
    if (!this.ctx || !settings.music) return;
    const m = MOODS[this.mood] || MOODS.menu;
    const stepDur = 60 / m.bpm / 4;
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      this.playStep(m, this.step, this.nextTime, stepDur);
      this.nextTime += stepDur; this.step++;
      if (this.step % 16 === 0) this.bar++;
    }
  }

  playStep(m, step, when, d) {
    const s = step % 16;
    const chord = m.chords[this.bar % m.chords.length];
    const root = m.root;
    // Pad (acorde largo) al inicio de cada compás
    if (s === 0) {
      chord.forEach((n, i) => {
        this.tone(hz(root + n), when, d * 16 * 0.95, { type: 'sine', gain: 0.1, attack: 0.5, bus: 'music', detune: i * 3 });
        this.tone(hz(root + n + 12), when, d * 16 * 0.95, { type: 'triangle', gain: 0.03, attack: 0.7, bus: 'music', detune: -4 });
      });
    }
    // Bajo
    const bassSteps = m.arp === 'drive' ? [0, 2, 4, 6, 8, 10, 12, 14] : [0, 8];
    if (bassSteps.includes(s)) this.tone(hz(root + chord[0] - 12), when, d * (m.arp === 'drive' ? 1.6 : 6), { type: m.arp === 'drive' ? 'sawtooth' : 'sine', gain: m.arp === 'drive' ? 0.09 : 0.16, bus: 'music', filter: 380 });
    // Arpegio
    let arpOn = false, idx = 0;
    if (m.arp === 'up') { arpOn = s % 2 === 0; idx = (s / 2) % 4; }
    else if (m.arp === 'slow') { arpOn = s % 4 === 0; idx = (s / 4) % 3; }
    else if (m.arp === 'drive') { arpOn = s % 4 === 2; idx = Math.floor(s / 4) % 3; }
    else if (m.arp === 'sparse') { arpOn = s === 0 || s === 6 || s === 11; idx = (this.bar + s) % 3; }
    if (arpOn) {
      const n = chord[idx % chord.length] + 12 + (idx === 3 ? 12 : 0);
      this.tone(hz(root + n), when, d * 3, { type: m.wave, gain: 0.07, bus: 'music', filter: m.arp === 'drive' ? 1800 : 3500 });
    }
    // Melodía suave sobre la escala (determinista, con variación por compás)
    if ((s === 4 || s === 12) && Math.sin(this.bar * 1.7 + s) > (m.arp === 'sparse' ? 0.2 : -0.35)) {
      const sc = m.scale; const n = sc[Math.abs((this.bar * 3 + s) % sc.length)] + 24;
      this.tone(hz(root + n), when, d * 3.5, { type: 'sine', gain: 0.045 * m.lead * 2, bus: 'music' });
    }
    // Percusión suave
    if (m.hat && s % 2 === 1) this.hat(when, 0.035);
    if (m.kick && s % 8 === 0) this.tone(120, when, 0.18, { type: 'sine', gain: 0.35, slideTo: 40, bus: 'music' });
  }
}

export const audio = new Engine();

// Primer gesto del usuario: activar audio y empezar la música.
const first = () => {
  audio.unlock();
  if (audio.mood) audio.startMusic();
  ['pointerdown', 'keydown'].forEach((e) => window.removeEventListener(e, first, true));
};
['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, first, true));

export const sfx = (n) => audio.sfx(n);
