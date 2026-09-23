/**
 * Tipos del dominio "embeddings": rasgos, palabras con vector y estaciones.
 * Sin `any` en ningún punto.
 */

export type TraitId =
  | "vivo"
  | "comida"
  | "tecno"
  | "emocion"
  | "ciencia"
  | "tamano"
  | "agradable";

export type TraitIcon = "paw" | "plate" | "chip" | "heart" | "flask" | "ruler" | "smile";

export interface Trait {
  id: TraitId;
  /** Nombre en lenguaje de 15 años: es lo que se ve en el constructor de palabras. */
  label: string;
  /** Una línea que explica el rasgo con un ejemplo de valor alto y bajo. */
  hint: string;
  icon: TraitIcon;
  colorVar: string;
  inkVar: string;
}

export type CategoryId = "animales" | "comida" | "ciencia" | "emociones" | "tecnologia";

export interface Category {
  id: CategoryId;
  label: string;
  /** Rasgo que domina a las palabras de esta constelación. */
  trait: TraitId;
  colorVar: string;
  inkVar: string;
}

export type Gender = "m" | "f";

export interface Word {
  id: string;
  text: string;
  categoryId: CategoryId;
  gender: Gender;
  /** Vector de juguete de 7 rasgos (0 a 1), en el orden de `TRAITS`. */
  vec: readonly number[];
}

export interface Neighbor {
  word: Word;
  distance: number;
  /** 0 a 100, calibrado con tests (gato y perro altos, gato y pizza bajos). */
  similarityPct: number;
}

export interface WordWithNeighbors extends Word {
  neighbors: Neighbor[];
}

export type StationId = 1 | 2 | 3 | 4;
