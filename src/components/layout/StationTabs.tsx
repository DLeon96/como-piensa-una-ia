import type { StationId } from "../../features/embeddings/types";
import { STATIONS } from "./stations";
import "./station-tabs.css";

interface StationTabsProps {
  active: StationId;
  onSelect: (id: StationId) => void;
}

/** Pestañas 01 a 04, como en la referencia: navegar en cualquier orden. */
export function StationTabs({ active, onSelect }: StationTabsProps) {
  return (
    <nav className="tabs" aria-label="Estaciones">
      {STATIONS.map((station) => (
        <button
          key={station.id}
          type="button"
          className={`tab${station.id === active ? " tab--active" : ""}`}
          aria-current={station.id === active ? "page" : undefined}
          onClick={() => onSelect(station.id)}
        >
          <span className="tab__n">{String(station.id).padStart(2, "0")}</span>
          <span className="tab__long">{station.name}</span>
          <span className="tab__short">{station.short}</span>
        </button>
      ))}
    </nav>
  );
}
