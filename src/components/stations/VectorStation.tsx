import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, TRAITS } from "../../features/embeddings/traits";
import type { Neighbor } from "../../features/embeddings/types";
import { nearest } from "../../features/embeddings/vectors";
import { WORDS, getWord } from "../../features/embeddings/words";
import { playClick, playSlide } from "../../lib/sound";
import { Card } from "../ui/Card";
import { ChipButton } from "../ui/ChipButton";
import { Huella } from "../ui/Huella";
import { TraitRow } from "./TraitRow";
import type { StationProps } from "./types";
import "./vector-station.css";

/** Para no saturar de sonido al arrastrar un slider. */
const SLIDE_SOUND_THROTTLE_MS = 90;

const PRESETS: readonly string[] = ["gato", "pizza", "robot", "curiosidad", "galaxia"];

/**
 * Estación 1: cada palabra tiene una huella. Siete sliders con nombre arman
 * un vector; la huella (una mancha de 7 puntas) se redibuja en vivo y se
 * compara, superpuesta, con la de la palabra más parecida.
 */
export function VectorStation({ reducedMotion }: StationProps) {
  const [vec, setVec] = useState<number[]>(() => [...getWord("gato").vec]);
  const vecRef = useRef(vec);
  vecRef.current = vec;
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const lastSlideRef = useRef(0);

  useEffect(
    () => () => {
      tweenRef.current?.kill();
    },
    [],
  );

  const animateTo = useCallback(
    (target: readonly number[]) => {
      tweenRef.current?.kill();
      if (reducedMotion) {
        setVec([...target]);
        return;
      }
      const from = [...vecRef.current];
      const progress = { t: 0 };
      tweenRef.current = gsap.to(progress, {
        t: 1,
        duration: 0.75,
        ease: "power2.inOut",
        onUpdate: () => setVec(from.map((v, i) => v + ((target[i] ?? 0) - v) * progress.t)),
      });
    },
    [reducedMotion],
  );

  const setTrait = (index: number, value: number) => {
    tweenRef.current?.kill();
    setVec((prev) => prev.map((v, i) => (i === index ? value : v)));
    const now = performance.now();
    if (now - lastSlideRef.current > SLIDE_SOUND_THROTTLE_MS) {
      lastSlideRef.current = now;
      playSlide(value);
    }
  };

  const neighbors = nearest(vec, WORDS, 3);
  const top: Neighbor | undefined = neighbors[0];
  const rest = neighbors.slice(1);

  return (
    <Card
      kicker="Estación 01"
      title="Cada palabra tiene una huella"
      hint={
        <>
          Cada palabra tiene su propia <b>huella</b>, tan única como la de tu dedo. Mueve los
          controles de abajo y mira cómo cambia.
        </>
      }
    >
      <div className="vs__load" role="group" aria-label="Cargar el vector de una palabra">
        <span className="vs__load-label">Ejemplos</span>
        {PRESETS.map((id) => (
          <ChipButton
            key={id}
            onClick={() => {
              playClick();
              animateTo(getWord(id).vec);
            }}
          >
            {getWord(id).text}
          </ChipButton>
        ))}
      </div>

      <div className="vs__body">
        <div className="vs__rows">
          {TRAITS.map((trait, i) => (
            <TraitRow key={trait.id} trait={trait} value={vec[i] ?? 0} onChange={(v) => setTrait(i, v)} />
          ))}
        </div>

        <div className="vs__huella-wrap">
          <Huella
            vec={vec}
            color="var(--violet)"
            compareVec={top?.word.vec}
            compareColor={top ? `var(${CATEGORIES[top.word.categoryId].colorVar})` : undefined}
            size={128}
            className="huella--lg huella--live"
            title="Tu huella comparada con la más parecida"
          />
          <p className="vs__huella-caption">
            Tu huella (rellena) contra la de <b>{top?.word.text ?? "..."}</b> (punteada)
          </p>
        </div>
      </div>

      <div className="vs__result" aria-live="polite">
        <p className="vs__result-kicker">Se parece más a</p>
        <p className="vs__result-word">
          {top?.word.text ?? "..."}
          <span className="vs__result-pct">{top ? `${top.similarityPct}%` : ""}</span>
        </p>
        {rest.length > 0 && (
          <div className="vs__others">
            {rest.map((n) => (
              <button
                key={n.word.id}
                type="button"
                className="vs__other"
                onClick={() => {
                  playClick();
                  animateTo(n.word.vec);
                }}
              >
                <Huella vec={n.word.vec} color={`var(${CATEGORIES[n.word.categoryId].colorVar})`} size={40} decorative />
                <span>{n.word.text}</span>
                <span className="vs__other-pct">{n.similarityPct}%</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="vs__disclaimer">
        Una IA real usa cientos de números sin nombre, que descubre sola leyendo millones de
        textos. Aquí les pusimos nombre y forma solo para poder verlos.
      </p>
    </Card>
  );
}
