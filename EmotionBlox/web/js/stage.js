// Escenario 3D compartido: UN solo canvas que dibuja a cada personaje dentro del rectángulo
// de su elemento HTML  <div class="actor" data-char="bloki" data-pose="wave" data-face="happy">.
// Así las pantallas solo declaran dónde va cada personaje y qué hace.
import { THREE, Blocky, CHAR_HEIGHT } from './characters3d.js';
import { CHARACTERS } from './content.js';
import { sfx } from './audio.js';
import { settings } from './state.js';

const W = 1280, H = 720;
let renderer, game, canvas, scene, cam, running = false, last = 0;
const actors = new Map(); // elemento -> { ch, id }
const pointer = { x: 0, y: 0, cx: -1, cy: -1 };
let ok = true;

export function initStage() {
  game = document.getElementById('game'); canvas = document.getElementById('stage');
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { ok = false; document.body.classList.add('no-webgl'); return; }
  renderer.setClearColor(0x000000, 0); renderer.setScissorTest(true);
  renderer.autoClear = false; // se limpia a mano: así los recuadros solapados no se borran entre sí
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0xbfd3ff, 1.25));
  const sun = new THREE.DirectionalLight(0xffffff, 2.1); sun.position.set(2.5, 5, 4); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xbfe3ff, 0.9); rim.position.set(-4, 2, -3); scene.add(rim);
  cam = new THREE.PerspectiveCamera(26, 1, 0.1, 60);
  window.addEventListener('pointermove', (e) => { pointer.cx = e.clientX; pointer.cy = e.clientY; }, { passive: true });
  document.addEventListener('click', (e) => {
    const el = e.target.closest && e.target.closest('.actor');
    if (!el) return; const a = actors.get(el); if (!a) return;
    a.ch.poke(); sfx(Math.random() < 0.5 ? 'giggle' : 'jump');
  });
  resize(); window.addEventListener('resize', resize);
  running = true; requestAnimationFrame(frame);
}

export function resize() {
  if (!renderer) return;
  const r = game.getBoundingClientRect(); const k = r.width / W || 1;
  renderer.setPixelRatio(Math.min(2.5, (window.devicePixelRatio || 1) * k));
  renderer.setSize(W, H, false); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
}

function ensureActor(el) {
  let a = actors.get(el);
  const id = el.dataset.char || 'bloki';
  if (a && a.id === id) return a;
  if (a) scene.remove(a.ch.group);
  const cfg = CHARACTERS[id] || CHARACTERS.bloki;
  const ch = new Blocky(cfg); scene.add(ch.group); ch.group.visible = false;
  a = { ch, id }; actors.set(el, a); return a;
}

function frame(now) {
  if (!running) return;
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
  const gr = game.getBoundingClientRect(); const k = gr.width / W || 1;
  const els = document.querySelectorAll('#screen .actor, #overlay .actor');
  // quitar los que ya no están en pantalla
  for (const [el, a] of actors) if (!el.isConnected) { scene.remove(a.ch.group); actors.delete(el); }
  renderer.setScissor(0, 0, W, H); renderer.setViewport(0, 0, W, H); renderer.clear();
  if (document.hidden) return;
  const list = [];
  els.forEach((el) => {
    const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const x = (r.left - gr.left) / k, y = (r.top - gr.top) / k, w = r.width / k, h = r.height / k;
    if (x + w < 0 || x > W || y + h < 0 || y > H) return;
    const a = ensureActor(el); const ch = a.ch;
    const d = el.dataset;
    ch.pose = d.pose || 'idle'; ch.faceOverride = d.face || null;
    ch.dirYaw = d.dir === 'left' ? -0.55 : d.dir === 'front' ? 0 : 0.55;
    ch.setSilhouette(d.locked === '1');
    if (d.spin === '1' && !ch.dragging) ch.dirYaw = Math.sin(ch.t * 0.7) * 0.9;
    const cx = (r.left + r.width / 2), cy = (r.top + r.height * 0.3);
    const p = pointer.cx < 0 ? null : { x: Math.max(-1, Math.min(1, (pointer.cx - cx) / 500)), y: Math.max(-1, Math.min(1, (pointer.cy - cy) / 400)) };
    ch.update(settings.reduceMotion ? dt * 0.4 : dt, d.locked === '1' ? null : p);
    list.push({ ch, x, y, w, h, scale: parseFloat(d.scale || '1') });
  });
  actors.forEach((a) => { a.ch.group.visible = false; });
  for (const it of list) {
    it.ch.group.visible = true;
    // encuadre: los pies a ~6 % del borde inferior y la altura total ocupa ~80 % del recuadro
    const frameH = (CHAR_HEIGHT * 1.22) / it.scale;
    const dist = (frameH / 2) / Math.tan((cam.fov * Math.PI / 180) / 2);
    cam.aspect = it.w / it.h; cam.position.set(0, frameH * 0.44, dist); cam.lookAt(0, frameH * 0.44, 0);
    cam.updateProjectionMatrix();
    renderer.setViewport(it.x, H - (it.y + it.h), it.w, it.h); renderer.setScissor(it.x, H - (it.y + it.h), it.w, it.h);
    // solo este personaje visible en esta pasada
    actors.forEach((a) => { a.ch.group.visible = a.ch === it.ch; });
    renderer.clearDepth();
    renderer.render(scene, cam);
  }
}
