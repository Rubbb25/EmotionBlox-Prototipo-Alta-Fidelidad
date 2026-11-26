# EmotionBlox

Juego web educativo (niños de 6 a 10 años) para reconocer **alegría, tristeza, enojo y miedo**, con portal para
padres y panel de administración. Proyecto académico de *Usabilidad y Accesibilidad* (EPN).

## Cómo ejecutarlo

Solo necesitas **Python 3** (no hay que instalar nada más; no usa Node ni paquetes externos).

```powershell
cd EmotionBlox
python server.py
```

Abre **http://localhost:8000** en Chrome o Edge (de computadora). Para volver a empezar con datos de ejemplo limpios:
`python server.py --reset`.

> La fuente Nunito se carga desde Google Fonts; sin internet se usa una fuente redondeada del sistema.
> Three.js (3D) ya está incluido en `web/vendor/`, así que el juego funciona sin internet.

## Datos de demostración (solo para probar)

| Qué | Dato |
|---|---|
| Administrador | correo `admin@emotionblox.test` · contraseña `Admin2026!` |
| Padre con 2 hijos (selector de hijos) | `familia.demo@ejemplo.test` |
| Otros padres de ejemplo | `padre01@ejemplo.test` … `padre10@ejemplo.test` |

**Los correos son simulados:** nunca se envía un correo real. El "mensaje" con el código de 6 números aparece en una
bandeja de ejemplo dentro de la app y también se imprime en la consola del servidor. Cambia la contraseña del
administrador (botón *¿Olvidaste tu contraseña?*) o la constante `ADMIN_PASSWORD` de `server.py` antes de un uso real.

## Arquitectura (simple a propósito)

```
EmotionBlox/
  server.py            Servidor Python estándar + SQLite (data/emotionblox.db) + API JSON
  web/
    index.html         Una sola página; el juego se dibuja a 1280×720 y se escala a la ventana
    css/styles.css     Diseño: pastel, formas planas, botones tipo juego
    js/
      content.js       TODO el texto: emociones, módulos, preguntas, historia, personajes, logros
      characters3d.js  Personajes de bloques en 3D (Three.js), caras y poses
      stage.js         Un solo canvas 3D que dibuja a cada personaje dentro de su recuadro HTML
      scenery.js       Fondos ilustrados por escenario (pradera, lago, volcán, cueva, arcoíris)
      audio.js         Música generativa por emoción y efectos de sonido (sin archivos de audio)
      screens/         Una pantalla por archivo (home, create, intro, map, activity, …, parent, admin)
    vendor/            Three.js
```

- **Personajes:** son **originales** (Bloki, Soli, Nami, Brasa, Luma, Mica, Tico, Coro), de bloques con aspecto tipo lego.
  No usan el nombre, el logo ni los avatares de Roblox. Sus colores y accesorios se cambian en `content.js` (`CHARACTERS`).
- **Cambiar la historia o las preguntas:** edita `web/js/content.js` (`MODULES`, `INTRO_PANELS`). Nada más.

## Qué hace de "videojuego"

Personajes 3D que respiran, parpadean, saltan, celebran y siguen el cursor con la cabeza (y reaccionan si los tocas) ·
paisajes con nubes, polen, lluvia, brasas y luciérnagas · música que cambia con cada emoción · efectos de sonido ·
confeti, estrellas, puntos, rachas, stickers, insignias y personajes secretos que se desbloquean · mapa horizontal
arrastrable · cinemáticas cortas · silueta de los personajes bloqueados.

## Cómo responde a la evaluación heurística (40 problemas)

| Heurística | Problemas | Qué se hizo |
|---|---|---|
| H1 Visibilidad | 1-5 | La selección se marca con **borde grueso** (el ✓ es solo para acertar). "Listo" del registro empieza desactivado. Puntos y racha visibles en el mapa y en *Mis logros*. Barras del padre con valores ("2 de 3") y leyenda. Aviso **"¡Guardado!"** al guardar. |
| H2 Mundo real | 6-9 | La escena de cada pregunta **coincide con la emoción correcta** (cara y pose). Instrucción "Mira la escena y toca…". **Un solo nombre** por lugar ("Pradera de la Alegría"). El rojo queda para *Enojado*; el error usa **naranja suave**. |
| H3 Control | 10-13 | **Continuar mi aventura** (lista de aventuras del dispositivo). Botón **Anterior** en las historias. Confirmación "¿Quieres salir? Tu avance está guardado". Tras **2 intentos** se muestra la respuesta con su explicación y se puede continuar. |
| H4 Consistencia | 14-21 | **4 lugares** en mapa, padre y administrador. Protagonista fijo y personajes que se desbloquean (el elegido es el protagonista en todas las escenas). Mismos nombres de emociones en todo el sistema. Navegación unificada: *Volver* arriba a la izquierda; música · ayuda · pausa arriba a la derecha; *Cerrar sesión* en ambos portales. La **pausa** está también en la historia. La galería usa la misma plantilla. |
| H5 Prevención | 22-24 | El **correo lo escribe y confirma un adulto** (doble campo, validación y **código de confirmación**). Los accesos de adultos están detrás de **"Soy adulto" + una suma**. Acciones con texto ("Ver detalles", "Eliminar") y **confirmación** al borrar. |
| H6 Reconocer | 25-28 | Tocar un logro bloqueado explica cómo conseguirlo. El portal de padres muestra una **pista del correo** (`p***@dominio`). Botón *¿Cómo me siento?* con icono de caras. Buscador con etiqueta y ejemplo. |
| H7 Flexibilidad | 29-30 | Tabla con **orden por columna, filtro por lugar y paginación**. **Selector de hijos** para familias con hermanos. |
| H8 Minimalismo | 31-35 | Mapa despejado (etiquetas únicas, menú lateral, sin solapes). Un solo botón para avanzar. Textos de 16 px o más y colores oscuros sobre fondos claros. Sin flecha confusa junto a "¡Empezar!". |
| H9 Errores | 36-37 | Mensajes claros junto al campo (vacío, correo inválido, correo no registrado, código incorrecto). Credenciales incorrectas + **¿Olvidaste tu contraseña?** |
| H10 Ayuda | 38-40 | Botón **?** fijo en todas las pantallas del niño que explica qué hacer. Iconos de información en cada tarjeta del padre que explican de dónde salen los datos. |
| Otras | Privacidad, marca | El padre entra con **código enviado al correo** (no basta con conocer el correo). Se quitó el texto "ROBLOX" y los avatares copiados. |

### Límites conocidos (para ser honestos en la evaluación)

- "Tranquilo" aparece solo en el registro diario y en el panel del padre; las preguntas y los lugares usan las 4 emociones principales.
- El contraste se cuidó con colores oscuros sobre fondos claros, pero no se midió con una herramienta automática.
- Está pensado para computadora (horizontal). No se adaptó a celulares.
- Los correos son simulados (no hay envío real).

- La **voz del guía fue retirada** a petición del equipo: el juego no tiene narración; todo el texto es visible en pantalla. Esto aumenta la dependencia de la lectura para los niños de 6-7 años (ver problemas 7 y 38 de la evaluación).
