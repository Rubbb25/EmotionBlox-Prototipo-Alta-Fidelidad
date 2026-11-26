// Personajes de bloques en 3D (Three.js). Todos son ORIGINALES: cabeza, torso, brazos y piernas
// cuadrados y brillantes, con caras expresivas dibujadas en un canvas.
// Para cambiar un personaje: edita los colores en content.js (CHARACTERS) o el modelo en buildCharacter().
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';

export const CHAR_HEIGHT = 3.75; // altura aproximada (para encuadrar la cámara)

// ---------------------------------------------------------------- caras (canvas 2D)
const INK = '#2B2440';
function faceCanvas() { const c = document.createElement('canvas'); c.width = 256; c.height = 232; return c; }

export function drawFace(ctx, expr, blink = false) {
  const W = 256, H = 232; ctx.clearRect(0, 0, W, H);
  const ex = 52, ey = 92; // separación y altura de los ojos
  const eye = (x, rx = 16, ry = 22, pupil = 1) => {
    if (blink) { ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x - rx, ey + 4); ctx.quadraticCurveTo(x, ey + 12, x + rx, ey + 4); ctx.stroke(); return; }
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x, ey, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - rx * 0.3, ey - ry * 0.35, Math.max(4, rx * 0.32) * pupil, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + rx * 0.35, ey + ry * 0.35, Math.max(2.5, rx * 0.16), 0, Math.PI * 2); ctx.fill();
  };
  const brow = (x1, y1, x2, y2, w = 9) => { ctx.strokeStyle = INK; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); };
  const blush = (a = 0.5, col = '255,130,150') => { ctx.fillStyle = `rgba(${col},${a})`; [[-ex - 30, 140], [ex + 30, 140]].forEach(([dx, y]) => { ctx.beginPath(); ctx.ellipse(W / 2 + dx, y, 20, 12, 0, 0, Math.PI * 2); ctx.fill(); }); };
  const L = W / 2 - ex, R = W / 2 + ex, cx = W / 2;
  ctx.lineJoin = 'round';

  switch (expr) {
    case 'happy': {
      eye(L); eye(R); blush(0.55);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(cx - 40, 138); ctx.quadraticCurveTo(cx, 138, cx + 40, 138); ctx.quadraticCurveTo(cx + 34, 190, cx, 190); ctx.quadraticCurveTo(cx - 34, 190, cx - 40, 138); ctx.fill();
      ctx.fillStyle = '#FF7B93'; ctx.beginPath(); ctx.ellipse(cx, 178, 18, 9, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'cheer': {
      eye(L, 17, 24); eye(R, 17, 24); blush(0.6);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(cx, 160, 38, 32, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#FF7B93'; ctx.beginPath(); ctx.ellipse(cx, 180, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    case 'sad': {
      eye(L, 15, 20); eye(R, 15, 20);
      brow(L - 22, ey - 32, L + 14, ey - 46); brow(R + 22, ey - 32, R - 14, ey - 46);
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 32, 182); ctx.quadraticCurveTo(cx, 150, cx + 32, 182); ctx.stroke();
      ctx.fillStyle = '#7DC4FF'; ctx.beginPath(); ctx.moveTo(L - 4, ey + 28); ctx.quadraticCurveTo(L - 22, ey + 62, L - 4, ey + 70); ctx.quadraticCurveTo(L + 14, ey + 62, L - 4, ey + 28); ctx.fill();
      break;
    }
    case 'angry': {
      eye(L, 15, 15); eye(R, 15, 15);
      brow(L - 26, ey - 36, L + 20, ey - 18, 12); brow(R + 26, ey - 36, R - 20, ey - 18, 12);
      blush(0.55, '255,90,90');
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 36, 184); ctx.lineTo(cx - 18, 168); ctx.lineTo(cx + 18, 168); ctx.lineTo(cx + 36, 184); ctx.stroke();
      break;
    }
    case 'scared': {
      eye(L, 21, 28, 1.2); eye(R, 21, 28, 1.2);
      brow(L - 22, ey - 44, L + 18, ey - 52, 8); brow(R + 22, ey - 44, R - 18, ey - 52, 8);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(cx, 172, 16, 22, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7DC4FF'; ctx.beginPath(); ctx.moveTo(W - 34, 44); ctx.quadraticCurveTo(W - 52, 80, W - 34, 86); ctx.quadraticCurveTo(W - 16, 80, W - 34, 44); ctx.fill();
      break;
    }
    case 'calm': {
      ctx.strokeStyle = INK; ctx.lineWidth = 9; ctx.lineCap = 'round';
      [L, R].forEach((x) => { ctx.beginPath(); ctx.arc(x, ey + 6, 16, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); });
      blush(0.45, '255,150,170');
      ctx.beginPath(); ctx.moveTo(cx - 24, 160); ctx.quadraticCurveTo(cx, 184, cx + 24, 160); ctx.stroke();
      break;
    }
    case 'surprised': {
      eye(L, 18, 25); eye(R, 18, 25);
      brow(L - 20, ey - 42, L + 18, ey - 46, 8); brow(R + 20, ey - 42, R - 18, ey - 46, 8);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(cx, 170, 20, 24, 0, 0, Math.PI * 2); ctx.fill();
      break;
    }
    default: { // neutral
      eye(L); eye(R);
      ctx.strokeStyle = INK; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx - 24, 170); ctx.quadraticCurveTo(cx, 178, cx + 24, 170); ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------- emblemas del pecho
function emblemTexture(kind, color) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = color; x.strokeStyle = color; x.lineJoin = 'round'; x.lineCap = 'round'; x.translate(64, 64);
  const star = (R, r, n = 5) => { x.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (Math.PI / n) * i - Math.PI / 2; const rad = i % 2 ? r : R; x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } x.closePath(); x.fill(); };
  switch (kind) {
    case 'star': star(46, 20); break;
    case 'sun': x.beginPath(); x.arc(0, 0, 22, 0, 7); x.fill(); x.lineWidth = 8; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(Math.cos(a) * 34, Math.sin(a) * 34); x.lineTo(Math.cos(a) * 50, Math.sin(a) * 50); x.stroke(); } break;
    case 'drop': x.beginPath(); x.moveTo(0, -46); x.quadraticCurveTo(40, 4, 0, 40); x.quadraticCurveTo(-40, 4, 0, -46); x.fill(); break;
    case 'flame': x.beginPath(); x.moveTo(0, -48); x.quadraticCurveTo(44, -4, 22, 34); x.quadraticCurveTo(0, 50, -22, 34); x.quadraticCurveTo(-40, 6, -8, -14); x.quadraticCurveTo(-4, -32, 0, -48); x.fill(); break;
    case 'moon': x.beginPath(); x.arc(0, 0, 40, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(20, -8, 36, 0, 7); x.fill(); break;
    case 'leaf': x.beginPath(); x.moveTo(-40, 40); x.quadraticCurveTo(-46, -40, 40, -44); x.quadraticCurveTo(46, 40, -40, 40); x.fill(); break;
    case 'gear': x.beginPath(); x.arc(0, 0, 28, 0, 7); x.fill(); for (let i = 0; i < 8; i++) { x.save(); x.rotate(i * Math.PI / 4); x.fillRect(-8, -48, 16, 20); x.restore(); } x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(0, 0, 11, 0, 7); x.fill(); break;
    case 'crown': x.beginPath(); x.moveTo(-42, 30); x.lineTo(-48, -26); x.lineTo(-20, 0); x.lineTo(0, -38); x.lineTo(20, 0); x.lineTo(48, -26); x.lineTo(42, 30); x.closePath(); x.fill(); break;
    default: star(46, 20);
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

let shadowTex = null;
function blobShadowTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(40,30,70,0.55)'); g.addColorStop(1, 'rgba(40,30,70,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); shadowTex = new THREE.CanvasTexture(c); return shadowTex;
}

// ---------------------------------------------------------------- modelo
const mat = (color, rough = 0.36, metal = 0) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
const rbox = (w, h, d, r = 0.12) => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
const shade = (hex, f) => { const c = new THREE.Color(hex); c.multiplyScalar(f); return c; };

function addAccessory(kind, head, cfg) {
  const g = new THREE.Group(); const top = 0.47 + 0.0; // parte alta de la cabeza (pivote en el cuello)
  const add = (geo, m, x, y, z, s) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (s) me.scale.set(...s); g.add(me); return me; };
  const accent = cfg.accent;
  switch (kind) {
    case 'cap': {
      add(rbox(1.06, 0.34, 0.98, 0.16), mat(accent), 0, 0.95, -0.02);
      add(rbox(0.92, 0.07, 0.5, 0.03), mat(shade(accent, 0.85)), 0, 0.82, 0.62);
      add(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12), mat('#FF8FA3'), 0, 1.15, 0);
      break;
    }
    case 'sprout': {
      add(new THREE.CylinderGeometry(0.05, 0.06, 0.42, 8), mat('#4FB36A'), 0, 1.12, 0);
      add(new THREE.SphereGeometry(0.22, 16, 12), mat(accent), -0.2, 1.36, 0, [1.2, 0.6, 0.8]).rotation.z = 0.5;
      add(new THREE.SphereGeometry(0.22, 16, 12), mat(accent), 0.2, 1.36, 0, [1.2, 0.6, 0.8]).rotation.z = -0.5;
      break;
    }
    case 'cloud': {
      const m = mat('#FFFFFF', 0.6);
      [[0, 1.12, 0, 0.3], [-0.26, 1.04, 0, 0.23], [0.26, 1.04, 0, 0.23], [-0.1, 1.28, 0, 0.2], [0.14, 1.26, 0, 0.18]].forEach(([x, y, z, r]) => add(new THREE.SphereGeometry(r, 16, 12), m, x, y, z));
      add(new THREE.SphereGeometry(0.07, 10, 8), mat('#7DB5F5'), 0.34, 0.74, 0.1, [0.8, 1.3, 0.8]);
      break;
    }
    case 'flame': {
      const cols = ['#FF7A45', '#FFB037', '#FF7A45'];
      [[-0.26, 0.28, 0.9], [0, 0.4, 1.15], [0.26, 0.28, 0.9]].forEach(([x, hh, y], i) => { const m = add(new THREE.ConeGeometry(0.17, 0.5 + hh, 12), mat(cols[i], 0.5), x, y, 0); m.rotation.z = (x ? -x * 0.4 : 0); });
      break;
    }
    case 'ears': {
      const m = mat(shade(cfg.torso, 0.8));
      [-1, 1].forEach((s) => { const c = add(new THREE.ConeGeometry(0.2, 0.5, 4), m, s * 0.34, 1.12, 0, [1, 1, 0.7]); c.rotation.z = -s * 0.2; });
      break;
    }
    case 'leaf': {
      const m = mat('#4FB36A');
      [[-0.2, 0.6], [0.2, -0.6]].forEach(([x, r]) => { const l = add(new THREE.SphereGeometry(0.24, 14, 10), m, x, 1.15, 0, [0.6, 1.5, 0.35]); l.rotation.z = r; });
      break;
    }
    case 'antenna': {
      add(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 8), mat('#6F86A0', 0.3, 0.4), 0, 1.1, 0);
      add(new THREE.SphereGeometry(0.13, 14, 10), new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.6, roughness: 0.3 }), 0, 1.36, 0);
      break;
    }
    case 'crown': {
      const m = mat('#FFD54A', 0.25, 0.55);
      add(new THREE.CylinderGeometry(0.4, 0.44, 0.22, 5), m, 0, 0.98, 0);
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; add(new THREE.ConeGeometry(0.1, 0.28, 6), m, Math.cos(a) * 0.4, 1.2, Math.sin(a) * 0.4); }
      add(new THREE.SphereGeometry(0.08, 10, 8), mat('#FF5C7A', 0.2), 0, 1.0, 0.44);
      break;
    }
    default: break;
  }
  head.add(g);
  return g;
}

export function buildCharacter(cfg) {
  const root = new THREE.Group();
  const rig = new THREE.Group(); root.add(rig);
  const skin = mat(cfg.skin, 0.42), torsoM = mat(cfg.torso), legsM = mat(cfg.legs), shoeM = mat(shade(cfg.legs, 0.62));

  // sombra de contacto (blob)
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.3), new THREE.MeshBasicMaterial({ map: blobShadowTexture(), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.02; root.add(shadow);

  // piernas (pivote en la cadera)
  const legs = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 0.27, 0.98, 0);
    const leg = new THREE.Mesh(rbox(0.5, 0.78, 0.52, 0.1), legsM); leg.position.y = -0.39; p.add(leg);
    const shoe = new THREE.Mesh(rbox(0.54, 0.22, 0.7, 0.1), shoeM); shoe.position.set(0, -0.87, 0.07); p.add(shoe);
    rig.add(p); return p;
  });

  // torso
  const torso = new THREE.Group(); torso.position.y = 0.98; rig.add(torso);
  const tb = new THREE.Mesh(rbox(1.12, 1.18, 0.66, 0.14), torsoM); tb.position.y = 0.59; torso.add(tb);
  const belt = new THREE.Mesh(rbox(1.14, 0.14, 0.68, 0.05), mat(shade(cfg.torso, 0.72))); belt.position.y = 0.1; torso.add(belt);
  const emb = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: emblemTexture(cfg.emblem, cfg.accent), transparent: true }));
  emb.position.set(0, 0.68, 0.335); torso.add(emb);

  // brazos (pivote en el hombro)
  const arms = [-1, 1].map((s) => {
    const p = new THREE.Group(); p.position.set(s * 0.77, 1.04, 0);
    const sleeve = new THREE.Mesh(rbox(0.4, 0.78, 0.44, 0.1), torsoM); sleeve.position.y = -0.34; p.add(sleeve);
    const hand = new THREE.Mesh(rbox(0.36, 0.3, 0.4, 0.1), skin); hand.position.y = -0.84; p.add(hand);
    torso.add(p); return p;
  });

  // cabeza
  const neck = new THREE.Group(); neck.position.y = 1.22; torso.add(neck);
  const hb = new THREE.Mesh(rbox(1.06, 0.98, 0.94, 0.26), skin); hb.position.y = 0.5; neck.add(hb);
  const fc = faceCanvas(); const fctx = fc.getContext('2d');
  const ftex = new THREE.CanvasTexture(fc); ftex.colorSpace = THREE.SRGBColorSpace; ftex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.8), new THREE.MeshBasicMaterial({ map: ftex, transparent: true }));
  face.position.set(0, 0.5, 0.475); neck.add(face);
  const headPivot = new THREE.Group(); headPivot.position.y = 0; // los accesorios se colocan relativos al centro de la cabeza
  const accHolder = new THREE.Group(); accHolder.position.set(0, 0.5 - 0.5, 0); neck.add(accHolder);
  addAccessory(cfg.acc, accHolder, cfg);

  root.userData = { rig, torso, legs, arms, neck, face, fctx, ftex };
  return root;
}

// ---------------------------------------------------------------- poses (animación procedural)
// Cada pose devuelve el "objetivo" de cada articulación en el instante t. Ángulos en radianes.
// arm: [adelante(-)/atrás(+), levantar hacia afuera]; leg: balanceo; head: [pitch, yaw, roll]
const S = Math.sin, C = Math.cos, PI = Math.PI;
const POSES = {
  idle: (t) => ({ aL: [S(t * 1.6) * 0.07, 0.08], aR: [-S(t * 1.6) * 0.07, 0.08], lL: 0, lR: 0, head: [0, 0, S(t * 0.9) * 0.03], y: S(t * 2.2) * 0.02, sq: 1 + S(t * 2.2) * 0.008, lean: 0, spin: 0, face: 'happy' }),
  wave: (t) => ({ aL: [0, 0.08], aR: [0, 2.55 + S(t * 9) * 0.3], lL: 0, lR: 0, head: [0, 0, 0.07 + S(t * 2) * 0.03], y: Math.abs(S(t * 3)) * 0.04, sq: 1, lean: 0, spin: 0, face: 'happy' }),
  jump: (t) => { const p = Math.abs(S(t * 3.4)); return { aL: [-0.4, 0.4 + p * 1.8], aR: [-0.4, 0.4 + p * 1.8], lL: -p * 0.5, lR: p * 0.3, head: [-0.1 * p, 0, 0], y: p * 1.0, sq: 1 - (1 - p) * 0.1, lean: 0, spin: 0, face: 'cheer' }; },
  celebrate: (t) => { const p = Math.abs(S(t * 4.2)); return { aL: [0, 2.7 + S(t * 8.4) * 0.35], aR: [0, 2.7 - S(t * 8.4) * 0.35], lL: S(t * 4.2) * 0.35, lR: -S(t * 4.2) * 0.35, head: [-0.12, S(t * 2.1) * 0.25, S(t * 4.2) * 0.1], y: p * 0.75, sq: 1 - (1 - p) * 0.12, lean: 0, spin: S(t * 2.1) * 0.5, face: 'cheer' }; },
  walk: (t) => ({ aL: [S(t * 6) * 0.9, 0.1], aR: [-S(t * 6) * 0.9, 0.1], lL: -S(t * 6) * 0.8, lR: S(t * 6) * 0.8, head: [0, 0, 0], y: Math.abs(S(t * 6)) * 0.1, sq: 1, lean: 0.04, spin: 0, face: 'happy' }),
  sad: (t) => ({ aL: [-0.15, 0.05], aR: [-0.15, 0.05], lL: 0, lR: 0, head: [0.5 + S(t * 1.1) * 0.04, 0, S(t * 0.7) * 0.05], y: -0.03, sq: 0.97, lean: 0.12, spin: 0, face: 'sad' }),
  angry: (t) => ({ aL: [-0.5, 0.35], aR: [-0.5, 0.35], lL: S(t * 5) > 0.7 ? -0.5 : 0, lR: S(t * 5 + 1.6) > 0.7 ? -0.5 : 0, head: [0.15, S(t * 36) * 0.03, 0], y: Math.abs(S(t * 5)) * 0.05, sq: 1, lean: 0.05 + S(t * 38) * 0.015, spin: 0, face: 'angry' }),
  scared: (t) => ({ aL: [-1.35 + S(t * 28) * 0.06, 0.45], aR: [-1.35 - S(t * 28) * 0.06, 0.45], lL: 0.1, lR: -0.1, head: [-0.12, S(t * 26) * 0.04, 0], y: S(t * 30) * 0.015, sq: 0.97, lean: -0.12, spin: S(t * 27) * 0.04, face: 'scared' }),
  think: (t) => ({ aL: [0, 0.08], aR: [-2.1, 0.4], lL: 0, lR: 0, head: [-0.12, 0.25, 0.14 + S(t) * 0.02], y: 0, sq: 1, lean: 0, spin: 0, face: 'neutral' }),
  dance: (t) => ({ aL: [S(t * 4) * 0.5, 1.4 + S(t * 4) * 0.6], aR: [-S(t * 4) * 0.5, 1.4 - S(t * 4) * 0.6], lL: S(t * 4) * 0.4, lR: -S(t * 4) * 0.4, head: [0, S(t * 2) * 0.3, S(t * 4) * 0.12], y: Math.abs(S(t * 4)) * 0.3, sq: 1, lean: S(t * 2) * 0.1, spin: S(t * 2) * 0.6, face: 'cheer' }),
  cheer: (t) => POSES.celebrate(t),
  calm: (t) => ({ aL: [-0.1, 0.5 + S(t * 0.8) * 0.15], aR: [-0.1, 0.5 + S(t * 0.8) * 0.15], lL: 0, lR: 0, head: [0.05, 0, 0], y: S(t * 0.8) * 0.04, sq: 1 + S(t * 0.8) * 0.02, lean: 0, spin: 0, face: 'calm' }),
};

const lerp = (a, b, k) => a + (b - a) * k;

export class Blocky {
  constructor(cfg) {
    this.cfg = cfg; this.group = buildCharacter(cfg); this.ud = this.group.userData;
    this.pose = 'idle'; this.faceOverride = null; this.t = Math.random() * 10; this.blinkAt = 1 + Math.random() * 3; this.blinkEnd = 0;
    this.cur = { aL: [0, 0], aR: [0, 0], lL: 0, lR: 0, head: [0, 0, 0], y: 0, sq: 1, lean: 0, spin: 0 };
    this.faceKey = ''; this.dirYaw = 0.5; this.look = { x: 0, y: 0 }; this.bounce = 0; this.silhouette = false;
  }

  setSilhouette(on) {
    if (on === this.silhouette) return; this.silhouette = on;
    this.group.traverse((o) => {
      if (!o.isMesh || o.geometry.type === 'PlaneGeometry') return;
      if (!o.userData.orig) o.userData.orig = o.material;
      o.material = on ? new THREE.MeshBasicMaterial({ color: '#4A4468' }) : o.userData.orig;
    });
    this.ud.face.visible = !on;
  }

  // reacción al tocar al personaje
  poke() { this.bounce = 1; }

  update(dt, pointer) {
    this.t += dt; const t = this.t; const ud = this.ud;
    const P = (POSES[this.pose] || POSES.idle)(t);
    const k = 1 - Math.exp(-dt * 12);
    const c = this.cur;
    c.aL[0] = lerp(c.aL[0], P.aL[0], k); c.aL[1] = lerp(c.aL[1], P.aL[1], k);
    c.aR[0] = lerp(c.aR[0], P.aR[0], k); c.aR[1] = lerp(c.aR[1], P.aR[1], k);
    c.lL = lerp(c.lL, P.lL, k); c.lR = lerp(c.lR, P.lR, k);
    for (let i = 0; i < 3; i++) c.head[i] = lerp(c.head[i], P.head[i], k);
    c.y = lerp(c.y, P.y, k); c.sq = lerp(c.sq, P.sq, k); c.lean = lerp(c.lean, P.lean, k); c.spin = lerp(c.spin, P.spin, k);

    // salto al tocar
    let pokeY = 0, pokeArms = 0;
    if (this.bounce > 0) { this.bounce = Math.max(0, this.bounce - dt * 1.6); const b = Math.sin((1 - this.bounce) * Math.PI); pokeY = b * 0.9; pokeArms = b * 1.6; }

    // articulaciones: brazo izquierdo (x<0) y derecho (x>0). z: positivo separa el derecho, negativo el izquierdo
    ud.arms[0].rotation.set(c.aL[0], 0, -(c.aL[1] + pokeArms));
    ud.arms[1].rotation.set(c.aR[0], 0, c.aR[1] + pokeArms);
    ud.legs[0].rotation.x = c.lL; ud.legs[1].rotation.x = c.lR;

    // cabeza: sigue el puntero con suavidad
    const lx = pointer ? pointer.x : 0, ly = pointer ? pointer.y : 0;
    this.look.x = lerp(this.look.x, lx, 1 - Math.exp(-dt * 6)); this.look.y = lerp(this.look.y, ly, 1 - Math.exp(-dt * 6));
    ud.neck.rotation.set(c.head[0] + this.look.y * 0.25, c.head[1] + this.look.x * 0.5 - this.dirYaw * 0.25, c.head[2]);

    // cuerpo
    ud.rig.position.y = c.y + pokeY; ud.rig.scale.set(1 / Math.sqrt(c.sq), c.sq, 1 / Math.sqrt(c.sq));
    ud.torso.rotation.x = c.lean; ud.rig.rotation.y = this.dirYaw + c.spin;
    const h = Math.max(0, c.y + pokeY);
    const s = 1 - Math.min(0.5, h * 0.35); this.group.children[1].scale.set(s, s, s); // sombra
    this.group.children[1].material.opacity = 1 - Math.min(0.6, h * 0.5);

    // cara (parpadeo + expresión de la pose)
    if (t > this.blinkAt) { this.blinkEnd = t + 0.13; this.blinkAt = t + 2 + Math.random() * 3.5; }
    const blink = t < this.blinkEnd;
    const expr = this.faceOverride || P.face;
    const key = expr + (blink ? 'b' : '');
    if (key !== this.faceKey) { drawFace(ud.fctx, expr, blink && expr !== 'calm'); ud.ftex.needsUpdate = true; this.faceKey = key; }
  }
}

export { THREE };
