import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../../features/embeddings/traits";
import { TEMPLATES, predictCandidates, type SentenceTemplate } from "../../features/embeddings/predict";
import { playClick } from "../../lib/sound";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ChipButton } from "../ui/ChipButton";
import { Huella } from "../ui/Huella";
import { SentenceCandidates, formatPct } from "./SentenceCandidates";
import { useCandidateRoll, type PickMode } from "./useCandidateRoll";
import type { StationProps } from "./types";
import "./sentence-station.css";

function firstTemplate(): SentenceTemplate {
  const template = TEMPLATES[0];
  if (!template) throw new Error("TEMPLATES no puede estar vacío");
  return template;
}

/**
 * Estación 3: la máquina completa la frase. Cada palabra posible se puntúa
 * por su cercanía en significado con la frase (softmax sobre la distancia).
 * "La más probable" elige siempre la primera; "Tirar el dado" muestrea al
 * azar ponderado, que es la "creatividad" de un LLM.
 */
export function SentenceStation({ reducedMotion }: StationProps) {
  const [templateId, setTemplateId] = useState(() => firstTemplate().id);
  const [mode, setMode] = useState<PickMode>("top");

  const template = useMemo(
    () => TEMPLATES.find((t) => t.id === templateId) ?? firstTemplate(),
    [templateId],
  );
  const candidates = useMemo(() => predictCandidates(template), [template]);
  const maxProb = candidates[0]?.prob ?? 1;
  const { chosen, rollingId, roll, pick, reset } = useCandidateRoll(candidates, mode, reducedMotion);

  useEffect(() => {
    reset();
  }, [template, reset]);

  const top = candidates[0];
  const note =
    chosen && top
      ? chosen.word.id === top.word.id
        ? `Eligió la más probable (${formatPct(chosen.prob)}).`
        : `Salió «${chosen.word.text}» (${formatPct(chosen.prob)}). La máquina no siempre elige la más probable, por eso a veces sorprende.`
      : "";

  return (
    <Card
      kicker="Estación 03"
      title="La máquina completa la frase"
      hint={
        <>
          La palabra con la <b>huella</b> más parecida a la de la frase es la más{" "}
          <b>probable</b>.
        </>
      }
    >
      <div className="ss__templates" role="group" aria-label="Frases">
        {TEMPLATES.map((t) => (
          <ChipButton
            key={t.id}
            active={t.id === templateId}
            onClick={() => {
              playClick();
              setTemplateId(t.id);
            }}
          >
            {t.title}
          </ChipButton>
        ))}
      </div>

      <div className="ss__top">
        <p className="ss__sentence" aria-live="polite">
          {template.before}{" "}
          {chosen ? (
            <mark className="ss__filled">{chosen.word.text}</mark>
          ) : (
            <span className="ss__blank">_____</span>
          )}
          {template.after}.
        </p>
        {top && (
          <Huella
            vec={template.context}
            color="var(--coral)"
            compareVec={top.word.vec}
            compareColor={`var(${CATEGORIES[top.word.categoryId].colorVar})`}
            size={64}
            title="Huella de la frase comparada con la de la palabra más probable"
          />
        )}
      </div>

      <SentenceCandidates
        candidates={candidates}
        maxProb={maxProb}
        chosenId={chosen?.word.id}
        rollingId={rollingId}
        onPick={pick}
      />

      <p className="ss__why">
        <b>¿Por qué?</b> {template.why}
      </p>

      <div className="ss__controls">
        <div role="group" aria-label="Cómo elige la máquina" className="ss__modes">
          <ChipButton
            active={mode === "top"}
            onClick={() => {
              playClick();
              setMode("top");
            }}
          >
            La más probable
          </ChipButton>
          <ChipButton
            active={mode === "dice"}
            onClick={() => {
              playClick();
              setMode("dice");
            }}
          >
            Con dado
          </ChipButton>
        </div>
        <Button
          icon={mode === "dice" ? "dice" : "play"}
          onClick={() => {
            playClick();
            roll();
          }}
          disabled={rollingId !== null}
        >
          {mode === "dice" ? "Tirar" : "Completar"}
        </Button>
      </div>

      <p className="ss__note" aria-live="polite">
        {note}
      </p>

      <p className="ss__disclaimer">
        Así elige la próxima palabra un modelo de lenguaje real, solo que con miles de números en
        vez de 7, y mirando además el orden de toda la frase.
      </p>
    </Card>
  );
}
