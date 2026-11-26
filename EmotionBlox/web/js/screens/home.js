// 01 Inicio  +  Continuar mi aventura
import { go, scene } from '../router.js';
import { $, $$, esc, hud, icon, openModal, faceSvg, toast } from '../ui.js';
import { actor } from '../actors.js';
import { sfx } from '../audio.js';
import { HELP, CHARACTERS, MODULES } from '../content.js';
import { api } from '../api.js';
import { clearChild, deviceIds, forgetChild, setChild, S } from '../state.js';
import { adultGate } from '../gate.js';

export const home = {
  render(c) {
    clearChild();
    scene('pradera');
    hud({ right: true, help: HELP.home });
    const letters = 'EmotionBlox'.split('').map((ch, i) => `<span style="--i:${i}" class="${i >= 7 ? 'b' : ''}">${ch}</span>`).join('');
    c.innerHTML = `
      <section class="home" aria-labelledby="logo">
        <div class="home-title">
          <h1 class="logo" id="logo" aria-label="EmotionBlox">${letters}</h1>
          <p class="tagline">¡Una aventura para conocer tus emociones!</p>
        </div>
        ${actor({ char: 'bloki', pose: 'wave', face: 'happy', x: 330, feet: 668, size: 400, label: 'Bloki saluda' })}
        ${actor({ char: 'soli', pose: 'jump', x: 960, feet: 626, size: 190, dir: 'left', label: 'Soli' })}
        ${actor({ char: 'nami', pose: 'idle', face: 'happy', x: 1090, feet: 636, size: 200, dir: 'left', label: 'Nami' })}
        ${actor({ char: 'brasa', pose: 'dance', x: 1185, feet: 646, size: 210, dir: 'left', label: 'Brasa' })}
        <div class="home-menu">
          <button class="btn primary xl" id="btn-new">${icon('play', 34)}<span>Iniciar nueva aventura</span></button>
          <button class="btn secondary xl" id="btn-cont">${icon('users', 34)}<span>Continuar mi aventura</span></button>
        </div>
        <button class="adult-btn" id="btn-adult">${icon('shield', 22)}<span>Soy adulto</span></button>
      </section>`;
    $('#btn-new').onclick = () => { sfx('pop'); go('create'); };
    $('#btn-cont').onclick = () => { sfx('pop'); go('continue'); };
    $('#btn-adult').onclick = async () => {
      sfx('tap');
      const ok = await adultGate({ title: 'Zona para adultos', text: 'Para entrar, resuelve esta suma.' });
      if (!ok) return;
      const m = openModal(`<h2 id="m-title">¿A qué zona quieres entrar?</h2>
        <div class="stack"><button class="btn secondary big" data-go="parent">${icon('heart', 26)} Soy un padre o una madre</button>
        <button class="btn secondary big" data-go="admin">${icon('shield', 26)} Soy un administrador</button></div>
        <div class="row center"><button class="btn ghost" data-go="">Cancelar</button></div>`, { cls: 'small' });
      m.el.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { sfx('tap'); m.close(); if (b.dataset.go) go(b.dataset.go); });
    };
  },
};

export const continueScreen = {
  async render(c) {
    scene('pradera');
    hud({ left: { label: 'Volver', action: () => go('home') }, right: true, help: HELP.home });
    c.innerHTML = `<section class="cont" aria-labelledby="cont-t"><h1 id="cont-t" class="scr-title">¿Quién va a jugar hoy?</h1><div class="cont-grid" id="cont-grid" aria-busy="true"><p class="muted">Buscando tus aventuras…</p></div></section>`;
    const grid = $('#cont-grid'); let list = [];
    const ids = deviceIds();
    try { list = ids.length ? (await api.get('/api/children?ids=' + ids.join(','))).children : []; } catch (e) { grid.innerHTML = `<div class="card empty"><p>${esc(e.message)}</p><button class="btn primary" id="retry">Intentar otra vez</button></div>`; $('#retry').onclick = () => go('continue', {}, { quick: true }); return; }
    ids.forEach((id) => { if (!list.find((x) => x.id === id)) forgetChild(id); });
    grid.setAttribute('aria-busy', 'false');
    if (!list.length) {
      grid.innerHTML = `<div class="card empty"><div class="modal-icon primary">${icon('users', 34)}</div><h2>Aún no hay aventuras en este dispositivo</h2><p>Empieza una nueva para recibir a Bloki.</p><button class="btn primary big" id="start-new">${icon('play', 26)} Iniciar nueva aventura</button></div>`;
      $('#start-new').onclick = () => { sfx('pop'); go('create'); };
      
      return;
    }
    grid.innerHTML = list.map((ch, i) => {
      const char = CHARACTERS[ch.character] || CHARACTERS.bloki;
      return `<button class="profile" data-id="${ch.id}" style="--i:${i};--tone:${char.torso}">
        <span class="profile-av">${faceSvg(['alegre', 'tranquilo', 'triste', 'asustado'][i % 4], 74)}</span>
        <span class="profile-name">${esc(ch.name)}</span>
        <span class="profile-meta">${icon('star', 18)} ${ch.points} puntos</span>
        <span class="profile-meta">${ch.modulesDone >= MODULES.length ? 'Aventura completa' : 'Va en: ' + esc(MODULES[Math.min(ch.currentModule, MODULES.length) - 1].name)}</span></button>`;
    }).join('') + `<button class="profile add" id="add-new"><span class="profile-av">${icon('plus', 40)}</span><span class="profile-name">Nueva aventura</span></button>`;
    $$('.profile[data-id]').forEach((b) => b.onclick = async () => {
      sfx('pop'); b.classList.add('busy');
      try {
        const { child } = await api.get('/api/children/' + b.dataset.id);
        setChild(child); toast(`¡Hola de nuevo, ${child.name}!`, { icon: 'star' });
        go(S.progress.seenIntro ? 'map' : 'intro');
      } catch (e) { b.classList.remove('busy'); toast(e.message, { tone: 'warn', icon: 'info', ms: 3500 }); }
    });
    $('#add-new').onclick = () => { sfx('pop'); go('create'); };
    
  },
};
