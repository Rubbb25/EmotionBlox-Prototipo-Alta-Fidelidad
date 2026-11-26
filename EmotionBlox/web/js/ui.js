// Componentes de interfaz compartidos: iconos, caras, barra superior (HUD), ventanas, avisos y efectos.
import { EMOTIONS } from './content.js';
import { audio, sfx } from './audio.js';
import { settings, setSetting, S } from './state.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const fill = (txt) => String(txt).replace(/\{name\}/g, S.child ? S.child.name : 'amigo');

// ---------------------------------------------------------------- iconos
const P = {
  home: '<path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/>',
  back: '<path d="M14.5 5 7.5 12l7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
  next: '<path d="M9.5 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>',
  music: '<path d="M9 17V6l10-2v11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6.5" cy="17.5" r="3" fill="currentColor"/><circle cx="16.5" cy="15.5" r="3" fill="currentColor"/>',
  musicOff: '<path d="M9 17V6l10-2v11" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><circle cx="6.5" cy="17.5" r="3" fill="currentColor" opacity=".55"/><circle cx="16.5" cy="15.5" r="3" fill="currentColor" opacity=".55"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
  help: '<circle cx="12" cy="12" r="9.5" fill="currentColor"/><path d="M9.2 9.6a2.9 2.9 0 1 1 4.2 2.6c-.9.5-1.4 1-1.4 1.9" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.4" fill="#fff"/>',
  pause: '<rect x="6" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.6" fill="currentColor"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
  star: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z" fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>',
  starO: '<path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10.5" rx="3" fill="currentColor"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="12" cy="15.6" r="1.6" fill="#fff"/>',
  check: '<path d="M5 12.8l4.6 4.6L19 7.6" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
  close: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor"/><path d="M7 5.5H4v1.5a3.5 3.5 0 0 0 3.4 3.5M17 5.5h3v1.5a3.5 3.5 0 0 1-3.4 3.5" fill="none" stroke="currentColor" stroke-width="2"/><rect x="10.8" y="13.5" width="2.4" height="4" fill="currentColor"/><rect x="7.5" y="17.5" width="9" height="3" rx="1.4" fill="currentColor"/>',
  flame: '<path d="M12 2.5c.6 3.6 5.5 5.7 5.5 11a5.5 5.5 0 0 1-11 0c0-2.4 1.1-3.6 2.2-4.8.2 1.4.9 2.2 1.7 2.7-.2-3.5.6-6.6 1.6-8.9z" fill="currentColor"/>',
  users: '<circle cx="9" cy="8" r="3.6" fill="currentColor"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0z" fill="currentColor"/><circle cx="17.2" cy="9" r="2.8" fill="currentColor" opacity=".7"/><path d="M16.5 14.2a5.3 5.3 0 0 1 5 5.8h-4.2" fill="currentColor" opacity=".7"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3" fill="currentColor"/><path d="M4 7.5l8 6 8-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  trash: '<path d="M5 7h14l-1.2 13a1.6 1.6 0 0 1-1.6 1.4H7.8a1.6 1.6 0 0 1-1.6-1.4zM9 7V4.6h6V7M3.5 7h17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="3.2" fill="currentColor"/>',
  eyeOff: '<path d="M2 12s3.6-6.5 10-6.5c1.6 0 3 .4 4.2 1M22 12s-3.6 6.5-10 6.5c-1.6 0-3-.4-4.2-1" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M4 4l16 16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  info: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="7.6" r="1.4" fill="currentColor"/><path d="M12 11v6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
  sortUp: '<path d="M12 6l5 6H7z" fill="currentColor"/><path d="M12 18l-5-6h10z" fill="currentColor" opacity=".25"/>',
  sortDown: '<path d="M12 6l5 6H7z" fill="currentColor" opacity=".25"/><path d="M12 18l-5-6h10z" fill="currentColor"/>',
  sortNone: '<path d="M12 6l5 6H7z" fill="currentColor" opacity=".35"/><path d="M12 18l-5-6h10z" fill="currentColor" opacity=".35"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>',
  shield: '<path d="M12 2.8l8 3v6c0 5-3.4 8.4-8 9.9-4.6-1.5-8-4.9-8-9.9v-6z" fill="currentColor"/><path d="M8.2 12.2l2.6 2.6 5-5.2" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  footsteps: '<ellipse cx="8" cy="9" rx="3" ry="4.4" fill="currentColor"/><ellipse cx="16" cy="15" rx="3" ry="4.4" fill="currentColor"/>',
  target: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>',
  compass: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.8 8.2l-2 5.6-5.6 2 2-5.6z" fill="currentColor"/>',
  gem: '<path d="M6 4h12l4 5-10 12L2 9z" fill="currentColor"/><path d="M2 9h20M9 4l-2 5 5 12 5-12-2-5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7" stroke-linejoin="round"/>',
  face: '<circle cx="12" cy="12" r="9.5" fill="currentColor"/><circle cx="8.8" cy="10.2" r="1.5" fill="#fff"/><circle cx="15.2" cy="10.2" r="1.5" fill="#fff"/><path d="M8 14.4q4 4 8 0" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
  logout: '<path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5M15 8l4 4-4 4M19 12H9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
  chart: '<rect x="4" y="12" width="4" height="8" rx="1.4" fill="currentColor"/><rect x="10" y="6" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="16" y="9" width="4" height="11" rx="1.4" fill="currentColor"/>',
  heart: '<path d="M12 20.5S3.5 15 3.5 8.9A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 8.5 1.7C20.5 15 12 20.5 12 20.5z" fill="currentColor"/>',
  plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/>',
};
export function icon(name, size = 24, cls = '') {
  return `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
}

// ---------------------------------------------------------------- caras de emociones (mismo estilo que las 3D)
export function faceSvg(emo, size = 64, { bg = true, cls = '' } = {}) {
  const e = EMOTIONS[emo] || EMOTIONS.alegre; const ink = '#2B2440';
  const eyes = (ry = 5.2, rx = 3.8, dy = 0) => `<ellipse cx="22" cy="${27 + dy}" rx="${rx}" ry="${ry}" fill="${ink}"/><ellipse cx="42" cy="${27 + dy}" rx="${rx}" ry="${ry}" fill="${ink}"/><circle cx="20.8" cy="${25 + dy}" r="1.3" fill="#fff"/><circle cx="40.8" cy="${25 + dy}" r="1.3" fill="#fff"/>`;
  let f = '';
  switch (emo) {
    case 'alegre': f = `${eyes()}<circle cx="15" cy="38" r="4" fill="#FF8FA3" opacity=".55"/><circle cx="49" cy="38" r="4" fill="#FF8FA3" opacity=".55"/><path d="M20 38q12 0 24 0q-2 13-12 13t-12-13z" fill="${ink}"/><ellipse cx="32" cy="48" rx="5" ry="2.6" fill="#FF7B93"/>`; break;
    case 'triste': f = `${eyes(4.6, 3.4)}<path d="M15 20l10-4M49 20l-10-4" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/><path d="M23 49q9-9 18 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M21 34q-4 6 0 8q4-2 0-8z" fill="#5FB3FF"/>`; break;
    case 'enojado': f = `${eyes(3.8, 3.6, 1)}<path d="M13 17l12 6M51 17l-12 6" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/><circle cx="14" cy="38" r="4" fill="#FF5C5C" opacity=".5"/><circle cx="50" cy="38" r="4" fill="#FF5C5C" opacity=".5"/><path d="M22 51l5-4h10l5 4" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`; break;
    case 'asustado': f = `${eyes(7, 5)}<path d="M14 15l11-3M50 15l-11-3" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="32" cy="47" rx="4.6" ry="6" fill="${ink}"/><path d="M54 14q-5 7 0 9q5-2 0-9z" fill="#5FB3FF"/>`; break;
    case 'tranquilo': f = `<path d="M17 28q5-6 10 0M37 28q5-6 10 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="15" cy="38" r="4" fill="#FF8FA3" opacity=".45"/><circle cx="49" cy="38" r="4" fill="#FF8FA3" opacity=".45"/><path d="M25 42q7 7 14 0" stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`; break;
    default: f = eyes();
  }
  return `<svg class="face ${cls}" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true">${bg ? `<rect x="3" y="3" width="58" height="58" rx="18" fill="${e.deep}"/><rect x="3" y="3" width="58" height="29" rx="18" fill="#fff" opacity=".18"/>` : ''}${f}</svg>`;
}

// ---------------------------------------------------------------- avisos
export function toast(text, { icon: ic = 'check', tone = 'ok', ms = 2400 } = {}) {
  const box = $('#toasts'); const t = document.createElement('div'); t.className = 'toast ' + tone; t.innerHTML = `${icon(ic, 22)}<span>${esc(text)}</span>`;
  box.appendChild(t); requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, ms);
}
window.addEventListener('eb:saved', () => toast('¡Guardado!', { ms: 1500 }));
window.addEventListener('eb:savefail', () => toast('No pudimos guardar. Lo intentaremos otra vez.', { tone: 'warn', icon: 'info', ms: 3500 }));

// ---------------------------------------------------------------- ventanas (modales)
let modalStack = [];
export function openModal(html, { dismissible = true, cls = '', labelledBy = 'm-title' } = {}) {
  const host = $('#overlay'); const back = document.createElement('div'); back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${cls}" role="dialog" aria-modal="true" aria-labelledby="${labelledBy}">${html}</div>`;
  const prevFocus = document.activeElement; host.appendChild(back);
  const box = back.firstElementChild;
  requestAnimationFrame(() => back.classList.add('in'));
  const api = {
    el: box, back,
    close(val) { back.classList.remove('in'); modalStack = modalStack.filter((m) => m !== api); setTimeout(() => back.remove(), 220); if (prevFocus && prevFocus.focus) try { prevFocus.focus(); } catch { /* ok */ } if (api.onClose) api.onClose(val); },
  };
  back.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dismissible) { e.stopPropagation(); api.close(null); }
    if (e.key === 'Tab') { // trampa de foco
      const f = $$('button:not([disabled]),input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])', box).filter((x) => x.offsetParent !== null);
      if (!f.length) return; const first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    }
  });
  if (dismissible) back.addEventListener('pointerdown', (e) => { if (e.target === back) api.close(null); });
  modalStack.push(api);
  setTimeout(() => { const f = $('[data-autofocus]', box) || $('button,input', box); if (f) f.focus(); }, 60);
  return api;
}

export function confirmDialog({ title, text, ok = 'Sí', cancel = 'No', tone = 'primary', icon: ic = 'info' }) {
  return new Promise((resolve) => {
    const m = openModal(`<div class="modal-icon ${tone}">${icon(ic, 34)}</div><h2 id="m-title">${esc(title)}</h2><p>${esc(text)}</p>
      <div class="row center"><button class="btn ghost" data-act="no">${esc(cancel)}</button><button class="btn ${tone === 'danger' ? 'warn' : 'primary'}" data-act="yes" data-autofocus>${esc(ok)}</button></div>`, { cls: 'small' });
    let done = false; const finish = (v) => { if (done) return; done = true; resolve(v); m.close(v); };
    m.el.querySelector('[data-act=yes]').onclick = () => { sfx('tap'); finish(true); };
    m.el.querySelector('[data-act=no]').onclick = () => { sfx('back'); finish(false); };
    m.onClose = () => { if (!done) { done = true; resolve(false); } };
  });
}
export const closeAllModals = () => [...modalStack].forEach((m) => m.close(null));

// ---------------------------------------------------------------- efectos de juego
function toGame(el) {
  const g = $('#game').getBoundingClientRect(); const r = el.getBoundingClientRect(); const k = g.width / 1280;
  return { x: (r.left - g.left + r.width / 2) / k, y: (r.top - g.top + r.height / 2) / k };
}
export function burst(target, { count = 26, colors = ['#FFD84D', '#FF8FA3', '#8EC5FF', '#8FE3C0', '#C3A6FF'], power = 1 } = {}) {
  if (settings.reduceMotion) return;
  const fx = $('#fx'); const p = target instanceof Element ? toGame(target) : target;
  for (let i = 0; i < count; i++) {
    const d = document.createElement('i'); d.className = 'conf';
    const a = Math.random() * Math.PI * 2, v = (120 + Math.random() * 260) * power;
    d.style.cssText = `left:${p.x}px;top:${p.y}px;background:${colors[i % colors.length]};--dx:${Math.cos(a) * v}px;--dy:${Math.sin(a) * v - 140}px;--rot:${Math.random() * 720 - 360}deg;--w:${6 + Math.random() * 8}px;animation-duration:${0.9 + Math.random() * 0.8}s`;
    fx.appendChild(d); setTimeout(() => d.remove(), 1900);
  }
}
export function rain(count = 70) { // lluvia de confeti desde arriba
  if (settings.reduceMotion) return; const fx = $('#fx');
  for (let i = 0; i < count; i++) {
    const d = document.createElement('i'); d.className = 'conf fall';
    d.style.cssText = `left:${Math.random() * 1280}px;top:-20px;background:${['#FFD84D', '#FF8FA3', '#8EC5FF', '#8FE3C0', '#C3A6FF'][i % 5]};--w:${7 + Math.random() * 8}px;--rot:${Math.random() * 900}deg;animation-duration:${2.2 + Math.random() * 2}s;animation-delay:${Math.random() * 0.9}s`;
    fx.appendChild(d); setTimeout(() => d.remove(), 5200);
  }
}
export function floatText(target, text, cls = '') {
  const fx = $('#fx'); const p = target instanceof Element ? toGame(target) : target;
  const d = document.createElement('div'); d.className = 'float-text ' + cls; d.textContent = text; d.style.left = p.x + 'px'; d.style.top = p.y + 'px';
  fx.appendChild(d); setTimeout(() => d.remove(), 1500);
}
export function countUp(el, to, ms = 900) {
  const t0 = performance.now(); const from = 0;
  const step = (t) => { const k = Math.min(1, (t - t0) / ms); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
export function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

// ---------------------------------------------------------------- barra superior (HUD)
// Siempre en el mismo lugar: izquierda = volver/inicio, derecha = música · ayuda · pausa (heurística H4).
let router = { go: () => {} };
export const setRouter = (r) => { router = r; };
let hudState = {};

export function hud(opts = {}) {
  hudState = opts; const el = $('#hud');
  if (opts.hidden) { el.innerHTML = ''; return; }
  const left = opts.left ? `<button class="hud-btn wide" id="hud-left" aria-label="${esc(opts.left.label)}">${icon(opts.left.icon || 'back', 26)}<span>${esc(opts.left.label)}</span></button>` : '<span></span>';
  const chips = opts.chips ? `<div class="chips">${S.progress ? `<div class="chip" title="Tus puntos">${icon('star', 22)}<b id="chip-points">${S.progress.points}</b><span class="sr">puntos</span></div><div class="chip fire" title="Días seguidos">${icon('flame', 22)}<b>${S.progress.streak || 1}</b><span class="sr">días seguidos</span></div>` : ''}</div>` : '';
  const right = opts.right === false ? '' : `<div class="hud-right">
      <button class="hud-btn" id="hud-music" aria-label="${settings.music ? 'Apagar la música' : 'Encender la música'}" aria-pressed="${settings.music}">${icon(settings.music ? 'music' : 'musicOff', 26)}</button>
      ${opts.help ? `<button class="hud-btn" id="hud-help" aria-label="Ayuda: cómo se juega">${icon('help', 28)}</button>` : ''}
      ${opts.pause ? `<button class="hud-btn" id="hud-pause" aria-label="Pausa">${icon('pause', 26)}</button>` : ''}
      ${opts.logout ? `<button class="hud-btn wide" id="hud-logout">${icon('logout', 24)}<span>Cerrar sesión</span></button>` : ''}
    </div>`;
  el.innerHTML = `<div class="hud-row"><div class="hud-l">${left}${chips}</div>${right}</div>`;
  const L = $('#hud-left'); if (L) L.onclick = () => { sfx('back'); opts.left.action(); };
  const M = $('#hud-music'); if (M) M.onclick = () => { setSetting('music', !settings.music); audio.unlock(); audio.applyVolumes(); sfx('toggle'); hud(hudState); };
  const Hp = $('#hud-help'); if (Hp) Hp.onclick = () => { sfx('tap'); openHelp(opts.help); };
  const Pz = $('#hud-pause'); if (Pz) Pz.onclick = () => { sfx('tap'); (opts.onPause || openPause)(); };
  const Lo = $('#hud-logout'); if (Lo) Lo.onclick = () => { sfx('back'); opts.logout(); };
}
export function refreshHudPoints() { const c = $('#chip-points'); if (c && S.progress) c.textContent = S.progress.points; }

// ---------------------------------------------------------------- ayuda "?" (siempre disponible)
export function openHelp(text) {
  const m = openModal(`<div class="modal-icon help">${icon('help', 34)}</div><h2 id="m-title">Ayuda</h2><p class="big">${esc(text)}</p>
    <div class="row center"><button class="btn primary" data-act="ok" data-autofocus>Entendido</button></div>`, { cls: 'small' });
  m.el.querySelector('[data-act=ok]').onclick = () => { sfx('tap'); m.close(); };
}

// ---------------------------------------------------------------- pausa (todas las pantallas del niño)
export function openPause() {
  const row = (key, label, ic) => `<label class="switch-row"><span class="sw-ic">${icon(ic, 26)}</span><span class="sw-l">${label}</span><input type="checkbox" role="switch" data-set="${key}" ${settings[key] ? 'checked' : ''}><span class="sw" aria-hidden="true"></span></label>`;
  const m = openModal(`<h2 id="m-title">Pausa</h2>
    <div class="switches">${row('music', 'Música', 'music')}${row('sfx', 'Sonidos', 'star')}</div>
    <label class="vol"><span>Volumen</span><input type="range" min="0.1" max="1" step="0.05" value="${settings.volume}" id="vol" aria-label="Volumen"></label>
    <p class="note">${icon('check', 18)} Tu avance se guarda solo.</p>
    <div class="row center"><button class="btn ghost" data-act="home">${icon('home', 22)} Ir al inicio</button><button class="btn primary" data-act="back" data-autofocus>${icon('play', 22)} Volver al juego</button></div>`, { cls: 'small' });
  m.el.querySelectorAll('[data-set]').forEach((inp) => inp.addEventListener('change', () => { setSetting(inp.dataset.set, inp.checked); audio.unlock(); audio.applyVolumes(); sfx('toggle'); hud(hudState); }));
  m.el.querySelector('#vol').addEventListener('input', (e) => { setSetting('volume', parseFloat(e.target.value)); audio.applyVolumes(); });
  m.el.querySelector('#vol').addEventListener('change', () => sfx('pop'));
  m.el.querySelector('[data-act=back]').onclick = () => { sfx('tap'); m.close(); };
  m.el.querySelector('[data-act=home]').onclick = async () => {
    const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Tu avance está guardado. Podrás continuar cuando quieras.', ok: 'Sí, salir', cancel: 'No, seguir jugando', icon: 'home' });
    if (ok) { m.close(); closeAllModals(); router.go('home'); }
  };
}
