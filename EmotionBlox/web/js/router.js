// Enrutador simple: cada pantalla es un módulo con render(contenedor, parámetros) -> (limpieza opcional)
import { $, wait, hud, closeAllModals, setRouter } from './ui.js';
import { audio, sfx } from './audio.js';
import { setScene, sceneMood } from './scenery.js';

const registry = {};
let cleanup = null, token = 0;
export const register = (name, mod) => { registry[name] = mod; };
export const currentScreen = () => document.body.dataset.screen;

export async function go(name, params = {}, { quick = false } = {}) {
  const mod = registry[name]; if (!mod) { console.error('Pantalla desconocida', name); return; }
  const my = ++token; const sc = $('#screen');
  closeAllModals();
  if (!quick) { sc.classList.add('leaving'); sfx('whoosh'); await wait(190); }
  if (my !== token) return;
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  sc.innerHTML = ''; sc.scrollTop = 0; sc.className = 'entering';
  document.body.dataset.screen = name;
  hud({ hidden: true });
  try {
    const res = await mod.render(sc, params);
    if (my !== token) { if (typeof res === 'function') res(); return; }
    cleanup = typeof res === 'function' ? res : null;
  } catch (e) { console.error(e); sc.innerHTML = `<div class="fatal"><h2>Ups, algo salió mal</h2><p>Vuelve al inicio e inténtalo otra vez.</p><button class="btn primary" id="fatal-home">Ir al inicio</button></div>`; const b = $('#fatal-home'); if (b) b.onclick = () => go('home'); }
  requestAnimationFrame(() => requestAnimationFrame(() => sc.classList.remove('entering')));
  try { sc.focus({ preventScroll: true }); } catch { /* ok */ }
}
setRouter({ go });

// Cambia el fondo y la música a la vez.
export function scene(name, opts) { setScene(name, opts); audio.setMood(sceneMood(name)); }
