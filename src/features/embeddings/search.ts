import type { SearchDocument } from "./documents";

/**
 * "Búsqueda semántica", la aplicación estrella: la misma pregunta, resuelta
 * de dos formas. Cada `SearchQuery` es una pregunta como la escribiría una
 * persona, diseñada a propósito para NO compartir ninguna palabra con su
 * respuesta correcta (así se nota que "búsqueda común" no la encuentra) y
 * para compartir una palabra de casualidad con 1 o 2 datos de otro tema (ver
 * el comentario al inicio de `documents.ts`). El vector de tema describe lo
 * que la pregunta significa, en el mismo espacio que `DOCUMENTS`.
 */
export interface SearchQuery {
  id: string;
  /** Nombre corto para el chip. */
  title: string;
  /** La pregunta tal como la escribiría una persona. */
  text: string;
  /** Vector de tema que describe lo que se busca, en el orden de `documents.ts`. */
  context: readonly number[];
}

export const QUERIES: readonly SearchQuery[] = [
  {
    id: "sin-agua",
    title: "Sin agua",
    text: "¿cómo consiguen agua las plantas donde casi nunca cae lluvia?",
    context: [1.0, 0.0, 0.0, 1.0],
  },
  {
    id: "cielo",
    title: "El cielo",
    text: "¿por qué desde aquí se ven tan bien las estrellas de noche?",
    context: [0.0, 1.0, 0.0, 1.0],
  },
  {
    id: "mar",
    title: "El mar",
    text: "¿qué seres viven en el océano helado de esta costa?",
    context: [0.0, 0.0, 1.0, 1.0],
  },
];

/** Cuántas letras seguidas, desde el principio, tienen en común dos palabras. */
function sharedPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i] === b[i]) i += 1;
  return i;
}

/**
 * Conectores y palabras de relleno: se ignoran al comparar por letras. Sin
 * este filtro, un "que" o un "algo" sueltos en la frase generan coincidencias
 * de casualidad que confunden el ejemplo en vez de explicarlo.
 */
const STOPWORDS = new Set([
  "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "al", "a", "en", "con",
  "por", "para", "que", "qué", "y", "o", "u", "tu", "su", "es", "se", "lo", "le", "les", "como",
  "cómo", "cuando", "cuándo", "donde", "dónde", "cual", "cuál", "cuales", "cuáles", "si", "no",
  "algo", "esa", "ese", "eso", "esta", "este", "hay", "más", "aquí", "desde",
]);

/** Palabras sueltas en minúscula, sin acentos raros que compliquen la comparación. */
function wordsOf(text: string): string[] {
  return text.toLowerCase().split(/[^a-zá-úñü]+/i).filter(Boolean);
}

/** Palabras de 4 letras o más, sin conectores, listas para comparar. */
function tokensOf(text: string): string[] {
  return wordsOf(text).filter((token) => token.length >= 4 && !STOPWORDS.has(token));
}

export interface ClassicHit {
  doc: SearchDocument;
  /** Con qué palabras de la búsqueda coincidió, para mostrar por qué apareció. */
  matchedTokens: readonly string[];
}

/**
 * Búsqueda común: un buscador de toda la vida solo encuentra coincidencias
 * de texto. Aquí se cuenta como coincidencia que alguna palabra de la
 * búsqueda empiece igual (al menos `minShared` letras) que alguna palabra
 * del título o el texto de un dato, como buscar "desiert" y encontrar
 * "desierto". Se compara por el INICIO de cada palabra (no cualquier pedazo
 * de texto) para no confundir, por ejemplo, "animales" con "ideales" solo
 * porque las dos terminan en "-ales". El buscador no sabe si el dato habla
 * justo de lo que se pregunta o solo comparte una palabra de casualidad:
 * ordena primero los que comparten más palabras, nada más.
 */
export function classicMatches(queryText: string, pool: readonly SearchDocument[], minShared = 4): ClassicHit[] {
  const tokens = tokensOf(queryText);
  const hits: ClassicHit[] = [];
  pool.forEach((doc) => {
    const haystackWords = wordsOf(`${doc.title} ${doc.snippet}`);
    const matched = tokens.filter((token) =>
      haystackWords.some((word) => sharedPrefixLength(token, word) >= minShared),
    );
    if (matched.length > 0) hits.push({ doc, matchedTokens: matched });
  });
  return hits.sort((a, b) => b.matchedTokens.length - a.matchedTokens.length);
}

/** Distancia euclidiana entre dos vectores de tema. */
function topicDistance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/** Distancia por encima de la cual la similitud llega a 0%. Calibrada a ojo con estos datos. */
const MAX_TOPIC_DISTANCE = 1.3;

/**
 * Bajo este porcentaje, un dato no tiene nada que ver con la búsqueda: se
 * descarta en la búsqueda semántica en vez de mostrarse como relleno con
 * "0% parecido", y sirve también para marcar en la búsqueda común los
 * resultados que solo coinciden en la palabra, no en el tema.
 */
export const MIN_RELEVANT_PCT = 30;

/** Qué tan parecido es el tema de un dato al de la búsqueda, en porcentaje. */
export function semanticPct(queryContext: readonly number[], doc: SearchDocument): number {
  const dist = topicDistance(queryContext, doc.topic);
  return Math.max(0, Math.round((1 - dist / MAX_TOPIC_DISTANCE) * 100));
}

export interface SemanticHit {
  doc: SearchDocument;
  pct: number;
}

/**
 * Búsqueda semántica: ordena los datos por qué tan cerca está su TEMA del
 * tema de la búsqueda, sin importar cómo estén escritos, y descarta los que
 * no tienen relación real. A veces encuentra más de un dato relacionado
 * (uno de ellos, a menudo, sin ninguna palabra en común con la búsqueda) que
 * la búsqueda común pierde por completo.
 */
export function semanticMatches(queryContext: readonly number[], pool: readonly SearchDocument[], count = 4): SemanticHit[] {
  return pool
    .map((doc) => ({ doc, dist: topicDistance(queryContext, doc.topic) }))
    .sort((a, b) => a.dist - b.dist)
    .map(({ doc, dist }) => ({ doc, pct: Math.max(0, Math.round((1 - dist / MAX_TOPIC_DISTANCE) * 100)) }))
    .filter((hit) => hit.pct >= MIN_RELEVANT_PCT)
    .slice(0, count);
}
