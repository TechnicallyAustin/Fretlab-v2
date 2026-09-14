import type { CSSProperties } from "react";

export type MarkerTone = "root" | "third" | "fifth" | "scale" | "ghost";

export interface Marker {
  id?: string;
  stringIndex: number; // 0 = high E
  fret: number;
  label?: string;
  tone?: MarkerTone;
  emphasis?: boolean;
}

interface FretboardProps {
  strings?: string[];
  fromFret?: number;
  toFret?: number;
  markers?: Marker[];
  inlays?: number[];
  showLabels?: boolean;
  showNumbers?: boolean;
  density?: "comfortable" | "compact";
  className?: string;
  style?: CSSProperties;
  activeId?: string;
  onMarkerClick?: (m: Marker) => void;
}

const TONE_FILL: Record<MarkerTone, string> = {
  root: "#b7abf7",
  third: "#8b7cec",
  fifth: "#ffffff",
  scale: "#2f2e36",
  ghost: "transparent",
};
const TONE_TEXT: Record<MarkerTone, string> = {
  root: "#1b1a1f",
  third: "#ffffff",
  fifth: "#1b1a1f",
  scale: "rgba(255,255,255,0.72)",
  ghost: "rgba(255,255,255,0.25)",
};

const DEFAULT_STRINGS = ["E", "B", "G", "D", "A", "E"];
const DEFAULT_INLAYS = [3, 5, 7, 9, 12];

export function Fretboard({
  strings = DEFAULT_STRINGS,
  fromFret = 0,
  toFret = 12,
  markers = [],
  inlays = DEFAULT_INLAYS,
  showLabels = true,
  showNumbers = true,
  density = "comfortable",
  style,
  activeId,
  onMarkerClick,
}: FretboardProps) {
  const compact = density === "compact";
  const rowH = compact ? 22 : 36;
  const fretW = compact ? 34 : 54;
  const openW = fromFret === 0 ? (compact ? 24 : 38) : 0;
  const labelW = showLabels ? (compact ? 14 : 20) : 0;
  const numberH = showNumbers ? (compact ? 16 : 22) : 0;
  const r = compact ? 8 : 13;

  const firstWired = Math.max(fromFret, 1);
  const fretCount = toFret - firstWired + 1;

  const bX = labelW + 6;
  const bY = 6;
  const bW = openW + fretCount * fretW;
  const bH = strings.length * rowH;
  const W = bX + bW + 6;
  const H = bY + bH + numberH + 6;

  const ry = (i: number) => bY + rowH * i + rowH / 2;
  const fx = (fret: number) =>
    fret === 0 && fromFret === 0
      ? bX + openW / 2
      : bX + openW + (fret - firstWired) * fretW + fretW / 2;
  const wireX = (fret: number) => bX + openW + (fret - firstWired + 1) * fretW;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", display: "block", ...style }}
      aria-label="Guitar fretboard"
    >
      {/* neck */}
      <rect x={bX} y={bY} width={bW} height={bH} rx={compact ? 5 : 8} fill="var(--fl-neck)" />

      {/* inlays */}
      {inlays
        .filter((f) => f >= firstWired && f <= toFret)
        .map((f) =>
          f === 12 ? (
            [0.35, 0.65].map((offset, oi) => (
              <circle
                key={`inlay-${f}-${oi}`}
                cx={fx(f)}
                cy={bY + bH * offset}
                r={compact ? 2 : 3.5}
                fill="rgba(255,255,255,0.2)"
              />
            ))
          ) : (
            <circle
              key={`inlay-${f}`}
              cx={fx(f)}
              cy={bY + bH / 2}
              r={compact ? 2 : 3.5}
              fill="rgba(255,255,255,0.2)"
            />
          )
        )}

      {/* fret wires */}
      {Array.from({ length: fretCount }, (_, i) => firstWired + i).map((f) => (
        <line
          key={`wire-${f}`}
          x1={wireX(f)} x2={wireX(f)} y1={bY} y2={bY + bH}
          stroke="rgba(255,255,255,0.18)" strokeWidth={f === 12 ? 2 : 1}
        />
      ))}
      {fromFret === 0 && (
        <line x1={bX + openW} x2={bX + openW} y1={bY} y2={bY + bH} stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} />
      )}

      {/* strings */}
      {strings.map((_, i) => (
        <line
          key={`s-${i}`}
          x1={bX} x2={bX + bW} y1={ry(i)} y2={ry(i)}
          stroke="rgba(255,255,255,0.32)" strokeWidth={0.55 + i * 0.16}
        />
      ))}

      {/* markers */}
      {markers.map((m, i) => {
        const tone = m.tone ?? "scale";
        const x = fx(m.fret);
        const y = ry(m.stringIndex);
        const fill = m.emphasis ? "var(--fl-root)" : TONE_FILL[tone];
        const textFill = m.emphasis ? "#1b1a1f" : TONE_TEXT[tone];
        const isActive = m.id === activeId;
        return (
          <g
            key={m.id ?? `m-${i}`}
            onClick={() => onMarkerClick?.(m)}
            style={{ cursor: onMarkerClick ? "pointer" : "default" }}
          >
            <circle
              cx={x} cy={y} r={r}
              fill={fill}
              stroke={isActive ? "#fff" : tone === "ghost" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)"}
              strokeWidth={isActive ? 2.5 : tone === "fifth" ? 2 : 1}
            />
            {tone === "fifth" && !m.emphasis && (
              <circle cx={x} cy={y} r={r - 4} fill="none" stroke="#1b1a1f" strokeWidth={1.2} />
            )}
            {m.label && (
              <text
                x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize={compact ? 8 : 12} fontWeight={600} fill={textFill}
                style={{ pointerEvents: "none", fontFamily: "var(--fl-font)" }}
              >
                {m.label}
              </text>
            )}
          </g>
        );
      })}

      {/* string labels */}
      {showLabels &&
        strings.map((s, i) => (
          <text
            key={`sl-${i}`} x={labelW - 3} y={ry(i)}
            textAnchor="end" dominantBaseline="central"
            fontSize={compact ? 8 : 10} fill="rgba(255,255,255,0.35)"
            style={{ fontFamily: "var(--fl-font-mono)" }}
          >
            {s}
          </text>
        ))}

      {/* fret numbers */}
      {showNumbers &&
        Array.from({ length: fretCount }, (_, i) => firstWired + i).map((f) => (
          <text
            key={`fn-${f}`}
            x={fx(f)} y={bY + bH + numberH / 2 + 2}
            textAnchor="middle" dominantBaseline="central"
            fontSize={compact ? 8 : 10}
            fontWeight={inlays.includes(f) ? 600 : 400}
            fill={inlays.includes(f) ? "var(--fl-ink-2)" : "var(--fl-ink-4)"}
            style={{ fontFamily: "var(--fl-font-mono)" }}
          >
            {f}
          </text>
        ))}
    </svg>
  );
}

export function ChordDiagram({ markers, name, toFret = 4 }: { markers: Marker[]; name?: string; toFret?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      {name && (
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fl-ink)", letterSpacing: "-0.01em" }}>
          {name}
        </div>
      )}
      <div style={{ width: 120 }}>
        <Fretboard fromFret={0} toFret={toFret} markers={markers} density="compact" showNumbers={false} />
      </div>
    </div>
  );
}
