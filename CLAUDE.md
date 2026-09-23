# CLAUDE.md: espacio-del-significado (UI)

> Copiado de `claude/templates/frontend.CLAUDE.md` y adaptado: este proyecto no tiene
> backend, así que varias reglas del template genérico no aplican (ver "Desviaciones" al
> final). Las reglas críticas de `claude/CLAUDE.md` (autoría, git) siguen aplicando siempre y
> no las sobreescribe este archivo.

## Contexto

- **Qué es:** experiencia interactiva de cuatro estaciones libres sobre cómo la IA representa el
  significado de las palabras (embeddings) y por qué eso importa (búsqueda semántica), para una
  charla de 10 minutos de Ciencias Abiertas UA a estudiantes de I y II° medio.
- **Dirección visual:** tarjetas planas sobre papel claro (`--paper #f5f1ea`), tabs simples, sin
  recuadros de callout: las explicaciones van como texto plano bajo el título o bajo la
  interacción, nunca en un cajón de "Idea clave" (se probó y no gustó, se sentía como un aviso
  forzado). El vector de una palabra se muestra como una **huella** (una mancha SVG de 7 puntas,
  `components/ui/Huella.tsx`), no como un punto en un mapa o un gráfico con ejes: se descartaron
  dos direcciones anteriores (un tema oscuro con neón, y un universo 3D navegable) por sentirse
  hechas por una IA y demasiado técnicas o como un videojuego para una charla de divulgación
  científica. También se descartó una estación de analogías ("sumar y restar significados"): no
  gustó como ejercicio y se sacó por completo; en su lugar se agregó una estación de búsqueda
  semántica (ver más abajo), pedida porque completar frases se sentía "poco IA" (el autocompletar
  del teléfono hace algo parecido hace años). Esa estación pasó por varias versiones descartadas
  (una sola palabra contra el vocabulario, una frase contra el vocabulario, una frase contra
  datos reales pero con un dato ambiguo entre dos búsquedas, luego frases naturales que "por
  letras" a veces sí encontraba) antes del diseño actual, con 3 reglas obligatorias (ver el
  comentario al inicio de `documents.ts`): la respuesta correcta NUNCA comparte ninguna palabra
  con su pregunta (así "búsqueda común" jamás la encuentra) y la pregunta comparte exactamente
  una palabra con 1 o 2 "distractores" absurdos de otro tema (así "búsqueda común" solo muestra
  esos). Es el diseño más estricto de los probados, y el único donde el contraste no depende de
  que la frase "suene natural pero no comparta palabras por casualidad": se garantiza por
  construcción.
- **Tipografía:** sigue el Manual de Normas Gráficas de la UA (`--font-ui`/`--font-display` en
  `tokens.css`). El manual pide Helvetica Rounded para el isologo y Futura (Light/HV/XBlk) para
  la jerarquía de textos, ambas comerciales y no incluidas en los materiales entregados (el
  propio PPT institucional termina usando Calibri/Arial como reemplazo práctico). Se usa **Jost**
  (Google Fonts, gratis) por ser el sustituto libre más cercano al trazo geométrico y circular de
  Futura. Si en algún momento se consigue el archivo de fuente con licencia web de Futura o
  Helvetica Rounded, reemplazar ahí mismo. Sin itálicas: ningún material real de la Universidad
  las usa.
- **Framework:** React 18 + Vite 5.
- **Lenguaje:** TypeScript estricto (`strict`, `noUncheckedIndexedAccess`, sin `any`).
- **Estilos:** CSS plano por componente + `src/styles/tokens.css` como única fuente de
  color, tipografía y espaciado. Sin Tailwind ni CSS-in-JS.
- **State:** `useState`/`useRef` locales por hook de estación. Sin Redux/Zustand.
- **Data fetching:** ninguno. 100% estático, sin backend ni variables de entorno.
- **Animación:** GSAP (`gsap` core, sin plugins de pago) para el morph de la huella al cargar un
  ejemplo, el dado de la estación 03 y el pase de página al cambiar de estación (`StageShell`).
  La estación 04 es una lista vertical de tarjetas de resultado, sin animación propia. Nada de
  canvas ni WebGL.
- **Sonido:** Web Audio sintetizado en `src/lib/sound.ts`. Hay sonido en clics, sliders y al
  cambiar de estación (`playClick`, `playSlide`, `playWhoosh`, `playChime`), pensado para
  sentirse "de película" sin llegar a cansar: cortos, suaves y el de slider con throttle.
  Silenciado por defecto (`useSoundMuted.ts`); el toggle de la cabecera lo activa.
- **Routing:** ninguno. Las estaciones son estado interno (teclas 1 a 4, flechas, pestañas).
- **Despliegue:** Cloudflare Pages (build `npm run build`, salida `dist/`).

## Estructura

```
src/
  app/App.tsx                       # sin portada: monta el escenario directo
  components/
    layout/                         # Header, StationTabs, Logo
    stage/StageShell.tsx            # cabecera, panel de la estación, navegación, teclado
                                     # y el pase de página animado entre estaciones
    stations/                       # VectorStation, MapStation, SentenceStation, SearchStation
    ui/                             # Card, Button, ChipButton, Icon, SoundToggle, Huella
  features/embeddings/              # matemática pura y datos (con tests)
  lib/                              # sonido, movimiento reducido
  styles/tokens.css
```

## Reglas no negociables

- **Componentes de menos de 200 líneas.** Si crece, se divide en subcomponentes o se extrae a un hook.
- **No usar `any`.** `unknown` y narrowing si hace falta.
- **Accesibilidad:** `<button>` para acciones, labels en inputs y selects, foco visible siempre
  (solo se restyla el outline, ver `:focus-visible` en `tokens.css`). Texto sobre papel usa las
  variantes `--*-ink` de cada color (los claros no llegan a 4.5:1).
- **`Huella` decorativa vs. informativa:** cuando la huella va al lado de un nombre visible
  (una tarjeta, un botón de vecina), se pasa `decorative` para que no duplique el nombre
  accesible del botón que la contiene. Sin `decorative`, lleva `role="img"` y `aria-label`.
- **Las 4 pestañas de `StationTabs` deben caber siempre en una fila, sin scroll, desde 360 px.**
  Bug real encontrado: `.tabs` tiene `overflow-x: auto` pero eso no evita que el contenido se
  corte silenciosamente cuando no cabe; la última pestaña quedaba con 0 px visibles, así que
  parecía que el botón no existía en vez de sugerir que había que hacer scroll. Al tocar el
  tamaño de las pestañas (texto, padding, o el número de estaciones), verificar con
  `tabs.scrollWidth <= tabs.clientWidth` en 360 px, no solo mirar una captura de escritorio.
- **Nunca poner `role` en un `<button>`** (por ejemplo `role="listitem"`): le quita el rol nativo
  de botón y rompe `getByRole("button", ...)` en las pruebas y en cualquier lector de pantalla.
- **Nunca meter efectos secundarios dentro de una función de actualización de `setState`** (por
  ejemplo llamar a otro `setState` o reproducir un sonido dentro de `setEstado(prev => ...)`):
  React StrictMode invoca esa función dos veces en desarrollo y puede desincronizar estados que
  deberían cambiar juntos (así se coló un bug real: la pestaña activa y el contenido mostrado
  quedaban desincronizados durante la transición entre estaciones). Leer el estado actual afuera
  y decidir ahí.
- **Tokens únicos:** ningún hex o px suelto en un componente; todo pasa por `tokens.css`.
- **Iconos:** SVG de línea propios (`Icon.tsx`). Sin emojis en la interfaz.
- **Sin guiones largos** (raya ni semirraya) en código, comentarios, textos de interfaz ni docs.
  Usar puntuación normal (coma, dos puntos, punto, paréntesis).
- **Textos simples:** el público son chicos de 15 y 16 años; oraciones cortas, sin subordinadas
  encadenadas, evitar jerga técnica ("vector" se dice "huella" en toda la interfaz).
- **Honestidad didáctica:** los vectores son de juguete y la interfaz lo dice.
- **Datos sin cruces incómodos:** al escribir el vector de una palabra en `words.ts`, los rasgos
  que no son el dominante de su categoría (los "cruzados") deben tener sentido o quedar en 0. Ya
  hubo dos casos corregidos por pedido explícito: ningún animal tiene "se puede comer" (podía
  leerse como que la mascota es comida) y ninguna palabra de tecnología tiene "es un sentimiento"
  (un robot no siente). Antes de agregar una palabra, pensar si algún cruce puede leerse raro o
  incómodo en voz alta frente a público. Por el mismo motivo se sacó "amor" del todo (de `words.ts`
  y de una frase de la estación 03): con público escolar, algunas palabras o frases sobre
  sentimientos pueden generar risas o vergüenza que descentran la charla; ante la duda, se
  reemplaza por algo neutro (aquí, "curiosidad") en vez de intentar salvar el ejemplo.
- **La respuesta correcta de una búsqueda (estación 04) nunca comparte palabras con su pregunta,
  ni con las palabras de otro dato.** Es la regla de diseño más importante de `documents.ts`:
  redactar primero la pregunta en lenguaje natural, después la respuesta con vocabulario
  completamente distinto, y solo al final los 1 o 2 distractores (de otro tema, mejor si son
  absurdos) que comparten una palabra de casualidad con la pregunta. Antes de dar por buena una
  búsqueda nueva, correrla contra `DOCUMENTS` y verificar que ningún distractor comparta también
  una palabra con OTRA pregunta de la estación (si eso pasa, el mismo dato aparece equivocado en
  dos búsquedas distintas, la peor confusión posible para una charla en vivo: ya ocurrió dos
  veces en versiones anteriores, con un dato de telescopios que a veces contaba como correcto y
  a veces como incorrecto, y con "aguas servidas" colisionando con "sin agua").

## Desviaciones del template genérico (y por qué)

- **Server state en TanStack Query:** no aplica, no hay servidor ni fetch.
- **Nunca `fetch` directo en un componente:** no aplica, no hay API.
- **Forms y zod:** no aplica; los únicos controles son sliders, `<select>` y botones de UI pura.
- **Lint:** no se configuró ESLint para mantener el proyecto liviano. La red de seguridad es
  `npm run typecheck` (TypeScript estricto) y `npm run test` (Vitest).

## Tests

- **Unit (Vitest):** `src/features/embeddings/*.test.ts` cubre la matemática pura: distancia,
  similitud y vecinas (grupos cohesionados, gato cerca de perro, pizza lejos), predicción
  (softmax, filtros por género, "cielo" con águila y dron casi empatados), y búsqueda sobre
  `DOCUMENTS` (búsqueda común no se confunde por terminaciones compartidas como
  "animales"/"ideales"; en las 3 preguntas de la estación 04, búsqueda común encuentra solo los
  distractores y nunca la respuesta correcta; búsqueda semántica encuentra solo la respuesta
  correcta, entre 88% y 96%, y descarta los distractores; y cada distractor aparece en
  exactamente una pregunta, nunca en dos).
- No hay tests de componentes. La revisión visual se hace con capturas de Playwright (Chrome del
  sistema vía `executablePath`, la descarga del Chromium empaquetado está bloqueada en esta red)
  en escritorio, móvil (390 px) y `prefers-reduced-motion`.

## Checklist pre-entrega

- [ ] `npm run typecheck` sin errores
- [ ] `npm run test` en verde
- [ ] `npm run build && npm run preview` sirve igual que `dev`, sin errores de consola
- [ ] Recorrido de las cuatro estaciones con pestañas, teclas 1 a 4 y flechas, ida y vuelta
- [ ] El pase de página entre estaciones se ve fluido y no se rompe con clics rápidos seguidos
- [ ] Estación 01: mover un slider cambia la huella y suena; los ejemplos hacen morph
- [ ] Estación 02: filtrar por categoría, abrir una tarjeta, saltar a una vecina, volver al álbum
- [ ] Estación 03: "la más probable" y "tirar el dado"
- [ ] Estación 04: cambiar de búsqueda y de modo redibuja la lista de resultados sin errores
- [ ] `prefers-reduced-motion` activado: sin morph ni pase de página animado, resultado final
      igual de legible e instantáneo
- [ ] Sonido: probado silenciado y activado (clic, slider, whoosh, dado), el toggle persiste al
      recargar (el audio solo se comprueba en un navegador real, no en pruebas sin pantalla)
- [ ] Responsive en 360 a 400 px y en desktop ancho
- [ ] Sin raya ni semirraya en el código ni en los textos (buscar los caracteres U+2014 y U+2013)
