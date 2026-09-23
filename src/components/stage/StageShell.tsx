import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StationId } from "../../features/embeddings/types";
import { initSoundOnUserGesture, playWhoosh } from "../../lib/sound";
import { useSoundMuted } from "../../lib/useSoundMuted";
import { Header } from "../layout/Header";
import { STATIONS, STATION_COUNT } from "../layout/stations";
import { MapStation } from "../stations/MapStation";
import { SearchStation } from "../stations/SearchStation";
import { SentenceStation } from "../stations/SentenceStation";
import type { StationProps } from "../stations/types";
import { VectorStation } from "../stations/VectorStation";
import { Button } from "../ui/Button";
import "./stage-shell.css";

interface StageShellProps {
  reducedMotion: boolean;
}

function StationView({ station, ...props }: StationProps & { station: StationId }) {
  switch (station) {
    case 1:
      return <VectorStation {...props} />;
    case 2:
      return <MapStation {...props} />;
    case 3:
      return <SentenceStation {...props} />;
    case 4:
      return <SearchStation {...props} />;
  }
}

/**
 * El escenario: cabecera con las pestañas, la tarjeta de la estación activa
 * en flujo normal (con scroll si hace falta) y el pie con la navegación.
 * Las estaciones pueden visitarse en cualquier orden (pestañas, flechas o
 * teclas 1 a 4) y el cambio entre ellas se anima como un pase de página,
 * hacia adelante o hacia atrás según corresponda.
 */
export function StageShell({ reducedMotion }: StageShellProps) {
  const [muted, toggleMuted] = useSoundMuted();
  const [station, setStation] = useState<StationId>(1);
  const [pending, setPending] = useState<StationId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<"forward" | "backward">("forward");

  const go = useCallback(
    (id: StationId) => {
      if (id === station || pending !== null) return;
      directionRef.current = id > station ? "forward" : "backward";
      playWhoosh(directionRef.current === "backward");
      if (reducedMotion) {
        setStation(id);
        return;
      }
      setPending(id);
    },
    [station, pending, reducedMotion],
  );

  useEffect(() => {
    if (pending === null || !panelRef.current) return;
    const el = panelRef.current;
    const offset = directionRef.current === "forward" ? 26 : -26;
    const timeline = gsap.timeline({ onComplete: () => setPending(null) });
    timeline
      .to(el, { opacity: 0, x: -offset, duration: 0.16, ease: "power1.in" })
      .call(() => setStation(pending))
      .set(el, { x: offset })
      .to(el, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out" });
    return () => {
      timeline.kill();
    };
  }, [pending]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight") go(Math.min(STATION_COUNT, station + 1) as StationId);
      else if (event.key === "ArrowLeft") go(Math.max(1, station - 1) as StationId);
      else if (["1", "2", "3", "4"].includes(event.key)) go(Number(event.key) as StationId);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, station]);

  const handleToggleSound = useCallback(() => {
    initSoundOnUserGesture();
    toggleMuted();
  }, [toggleMuted]);

  const meta = STATIONS.find((s) => s.id === station);
  const busy = pending !== null;

  return (
    <div className="stage">
      <Header station={station} onStation={go} muted={muted} onToggleSound={handleToggleSound} />

      <main className="stage__main">
        <div ref={panelRef} className="stage__panel">
          <StationView key={station} station={station} reducedMotion={reducedMotion} />
        </div>
      </main>

      <footer className="stage__foot">
        {meta?.hint ? <p className="stage__hint">{meta.hint}</p> : <span aria-hidden="true" />}
        <div className="stage__nav">
          <Button
            variant="ghost"
            icon="arrow-left"
            onClick={() => go(Math.max(1, station - 1) as StationId)}
            disabled={station === 1 || busy}
          >
            Anterior
          </Button>
          <Button
            iconAfter="arrow-right"
            onClick={() => go(Math.min(STATION_COUNT, station + 1) as StationId)}
            disabled={station === STATION_COUNT || busy}
          >
            Siguiente
          </Button>
        </div>
      </footer>

      <span className="visually-hidden" role="status" aria-live="polite">
        {meta ? `Estación ${meta.id}: ${meta.name}` : ""}
      </span>
    </div>
  );
}
