import { useId, useMemo } from "react";
import { clamp01 } from "../../features/embeddings/vectors";
import "./huella.css";

interface Point {
  x: number;
  y: number;
}

const VIEW = 100;
const CENTER = VIEW / 2;
const R_MIN = VIEW * 0.14;
const R_MAX = VIEW * 0.46;

/**
 * Un punto por número del vector, repartidos en círculo. Sirve tanto para
 * las 7 medidas de una palabra como para el vector de tema (menos medidas)
 * de la estación de búsqueda: la cantidad de puntas se adapta sola al largo
 * del vector que se le pase.
 */
function pointsFor(vec: readonly number[]): Point[] {
  const count = vec.length;
  const points: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / count;
    const r = R_MIN + clamp01(vec[i] ?? 0) * (R_MAX - R_MIN);
    points.push({ x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) });
  }
  return points;
}

/**
 * Curva suave que pasa CERCA de cada punto (cuadrática hacia el punto medio
 * del siguiente lado), en vez de unirlos con líneas rectas. Es lo que hace
 * que la forma se vea como una mancha orgánica y no como un radar técnico.
 */
function blobPath(points: readonly Point[]): string {
  const n = points.length;
  const first = points[0];
  const last = points[n - 1];
  if (!first || !last) return "";
  const mid = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(last, first);
  let d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} `;
  for (let i = 0; i < n; i += 1) {
    const p = points[i];
    const next = points[(i + 1) % n];
    if (!p || !next) continue;
    const m = mid(p, next);
    d += `Q ${p.x.toFixed(2)} ${p.y.toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)} `;
  }
  return `${d}Z`;
}

export interface HuellaProps {
  /** Vector de 7 rasgos (0 a 1), en el orden de `TRAITS`. */
  vec: readonly number[];
  /** Color de relleno y borde: una `var(--...)` del tema. */
  color: string;
  size?: number;
  /** Segunda huella para comparar, dibujada como contorno punteado. */
  compareVec?: readonly number[];
  compareColor?: string;
  className?: string;
  title?: string;
  /**
   * `true` cuando ya hay texto visible al lado (el nombre de la palabra en
   * una tarjeta o botón): la huella se oculta a los lectores de pantalla
   * para no duplicar el nombre accesible. Por defecto es informativa.
   */
  decorative?: boolean;
}

/**
 * La huella de una palabra: una mancha de 7 puntas (una por rasgo) en vez de
 * un punto en un plano con ejes. Comparar dos palabras es superponer sus
 * huellas: cuanto más se tapan, más cerca están en significado. Sin ejes,
 * grados ni números dibujados: se lee como forma, no como gráfico técnico.
 */
export function Huella({
  vec,
  color,
  size = 96,
  compareVec,
  compareColor,
  className,
  title,
  decorative = false,
}: HuellaProps) {
  const gradientId = useId();
  const path = useMemo(() => blobPath(pointsFor(vec)), [vec]);
  const comparePath = useMemo(() => (compareVec ? blobPath(pointsFor(compareVec)) : null), [compareVec]);
  const a11yProps = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": title ?? "Huella de la palabra" };

  return (
    <svg
      className={`huella${className ? ` ${className}` : ""}`}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      width={size}
      height={size}
      {...a11yProps}
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor={color} stopOpacity="0.88" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {comparePath && (
        <path
          d={comparePath}
          fill="none"
          stroke={compareColor ?? color}
          strokeWidth={2.4}
          strokeDasharray="4 3.5"
          strokeLinejoin="round"
          opacity={0.8}
        />
      )}
      <path d={path} fill={`url(#${gradientId})`} stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}
