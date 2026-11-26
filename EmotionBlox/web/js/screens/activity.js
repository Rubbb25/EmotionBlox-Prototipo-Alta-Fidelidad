// 08 Carga · 09 Inicio de la actividad · 10-12 Pregunta y respuesta · 13 Actividad completada
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, faceSvg, toast, confirmDialog, burst, floatText, countUp, shake, wait, refreshHudPoints, rain } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP, MODULES, EMOTIONS, CHARACTERS, STICKERS } from '../content.js';
import { api } from '../api.js';
import { S, hero, save, moduleDone, evaluateUnlocks, currentModuleId } from '../state.js';

const TIPS = ['Toca a tu amigo y verás qué hace.', 'Toca una respuesta y luego Comprobar.', 'Respirar hondo ayuda a sentirnos mejor.', 'Todas las emociones son normales.'];

// ------------------------------------------------------------------ carga
export const loading = {
  async render(c, { module: id = 1 }) {
    const m = MODULES[id - 1]; scene(m.scene);
    hud({ left: { label: 'Volver', action: () => go('map') }, right: true, help: HELP.activity });
    c.innerHTML = `<section class="loading" aria-label="Cargando">
      ${actor({ char: hero(), pose: 'walk', face: 'happy', x: 640, feet: 668, size: 300, dir: 'right', label: 'Bloki camina' })}
      <div class="card load-card"><h1 class="scr-title sm">Ya casi llegamos a ${esc(m.name)}</h1><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="lb"></i></div><p class="muted">${esc(TIPS[id % TIPS.length])}</p></div></section>`;
    const bar = $('#lb'); const pb = $('.bar'); const t0 = performance.now(); let dead = false;
    const tick = (t) => { if (dead) return; const k = Math.min(1, (t - t0) / 1700); bar.style.width = k * 100 + '%'; pb.setAttribute('aria-valuenow', Math.round(k * 100)); if (k < 1) requestAnimationFrame(tick); else go('activity', { module: id }); };
    requestAnimationFrame(tick);
    sfx('whoosh');
    return () => { dead = true; };
  },
};

// ------------------------------------------------------------------ actividad
export const activity = {
  render(c, { module: id = 1 }) {
    const m = MODULES[id - 1];
    const st = { qi: 0, tries: 0, picked: null, wrong: [], results: [], points: 0, streak: 0, locked: false };
    scene(m.scene);
    const exit = async () => { const ok = await confirmDialog({ title: '¿Quieres salir?', text: 'Si sales ahora, volverás a empezar esta actividad. Lo que ya lograste está guardado.', ok: 'Sí, salir', cancel: 'No, seguir', icon: 'home' }); if (ok) go('map'); };
    hud({ left: { label: 'Volver', action: exit }, chips: true, right: true, help: HELP.question, pause: true });

    // ---------------- inicio de la actividad
    function drawIntro() {
      const line = m.introLine;
      c.innerHTML = `<section class="act-intro" aria-labelledby="ai-t">
        <div class="banner" style="--tone:${EMOTIONS[m.emotion].deep}"><span class="banner-ic">${faceSvg(m.emotion, 44, { bg: false })}</span><h1 id="ai-t">${esc(m.name)}</h1></div>
        ${actor({ char: hero(), pose: 'wave', face: 'happy', x: 190, feet: 668, size: 360, label: 'Bloki' })}
        ${actor({ char: m.companion, pose: 'jump', x: 1090, feet: 662, size: 330, dir: 'left', label: CHARACTERS[m.companion].name })}
        <div class="bubble big-b"><p>${esc(line)}</p></div>
        <div class="card instr"><p class="big">Mira la escena y toca la respuesta que creas correcta.</p>
          <div class="row center"><button class="btn primary xl pulse" id="go">¡Empezar! ${icon('star', 28)}</button></div></div></section>`;
      $('#go').onclick = () => { sfx('pop'); drawQuestion(); };
      $('#go').focus();
    }

    // ---------------- pregunta
    function optionHtml(q, o, k) {
      if (q.type === 'emotion') { const e = EMOTIONS[o]; return `<button class="opt emo" data-v="${o}" style="--bg:${e.bg};--deep:${e.deep};--ink:${e.ink};--i:${k}" aria-pressed="false">${faceSvg(o, 92)}<span>${e.label}</span></button>`; }
      const tones = ['#FFE08A', '#BFDDFF', '#BDF0DA', '#DCCBFF'];
      return `<button class="opt word" data-v="${o.id}" style="--bg:#fff;--deep:${tones[k % 4]};--ink:#2E2748;--i:${k}" aria-pressed="false"><span class="letter">${'ABCD'[k]}</span><span>${esc(o.label)}</span></button>`;
    }

    function drawQuestion() {
      const q = m.questions[st.qi]; st.tries = 0; st.picked = null; st.wrong = []; st.locked = false;
      const sc = q.scene;
      c.innerHTML = `<section class="quest" aria-labelledby="q-t">
        <div class="qprog"><span>Pregunta ${st.qi + 1} de ${m.questions.length}</span><div class="bar sm" role="progressbar" aria-valuemin="0" aria-valuemax="${m.questions.length}" aria-valuenow="${st.qi}"><i style="width:${(st.qi / m.questions.length) * 100}%"></i></div></div>
        ${actor({ char: sc.char === 'bloki' ? hero() : sc.char, pose: sc.pose, face: sc.face, x: 300, feet: 668, size: 400, dir: 'right', id: 'qactor', label: CHARACTERS[sc.char].name })}
        <div class="qcard card">
          <div class="qhead"><h1 id="q-t">${esc(q.prompt)}</h1></div>
          <div class="opts ${q.type}" role="group" aria-labelledby="q-t">${q.options.map((o, k) => optionHtml(q, o, k)).join('')}</div>
          <div class="qfoot" id="qfoot"><p class="pick-hint" id="pick-hint" aria-live="polite">Toca una respuesta.</p><button class="btn primary big" id="check" disabled aria-disabled="true">Comprobar</button></div>
          <div class="sheet" id="sheet" aria-live="assertive"></div>
        </div></section>`;
      const opts = $$('.opt'); const check = $('#check');
      opts.forEach((b) => b.onclick = () => {
        if (st.locked || b.disabled) return;
        sfx('select'); st.picked = b.dataset.v;
        opts.forEach((x) => { x.classList.toggle('selected', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        check.disabled = false; check.removeAttribute('aria-disabled'); $('#pick-hint').textContent = 'Toca Comprobar cuando estés listo.';
        
      });
      check.onclick = () => verify(q);
    }

    function setActor(pose, face) { const a = $('#qactor'); if (a) { a.dataset.pose = pose; if (face) a.dataset.face = face; } }

    async function verify(q) {
      if (!st.picked || st.locked) return; st.locked = true; st.tries++;
      const ok = st.picked === (q.type === 'emotion' ? q.answer : q.answer);
      const sheet = $('#sheet'); const foot = $('#qfoot'); const pickedEl = $(`.opt[data-v="${st.picked}"]`);
      const label = (v) => q.type === 'emotion' ? EMOTIONS[v].label : q.options.find((o) => o.id === v).label;
      if (ok) {
        const pts = st.tries === 1 ? 10 : 5; st.points += pts; S.progress.points += pts; refreshHudPoints(); st.streak++;
        pickedEl.classList.add('right'); $$('.opt').forEach((x) => x.disabled = true);
        sfx('correct'); setActor('celebrate', 'cheer'); burst($('#qactor'), { count: 30 }); floatText(pickedEl, '+' + pts, 'pts'); sfx('coin');
        if (st.streak >= 2) { setTimeout(() => { sfx('combo'); floatText({ x: 330, y: 170 }, `¡Racha de ${st.streak}!`, 'combo'); }, 500); }
        st.results.push({ id: q.id, tries: st.tries, correct: true });
        api.post(`/api/children/${S.child.id}/attempt`, { module: m.id, qid: q.id, emotion: m.emotion, correct: true, tries: st.tries }).catch(() => {});
        const msg = '¡Muy bien!'; sheet.className = 'sheet show good';
        sheet.innerHTML = `<div class="sheet-ic">${icon('check', 40)}</div><div class="sheet-t"><b>${msg}</b><p>Tu respuesta: ${esc(label(st.picked))}. ${esc(q.explain)}</p></div><button class="btn good big" id="cont">Continuar</button>`;
        foot.style.visibility = 'hidden'; 
        $('#cont').focus(); $('#cont').onclick = () => { sfx('tap'); next(); };
      } else {
        st.streak = 0; st.wrong.push(st.picked);
        pickedEl.classList.add('wrong'); pickedEl.disabled = true; shake(pickedEl); sfx('wrong'); setActor('think');
        const reveal = st.tries >= 2;
        if (!reveal) {
          sheet.className = 'sheet show oops';
          sheet.innerHTML = `<div class="sheet-ic">${icon('refresh', 38)}</div><div class="sheet-t"><b>Casi. ¡Inténtalo otra vez!</b><p>Tu respuesta: ${esc(label(st.picked))}. Pista: ${esc(q.hint)}</p></div><button class="btn warn big" id="again">Intentar otra vez</button>`;
          foot.style.visibility = 'hidden'; 
          $('#again').focus();
          $('#again').onclick = () => { sfx('tap'); sheet.className = 'sheet'; foot.style.visibility = ''; st.locked = false; st.picked = null; $$('.opt').forEach((x) => { x.classList.remove('selected'); x.setAttribute('aria-pressed', 'false'); }); const ch = $('#check'); ch.disabled = true; ch.setAttribute('aria-disabled', 'true'); $('#pick-hint').textContent = 'Toca otra respuesta.'; setActor(q.scene.pose);  };
        } else {
          // tras 2 intentos: se muestra la respuesta correcta con su explicación y se puede continuar
          const rightEl = $(`.opt[data-v="${q.answer}"]`); $$('.opt').forEach((x) => { x.disabled = true; x.classList.remove('selected'); }); rightEl.classList.add('right', 'reveal');
          setActor(q.scene.pose, q.scene.face);
          st.results.push({ id: q.id, tries: st.tries, correct: false });
          api.post(`/api/children/${S.child.id}/attempt`, { module: m.id, qid: q.id, emotion: m.emotion, correct: false, tries: st.tries }).catch(() => {});
          sheet.className = 'sheet show oops';
          sheet.innerHTML = `<div class="sheet-ic">${icon('info', 38)}</div><div class="sheet-t"><b>La respuesta era: ${esc(label(q.answer))}</b><p>${esc(q.explain)}</p></div><button class="btn warn big" id="cont">Continuar</button>`;
          foot.style.visibility = 'hidden'; 
          $('#cont').focus(); $('#cont').onclick = () => { sfx('tap'); next(); };
        }
      }
    }

    function next() { st.qi++; if (st.qi < m.questions.length) { sfx('whoosh'); drawQuestion(); } else complete(); }

    // ---------------- actividad completada
    async function complete() {
      const errors = st.results.filter((r) => r.tries > 1 || !r.correct).length;
      const stars = errors === 0 ? 3 : errors === 1 ? 2 : 1;
      const first = !moduleDone(m.id);
      const bonus = first ? 20 : 0; st.points += bonus; S.progress.points += bonus;
      const prev = S.progress.modules[m.id] || {};
      S.progress.modules[m.id] = { done: true, stars: Math.max(prev.stars || 0, stars) };
      if (!S.progress.stickers.includes('m' + m.id)) S.progress.stickers.push('m' + m.id);
      S.progress.currentModule = currentModuleId();
      const unlocks = evaluateUnlocks();
      const st2 = STICKERS.find((x) => x.id === 'm' + m.id);
      scene(m.scene); sfx('fanfare'); rain(50);
      hud({ chips: true, right: true, help: 'Muy bien. Toca Continuar para seguir con la historia.', pause: true });
      c.innerHTML = `<section class="done" aria-labelledby="d-t">
        ${actor({ char: hero(), pose: 'celebrate', face: 'cheer', x: 210, feet: 668, size: 400, label: 'Bloki celebra' })}
        ${actor({ char: m.companion, pose: 'dance', x: 1080, feet: 668, size: 380, dir: 'left', label: CHARACTERS[m.companion].name })}
        <div class="card done-card"><h1 id="d-t" class="scr-title">¡Actividad completada!</h1>
          <div class="stars" aria-label="${stars} de 3 estrellas">${[1, 2, 3].map((s) => `<span class="star-slot" data-s="${s}">${icon('starO', 62)}<span class="star-fill ${s <= stars ? 'on' : ''}" style="--d:${s * 0.45}s">${icon('star', 62)}</span></span>`).join('')}</div>
          <div class="done-row"><div class="pts"><small>Puntos ganados</small><b id="pts">0</b></div><div class="pts"><small>Tus puntos</small><b>${S.progress.points}</b></div></div>
          <div class="sticker-get" id="stk"><span class="stk-face">${faceSvg(m.emotion, 74)}</span><div><small>¡Nuevo sticker!</small><b>${esc(st2.name)}</b></div></div>
          <p class="note ok">${icon('check', 18)} Tu avance se guardó.</p>
          <div class="row center"><button class="btn primary xl" id="cont">Continuar ${icon('next', 28)}</button></div></div></section>`;
      
      countUp($('#pts'), st.points, 1100);
      [1, 2, 3].forEach((s) => { if (s <= stars) setTimeout(() => { sfx('star'); burst($(`.star-slot[data-s="${s}"]`), { count: 12, colors: ['#FFD84D', '#FFE9A0'] }); }, 450 * s); });
      setTimeout(() => { $('#stk').classList.add('in'); sfx('sticker'); }, 1700);
      await save();
      const cont = $('#cont'); cont.focus();
      cont.onclick = () => { sfx('pop'); go('moduleEnd', { module: m.id, unlocks }); };
    }

    drawIntro();
  },
};
