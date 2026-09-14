import {
  levelFromXp, PLAYER, LEADERBOARD, LEAGUE_NAME, PROMOTION_ZONE, RELEGATION_ZONE,
  WEEKLY_CHALLENGES, xpFmt, type LeaderRow,
} from "../lib/gamification";

/* ── Level card with XP ring ─────────────────────────────────── */
export function LevelCard() {
  const info = levelFromXp(PLAYER.xp);
  const R = 52, C = 2 * Math.PI * R, stroke = 9;
  const dash = C * info.progress;

  return (
    <div style={{ background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)", padding: "24px 26px", position: "relative", overflow: "hidden", display: "flex", gap: 26, alignItems: "center" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 15% 20%, oklch(0.45 0.18 289 / 0.45) 0%, transparent 55%)", pointerEvents: "none" }} />

      {/* Ring */}
      <div style={{ position: "relative", flexShrink: 0, width: 130, height: 130 }}>
        <svg width={130} height={130} viewBox="0 0 130 130" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={65} cy={65} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
          <circle cx={65} cy={65} r={R} fill="none" stroke="url(#xpgrad)" strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`} style={{ transition: "stroke-dasharray 700ms var(--fl-ease-out)" }} />
          <defs>
            <linearGradient id="xpgrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#b7abf7" />
              <stop offset="100%" stopColor="#6152d9" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>Level</div>
          <div style={{ fontSize: "2.3rem", fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>{info.level}</div>
        </div>
      </div>

      {/* Detail */}
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#b7abf7", marginBottom: 4 }}>{info.title}</div>
        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 3 }}>{xpFmt(info.totalXp)} XP</div>
        <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>
          {info.xpForLevel - info.xpIntoLevel} XP to Level {info.level + 1}
        </div>
        <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${info.progress * 100}%`, borderRadius: 4, background: "linear-gradient(90deg, #b7abf7, #6152d9)", transition: "width 700ms var(--fl-ease-out)" }} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "This week", value: `+${xpFmt(PLAYER.weeklyXp)}` },
            { label: "Streak", value: `${PLAYER.streak}d 🔥` },
            { label: "League rank", value: `#${PLAYER.rankInLeague}` },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{s.value}</div>
              <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Delta chevron ───────────────────────────────────────────── */
function Delta({ delta }: { delta: number }) {
  if (delta === 0) return <span style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)" }}>—</span>;
  const up = delta > 0;
  return (
    <span style={{ fontSize: "0.64rem", fontWeight: 700, color: up ? "var(--fl-live)" : "var(--fl-danger)", display: "inline-flex", alignItems: "center", gap: 1 }}>
      {up ? "▲" : "▼"}{Math.abs(delta)}
    </span>
  );
}

/* ── Weekly league leaderboard ───────────────────────────────── */
export function Leaderboard({ rows = LEADERBOARD }: { rows?: LeaderRow[] }) {
  return (
    <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "24px", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ margin: 0, fontSize: "var(--fl-t-section)", fontWeight: 600 }}>{LEAGUE_NAME}</h2>
        <span style={{ fontSize: "0.66rem", fontWeight: 700, color: "var(--fl-accent-ink)", background: "var(--fl-accent-softer)", border: "1px solid var(--fl-accent-line)", padding: "3px 9px", borderRadius: "var(--fl-r-pill)" }}>Ends in 3d</span>
      </div>
      <div style={{ fontSize: "0.74rem", color: "var(--fl-ink-4)", marginBottom: 16 }}>Top {PROMOTION_ZONE} promote · bottom 2 relegate</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {rows.map((r, i) => {
          const promote = r.rank <= PROMOTION_ZONE;
          const relegate = r.rank >= RELEGATION_ZONE;
          const showDivider = r.rank === PROMOTION_ZONE || r.rank === RELEGATION_ZONE - 1;
          return (
            <div key={r.name}>
              <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--fl-r-lg)",
                background: r.you ? "var(--fl-accent-softer)" : "transparent",
                border: `1px solid ${r.you ? "var(--fl-accent-line)" : "transparent"}`,
              }}>
                <div style={{ width: 22, textAlign: "center", flexShrink: 0, fontFamily: "var(--fl-font-mono)", fontWeight: 800, fontSize: "0.9rem", color: promote ? "var(--fl-live)" : relegate ? "var(--fl-danger)" : "var(--fl-ink-4)" }}>{r.rank}</div>
                <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.74rem", fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, oklch(0.72 0.13 ${r.hue}), oklch(0.55 0.16 ${r.hue}))` }}>{r.initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: r.you ? 800 : 600, color: r.you ? "var(--fl-accent-ink)" : "var(--fl-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {r.name}{r.you && " (you)"}
                  </div>
                  <div style={{ fontSize: "0.66rem", color: "var(--fl-ink-4)" }}>{r.streak}d streak</div>
                </div>
                <div style={{ flexShrink: 0, width: 30, textAlign: "center" }}><Delta delta={r.delta} /></div>
                <div style={{ flexShrink: 0, fontFamily: "var(--fl-font-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--fl-ink)", width: 58, textAlign: "right" }}>{xpFmt(r.weeklyXp)} XP</div>
              </div>
              {showDivider && <div style={{ borderTop: `1px dashed ${r.rank === PROMOTION_ZONE ? "rgba(63,168,122,0.4)" : "rgba(182,77,101,0.35)"}`, margin: "4px 12px" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Weekly challenges ───────────────────────────────────────── */
export function WeeklyChallenges() {
  const totalXp = WEEKLY_CHALLENGES.reduce((s, c) => s + (c.progress >= c.target ? c.xp : 0), 0);
  const possible = WEEKLY_CHALLENGES.reduce((s, c) => s + c.xp, 0);
  return (
    <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: "0 0 2px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Weekly Challenges</h2>
          <div style={{ fontSize: "0.74rem", color: "var(--fl-ink-4)" }}>{xpFmt(totalXp)} / {xpFmt(possible)} XP earned this week</div>
        </div>
        <span style={{ fontSize: "1.4rem" }}>🏅</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {WEEKLY_CHALLENGES.map(c => {
          const done = c.progress >= c.target;
          const pct = Math.min(100, (c.progress / c.target) * 100);
          return (
            <div key={c.id} style={{ padding: "16px", borderRadius: "var(--fl-r-lg)", background: done ? "var(--fl-success-soft)" : "var(--fl-surface-sunk)", border: `1px solid ${done ? "rgba(39,132,95,0.3)" : "var(--fl-line)"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "1.2rem" }}>{c.icon}</span>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--fl-ink)" }}>{c.title}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)" }}>{c.desc}</div>
                  </div>
                </div>
                <span style={{ flexShrink: 0, fontSize: "0.64rem", fontWeight: 700, color: done ? "var(--fl-success)" : "var(--fl-accent-ink)", background: done ? "rgba(39,132,95,0.14)" : "var(--fl-accent-softer)", border: `1px solid ${done ? "rgba(39,132,95,0.3)" : "var(--fl-accent-line)"}`, padding: "2px 7px", borderRadius: "var(--fl-r-pill)", whiteSpace: "nowrap" }}>+{c.xp}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "var(--fl-line)", overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: done ? "var(--fl-success)" : "var(--fl-accent)", transition: "width 600ms var(--fl-ease-out)" }} />
              </div>
              <div style={{ fontSize: "0.66rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>
                {done ? "✓ Complete" : `${c.progress} / ${c.target} ${c.unit}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
