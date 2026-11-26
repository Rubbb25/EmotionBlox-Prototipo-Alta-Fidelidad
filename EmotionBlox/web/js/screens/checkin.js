// 16 ¿Cómo te sientes hoy?  (registro diario de emociones)
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, faceSvg, toast, burst } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { CHECKIN_EMOTIONS, CHECKIN_REPLIES, EMOTIONS, HELP, BADGES, CHARACTERS } from '../content.js';
import { api } from '../api.js';
import { S, hero, save, evaluateUnlocks } from '../state.js';

export const checkin = {
  render(c) {
    scene('pradera');
    hud({ left: { label: 'Volver', action: () => go('map') }, right: true, help: HELP.checkin, pause: true });
    let picked = null;
    c.innerHTML = `<section class="checkin" aria-labelledby="ck-t">
      <div class="card ck-card">
        <div class="qhead"><h1 id="ck-t" class="scr-title">¿Cómo te sientes hoy?</h1></div>
        <div class="ck-opts" role="group" aria-labelledby="ck-t">${CHECKIN_EMOTIONS.map((e, k) => { const E = EMOTIONS[e]; return `<button class="opt emo ck" data-v="${e}" aria-pressed="false" style="--bg:${E.bg};--deep:${E.deep};--ink:${E.ink};--i:${k}">${faceSvg(e, 88)}<span>${E.label}</span></button>`; }).join('')}</div>
        <p class="pick-hint" id="hintp" aria-live="polite">Toca una cara.</p>
        <div class="row end"><button class="btn ghost" id="later">Ahora no</button><button class="btn primary big" id="done" disabled aria-disabled="true">Listo ${icon('check', 26)}</button></div>
      </div>
      ${actor({ char: hero(), pose: 'idle', face: 'happy', x: 160, feet: 668, size: 330, id: 'ckactor', label: 'Bloki' })}</section>`;
    $$('.ck').forEach((b) => b.onclick = () => {
      sfx('select'); picked = b.dataset.v; $$('.ck').forEach((x) => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      const d = $('#done'); d.disabled = false; d.removeAttribute('aria-disabled'); $('#hintp').textContent = 'Toca Listo cuando quieras.'; 
      const a = $('#ckactor'); a.dataset.face = EMOTIONS[picked].face; a.dataset.pose = picked === 'alegre' ? 'jump' : 'idle';
    });
    $('#later').onclick = () => { sfx('back'); go('map'); };
    $('#done').onclick = async () => {
      if (!picked) return; const btn = $('#done'); btn.disabled = true;
      try { await api.post(`/api/children/${S.child.id}/checkin`, { emotion: picked }); } catch (e) { toast(e.message, { tone: 'warn', icon: 'info' }); btn.disabled = false; return; }
      S.progress.checkins = (S.progress.checkins || 0) + 1;
      const un = evaluateUnlocks(); await save();
      const r = CHECKIN_REPLIES[picked]; sfx('correct'); burst($('#ckactor'), { count: 18 });
      c.innerHTML = `<section class="checkin"><div class="card ck-card reply"><h1 class="scr-title">¡Gracias por contármelo!</h1><div class="reply-face">${faceSvg(picked, 110)}</div><p class="big">${esc(r.text)}</p>
        ${un.badges.length || un.characters.length ? `<p class="note ok">${icon('star', 18)} ${un.characters.length ? 'Desbloqueaste a ' + esc(CHARACTERS[un.characters[0]].name) + '. ' : ''}${un.badges.length ? 'Nueva insignia: ' + esc(BADGES[un.badges[0]].name) + '.' : ''}</p>` : ''}
        <div class="row center"><button class="btn primary xl" id="back">Volver al mapa ${icon('next', 26)}</button></div></div>
        ${actor({ char: hero(), pose: r.pose, face: r.face, x: 170, feet: 668, size: 330, label: 'Bloki' })}</section>`;
       $('#back').focus(); $('#back').onclick = () => { sfx('pop'); go('map'); };
    };
  },
};
