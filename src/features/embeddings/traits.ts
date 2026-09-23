import type { Category, CategoryId, Trait, TraitId } from "./types";

/**
 * Los 7 rasgos del vector de juguete. El ORDEN importa: es el orden de las
 * posiciones en `Word.vec`, del constructor de palabras y del mapa.
 */
export const TRAITS: readonly Trait[] = [
  {
    id: "vivo",
    label: "Está vivo",
    hint: "Un perro casi 1, una piedra 0",
    icon: "paw",
    colorVar: "--cat-animales",
    inkVar: "--cat-animales-ink",
  },
  {
    id: "comida",
    label: "Se puede comer",
    hint: "Una pizza 1, una galaxia 0",
    icon: "plate",
    colorVar: "--cat-comida",
    inkVar: "--cat-comida-ink",
  },
  {
    id: "tecno",
    label: "Lo inventamos las personas",
    hint: "Un robot 1, una ballena 0",
    icon: "chip",
    colorVar: "--cat-tecnologia",
    inkVar: "--cat-tecnologia-ink",
  },
  {
    id: "emocion",
    label: "Es un sentimiento",
    hint: "El miedo 1, un chip 0",
    icon: "heart",
    colorVar: "--cat-emociones",
    inkVar: "--cat-emociones-ink",
  },
  {
    id: "ciencia",
    label: "Se estudia en ciencias",
    hint: "Un átomo 1, un helado 0",
    icon: "flask",
    colorVar: "--cat-ciencia",
    inkVar: "--cat-ciencia-ink",
  },
  {
    id: "tamano",
    label: "Es grande",
    hint: "Una ballena 1, un átomo 0",
    icon: "ruler",
    colorVar: "--trait-tamano",
    inkVar: "--trait-tamano",
  },
  {
    id: "agradable",
    label: "Se siente agradable",
    hint: "La alegría 1, el miedo 0",
    icon: "smile",
    colorVar: "--trait-agradable",
    inkVar: "--trait-agradable",
  },
];

export const TRAIT_COUNT = TRAITS.length;

export function traitIndex(id: TraitId): number {
  const index = TRAITS.findIndex((t) => t.id === id);
  if (index < 0) throw new Error(`Rasgo desconocido: ${id}`);
  return index;
}

export const CATEGORIES: Record<CategoryId, Category> = {
  animales: {
    id: "animales",
    label: "Animales",
    trait: "vivo",
    colorVar: "--cat-animales",
    inkVar: "--cat-animales-ink",
  },
  comida: {
    id: "comida",
    label: "Comida",
    trait: "comida",
    colorVar: "--cat-comida",
    inkVar: "--cat-comida-ink",
  },
  ciencia: {
    id: "ciencia",
    label: "Ciencia",
    trait: "ciencia",
    colorVar: "--cat-ciencia",
    inkVar: "--cat-ciencia-ink",
  },
  emociones: {
    id: "emociones",
    label: "Emociones",
    trait: "emocion",
    colorVar: "--cat-emociones",
    inkVar: "--cat-emociones-ink",
  },
  tecnologia: {
    id: "tecnologia",
    label: "Tecnología",
    trait: "tecno",
    colorVar: "--cat-tecnologia",
    inkVar: "--cat-tecnologia-ink",
  },
};

export const CATEGORY_ORDER: readonly CategoryId[] = [
  "animales",
  "comida",
  "ciencia",
  "emociones",
  "tecnologia",
];
