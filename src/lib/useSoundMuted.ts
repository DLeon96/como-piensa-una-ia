import { useCallback, useEffect, useState } from "react";
import { setMuted } from "./sound";

const STORAGE_KEY = "espacio-del-significado:sonido-silenciado";

function readStoredPreference(): boolean {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // Silenciado por defecto: solo quedan dos sonidos de cierre (analogía
    // limpia o no limpia), y es mejor que el presentador decida activarlos.
    // Si no hay preferencia guardada todavía, arranca en silencio.
    return stored === null ? true : stored === "1";
  } catch {
    return true;
  }
}

/** Estado de silencio del sonido, persistido en localStorage entre sesiones. */
export function useSoundMuted(): [boolean, () => void] {
  const [muted, setMutedState] = useState(readStoredPreference);

  useEffect(() => {
    setMuted(muted);
    try {
      window.localStorage.setItem(STORAGE_KEY, muted ? "1" : "0");
    } catch {
      // localStorage puede fallar en modo privado; el toggle igual funciona en memoria.
    }
  }, [muted]);

  const toggle = useCallback(() => setMutedState((prev) => !prev), []);

  return [muted, toggle];
}
