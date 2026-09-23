import { CATEGORIES, TRAITS } from "../../features/embeddings/traits";
import type { WordWithNeighbors } from "../../features/embeddings/types";
import { Huella } from "../ui/Huella";
import { TraitRow } from "./TraitRow";
import "./word-detail.css";

interface WordDetailProps {
  word: WordWithNeighbors;
  onPickNeighbor: (id: string) => void;
}

/** Ficha de una palabra del álbum: su huella, su vector (7 medidas) y sus vecinas más cercanas. */
export function WordDetail({ word, onPickNeighbor }: WordDetailProps) {
  const category = CATEGORIES[word.categoryId];
  const color = `var(${category.colorVar})`;
  return (
    <div className="detail" aria-live="polite">
      <div className="detail__head">
        <Huella vec={word.vec} color={color} size={72} className="huella--lg" decorative />
        <div>
          <span className="detail__word">{word.text}</span>
          <span className="detail__cat" style={{ color }}>
            {category.label}
          </span>
        </div>
      </div>

      <p className="detail__sub">Su huella, 7 medidas</p>
      <div className="detail__rows">
        {TRAITS.map((trait, i) => (
          <TraitRow key={trait.id} trait={trait} value={word.vec[i] ?? 0} />
        ))}
      </div>

      <p className="detail__sub">Sus vecinas más cercanas</p>
      <p className="detail__note">
        La huella punteada es la de <b>{word.text}</b>: mira cuánto se cruza con la de cada vecina.
      </p>
      <ul className="detail__neighbors">
        {word.neighbors.map((n) => (
          <li key={n.word.id}>
            <button type="button" className="detail__neighbor" onClick={() => onPickNeighbor(n.word.id)}>
              <Huella
                vec={n.word.vec}
                color={`var(${CATEGORIES[n.word.categoryId].colorVar})`}
                compareVec={word.vec}
                compareColor="var(--violet)"
                size={44}
                decorative
              />
              <span className="detail__neighbor-text">
                <span className="detail__neighbor-name">{n.word.text}</span>
                <span className="detail__pct">{n.similarityPct}%</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
