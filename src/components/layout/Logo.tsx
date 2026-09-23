import logoUrl from "../../assets/logo-ciencia-abierta-ua.png";
import "./logo.css";

interface LogoProps {
  size: "sm" | "lg";
}

/**
 * Lockup de la Universidad de Antofagasta y Ciencia Abierta. El PNG es
 * transparente: sobre el papel claro se ve tal cual, sin placa ni marco.
 */
export function Logo({ size }: LogoProps) {
  return (
    <img
      className={`logo logo--${size}`}
      src={logoUrl}
      alt="Universidad de Antofagasta y Ciencia Abierta"
      width={900}
      height={415}
    />
  );
}
