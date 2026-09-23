import type { Candidate } from "../../features/embeddings/predict";

export const formatPct = (p: number) => `${Math.round(p * 100)}%`;

interface SentenceCandidatesProps {
  candidates: readonly Candidate[];
  /** Probabilidad de la primera: el ancho de cada barra se mide contra ella. */
  maxProb: number;
  chosenId: string | undefined;
  rollingId: string | null;
  onPick: (candidate: Candidate) => void;
}

/** Barras de probabilidad de las palabras posibles; cada una se puede tocar para elegirla. */
export function SentenceCandidates({ candidates, maxProb, chosenId, rollingId, onPick }: SentenceCandidatesProps) {
  return (
    <ul className="ss__cands">
      {candidates.map((c) => {
        const state = chosenId === c.word.id ? " ss__cand--chosen" : rollingId === c.word.id ? " ss__cand--rolling" : "";
        return (
          <li key={c.word.id}>
            <button type="button" className={`ss__cand${state}`} onClick={() => onPick(c)}>
              <span className="ss__fill" style={{ width: `${(c.prob / maxProb) * 100}%` }} />
              <span className="ss__word">{c.word.text}</span>
              <span className="ss__pct">{formatPct(c.prob)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
