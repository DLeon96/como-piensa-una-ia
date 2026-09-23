/**
 * Datos para la estación de búsqueda semántica, diseñados a propósito para
 * que el contraste entre "búsqueda común" y "búsqueda semántica" sea real,
 * no forzado:
 *
 * 1. La respuesta correcta de cada pregunta NO comparte ninguna palabra con
 *    ella (por eso la búsqueda común nunca la encuentra).
 * 2. Cada pregunta comparte exactamente una palabra con 1 o 2 "distractores"
 *    de un tema totalmente distinto, a propósito absurdos (por eso la
 *    búsqueda común muestra esos, no lo que de verdad responde).
 *
 * Vector de tema: [niebla costera, astronomía, vida marina, identidad
 * local]. Los distractores no tienen relación real con ningún tema: su
 * vector queda en cero a propósito, así la búsqueda semántica los descarta.
 */
export interface SearchDocument {
  id: string;
  title: string;
  snippet: string;
  topic: readonly number[];
}

export const DOCUMENTS: readonly SearchDocument[] = [
  // --- "Sin agua": la respuesta correcta no dice "agua" ni "lluvia". ---
  {
    id: "camanchaca",
    title: "Atrapanieblas y camanchaca",
    snippet: "Con mallas se cosechan gotas de niebla: líquenes y arbustos sobreviven bebiendo esa bruma.",
    topic: [0.91, 0.0, 0.0, 1.0],
  },
  {
    // Distractor absurdo: coincide por "plantas", pero aquí son plantas
    // (fábricas) de procesamiento minero, no plantas del desierto.
    id: "mineria-plantas",
    title: "Consumo en la gran minería",
    snippet: "Estas plantas de procesamiento funcionan sin parar en la gran minería del norte.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
  {
    id: "lluvias-altiplano",
    title: "Temporada de lluvias en el altiplano",
    snippet: "El invierno boliviano trae lluvias al altiplano.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
  // --- "El cielo": la respuesta correcta no dice "estrella" ni "noche". ---
  {
    id: "alma",
    title: "Observatorio ALMA",
    snippet: "En el llano de Chajnantor, el aire seco y sin nubes permite captar la luz de galaxias lejanas.",
    topic: [0.0, 0.92, 0.0, 1.0],
  },
  {
    id: "delantero-estrella",
    title: "El delantero estrella",
    snippet: "La estrella del equipo marcó anoche en el estadio.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
  {
    id: "noche-museos",
    title: "Noche de los museos",
    snippet: "La noche de los museos abrió sus puertas gratis al público.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
  // --- "El mar": la respuesta correcta no dice "océano" ni "costa". ---
  {
    id: "humboldt-fauna",
    title: "Lobos marinos y pingüinos de Humboldt",
    snippet: "En el litoral norteño abundan colonias de lobos marinos, pingüinos y aves guaneras.",
    topic: [0.0, 0.0, 0.9, 1.0],
  },
  {
    // Distractor absurdo: coincide por "helado", pero aquí es un helado
    // (postre), no el mar helado de la pregunta.
    id: "heladeria",
    title: "Heladería del centro",
    snippet: "Esta heladería vende helados artesanales todos los días.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
  {
    id: "costa-rica",
    title: "Costa Rica",
    snippet: "Costa Rica es un país de Centroamérica famoso por su naturaleza.",
    topic: [0.0, 0.0, 0.0, 0.0],
  },
];
