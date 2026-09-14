import { type ReactNode, type CSSProperties } from "react";
import { Eyebrow, LevelBadge, Stat, Card, ArrowLink, HearButton } from "./ui";

/* ── Hero ─────────────────────────────────────────────────── */
export function Hero({
  eyebrow,
  title,
  sub,
  meta,
  tone = "dark",
  aside,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  meta?: string;
  tone?: "dark" | "light";
  aside?: ReactNode;
}) {
  const dark = tone === "dark";
  return (
    <section
      style={{
        position: "relative",
        borderRadius: "var(--fl-r-xl)",
        overflow: "hidden",
        background: dark ? "var(--fl-dark)" : "var(--fl-surface)",
        border: dark ? "none" : "1px solid var(--fl-line)",
        minHeight: 180,
      }}
    >
      {dark && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 60% 40%, oklch(0.38 0.16 var(--fl-key-h) / 0.45) 0%, transparent 70%), radial-gradient(ellipse at 30% 80%, rgba(97,82,217,0.18) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          padding: dark ? "32px 36px" : "28px 32px",
          display: "flex",
          gap: 32,
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && <Eyebrow onDark={dark}>{eyebrow}</Eyebrow>}
          <h2
            style={{
              margin: "0 0 10px",
              fontSize: "var(--fl-t-title)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              color: dark ? "#fff" : "var(--fl-ink)",
            }}
          >
            {title}
          </h2>
          {sub && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: "var(--fl-t-body)",
                color: dark ? "rgba(255,255,255,0.62)" : "var(--fl-ink-2)",
                lineHeight: 1.6,
                maxWidth: "52ch",
              }}
            >
              {sub}
            </p>
          )}
          {meta && (
            <div
              style={{
                fontSize: "var(--fl-t-small)",
                color: dark ? "rgba(255,255,255,0.4)" : "var(--fl-ink-4)",
                fontFamily: "var(--fl-font-mono)",
              }}
            >
              {meta}
            </div>
          )}
        </div>
        {aside && (
          <div style={{ flexShrink: 0, width: 240 }}>{aside}</div>
        )}
      </div>
    </section>
  );
}

/* ── HeroSearch ───────────────────────────────────────────── */
export function HeroSearch({
  label = "Find a song",
  placeholder = "Title or artist…",
  value,
  onChange,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: "var(--fl-r-lg)",
        padding: "14px 16px",
        backdropFilter: "blur(8px)",
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "var(--fl-t-label)",
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "var(--fl-r-md)",
          padding: "8px 12px",
          fontSize: "var(--fl-t-small)",
          color: "#fff",
          fontFamily: "var(--fl-font)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

/* ── SessionCard ──────────────────────────────────────────── */
export function SessionCard({
  eyebrow = "Today's session",
  title,
  sub,
  stats,
  primary,
  secondary,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  stats?: Array<{ value: string; label: string }>;
  primary?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <section
      style={{
        position: "relative",
        borderRadius: "var(--fl-r-xl)",
        overflow: "hidden",
        background: "var(--fl-dark)",
        padding: "28px 28px 24px",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 80% 20%, oklch(0.45 0.18 var(--fl-key-h) / 0.4) 0%, transparent 60%), radial-gradient(ellipse at 20% 90%, rgba(97,82,217,0.25) 0%, transparent 55%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative" }}>
        <Eyebrow onDark>{eyebrow}</Eyebrow>
        <h2
          style={{
            margin: "0 0 10px",
            fontSize: "var(--fl-t-section)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "#fff",
          }}
        >
          {title}
        </h2>
        {sub && (
          <p
            style={{
              margin: "0 0 20px",
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.58)",
              lineHeight: 1.55,
            }}
          >
            {sub}
          </p>
        )}
        {stats && (
          <div
            style={{
              display: "flex",
              gap: 28,
              marginBottom: 20,
            }}
          >
            {stats.map((s, i) => (
              <Stat key={i} value={s.value} label={s.label} onDark />
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {primary}
          {secondary}
        </div>
      </div>
    </section>
  );
}

/* ── GuidedRoutineCard ────────────────────────────────────── */
export function GuidedRoutineCard({
  eyebrow = "Guided routine",
  title,
  path,
  action,
}: {
  eyebrow?: string;
  title: string;
  path?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: "var(--fl-r-lg)",
        padding: "16px 18px",
      }}
    >
      <Eyebrow onDark>{eyebrow}</Eyebrow>
      <div
        style={{
          fontSize: "var(--fl-t-body)",
          fontWeight: 600,
          color: "#fff",
          marginBottom: 8,
          lineHeight: 1.35,
        }}
      >
        {title}
      </div>
      {path && (
        <p
          style={{
            fontSize: "var(--fl-t-small)",
            color: "rgba(255,255,255,0.48)",
            margin: "0 0 14px",
            lineHeight: 1.5,
          }}
        >
          {path}
        </p>
      )}
      {action}
    </div>
  );
}

/* ── SongCard ─────────────────────────────────────────────── */
export function SongCard({
  title,
  artist,
  songKey,
  level,
  bpm,
  chords,
  hue,
  onClick,
}: {
  title: string;
  artist: string;
  songKey: string;
  level: string;
  bpm: number;
  chords: string[];
  hue?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        borderRadius: "var(--fl-r-xl)",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        minHeight: 200,
        background: "var(--fl-dark-2)",
        fontFamily: "var(--fl-font)",
        ...(hue !== undefined ? ({ "--fl-key-h": hue } as CSSProperties) : {}),
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(23,22,27,0.97) 0%, rgba(23,22,27,0.5) 50%, transparent 100%), radial-gradient(ellipse at 70% 30%, oklch(0.48 0.18 var(--fl-key-h) / 0.55) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          position: "absolute",
          top: 14,
          right: 14,
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: "var(--fl-r-pill)",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            fontSize: "var(--fl-t-label)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.04em",
          }}
        >
          Key {songKey}
        </span>
      </span>
      <span
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 18px",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "var(--fl-t-label)",
            color: "rgba(255,255,255,0.45)",
            marginBottom: 4,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {level} · {bpm} BPM
        </span>
        <span
          style={{
            display: "block",
            fontSize: "var(--fl-t-section)",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.02em",
            marginBottom: 2,
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: "block",
            fontSize: "var(--fl-t-small)",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 10,
          }}
        >
          {artist}
        </span>
        <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {chords.map((c) => (
            <span
              key={c}
              style={{
                padding: "2px 8px",
                borderRadius: "var(--fl-r-sm)",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "var(--fl-font-mono)",
              }}
            >
              {c}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

/* ── LibraryTile ──────────────────────────────────────────── */
export function LibraryTile({
  count,
  title,
  description,
  accent = false,
  onClick,
}: {
  count: string;
  title: string;
  description?: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        border: `1px solid ${accent ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
        borderRadius: "var(--fl-r-xl)",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        background: accent ? "var(--fl-accent-softer)" : "var(--fl-surface)",
        fontFamily: "var(--fl-font)",
        padding: "22px 22px 18px",
        transition: "transform 120ms var(--fl-ease-out), box-shadow 120ms var(--fl-ease-out)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--fl-shadow-raised)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      <span
        style={{
          display: "block",
          fontSize: "var(--fl-t-label)",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: accent ? "var(--fl-accent)" : "var(--fl-ink-4)",
          marginBottom: 8,
        }}
      >
        {count}
      </span>
      <span
        style={{
          display: "block",
          fontSize: "var(--fl-t-section)",
          fontWeight: 700,
          color: "var(--fl-ink)",
          letterSpacing: "-0.02em",
          marginBottom: 6,
        }}
      >
        {title}
      </span>
      {description && (
        <span
          style={{
            display: "block",
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          {description}
        </span>
      )}
      <ArrowLink>{title}</ArrowLink>
    </button>
  );
}

/* ── ScaleCard ────────────────────────────────────────────── */
export function ScaleCard({
  index,
  name,
  mood,
  level,
  formula,
  fretboard,
  onClick,
}: {
  index?: string;
  name: string;
  mood?: string;
  level: "beginner" | "intermediate" | "advanced";
  formula?: string;
  fretboard?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card interactive={Boolean(onClick)} onClick={onClick}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          {index && (
            <span
              style={{
                fontFamily: "var(--fl-font-mono)",
                fontSize: "var(--fl-t-label)",
                color: "var(--fl-ink-4)",
                fontWeight: 500,
              }}
            >
              {index}
            </span>
          )}
          <span
            style={{
              fontSize: "var(--fl-t-body)",
              fontWeight: 600,
              color: "var(--fl-ink)",
            }}
          >
            {name}
          </span>
        </div>
        {mood && (
          <div
            style={{
              fontSize: "var(--fl-t-small)",
              color: "var(--fl-ink-3)",
              fontStyle: "italic",
            }}
          >
            {mood}
          </div>
        )}
      </div>
      {fretboard && <div style={{ marginBottom: 12 }}>{fretboard}</div>}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <LevelBadge level={level} />
        {formula && (
          <span
            style={{
              fontFamily: "var(--fl-font-mono)",
              fontSize: "var(--fl-t-label)",
              color: "var(--fl-ink-4)",
              letterSpacing: "0.08em",
            }}
          >
            {formula}
          </span>
        )}
        <HearButton />
      </div>
    </Card>
  );
}

/* ── ChordCard ────────────────────────────────────────────── */
export function ChordCard({
  name,
  root,
  notes,
  intervals,
  level,
  hue,
  fretboard,
  onClick,
}: {
  name: string;
  root: string;
  notes: string[];
  intervals?: string;
  level: "beginner" | "intermediate" | "advanced";
  hue?: number;
  fretboard?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card
      interactive={Boolean(onClick)}
      onClick={onClick}
      style={hue !== undefined ? ({ "--fl-key-h": hue } as CSSProperties) : undefined}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--fl-r-md)",
              background: "var(--fl-key-soft)",
              border: "1px solid var(--fl-key-line)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--fl-key-ink)",
              flexShrink: 0,
            }}
          >
            {root}
          </span>
          <div>
            <div
              style={{
                fontSize: "var(--fl-t-body)",
                fontWeight: 600,
                color: "var(--fl-ink)",
              }}
            >
              {name}
            </div>
            <div
              style={{
                fontSize: "var(--fl-t-small)",
                color: "var(--fl-ink-3)",
              }}
            >
              {notes.join(" · ")}
            </div>
          </div>
        </div>
        <span style={{ color: "var(--fl-ink-4)", fontSize: "0.9rem" }}>→</span>
      </div>
      {fretboard && <div style={{ marginBottom: 12 }}>{fretboard}</div>}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <LevelBadge level={level} />
        {intervals && (
          <span
            style={{
              fontFamily: "var(--fl-font-mono)",
              fontSize: "var(--fl-t-label)",
              color: "var(--fl-ink-4)",
            }}
          >
            {intervals}
          </span>
        )}
        <HearButton />
      </div>
    </Card>
  );
}

/* ── DrillCard ────────────────────────────────────────────── */
export function DrillCard({
  title,
  description,
  skill,
  level,
  drillKey,
  minutes,
  bpm,
  passes = 0,
  state,
  fretboard,
  onClick,
}: {
  title: string;
  description?: string;
  skill: string;
  level: "beginner" | "intermediate" | "advanced";
  drillKey?: string;
  minutes?: number;
  bpm?: number | "untimed";
  passes?: number;
  state?: string;
  fretboard?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Card interactive={Boolean(onClick)} onClick={onClick}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--fl-r-pill)",
              background: "var(--fl-surface-sunk)",
              border: "1px solid var(--fl-line)",
              fontSize: "var(--fl-t-label)",
              color: "var(--fl-ink-3)",
              fontWeight: 500,
            }}
          >
            {skill}
          </span>
          <LevelBadge level={level} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {state && (
            <span style={{ fontSize: "var(--fl-t-label)", color: "var(--fl-ink-4)" }}>
              {state}
            </span>
          )}
          <ArrowLink>Open</ArrowLink>
        </div>
      </div>
      <h3
        style={{
          margin: "0 0 6px",
          fontSize: "var(--fl-t-body)",
          fontWeight: 700,
          color: "var(--fl-ink)",
          letterSpacing: "-0.015em",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: "0 0 12px",
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: fretboard ? 14 : 0,
          flexWrap: "wrap",
        }}
      >
        {drillKey && (
          <span
            style={{
              padding: "2px 8px",
              borderRadius: "var(--fl-r-pill)",
              background: "var(--fl-surface-sunk)",
              border: "1px solid var(--fl-line)",
              fontSize: "var(--fl-t-label)",
              fontWeight: 600,
              color: "var(--fl-ink-2)",
            }}
          >
            Key {drillKey}
          </span>
        )}
        {minutes !== undefined && (
          <span style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-3)" }}>
            {minutes} min
          </span>
        )}
        {bpm !== undefined && (
          <span
            style={{
              fontFamily: "var(--fl-font-mono)",
              fontSize: "var(--fl-t-small)",
              color: "var(--fl-ink-3)",
            }}
          >
            {bpm === "untimed" ? "untimed" : `${bpm} bpm`}
          </span>
        )}
        <div style={{ marginLeft: "auto" }}>
          <ProgressDotsInline filled={passes} />
        </div>
      </div>
      {fretboard && (
        <div
          style={{
            borderRadius: "var(--fl-r-md)",
            overflow: "hidden",
            background: "var(--fl-surface-sunk)",
          }}
        >
          {fretboard}
        </div>
      )}
    </Card>
  );
}

function ProgressDotsInline({ filled = 0, total = 5 }: { filled?: number; total?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 4 }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i < filled ? "var(--fl-accent)" : "var(--fl-line)",
          }}
        />
      ))}
    </span>
  );
}

/* ── TheoryCallout ────────────────────────────────────────── */
export function TheoryCallout({
  eyebrow = "Need the why?",
  title,
  body,
  actionLabel = "Open theory",
  onClick,
}: {
  eyebrow?: string;
  title?: string;
  body?: string;
  actionLabel?: string;
  onClick?: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: "var(--fl-r-xl)",
        background: "var(--fl-accent-softer)",
        border: "1px solid var(--fl-accent-line)",
        padding: "20px",
      }}
    >
      <Eyebrow accent>{eyebrow}</Eyebrow>
      {title && (
        <h3
          style={{
            margin: "0 0 6px",
            fontSize: "var(--fl-t-body)",
            fontWeight: 700,
            color: "var(--fl-accent-ink)",
          }}
        >
          {title}
        </h3>
      )}
      {body && (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-2)",
            lineHeight: 1.55,
          }}
        >
          {body}
        </p>
      )}
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          padding: "9px",
          borderRadius: "var(--fl-r-md)",
          border: "1px solid var(--fl-accent-line)",
          background: "transparent",
          cursor: "pointer",
          fontFamily: "var(--fl-font)",
          fontSize: "var(--fl-t-small)",
          fontWeight: 600,
          color: "var(--fl-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          transition: "background 120ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--fl-accent-soft)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }}
      >
        {actionLabel} →
      </button>
    </div>
  );
}

/* ── TunerPrompt ──────────────────────────────────────────── */
export function TunerPrompt({
  title = "Tune up",
  body,
  action,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Card>
      <h3 style={{ margin: "0 0 8px", fontSize: "var(--fl-t-body)", fontWeight: 700 }}>{title}</h3>
      {body && (
        <p style={{ margin: "0 0 18px", color: "var(--fl-ink-2)", lineHeight: 1.6, maxWidth: "46ch", fontSize: "var(--fl-t-small)" }}>
          {body}
        </p>
      )}
      {action}
    </Card>
  );
}

/* ── StringRow ────────────────────────────────────────────── */
export function StringRow({
  stringNumber,
  note,
  octave,
  hz,
  active = false,
  onPlay,
}: {
  stringNumber: number;
  note: string;
  octave: number;
  hz: number;
  active?: boolean;
  onPlay?: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      role={onPlay ? "button" : undefined}
      tabIndex={onPlay ? 0 : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "10px 14px",
        borderRadius: "var(--fl-r-md)",
        background: active ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)",
        border: `1px solid ${active ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
        cursor: onPlay ? "pointer" : "default",
        transition: "background 140ms, border-color 140ms",
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: active ? "var(--fl-accent)" : "var(--fl-line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          color: active ? "#fff" : "var(--fl-ink-3)",
          fontFamily: "var(--fl-font-mono)",
          flexShrink: 0,
          transition: "background 140ms, color 140ms",
        }}
      >
        {stringNumber}
      </span>
      <span
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: active ? "var(--fl-accent)" : "var(--fl-ink)",
          minWidth: 32,
          letterSpacing: "-0.02em",
        }}
      >
        {note}
        <sub
          style={{
            fontSize: "0.6em",
            verticalAlign: "sub",
            fontWeight: 500,
            color: "var(--fl-ink-4)",
          }}
        >
          {octave}
        </sub>
      </span>
      <span
        style={{
          flex: 1,
          fontFamily: "var(--fl-font-mono)",
          fontSize: "var(--fl-t-small)",
          color: "var(--fl-ink-3)",
        }}
      >
        {hz.toFixed(2)} Hz
      </span>
      {active && (
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--fl-accent)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

/* ── TuningList ───────────────────────────────────────────── */
export function TuningList({
  strings,
  caption,
  heading = "Standard tuning",
  order = "low to high",
}: {
  strings: Array<{ stringNumber: number; note: string; octave: number; hz: number; active?: boolean }>;
  caption?: string;
  heading?: string;
  order?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            fontSize: "var(--fl-t-label)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--fl-ink-4)",
          }}
        >
          {heading}
        </div>
        <span style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>{order}</span>
      </div>
      {strings.map((s) => (
        <StringRow key={s.stringNumber} {...s} />
      ))}
      {caption && (
        <p style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-3)", margin: "4px 0 0", lineHeight: 1.5 }}>
          {caption}
        </p>
      )}
    </div>
  );
}

/* ── NeighbourRow ─────────────────────────────────────────── */
export function NeighbourRow({
  keyName,
  label,
  notes,
  hue,
  onClick,
}: {
  keyName: string;
  label: string;
  notes: string[];
  hue?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        padding: "10px 14px",
        borderRadius: "var(--fl-r-md)",
        background: "var(--fl-surface)",
        border: "1px solid var(--fl-line)",
        cursor: "pointer",
        fontFamily: "var(--fl-font)",
        textAlign: "left",
        transition: "border-color 140ms, background 140ms",
        ...(hue !== undefined ? ({ "--fl-key-h": hue } as CSSProperties) : {}),
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--fl-key-line)";
        (e.currentTarget as HTMLElement).style.background = "var(--fl-key-soft)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--fl-line)";
        (e.currentTarget as HTMLElement).style.background = "var(--fl-surface)";
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--fl-r-sm)",
          background: "var(--fl-key-soft)",
          border: "1px solid var(--fl-key-line)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "var(--fl-key-ink)",
          flexShrink: 0,
        }}
      >
        {keyName}
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: "var(--fl-t-small)", fontWeight: 600, color: "var(--fl-ink)" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: "var(--fl-t-label)", color: "var(--fl-ink-3)" }}>
          {notes.join(" · ")}
        </span>
      </span>
      <span style={{ color: "var(--fl-ink-4)", fontSize: "0.9rem" }}>→</span>
    </button>
  );
}
