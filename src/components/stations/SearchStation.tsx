import { useMemo, useState } from "react";
import type { SearchDocument } from "../../features/embeddings/documents";
import { DOCUMENTS } from "../../features/embeddings/documents";
import {
  classicMatches,
  MIN_RELEVANT_PCT,
  QUERIES,
  semanticMatches,
  semanticPct,
  type SearchQuery,
} from "../../features/embeddings/search";
import { playClick } from "../../lib/sound";
import { Card } from "../ui/Card";
import { ChipButton } from "../ui/ChipButton";
import { Huella } from "../ui/Huella";
import type { StationProps } from "./types";
import "./search-station.css";

type Mode = "comun" | "semantica";

function firstQuery(): SearchQuery {
  const query = QUERIES[0];
  if (!query) throw new Error("QUERIES no puede estar vacío");
  return query;
}

/**
 * Estación 4: búsqueda semántica, la aplicación real detrás de todo esto.
 * Cada pregunta está diseñada a propósito (ver `documents.ts`) para que la
 * respuesta correcta NO comparta ninguna palabra con ella: por eso "búsqueda
 * común" nunca la encuentra y solo muestra 1 o 2 distractores de otro tema,
 * absurdos, que coinciden en una sola palabra de casualidad. "Búsqueda
 * semántica" hace lo contrario: encuentra la respuesta correcta con un
 * porcentaje alto aunque no comparta ninguna letra con la pregunta, y
 * descarta los distractores por no tener relación real de significado.
 */
export function SearchStation({}: StationProps) {
  const [queryId, setQueryId] = useState(() => firstQuery().id);
  const [mode, setMode] = useState<Mode>("semantica");
  const query = QUERIES.find((q) => q.id === queryId) ?? firstQuery();

  const classicHits = useMemo(() => classicMatches(query.text, DOCUMENTS), [query]);
  const semanticHits = useMemo(() => semanticMatches(query.context, DOCUMENTS), [query]);
  const answerId = semanticHits[0]?.doc.id;

  const pick = (id: string) => {
    playClick();
    setQueryId(id);
  };

  const setModeAndPlay = (next: Mode) => {
    playClick();
    setMode(next);
  };

  return (
    <Card
      kicker="Estación 04"
      title="Búsqueda semántica"
      hint={
        <>
          Haces la misma pregunta de dos formas y comparas los resultados: la{" "}
          <b>búsqueda común</b> solo lee las palabras escritas; la <b>búsqueda semántica</b>{" "}
          entiende lo que realmente preguntas.
        </>
      }
    >
      <div className="sr__queries" role="group" aria-label="Elegir una búsqueda">
        {QUERIES.map((q) => (
          <ChipButton key={q.id} active={q.id === queryId} onClick={() => pick(q.id)}>
            {q.title}
          </ChipButton>
        ))}
      </div>

      <p className="sr__typed">
        Buscas: <b>«{query.text}»</b>
      </p>

      <div className="sr__modes" role="group" aria-label="Cómo buscar">
        <ChipButton active={mode === "comun"} onClick={() => setModeAndPlay("comun")}>
          Búsqueda común
        </ChipButton>
        <ChipButton active={mode === "semantica"} onClick={() => setModeAndPlay("semantica")}>
          Búsqueda semántica
        </ChipButton>
      </div>

      {mode === "comun" ? (
        classicHits.length === 0 ? (
          <p className="sr__empty">
            La búsqueda común no encontró ningún dato: no comparte palabras con ninguno.
          </p>
        ) : (
          <ul className="sr__results">
            {classicHits.map((hit) => {
              const esLaRespuesta = hit.doc.id === answerId;
              const sinRelacion = !esLaRespuesta && semanticPct(query.context, hit.doc) < MIN_RELEVANT_PCT;
              return (
                <ResultRow key={hit.doc.id} doc={hit.doc} muted={sinRelacion}>
                  <span className="sr__reason">
                    coincide por: {hit.matchedTokens.map((t) => `«${t}»`).join(", ")}
                  </span>
                  {esLaRespuesta && <span className="sr__answer">esto sí responde la búsqueda</span>}
                  {sinRelacion && <span className="sr__mismatch">comparte la palabra, no el tema</span>}
                </ResultRow>
              );
            })}
          </ul>
        )
      ) : semanticHits.length === 0 ? (
        <p className="sr__empty">La búsqueda semántica tampoco encontró ningún dato relacionado.</p>
      ) : (
        <ul className="sr__results">
          {semanticHits.map((hit) => {
            const soloSemantica = !classicHits.some((c) => c.doc.id === hit.doc.id);
            return (
              <ResultRow key={hit.doc.id} doc={hit.doc}>
                <span className="sr__pct">{hit.pct}% parecido</span>
                {soloSemantica && (
                  <span className="sr__bonus">no comparte ninguna palabra, pero sí responde</span>
                )}
              </ResultRow>
            );
          })}
        </ul>
      )}

      <p className="sr__note">
        {mode === "comun"
          ? "Tu respuesta no apareció: no comparte ninguna palabra con tu pregunta."
          : "Una búsqueda semántica entiende el significado de la pregunta, aunque la respuesta no comparta ninguna palabra con ella."}
      </p>

      <p className="sr__disclaimer">
        En la vida real, una búsqueda semántica también usa palabras a veces. Estos ejemplos se
        eligieron para que se note con claridad el momento exacto en que el significado hace la
        diferencia.
      </p>
    </Card>
  );
}

function ResultRow({
  doc,
  children,
  muted = false,
}: {
  doc: SearchDocument;
  children: React.ReactNode;
  muted?: boolean;
}) {
  const classes = ["sr__result", muted ? "sr__result--muted" : ""].filter(Boolean).join(" ");
  return (
    <li className={classes}>
      <Huella vec={doc.topic} color="var(--violet)" size={40} decorative />
      <div className="sr__result-text">
        <p className="sr__result-title">{doc.title}</p>
        <p className="sr__result-snippet">{doc.snippet}</p>
        {children}
      </div>
    </li>
  );
}
