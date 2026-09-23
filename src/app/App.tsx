import { StageShell } from "../components/stage/StageShell";
import { usePrefersReducedMotion } from "../lib/usePrefersReducedMotion";

/** Sin portada que cruzar: se entra directo al contenido, como en la referencia. */
export function App() {
  const reducedMotion = usePrefersReducedMotion();
  return <StageShell reducedMotion={reducedMotion} />;
}
