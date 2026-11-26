// Punto de entrada: registra las pantallas, escala el juego a la ventana y arranca el escenario 3D.
import { register, go } from './router.js';
import { initStage, resize } from './stage.js';
import { setSetting, settings } from './state.js';
import { home, continueScreen } from './screens/home.js';
import { create } from './screens/create.js';
import { intro } from './screens/intro.js';
import { map } from './screens/map.js';
import { loading, activity } from './screens/activity.js';
import { moduleEnd, finale } from './screens/moduleEnd.js';
import { checkin } from './screens/checkin.js';
import { achievements, characters } from './screens/rewards.js';
import { parent } from './screens/parent.js';
import { admin } from './screens/admin.js';

Object.entries({ home, continue: continueScreen, create, intro, map, loading, activity, moduleEnd, finale, checkin, achievements, characters, parent, admin })
  .forEach(([k, v]) => register(k, v));

// El juego se diseña a 1280×720 y se escala para caber en cualquier ventana de computadora.
function fit() {
  const g = document.getElementById('game');
  const k = Math.min(window.innerWidth / 1280, window.innerHeight / 720);
  g.style.transform = `translate(-50%, -50%) scale(${k})`;
  resize();
}
window.addEventListener('resize', fit);

setSetting('reduceMotion', settings.reduceMotion);
fit();
initStage();
go('home', {}, { quick: true });

window.addEventListener('unhandledrejection', (e) => console.error('Promesa sin atender:', e.reason));
