# El espacio del significado

Experiencia interactiva de Ciencias Abiertas · Universidad de Antofagasta para una charla de
10 minutos a estudiantes de I y II° medio: cómo una IA representa el significado de las
palabras como números (embeddings).

Cada palabra tiene una **huella**: una mancha de 7 puntas (una por rasgo) en vez de un punto
en un gráfico con ejes. Comparar dos palabras es superponer sus huellas: cuanto más se tapan,
más cerca están en significado. Cuatro estaciones, visitables en cualquier orden, usan esa
misma idea, con un pase de página animado al cambiar entre ellas:

| Estación | Qué muestra |
| --- | --- |
| **01 Cada palabra tiene una huella** | Siete sliders con nombre (está vivo, se puede comer, es un sentimiento...) arman la huella de una palabra en vivo, comparada superpuesta con la más parecida y su porcentaje. |
| **02 El álbum de las palabras** | Una grilla de 40 tarjetas con su huella, agrupadas por categoría y filtrables. Tocar una abre su ficha: huella grande, sus 7 medidas y sus vecinas más cercanas. |
| **03 La máquina completa la frase** | Cuatro frases con un hueco. Las palabras posibles salen de qué tan parecida es su huella a la de la frase (softmax sobre la distancia), con barras de probabilidad. Se puede elegir "la más probable" o "tirar el dado". |
| **04 Búsqueda semántica** | La aplicación real: 3 preguntas ("Sin agua", "El cielo", "El mar") diseñadas para que el contraste sea evidente. Cada respuesta correcta no comparte ninguna palabra con su pregunta, así que "búsqueda común" nunca la encuentra: solo muestra 1 o 2 distractores absurdos de otro tema, marcados en rojo "comparte la palabra, no el tema" (por ejemplo, "El delantero estrella" para una pregunta sobre astronomía, porque comparte la palabra "estrella"). "Búsqueda semántica" encuentra la respuesta correcta con un parecido alto (88 a 96%), marcada "no comparte ninguna palabra, pero sí responde". |

Los vectores son números de juguete escritos a mano para poder verlos. La interfaz lo dice
así: una IA real usa cientos de números sin nombre que descubre sola leyendo millones de textos.
No hay recuadros de "idea clave": las explicaciones van como texto simple, no como avisos.

## Stack

React 18, Vite 5 y TypeScript estricto. Sin canvas ni motor 3D: las huellas son SVG puro y las
animaciones (morph de la huella, pase de página entre estaciones, dado) son GSAP sobre el DOM.
Sonido sintetizado con Web Audio: clics suaves, un tono por slider y un pequeño "whoosh" al
cambiar de estación, todo silenciado por defecto. Sin backend: el sitio es 100% estático.

Tipografía alineada al Manual de Normas Gráficas de la Universidad de Antofagasta: el manual pide
Helvetica Rounded (isologo) y Futura (jerarquía de texto), ninguna de las dos libre para web, así
que se usa **Jost**, el sustituto gratuito más cercano al trazo geométrico de Futura. Si más
adelante se consigue la fuente con licencia web oficial, se reemplaza en `styles/tokens.css`.

## Requisitos

- Node.js 18 o superior
- npm (viene con Node)

## Correr en local

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`). Se entra directo al
contenido, sin portada que cruzar.

Controles pensados para presentar:

- Teclas `1` a `4` o flechas izquierda y derecha: cambiar de estación (con animación, se puede
  ir hacia adelante y hacia atrás).
- Pestañas de la cabecera: ir directo a una estación.
- Botón "Sonido" / "Sonando": activar o silenciar los sonidos (silenciado por defecto; la
  preferencia se recuerda).

Otros comandos:

```bash
npm run typecheck   # TypeScript estricto, sin compilar
npm run test        # Vitest: distancia, similitud, vecinas, predicción y búsqueda
npm run build       # build de producción en dist/
npm run preview     # sirve el build de producción en local
```

## Desplegar en Cloudflare Pages

No hay variables de entorno ni claves que configurar.

### Opción A: por línea de comandos (Wrangler)

```bash
npm run build
npx wrangler login      # solo la primera vez, abre el navegador para autorizar
npm run deploy          # equivale a: wrangler pages deploy dist
```

### Opción B: integración con GitHub (dashboard de Cloudflare Pages)

1. Sube este proyecto a un repositorio de GitHub.
2. En el [dashboard de Cloudflare Pages](https://dash.cloudflare.com/), entra a **Workers & Pages**,
   elige **Crear**, luego **Pages** y **Conectar a Git**, y selecciona el repositorio.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Sin variables de entorno que agregar.
7. Cada push a la rama configurada (normalmente `main`) vuelve a desplegar solo.

## Estructura del proyecto

```
src/
  app/App.tsx                     # sin portada: monta el escenario directo
  components/
    layout/                       # Header, StationTabs, Logo
    stage/StageShell.tsx          # cabecera, panel de la estación activa, navegación,
                                   # teclado y el pase de página animado entre estaciones
    stations/                     # una pantalla por estación
      VectorStation.tsx           # estación 01
      MapStation.tsx              # estación 02 (álbum de tarjetas)
      SentenceStation.tsx         # estación 03
      SearchStation.tsx           # estación 04 (búsqueda semántica)
      useCandidateRoll.ts         # "la más probable" / "tirar el dado" (estación 03)
    ui/                           # Card, Button, ChipButton, Icon, SoundToggle
      Huella.tsx                  # la mancha de N puntas: el corazón visual de la app
  features/embeddings/            # matemática pura y datos, con tests
    traits.ts                     # los 7 rasgos y las 5 categorías
    words.ts                      # las 40 palabras, cada una con su vector de 7 números
    vectors.ts                    # distancia, similitud y vecinas
    predict.ts                    # frases con hueco y probabilidades (softmax)
    documents.ts                  # 3 respuestas correctas + 6 distractores de la estación 04
    search.ts                     # las 3 preguntas y el motor de búsqueda común/semántica
  lib/                            # sonido, movimiento reducido
  styles/tokens.css               # única fuente de colores, tipografía y espaciado
```

Las convenciones de código están en [`CLAUDE.md`](./CLAUDE.md).

## Cómo editar el contenido

- **Palabras del álbum:** editar `ROWS` en `src/features/embeddings/words.ts`. Cada fila es
  `[palabra, categoría, género, [vivo, comida, tecno, emoción, ciencia, tamaño, agradable]]`, con
  valores de 0 a 1. La huella se dibuja sola a partir de esos siete números. Al agregar una
  palabra, conviene revisar que sus rasgos "cruzados" (los que no son el dominante de su
  categoría) no digan algo raro o incómodo en voz alta: por ejemplo, ningún animal tiene "se
  puede comer" y ninguna palabra de tecnología tiene "es un sentimiento", a propósito. Los
  tests de `vectors.test.ts` avisan si las categorías dejan de verse cohesionadas.
- **Rasgos y categorías:** `src/features/embeddings/traits.ts`.
- **Frases de la estación 03:** `TEMPLATES` en `src/features/embeddings/predict.ts`. Cada frase
  tiene el texto, un vector de 7 números que la describe, las palabras permitidas (para que la
  gramática cuadre) y la explicación del "¿por qué?".
- **Datos y preguntas de la estación 04:** `DOCUMENTS` en `documents.ts` y `QUERIES` en
  `search.ts`, diseñados juntos con 3 reglas obligatorias (documentadas al inicio de
  `documents.ts`) para que el contraste común/semántica sea real y no forzado:
  1. Cada pregunta se escribe en lenguaje natural (como la escribiría un estudiante) y NO
     contiene ninguna palabra de su respuesta correcta.
  2. La respuesta correcta usa vocabulario totalmente distinto al de la pregunta: cero palabras
     en común, a propósito. Por eso "búsqueda común" nunca la encuentra.
  3. Se agregan 1 o 2 "distractores": datos de un tema completamente distinto (mejor si son
     absurdos o graciosos, como "El delantero estrella" para una pregunta de astronomía) que
     comparten EXACTAMENTE una palabra con la pregunta, de pura casualidad.
  El vector de tema (`[niebla costera, astronomía, vida marina, identidad local]`) le da a cada
  respuesta correcta un valor alto en su propia dimensión y a cada distractor un vector en cero:
  así, matemáticamente, la respuesta correcta siempre queda con un parecido alto (calibrado para
  cerca de 90 a 95%) y los distractores quedan bajo `MIN_RELEVANT_PCT` y se descartan solos.
  Antes de agregar una pregunta nueva, correrla contra `DOCUMENTS` (con
  `classicMatches`/`semanticMatches`/`semanticPct`) para confirmar las 3 reglas, y revisar que
  ningún distractor comparta una palabra con OTRA de las preguntas (si dos preguntas comparten
  una palabra "gancho", el mismo dato aparece equivocado en ambas y los ejemplos dejan de
  sentirse distintos entre sí); el test "las 3 preguntas usan palabras distintas entre sí" y el
  test "cada distractor solo aparece en la pregunta para la que fue escrito" verifican
  exactamente eso. `STOPWORDS` y `minShared` en `classicMatches` controlan qué cuenta como
  coincidencia; compara por el inicio de cada palabra (`sharedPrefixLength`), no por cualquier
  pedazo de texto, para no confundir palabras que solo comparten una terminación (ni una
  coincidencia real de prefijo con una palabra sin relación: pasó con "aparato"~"instalaron" en
  una vuelta anterior, y obligó a cambiar la palabra de la pregunta).
- **Colores y tipografía:** solo `src/styles/tokens.css`.
- **La huella:** `src/components/ui/Huella.tsx`. `R_MIN`/`R_MAX` controlan qué tan "llena" se ve
  siempre la mancha (nunca colapsa a un punto) y qué tanto puede crecer una punta.
- **El pase de página entre estaciones:** `src/components/stage/StageShell.tsx`. La duración y
  el desplazamiento están en la función `go` y en el `useEffect` que arma la línea de tiempo de
  GSAP.
- **Sonido:** `src/lib/sound.ts` (clic, slider, whoosh de transición y el acorde final del dado)
  y `src/lib/useSoundMuted.ts` (si arranca silenciado; hoy sí).

## Cómo funcionan las partes (versión corta)

- **La huella:** los 7 números de una palabra son 7 radios repartidos en círculo, unidos por una
  curva suave (no líneas rectas): eso da la forma de mancha en vez de radar técnico.
- **Similitud:** distancia euclidiana entre los vectores de 7 números, convertida a porcentaje.
- **Predicción de la estación 03:** softmax de la distancia negativa entre cada palabra permitida y
  el vector de contexto de la frase. "Tirar el dado" muestrea con esas probabilidades.
- **Búsqueda de la estación 04:** parte la pregunta en palabras (sin conectores como "que",
  "cómo" o "dónde") y compara el inicio de cada una con el inicio de las palabras del título y el
  texto de cada dato: eso es la "búsqueda común", igual que un buscador de toda la vida que no
  entiende, solo empareja texto. Como cada respuesta correcta fue escrita a propósito sin
  compartir palabras con su pregunta, la búsqueda común nunca la encuentra: solo encuentra los 1
  o 2 distractores que sí comparten una palabra, marcados en coral "comparte la palabra, no el
  tema", y cierra con "Tu respuesta no apareció: no comparte ninguna palabra con tu pregunta".
  La "búsqueda semántica" mide la distancia euclidiana entre el vector de tema de la pregunta y
  el de cada dato (el mismo cálculo de las estaciones 1 y 2, en un espacio propio de esta
  estación) y descarta los datos sin relación real (los distractores, con vector en cero, quedan
  siempre fuera): por eso solo aparece la respuesta correcta, con un parecido alto y marcada en
  violeta "no comparte ninguna palabra, pero sí responde".

## Límites que conviene decir en voz alta

- Los vectores son de juguete, no de un modelo real.
- La predicción de frases es una versión simplificada: los modelos reales usan miles de números
  por palabra y también miran el orden de la frase.

## Accesibilidad y pantallas

- Contraste pensado para proyector, foco visible en todos los controles, etiquetas en sliders.
  Las huellas decorativas (junto a un nombre visible) se ocultan a los lectores de pantalla
  para no duplicar el nombre; las huellas informativas (sin texto al lado) llevan su propio
  `aria-label`.
- `prefers-reduced-motion`: el pase de página entre estaciones y el dado saltan directo al
  resultado, sin animación.
- Página de flujo normal (con scroll), funciona igual en escritorio y en móvil desde 360 px.
- Estación 02 tiene un botón "Volver al álbum" para deshacer la selección sin depender del navegador.

## Posibles mejoras

- Modo presentador con temporizador visible (la charla dura 10 minutos).
- Caché offline (PWA), por si el wifi del auditorio falla el día de la charla.
- Cambiar el set de palabras por uno de un área científica específica: solo hay que editar `words.ts`.
- Pruebas end to end con Playwright para el recorrido completo (hoy hay pruebas unitarias de la
  matemática pura).
