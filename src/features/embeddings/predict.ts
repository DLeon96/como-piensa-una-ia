import type { Word } from "./types";
import { distance } from "./vectors";
import { getWord } from "./words";

/**
 * "La máquina completa la frase", versión de juguete: cada frase apunta a un
 * punto del mapa (`context`) y las palabras posibles se puntúan por su
 * cercanía a ese punto (softmax sobre la distancia). Un LLM real hace algo
 * mucho más rico (miles de dimensiones, orden de las palabras, atención),
 * pero la idea de fondo es la misma: lo que encaja en significado es más
 * probable. `allowed` hace de gramática y de sentido común de la frase.
 */
export interface SentenceTemplate {
  id: string;
  /** Nombre corto para el selector. */
  title: string;
  before: string;
  after: string;
  /** Vector de rasgos que "describe" la frase, en el orden de `TRAITS`. */
  context: readonly number[];
  /** Palabras que la gramática y el sentido de la frase permiten. */
  allowed: readonly string[];
  /** Más bajo = la máquina es más tajante; más alto = reparte más la probabilidad. */
  temperature: number;
  /** Explicación de una línea de por qué el punto de la frase cae donde cae. */
  why: string;
}

export const TEMPLATES: readonly SentenceTemplate[] = [
  {
    id: "mascota",
    title: "Mascota",
    before: "Mi mascota favorita es un",
    after: "",
    context: [1.0, 0.0, 0.0, 0.3, 0.0, 0.25, 0.9],
    allowed: ["perro", "gato", "delfín", "águila", "león", "tigre"],
    temperature: 0.2,
    why: "La frase habla de algo vivo, pequeño, querido y agradable: apunta justo entre perro y gato.",
  },
  {
    id: "desayuno",
    title: "Desayuno",
    before: "Para el desayuno prefiero",
    after: "",
    context: [0.05, 0.95, 0.42, 0.1, 0.0, 0.12, 0.85],
    allowed: ["café", "pan", "chocolate", "sushi", "pizza"],
    temperature: 0.18,
    why: "Busca algo dulce o salado, hecho para el desayuno: café, pan y chocolate quedan arriba. El sushi y la pizza quedan más lejos porque se sienten más de almuerzo o cena.",
  },
  {
    id: "cielo",
    title: "Cielo",
    before: "Algo se mueve en el cielo, un",
    after: "",
    context: [0.55, 0.0, 0.5, 0.0, 0.05, 0.4, 0.6],
    allowed: ["águila", "dron", "satélite"],
    temperature: 0.2,
    why: "Vuela y a la vez parece inventado: cae entre los animales y la tecnología, por eso águila y dron casi empatan.",
  },
  {
    id: "laboratorio",
    title: "Ciencia",
    before: "En el laboratorio estudian una",
    after: "",
    context: [0.4, 0.0, 0.2, 0.0, 0.95, 0.3, 0.5],
    allowed: ["molécula", "energía", "célula", "galaxia"],
    temperature: 0.2,
    why: "Es algo de ciencia, chico y con un poco de vida: molécula, célula y energía quedan más cerca que la galaxia.",
  },
];

export interface Candidate {
  word: Word;
  /** Probabilidad 0 a 1; todas las candidatas de una frase suman 1. */
  prob: number;
  distance: number;
}

export function softmax(scores: readonly number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((s) => Math.exp(s - max));
  const total = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / total);
}

/** Candidatas de la frase, ordenadas de más a menos probable. */
export function predictCandidates(template: SentenceTemplate): Candidate[] {
  const pool = template.allowed.map(getWord);
  const distances = pool.map((w) => distance(w.vec, template.context));
  const probs = softmax(distances.map((d) => -d / template.temperature));
  return pool
    .map((word, i) => ({ word, prob: probs[i] ?? 0, distance: distances[i] ?? 0 }))
    .sort((a, b) => b.prob - a.prob);
}

/** "Tirar el dado": elige una candidata al azar ponderado por su probabilidad. */
export function sampleCandidate(candidates: readonly Candidate[], random: () => number = Math.random): Candidate {
  const roll = random();
  let acc = 0;
  for (const candidate of candidates) {
    acc += candidate.prob;
    if (roll <= acc) return candidate;
  }
  const last = candidates[candidates.length - 1];
  if (!last) throw new Error("No hay candidatas para muestrear");
  return last;
}
