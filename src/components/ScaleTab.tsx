/**
 * ScaleTab — a tab-notation mirror of the Fretboard.
 *
 * Accepts the same Marker[] the Fretboard consumes.
 * Renders 6 horizontal string lines with tone-coloured fret-number
 * bubbles positioned at the same (string, fret) coordinates, so
 * the two views stay in perfect visual sync.
 */

import type { Marker, MarkerTone } from "./Fretboard";

/* ── Visual constants ─────────────────────────────────────────── */
const STR_H = 26;          // px between string lines
const FRET_W = 54;         // px per fret column
const LABEL_W = 26;        // left gutter for string labels
const PAD_T = 16;          // top padding
const PAD_B = 28;          // bottom for fret numbers
const R = 13;              // marker bubble radius

/** Same tone fills as Fretboard.tsx for visual parity */
const TONE_FILL: Record<MarkerTone, string> = {
  root: "#b7abf7",
  third: "#8b7cec",
  fifth: "#f0eeff",
  scale: "#d8d3f2",
  ghost: "transparent",
};
const TONE_TEXT: Record<MarkerTone, string> = {
  root: "#17161b",
  third: "#fff",
  fifth: "#4e42b0",
  scale: "#5549c0",
  ghost: "transparent",
};
const TONE_STROKE: Record<MarkerTone, string> = {
  root: "#9a8de0",
  third: "#6152d9",
  fifth: "#b7abf7",
  scale: "#b7abf7",
  ghost: "transparent",
};

/** Standard tuning labels: index 0 = high e (top of staff) */
const STRING_LABELS = ["e", "B", "G", "D", "A", "E"];

/** String line thickness grows toward low E (index 5 = thickest) */
function strW(i: number) { return 0.7 + i * 0.28; }

interface ScaleTabProps {
  markers?: Marker[];
  strings?: string[];
  /** Explicit fret range; auto-detected from markers when omitted */
  fromFret?: number;
  toFret?: number;
  /** Label shown above the staff */
  title?: string;
}

export function ScaleTab({
  markers = [],
  strings = STRING_LABELS,
  fromFret: fromFretProp,
  toFret: toFretProp,
  title,
}: ScaleTabProps) {
  if (markers.length === 0) {
    return (
      <div style={{ padding: "20px 24px", textAlign: "center", fontSize: "0.78rem", color: "var(--fl-ink-4)" }}>
        No notes to display
      </div>
    );
  }

  /* ── Fret range ─────────────────────────────────────────────── */
  const frets = markers.map(m => m.fret);
  const minF = fromFretProp ?? Math.max(0, Math.min(...frets) - 1);
  const maxF = toFretProp ?? Math.max(...frets) + 1;
  const fretCount = maxF - minF + 1;

  /* ── SVG dimensions ─────────────────────────────────────────── */
  const staffH = (strings.length - 1) * STR_H;
  const W = LABEL_W + fretCount * FRET_W + 16;
  const H = PAD_T + staffH + PAD_B;

  /* ── Coordinate helpers ─────────────────────────────────────── */
  const cx = (fret: number) => LABEL_W + (fret - minF) * FRET_W + FRET_W / 2;
  const cy = (si: number) => PAD_T + si * STR_H;

  /* ── Nut / boundary ─────────────────────────────────────────── */
  const showNut = minF === 0;

  /* ── Build per-string open markers (fret 0 shown as O) ─────── */
  const fretRange = Array.from({ length: fretCount }, (_, i) => minF + i);

  return (
    <div style={{ overflowX: "auto" }}>
      {title && (
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 8 }}>
          {title}
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        style={{ display: "block", overflow: "visible" }}
        aria-label="Scale tab diagram"
      >
        {/* ── Fret column backgrounds (alternating subtle fill) ── */}
        {fretRange.map((f, col) => col % 2 === 1 && (
          <rect
            key={`bg-${f}`}
            x={LABEL_W + col * FRET_W}
            y={PAD_T - 6}
            width={FRET_W}
            height={staffH + 12}
            fill="var(--fl-surface-sunk)"
            opacity={0.4}
          />
        ))}

        {/* ── Nut (thick left border when fret 0 included) ─────── */}
        {showNut && (
          <rect
            x={LABEL_W - 1}
            y={PAD_T - 8}
            width={3}
            height={staffH + 16}
            rx={1.5}
            fill="var(--fl-ink-3)"
          />
        )}

        {/* ── Fret wire lines (vertical) ────────────────────────── */}
        {fretRange.map((f, col) => (
          <line
            key={`fwire-${f}`}
            x1={LABEL_W + col * FRET_W}
            y1={PAD_T - 6}
            x2={LABEL_W + col * FRET_W}
            y2={PAD_T + staffH + 6}
            stroke="var(--fl-line)"
            strokeWidth={f === 12 ? 1.5 : 0.8}
            strokeDasharray={f === 12 ? "none" : "none"}
            opacity={0.7}
          />
        ))}
        {/* Right border */}
        <line
          x1={LABEL_W + fretCount * FRET_W}
          y1={PAD_T - 6}
          x2={LABEL_W + fretCount * FRET_W}
          y2={PAD_T + staffH + 6}
          stroke="var(--fl-line)"
          strokeWidth={0.8}
          opacity={0.7}
        />

        {/* ── String lines (horizontal) ─────────────────────────── */}
        {strings.map((_, si) => (
          <line
            key={`str-${si}`}
            x1={LABEL_W}
            y1={cy(si)}
            x2={LABEL_W + fretCount * FRET_W}
            y2={cy(si)}
            stroke="var(--fl-ink-3)"
            strokeWidth={strW(si)}
            opacity={0.55}
          />
        ))}

        {/* ── String labels (left gutter) ───────────────────────── */}
        {strings.map((s, si) => (
          <text
            key={`lbl-${si}`}
            x={LABEL_W - 6}
            y={cy(si)}
            textAnchor="end"
            dominantBaseline="central"
            fontSize={9}
            fontFamily="var(--fl-font-mono)"
            fontWeight={700}
            fill="var(--fl-ink-4)"
          >
            {s}
          </text>
        ))}

        {/* ── Fret number axis (bottom) ─────────────────────────── */}
        {fretRange.map((f, col) => (
          <g key={`fnum-${f}`}>
            {/* Tick mark */}
            <line
              x1={cx(f)}
              y1={PAD_T + staffH + 8}
              x2={cx(f)}
              y2={PAD_T + staffH + 12}
              stroke="var(--fl-ink-4)"
              strokeWidth={0.8}
              opacity={0.5}
            />
            <text
              x={cx(f)}
              y={PAD_T + staffH + 20}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={8.5}
              fontFamily="var(--fl-font-mono)"
              fontWeight={[3, 5, 7, 9, 12].includes(f) ? 700 : 400}
              fill={[3, 5, 7, 9, 12].includes(f) ? "var(--fl-ink-2)" : "var(--fl-ink-4)"}
            >
              {f}
            </text>
          </g>
        ))}

        {/* ── Inlay dots (decorative) ───────────────────────────── */}
        {fretRange
          .filter(f => [3, 5, 7, 9].includes(f))
          .map(f => (
            <circle
              key={`inlay-${f}`}
              cx={cx(f)}
              cy={PAD_T + staffH + 6}
              r={2}
              fill="var(--fl-accent)"
              opacity={0.35}
            />
          ))}
        {fretRange.includes(12) && [0.38, 0.62].map((offset, oi) => (
          <circle
            key={`inlay-12-${oi}`}
            cx={cx(12) + (oi === 0 ? -6 : 6)}
            cy={PAD_T + staffH + 6}
            r={2}
            fill="var(--fl-accent)"
            opacity={0.35}
          />
        ))}

        {/* ── Markers ───────────────────────────────────────────── */}
        {markers.map((m, idx) => {
          const tone = m.tone ?? "scale";
          const x = cx(m.fret);
          const y = cy(m.stringIndex);
          const fill = TONE_FILL[tone];
          const textCol = TONE_TEXT[tone];
          const stroke = TONE_STROKE[tone];
          const isRoot = m.emphasis || tone === "root";
          const label = m.fret === 0 ? "O" : String(m.fret);

          return (
            <g key={m.id ?? `m-${idx}`}>
              {/* Drop shadow for depth */}
              <circle
                cx={x + 0.5}
                cy={y + 1}
                r={R}
                fill="rgba(0,0,0,0.08)"
              />
              <circle
                cx={x}
                cy={y}
                r={R}
                fill={fill}
                stroke={stroke}
                strokeWidth={isRoot ? 1.5 : 1}
              />
              {/* Root gets an extra outer ring */}
              {isRoot && (
                <circle
                  cx={x}
                  cy={y}
                  r={R + 3}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1}
                  opacity={0.45}
                />
              )}
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={label.length > 1 ? 8.5 : 9.5}
                fontWeight={700}
                fontFamily="var(--fl-font-mono)"
                fill={textCol}
                style={{ pointerEvents: "none" }}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* ── Fret range label (top right) ──────────────────────── */}
        <text
          x={W - 6}
          y={PAD_T - 8}
          textAnchor="end"
          fontSize={8}
          fontFamily="var(--fl-font-mono)"
          fill="var(--fl-ink-4)"
        >
          frets {minF}–{maxF}
        </text>
      </svg>

      {/* ── Tone legend ───────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, marginTop: 10, paddingLeft: LABEL_W }}>
        {(["root", "third", "fifth", "scale"] as MarkerTone[]).map(tone => (
          <div key={tone} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: TONE_FILL[tone], border: `1px solid ${TONE_STROKE[tone]}`, flexShrink: 0 }} />
            <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)", textTransform: "capitalize", fontFamily: "var(--fl-font)" }}>{tone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
