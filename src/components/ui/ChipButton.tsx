import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./chip-button.css";

interface ChipButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  children: ReactNode;
}

/** Botón chico tipo "starter" de la referencia: selectores de frase, de constelación, de preset. */
export function ChipButton({ active = false, children, className, ...rest }: ChipButtonProps) {
  const classes = ["chip-btn", active ? "chip-btn--active" : "", className].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} aria-pressed={active} {...rest}>
      {children}
    </button>
  );
}
