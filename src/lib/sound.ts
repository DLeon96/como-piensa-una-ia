/**
 * Sonido sintetizado con Web Audio API: cero dependencias y cero archivos de
 * audio.
 *
 * - `playClick`: tocar un chip, una tarjeta o una barra. Suave y corto para
 *   que se pueda repetir seguido sin cansar.
 * - `playSlide`: mover un slider, afinado según su valor (el llamador lo
 *   limita en frecuencia para no saturar al arrastrar).
 * - `playWhoosh`: cambiar de estación, un pequeño gesto "de película".
 * - `playChime`: el dado termina de elegir una palabra.
 *
 * El `AudioContext` se crea en el primer gesto del usuario (los navegadores
 * bloquean el audio sin gesto). Silenciado por defecto: el toggle visible de
 * la cabecera lo activa si el presentador quiere sonido.
 */

const MASTER_VOLUME = 0.5;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = true;

function ensureContext(): { ctx: AudioContext; master: GainNode } | null {
  if (typeof window === "undefined") return null;

  if (!audioContext) {
    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;

    audioContext = new AudioContextCtor();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : MASTER_VOLUME;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return { ctx: audioContext, master: masterGain! };
}

/** Debe llamarse en el primer gesto del usuario. */
export function initSoundOnUserGesture(): void {
  ensureContext();
}

export function setMuted(next: boolean): void {
  muted = next;
  if (masterGain && audioContext) {
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.linearRampToValueAtTime(next ? 0 : MASTER_VOLUME, now + 0.08);
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Nota con ataque corto y decaimiento a 0, agendada desde `delay` segundos. */
function tone(
  ctx: AudioContext,
  master: GainNode,
  freq: number,
  type: OscillatorType,
  attack: number,
  release: number,
  peak: number,
  delay = 0,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(master);

  const startAt = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + attack + release);

  osc.start(startAt);
  osc.stop(startAt + attack + release + 0.05);
}

/** Clic suave: tocar un chip, una tarjeta, una pestaña. */
export function playClick(): void {
  const context = ensureContext();
  if (!context) return;
  tone(context.ctx, context.master, 720, "sine", 0.003, 0.08, 0.55);
}

/**
 * Tono afinado según el valor de un slider (0 a 1): a más rasgo, más agudo.
 * El llamador lo limita en frecuencia (throttle) para no saturar al arrastrar.
 */
export function playSlide(value: number): void {
  const context = ensureContext();
  if (!context) return;
  const v = Math.max(0, Math.min(1, value));
  tone(context.ctx, context.master, 320 + v * 520, "sine", 0.003, 0.06, 0.4);
}

/** Barrido corto: cambiar de estación, un gesto "de película". */
export function playWhoosh(reverse = false): void {
  const context = ensureContext();
  if (!context) return;
  const { ctx, master } = context;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  filter.type = "lowpass";
  filter.Q.value = 0.6;

  const now = ctx.currentTime;
  const [from, to] = reverse ? [420, 1100] : [1100, 420];
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(to, now + 0.22);
  filter.frequency.setValueAtTime(2200, now);
  filter.frequency.exponentialRampToValueAtTime(500, now + 0.22);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.26);
}

/** Arpegio ascendente: el dado terminó de elegir una palabra. */
export function playChime(): void {
  const context = ensureContext();
  if (!context) return;
  const { ctx, master } = context;
  const notes: readonly [freq: number, delay: number][] = [
    [523.25, 0],
    [659.25, 0.09],
    [783.99, 0.18],
    [1046.5, 0.3],
  ];
  notes.forEach(([freq, delay]) => {
    tone(ctx, master, freq, "sine", 0.008, 0.36, 0.6, delay);
  });
}
