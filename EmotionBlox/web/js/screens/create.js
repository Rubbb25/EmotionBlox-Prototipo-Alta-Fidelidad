// 02 Crear aventura: 1) nombre del niño  2) un adulto escribe y confirma el correo  3) código de confirmación.
// El correo es SIMULADO: el "mensaje" se muestra en una bandeja de ejemplo y no se envía a ningún lado.
import { go, scene } from '../router.js';
import { $, esc, hud, icon, shake, toast, confirmDialog } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP } from '../content.js';
import { api } from '../api.js';
import { setChild, save } from '../state.js';
import { adultGate } from '../gate.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

export const create = {
  render(c) {
    scene('pradera');
    const st = { step: 1, name: '', email: '', childId: null, mail: null, adultOk: false };
    const leave = async () => { if (st.step > 1 || st.name) { const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Todavía no terminaste de crear tu aventura.', ok: 'Sí, salir', cancel: 'No, seguir', icon: 'home' }); if (!ok) return; } go('home'); };
    hud({ left: { label: 'Volver', action: () => (st.step > 1 && st.step < 3 ? (st.step--, draw()) : leave()) }, right: true, help: HELP.create });

    const steps = () => `<ol class="steps" aria-label="Pasos"><li class="${st.step === 1 ? 'on' : st.step > 1 ? 'done' : ''}">${st.step > 1 ? icon('check', 18) : '1'}<span>Tu nombre</span></li><li class="${st.step === 2 ? 'on' : st.step > 2 ? 'done' : ''}">${st.step > 2 ? icon('check', 18) : '2'}<span>Un adulto</span></li><li class="${st.step === 3 ? 'on' : ''}">3<span>Código</span></li></ol>`;

    const field = (id, label, type, val, extra = '') => `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" type="${type}" value="${esc(val)}" ${extra}><p class="err-msg" id="${id}-err" role="alert"></p></div>`;
    const setErr = (id, msg) => { const e = $('#' + id + '-err'); const i = $('#' + id); if (e) e.textContent = msg || ''; if (i) { i.classList.toggle('bad', !!msg); i.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg) shake(i); } };

    function bubble(text) { return `<div class="bubble guide"><p>${esc(text)}</p></div>`; }

    function draw() {
      if (st.step === 1) {
        const say = '¡Hola! Yo soy Bloki. ¿Cómo te llamas? Escribe tu nombre.';
        c.innerHTML = `<section class="create" aria-labelledby="ct">${steps()}
          ${actor({ char: 'bloki', pose: 'wave', face: 'happy', x: 250, feet: 668, size: 380, label: 'Bloki' })}
          <div class="card form-card">${bubble(say)}<h1 id="ct" class="scr-title sm">¿Cómo te llamas?</h1>
          ${field('f-name', 'Tu nombre', 'text', st.name, 'maxlength="30" autocomplete="off" placeholder="Escribe aquí tu nombre" data-autofocus')}
          <div class="row end"><button class="btn primary big" id="next">Siguiente ${icon('next', 26)}</button></div></div></section>`;
        const inp = $('#f-name'); inp.focus();
        const go1 = () => { const v = inp.value.trim(); if (!v) { sfx('error'); setErr('f-name', 'Escribe tu nombre para seguir.');  return; } st.name = v; sfx('pop'); st.step = 2; draw(); };
        $('#next').onclick = go1; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') go1(); }); inp.addEventListener('input', () => setErr('f-name', ''));
      } else if (st.step === 2) {
        const say = `${st.name}, ahora le toca a un adulto. Debe escribir su correo para ver cómo vas.`;
        c.innerHTML = `<section class="create" aria-labelledby="ct">${steps()}
          ${actor({ char: 'bloki', pose: 'think', face: 'neutral', x: 250, feet: 668, size: 380, label: 'Bloki' })}
          <div class="card form-card wide">${bubble(say)}<h1 id="ct" class="scr-title sm">Ahora le toca a un adulto</h1>
          <p class="note">${icon('shield', 18)} Usamos el correo solo para que un adulto vea el avance de ${esc(st.name)}. No se comparte con nadie.</p>
          ${field('f-email', 'Correo de un adulto (papá, mamá o tutor)', 'email', st.email, 'autocomplete="email" placeholder="ejemplo@correo.com"')}
          ${field('f-email2', 'Escribe el correo otra vez', 'email', '', 'autocomplete="off" placeholder="ejemplo@correo.com"')}
          <div class="row end"><button class="btn ghost" id="prev">${icon('back', 22)} Atrás</button><button class="btn primary big" id="next">Enviar código ${icon('mail', 24)}</button></div></div></section>`;
        $('#prev').onclick = () => { sfx('back'); st.step = 1; draw(); };
        ['f-email', 'f-email2'].forEach((i) => $('#' + i).addEventListener('input', () => setErr(i, '')));
        const submit = async () => {
          const e1 = $('#f-email').value.trim().toLowerCase(), e2 = $('#f-email2').value.trim().toLowerCase();
          if (!e1) return fail('f-email', 'Un adulto debe escribir su correo.');
          if (!EMAIL_RE.test(e1)) return fail('f-email', 'Ese correo no parece correcto. Debe verse como nombre@correo.com');
          if (e1 !== e2) return fail('f-email2', 'Los dos correos no son iguales. Revísalos.');
          const btn = $('#next'); btn.disabled = true; btn.classList.add('busy');
          try {
            const r = await api.post('/api/children', { name: st.name, parentEmail: e1 });
            st.email = e1; st.childId = r.child.id; st.mail = r.mail; sfx('correct'); st.step = 3; draw();
          } catch (e) { btn.disabled = false; btn.classList.remove('busy'); fail(e.field === 'name' ? 'f-email' : (e.field === 'parentEmail' ? 'f-email' : 'f-email'), e.message); }
        };
        const fail = (id, msg) => { sfx('error'); setErr(id, msg);  };
        $('#next').onclick = submit; c.querySelectorAll('.input').forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); }));
        // La barrera parental se resuelve al entrar al paso del adulto
        if (!st.adultOk) adultGate({ title: 'Paso para adultos', text: 'Para escribir el correo, resuelve esta suma.' }).then((ok) => { if (ok) { st.adultOk = true; $('#f-email').focus(); } else { st.step = 1; draw(); } });
        else $('#f-email').focus();
      } else {
        const say = 'Revisa el correo del adulto. Allí está un código de seis números. Escríbelo aquí.';
        const m = st.mail || {};
        c.innerHTML = `<section class="create" aria-labelledby="ct">${steps()}
          ${actor({ char: 'bloki', pose: 'idle', face: 'happy', x: 200, feet: 668, size: 340, label: 'Bloki' })}
          <div class="card form-card wide code-card"><h1 id="ct" class="scr-title sm">Escribe el código del correo</h1>
          <div class="mailbox" aria-label="Correo simulado">
            <div class="mailbox-bar">${icon('mail', 20)} Bandeja de correo <em>(simulada: en la versión real llegaría a ${esc(st.email)})</em></div>
            <div class="mail"><p><b>Para:</b> ${esc(m.to || st.email)}</p><p><b>Asunto:</b> ${esc(m.subject || '')}</p><pre>${esc(m.body || '')}</pre></div></div>
          ${field('f-code', 'Código de 6 números', 'text', '', 'inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"')}
          <div class="row end"><button class="btn ghost" id="resend">${icon('refresh', 22)} Enviar otro código</button><button class="btn primary big" id="next">Confirmar ${icon('check', 26)}</button></div></div></section>`;
        const inp = $('#f-code'); inp.focus(); inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, ''); setErr('f-code', ''); });
        $('#resend').onclick = async () => { sfx('tap'); try { const r = await api.post(`/api/children/${st.childId}/resend`); st.mail = r.mail; toast('Te enviamos un código nuevo (simulado).', { icon: 'mail' }); draw(); } catch (e) { toast(e.message, { tone: 'warn', icon: 'info' }); } };
        const ok = async () => {
          if (inp.value.length !== 6) { sfx('error'); setErr('f-code', 'El código tiene 6 números.'); return; }
          const btn = $('#next'); btn.disabled = true;
          try {
            const r = await api.post(`/api/children/${st.childId}/confirm`, { code: inp.value });
            setChild(r.child); await save({ quiet: true }); sfx('unlock'); toast(`¡Listo, ${st.name}! Tu aventura está lista.`, { icon: 'star', ms: 2200 }); go('intro');
          } catch (e) { btn.disabled = false; sfx('error'); setErr('f-code', e.message);  }
        };
        $('#next').onclick = ok; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
      }
    }
    draw();
  },
};
