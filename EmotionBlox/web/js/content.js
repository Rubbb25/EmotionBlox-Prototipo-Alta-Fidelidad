// Contenido del juego: emociones, módulos, preguntas, personajes, logros.
// TODO el texto del juego vive aquí, para cambiarlo sin tocar el resto del código.
// Los nombres de emociones son los MISMOS en el juego, el padre y el administrador (heurística H4).

export const TOTAL_MODULES = 4;

export const EMOTIONS = {
  alegre:   { id: 'alegre',   label: 'Alegre',   bg: '#FFE08A', deep: '#FFC93C', ink: '#5A4000', face: 'happy' },
  triste:   { id: 'triste',   label: 'Triste',   bg: '#BFDDFF', deep: '#7DB5F5', ink: '#173F73', face: 'sad' },
  enojado:  { id: 'enojado',  label: 'Enojado',  bg: '#FFC1C9', deep: '#F58A97', ink: '#7A1E2E', face: 'angry' },
  asustado: { id: 'asustado', label: 'Asustado', bg: '#DCCBFF', deep: '#B292F5', ink: '#3F2480', face: 'scared' },
  tranquilo:{ id: 'tranquilo',label: 'Tranquilo',bg: '#BDF0DA', deep: '#7FD9B4', ink: '#145A3F', face: 'calm' },
};
export const MODULE_EMOTIONS = ['alegre', 'triste', 'enojado', 'asustado'];
export const CHECKIN_EMOTIONS = ['alegre', 'triste', 'enojado', 'asustado', 'tranquilo'];

// ---------------------------------------------------------------- Personajes
// Personajes ORIGINALES de bloques (no son avatares de ninguna marca).
// Para cambiarlos: editar los colores/accesorios aquí o reemplazar js/characters3d.js.
export const CHARACTERS = {
  bloki: { id: 'bloki', name: 'Bloki', role: 'Protagonista', skin: '#FFD6B0', torso: '#FF8FA3', legs: '#5B6BD6', accent: '#FFD84D', acc: 'cap', emblem: 'star',
           bio: 'Valiente y curioso. Quiere recuperar las Gemas de las Emociones.', unlock: null },
  soli:  { id: 'soli', name: 'Soli', role: 'Amiga de la Pradera', skin: '#FFE7A8', torso: '#FFD84D', legs: '#FFA94D', accent: '#7FD97F', acc: 'sprout', emblem: 'sun',
           bio: 'Siempre sonríe y le encanta saltar.', unlock: 'Termina la Pradera de la Alegría' },
  nami:  { id: 'nami', name: 'Nami', role: 'Amiga del Lago', skin: '#E3F0FF', torso: '#8EC5FF', legs: '#5B8FD6', accent: '#FFFFFF', acc: 'cloud', emblem: 'drop',
           bio: 'Es sensible y buena para escuchar.', unlock: 'Termina el Lago de la Tristeza' },
  brasa: { id: 'brasa', name: 'Brasa', role: 'Amigo del Volcán', skin: '#FFD3C2', torso: '#FF8A7A', legs: '#7A4F9E', accent: '#FFC94D', acc: 'flame', emblem: 'flame',
           bio: 'Fuerte y de carácter. Está aprendiendo a calmarse.', unlock: 'Termina el Volcán del Enojo' },
  luma:  { id: 'luma', name: 'Luma', role: 'Amiga de la Cueva', skin: '#E9DDFF', torso: '#B79CFF', legs: '#6A5CA8', accent: '#FFE27A', acc: 'ears', emblem: 'moon',
           bio: 'Pequeña y valiente, aunque a veces tiene miedo.', unlock: 'Termina la Cueva del Miedo' },
  mica:  { id: 'mica', name: 'Mica', role: 'Personaje secreto', skin: '#DDF7EA', torso: '#8FE3C0', legs: '#4FA987', accent: '#FFFFFF', acc: 'leaf', emblem: 'leaf',
           bio: 'Calma y paciencia. Respira hondo con ella.', unlock: 'Cuenta cómo te sientes 3 veces' },
  tico:  { id: 'tico', name: 'Tico', role: 'Personaje secreto', skin: '#C9D6E3', torso: '#9FB4C7', legs: '#6F86A0', accent: '#FF8FA3', acc: 'antenna', emblem: 'gear',
           bio: 'Un robot que colecciona estrellas.', unlock: 'Gana 9 estrellas' },
  coro:  { id: 'coro', name: 'Coro', role: 'Personaje secreto', skin: '#FFE7B8', torso: '#F2B84B', legs: '#A55E9E', accent: '#FFE27A', acc: 'crown', emblem: 'crown',
           bio: 'El rey de los bloques. Solo llega con los campeones.', unlock: 'Termina toda la aventura' },
};
export const CHARACTER_ORDER = ['bloki', 'soli', 'nami', 'brasa', 'luma', 'mica', 'tico', 'coro'];

// ---------------------------------------------------------------- Módulos
// Un solo nombre por parada del mapa (heurística H2, problema #8).
export const MODULES = [
  {
    id: 1, name: 'Pradera de la Alegría', short: 'Alegría', emotion: 'alegre', scene: 'pradera', companion: 'soli', gem: '#FFD84D',
    introLine: 'Soli está muy contenta hoy. ¡Vamos a descubrir por qué!',
    endLines: [
      '¡Lo logramos! La Gema de la Alegría vuelve a brillar.',
      'Soli quiere ser tu amiga. ¡Ahora puedes jugar con ella!',
    ],
    questions: [
      { id: 'm1q1', type: 'emotion', scene: { char: 'soli', pose: 'celebrate', face: 'happy' },
        prompt: 'Soli recibió un regalo sorpresa. ¿Cómo se siente Soli?',
        options: ['alegre', 'triste', 'enojado', 'asustado'], answer: 'alegre',
        hint: 'Mira su cara y cómo salta. ¿Qué sientes tú cuando recibes un regalo?',
        explain: 'Cuando nos pasa algo bonito sentimos alegría: sonreímos y queremos saltar.' },
      { id: 'm1q2', type: 'words', scene: { char: 'bloki', pose: 'jump', face: 'happy' },
        prompt: 'Bloki salta de felicidad. ¿Cuándo sentimos alegría?',
        options: [
          { id: 'a', label: 'Cuando juego con mis amigos' }, { id: 'b', label: 'Cuando me quitan mi juguete' },
          { id: 'c', label: 'Cuando oigo un ruido fuerte' }, { id: 'd', label: 'Cuando me pierdo' }],
        answer: 'a', hint: 'Piensa en algo que te hace sonreír.',
        explain: 'Jugar con amigos nos da alegría. ¡Es una de las mejores cosas!' },
      { id: 'm1q3', type: 'words', scene: { char: 'soli', pose: 'wave', face: 'happy' },
        prompt: 'Soli está alegre. ¿Qué puede hacer para compartir su alegría?',
        options: [
          { id: 'a', label: 'Esconderse sola' }, { id: 'b', label: 'Abrazar a un amigo' },
          { id: 'c', label: 'Romper un juguete' }, { id: 'd', label: 'Irse sin hablar' }],
        answer: 'b', hint: 'Compartir es hacer que otros también se sientan bien.',
        explain: 'Un abrazo o una sonrisa hacen que otros también se sientan alegres.' },
    ],
  },
  {
    id: 2, name: 'Lago de la Tristeza', short: 'Tristeza', emotion: 'triste', scene: 'lago', companion: 'nami', gem: '#7DB5F5',
    introLine: 'Nami está un poco apagada. ¿La ayudamos a entender lo que siente?',
    endLines: [
      'Muy bien. Ahora sabes que estar triste también está bien.',
      'Nami se siente mejor y quiere acompañarte. ¡Es tu nueva amiga!',
    ],
    questions: [
      { id: 'm2q1', type: 'emotion', scene: { char: 'nami', pose: 'sad', face: 'sad' },
        prompt: 'A Nami se le cayó su helado al suelo. ¿Cómo se siente Nami?',
        options: ['alegre', 'triste', 'enojado', 'asustado'], answer: 'triste',
        hint: 'Fíjate en su cara y en cómo agacha la cabeza.',
        explain: 'Cuando perdemos algo que queremos, sentimos tristeza. Es normal.' },
      { id: 'm2q2', type: 'words', scene: { char: 'nami', pose: 'sad', face: 'sad' },
        prompt: 'Nami está triste. ¿Qué puede hacer para sentirse mejor?',
        options: [
          { id: 'a', label: 'Pelear con todos' }, { id: 'b', label: 'No decir nada nunca' },
          { id: 'c', label: 'Hablar con alguien que la quiere' }, { id: 'd', label: 'Quedarse sola para siempre' }],
        answer: 'c', hint: 'Hay personas que nos quieren y nos escuchan.',
        explain: 'Hablar con alguien de confianza nos ayuda a sentirnos mejor.' },
      { id: 'm2q3', type: 'words', scene: { char: 'bloki', pose: 'sad', face: 'sad' },
        prompt: 'Bloki también está triste. ¿Qué sentimos en el cuerpo cuando estamos tristes?',
        options: [
          { id: 'a', label: 'Ganas de saltar' }, { id: 'b', label: 'Ganas de llorar' },
          { id: 'c', label: 'Ganas de bailar' }, { id: 'd', label: 'Ganas de reír mucho' }],
        answer: 'b', hint: 'Cuando algo nos duele por dentro, a veces salen lágrimas.',
        explain: 'Llorar está bien. Las lágrimas ayudan a soltar la tristeza.' },
    ],
  },
  {
    id: 3, name: 'Volcán del Enojo', short: 'Enojo', emotion: 'enojado', scene: 'volcan', companion: 'brasa', gem: '#F58A97',
    introLine: 'Brasa está muy caliente por dentro. ¡Aprendamos a calmar el enojo!',
    endLines: [
      'Respiraste hondo y el volcán se calmó. ¡Qué bien lo hiciste!',
      'Brasa ya sabe calmarse. Ahora es tu amigo.',
    ],
    questions: [
      { id: 'm3q1', type: 'emotion', scene: { char: 'brasa', pose: 'angry', face: 'angry' },
        prompt: 'Alguien rompió la torre de Brasa sin querer. ¿Cómo se siente Brasa?',
        options: ['alegre', 'triste', 'enojado', 'asustado'], answer: 'enojado',
        hint: 'Mira sus cejas y sus puños.',
        explain: 'Cuando algo nos molesta o nos parece injusto, sentimos enojo.' },
      { id: 'm3q2', type: 'words', scene: { char: 'brasa', pose: 'angry', face: 'angry' },
        prompt: 'Brasa siente que va a explotar. ¿Qué puede hacer primero?',
        options: [
          { id: 'a', label: 'Gritar a todos' }, { id: 'b', label: 'Respirar hondo y contar hasta cinco' },
          { id: 'c', label: 'Pegarle a su amigo' }, { id: 'd', label: 'Romper sus cosas' }],
        answer: 'b', hint: 'Primero hay que calmar el cuerpo.',
        explain: 'Respirar hondo ayuda a apagar el fuego del enojo.' },
      { id: 'm3q3', type: 'words', scene: { char: 'bloki', pose: 'think', face: 'neutral' },
        prompt: 'Ya más tranquilo, Brasa quiere hablar. ¿Qué puede decir?',
        options: [
          { id: 'a', label: 'Eres malo, no juego más' }, { id: 'b', label: 'No me importa nada' },
          { id: 'c', label: 'Me enojé porque rompiste mi torre' }, { id: 'd', label: 'Nada, me callo para siempre' }],
        answer: 'c', hint: 'Decir lo que sentimos con calma ayuda a que nos entiendan.',
        explain: 'Explicar qué sentimos y por qué ayuda a arreglar el problema.' },
    ],
  },
  {
    id: 4, name: 'Cueva del Miedo', short: 'Miedo', emotion: 'asustado', scene: 'cueva', companion: 'luma', gem: '#B292F5',
    introLine: 'Luma escuchó un ruido en la oscuridad. ¡Vamos a ayudarla!',
    endLines: [
      '¡Fuiste muy valiente! El miedo ya no es tan grande.',
      'Luma te acompaña. ¡Tienes todas las gemas!',
    ],
    questions: [
      { id: 'm4q1', type: 'emotion', scene: { char: 'luma', pose: 'scared', face: 'scared' },
        prompt: 'Luma oye un ruido raro en la oscuridad. ¿Cómo se siente Luma?',
        options: ['alegre', 'triste', 'enojado', 'asustado'], answer: 'asustado',
        hint: 'Mira sus ojos grandes y cómo tiembla.',
        explain: 'Cuando algo nos parece peligroso o desconocido, sentimos miedo.' },
      { id: 'm4q2', type: 'words', scene: { char: 'luma', pose: 'scared', face: 'scared' },
        prompt: 'Luma tiene miedo. ¿Qué puede hacer para sentirse segura?',
        options: [
          { id: 'a', label: 'Correr sin mirar' }, { id: 'b', label: 'Taparse y no decir nada' },
          { id: 'c', label: 'Quedarse sola a oscuras' }, { id: 'd', label: 'Pedir ayuda a un adulto' }],
        answer: 'd', hint: 'Los adultos de confianza pueden cuidarnos.',
        explain: 'Pedir ayuda cuando tenemos miedo es muy valiente.' },
      { id: 'm4q3', type: 'words', scene: { char: 'bloki', pose: 'wave', face: 'happy' },
        prompt: 'Bloki quiere calmar su miedo. ¿Qué puede pensar?',
        options: [
          { id: 'a', label: 'Respiro hondo y voy con alguien' }, { id: 'b', label: 'Nunca más salgo de casa' },
          { id: 'c', label: 'No puedo hacer nada' }, { id: 'd', label: 'Me quedo muy quieto sin respirar' }],
        answer: 'a', hint: 'Respirar y buscar compañía ayuda mucho.',
        explain: 'El miedo nos cuida. Respirar y buscar compañía nos hace sentir seguros.' },
    ],
  },
];

// ---------------------------------------------------------------- Historia (introducción)
export const INTRO_PANELS = [
  { scene: 'pradera', pose: 'wave', face: 'happy', text: '¡Hola, {name}! Yo soy Bloki y vivo en el Mundo de Bloques.' },
  { scene: 'pradera', dim: true, pose: 'sad', face: 'sad', text: 'Un día, el viento se llevó las Gemas de las Emociones y los colores se apagaron.' },
  { scene: 'pradera', pose: 'think', face: 'neutral', showEmotions: true, text: 'Para recuperarlas, tenemos que entender cuatro emociones: alegría, tristeza, enojo y miedo.' },
  { scene: 'pradera', pose: 'celebrate', face: 'happy', text: '¿Me ayudas, {name}? ¡Vamos a empezar la aventura!' },
];

// ---------------------------------------------------------------- Registro diario
export const CHECKIN_REPLIES = {
  alegre: { pose: 'celebrate', face: 'happy', text: '¡Qué bien que estés alegre! Cuéntale a alguien qué te hizo sentir así.' },
  triste: { pose: 'sad', face: 'sad', text: 'Gracias por contármelo. Estar triste está bien. Puedes pedir un abrazo.' },
  enojado: { pose: 'angry', face: 'angry', text: 'Entiendo. Respira hondo tres veces conmigo: uno, dos, tres.' },
  asustado: { pose: 'scared', face: 'scared', text: 'Eres valiente por decirlo. Cuéntale a un adulto de confianza qué te asusta.' },
  tranquilo: { pose: 'idle', face: 'calm', text: '¡Qué paz! Disfruta esa calma y úsala cuando lo necesites.' },
};

// ---------------------------------------------------------------- Insignias y stickers
export const BADGES = {
  primera:   { id: 'primera',   name: 'Primer paso',      how: 'Termina tu primera actividad.', icon: 'footsteps' },
  sinerrores:{ id: 'sinerrores',name: 'Cero errores',     how: 'Termina una actividad con 3 estrellas.', icon: 'target' },
  explorador:{ id: 'explorador',name: 'Explorador',       how: 'Cuenta cómo te sientes 3 veces.', icon: 'compass' },
  estrellas: { id: 'estrellas', name: 'Cazaestrellas',    how: 'Reúne 9 estrellas.', icon: 'star' },
  racha:     { id: 'racha',     name: 'Racha de 3 días',  how: 'Juega 3 días seguidos.', icon: 'flame' },
  completo:  { id: 'completo',  name: 'Maestro de emociones', how: 'Termina toda la aventura.', icon: 'trophy' },
};
export const BADGE_ORDER = ['primera', 'sinerrores', 'explorador', 'estrellas', 'racha', 'completo'];

// Stickers: uno por módulo + uno final.
export const STICKERS = [
  { id: 'm1', name: 'Sol sonriente', emotion: 'alegre', how: 'Termina la Pradera de la Alegría.' },
  { id: 'm2', name: 'Gota amiga', emotion: 'triste', how: 'Termina el Lago de la Tristeza.' },
  { id: 'm3', name: 'Volcán calmado', emotion: 'enojado', how: 'Termina el Volcán del Enojo.' },
  { id: 'm4', name: 'Luna valiente', emotion: 'asustado', how: 'Termina la Cueva del Miedo.' },
  { id: 'final', name: 'Arcoíris', emotion: 'tranquilo', how: 'Termina toda la aventura.' },
];

// ---------------------------------------------------------------- Ayuda por pantalla (botón "?")
export const HELP = {
  home: 'Toca Iniciar nueva aventura para empezar, o Continuar mi aventura si ya jugaste antes.',
  create: 'Escribe tu nombre. Después un adulto te ayuda con el correo.',
  intro: 'Escucha la historia. Toca Siguiente para avanzar, Anterior para volver, o Saltar si ya la conoces.',
  map: 'Este es tu mapa. Toca el lugar que brilla para jugar. Los candados se abren al terminar el anterior.',
  activity: 'Escucha la pregunta y toca la respuesta que creas. Después toca Comprobar.',
  question: 'Toca una respuesta y luego Comprobar. Si no estás seguro, lee otra vez la pregunta.',
  checkin: 'Toca la cara que mejor muestre cómo te sientes hoy. Después toca Listo.',
  achievements: 'Aquí están tus stickers e insignias. Toca uno con candado para saber cómo conseguirlo.',
  characters: 'Estos son tus amigos. Los que tienen candado se desbloquean jugando.',
};
