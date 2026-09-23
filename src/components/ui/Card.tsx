import type { ReactNode } from "react";
import "./card.css";

interface CardProps {
  /** "ESTACIÓN 01" y similares, en mono pequeño sobre el título. */
  kicker: string;
  title: string;
  hint?: ReactNode;
  children: ReactNode;
}

/**
 * Tarjeta de estación: mismo lenguaje que la referencia (blanca, borde fino,
 * sombra suave, radio 22). Es el único contenedor de contenido de la app.
 */
export function Card({ kicker, title, hint, children }: CardProps) {
  return (
    <section className="card" aria-label={title}>
      <p className="card__kicker">{kicker}</p>
      <h2 className="card__title">{title}</h2>
      {hint && <div className="card__hint">{hint}</div>}
      <div className="card__body">{children}</div>
    </section>
  );
}
