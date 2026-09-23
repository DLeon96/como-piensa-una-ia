import { describe, expect, it } from "vitest";
import { TEMPLATES, predictCandidates, sampleCandidate, softmax } from "./predict";
import { getWord } from "./words";

const byId = (id: string) => {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) throw new Error(`frase no encontrada: ${id}`);
  return template;
};
const ids = (id: string) => predictCandidates(byId(id)).map((c) => c.word.id);

describe("predicción de la frase", () => {
  it("las probabilidades de cada frase suman 1", () => {
    TEMPLATES.forEach((template) => {
      const total = predictCandidates(template).reduce((sum, c) => sum + c.prob, 0);
      expect(total).toBeCloseTo(1, 8);
    });
  });

  it("softmax es estable con puntajes muy negativos", () => {
    const probs = softmax([-1000, -1001, -1002]);
    expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 8);
    expect(probs[0]).toBeGreaterThan(probs[1] ?? 1);
  });

  it("mascota: perro y gato lideran", () => {
    expect(ids("mascota").slice(0, 2).sort()).toEqual(["gato", "perro"]);
  });

  it("desayuno: café, pan y chocolate van arriba; pizza y sushi quedan al final por sentirse de almuerzo o cena", () => {
    const order = ids("desayuno");
    expect(order.slice(0, 3).sort()).toEqual(["café", "chocolate", "pan"]);
    expect(order.slice(3).sort()).toEqual(["pizza", "sushi"]);
  });

  it("cielo: águila y dron son las dos primeras y casi empatan", () => {
    const candidates = predictCandidates(byId("cielo"));
    expect(candidates.slice(0, 2).map((c) => c.word.id).sort()).toEqual(["dron", "águila"].sort());
    const [first, second] = candidates;
    expect(Math.abs((first?.prob ?? 0) - (second?.prob ?? 0))).toBeLessThan(0.2);
  });

  it("laboratorio: molécula, energía y célula van arriba y la galaxia queda última", () => {
    const order = ids("laboratorio");
    expect(order.slice(0, 3).sort()).toEqual(["célula", "energía", "molécula"]);
    expect(order[order.length - 1]).toBe("galaxia");
  });

  it("la gramática cuadra: 'un' solo con masculinos, 'una' solo con femeninos", () => {
    TEMPLATES.forEach((template) => {
      const genders = template.allowed.map((id) => getWord(id).gender);
      if (template.before.endsWith(" un")) expect(new Set(genders)).toEqual(new Set(["m"]));
      if (template.before.endsWith(" una")) expect(new Set(genders)).toEqual(new Set(["f"]));
    });
  });
});

describe("tirar el dado", () => {
  it("con 0 elige la más probable y con casi 1 la menos probable", () => {
    const candidates = predictCandidates(byId("mascota"));
    expect(sampleCandidate(candidates, () => 0).word.id).toBe(candidates[0]?.word.id);
    expect(sampleCandidate(candidates, () => 0.9999999).word.id).toBe(candidates[candidates.length - 1]?.word.id);
  });

  it("a la larga respeta las probabilidades", () => {
    const candidates = predictCandidates(byId("mascota"));
    let seed = 12345;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const counts = new Map<string, number>();
    const runs = 4000;
    for (let i = 0; i < runs; i += 1) {
      const id = sampleCandidate(candidates, random).word.id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const top = candidates[0];
    expect((counts.get(top?.word.id ?? "") ?? 0) / runs).toBeCloseTo(top?.prob ?? 0, 1);
  });
});
