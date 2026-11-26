// 07 Mapa "Tu aventura": avance horizontal por lugares (uno por emoción). Una sola etiqueta por lugar.
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, toast, confirmDialog, faceSvg, burst } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP, MODULES, TOTAL_MODULES, CHARACTERS, EMOTIONS } from '../content.js';
import { sceneSvg, GROUND_Y } from '../scenery.js';
import { S, hero, moduleDone, moduleStars, moduleUnlocked, currentModuleId, modulesDone, save, isUnlocked } from '../state.js';

const SEC_W = 900, OVERLAP = 120;           // ancho de cada lugar y solape entre fondos
const STEP = SEC_W - OVERLAP;
const THEMES = ['pradera', 'lago', 'volcan', 'cueva', 'arcoiris'];
const nodeX = (k) => 140 + k * STEP + SEC_W / 2 - 140;  // centro del lugar k (0..4)
const NODE_Y = 650;

export const map = {
  render(c) {
    scene('pradera');
    const cur = currentModuleId();
    const allDone = modulesDone() >= TOTAL_MODULES;
    const leave = async () => { const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Tu avance está guardado. Podrás continuar cuando quieras.', ok: 'Sí, salir', cancel: 'No, seguir', icon: 'home' }); if (ok) go('home'); };
    hud({ left: { label: 'Inicio', icon: 'home', action: leave }, chips: true, right: true, help: HELP.map, pause: true });

    const totalW = STEP * 4 + SEC_W;
    const sections = THEMES.map((t, k) => `<div class="map-sec" style="left:${k * STEP}px;width:${SEC_W}px">${sceneSvg(t)}</div>`).join('');

    // camino punteado entre los lugares
    let d = `M ${nodeX(0)} ${NODE_Y}`;
    for (let k = 1; k <= 4; k++) { const x0 = nodeX(k - 1), x1 = nodeX(k); d += ` C ${x0 + 200} ${NODE_Y + 36}, ${x1 - 200} ${NODE_Y - 36}, ${x1} ${NODE_Y}`; }

    const nodes = MODULES.map((m, k) => {
      const done = moduleDone(m.id), open = moduleUnlocked(m.id), isCur = m.id === cur && !allDone;
      const stars = moduleStars(m.id); const x = nodeX(k);
      const state = done ? 'done' : open ? 'open' : 'locked';
      const label = `${m.name}. ${done ? 'Completado, ' + stars + ' de 3 estrellas.' : open ? 'Toca para jugar.' : 'Bloqueado: termina el lugar anterior.'}`;
      return `
        <div class="node-wrap" style="left:${x}px">
          <div class="node-label ${state}"><b>${esc(m.name)}</b>
            <span class="node-sub">${done ? [1, 2, 3].map((s) => icon(s <= stars ? 'star' : 'starO', 18, s <= stars ? 'on' : '')).join('') : open ? '¡Toca para jugar!' : icon('lock', 16) + ' Bloqueado'}</span></div>
          <button class="node ${state} ${isCur ? 'current' : ''}" data-m="${m.id}" aria-label="${esc(label)}" style="--gem:${m.gem}">
            ${state === 'locked' ? icon('lock', 40) : done ? icon('check', 44) : faceSvg(m.emotion, 62, { bg: false })}
          </button>
        </div>
        ${actor({ char: m.companion, pose: done ? 'dance' : open ? 'wave' : 'idle', face: open ? '' : '', dir: 'left', x: x + 140, feet: 652, size: 175, locked: !isUnlocked(m.companion) && !done, label: CHARACTERS[m.companion].name })}`;
    }).join('');

    const fx = nodeX(4);
    const finale = `<div class="node-wrap" style="left:${fx}px"><div class="node-label ${allDone ? 'open' : 'locked'}"><b>Arcoíris de la Calma</b><span class="node-sub">${allDone ? '¡Toca para celebrar!' : icon('lock', 16) + ' Termina todos los lugares'}</span></div>
      <button class="node ${allDone ? 'open current' : 'locked'}" data-m="final" style="--gem:#8FE3C0" aria-label="Arcoíris de la Calma. ${allDone ? 'Toca para celebrar.' : 'Bloqueado.'}">${allDone ? faceSvg('tranquilo', 62, { bg: false }) : icon('lock', 40)}</button></div>
      ${actor({ char: 'coro', pose: 'idle', dir: 'left', x: fx + 140, feet: 652, size: 175, locked: !isUnlocked('coro'), label: 'Coro' })}`;

    const curX = cur && !allDone ? nodeX(cur - 1) : fx;
    c.innerHTML = `<section class="map" aria-label="Tu aventura">
      <div class="map-viewport" id="vp" tabindex="0" aria-label="Mapa de la aventura. Usa las flechas para moverte.">
        <div class="map-strip" id="strip" style="width:${totalW}px">
          ${sections}
          <svg class="map-path" width="${totalW}" height="720" viewBox="0 0 ${totalW} 720" aria-hidden="true"><path d="${d}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 22" opacity=".95"/></svg>
          ${nodes}${finale}
          ${actor({ char: hero(), pose: 'wave', face: 'happy', x: curX - 150, feet: 664, size: 200, dir: 'right', id: 'hero', label: 'Tú' })}
        </div>
      </div>
      <button class="map-arrow l" id="al" aria-label="Ir a la izquierda">${icon('back', 34)}</button>
      <button class="map-arrow r" id="ar" aria-label="Ir a la derecha">${icon('next', 34)}</button>
      <nav class="map-bar" aria-label="Más cosas para hacer">
        <button class="bar-btn" id="b-feel">${icon('face', 30)}<span>¿Cómo me siento?</span></button>
        <button class="bar-btn" id="b-ach">${icon('trophy', 30)}<span>Mis logros</span></button>
        <button class="bar-btn" id="b-chars">${icon('users', 30)}<span>Mis personajes</span></button>
      </nav>
      ${S.progress.seenMapHint ? '' : `<div class="map-hint bubble" id="hint"><p>Toca <b>${esc(MODULES[cur - 1].name)}</b> para empezar.</p></div>`}
    </section>`;

    const vp = $('#vp'); const maxScroll = totalW - 1280;
    const to = (x, smooth = true) => vp.scrollTo({ left: Math.max(0, Math.min(maxScroll, x - 640)), behavior: smooth && !document.body.classList.contains('reduce-motion') ? 'smooth' : 'auto' });
    to(curX, false);
    const upd = () => { $('#al').style.visibility = vp.scrollLeft > 20 ? 'visible' : 'hidden'; $('#ar').style.visibility = vp.scrollLeft < maxScroll - 20 ? 'visible' : 'hidden'; };
    vp.addEventListener('scroll', upd, { passive: true }); upd();
    $('#al').onclick = () => { sfx('tap'); to(vp.scrollLeft + 640 - STEP); };
    $('#ar').onclick = () => { sfx('tap'); to(vp.scrollLeft + 640 + STEP); };
    vp.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); vp.scrollBy({ left: 220, behavior: 'smooth' }); } if (e.key === 'ArrowLeft') { e.preventDefault(); vp.scrollBy({ left: -220, behavior: 'smooth' }); } });
    // arrastrar para mover el mapa
    let drag = null;
    vp.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; drag = { x: e.clientX, s: vp.scrollLeft }; vp.setPointerCapture(e.pointerId); vp.classList.add('grab'); });
    vp.addEventListener('pointermove', (e) => { if (drag) vp.scrollLeft = drag.s - (e.clientX - drag.x) / (($('#game').getBoundingClientRect().width) / 1280); });
    const end = () => { drag = null; vp.classList.remove('grab'); }; vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);

    const dismissHint = () => { const h = $('#hint'); if (h) { h.remove(); S.progress.seenMapHint = true; save({ quiet: true }); } };
    $$('.node').forEach((n) => n.onclick = () => {
      dismissHint();
      const id = n.dataset.m;
      if (n.classList.contains('locked')) {
        sfx('error'); n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake');
        const msg = id === 'final' ? 'Termina todos los lugares para llegar al arcoíris.' : `Primero termina ${MODULES[parseInt(id, 10) - 2].name}.`;
        toast(msg, { icon: 'lock', tone: 'warn', ms: 2800 });  return;
      }
      sfx('pop'); burst(n, { count: 14, power: 0.5 });
      if (id === 'final') go('finale'); else go('loading', { module: parseInt(id, 10) });
    });
    $('#b-feel').onclick = () => { sfx('pop'); go('checkin'); };
    $('#b-ach').onclick = () => { sfx('pop'); go('achievements'); };
    $('#b-chars').onclick = () => { sfx('pop'); go('characters'); };
  },
};
