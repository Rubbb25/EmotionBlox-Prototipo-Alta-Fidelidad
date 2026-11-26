// 18 Portal para padres (acceso con código) · 19 Progreso del niño
// Acceso: barrera parental -> correo -> código (simulado) -> selector de hijos -> panel.
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, faceSvg, toast, shake } from '../ui.js';
import { sfx } from '../audio.js';
import { api, setToken, getToken } from '../api.js';
import { EMOTIONS, MODULE_EMOTIONS, CHECKIN_EMOTIONS, TOTAL_MODULES, MODULES } from '../content.js';
import { deviceIds } from '../state.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const fmtAgo = (ts) => { const d = Math.floor((Date.now() / 1000 - ts) / 86400); return d <= 0 ? 'Hoy' : d === 1 ? 'Ayer' : `Hace ${d} días`; };

const TIPS = {
  alegre: 'Pregunten: “¿Qué te hizo sonreír hoy?” y celebren juntos esos momentos.',
  triste: 'Cuando se sienta triste, ofrezcan un abrazo y pregunten: “¿Quieres contarme qué pasó?”.',
  enojado: 'Practiquen juntos respirar hondo contando hasta cinco antes de hablar.',
  asustado: 'Digan: “Está bien tener miedo, estoy contigo”, y busquen juntos qué lo ayuda a sentirse seguro.',
};

export const parent = {
  render(c) {
    scene('adultos');
    const st = { email: '', mail: null, children: [], sel: null };
    const out = async () => { try { await api.post('/api/logout', {}, 'parent'); } catch { /* ok */ } setToken('parent', null); go('home'); };
    const setHud = (logged) => hud(logged ? { left: { label: 'Volver al inicio', icon: 'home', action: () => go('home') }, right: true, logout: out } : { left: { label: 'Volver', action: () => go('home') }, right: false });
    const err = (id, msg) => { const e = $('#' + id + '-err'), i = $('#' + id); if (e) e.textContent = msg || ''; if (i) { i.classList.toggle('bad', !!msg); if (msg) shake(i); } if (msg) sfx('error'); };

    async function stepEmail() {
      setHud(false);
      let hints = []; try { const ids = deviceIds(); if (ids.length) hints = (await api.get('/api/parent/hints?ids=' + ids.join(','))).hints; } catch { /* sin pistas */ }
      c.innerHTML = `<section class="adult" aria-labelledby="pt"><div class="card adult-card">
        <div class="modal-icon primary">${icon('heart', 34)}</div><h1 id="pt" class="scr-title sm">Portal para padres</h1>
        <p>Escribe el correo que usaste al crear la aventura. Te enviaremos un código para entrar.</p>
        <div class="field"><label for="p-email">Correo</label><input class="input" id="p-email" type="email" autocomplete="email" placeholder="ejemplo@correo.com" data-autofocus><p class="err-msg" id="p-email-err" role="alert"></p></div>
        ${hints.length ? `<p class="hintbox">${icon('info', 18)} Pista: en este dispositivo hay aventuras creadas con <b>${hints.map(esc).join('</b> o <b>')}</b>.</p>` : ''}
        <div class="row end"><button class="btn primary big" id="send">Enviar código ${icon('mail', 24)}</button></div>
        <p class="note">${icon('shield', 18)} Por seguridad, el acceso siempre necesita un código que llega al correo.</p></div></section>`;
      const inp = $('#p-email'); inp.focus(); inp.addEventListener('input', () => err('p-email', ''));
      const send = async () => {
        const v = inp.value.trim().toLowerCase();
        if (!v) return err('p-email', 'Escribe el correo que usaste al crear la aventura.');
        if (!EMAIL_RE.test(v)) return err('p-email', 'Ese correo no parece correcto. Debe verse como nombre@correo.com');
        const b = $('#send'); b.disabled = true;
        try { const r = await api.post('/api/parent/request-code', { email: v }); st.email = v; st.mail = r.mail; sfx('correct'); stepCode(); } catch (e) { b.disabled = false; err('p-email', e.message); }
      };
      $('#send').onclick = send; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') send(); });
    }

    function stepCode() {
      const m = st.mail || {};
      c.innerHTML = `<section class="adult" aria-labelledby="pt"><div class="card adult-card wide">
        <h1 id="pt" class="scr-title sm">Escribe el código</h1>
        <div class="mailbox"><div class="mailbox-bar">${icon('mail', 20)} Bandeja de correo <em>(simulada: en la versión real llegaría a ${esc(st.email)})</em></div><div class="mail"><p><b>Asunto:</b> ${esc(m.subject || '')}</p><pre>${esc(m.body || '')}</pre></div></div>
        <div class="field"><label for="p-code">Código de 6 números</label><input class="input" id="p-code" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000" data-autofocus><p class="err-msg" id="p-code-err" role="alert"></p></div>
        <div class="row end"><button class="btn ghost" id="back">${icon('back', 22)} Cambiar correo</button><button class="btn primary big" id="ok">Entrar ${icon('check', 24)}</button></div></div></section>`;
      const inp = $('#p-code'); inp.focus(); inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, ''); err('p-code', ''); });
      $('#back').onclick = () => { sfx('back'); stepEmail(); };
      const ok = async () => {
        if (inp.value.length !== 6) return err('p-code', 'El código tiene 6 números.');
        try { const r = await api.post('/api/parent/verify', { email: st.email, code: inp.value }); setToken('parent', r.token); sfx('unlock'); await loadChildren(); } catch (e) { err('p-code', e.message); }
      };
      $('#ok').onclick = ok; inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') ok(); });
    }

    async function loadChildren() {
      try { const r = await api.get('/api/parent/children', 'parent'); st.children = r.children; st.email = r.email; } catch (e) { setToken('parent', null); toast(e.message, { tone: 'warn', icon: 'info' }); return stepEmail(); }
      if (st.children.length === 1) return dashboard(st.children[0].id);
      stepPick();
    }

    function stepPick() {
      setHud(true);
      c.innerHTML = `<section class="adult" aria-labelledby="pt"><div class="card adult-card wide"><h1 id="pt" class="scr-title sm">¿De quién quieres ver el avance?</h1>
        <div class="kid-pick">${st.children.map((k) => `<button class="kid" data-id="${k.id}">${faceSvg(['alegre', 'tranquilo', 'triste', 'asustado'][k.id % 4], 70)}<b>${esc(k.name)}</b><span>${k.modulesDone} de ${TOTAL_MODULES} lugares · ${k.points} puntos</span></button>`).join('')}</div></div></section>`;
      $$('.kid').forEach((b) => b.onclick = () => { sfx('pop'); dashboard(parseInt(b.dataset.id, 10)); });
    }

    async function dashboard(id) {
      setHud(true); st.sel = id;
      c.innerHTML = `<section class="adult dash" aria-busy="true"><p class="muted center-t">Cargando el avance…</p></section>`;
      let r; try { r = await api.get(`/api/parent/children/${id}/report`, 'parent'); } catch (e) { toast(e.message, { tone: 'warn', icon: 'info' }); return stepPick(); }
      const k = r.child; const per = r.perEmotion;
      const info = (t) => `<span class="info" tabindex="0" role="note" aria-label="${esc(t)}">${icon('info', 18)}<span class="tip">${esc(t)}</span></span>`;
      const bars = MODULE_EMOTIONS.map((e) => { const p = per[e]; const pct = p.total ? Math.round((p.first / p.total) * 100) : 0; const E = EMOTIONS[e];
        return `<div class="bar-row"><span class="bar-name">${faceSvg(e, 34)} ${E.label}</span><div class="hbar" role="img" aria-label="${E.label}: ${p.first} de ${p.total} acertadas a la primera"><i style="width:${pct}%;background:${E.deep}"></i></div><b class="bar-val">${p.total ? `${p.first} de ${p.total}` : 'Sin datos'}</b></div>`; }).join('');
      const maxC = Math.max(1, ...Object.values(r.checkins));
      const feel = CHECKIN_EMOTIONS.map((e) => `<div class="vcol"><b>${r.checkins[e]}</b><div class="vbar"><i style="height:${(r.checkins[e] / maxC) * 100}%;background:${EMOTIONS[e].deep}"></i></div><span>${faceSvg(e, 30)}</span><small>${EMOTIONS[e].label}</small></div>`).join('');
      const maxA = Math.max(1, ...r.activity.map((a) => a.count));
      const act = r.activity.map((a) => { const d = new Date(a.date + 'T12:00:00'); return `<div class="vcol"><b>${a.count}</b><div class="vbar"><i style="height:${(a.count / maxA) * 100}%"></i></div><small>${DAYS[d.getDay()]}</small></div>`; }).join('');
      const weakest = MODULE_EMOTIONS.filter((e) => per[e].total).sort((a, b) => per[a].first / per[a].total - per[b].first / per[b].total)[0] || 'alegre';
      const done = Object.values(r.modules).filter((m) => m.done).length;
      c.innerHTML = `<section class="adult dash" aria-labelledby="dt">
        <header class="dash-head"><div><h1 id="dt" class="scr-title sm">Progreso de ${esc(k.name)}</h1><p class="muted">Última vez que jugó: <b>${fmtAgo(r.lastActive)}</b></p></div>
          ${st.children.length > 1 ? `<label class="sel"><span>Cambiar de hijo/a</span><select id="swap">${st.children.map((x) => `<option value="${x.id}" ${x.id === id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>` : ''}</header>
        <div class="kpis"><div class="kpi">${icon('star', 28)}<b>${r.points}</b><span>puntos</span></div><div class="kpi">${icon('compass', 28)}<b>${done} de ${TOTAL_MODULES}</b><span>lugares terminados</span></div><div class="kpi">${icon('flame', 28)}<b>${r.streak || 0}</b><span>días seguidos</span></div></div>
        <div class="dash-cols">
          <div class="card"><h2>Emociones trabajadas ${info('Sale de las preguntas del juego. La barra muestra cuántas respuestas acertó a la primera.')}</h2>${bars}<p class="legend"><i></i> Barra = respuestas acertadas a la primera ÷ preguntas respondidas.</p></div>
          <div class="card"><h2>Cómo se sintió esta semana ${info('Sale del registro “¿Cómo te sientes hoy?”. Cada número es una vez que eligió esa cara.')}</h2><div class="vchart">${feel}</div></div>
          <div class="card"><h2>Actividad de la semana ${info('Cuenta las preguntas respondidas y los registros de emociones de cada día.')}</h2><div class="vchart">${act}</div></div>
          <div class="card talk"><h2>Para conversar en casa</h2><p>${esc(TIPS[weakest])}</p><p class="muted">Sugerencia según la emoción que más le cuesta: <b>${EMOTIONS[weakest].label}</b>.</p></div>
        </div></section>`;
      const sw = $('#swap'); if (sw) sw.onchange = () => { sfx('tap'); dashboard(parseInt(sw.value, 10)); };
    }

    if (getToken('parent')) loadChildren(); else stepEmail();
  },
};
