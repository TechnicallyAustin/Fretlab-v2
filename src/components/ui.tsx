import { type ReactNode, type CSSProperties } from "react";

/* ── Card ─────────────────────────────────────────────────── */
export function Card({
  children,
  tone = "default",
  interactive = false,
  onClick,
  style,
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "dark";
  interactive?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  const themes = {
    default: { background: "var(--fl-surface)", border: "var(--fl-line)" },
    accent: { background: "var(--fl-accent-softer)", border: "var(--fl-accent-line)" },
    dark: { background: "var(--fl-dark)", border: "rgba(255,255,255,0.08)" },
  };
  const t = themes[tone];
  return (
    <div
      onClick={onClick}
      style={{
        background: t.background,
        border: `1px solid ${t.border}`,
        borderRadius: "var(--fl-r-xl)",
        padding: 20,
        cursor: interactive ? "pointer" : undefined,
        transition: interactive ? "transform 120ms var(--fl-ease-out), box-shadow 120ms var(--fl-ease-out)" : undefined,
        ...style,
      }}
      onMouseEnter={interactive ? (e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--fl-shadow-raised)";
      } : undefined}
      onMouseLeave={interactive ? (e) => {
        (e.currentTarget as HTMLElement).style.transform = "";
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      } : undefined}
    >
      {children}
    </div>
  );
}

/* ── Eyebrow ──────────────────────────────────────────────── */
export function Eyebrow({
  children,
  onDark = false,
  accent = false,
}: {
  children: ReactNode;
  onDark?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        fontSize: "var(--fl-t-label)",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: accent
          ? "var(--fl-accent)"
          : onDark
          ? "rgba(255,255,255,0.5)"
          : "var(--fl-ink-4)",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

/* ── SectionHeading ───────────────────────────────────────── */
export function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "var(--fl-t-section)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--fl-ink)",
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}

/* ── LevelBadge ───────────────────────────────────────────── */
type Level = "beginner" | "intermediate" | "advanced";
const LEVEL_STYLES: Record<Level, { bg: string; color: string }> = {
  beginner: { bg: "var(--fl-beginner-bg)", color: "var(--fl-beginner)" },
  intermediate: { bg: "var(--fl-intermediate-bg)", color: "var(--fl-intermediate)" },
  advanced: { bg: "var(--fl-advanced-bg)", color: "var(--fl-advanced)" },
};

export function LevelBadge({ level }: { level: Level }) {
  const s = LEVEL_STYLES[level] ?? LEVEL_STYLES.beginner;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "var(--fl-r-pill)",
        background: s.bg,
        color: s.color,
        fontSize: "var(--fl-t-label)",
        fontWeight: 600,
        letterSpacing: "0.03em",
        textTransform: "capitalize",
      }}
    >
      {level}
    </span>
  );
}

/* ── StatusPill ───────────────────────────────────────────── */
export function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 12px",
        borderRadius: "var(--fl-r-pill)",
        background: "var(--fl-surface-sunk)",
        border: "1px solid var(--fl-line)",
        fontSize: "var(--fl-t-small)",
        color: "var(--fl-ink-3)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--fl-live)",
          display: "inline-block",
        }}
      />
      {children}
    </span>
  );
}

/* ── KeyBadge ─────────────────────────────────────────────── */
export function KeyBadge({ keyName }: { keyName: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "var(--fl-r-sm)",
        background: "var(--fl-key-soft)",
        border: "1px solid var(--fl-key-line)",
        color: "var(--fl-key-ink)",
        fontSize: "0.78rem",
        fontWeight: 700,
        letterSpacing: "-0.02em",
      }}
    >
      {keyName}
    </span>
  );
}

/* ── ProgressDots ─────────────────────────────────────────── */
export function ProgressDots({ filled = 0, total = 5 }: { filled?: number; total?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: i < filled ? "var(--fl-accent)" : "var(--fl-line)",
            transition: "background 200ms",
          }}
        />
      ))}
    </span>
  );
}

/* ── CornerStamp ──────────────────────────────────────────── */
export function CornerStamp({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: "var(--fl-t-label)",
        fontFamily: "var(--fl-font-mono)",
        color: "var(--fl-ink-4)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

/* ── Stat ─────────────────────────────────────────────────── */
export function Stat({
  value,
  label,
  onDark = false,
}: {
  value: string;
  label: string;
  onDark?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: onDark ? "#fff" : "var(--fl-ink)",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: "var(--fl-t-label)",
          color: onDark ? "rgba(255,255,255,0.5)" : "var(--fl-ink-4)",
          marginTop: 3,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── EmptyState ───────────────────────────────────────────── */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "var(--fl-surface-sunk)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: "1.2rem",
        }}
      >
        ◦
      </div>
      <div
        style={{
          fontSize: "var(--fl-t-body)",
          fontWeight: 600,
          color: "var(--fl-ink)",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {body && (
        <p
          style={{
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            maxWidth: "36ch",
            margin: "0 auto 20px",
            lineHeight: 1.6,
          }}
        >
          {body}
        </p>
      )}
      {action}
    </div>
  );
}

/* ── ArrowLink ────────────────────────────────────────────── */
export function ArrowLink({
  children,
  onDark = false,
  onClick,
}: {
  children: ReactNode;
  onDark?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: "var(--fl-t-small)",
        fontWeight: 600,
        color: onDark ? "rgba(255,255,255,0.7)" : "var(--fl-accent)",
        fontFamily: "var(--fl-font)",
        letterSpacing: "0.01em",
        transition: "gap 140ms var(--fl-ease-out)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.gap = "8px";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.gap = "4px";
      }}
    >
      {children}
      <span aria-hidden="true">→</span>
    </button>
  );
}

/* ── HearButton ───────────────────────────────────────────── */
export function HearButton({
  onClick,
  playing = false,
}: {
  onClick?: (e: React.MouseEvent) => void;
  playing?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={playing ? "Stop" : "Hear"}
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: playing ? "var(--fl-accent)" : "var(--fl-surface-sunk)",
        border: `1px solid ${playing ? "var(--fl-accent)" : "var(--fl-line)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: playing ? "#fff" : "var(--fl-ink-3)",
        transition: "background 140ms, color 140ms",
        flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
        {playing ? (
          <rect x="2" y="2" width="3" height="8" rx="1" />
        ) : (
          <path d="M3 2.5L10 6L3 9.5V2.5Z" />
        )}
        {playing && <rect x="7" y="2" width="3" height="8" rx="1" />}
      </svg>
    </button>
  );
}

/* ── KeyPicker ────────────────────────────────────────────── */
export function KeyPicker({
  keyName,
  description,
  hue,
  onClick,
}: {
  keyName: string;
  description?: string;
  hue?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 12px 6px 8px",
        borderRadius: "var(--fl-r-md)",
        background: "var(--fl-surface)",
        border: "1px solid var(--fl-line)",
        cursor: "pointer",
        fontFamily: "var(--fl-font)",
        transition: "border-color 140ms",
        ...(hue !== undefined ? ({ "--fl-key-h": hue } as CSSProperties) : {}),
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "var(--fl-r-sm)",
          background: "var(--fl-key-soft)",
          border: "1px solid var(--fl-key-line)",
          color: "var(--fl-key-ink)",
          fontSize: "0.9rem",
          fontWeight: 700,
        }}
      >
        {keyName}
      </span>
      {description && (
        <span
          style={{
            fontSize: "var(--fl-t-small)",
            color: "var(--fl-ink-3)",
            fontWeight: 400,
          }}
        >
          {description}
        </span>
      )}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--fl-ink-4)" }}>
        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/* ── PillGroup ────────────────────────────────────────────── */
export function PillGroup({
  options,
  value,
  onChange,
  multi = false,
  circle = false,
}: {
  options: string[];
  value: string | string[];
  onChange?: (v: string) => void;
  multi?: boolean;
  circle?: boolean;
}) {
  const active = Array.isArray(value) ? value : [value];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {options.map((opt) => {
        const on = active.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange?.(opt)}
            style={{
              padding: circle ? "0" : "5px 14px",
              width: circle ? 32 : undefined,
              height: circle ? 32 : undefined,
              borderRadius: circle ? "50%" : "var(--fl-r-pill)",
              border: `1px solid ${on ? "var(--fl-accent)" : "var(--fl-line)"}`,
              background: on ? "var(--fl-accent-softer)" : "var(--fl-surface)",
              color: on ? "var(--fl-accent)" : "var(--fl-ink-2)",
              fontFamily: "var(--fl-font)",
              fontSize: "var(--fl-t-small)",
              fontWeight: on ? 600 : 400,
              cursor: "pointer",
              transition: "background 120ms, color 120ms, border-color 120ms",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tabs ─────────────────────────────────────────────────── */
export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: Array<{ value: string; label: string }>;
  value: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: 2,
        borderBottom: "1px solid var(--fl-line)",
        marginBottom: 20,
      }}
    >
      {tabs.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={on}
            type="button"
            onClick={() => onChange?.(t.value)}
            style={{
              padding: "10px 16px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${on ? "var(--fl-accent)" : "transparent"}`,
              cursor: "pointer",
              fontFamily: "var(--fl-font)",
              fontSize: "var(--fl-t-small)",
              fontWeight: on ? 600 : 400,
              color: on ? "var(--fl-accent)" : "var(--fl-ink-3)",
              transition: "color 120ms, border-color 120ms",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ── TopBar ───────────────────────────────────────────────── */
export function TopBar({
  crumb,
  page,
  status,
  actions,
}: {
  crumb?: string;
  page: string;
  status?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid var(--fl-line)",
        background: "var(--fl-surface)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>
        {crumb && (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>FretLab</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--fl-ink-2)" }}>{crumb}</span>
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontSize: "var(--fl-t-small)",
            fontWeight: 600,
            color: "var(--fl-ink)",
          }}
        >
          {page}
        </span>
        {status}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
        {actions}
      </div>
    </header>
  );
}
