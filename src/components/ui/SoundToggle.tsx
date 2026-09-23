import { Icon } from "./Icon";
import "./sound-toggle.css";

interface SoundToggleProps {
  muted: boolean;
  onToggle: () => void;
}

/** Sonido activado por defecto: el texto lo hace evidente, no solo el ícono. */
export function SoundToggle({ muted, onToggle }: SoundToggleProps) {
  return (
    <button
      type="button"
      className="sound-toggle"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      title={muted ? "Activar sonido" : "Silenciar sonido"}
    >
      <Icon name={muted ? "sound-off" : "sound"} size={16} />
      <span className="sound-toggle__label">{muted ? "Sonido" : "Sonando"}</span>
    </button>
  );
}
