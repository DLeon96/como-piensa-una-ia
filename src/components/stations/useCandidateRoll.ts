import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { sampleCandidate, type Candidate } from "../../features/embeddings/predict";
import { playChime } from "../../lib/sound";

export type PickMode = "top" | "dice";

const DICE_STEPS = 14;

/**
 * Elección de la palabra de la frase (estación 3). "top" toma siempre la más
 * probable; "dice" muestrea con las probabilidades y anima un recorrido por
 * las candidatas cada vez más lento hasta caer en la elegida. Solo suena al
 * terminar (nunca en cada paso, para no llenar de pitidos el recorrido).
 */
export function useCandidateRoll(candidates: readonly Candidate[], mode: PickMode, reducedMotion: boolean) {
  const [chosen, setChosen] = useState<Candidate | null>(null);
  const [rollingId, setRollingId] = useState<string | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const stopRoll = useCallback(() => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    setRollingId(null);
  }, []);

  const finish = useCallback((candidate: Candidate) => {
    setRollingId(null);
    setChosen(candidate);
    playChime();
  }, []);

  /** Elige directamente una candidata (clic en su barra). */
  const pick = useCallback(
    (candidate: Candidate) => {
      stopRoll();
      finish(candidate);
    },
    [finish, stopRoll],
  );

  /** Vuelve al estado sin elegir (al cambiar de frase). */
  const reset = useCallback(() => {
    stopRoll();
    setChosen(null);
  }, [stopRoll]);

  const roll = useCallback(() => {
    reset();
    if (mode === "top") {
      const top = candidates[0];
      if (top) finish(top);
      return;
    }
    const winner = sampleCandidate(candidates);
    if (reducedMotion) {
      finish(winner);
      return;
    }
    const timeline = gsap.timeline();
    let at = 0;
    for (let i = 0; i < DICE_STEPS; i += 1) {
      const target = i === DICE_STEPS - 1 ? winner : candidates[i % candidates.length];
      at += 0.06 + i * i * 0.0024;
      timeline.call(
        () => {
          if (!target) return;
          setRollingId(target.word.id);
        },
        [],
        at,
      );
    }
    timeline.call(() => finish(winner), [], at + 0.25);
    timelineRef.current = timeline;
  }, [candidates, finish, mode, reducedMotion, reset]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
    },
    [],
  );

  return { chosen, rollingId, roll, pick, reset };
}
