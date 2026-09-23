import type { StationId } from "../../features/embeddings/types";

export interface StationMeta {
  id: StationId;
  /** Nombre completo para pantallas anchas. */
  name: string;
  /** Nombre corto para pantallas angostas. */
  short: string;
  /** Pista de navegación al pie. Opcional: no todas las estaciones la necesitan. */
  hint?: string;
}

export const STATIONS: readonly StationMeta[] = [
  { id: 1, name: "Cada palabra tiene una huella", short: "Huellas" },
  { id: 2, name: "El álbum de las palabras", short: "Álbum" },
  { id: 3, name: "La máquina completa la frase", short: "Frases" },
  { id: 4, name: "Búsqueda semántica", short: "Búsqueda" },
];

export const STATION_COUNT = STATIONS.length;
