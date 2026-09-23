import type { StationId } from "../../features/embeddings/types";
import { SoundToggle } from "../ui/SoundToggle";
import { Logo } from "./Logo";
import { StationTabs } from "./StationTabs";
import "./header.css";

interface HeaderProps {
  station: StationId;
  onStation: (id: StationId) => void;
  muted: boolean;
  onToggleSound: () => void;
}

/** Marca institucional, título, pestañas de estación y el sonido. */
export function Header({ station, onStation, muted, onToggleSound }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__brand">
        <Logo size="sm" />
        <div className="header__titles">
          <p className="header__kicker">Ciencias Abiertas · UA</p>
          <p className="header__title">
            El espacio del <em>significado</em>
          </p>
        </div>
      </div>
      <StationTabs active={station} onSelect={onStation} />
      <div className="header__actions">
        <SoundToggle muted={muted} onToggle={onToggleSound} />
      </div>
    </header>
  );
}
