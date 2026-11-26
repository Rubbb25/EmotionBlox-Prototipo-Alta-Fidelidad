// 20 Acceso de administrador · 21 Niños registrados
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, toast, shake, openModal, confirmDialog, faceSvg } from '../ui.js';
import { sfx } from '../audio.js';
import { api, setToken, getToken } from '../api.js';
import { TOTAL_MODULES, MODULES } from '../content.js';

const fmtDate = (ts) => new Date(ts * 1000).toLocaleDateString('es', { day: 'numeric', month: 'short' });

export const admin = {
  render(c) {
    scene('adultos');
    const out = async () => { try { await api.post('/api/logout', {}, 'admin'); } catch { /* ok */ } setToken('admin', null); go('home'); };
    const hudLogin = () => hud({ left: { label: 'Volver', action: () => go('home') }, right: false });
    const hudPanel = () => hud({ left: { label: 'Volver al inicio', icon: 'home', action: () => go('home') }, right: true, logout: out });

    // -------------------------------------------------------------- acceso
    function login() {
      hudLogin();
      c.innerHTML = `<section class="adult" aria-labelledby="at"><form class="card adult-card" id="lf" novalidate>
        <div class="modal-icon primary">${icon('shield', 34)}</div><h1 id="at" class="scr-title sm">Acceso de administrador</h1>
        <div class="field"><label for="a-email">Correo</label><input class="input" id="a-email" type="email" autocomplete="username" placeholder="admin@ejemplo.com" data-autofocus><p class="err-msg" id="a-email-err" role="alert"></p></div>
        <div class="field"><label for="a-pass">Contraseña</label><div class="pw"><input class="input" id="a-pass" type="password" autocomplete="current-password"><button type="button" class="eye" id="eye" aria-label="Mostrar la contraseña" aria-pressed="false">${icon('eye', 24)}</button></div><p class="err-msg" id="a-pass-err" role="alert"></p></div>
        <div class="row between"><button type="button" class="link" id="forgot">¿Olvidaste tu contraseña?</button><button class="btn primary big" type="submit" id="go">Entrar ${icon('next', 24)}</button></div></form></section>`;
      const err = (id, msg) => { const e = $('#' + id + '-err'), i = $('#' + id); e.textContent = msg || ''; i.classList.toggle('bad', !!msg); if (msg) { shake(i); sfx('error'); } };
      $('#a-email').focus(); ['a-email', 'a-pass'].forEach((i) => $('#' + i).addEventListener('input', () => err(i, '')));
      $('#eye').onclick = () => { const p = $('#a-pass'); const show = p.type === 'password'; p.type = show ? 'text' : 'password'; $('#eye').innerHTML = icon(show ? 'eyeOff' : 'eye', 24); $('#eye').setAttribute('aria-pressed', String(show)); $('#eye').setAttribute('aria-label', show ? 'Ocultar la contraseña' : 'Mostrar la contraseña'); };
      $('#lf').onsubmit = async (e) => {
        e.preventDefault(); const email = $('#a-email').value.trim(), pass = $('#a-pass').value;
        if (!email) return err('a-email', 'Escribe tu correo.'); if (!pass) return err('a-pass', 'Escribe tu contraseña.');
        const b = $('#go'); b.disabled = true;
        try { const r = await api.post('/api/admin/login', { email, password: pass }); setToken('admin', r.token); sfx('unlock'); panel(); } catch (ex) { b.disabled = false; err(ex.field === 'email' ? 'a-email' : 'a-pass', ex.message); }
      };
      $('#forgot').onclick = () => { sfx('tap'); forgot(); };
    }

    // olvidé mi contraseña (el correo es simulado)
    function forgot() {
      const m = openModal(`<h2 id="m-title">Recuperar contraseña</h2><div id="fg"></div>`, { cls: 'small' });
      const body = m.el.querySelector('#fg'); let email = '';
      const s1 = () => {
        body.innerHTML = `<p>Escribe tu correo de administrador y te enviaremos un código.</p><div class="field"><label for="f-email">Correo</label><input class="input" id="f-email" type="email" data-autofocus><p class="err-msg" id="f-email-err" role="alert"></p></div><div class="row center"><button class="btn ghost" data-a="x">Cancelar</button><button class="btn primary" data-a="s">Enviar código</button></div>`;
        body.querySelector('[data-a=x]').onclick = () => m.close();
        body.querySelector('[data-a=s]').onclick = async () => { email = body.querySelector('#f-email').value.trim(); const e = body.querySelector('#f-email-err');
          try { const r = await api.post('/api/admin/forgot', { email }); sfx('correct'); s2(r); } catch (ex) { e.textContent = ex.message; sfx('error'); } };
      };
      const s2 = (r) => {
        body.innerHTML = `<p>${esc(r.message)}</p>${r.mail ? `<div class="mailbox"><div class="mailbox-bar">${icon('mail', 20)} Correo simulado</div><div class="mail"><pre>${esc(r.mail.body)}</pre></div></div>` : ''}
          <div class="field"><label for="f-code">Código</label><input class="input" id="f-code" inputmode="numeric" maxlength="6"><p class="err-msg" id="f-code-err" role="alert"></p></div>
          <div class="field"><label for="f-pass">Contraseña nueva (mínimo 8 caracteres)</label><input class="input" id="f-pass" type="password" autocomplete="new-password"><p class="err-msg" id="f-pass-err" role="alert"></p></div>
          <div class="row center"><button class="btn ghost" data-a="x">Cancelar</button><button class="btn primary" data-a="s">Cambiar contraseña</button></div>`;
        body.querySelector('[data-a=x]').onclick = () => m.close();
        body.querySelector('[data-a=s]').onclick = async () => {
          try { await api.post('/api/admin/reset', { email, code: body.querySelector('#f-code').value.trim(), password: body.querySelector('#f-pass').value }); sfx('unlock'); toast('Contraseña cambiada. Ya puedes entrar.', { icon: 'check' }); m.close(); }
          catch (ex) { const id = ex.field === 'password' ? 'f-pass-err' : 'f-code-err'; body.querySelector('#' + id).textContent = ex.message; sfx('error'); }
        };
      };
      s1();
    }

    // -------------------------------------------------------------- panel
    const q = { q: '', module: '', sort: 'last', dir: 'desc', page: 1, size: 5 };
    async function panel() {
      hudPanel();
      c.innerHTML = `<section class="adm" aria-labelledby="pt">
        <aside class="adm-side" aria-label="Menú"><nav><a class="side-link on" href="#" aria-current="page">${icon('users', 22)} Niños registrados</a></nav></aside>
        <div class="adm-main"><h1 id="pt" class="scr-title sm">Niños registrados</h1>
          <div class="kpis" id="kpis" aria-live="polite"></div>
          <div class="adm-tools"><div class="search field"><label for="q">Buscar por nombre o correo</label><div class="search-in">${icon('search', 22)}<input class="input" id="q" type="search" placeholder="Ejemplo: Sofía o padre01@…" value="${esc(q.q)}"></div></div>
          <label class="sel"><span>Filtrar por lugar</span><select id="mf"><option value="">Todos</option>${MODULES.map((m) => `<option value="${m.id}" ${String(q.module) === String(m.id) ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}</select></label></div>
          <div class="tbl-wrap"><table class="tbl" id="tbl"><caption class="sr">Lista de niños registrados</caption><thead><tr>
            ${[['name', 'Nombre'], ['email', 'Correo del adulto'], ['module', 'Lugar actual'], ['points', 'Puntos'], ['last', 'Última vez']].map(([k, l]) => `<th scope="col" aria-sort="${q.sort === k ? (q.dir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button class="th-btn" data-sort="${k}">${l} ${icon(q.sort === k ? (q.dir === 'asc' ? 'sortUp' : 'sortDown') : 'sortNone', 18)}</button></th>`).join('')}<th scope="col">Acciones</th></tr></thead><tbody id="tb"><tr><td colspan="6" class="muted">Cargando…</td></tr></tbody></table></div>
          <div class="pager" id="pager"></div></div></section>`;
      $('#q').addEventListener('input', debounce((e) => { q.q = e.target.value; q.page = 1; load(); }, 250));
      $('#mf').onchange = (e) => { q.module = e.target.value; q.page = 1; sfx('tap'); load(); };
      $$('.th-btn').forEach((b) => b.onclick = () => { sfx('tap'); const k = b.dataset.sort; if (q.sort === k) q.dir = q.dir === 'asc' ? 'desc' : 'asc'; else { q.sort = k; q.dir = 'asc'; } q.page = 1; panel2(); });
      kpis(); load();
    }
    const panel2 = () => { // vuelve a dibujar solo los encabezados y la tabla
      $$('.tbl th[aria-sort]').forEach((th) => { const k = th.querySelector('.th-btn').dataset.sort; th.setAttribute('aria-sort', q.sort === k ? (q.dir === 'asc' ? 'ascending' : 'descending') : 'none'); th.querySelector('.th-btn .ic').outerHTML = icon(q.sort === k ? (q.dir === 'asc' ? 'sortUp' : 'sortDown') : 'sortNone', 18); });
      load();
    };
    async function kpis() {
      try { const s = await api.get('/api/admin/summary', 'admin'); $('#kpis').innerHTML = `<div class="kpi">${icon('users', 26)}<b>${s.total}</b><span>niños registrados</span></div><div class="kpi">${icon('flame', 26)}<b>${s.active}</b><span>jugaron esta semana</span></div><div class="kpi">${icon('trophy', 26)}<b>${s.completed}</b><span>terminaron la aventura</span></div><div class="kpi">${icon('star', 26)}<b>${s.avgPoints}</b><span>puntos en promedio</span></div>`; } catch (e) { sessionEnd(e); }
    }
    function sessionEnd(e) { if (e.status === 401) { setToken('admin', null); toast(e.message, { tone: 'warn', icon: 'info' }); login(); } else toast(e.message, { tone: 'warn', icon: 'info' }); }
    async function load() {
      const tb = $('#tb'); if (!tb) return;
      const params = new URLSearchParams({ q: q.q, module: q.module, sort: q.sort, dir: q.dir, page: q.page, size: q.size });
      let r; try { r = await api.get('/api/admin/children?' + params, 'admin'); } catch (e) { return sessionEnd(e); }
      tb.innerHTML = r.children.length ? r.children.map((k) => `<tr><th scope="row"><span class="who">${faceSvg(['alegre', 'tranquilo', 'triste', 'asustado'][k.id % 4], 34)} ${esc(k.name)}${k.demo ? ' <em class="tag">ejemplo</em>' : ''}${k.confirmed ? '' : ' <em class="tag warn">sin confirmar</em>'}</span></th>
        <td>${esc(k.email)}</td><td>${k.modulesDone >= TOTAL_MODULES ? 'Terminó todo' : esc(MODULES[k.currentModule - 1].name)} <small class="muted">(${k.currentModule} de ${r.totalModules})</small></td><td>${k.points}</td><td>${fmtDate(k.lastActive)}</td>
        <td class="acts"><button class="btn secondary sm" data-view="${k.id}">${icon('eye', 17)} Ver detalles</button><button class="btn warn sm" data-del="${k.id}" data-name="${esc(k.name)}">${icon('trash', 17)} Eliminar</button></td></tr>`).join('')
        : `<tr><td colspan="6" class="muted center-t">No encontramos niños con esa búsqueda.</td></tr>`;
      const pages = Math.max(1, Math.ceil(r.total / r.size)); const from = r.total ? (r.page - 1) * r.size + 1 : 0, to = Math.min(r.total, r.page * r.size);
      $('#pager').innerHTML = `<span>Mostrando <b>${from}–${to}</b> de <b>${r.total}</b></span><div class="pg"><button class="btn ghost sm" id="pp" ${r.page <= 1 ? 'disabled' : ''}>${icon('back', 18)} Anterior</button><span>Página ${r.page} de ${pages}</span><button class="btn ghost sm" id="pn" ${r.page >= pages ? 'disabled' : ''}>Siguiente ${icon('next', 18)}</button></div>`;
      const pp = $('#pp'), pn = $('#pn'); pp.onclick = () => { q.page--; sfx('tap'); load(); }; pn.onclick = () => { q.page++; sfx('tap'); load(); };
      $$('[data-view]').forEach((b) => b.onclick = () => { const k = r.children.find((x) => x.id === +b.dataset.view); sfx('pop');
        const m = openModal(`<h2 id="m-title">${esc(k.name)}</h2><dl class="dl"><dt>Correo del adulto</dt><dd>${esc(k.email)}</dd><dt>Lugar actual</dt><dd>${k.modulesDone >= TOTAL_MODULES ? 'Terminó todo' : esc(MODULES[k.currentModule - 1].name)} (${k.currentModule} de ${r.totalModules})</dd><dt>Lugares terminados</dt><dd>${k.modulesDone} de ${r.totalModules}</dd><dt>Puntos</dt><dd>${k.points}</dd><dt>Última vez</dt><dd>${fmtDate(k.lastActive)}</dd><dt>Estado</dt><dd>${k.confirmed ? 'Correo confirmado' : 'Correo sin confirmar'}</dd></dl><div class="row center"><button class="btn primary" data-autofocus>Cerrar</button></div>`, { cls: 'small' });
        m.el.querySelector('button').onclick = () => m.close(); });
      $$('[data-del]').forEach((b) => b.onclick = async () => {
        const ok = await confirmDialog({ title: `¿Eliminar a ${b.dataset.name}?`, text: 'Se borrarán su avance y sus registros. Esto no se puede deshacer.', ok: 'Sí, eliminar', cancel: 'No, conservar', tone: 'danger', icon: 'trash' });
        if (!ok) return;
        try { await api.del('/api/admin/children/' + b.dataset.del, 'admin'); sfx('tap'); toast('Se eliminó la aventura.', { icon: 'check' }); kpis(); load(); } catch (e) { sessionEnd(e); }
      });
    }
    const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

    if (getToken('admin')) panel(); else login();
  },
};
