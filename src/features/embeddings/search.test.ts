import { describe, expect, it } from "vitest";
import { DOCUMENTS } from "./documents";
import { MIN_RELEVANT_PCT, QUERIES, classicMatches, semanticMatches, semanticPct } from "./search";

const byId = (id: string) => {
  const query = QUERIES.find((q) => q.id === id);
  if (!query) throw new Error(`búsqueda no encontrada: ${id}`);
  return query;
};

describe("búsqueda común (clásica)", () => {
  it("compara por el inicio de cada palabra: 'animales' no se confunde con 'ideales' solo por terminar igual", () => {
    const hits = classicMatches("algo animales", DOCUMENTS).map((h) => h.doc.id);
    expect(hits).not.toContain("alma");
  });

  it("ignora conectores cortos como 'que' o 'algo'", () => {
    const hits = classicMatches("busco algo que tenga que ver", DOCUMENTS);
    expect(hits).toHaveLength(0);
  });

  it("'sin agua' encuentra los dos distractores (minería y lluvias), no la respuesta correcta", () => {
    const hits = classicMatches(byId("sin-agua").text, DOCUMENTS);
    const ids = hits.map((h) => h.doc.id);
    expect(ids).toEqual(expect.arrayContaining(["mineria-plantas", "lluvias-altiplano"]));
    expect(ids).not.toContain("camanchaca");
  });

  it("'el cielo' encuentra los dos distractores absurdos (el futbolista y el museo), no la respuesta correcta", () => {
    const hits = classicMatches(byId("cielo").text, DOCUMENTS);
    const ids = hits.map((h) => h.doc.id);
    expect(ids).toEqual(expect.arrayContaining(["delantero-estrella", "noche-museos"]));
    expect(ids).not.toContain("alma");
  });

  it("'el mar' encuentra los dos distractores absurdos (la heladería y Costa Rica), no la respuesta correcta", () => {
    const hits = classicMatches(byId("mar").text, DOCUMENTS);
    const ids = hits.map((h) => h.doc.id);
    expect(ids).toEqual(expect.arrayContaining(["heladeria", "costa-rica"]));
    expect(ids).not.toContain("humboldt-fauna");
  });

  it("las 3 preguntas usan palabras distintas entre sí, para que cada ejemplo sea propio", () => {
    const tokenSets = QUERIES.map((q) => new Set(q.text.toLowerCase().split(/[^a-zá-úñü]+/i).filter((w) => w.length >= 4)));
    for (let i = 0; i < tokenSets.length; i += 1) {
      for (let j = i + 1; j < tokenSets.length; j += 1) {
        const a = tokenSets[i] ?? new Set<string>();
        const b = tokenSets[j] ?? new Set<string>();
        const compartidas = [...a].filter((token) => b.has(token));
        expect(compartidas).toEqual([]);
      }
    }
  });
});

describe("búsqueda semántica (IA)", () => {
  it("cada pregunta encuentra su respuesta correcta, y nada más, con un parecido entre 88% y 96%", () => {
    const expected: Record<string, string> = {
      "sin-agua": "camanchaca",
      cielo: "alma",
      mar: "humboldt-fauna",
    };
    QUERIES.forEach((q) => {
      const hits = semanticMatches(q.context, DOCUMENTS);
      expect(hits).toHaveLength(1);
      expect(hits[0]?.doc.id).toBe(expected[q.id]);
      expect(hits[0]?.pct).toBeGreaterThanOrEqual(88);
      expect(hits[0]?.pct).toBeLessThanOrEqual(96);
    });
  });

  it("descarta los distractores en vez de mostrarlos con un porcentaje bajo", () => {
    QUERIES.forEach((q) => {
      const hits = semanticMatches(q.context, DOCUMENTS);
      expect(hits.every((h) => h.pct >= MIN_RELEVANT_PCT)).toBe(true);
    });
  });
});

describe("el contraste es real: la respuesta correcta nunca aparece por letras", () => {
  it("en las 3 preguntas, la respuesta que encuentra la búsqueda semántica no está entre los resultados de la búsqueda común", () => {
    QUERIES.forEach((q) => {
      const [answer] = semanticMatches(q.context, DOCUMENTS);
      const classicIds = classicMatches(q.text, DOCUMENTS).map((h) => h.doc.id);
      expect(answer).toBeDefined();
      expect(classicIds).not.toContain(answer?.doc.id);
    });
  });

  it("todo lo que sí encuentra la búsqueda común no tiene relación real de significado (queda bajo el umbral)", () => {
    QUERIES.forEach((q) => {
      classicMatches(q.text, DOCUMENTS).forEach((hit) => {
        expect(semanticPct(q.context, hit.doc)).toBeLessThan(MIN_RELEVANT_PCT);
      });
    });
  });

  it("cada distractor solo aparece en la pregunta para la que fue escrito, nunca en las otras", () => {
    const counts = new Map<string, number>();
    QUERIES.forEach((q) => {
      classicMatches(q.text, DOCUMENTS).forEach((h) => {
        counts.set(h.doc.id, (counts.get(h.doc.id) ?? 0) + 1);
      });
    });
    counts.forEach((count) => expect(count).toBe(1));
  });
});
