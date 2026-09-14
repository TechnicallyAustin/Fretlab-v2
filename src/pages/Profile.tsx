import { useState } from "react";
import { PracticeGraph } from "../components/PracticeGraph";
import { SegmentedControl, Tag, Button } from "../components/controls";
import { Heatmap, HeatLegend } from "../components/practice";
import { LevelCard, Leaderboard, WeeklyChallenges } from "../components/Gamification";
import { levelFromXp, PLAYER } from "../lib/gamification";

/* ── Settings helpers ─────────────────────────────────────────── */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} role="switch" aria-checked={value}
      style={{ width: 38, height: 22, borderRadius: 11, border: "none", cursor: "pointer", background: value ? "var(--fl-accent)" : "var(--fl-line)", position: "relative", transition: "background 160ms", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: value ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 160ms", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--fl-line-soft)" }}>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--fl-ink)" }}>{label}</div>
        {desc && <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)", marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const HEATMAP_DATA = [
  [12, 0, 18, 6, 0],
  [20, 14, 0, 22, 10],
  [8, 26, 12, 0, 16],
  [0, 10, 30, 14, 4],
  [18, 6, 12, 24, 0],
  [22, 18, 8, 0, 20],
  [14, 30, 0, 16, 10],
  [6, 12, 22, 18, 0],
  [28, 0, 14, 8, 24],
  [16, 20, 6, 0, 18],
  [0, 14, 24, 12, 8],
  [20, 8, 0, 22, 16],
];

const ACHIEVEMENTS = [
  { id: "streak7", icon: "🔥", title: "7-Day Streak", desc: "Practiced 7 days in a row", earned: true, date: "Sep 8" },
  { id: "streak14", icon: "🏆", title: "14-Day Streak", desc: "Practiced 14 days in a row", earned: true, date: "Sep 13" },
  { id: "pentatonic", icon: "⚡", title: "Pentatonic Master", desc: "Completed all 5 positions at 120 BPM", earned: true, date: "Sep 5" },
  { id: "100h", icon: "💎", title: "100 Hours", desc: "Accumulated 100 hours of practice", earned: true, date: "Aug 29" },
  { id: "barre", icon: "🎸", title: "Barre Changer", desc: "Transition F barre at 80 BPM", earned: false, date: null },
  { id: "theory", icon: "🎓", title: "Theory Scholar", desc: "Complete all Theory Studio lessons", earned: false, date: null },
  { id: "blues", icon: "🎵", title: "Blues Authentic", desc: "Master the Blues scale in all keys", earned: false, date: null },
  { id: "200h", icon: "🌟", title: "200 Hours", desc: "Accumulated 200 hours of practice", earned: false, date: null },
];

const RECENT_SESSIONS = [
  { date: "Today", duration: "42m", exercises: ["Am Pentatonic Box 1", "Chord transitions", "Song: Wish You Were Here"], bpm: 95 },
  { date: "Yesterday", duration: "28m", exercises: ["Chromatic warm-up", "C Major scale"], bpm: 80 },
  { date: "Sep 11", duration: "55m", exercises: ["Barre chord drill", "Blues scale A", "Tab: Comfortably Numb intro"], bpm: 100 },
  { date: "Sep 10", duration: "35m", exercises: ["Scale positions 1–3", "Finger independence"], bpm: 70 },
  { date: "Sep 9", duration: "48m", exercises: ["Minor pentatonic improv", "Arpeggio sweep intro"], bpm: 85 },
];

const GOALS = [
  { label: "Play F barre chord cleanly", target: "Oct 1", progress: 57, done: false },
  { label: "Comfortably Numb solo at 80 BPM", target: "Oct 15", progress: 22, done: false },
  { label: "Learn 12-bar blues in A", target: "Sep 20", progress: 90, done: false },
  { label: "Memorize CAGED shapes", target: "Sep 30", progress: 100, done: true },
];

function ProgressBar({ value, color = "var(--fl-accent)" }: { value: number; color?: string }) {
  return (
    <div style={{ height: 6, borderRadius: 3, background: "var(--fl-line)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3, transition: "width 600ms var(--fl-ease-out)" }} />
    </div>
  );
}

export function Profile() {
  const [graphView, setGraphView] = useState("52");
  const [notifPractice, setNotifPractice] = useState(true);
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [defaultBpm, setDefaultBpm] = useState(80);
  const [prefKey, setPrefKey] = useState("A");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [editingGoal, setEditingGoal] = useState<number | null>(null);
  const [goals, setGoals] = useState(GOALS);

  return (
    <div style={{ padding: "36px 40px 80px", fontFamily: "var(--fl-font)" }}>
      <div style={{ maxWidth: 1060 }}>
        {/* Hero header */}
        <div style={{
          background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)",
          padding: "32px 36px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 28,
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: -100, right: -80, width: 400, height: 400, borderRadius: "50%", background: "var(--fl-canvas-wash)", opacity: 0.08, pointerEvents: "none" }} />
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #b7abf7 0%, #6152d9 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", fontWeight: 800, color: "#fff", flexShrink: 0, border: "3px solid rgba(255,255,255,0.2)" }}>JD</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "var(--fl-t-title)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", marginBottom: 4 }}>Jamie Davis</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Tag variant="intermediate">Intermediate</Tag>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "var(--fl-r-pill)" }}>
                Lvl {levelFromXp(PLAYER.xp).level} · {levelFromXp(PLAYER.xp).title}
              </span>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>Member since March 2024</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 24, flexShrink: 0 }}>
            {[
              { label: "Total hours", value: "147h" },
              { label: "Streak", value: "14d 🔥" },
              { label: "Exercises done", value: "312" },
              { label: "Scales learned", value: "18" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{value}</div>
                <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progression: level + league */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 400px", gap: 20, marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <LevelCard />
            <WeeklyChallenges />
          </div>
          <Leaderboard />
        </div>

        {/* Contribution graph */}
        <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "28px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <h2 style={{ margin: "0 0 2px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Practice Activity</h2>
              <div style={{ fontSize: "0.78rem", color: "var(--fl-ink-3)" }}>Your contribution graph — inspired by GitHub</div>
            </div>
            <SegmentedControl
              options={[{ value: "13", label: "13 wk" }, { value: "26", label: "26 wk" }, { value: "52", label: "52 wk" }]}
              value={graphView}
              onChange={setGraphView}
              compact
            />
          </div>
          <PracticeGraph weeks={Number(graphView)} />
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "center" }}>
            <Heatmap weeks={HEATMAP_DATA.slice(0, Number(graphView) === 13 ? 5 : Number(graphView) === 26 ? 10 : 12)} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <HeatLegend />
              <div style={{ fontSize: "var(--fl-t-label)", color: "var(--fl-ink-4)" }}>Minutes per session</div>
            </div>
          </div>
        </div>

        {/* Two-column: sessions + goals */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 24 }}>
          {/* Recent sessions */}
          <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "24px" }}>
            <h2 style={{ margin: "0 0 18px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Recent Sessions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {RECENT_SESSIONS.map((session, i) => (
                <div
                  key={i}
                  style={{ padding: "14px 0", borderBottom: i < RECENT_SESSIONS.length - 1 ? "1px solid var(--fl-line-soft)" : "none", display: "flex", gap: 16, alignItems: "flex-start" }}
                >
                  <div style={{ flexShrink: 0, width: 64 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--fl-ink)" }}>{session.date}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)", marginTop: 2 }}>{session.duration}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {session.exercises.map((ex) => (
                        <span key={ex} style={{ padding: "2px 8px", borderRadius: "var(--fl-r-pill)", background: "var(--fl-surface-sunk)", fontSize: "0.72rem", color: "var(--fl-ink-3)" }}>{ex}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.75rem", color: "var(--fl-ink-4)" }}>{session.bpm} BPM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Goals</h2>
              <Button variant="outline" size="sm">+ Add goal</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {GOALS.map((goal, i) => (
                <div key={i} style={{ padding: "14px", borderRadius: "var(--fl-r-lg)", background: goal.done ? "var(--fl-success-soft)" : "var(--fl-surface-sunk)", border: `1px solid ${goal.done ? "rgba(63,168,122,0.2)" : "var(--fl-line)"}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.83rem", fontWeight: 500, color: goal.done ? "var(--fl-success)" : "var(--fl-ink)", textDecoration: goal.done ? "line-through" : "none" }}>
                      {goal.done && "✓ "}{goal.label}
                    </span>
                    <span style={{ fontSize: "0.7rem", color: "var(--fl-ink-4)" }}>{goal.target}</span>
                  </div>
                  <ProgressBar value={goal.progress} color={goal.done ? "var(--fl-success)" : "var(--fl-accent)"} />
                  <div style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)", marginTop: 5 }}>{goal.progress}% complete</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "28px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Achievements</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.id}
                style={{
                  padding: "16px", borderRadius: "var(--fl-r-lg)",
                  background: ach.earned ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)",
                  border: `1px solid ${ach.earned ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
                  opacity: ach.earned ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{ach.icon}</div>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: ach.earned ? "var(--fl-accent-ink)" : "var(--fl-ink)", marginBottom: 4 }}>
                  {ach.title}
                </div>
                <div style={{ fontSize: "0.74rem", color: "var(--fl-ink-3)", lineHeight: 1.4, marginBottom: ach.date ? 8 : 0 }}>
                  {ach.desc}
                </div>
                {ach.date && (
                  <div style={{ fontSize: "0.68rem", color: "var(--fl-accent-ink)", fontWeight: 500 }}>Earned {ach.date}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Settings ──────────────────────────────────────── */}
        <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "28px" }}>
          <h2 style={{ margin: "0 0 4px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Settings</h2>
          <div style={{ fontSize: "0.78rem", color: "var(--fl-ink-4)", marginBottom: 22 }}>Preferences and notifications</div>

          {/* Notifications */}
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 4 }}>Notifications</div>
          <SettingRow label="Daily practice reminder" desc="Remind me to practice each day">
            <Toggle value={notifPractice} onChange={setNotifPractice} />
          </SettingRow>
          <SettingRow label="Streak alerts" desc="Notify when streak is at risk">
            <Toggle value={notifStreak} onChange={setNotifStreak} />
          </SettingRow>
          <SettingRow label="Weekly progress summary">
            <Toggle value={notifWeekly} onChange={setNotifWeekly} />
          </SettingRow>

          {/* Practice defaults */}
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginTop: 20, marginBottom: 4 }}>Practice defaults</div>
          <SettingRow label="Default metronome BPM" desc="Starting BPM for new sessions">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button onClick={() => setDefaultBpm(b => Math.max(40, b - 5))} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", cursor: "pointer", color: "var(--fl-ink-3)", fontSize: "0.9rem" }}>-</button>
              <span style={{ fontFamily: "var(--fl-font-mono)", minWidth: 36, textAlign: "center", fontWeight: 600, fontSize: "0.88rem", color: "var(--fl-ink)" }}>{defaultBpm}</span>
              <button onClick={() => setDefaultBpm(b => Math.min(240, b + 5))} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", cursor: "pointer", color: "var(--fl-ink-3)", fontSize: "0.9rem" }}>+</button>
            </div>
          </SettingRow>
          <SettingRow label="Preferred practice key">
            <select value={prefKey} onChange={e => setPrefKey(e.target.value)}
              style={{ padding: "5px 10px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", fontFamily: "var(--fl-font-mono)", fontSize: "0.82rem", color: "var(--fl-ink)", outline: "none" }}>
              {["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </SettingRow>

          {/* Appearance */}
          <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginTop: 20, marginBottom: 4 }}>Appearance</div>
          <SettingRow label="Theme">
            <div style={{ display: "flex", gap: 4 }}>
              {(["system", "light", "dark"] as const).map(t => (
                <button key={t} onClick={() => setTheme(t)}
                  style={{ padding: "4px 10px", borderRadius: "var(--fl-r-md)", border: `1px solid ${theme === t ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: theme === t ? "var(--fl-accent-softer)" : "transparent", color: theme === t ? "var(--fl-accent-ink)" : "var(--fl-ink-4)", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* ── Account ───────────────────────────────────────── */}
        <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "28px" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "var(--fl-t-section)", fontWeight: 600 }}>Account</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            {/* Plan */}
            <div style={{ padding: "18px 20px", borderRadius: "var(--fl-r-lg)", background: "var(--fl-accent-softer)", border: "1px solid var(--fl-accent-line)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-accent-ink)", marginBottom: 6 }}>Plan</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fl-ink)", marginBottom: 4 }}>FretLab Pro</div>
              <div style={{ fontSize: "0.75rem", color: "var(--fl-ink-3)", marginBottom: 14 }}>Renews Jan 14, 2027</div>
              <Button variant="outline" size="sm">Manage plan</Button>
            </div>
            {/* Storage */}
            <div style={{ padding: "18px 20px", borderRadius: "var(--fl-r-lg)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 6 }}>Storage</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fl-ink)", marginBottom: 4 }}>2.4 GB / 10 GB</div>
              <div style={{ height: 5, borderRadius: 3, background: "var(--fl-line)", marginBottom: 12, overflow: "hidden" }}>
                <div style={{ height: "100%", width: "24%", background: "var(--fl-accent)", borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>Tab files, recordings, exports</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { label: "Export my data", desc: "Download all your tabs, sessions, and progress as a ZIP", action: "Export" },
              { label: "Connected apps", desc: "YouTube, Spotify, MIDI controller", action: "Manage" },
              { label: "Delete account", desc: "Permanently delete your FretLab account and all data", action: "Delete", danger: true },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--fl-line-soft)" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, color: item.danger ? "#e8634a" : "var(--fl-ink)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)", marginTop: 2 }}>{item.desc}</div>
                </div>
                <button style={{ padding: "5px 12px", borderRadius: "var(--fl-r-md)", border: `1px solid ${item.danger ? "rgba(232,99,74,0.3)" : "var(--fl-line)"}`, background: "transparent", color: item.danger ? "#e8634a" : "var(--fl-ink-3)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "var(--fl-font)" }}>{item.action}</button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button style={{ padding: "8px 18px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "transparent", color: "var(--fl-ink-3)", fontFamily: "var(--fl-font)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
