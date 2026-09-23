import { useState } from "react";
import { CATEGORIES, CATEGORY_ORDER } from "../../features/embeddings/traits";
import type { CategoryId } from "../../features/embeddings/types";
import { withNeighbors } from "../../features/embeddings/vectors";
import { WORDS, getWord, wordsOf } from "../../features/embeddings/words";
import { playClick } from "../../lib/sound";
import { Card } from "../ui/Card";
import { ChipButton } from "../ui/ChipButton";
import { Huella } from "../ui/Huella";
import { WordDetail } from "./WordDetail";
import type { StationProps } from "./types";
import "./map-station.css";

/**
 * Estación 2: el álbum de las palabras. Una grilla de tarjetas agrupadas por
 * categoría, cada una con su huella; tocarla abre su ficha (huella grande,
 * vector y vecinas más cercanas). Sin mapa, sin cámara: se recorre con la
 * vista, pensado para entenderse solo con mirar, sin instrucciones previas.
 */
export function MapStation({}: StationProps) {
  const [focusCategoryId, setFocusCategoryId] = useState<CategoryId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = focusCategoryId ? wordsOf(focusCategoryId) : WORDS;
  const selected = selectedId ? withNeighbors(getWord(selectedId), WORDS, 4) : null;

  const pick = (id: string) => {
    playClick();
    setSelectedId(id);
  };

  return (
    <Card
      kicker="Estación 02"
      title="El álbum de las palabras"
      hint={
        selected ? undefined : (
          <>
            Dos palabras parecidas tienen huellas parecidas. Toca una tarjeta y mira cómo se cruza
            su <b>huella</b> con la de sus vecinas.
          </>
        )
      }
    >
      {selected ? (
        <>
          <button
            type="button"
            className="ms__back"
            onClick={() => {
              playClick();
              setSelectedId(null);
            }}
          >
            ← Volver al álbum
          </button>
          <WordDetail word={selected} onPickNeighbor={pick} />
        </>
      ) : (
        <>
          <div className="ms__filters" role="group" aria-label="Categorías">
            <ChipButton
              active={focusCategoryId === null}
              onClick={() => {
                playClick();
                setFocusCategoryId(null);
              }}
            >
              Todas
              <span className="ms__count">{WORDS.length}</span>
            </ChipButton>
            {CATEGORY_ORDER.map((id) => (
              <ChipButton
                key={id}
                active={focusCategoryId === id}
                onClick={() => {
                  playClick();
                  setFocusCategoryId(id);
                }}
              >
                <span className="chip-btn__dot" style={{ background: `var(${CATEGORIES[id].colorVar})` }} />
                {CATEGORIES[id].label}
                <span className="ms__count">{wordsOf(id).length}</span>
              </ChipButton>
            ))}
          </div>

          <div className="ms__grid" role="group" aria-label="Palabras">
            {visible.map((word) => (
              <button
                key={word.id}
                type="button"
                className="ms__card"
                style={{ borderColor: `var(${CATEGORIES[word.categoryId].colorVar})` }}
                onClick={() => pick(word.id)}
              >
                <Huella vec={word.vec} color={`var(${CATEGORIES[word.categoryId].colorVar})`} size={52} decorative />
                <span>{word.text}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
