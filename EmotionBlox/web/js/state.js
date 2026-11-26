// Estado global, ajustes y guardado. El progreso vive en el servidor (SQLite);
// en este dispositivo solo se recuerdan los números de las aventuras (para "Continuar mi aventura").
import { api } from './api.js';
import { CHARACTER_ORDER, MODULES, TOTAL_MODULES } from './content.js';

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
};

const mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
export const settings = Object.assign({ music: true, sfx: true, volume: 0.8, reduceMotion: mq.matches }, LS.get('eb_settings', {}));
export function setSetting(k, v) { settings[k] = v; LS.set('eb_settings', settings); document.body.classList.toggle('reduce-motion', !!settings.reduceMotion); }

// ---- aventuras guardadas en este dispositivo
export const deviceIds = () => LS.get('eb_children', []);
export function rememberChild(id) {
  const ids = deviceIds().filter((x) => x !== id); ids.unshift(id); LS.set('eb_children', ids.slice(0, 8));
}
export function forgetChild(id) { LS.set('eb_children', deviceIds().filter((x) => x !== id)); }

// ---- estado de la partida
export const S = { child: null, progress: null, skipCheckinPrompt: false };

export function defaultProgress() {
  return {
    character: 'bloki', points: 0, streak: 0, lastPlay: null, currentModule: 1, modules: {},
    unlocked: ['bloki'], stickers: [], badges: [], checkins: 0, seenIntro: false, seenMapHint: false,
  };
}

export function setChild(child) {
  S.child = { id: child.id, name: child.name };
  S.progress = Object.assign(defaultProgress(), child.progress || {});
  rememberChild(child.id);
  touchStreak();
}

export function clearChild() { S.child = null; S.progress = null; }

// Racha: días seguidos jugando.
function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
function touchStreak() {
  const p = S.progress; const today = dayKey();
  if (p.lastPlay === today) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  p.streak = p.lastPlay === dayKey(y) ? (p.streak || 0) + 1 : 1;
  p.lastPlay = today;
}

let saveTimer = null;
export function save({ quiet = false } = {}) {
  if (!S.child) return Promise.resolve();
  clearTimeout(saveTimer);
  return api.put(`/api/children/${S.child.id}/progress`, { progress: S.progress })
    .then(() => { if (!quiet) window.dispatchEvent(new CustomEvent('eb:saved')); })
    .catch(() => window.dispatchEvent(new CustomEvent('eb:savefail')));
}
export function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(() => save({ quiet: true }), 600); }

// ---- consultas de progreso
export const moduleDone = (id) => !!(S.progress.modules[id] && S.progress.modules[id].done);
export const moduleStars = (id) => (S.progress.modules[id] && S.progress.modules[id].stars) || 0;
export const totalStars = () => Object.values(S.progress.modules).reduce((a, m) => a + (m.stars || 0), 0);
export const modulesDone = () => MODULES.filter((m) => moduleDone(m.id)).length;
export const moduleUnlocked = (id) => id === 1 || moduleDone(id - 1);
export const currentModuleId = () => { const m = MODULES.find((x) => !moduleDone(x.id)); return m ? m.id : TOTAL_MODULES; };
export const hero = () => (S.progress && S.progress.character) || 'bloki';
export const isUnlocked = (cid) => S.progress.unlocked.includes(cid);

// Devuelve lo nuevo que se desbloqueó (para celebrarlo).
export function evaluateUnlocks() {
  const p = S.progress; const out = { characters: [], badges: [] };
  const grantChar = (c) => { if (!p.unlocked.includes(c)) { p.unlocked.push(c); out.characters.push(c); } };
  const grantBadge = (b) => { if (!p.badges.includes(b)) { p.badges.push(b); out.badges.push(b); } };
  MODULES.forEach((m) => { if (moduleDone(m.id)) grantChar(m.companion); });
  if (modulesDone() >= 1) grantBadge('primera');
  if (Object.values(p.modules).some((m) => m.stars === 3)) grantBadge('sinerrores');
  if ((p.checkins || 0) >= 3) { grantBadge('explorador'); grantChar('mica'); }
  if (totalStars() >= 9) { grantBadge('estrellas'); grantChar('tico'); }
  if ((p.streak || 0) >= 3) grantBadge('racha');
  if (modulesDone() >= TOTAL_MODULES) { grantBadge('completo'); grantChar('coro'); }
  p.unlocked = CHARACTER_ORDER.filter((c) => p.unlocked.includes(c));
  return out;
}
