import React, { useState, useEffect, useRef, type ReactNode } from "react";
import { Eyebrow } from "./ui";

/* ── fill helper ──────────────────────────────────────────── */
function fill(value: number, max: number): string {
  if (value <= 0) return "var(--fl-surface-sunk)";
  const t = Math.min(1, value / max);
  const step = Math.ceil(t * 4);
  return `color-mix(in oklab, var(--fl-accent) ${step * 22}%, var(--fl-surface-sunk))`;
}

/* ── WeekStrip ────────────────────────────────────────────── */
export function WeekStrip({
  days,
  todayIndex,
  max = 30,
  labels = ["S", "M", "T", "W", "T", "F", "S"],
}: {
  days: number[];
  todayIndex?: number;
  max?: number;
  labels?: string[];
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {days.map((minutes, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "1",
              borderRadius: "var(--fl-r-sm)",
              background: fill(minutes, max),
              border:
                i === todayIndex
                  ? "2px solid var(--fl-accent)"
                  : "1px solid var(--fl-line-soft)",
              transition: "background 300ms",
            }}
            title={`${labels[i]}: ${minutes} min`}
          />
          <span
            style={{
              fontSize: "var(--fl-t-label)",
              color: i === todayIndex ? "var(--fl-accent)" : "var(--fl-ink-4)",
              fontWeight: i === todayIndex ? 600 : 400,
            }}
          >
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Heatmap ──────────────────────────────────────────────── */
export function Heatmap({
  weeks,
  rowLabels = ["M", "Tu", "W", "Th", "F"],
  max = 30,
}: {
  weeks: number[][];
  rowLabels?: string[];
  max?: number;
}) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          paddingTop: 0,
          paddingRight: 4,
        }}
      >
        {rowLabels.map((l) => (
          <div
            key={l}
            style={{
              height: 14,
              fontSize: "var(--fl-t-label)",
              color: "var(--fl-ink-4)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flex: 1,
        }}
      >
        {weeks.map((week, w) => (
          <div
            key={w}
            style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}
          >
            {rowLabels.map((label, day) => (
              <div
                key={day}
                style={{
                  height: 14,
                  borderRadius: 3,
                  background: fill(week[day] ?? 0, max),
                  transition: "background 300ms",
                }}
                title={`${label}, week ${w + 1}: ${week[day] ?? 0} min`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HeatLegend ───────────────────────────────────────────── */
export function HeatLegend({
  less = "Less",
  more = "More",
  steps = 5,
  max = 30,
}: {
  less?: string;
  more?: string;
  steps?: number;
  max?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: "var(--fl-t-label)",
        color: "var(--fl-ink-4)",
      }}
    >
      <span>{less}</span>
      {Array.from({ length: steps }, (_, i) => (
        <span
          key={i}
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            background: fill((i / (steps - 1)) * max, max),
            display: "inline-block",
          }}
        />
      ))}
      <span>{more}</span>
    </div>
  );
}

/* ── MetronomeDial ────────────────────────────────────────── */
export function MetronomeDial({
  bpm,
  beatsPerBar = 4,
  beat = -1,
  running = false,
  min = 40,
  max = 208,
  note,
  onChange,
  onToggle,
  onTap,
}: {
  bpm: number;
  beatsPerBar?: number;
  beat?: number;
  running?: boolean;
  min?: number;
  max?: number;
  note?: string;
  onChange?: (bpm: number) => void;
  onToggle?: () => void;
  onTap?: () => void;
}) {
  const size = 192;
  const r = size / 2 - 10;
  const TICKS = 40;
  const c = size / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        fontFamily: "var(--fl-font)",
      }}
    >
      {/* Dial */}
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          aria-hidden="true"
          style={{ display: "block" }}
        >
          {/* Base ring */}
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="var(--fl-line)"
            strokeWidth={1.5}
          />

          {/* Tick marks showing BPM progress */}
          {Array.from({ length: TICKS }, (_, i) => {
            const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
            const on = i / TICKS <= (bpm - min) / (max - min);
            const longTick = i % 10 === 0;
            return (
              <line
                key={`t-${i}`}
                x1={c + Math.cos(a) * (r - 2)}
                y1={c + Math.sin(a) * (r - 2)}
                x2={c + Math.cos(a) * (r - (longTick ? 10 : 6))}
                y2={c + Math.sin(a) * (r - (longTick ? 10 : 6))}
                stroke={on ? "var(--fl-accent)" : "var(--fl-line)"}
                strokeWidth={longTick ? 2 : 1.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Beat dots on circumference */}
          {Array.from({ length: beatsPerBar }, (_, i) => {
            const a = (i / beatsPerBar) * Math.PI * 2 - Math.PI / 2;
            const active = i === beat && running;
            return (
              <circle
                key={`b-${i}`}
                cx={c + Math.cos(a) * r}
                cy={c + Math.sin(a) * r}
                r={active ? 6 : 4}
                fill={active ? "var(--fl-accent)" : "var(--fl-accent-line)"}
                style={{ transition: "r 80ms, fill 80ms" }}
              />
            );
          })}

          {/* Inner fill circle */}
          <circle
            cx={c}
            cy={c}
            r={r - 18}
            fill="var(--fl-surface)"
            stroke="var(--fl-line-soft)"
            strokeWidth={1}
          />
        </svg>

        {/* BPM readout */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "2.4rem",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--fl-ink)",
            }}
          >
            {bpm}
          </div>
          <div
            style={{
              fontSize: "var(--fl-t-label)",
              fontWeight: 600,
              letterSpacing: "0.1em",
              color: "var(--fl-ink-4)",
              textTransform: "uppercase",
              marginTop: 3,
            }}
          >
            BPM
          </div>
        </div>
      </div>

      {note && (
        <p
          style={{
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {note}
        </p>
      )}

      {/* Range slider */}
      <input
        type="range"
        min={min}
        max={max}
        value={bpm}
        aria-label="Tempo"
        onChange={(e) => onChange?.(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--fl-accent)" }}
      />

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, width: "100%", justifyContent: "center" }}>
        <DialButton onClick={() => onChange?.(Math.max(min, bpm - 4))}>−4</DialButton>
        <DialButton
          primary
          onClick={onToggle}
        >
          {running ? "Stop" : "Start"}
        </DialButton>
        <DialButton onClick={() => onChange?.(Math.min(max, bpm + 4))}>+4</DialButton>
      </div>
      {onTap && (
        <DialButton quiet onClick={onTap}>
          Tap tempo
        </DialButton>
      )}
    </div>
  );
}

function DialButton({
  children,
  primary = false,
  quiet = false,
  onClick,
}: {
  children: ReactNode;
  primary?: boolean;
  quiet?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "7px 14px",
        borderRadius: "var(--fl-r-md)",
        border: primary
          ? "none"
          : quiet
          ? "none"
          : "1px solid var(--fl-line)",
        background: primary
          ? "var(--fl-accent)"
          : quiet
          ? "transparent"
          : "var(--fl-surface)",
        color: primary ? "#fff" : quiet ? "var(--fl-ink-3)" : "var(--fl-ink)",
        fontFamily: "var(--fl-font)",
        fontSize: "var(--fl-t-small)",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 120ms, transform 80ms",
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {children}
    </button>
  );
}

/* ── MetronomeDialLive ────────────────────────────────────── */
export function MetronomeDialLive({
  bpm,
  onChange,
}: {
  bpm: number;
  onChange?: (bpm: number) => void;
}) {
  const [running, setRunning] = useState(false);
  const [beat, setBeat] = useState(-1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tapTimesRef = useRef<number[]>([]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setBeat(-1);
      return;
    }
    let b = 0;
    setBeat(0);
    intervalRef.current = setInterval(() => {
      b = (b + 1) % 4;
      setBeat(b);
    }, (60 / bpm) * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, bpm]);

  function tap() {
    const now = performance.now();
    tapTimesRef.current = [...tapTimesRef.current.slice(-5), now];
    const times = tapTimesRef.current;
    if (times.length >= 2) {
      const intervals = times.slice(1).map((t, i) => t - times[i]);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      onChange?.(Math.round(60000 / avg));
    }
  }

  return (
    <MetronomeDial
      bpm={bpm}
      beat={beat}
      running={running}
      onChange={onChange}
      onToggle={() => setRunning((r) => !r)}
      onTap={tap}
      note={running ? `${bpm} bpm · 4/4` : "Use the slider or tap to set tempo"}
    />
  );
}

/* ── TempoLadder ──────────────────────────────────────────── */
export function TempoLadder({
  steps,
  value,
  onChange,
  label = "Tempo ladder",
}: {
  steps: number[];
  value: number;
  onChange?: (bpm: number) => void;
  label?: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Eyebrow>{label}</Eyebrow>
        <span
          style={{
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            fontFamily: "var(--fl-font-mono)",
          }}
        >
          {value} bpm
        </span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {steps.map((s) => {
          const on = s === value;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={on}
              onClick={() => onChange?.(s)}
              style={{
                padding: "7px 14px",
                borderRadius: "var(--fl-r-md)",
                border: `1px solid ${on ? "var(--fl-accent)" : "var(--fl-line)"}`,
                background: on ? "var(--fl-accent)" : "var(--fl-surface)",
                color: on ? "#fff" : "var(--fl-ink-2)",
                fontFamily: "var(--fl-font-mono)",
                fontSize: "var(--fl-t-small)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 120ms, border-color 120ms, color 120ms",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── StepStrip ────────────────────────────────────────────── */
export function StepStrip({
  steps,
  activeIndex = 0,
  onSelect,
}: {
  steps: Array<{ title: string; body?: string }>;
  activeIndex?: number;
  onSelect?: (i: number) => void;
}) {
  return (
    <ol
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        gap: 0,
        border: "1px solid var(--fl-line)",
        borderRadius: "var(--fl-r-xl)",
        overflow: "hidden",
      }}
    >
      {steps.map((s, i) => {
        const on = i === activeIndex;
        return (
          <li
            key={i}
            onClick={onSelect ? () => onSelect(i) : undefined}
            style={{
              flex: 1,
              padding: "16px 18px",
              background: on ? "var(--fl-accent-softer)" : "var(--fl-surface)",
              borderRight: i < steps.length - 1 ? "1px solid var(--fl-line)" : "none",
              cursor: onSelect ? "pointer" : "default",
              transition: "background 140ms",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: on ? "var(--fl-accent)" : "var(--fl-line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: on ? "#fff" : "var(--fl-ink-3)",
                  flexShrink: 0,
                  marginTop: 1,
                  transition: "background 140ms, color 140ms",
                }}
              >
                {i + 1}
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "var(--fl-t-small)",
                    fontWeight: 700,
                    color: on ? "var(--fl-accent-ink)" : "var(--fl-ink)",
                    marginBottom: 2,
                  }}
                >
                  {s.title}
                </span>
                {s.body && (
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--fl-t-label)",
                      color: on ? "var(--fl-accent)" : "var(--fl-ink-3)",
                    }}
                  >
                    {s.body}
                  </span>
                )}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── WhyThisDrill ─────────────────────────────────────────── */
export function WhyThisDrill({
  cells,
  aside,
}: {
  cells: Array<{ label: string; value: string; note?: string }>;
  aside?: ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Eyebrow>Why this drill</Eyebrow>
        {aside}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          border: "1px solid var(--fl-line)",
          borderRadius: "var(--fl-r-xl)",
          overflow: "hidden",
        }}
      >
        {cells.map((c, i) => (
          <div key={c.label} style={{ display: "flex", alignItems: "stretch", flex: 1 }}>
            <div
              style={{
                flex: 1,
                padding: "16px 18px",
                background: "var(--fl-surface)",
              }}
            >
              <div
                style={{
                  fontSize: "var(--fl-t-label)",
                  color: "var(--fl-ink-4)",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {c.label}
              </div>
              <div
                style={{
                  fontSize: "var(--fl-t-body)",
                  fontWeight: 700,
                  color: "var(--fl-ink)",
                  marginBottom: c.note ? 4 : 0,
                }}
              >
                {c.value}
              </div>
              {c.note && (
                <div
                  style={{
                    fontSize: "var(--fl-t-small)",
                    color: "var(--fl-ink-3)",
                    lineHeight: 1.4,
                  }}
                >
                  {c.note}
                </div>
              )}
            </div>
            {i < cells.length - 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 2px",
                  background: "var(--fl-surface-sunk)",
                  borderLeft: "1px solid var(--fl-line)",
                  borderRight: "1px solid var(--fl-line)",
                  color: "var(--fl-ink-4)",
                  fontSize: "0.8rem",
                }}
              >
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── GoalBar ──────────────────────────────────────────────── */
export function GoalBar({
  label = "Goal",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: "var(--fl-r-md)",
        background: "var(--fl-accent-softer)",
        border: "1px solid var(--fl-accent-line)",
      }}
    >
      <span
        style={{
          fontSize: "var(--fl-t-small)",
          fontWeight: 600,
          color: "var(--fl-accent-ink)",
        }}
      >
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}

/* ── FinishLineCard ───────────────────────────────────────── */
export function FinishLineCard({
  title,
  note,
  eyebrow = "Finish line",
}: {
  title: string;
  note?: string;
  eyebrow?: string;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: "var(--fl-r-lg)",
        background: "var(--fl-surface)",
        border: "1px solid var(--fl-line)",
        borderLeft: "3px solid var(--fl-accent)",
      }}
    >
      <Eyebrow accent>{eyebrow}</Eyebrow>
      <div
        style={{
          fontSize: "var(--fl-t-body)",
          fontWeight: 700,
          color: "var(--fl-ink)",
          marginBottom: note ? 4 : 0,
        }}
      >
        {title}
      </div>
      {note && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            lineHeight: 1.5,
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/* ── DegreeChips ──────────────────────────────────────────── */
const DEGREE_COLORS = [
  "#6152d9", "#7a6ae7", "#8b7cec", "#a59ef0",
  "#938bec", "#b7b0f5", "#7065e0",
];

export function DegreeChips({
  degrees,
  hue,
  onSelect,
}: {
  degrees: Array<{ numeral: string; chord: string; quality?: "major" | "minor" | "diminished" }>;
  hue?: number;
  onSelect?: (chord: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        ...(hue !== undefined ? ({ "--fl-key-h": hue } as React.CSSProperties) : {}),
      }}
    >
      {degrees.map((d, i) => (
        <button
          key={d.numeral}
          type="button"
          onClick={() => onSelect?.(d.chord)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 12px",
            borderRadius: "var(--fl-r-md)",
            border: "1px solid var(--fl-line)",
            background: "var(--fl-surface)",
            cursor: "pointer",
            fontFamily: "var(--fl-font)",
            transition: "border-color 120ms, background 120ms, transform 80ms",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--fl-accent-line)";
            (e.currentTarget as HTMLElement).style.background = "var(--fl-accent-softer)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--fl-line)";
            (e.currentTarget as HTMLElement).style.background = "var(--fl-surface)";
          }}
          onMouseDown={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(0.96)";
          }}
          onMouseUp={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "";
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: DEGREE_COLORS[i % DEGREE_COLORS.length],
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: "var(--fl-t-label)",
              fontWeight: 600,
              color: "var(--fl-ink-4)",
              letterSpacing: "0.04em",
              minWidth: 16,
              textAlign: "center",
            }}
          >
            {d.numeral}
          </span>
          <span
            style={{
              fontSize: "var(--fl-t-small)",
              fontWeight: 600,
              color: "var(--fl-ink)",
              fontFamily: "var(--fl-font-mono)",
            }}
          >
            {d.chord}
          </span>
        </button>
      ))}
    </div>
  );
}

