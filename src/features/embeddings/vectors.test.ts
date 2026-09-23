import { describe, expect, it } from "vitest";
import { CATEGORIES, CATEGORY_ORDER, TRAIT_COUNT, TRAITS, traitIndex } from "./traits";
import { distance, nearest, similarityFromDistance } from "./vectors";
import { WORDS, getWord, wordsOf } from "./words";

describe("datos de las palabras", () => {
  it("hay 7 rasgos y cada categoría apunta a un rasgo que existe", () => {
    expect(TRAIT_COUNT).toBe(7);
    CATEGORY_ORDER.forEach((id) => {
      expect(() => traitIndex(CATEGORIES[id].trait)).not.toThrow();
    });
    expect(TRAITS.map((t) => t.id)).toEqual(["vivo", "comida", "tecno", "emocion", "ciencia", "tamano", "agradable"]);
  });

  it("hay 40 palabras únicas, 8 por categoría, con 7 valores entre 0 y 1", () => {
    expect(WORDS).toHaveLength(40);
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(40);
    CATEGORY_ORDER.forEach((id) => expect(wordsOf(id)).toHaveLength(8));
    WORDS.forEach((w) => {
      expect(w.vec).toHaveLength(TRAIT_COUNT);
      w.vec.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    });
  });
});

describe("vecinas y similitud", () => {
  it("gato y perro son muy parecidos; gato y pizza casi nada", () => {
    const gato = getWord("gato");
    const sim = (a: string, b: string) => similarityFromDistance(distance(getWord(a).vec, getWord(b).vec));
    expect(sim("gato", "perro")).toBeGreaterThanOrEqual(88);
    expect(sim("gato", "pizza")).toBeLessThanOrEqual(35);
    expect(sim("gato", "gato")).toBe(100);
    expect(gato.vec).toHaveLength(7);
  });

  it("perro es de las 2 vecinas más cercanas de gato, y nunca se incluye a sí misma", () => {
    const gato = getWord("gato");
    const neighbors = nearest(gato.vec, WORDS, 5, gato.id);
    expect(neighbors.map((n) => n.word.id).slice(0, 2)).toContain("perro");
    expect(neighbors.some((n) => n.word.id === "gato")).toBe(false);
    const distances = neighbors.map((n) => n.distance);
    expect([...distances].sort((a, b) => a - b)).toEqual(distances);
  });

  it("el constructor: vivo alto, chico y querido cae sobre gato o perro", () => {
    const [top] = nearest([1, 0, 0, 0.28, 0.05, 0.2, 0.85], WORDS, 1);
    expect(["gato", "perro"]).toContain(top?.word.id);
  });

  it("el constructor: tecnología grande y no vivo cae sobre satélite, internet o similares", () => {
    const [top] = nearest([0, 0, 1, 0, 0.3, 0.7, 0.55], WORDS, 1);
    expect(top?.word.id).toBe("satélite");
  });
});

describe("las palabras de una categoría se parecen más entre sí que con las otras", () => {
  it("distancia intra-categoría promedio menor que la inter-categoría", () => {
    const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;
    const intra: number[] = [];
    const inter: number[] = [];
    WORDS.forEach((a, i) => {
      WORDS.slice(i + 1).forEach((b) => {
        (a.categoryId === b.categoryId ? intra : inter).push(distance(a.vec, b.vec));
      });
    });
    expect(mean(intra)).toBeLessThan(mean(inter) * 0.7);
  });
});
