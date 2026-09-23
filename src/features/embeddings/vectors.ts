import { TRAIT_COUNT } from "./traits";
import type { Neighbor, Word, WordWithNeighbors } from "./types";

/**
 * Matemática pura de los vectores de juguete: distancia, similitud y
 * vecinas. Nada de React ni de dibujo aquí.
 *
 * Orden de los rasgos (ver `TRAITS`):
 * [vivo, comida, tecno, emocion, ciencia, tamano, agradable]
 */

/** Distancia por encima de la cual la similitud llega a 0%. Calibrada con los tests. */
const MAX_DISTANCE = 1.9;

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/** Distancia euclidiana real entre dos vectores de rasgos. */
export function distance(a: readonly number[], b: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < TRAIT_COUNT; i += 1) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export function similarityFromDistance(dist: number): number {
  return Math.max(0, Math.round((1 - dist / MAX_DISTANCE) * 100));
}

/** Las N palabras más cercanas a `vec` dentro de `pool`, ordenadas por distancia real. */
export function nearest(
  vec: readonly number[],
  pool: readonly Word[],
  count = 3,
  excludeId?: string,
): Neighbor[] {
  return pool
    .filter((word) => word.id !== excludeId)
    .map((word) => {
      const dist = distance(vec, word.vec);
      return { word, distance: dist, similarityPct: similarityFromDistance(dist) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

export function withNeighbors(word: Word, pool: readonly Word[], count = 3): WordWithNeighbors {
  return { ...word, neighbors: nearest(word.vec, pool, count, word.id) };
}

/** Número pseudoaleatorio estable en [0, 1) a partir de un texto (para desplazamientos visuales). */
export function hash01(text: string, salt = 0): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}
