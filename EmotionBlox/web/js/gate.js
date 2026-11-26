// Barrera parental: una suma sencilla que un adulto resuelve fácilmente (heurística H5).
import { openModal, esc, shake, icon } from './ui.js';
import { sfx } from './audio.js';

export function adultGate({ title = 'Solo para adultos', text = 'Para seguir, resuelve esta suma.' } = {}) {
  return new Promise((resolve) => {
    let a, b, answer, opts;
    const make = () => {
      a = 6 + Math.floor(Math.random() * 8); b = 5 + Math.floor(Math.random() * 8); answer = a + b;
      const set = new Set([answer]); while (set.size < 4) set.add(answer + Math.floor(Math.random() * 9) - 4 || answer + 5);
      opts = [...set].sort(() => Math.random() - 0.5);
    };
    make();
    const m = openModal('', { cls: 'small gate' });
    let done = false; const finish = (v) => { if (done) return; done = true; resolve(v); m.close(v); };
    const draw = (msg = '') => {
      m.el.innerHTML = `<div class="modal-icon primary">${icon('shield', 34)}</div><h2 id="m-title">${esc(title)}</h2><p>${esc(text)}</p>
        <div class="sum" aria-live="polite">${a} + ${b} = ?</div>
        <div class="sum-opts" role="group" aria-label="Respuestas">${opts.map((o) => `<button class="btn secondary" data-v="${o}">${o}</button>`).join('')}</div>
        <p class="err-msg" id="gate-err" role="alert">${esc(msg)}</p>
        <div class="row center"><button class="btn ghost" data-act="cancel">Cancelar</button></div>`;
      m.el.querySelectorAll('[data-v]').forEach((btn) => btn.onclick = () => {
        if (parseInt(btn.dataset.v, 10) === answer) { sfx('correct'); finish(true); } else { sfx('error'); shake(m.el); make(); draw('Ese no es. Inténtalo otra vez con esta suma.'); const f = m.el.querySelector('[data-v]'); if (f) f.focus(); }
      });
      m.el.querySelector('[data-act=cancel]').onclick = () => { sfx('back'); finish(false); };
    };
    draw();
    m.onClose = () => { if (!done) { done = true; resolve(false); } };
  });
}
