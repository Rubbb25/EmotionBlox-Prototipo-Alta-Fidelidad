// Coloca un personaje 3D en pantalla. Los pies quedan en la coordenada y = feet.
// size = altura visible del personaje en px. x = centro horizontal.
import { GROUND_Y } from './scenery.js';
import { esc } from './ui.js';

export function actor({ char = 'bloki', pose = 'idle', face = '', dir = 'right', x = 400, feet = GROUND_Y + 40, size = 300, locked = false, spin = false, cls = '', id = '', label = '', clickable = true }) {
  const h = size / 0.82, w = h * 0.82;
  const left = Math.round(x - w / 2), top = Math.round(feet - 0.94 * h);
  return `<div class="actor ${cls}" ${id ? `id="${id}"` : ''} role="img" aria-label="${esc(label || char)}" data-char="${char}" data-pose="${pose}" ${face ? `data-face="${face}"` : ''} data-dir="${dir}" ${locked ? 'data-locked="1"' : ''} ${spin ? 'data-spin="1"' : ''} style="left:${left}px;top:${top}px;width:${Math.round(w)}px;height:${Math.round(h)}px;${clickable ? '' : 'pointer-events:none;'}"></div>`;
}
