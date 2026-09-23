import type { CategoryId, Gender, Word } from "./types";

/**
 * Las 40 palabras del mapa. Cada fila es un vector de juguete escrito a
 * mano, con este orden de rasgos:
 *
 * [vivo, comida, tecno, emocion, ciencia, tamano, agradable]
 *
 * Son números de ilustración, no de un modelo real: sirven para poder
 * VER por qué dos palabras quedan cerca (la interfaz lo dice así).
 */
type Row = readonly [text: string, category: CategoryId, gender: Gender, vec: readonly number[]];

const ROWS: readonly Row[] = [
  // Animales: "se puede comer" siempre en 0. No queremos que la huella de una
  // mascota o un animal sugiera, ni un poco, que es comida.
  ["perro", "animales", "m", [1.0, 0.0, 0.0, 0.3, 0.05, 0.3, 0.9]],
  ["gato", "animales", "m", [1.0, 0.0, 0.0, 0.28, 0.05, 0.18, 0.85]],
  ["león", "animales", "m", [1.0, 0.0, 0.0, 0.05, 0.05, 0.62, 0.35]],
  ["águila", "animales", "m", [1.0, 0.0, 0.0, 0.05, 0.05, 0.4, 0.55]],
  ["delfín", "animales", "m", [1.0, 0.0, 0.0, 0.2, 0.1, 0.6, 0.9]],
  ["tigre", "animales", "m", [1.0, 0.0, 0.0, 0.03, 0.05, 0.62, 0.3]],
  ["elefante", "animales", "m", [1.0, 0.0, 0.0, 0.15, 0.05, 0.9, 0.7]],
  ["ballena", "animales", "f", [1.0, 0.0, 0.0, 0.15, 0.1, 1.0, 0.75]],
  // Comida
  ["pan", "comida", "m", [0.03, 1.0, 0.45, 0.05, 0.0, 0.2, 0.85]],
  ["manzana", "comida", "f", [0.3, 1.0, 0.0, 0.0, 0.05, 0.12, 0.85]],
  ["café", "comida", "m", [0.05, 0.95, 0.4, 0.1, 0.0, 0.1, 0.8]],
  ["pizza", "comida", "f", [0.05, 1.0, 0.55, 0.1, 0.0, 0.3, 0.95]],
  ["chocolate", "comida", "m", [0.05, 1.0, 0.5, 0.15, 0.0, 0.1, 0.95]],
  ["queso", "comida", "m", [0.1, 1.0, 0.45, 0.05, 0.0, 0.15, 0.8]],
  ["naranja", "comida", "f", [0.3, 1.0, 0.0, 0.0, 0.05, 0.12, 0.85]],
  ["sushi", "comida", "m", [0.25, 1.0, 0.55, 0.05, 0.0, 0.15, 0.85]],
  // Ciencia
  ["átomo", "ciencia", "m", [0.0, 0.0, 0.1, 0.0, 1.0, 0.02, 0.5]],
  ["célula", "ciencia", "f", [0.75, 0.0, 0.0, 0.0, 0.9, 0.04, 0.5]],
  ["galaxia", "ciencia", "f", [0.0, 0.0, 0.0, 0.05, 0.9, 1.0, 0.7]],
  ["ADN", "ciencia", "m", [0.65, 0.0, 0.05, 0.0, 0.95, 0.03, 0.5]],
  ["energía", "ciencia", "f", [0.05, 0.0, 0.35, 0.05, 0.95, 0.5, 0.65]],
  ["universo", "ciencia", "m", [0.0, 0.0, 0.0, 0.1, 0.95, 1.0, 0.75]],
  ["molécula", "ciencia", "f", [0.15, 0.0, 0.1, 0.0, 1.0, 0.03, 0.5]],
  ["gravedad", "ciencia", "f", [0.0, 0.0, 0.0, 0.0, 1.0, 0.6, 0.45]],
  // Emociones
  ["curiosidad", "emociones", "f", [0.35, 0.0, 0.0, 0.95, 0.0, 0.5, 0.75]],
  ["miedo", "emociones", "m", [0.35, 0.0, 0.0, 1.0, 0.0, 0.5, 0.05]],
  ["alegría", "emociones", "f", [0.35, 0.0, 0.0, 1.0, 0.0, 0.5, 0.95]],
  ["tristeza", "emociones", "f", [0.35, 0.0, 0.0, 1.0, 0.0, 0.5, 0.08]],
  ["calma", "emociones", "f", [0.3, 0.0, 0.0, 0.95, 0.0, 0.45, 0.85]],
  ["sorpresa", "emociones", "f", [0.3, 0.0, 0.0, 0.95, 0.0, 0.5, 0.6]],
  ["orgullo", "emociones", "m", [0.35, 0.0, 0.0, 0.95, 0.0, 0.55, 0.75]],
  ["nostalgia", "emociones", "f", [0.35, 0.0, 0.0, 0.95, 0.0, 0.5, 0.35]],
  // Tecnología: "es un sentimiento" siempre en 0. Un robot puede parecer casi
  // vivo (por eso el rasgo "vivo" sí sube un poco), pero no tiene sentimientos.
  ["robot", "tecnologia", "m", [0.25, 0.0, 1.0, 0.0, 0.25, 0.45, 0.65]],
  ["internet", "tecnologia", "m", [0.0, 0.0, 1.0, 0.0, 0.2, 0.6, 0.65]],
  ["código", "tecnologia", "m", [0.0, 0.0, 1.0, 0.0, 0.25, 0.2, 0.55]],
  ["datos", "tecnologia", "m", [0.0, 0.0, 0.95, 0.0, 0.45, 0.3, 0.5]],
  ["chip", "tecnologia", "m", [0.0, 0.0, 1.0, 0.0, 0.3, 0.03, 0.55]],
  ["algoritmo", "tecnologia", "m", [0.0, 0.0, 1.0, 0.0, 0.4, 0.25, 0.55]],
  ["satélite", "tecnologia", "m", [0.0, 0.0, 1.0, 0.0, 0.3, 0.7, 0.55]],
  ["dron", "tecnologia", "m", [0.1, 0.0, 1.0, 0.0, 0.1, 0.3, 0.65]],
];

export const WORDS: readonly Word[] = ROWS.map(([text, categoryId, gender, vec]) => ({
  id: text,
  text,
  categoryId,
  gender,
  vec,
}));

export const WORD_BY_ID: ReadonlyMap<string, Word> = new Map(WORDS.map((w) => [w.id, w]));

export function getWord(id: string): Word {
  const word = WORD_BY_ID.get(id);
  if (!word) throw new Error(`Palabra desconocida: ${id}`);
  return word;
}

export function wordsOf(categoryId: CategoryId): readonly Word[] {
  return WORDS.filter((w) => w.categoryId === categoryId);
}
