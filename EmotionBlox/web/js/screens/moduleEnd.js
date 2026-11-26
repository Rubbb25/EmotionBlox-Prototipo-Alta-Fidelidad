// 14 Fin del módulo (cinemática de cierre + lo que se desbloquea)  ·  Final de la aventura (arcoíris)
import { go, scene } from '../router.js';
import { $, esc, hud, icon, faceSvg, burst, rain, confirmDialog } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { MODULES, CHARACTERS, BADGES, EMOTIONS, HELP } from '../content.js';
import { S, hero, save } from '../state.js';

export const moduleEnd = {
  render(c, { module: id = 1, unlocks = { characters: [], badges: [] } }) {
    const m = MODULES[id - 1]; const next = MODULES[id];
    const panels = m.endLines.map((t) => ({ kind: 'story', text: t }));
    panels.push({ kind: 'unlock' });
    let i = 0;
    const leave = async () => { const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Tu avance está guardado. Podrás continuar cuando quieras.', ok: 'Sí, salir', cancel: 'No, seguir', icon: 'home' }); if (ok) go('home'); };
    hud({ left: { label: 'Inicio', icon: 'home', action: leave }, right: true, help: 'Mira lo que lograste. Toca Siguiente para seguir.', pause: true });

    function draw() {
      const p = panels[i]; const last = i === panels.length - 1;
      scene(m.scene);
      let body = '';
      if (p.kind === 'story') {
        body = `<div class="bubble narr"><p>${esc(p.text)}</p></div>
          ${actor({ char: hero(), pose: i === 0 ? 'celebrate' : 'wave', face: 'cheer', x: 380, feet: 668, size: 380, label: 'Bloki' })}
          ${actor({ char: m.companion, pose: i === 0 ? 'jump' : 'dance', x: 880, feet: 668, size: 360, dir: 'left', label: CHARACTERS[m.companion].name })}
          <div class="gem-float" aria-hidden="true" style="--gem:${m.gem}">${icon('gem', 96)}</div>`;
        
      } else {
        const newChars = unlocks.characters; const newBadges = unlocks.badges;
        const star = newChars[0]; const cfg = star ? CHARACTERS[star] : null;
        body = `<div class="card unlock-card"><h1 class="scr-title">${cfg ? '¡Nuevo amigo desbloqueado!' : '¡Muy bien!'}</h1>
          ${cfg ? `<p class="big"><b>${esc(cfg.name)}</b> · ${esc(cfg.role)}. ${esc(cfg.bio)}</p>` : ''}
          ${newBadges.length ? `<div class="badge-row">${newBadges.map((b) => `<span class="badge-pill">${icon(BADGES[b].icon, 22)} ${esc(BADGES[b].name)}</span>`).join('')}</div>` : ''}
          ${next ? `<p class="note ok">${icon('lock', 18)} Se abrió un lugar nuevo: <b>${esc(next.name)}</b></p>` : `<p class="note ok">${icon('trophy', 18)} ¡Llegaste al arcoíris! Ya puedes celebrar.</p>`}</div>
          ${cfg ? actor({ char: star, pose: 'dance', face: 'cheer', x: 900, feet: 668, size: 400, dir: 'left', label: cfg.name }) : actor({ char: hero(), pose: 'celebrate', x: 900, feet: 668, size: 380, label: 'Bloki' })}`;
        sfx('unlock'); burst({ x: 900, y: 380 }, { count: 40 });
        
      }
      c.innerHTML = `<section class="mend" aria-label="Fin del lugar">${body}
        <div class="intro-bar"><div class="intro-l">${i > 0 ? `<button class="btn ghost" id="prev">${icon('back', 24)} Anterior</button>` : '<span></span>'}</div>
        <ol class="dots" aria-label="Progreso">${panels.map((_, k) => `<li class="${k === i ? 'on' : k < i ? 'done' : ''}"><span class="sr">Escena ${k + 1}</span></li>`).join('')}</ol>
        <div class="intro-r"><button class="btn primary big" id="next">${last ? (next ? 'Ir al mapa' : 'Ir al arcoíris') : 'Siguiente'} ${icon('next', 26)}</button></div></div></section>`;
      const pv = $('#prev'); if (pv) pv.onclick = () => { sfx('back'); i--; draw(); };
      $('#next').onclick = () => { sfx('pop'); if (last) { S.progress.currentModule = S.progress.currentModule; save({ quiet: true }); go(next ? 'map' : 'finale'); } else { i++; draw(); } };
      $('#next').focus();
    }
    draw();
  },
};

export const finale = {
  render(c) {
    scene('arcoiris'); rain(90); sfx('fanfare');
    hud({ left: { label: 'Volver', action: () => go('map') }, right: true, help: 'Terminaste toda la aventura. Toca Ir al mapa para seguir jugando.', pause: true });
    const text = `¡Lo lograste, ${S.child.name}! Recuperaste todas las Gemas de las Emociones. Ahora sabes reconocer la alegría, la tristeza, el enojo y el miedo.`;
    c.innerHTML = `<section class="finale" aria-labelledby="f-t">
      <div class="card done-card"><h1 id="f-t" class="scr-title">¡Maestro de emociones!</h1><p class="big">${esc(text)}</p>
        <div class="gems" aria-hidden="true">${MODULES.map((m, k) => `<span style="--gem:${m.gem};--k:${k}">${icon('gem', 54)}</span>`).join('')}</div>
        <p class="note ok">${icon('trophy', 18)} Ganaste la insignia Maestro de emociones y desbloqueaste a Coro.</p>
        <div class="row center"><button class="btn primary xl" id="to-map">Ir al mapa ${icon('next', 28)}</button></div></div>
      ${actor({ char: hero(), pose: 'celebrate', face: 'cheer', x: 150, feet: 668, size: 330, label: 'Bloki' })}
      ${actor({ char: 'soli', pose: 'jump', x: 330, feet: 650, size: 270, label: 'Soli' })}
      ${actor({ char: 'nami', pose: 'dance', x: 970, feet: 650, size: 270, dir: 'left', label: 'Nami' })}
      ${actor({ char: 'brasa', pose: 'jump', x: 1100, feet: 664, size: 300, dir: 'left', label: 'Brasa' })}
      ${actor({ char: 'luma', pose: 'dance', x: 1215, feet: 650, size: 250, dir: 'left', label: 'Luma' })}
      </section>`;
    
    $('#to-map').onclick = () => { sfx('pop'); go('map'); };
    $('#to-map').focus();
  },
};
