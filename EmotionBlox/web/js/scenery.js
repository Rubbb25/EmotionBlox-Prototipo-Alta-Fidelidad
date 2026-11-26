// Fondos ilustrados 2D planos (sin bordes, colores pastel) para cada escenario.
// El suelo empieza en y = 600 (de 720): los personajes se paran sobre esa línea.
export const GROUND_Y = 600;

const THEMES = {
  pradera: { sky: ['#B9E3FF', '#EAF7FF'], hills: ['#BDEBC4', '#A5E1B0'], ground: ['#8DDBA0', '#74CB8B'], sun: '#FFE680', deco: 'flowers', parts: 'pollen', mood: 'alegre' },
  lago:    { sky: ['#B4D3F8', '#E2EEFF'], hills: ['#B8CEF0', '#9DBCE8'], ground: ['#8FBDF2', '#6FA6E8'], sun: '#F6F1FF', deco: 'reeds', parts: 'rain', mood: 'triste' },
  volcan:  { sky: ['#FFCFB4', '#FFEAD6'], hills: ['#EBA98F', '#DF8F74'], ground: ['#EDB08C', '#DD9370'], sun: '#FFD98A', deco: 'volcano', parts: 'embers', mood: 'enojado' },
  cueva:   { sky: ['#40376E', '#6D5FB0'], hills: ['#5A4C9A', '#4A3E86'], ground: ['#6A5BB0', '#5649A0'], sun: '#E9E0FF', deco: 'crystals', parts: 'fireflies', mood: 'asustado' },
  arcoiris:{ sky: ['#C9E9FF', '#FFF0FA'], hills: ['#C8F0D2', '#AEE6BD'], ground: ['#92DFA6', '#78D091'], sun: '#FFE680', deco: 'rainbow', parts: 'confetti', mood: 'final' },
  adultos: { sky: ['#EFEAFF', '#FAF8FF'], hills: null, ground: null, sun: null, deco: 'none', parts: 'none', mood: 'menu' },
};
export const sceneMood = (name) => (THEMES[name] || THEMES.pradera).mood;

let uid = 0;
function cloud(x, y, s, op = 0.9) {
  return `<g class="cloud" style="--dur:${60 + (x % 40)}s;--delay:-${x % 50}s" opacity="${op}" transform="translate(${x} ${y}) scale(${s})"><g fill="#fff"><ellipse cx="0" cy="0" rx="70" ry="26"/><ellipse cx="-40" cy="8" rx="46" ry="20"/><ellipse cx="42" cy="8" rx="52" ry="22"/><ellipse cx="10" cy="-18" rx="38" ry="24"/></g></g>`;
}

function decoration(kind, th) {
  const g = GROUND_Y;
  switch (kind) {
    case 'flowers': {
      let s = '';
      const cols = ['#FF9EB5', '#FFE27A', '#fff', '#C5A8FF'];
      for (let i = 0; i < 26; i++) { const x = 20 + ((i * 197) % 1240), y = g + 24 + ((i * 53) % 80); const c = cols[i % 4]; s += `<g transform="translate(${x} ${y})"><rect x="-1.5" y="0" width="3" height="12" fill="#5BBE74"/><circle cx="0" cy="-2" r="5" fill="${c}"/><circle cx="0" cy="-2" r="2" fill="#FFD84D"/></g>`; }
      // árboles
      [[120, 0.9], [1130, 1]].forEach(([x, sc]) => { s += `<g transform="translate(${x} ${g + 6}) scale(${sc})"><rect x="-9" y="-70" width="18" height="74" rx="6" fill="#C79568"/><circle cx="0" cy="-95" r="48" fill="#7ED494"/><circle cx="-30" cy="-72" r="30" fill="#8FE0A3"/><circle cx="30" cy="-72" r="30" fill="#6CC986"/></g>`; });
      return s;
    }
    case 'reeds': {
      let s = '';
      for (let i = 0; i < 14; i++) { const x = 40 + i * 95 + (i % 3) * 14, h = 50 + (i * 17) % 40; s += `<g transform="translate(${x} ${g + 18})"><rect x="-3" y="-${h}" width="6" height="${h}" rx="3" fill="#7DBE9A"/><ellipse cx="0" cy="-${h}" rx="7" ry="16" fill="#9C7B66"/></g>`; }
      for (let i = 0; i < 6; i++) { const x = 130 + i * 210, y = g + 60 + (i % 2) * 28; s += `<ellipse cx="${x}" cy="${y}" rx="40" ry="10" fill="#9BE0B8"/><circle cx="${x + 8}" cy="${y - 5}" r="6" fill="#FFB8D0"/>`; }
      s += `<g fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"><path d="M70 ${g + 90} q40 -10 80 0"/><path d="M520 ${g + 100} q50 -12 100 0"/><path d="M980 ${g + 84} q40 -10 80 0"/></g>`;
      return s;
    }
    case 'volcano': {
      return `<g><path d="M780 ${g + 4} L930 190 Q960 170 990 190 L1180 ${g + 4}Z" fill="#B9665A"/><path d="M930 190 Q960 170 990 190 L1005 230 Q960 210 915 230Z" fill="#FF8D5C"/><path d="M945 205 Q950 250 925 330 L945 330 Q965 250 960 205Z" fill="#FFA77A" opacity=".9"/><ellipse cx="960" cy="188" rx="34" ry="10" fill="#FFD27A"/></g>
        <g fill="#C97A68"><path d="M60 ${g + 4} L170 300 L300 ${g + 4}Z"/><path d="M250 ${g + 4} L360 380 L470 ${g + 4}Z"/></g>
        <g fill="#C9806E">${[...Array(10)].map((_, i) => `<ellipse cx="${60 + i * 130}" cy="${g + 40 + (i % 3) * 22}" rx="${22 + (i % 3) * 8}" ry="${8 + (i % 2) * 3}"/>`).join('')}</g>`;
    }
    case 'crystals': {
      let s = '';
      const c = ['#BFA6FF', '#8FE0FF', '#FF9EDC'];
      [[110, 140], [230, 90], [1060, 130], [1180, 80], [660, 70]].forEach(([x, h], i) => { s += `<polygon points="${x},${g + 6} ${x - 28},${g + 6 - h * 0.35} ${x - 8},${g + 6 - h} ${x + 24},${g + 6 - h * 0.5}" fill="${c[i % 3]}" opacity=".85"/><polygon points="${x - 8},${g + 6 - h} ${x + 24},${g + 6 - h * 0.5} ${x + 6},${g + 6}" fill="#fff" opacity=".25"/>`; });
      s += `<g fill="#fff">${[...Array(36)].map((_, i) => `<circle cx="${(i * 223) % 1280}" cy="${(i * 97) % 380}" r="${1 + (i % 3) * 0.8}" opacity="${0.4 + (i % 4) * 0.15}"/>`).join('')}</g>`;
      s += `<g fill="#3A2F68"><path d="M0 0 L0 200 Q70 120 140 150 Q200 60 280 0Z"/><path d="M1280 0 L1280 220 Q1200 150 1130 170 Q1060 70 980 0Z"/></g>`;
      return s;
    }
    case 'rainbow': {
      const cols = ['#FF9EB5', '#FFC88A', '#FFEA8A', '#A8E6B0', '#9CD2FF', '#C7B2FF'];
      return `<g fill="none" stroke-width="22" opacity=".9">${cols.map((c, i) => `<path d="M140 ${g + 4} A${500 - i * 22} ${470 - i * 22} 0 0 1 ${1140} ${g + 4}" stroke="${c}"/>`).join('')}</g>`;
    }
    default: return '';
  }
}

function particlesHtml(kind) {
  if (kind === 'none') return '';
  const n = kind === 'rain' ? 46 : kind === 'confetti' ? 40 : 26; let s = '';
  for (let i = 0; i < n; i++) {
    const left = (i * 37.7) % 100, delay = -((i * 1.37) % 9), dur = 5 + ((i * 0.83) % 6), size = 4 + (i % 5) * 2;
    const cols = ['#FF9EB5', '#FFE27A', '#9CD2FF', '#A8E6B0', '#C7B2FF'];
    s += `<i class="p ${kind}" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;--s:${size}px;--c:${cols[i % 5]};--top:${(i * 29) % 90}%"></i>`;
  }
  return `<div class="parts">${s}</div>`;
}

// Devuelve el SVG de un escenario (1280x720).
export function sceneSvg(name, { ground = true } = {}) {
  const th = THEMES[name] || THEMES.pradera; const id = 's' + (++uid); const g = GROUND_Y;
  if (name === 'adultos') {
    return `<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" width="1280" height="720"><defs><linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.sky[0]}"/><stop offset="1" stop-color="${th.sky[1]}"/></linearGradient></defs><rect width="1280" height="720" fill="url(#${id}sky)"/>${cloud(200, 120, 1, 0.7)}${cloud(980, 90, 1.2, 0.7)}${cloud(620, 160, 0.8, 0.5)}</svg>`;
  }
  const night = name === 'cueva';
  const sun = night
    ? `<circle cx="1060" cy="120" r="46" fill="${th.sun}"/><circle cx="1080" cy="108" r="40" fill="${th.sky[0]}" opacity=".9"/>`
    : `<circle cx="1060" cy="120" r="70" fill="${th.sun}" opacity=".35"/><circle cx="1060" cy="120" r="48" fill="${th.sun}"/>`;
  return `<svg viewBox="0 0 1280 720" preserveAspectRatio="xMidYMid slice" width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${id}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.sky[0]}"/><stop offset="1" stop-color="${th.sky[1]}"/></linearGradient>
      <linearGradient id="${id}gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.ground[0]}"/><stop offset="1" stop-color="${th.ground[1]}"/></linearGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#${id}sky)"/>
    ${sun}
    ${night ? '' : cloud(180, 130, 1) + cloud(560, 80, 0.8, 0.8) + cloud(900, 170, 1.15, 0.85)}
    <g class="hill-far"><path d="M-40 ${g} C 140 ${g - 150}, 360 ${g - 170}, 560 ${g - 70} S 940 ${g - 190}, 1320 ${g - 40} L1320 ${g + 10} L-40 ${g + 10}Z" fill="${th.hills[0]}"/></g>
    <g class="hill-near"><path d="M-40 ${g} C 200 ${g - 70}, 380 ${g - 90}, 640 ${g - 30} S 1060 ${g - 100}, 1320 ${g - 10} L1320 ${g + 10} L-40 ${g + 10}Z" fill="${th.hills[1]}"/></g>
    ${decoration(th.deco === 'volcano' || th.deco === 'rainbow' ? th.deco : 'none', th)}
    ${ground ? `<rect x="0" y="${g}" width="1280" height="${720 - g}" fill="url(#${id}gr)"/><path d="M0 ${g} Q 320 ${g - 12} 640 ${g} T 1280 ${g}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="5"/>` : ''}
    ${decoration(th.deco === 'volcano' || th.deco === 'rainbow' ? 'none' : th.deco, th)}
  </svg>${particlesHtml(th.parts)}`;
}

export function setScene(name, { dim = false } = {}) {
  const bg = document.getElementById('bg');
  const key = name + (dim ? ':dim' : '');
  if (bg.dataset.scene === key) return;
  bg.dataset.scene = key;
  bg.classList.toggle('dim', dim);
  bg.classList.add('swap');
  bg.innerHTML = sceneSvg(name);
  requestAnimationFrame(() => requestAnimationFrame(() => bg.classList.remove('swap')));
}
