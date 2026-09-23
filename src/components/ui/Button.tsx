import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import "./button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "soft";
  icon?: IconName;
  iconAfter?: IconName;
}

/** Botón de la interfaz: primario (violeta), fantasma (papel) o suave (violeta claro). */
export function Button({ children, variant = "primary", icon, iconAfter, className, ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} size={16} />}
    </button>
  );
}
