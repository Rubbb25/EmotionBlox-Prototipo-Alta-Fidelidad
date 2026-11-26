// 03-06 Introducción: cuatro escenas con texto, con Anterior / Siguiente / Saltar.
import { go, scene } from '../router.js';
import { $, esc, fill, hud, icon, faceSvg, confirmDialog } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP, INTRO_PANELS, EMOTIONS, MODULE_EMOTIONS } from '../content.js';
import { S, save, hero } from '../state.js';

export const intro = {
  render(c) {
    let i = 0;
    const leave = async () => { const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Tu avance está guardado. Podrás continuar cuando quieras.', ok: 'Sí, salir', cancel: 'No, seguir', icon: 'home' }); if (ok) go('home'); };
    hud({ left: { label: 'Inicio', icon: 'home', action: leave }, right: true, help: HELP.intro, pause: true });

    const finish = async () => { S.progress.seenIntro = true; sfx('pop'); save({ quiet: true }); go('map'); };

    function draw(dir = 1) {
      const p = INTRO_PANELS[i]; const text = fill(p.text); const last = i === INTRO_PANELS.length - 1;
      scene(p.scene, { dim: !!p.dim });
      const h = hero();
      c.innerHTML = `<section class="intro" aria-label="Historia, escena ${i + 1} de ${INTRO_PANELS.length}">
        <div class="bubble narr ${dir > 0 ? 'in-r' : 'in-l'}" aria-live="polite"><p>${esc(text)}</p></div>
        ${p.showEmotions ? `<div class="emo-float" aria-hidden="true">${MODULE_EMOTIONS.map((e, k) => `<div class="emo-pop" style="--k:${k}">${faceSvg(e, 92)}<span style="color:${EMOTIONS[e].ink};background:${EMOTIONS[e].bg}">${EMOTIONS[e].label}</span></div>`).join('')}</div>` : ''}
        ${actor({ char: h, pose: p.pose, face: p.face, x: p.showEmotions ? 250 : 430, feet: 668, size: p.showEmotions ? 340 : 390, label: 'Bloki' })}
        ${i === 3 ? actor({ char: 'soli', pose: 'celebrate', x: 720, feet: 640, size: 220, dir: 'left', label: 'Soli' }) + actor({ char: 'nami', pose: 'dance', x: 880, feet: 650, size: 230, dir: 'left', label: 'Nami' }) + actor({ char: 'brasa', pose: 'jump', x: 1030, feet: 640, size: 220, dir: 'left', label: 'Brasa' }) + actor({ char: 'luma', pose: 'wave', x: 1160, feet: 650, size: 220, dir: 'left', label: 'Luma' }) : ''}
        <div class="intro-bar">
          <div class="intro-l">${i > 0 ? `<button class="btn ghost" id="prev">${icon('back', 24)} Anterior</button>` : '<span></span>'}</div>
          <ol class="dots" aria-label="Progreso de la historia">${INTRO_PANELS.map((_, k) => `<li class="${k === i ? 'on' : k < i ? 'done' : ''}"><span class="sr">Escena ${k + 1}</span></li>`).join('')}</ol>
          <div class="intro-r">${!last ? `<button class="btn ghost" id="skip">Saltar</button>` : ''}<button class="btn primary big" id="next">${last ? '¡Empezar!' : 'Siguiente'} ${last ? icon('star', 26) : icon('next', 26)}</button></div>
        </div></section>`;
      
      const pv = $('#prev'); if (pv) pv.onclick = () => { sfx('back'); i--; draw(-1); };
      $('#next').onclick = () => { if (last) finish(); else { sfx('pop'); i++; draw(1); } };
      const sk = $('#skip'); if (sk) sk.onclick = () => { sfx('tap'); finish(); };
      $('#next').focus();
    }
    draw();
  },
};
