import { useState } from "react";
import { Link } from "react-router";
import { Button, Stepper } from "../components/controls";
import { MetronomeDialLive, WeekStrip } from "../components/practice";
import { LevelBadge } from "../components/ui";
import { levelFromXp, PLAYER, WEEKLY_CHALLENGES, xpFmt } from "../lib/gamification";

/* ── Data ─────────────────────────────────────────────────── */
const WARMUPS = [
  { id: "chromatic", title: "Chromatic 1-2-3-4", sub: "Walk all 4 fingers across every string.", category: "Spider walk", level: "beginner" as const, bpm: 60, duration: "5 min", tip: "Keep fingers arched. Start very slow, then build speed incrementally.", icon: "🕷️", color: "#6152d9" },
  { id: "hammer",    title: "Hammer-ons & Pull-offs", sub: "Build legato technique and left-hand strength.", category: "Legato", level: "beginner" as const, bpm: 70, duration: "6 min", tip: "Hammer firmly with the fingertip, not the pad.", icon: "🔨", color: "#8678e8" },
  { id: "skipping",  title: "String Skipping", sub: "Train picking accuracy by jumping non-adjacent strings.", category: "Accuracy", level: "intermediate" as const, bpm: 80, duration: "8 min", tip: "Use a metronome and start at 50% speed.", icon: "⚡", color: "#e87c5a" },
  { id: "independence", title: "Finger Independence", sub: "Isolate and strengthen each finger.", category: "Independence", level: "intermediate" as const, bpm: 75, duration: "10 min", tip: "Hold down lower fingers while moving upper ones.", icon: "✋", color: "#3fa87a" },
  { id: "trills",    title: "Trills", sub: "Rapid hammer-on and pull-off cycles for speed.", category: "Speed", level: "intermediate" as const, bpm: 90, duration: "8 min", tip: "Play in short bursts with rest. Stay relaxed.", icon: "🎯", color: "#e8c05a" },
  { id: "stretch",   title: "Wide Stretches", sub: "Reach training across 4+ frets.", category: "Reach", level: "advanced" as const, bpm: 60, duration: "12 min", tip: "Warm up thoroughly before wide stretches. Stop if you feel pain.", icon: "📐", color: "#5ac4e8" },
];

const EXERCISES = [
  { id: "1", title: "Major Scale — All Positions", category: "Scales",    bpm: 80,  targetBpm: 120, level: "intermediate" as const, duration: "12 min", progress: 68 },
  { id: "2", title: "Pentatonic Box 1 — A Minor",  category: "Scales",    bpm: 100, targetBpm: 160, level: "beginner" as const,     duration: "8 min",  progress: 92 },
  { id: "3", title: "Chromatic Finger Independence", category: "Technique", bpm: 60,  targetBpm: 100, level: "beginner" as const,     duration: "6 min",  progress: 45 },
  { id: "4", title: "Sweep Picking — Arpeggios",    category: "Technique", bpm: 80,  targetBpm: 140, level: "advanced" as const,      duration: "15 min", progress: 22 },
  { id: "5", title: "Barre Chord Transitions",      category: "Chords",    bpm: 60,  targetBpm: 100, level: "intermediate" as const,  duration: "10 min", progress: 57 },
];

const ROUTINE = [
  { label: "Warm-up chromatics",            duration: "5m" },
  { label: "C Major scale positions",       duration: "12m" },
  { label: "Am Pentatonic Box 1 & 2",       duration: "10m" },
  { label: "Chord transitions — F to C to G", duration: "8m" },
  { label: "Song: Comfortably Numb solo",   duration: "15m" },
];

const WEEK_DAYS = [0, 22, 35, 18, 0, 42, 15];

/* ── Heatmap data: 16 weeks × 7 days ───────────────────────── */
const HEATMAP: number[][] = Array.from({ length: 16 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    if (w === 15 && d > 0) return 0;
    return Math.random() < 0.62 ? Math.floor(Math.random() * 5) : 0;
  })
);

/* ── Sub-components ─────────────────────────────────────────── */
function ProgressRing({ pct, size = 44, stroke = 4, color = "var(--fl-accent)" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 600ms ease-out" }} />
    </svg>
  );
}

function HeatCell({ v }: { v: number }) {
  const opacity = v === 0 ? 0.06 : v === 1 ? 0.25 : v === 2 ? 0.45 : v === 3 ? 0.65 : 0.9;
  return (
    <div style={{
      width: 11, height: 11, borderRadius: 2,
      background: v === 0 ? "rgba(97,82,217,0.08)" : `rgba(97,82,217,${opacity})`,
      border: v > 3 ? "1px solid rgba(183,171,247,0.4)" : "none",
      transition: "background 120ms",
    }} />
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export function PracticeStudio() {
  const [bpm, setBpm] = useState(84);
  const [showMetro, setShowMetro] = useState(false);
  const [activeWarmup, setActiveWarmup] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set([0, 1]));

  const completedCount = completedItems.size;
  const totalRoutine = ROUTINE.length;
  const sessionPct = Math.round((completedCount / totalRoutine) * 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{ fontFamily: "var(--fl-font)" }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", background: "var(--fl-dark)", padding: "44px 40px 48px" }}>
        {/* Background ambience */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 75% 50%, rgba(97,82,217,0.4) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, rgba(63,168,122,0.15) 0%, transparent 50%)",
        }} />
        {/* Decorative fret-line grid */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.04,
          backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 72px), repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 28px)",
        }} />

        <div style={{ position: "relative", maxWidth: 1100, display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "center" }}>
          {/* Left: greeting + stats */}
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "var(--fl-font-mono)" }}>{today}</div>
            <h1 style={{ margin: "0 0 8px", fontSize: "3rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.05 }}>
              {greeting}.
            </h1>
            <p style={{ margin: "0 0 28px", fontSize: "1rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Your 14-day streak is alive. Let's keep it going.
            </p>

            {/* Quick stats row */}
            <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
              {[
                { value: "14", unit: "day streak", color: "#ff9f40", icon: "🔥" },
                { value: "147", unit: "total hours", color: "#b7abf7", icon: "⏱" },
                { value: "312", unit: "drills done", color: "#3fa87a", icon: "✓" },
                { value: "68", unit: "avg BPM", color: "#e8c05a", icon: "♩" },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "16px 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderLeft: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}>
                  <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color, letterSpacing: "-0.04em", lineHeight: 1, fontFamily: "var(--fl-font-mono)" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.unit}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "12px 24px", borderRadius: "var(--fl-r-pill)",
                background: "var(--fl-accent)", border: "none", color: "#fff",
                fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--fl-font)",
                boxShadow: "0 4px 24px rgba(97,82,217,0.45)",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1.5L11 7L3 12.5V1.5Z" fill="currentColor" /></svg>
                Start today's session
              </button>
              <button onClick={() => setShowMetro(v => !v)} style={{
                padding: "12px 20px", borderRadius: "var(--fl-r-pill)",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.8)", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--fl-font)",
              }}>
                ♩ Metronome
              </button>
              <Link to="/tuner" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "12px 20px", borderRadius: "var(--fl-r-pill)",
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.8)", fontSize: "0.88rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--fl-font)",
                }}>
                  🎸 Tune up
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Session ring */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative", width: 160, height: 160 }}>
              <svg width="160" height="160" viewBox="0 0 160 160" style={{ position: "absolute", top: 0, left: 0 }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(97,82,217,0.3)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70}`} strokeDashoffset={`${2 * Math.PI * 70 * (1 - sessionPct / 100)}`}
                  transform="rotate(-90 80 80)" style={{ transition: "stroke-dashoffset 600ms ease-out" }} />
                <circle cx="80" cy="80" r="70" fill="none" stroke="var(--fl-accent)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 70 * 0.15} ${2 * Math.PI * 70 * 0.85}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - sessionPct / 100 + 0.15)}`}
                  transform="rotate(-90 80 80)"
                  style={{ filter: "drop-shadow(0 0 10px rgba(97,82,217,0.6))", transition: "all 600ms ease-out" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.06em", lineHeight: 1 }}>{sessionPct}%</div>
                <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em" }}>session</div>
              </div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
              {completedCount} of {totalRoutine} tasks done
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "28px 40px 80px", maxWidth: 1100 }}>

        {/* ── Metronome panel ─────────────────────────────── */}
        {showMetro && (
          <div style={{ background: "var(--fl-dark)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--fl-r-xl)", padding: "28px", marginBottom: 24, display: "flex", alignItems: "center", gap: 48 }}>
            <MetronomeDialLive bpm={bpm} onChange={setBpm} />
            <div>
              <div style={{ marginBottom: 16 }}>
                <Stepper value={bpm} onChange={setBpm} min={40} max={240} step={2} unit="BPM" label="Tempo" size="lg" />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[60, 72, 84, 96, 108, 120, 144].map(t => (
                  <button key={t} onClick={() => setBpm(t)} style={{
                    padding: "5px 12px", borderRadius: "var(--fl-r-md)", fontFamily: "var(--fl-font-mono)", fontSize: "0.75rem", cursor: "pointer",
                    border: `1px solid ${bpm === t ? "var(--fl-accent)" : "rgba(255,255,255,0.12)"}`,
                    background: bpm === t ? "rgba(97,82,217,0.2)" : "rgba(255,255,255,0.04)",
                    color: bpm === t ? "var(--fl-accent)" : "rgba(255,255,255,0.4)",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            <button onClick={() => setShowMetro(false)} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "var(--fl-r-md)", padding: "8px 14px", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontFamily: "var(--fl-font)", fontSize: "0.8rem" }}>
              Close
            </button>
          </div>
        )}

        {/* ── Main grid ───────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>

          {/* ── Left column ────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Practice heatmap */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--fl-ink)" }}>Practice history</h2>
                <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>16 weeks · 312 sessions</span>
              </div>
              <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "20px 24px" }}>
                <div style={{ display: "flex", gap: 3 }}>
                  {HEATMAP.map((week, wi) => (
                    <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      {week.map((v, di) => <HeatCell key={di} v={v} />)}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
                  <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)" }}>Less</span>
                  {[0, 1, 2, 3, 4].map(v => <HeatCell key={v} v={v} />)}
                  <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)" }}>More</span>
                </div>
              </div>
            </section>

            {/* Warmups */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--fl-ink)" }}>Warmups & Finger Exercises</h2>
                <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>Always warm up before drilling</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {WARMUPS.map(w => {
                  const active = activeWarmup === w.id;
                  return (
                    <div key={w.id} onClick={() => setActiveWarmup(active ? null : w.id)} style={{
                      borderRadius: "var(--fl-r-xl)", border: `1.5px solid ${active ? w.color : "var(--fl-line)"}`,
                      background: active ? "var(--fl-dark)" : "var(--fl-surface)",
                      cursor: "pointer", overflow: "hidden",
                      transition: "border-color 160ms, background 160ms, box-shadow 160ms",
                      boxShadow: active ? `0 4px 24px ${w.color}25` : "none",
                    }}>
                      <div style={{ padding: "16px 16px 14px" }}>
                        {/* Top row */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${w.color}22`, border: `1px solid ${w.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                            {w.icon}
                          </div>
                          <LevelBadge level={w.level} />
                        </div>
                        <div style={{ fontSize: "0.62rem", color: active ? `${w.color}bb` : "var(--fl-ink-4)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{w.category}</div>
                        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: active ? "#fff" : "var(--fl-ink)", marginBottom: 6, lineHeight: 1.3 }}>{w.title}</div>
                        <p style={{ margin: "0 0 10px", fontSize: "0.74rem", color: active ? "rgba(255,255,255,0.5)" : "var(--fl-ink-3)", lineHeight: 1.5 }}>{w.sub}</p>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 4, background: active ? "rgba(255,255,255,0.08)" : "var(--fl-surface-sunk)", color: active ? "rgba(255,255,255,0.5)" : "var(--fl-ink-4)" }}>{w.bpm} BPM</span>
                          <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.65rem", color: active ? "rgba(255,255,255,0.3)" : "var(--fl-ink-4)" }}>{w.duration}</span>
                        </div>
                      </div>
                      {active && (
                        <div style={{ padding: "14px 16px", borderTop: `1px solid ${w.color}30`, background: `${w.color}10` }}>
                          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: w.color, marginBottom: 6, letterSpacing: "0.1em", textTransform: "uppercase" }}>Pro tip</div>
                          <p style={{ margin: "0 0 12px", fontSize: "0.73rem", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{w.tip}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={e => e.stopPropagation()} style={{ padding: "6px 14px", borderRadius: "var(--fl-r-md)", background: w.color, border: "none", color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--fl-font)" }}>
                              ▶ Start
                            </button>
                            <button onClick={e => { e.stopPropagation(); setBpm(w.bpm); }} style={{ padding: "6px 14px", borderRadius: "var(--fl-r-md)", background: "rgba(255,255,255,0.08)", border: `1px solid ${w.color}40`, color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--fl-font)" }}>
                              Set {w.bpm} BPM
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Exercises */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--fl-ink)" }}>Exercises & Drills</h2>
                <Link to="/library" style={{ fontSize: "0.78rem", color: "var(--fl-accent)", textDecoration: "none", fontWeight: 600 }}>Browse library →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {EXERCISES.map(ex => {
                  const isActive = activeExercise === ex.id;
                  const progressColor = ex.progress > 80 ? "#3fa87a" : ex.progress > 50 ? "var(--fl-accent)" : "#e8c05a";
                  return (
                    <div key={ex.id} onClick={() => setActiveExercise(isActive ? null : ex.id)} style={{
                      background: "var(--fl-surface)", border: `1.5px solid ${isActive ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
                      borderRadius: "var(--fl-r-xl)", padding: "18px 20px", cursor: "pointer",
                      transition: "border-color 160ms, box-shadow 160ms",
                      boxShadow: isActive ? "var(--fl-shadow-raised)" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        {/* Progress ring */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <ProgressRing pct={ex.progress} size={52} stroke={5} color={progressColor} />
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: progressColor, fontFamily: "var(--fl-font-mono)" }}>{ex.progress}%</span>
                          </div>
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ex.title}</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <LevelBadge level={ex.level} />
                            <span style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)" }}>{ex.category}</span>
                            <span style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)" }}>· {ex.duration}</span>
                          </div>
                        </div>
                        {/* BPM */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.8rem", fontWeight: 700, color: "var(--fl-ink-2)" }}>{ex.bpm} <span style={{ color: "var(--fl-ink-4)", fontWeight: 400 }}>→ {ex.targetBpm}</span></div>
                          <div style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)", marginTop: 2 }}>BPM target</div>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div style={{ height: 3, borderRadius: 2, background: "var(--fl-line)", marginTop: 14, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${ex.progress}%`, background: progressColor, borderRadius: 2, transition: "width 600ms ease-out" }} />
                      </div>
                      {isActive && (
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--fl-line-soft)", display: "flex", gap: 10 }}>
                          <Button variant="primary" size="sm">▶ Start drill</Button>
                          <Button variant="outline" size="sm" onClick={() => setBpm(ex.bpm)}>Set to {ex.bpm} BPM</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ── Right sidebar ───────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Level & league */}
            {(() => {
              const info = levelFromXp(PLAYER.xp);
              const challengesDone = WEEKLY_CHALLENGES.filter(c => c.progress >= c.target).length;
              return (
                <Link to="/profile" style={{ textDecoration: "none" }}>
                  <div style={{ background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)", padding: "20px", position: "relative", overflow: "hidden" }}>
                    <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 90% 10%, oklch(0.45 0.18 289 / 0.5) 0%, transparent 60%)", pointerEvents: "none" }} />
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#b7abf7" }}>Level {info.level}</div>
                          <div style={{ fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{info.title}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontFamily: "var(--fl-font-mono)", fontSize: "1rem", fontWeight: 800, color: "#fff" }}>{xpFmt(info.totalXp)}</div>
                          <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.4)" }}>XP · #{PLAYER.rankInLeague} in league</div>
                        </div>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.12)", overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", width: `${info.progress * 100}%`, borderRadius: 3, background: "linear-gradient(90deg, #b7abf7, #6152d9)" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>
                        <span>{info.xpForLevel - info.xpIntoLevel} XP to Lvl {info.level + 1}</span>
                        <span>🏅 {challengesDone}/{WEEKLY_CHALLENGES.length} challenges</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* This week */}
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fl-ink)" }}>This week</span>
                <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>132 min</span>
              </div>
              <WeekStrip days={WEEK_DAYS} todayIndex={6} max={45} />
              <div style={{ marginTop: 14, padding: "14px", borderRadius: "var(--fl-r-lg)", background: "linear-gradient(135deg, var(--fl-accent) 0%, #8b7cec 100%)", color: "#fff" }}>
                <div style={{ fontSize: "0.62rem", opacity: 0.7, marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>Streak</div>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>14 days 🔥</div>
              </div>
            </div>

            {/* Today's routine */}
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--fl-ink)" }}>Today's routine</span>
                <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>{completedCount}/{totalRoutine}</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 2, background: "var(--fl-line)", marginBottom: 16, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${sessionPct}%`, background: "var(--fl-accent)", borderRadius: 2, transition: "width 400ms ease-out" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {ROUTINE.map((item, i) => {
                  const done = completedItems.has(i);
                  return (
                    <div key={i} onClick={() => setCompletedItems(s => { const n = new Set(s); done ? n.delete(i) : n.add(i); return n; })}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < ROUTINE.length - 1 ? "1px solid var(--fl-line-soft)" : "none", cursor: "pointer" }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                        border: `1.5px solid ${done ? "var(--fl-accent)" : "var(--fl-line)"}`,
                        background: done ? "var(--fl-accent)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 160ms",
                      }}>
                        {done && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5L4 7.5L8.5 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                      <span style={{ flex: 1, fontSize: "0.78rem", color: done ? "var(--fl-ink-4)" : "var(--fl-ink)", textDecoration: done ? "line-through" : "none", lineHeight: 1.35 }}>{item.label}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)", flexShrink: 0 }}>{item.duration}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "Theory", path: "/theory", bg: "rgba(97,82,217,0.12)", border: "rgba(183,171,247,0.2)", color: "#b7abf7", glyph: "◎" },
                { label: "Library", path: "/library", bg: "rgba(63,168,122,0.08)", border: "rgba(63,168,122,0.2)", color: "#3fa87a", glyph: "♩" },
                { label: "Tab Studio", path: "/tab", bg: "rgba(232,124,90,0.08)", border: "rgba(232,124,90,0.2)", color: "#e87c5a", glyph: "═" },
                { label: "Profile", path: "/profile", bg: "rgba(232,192,90,0.08)", border: "rgba(232,192,90,0.2)", color: "#e8c05a", glyph: "▦" },
              ].map(item => (
                <Link key={item.path} to={item.path} style={{
                  background: item.bg, border: `1px solid ${item.border}`,
                  borderRadius: "var(--fl-r-lg)", padding: "14px 12px", textDecoration: "none",
                  display: "flex", flexDirection: "column", gap: 6, transition: "filter 140ms",
                }}
                  onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.15)")}
                  onMouseLeave={e => (e.currentTarget.style.filter = "none")}>
                  <span style={{ fontSize: "1.3rem", color: item.color }}>{item.glyph}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)" }}>{item.label}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
