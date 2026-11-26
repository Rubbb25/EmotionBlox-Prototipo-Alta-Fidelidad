// 15 Mis logros  ·  22 Mis personajes (galería con desbloqueo)
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, faceSvg, toast, openModal } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP, STICKERS, BADGES, BADGE_ORDER, CHARACTERS, CHARACTER_ORDER, EMOTIONS, MODULES, TOTAL_MODULES } from '../content.js';
import { S, save, totalStars, isUnlocked, hero } from '../state.js';

export const achievements = {
  render(c) {
    scene('pradera');
    hud({ left: { label: 'Volver', action: () => go('map') }, chips: false, right: true, help: HELP.achievements, pause: true });
    const p = S.progress;
    const maxStars = TOTAL_MODULES * 3;
    const stk = STICKERS.map((s) => { const got = p.stickers.includes(s.id); return `<button class="tile ${got ? 'got' : 'lock'}" data-kind="s" data-id="${s.id}" aria-label="${esc(s.name)}. ${got ? 'Conseguido.' : 'Bloqueado. ' + s.how}">${got ? faceSvg(s.emotion, 70) : `<span class="tile-lock">${icon('lock', 36)}</span>`}<span class="tile-n">${got ? esc(s.name) : '???'}</span></button>`; }).join('');
    const bdg = BADGE_ORDER.map((b) => { const B = BADGES[b]; const got = p.badges.includes(b); return `<button class="tile badge ${got ? 'got' : 'lock'}" data-kind="b" data-id="${b}" aria-label="${esc(B.name)}. ${got ? 'Conseguida.' : 'Bloqueada. ' + B.how}"><span class="tile-ic">${icon(got ? B.icon : 'lock', 38)}</span><span class="tile-n">${esc(B.name)}</span></button>`; }).join('');
    c.innerHTML = `<section class="ach" aria-labelledby="ac-t"><h1 id="ac-t" class="scr-title">Mis logros</h1>
      <div class="ach-stats"><div class="stat">${icon('star', 30)}<div><b>${p.points}</b><small>puntos</small></div></div><div class="stat">${icon('starO', 30)}<div><b>${totalStars()} de ${maxStars}</b><small>estrellas</small></div></div><div class="stat">${icon('flame', 30)}<div><b>${p.streak || 1}</b><small>días seguidos</small></div></div></div>
      <div class="ach-cols"><div class="card"><h2>Stickers <span class="count">${p.stickers.length} de ${STICKERS.length}</span></h2><div class="tiles">${stk}</div></div>
      <div class="card"><h2>Insignias <span class="count">${p.badges.length} de ${BADGE_ORDER.length}</span></h2><div class="tiles two">${bdg}</div></div></div>
      <p class="muted hint-line">Toca uno con candado para saber cómo conseguirlo.</p></section>`;
    $$('.tile').forEach((t) => t.onclick = () => {
      const item = t.dataset.kind === 's' ? STICKERS.find((x) => x.id === t.dataset.id) : BADGES[t.dataset.id];
      const got = t.classList.contains('got'); sfx(got ? 'pop' : 'tap');
      const m = openModal(`<div class="modal-icon ${got ? 'ok' : 'primary'}">${icon(got ? 'star' : 'lock', 34)}</div><h2 id="m-title">${esc(item.name)}</h2><p class="big">${got ? '¡Ya lo conseguiste!' : esc('Cómo conseguirlo: ' + item.how)}</p>
        <div class="row center"><button class="btn primary" data-a="o" data-autofocus>Entendido</button></div>`, { cls: 'small' });
      m.el.querySelector('[data-a=o]').onclick = () => { sfx('tap'); m.close(); };
    });
  },
};

export const characters = {
  render(c) {
    scene('pradera');
    hud({ left: { label: 'Volver', action: () => go('map') }, right: true, help: HELP.characters, pause: true });
    const draw = () => {
      const sel = hero();
      c.innerHTML = `<section class="chars" aria-labelledby="ch-t"><h1 id="ch-t" class="scr-title">Mis personajes</h1>
        <p class="sub">Tus amigos se desbloquean jugando. Elige quién será tu protagonista.</p>
        <div class="char-grid">${CHARACTER_ORDER.map((id, k) => {
          const ch = CHARACTERS[id]; const un = isUnlocked(id); const on = id === sel; const col = k % 4, row = Math.floor(k / 4);
          return `<div class="char-card ${un ? '' : 'locked'} ${on ? 'selected' : ''}" style="--tone:${ch.torso}" data-id="${id}">
            <div class="char-stage">${actor({ char: id, pose: un ? (on ? 'wave' : 'idle') : 'idle', dir: 'front', x: 150, feet: 235, size: 190, locked: !un, spin: un, label: ch.name }).replace('left:', 'left:').replace(/position:absolute;?/, '')}</div>
            <b class="char-name">${un ? esc(ch.name) : '???'}</b>
            <span class="char-role">${un ? esc(ch.role) : icon('lock', 16) + ' ' + esc(ch.unlock)}</span>
            ${un ? (on ? `<span class="chosen">${icon('check', 18)} Tu protagonista</span>` : `<button class="btn secondary sm" data-pick="${id}">Elegir</button>`) : ''}</div>`;
        }).join('')}</div></section>`;
      // Las tarjetas se colocan en una cuadrícula: ajustar cada actor a su tarjeta
      $$('.char-card').forEach((card) => { const a = card.querySelector('.actor'); if (a) { a.style.position = 'absolute'; a.style.left = '50%'; a.style.top = '-22px'; a.style.transform = 'translateX(-50%)'; a.style.width = '160px'; a.style.height = '176px'; } });
      $$('[data-pick]').forEach((b) => b.onclick = () => { S.progress.character = b.dataset.pick; sfx('unlock'); save(); toast(`${CHARACTERS[b.dataset.pick].name} es tu nuevo protagonista.`, { icon: 'star' }); draw(); });
      $$('.char-card.locked').forEach((cd) => cd.onclick = () => { sfx('tap'); const ch = CHARACTERS[cd.dataset.id]; const msg = `Para desbloquearlo: ${ch.unlock}.`; toast(msg, { icon: 'lock', tone: 'warn', ms: 3000 });  });
    };
    draw();
    
  },
};
