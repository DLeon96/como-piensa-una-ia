import type { CSSProperties } from "react";
import type { Trait } from "../../features/embeddings/types";
import { Icon } from "../ui/Icon";
import "./trait-row.css";

interface TraitRowProps {
  trait: Trait;
  value: number;
  /** Si se pasa, la fila es un slider editable; si no, una barra de solo lectura. */
  onChange?: (value: number) => void;
}

/**
 * Una fila del vector: rasgo con ícono, barra (o slider) y el número en
 * mono. Es la misma forma que las barras de probabilidad de la referencia,
 * así el vector se lee como una lista de medidas y no como números sueltos.
 */
export function TraitRow({ trait, value, onChange }: TraitRowProps) {
  const style = {
    "--fill": `${Math.round(value * 100)}%`,
    "--trait-color": `var(${trait.colorVar})`,
    "--trait-ink": `var(${trait.inkVar})`,
  } as CSSProperties;

  return (
    <div className="trait-row" style={style}>
      <label className="trait-row__label" htmlFor={onChange ? `trait-${trait.id}` : undefined}>
        <Icon name={trait.icon} size={16} className="trait-row__icon" />
        <span>{trait.label}</span>
      </label>
      {onChange ? (
        <input
          id={`trait-${trait.id}`}
          className="trait-row__range"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          aria-valuetext={`${value.toFixed(2)}`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      ) : (
        <div className="trait-row__bar" role="presentation">
          <div className="trait-row__bar-fill" />
        </div>
      )}
      <span className="trait-row__value">{value.toFixed(2)}</span>
    </div>
  );
}
