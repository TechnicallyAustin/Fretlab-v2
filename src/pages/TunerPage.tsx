import { useState, useEffect, useRef } from "react";

/* ── Tuner simulation state ─────────────────────────────────── */
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const STRINGS = [
  { label: "e", num: 1, note: "E", octave: 4, hz: 329.63, color: "#b7abf7" },
  { label: "B", num: 2, note: "B", octave: 3, hz: 246.94, color: "#9d8ff0" },
  { label: "G", num: 3, note: "G", octave: 3, hz: 196.0,  color: "#8678e8" },
  { label: "D", num: 4, note: "D", octave: 3, hz: 146.83, color: "#7060e0" },
  { label: "A", num: 5, note: "A", octave: 2, hz: 110.0,  color: "#6152d9" },
  { label: "E", num: 6, note: "E", octave: 2, hz: 82.41,  color: "#4e42c8" },
];

const TUNINGS = [
  { id: "standard", name: "Standard", notation: "E A D G B e" },
  { id: "drop-d",   name: "Drop D",   notation: "D A D G B e" },
  { id: "half-down",name: "Half ♭",   notation: "Eb Ab Db Gb Bb eb" },
  { id: "open-g",   name: "Open G",   notation: "D G D G B D" },
  { id: "dadgad",   name: "DADGAD",   notation: "D A D G A D" },
];

/* ── Gauge geometry ─────────────────────────────────────────── */
const CX = 220, CY = 210, R = 170;

function toRad(deg: number) { return ((deg - 90) * Math.PI) / 180; }

function arcPath(r: number, a1deg: number, a2deg: number) {
  const a1 = toRad(a1deg + 90);
  const a2 = toRad(a2deg + 90);
  return `M ${CX + r * Math.cos(a1)} ${CY + r * Math.sin(a1)} A ${r} ${r} 0 ${Math.abs(a2deg - a1deg) > 180 ? 1 : 0} 1 ${CX + r * Math.cos(a2)} ${CY + r * Math.sin(a2)}`;
}

export function TunerPage() {
  const [cents, setCents] = useState(0);
  const [note, setNote] = useState("A");
  const [octave, setOctave] = useState(4);
  const [freq, setFreq] = useState(440);
  const [level, setLevel] = useState(0.7);
  const [activeString, setActiveString] = useState<number>(1);
  const [tuning, setTuning] = useState("standard");
  const animRef = useRef<number>(0);

  const inTune = Math.abs(cents) <= 4;
  const needleAngle = Math.max(-50, Math.min(50, cents * 1.0));

  /* — simulated animation — */
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.016;
      const drift = Math.sin(t * 0.6) * 22 + Math.sin(t * 1.4) * 10 + Math.sin(t * 3.1) * 3;
      setCents(Math.round(drift));
      setLevel(0.55 + Math.sin(t * 2.4) * 0.28);
      const ni = Math.floor(Math.abs(Math.sin(t * 0.08)) * NOTES.length) % NOTES.length;
      setNote(NOTES[ni]);
      setOctave(Math.abs(drift) < 6 ? 4 : 3);
      setFreq(Math.round(440 + drift * 2.57));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const accentColor = inTune ? "#3fa87a" : cents < 0 ? "#e87c5a" : "#b7abf7";
  const glowColor   = inTune ? "rgba(63,168,122,0.35)" : cents < 0 ? "rgba(232,124,90,0.3)" : "rgba(183,171,247,0.3)";

  return (
    <div style={{ minHeight: "100vh", background: "#0e0d12", fontFamily: "var(--fl-font)", color: "#fff" }}>

      {/* ── Full-bleed ambient background ─────────────────────── */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `radial-gradient(ellipse at 50% 35%, ${glowColor} 0%, transparent 65%), radial-gradient(ellipse at 15% 80%, rgba(97,82,217,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 80%, rgba(97,82,217,0.1) 0%, transparent 50%)`,
        transition: "background 400ms ease",
      }} />

      <div style={{ position: "relative", zIndex: 1, padding: "0 36px 60px" }}>

        {/* ── Header ──────────────────────────────────────────── */}
        <div style={{ padding: "28px 0 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 4, fontFamily: "var(--fl-font-mono)" }}>Chromatic tuner</div>
            <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>Tune Up</h1>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {TUNINGS.map(t => (
              <button key={t.id} onClick={() => setTuning(t.id)} style={{
                padding: "7px 14px", borderRadius: "var(--fl-r-md)",
                border: `1px solid ${tuning === t.id ? "rgba(183,171,247,0.5)" : "rgba(255,255,255,0.1)"}`,
                background: tuning === t.id ? "rgba(183,171,247,0.12)" : "rgba(255,255,255,0.04)",
                color: tuning === t.id ? "#b7abf7" : "rgba(255,255,255,0.45)",
                fontFamily: "var(--fl-font)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                transition: "all 140ms",
              }}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main layout ─────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 28, alignItems: "start" }}>

          {/* ── Gauge + readout ─────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* String selector */}
            <div style={{ display: "flex", gap: 8, marginBottom: 36 }}>
              {STRINGS.map(s => {
                const isActive = activeString === s.num;
                return (
                  <button key={s.num} onClick={() => setActiveString(s.num)} style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    padding: "10px 14px", borderRadius: "var(--fl-r-lg)", cursor: "pointer",
                    border: `1.5px solid ${isActive ? s.color : "rgba(255,255,255,0.1)"}`,
                    background: isActive ? `${s.color}1a` : "rgba(255,255,255,0.04)",
                    transition: "all 160ms",
                    boxShadow: isActive ? `0 0 20px ${s.color}30` : "none",
                  }}>
                    <span style={{ fontFamily: "var(--fl-font-mono)", fontWeight: 800, fontSize: "1.1rem", color: isActive ? s.color : "rgba(255,255,255,0.4)" }}>
                      {s.label}
                    </span>
                    <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)" }}>
                      {STRINGS[s.num - 1].hz} Hz
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Gauge SVG */}
            <div style={{ position: "relative" }}>
              {/* Outer glow ring when in tune */}
              {inTune && (
                <div style={{
                  position: "absolute", inset: -20, borderRadius: "50%",
                  background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                  animation: "pulse 2s ease-in-out infinite",
                  pointerEvents: "none",
                }} />
              )}

              <svg width={440} height={300} viewBox="0 0 440 300" style={{ display: "block", overflow: "visible" }}>

                {/* ── Decorative rings ── */}
                <circle cx={CX} cy={CY} r={R + 28} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={1} />
                <circle cx={CX} cy={CY} r={R + 14} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

                {/* ── Flat zone arc ── */}
                <path d={arcPath(R, -55, -10)} fill="none" stroke="rgba(232,124,90,0.25)" strokeWidth={10} strokeLinecap="round" />
                {/* ── Sharp zone arc ── */}
                <path d={arcPath(R, 10, 55)}  fill="none" stroke="rgba(232,124,90,0.25)" strokeWidth={10} strokeLinecap="round" />
                {/* ── In-tune zone ── */}
                <path d={arcPath(R, -10, 10)} fill="none" stroke={inTune ? "#3fa87a" : "rgba(63,168,122,0.2)"} strokeWidth={10} strokeLinecap="round" style={{ transition: "stroke 300ms" }} />

                {/* ── Track ── */}
                <path d={arcPath(R, -55, 55)} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={2} strokeLinecap="round" />

                {/* ── Glow sweep from center to current position ── */}
                {!inTune && (
                  <path
                    d={arcPath(R, 0, needleAngle)}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth={3}
                    strokeLinecap="round"
                    opacity={0.4}
                    style={{ transition: "all 80ms cubic-bezier(.2,.8,.2,1)" }}
                  />
                )}

                {/* ── Tick marks ── */}
                {[-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50].map(deg => {
                  const rad = toRad(deg + 90);
                  const isMajor = deg % 10 === 0;
                  const r1 = R - (isMajor ? 18 : 10);
                  const r2 = R - (isMajor ? 4 : 5);
                  return (
                    <line key={deg}
                      x1={CX + r1 * Math.cos(rad)} y1={CY + r1 * Math.sin(rad)}
                      x2={CX + r2 * Math.cos(rad)} y2={CY + r2 * Math.sin(rad)}
                      stroke={deg === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}
                      strokeWidth={deg === 0 ? 2.5 : 1}
                      strokeLinecap="round"
                    />
                  );
                })}

                {/* ── Cent labels ── */}
                {[-40, -20, 0, 20, 40].map(deg => {
                  const rad = toRad(deg + 90);
                  const r = R + 22;
                  return (
                    <text key={`l-${deg}`} x={CX + r * Math.cos(rad)} y={CY + r * Math.sin(rad)}
                      textAnchor="middle" dominantBaseline="central" fontSize={9} fontFamily="var(--fl-font-mono)"
                      fill={deg === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)"}>
                      {deg > 0 ? `+${deg}` : deg}¢
                    </text>
                  );
                })}

                {/* ── Needle ── */}
                <g transform={`rotate(${needleAngle}, ${CX}, ${CY})`} style={{ transition: "transform 60ms cubic-bezier(.2,.8,.2,1)" }}>
                  {/* Glow trail */}
                  <line x1={CX} y1={CY - 20} x2={CX} y2={CY - R + 22}
                    stroke={accentColor} strokeWidth={6} strokeLinecap="round" opacity={0.12}
                    style={{ transition: "stroke 300ms" }} />
                  {/* Main needle */}
                  <line x1={CX} y1={CY - 10} x2={CX} y2={CY - R + 22}
                    stroke={accentColor} strokeWidth={2.5} strokeLinecap="round"
                    style={{ transition: "stroke 300ms" }} />
                  {/* Needle base circle */}
                  <circle cx={CX} cy={CY} r={10} fill={accentColor} style={{ transition: "fill 300ms" }} />
                  <circle cx={CX} cy={CY} r={5} fill="#0e0d12" />
                </g>

                {/* ── Center readout ── */}
                {/* Note name */}
                <text x={CX} y={CY + 44} textAnchor="middle" fontSize={56} fontWeight={800} fill="#fff" style={{ fontFamily: "var(--fl-font)", letterSpacing: "-0.05em" }}>
                  {note}
                </text>
                <text x={CX + 36} y={CY + 24} fontSize={20} fontWeight={600} fill="rgba(255,255,255,0.4)" style={{ fontFamily: "var(--fl-font-mono)" }}>
                  {octave}
                </text>

                {/* Status badge */}
                <rect x={CX - 56} y={CY + 80} width={112} height={22} rx={11}
                  fill={inTune ? "rgba(63,168,122,0.2)" : "rgba(255,255,255,0.05)"}
                  stroke={inTune ? "#3fa87a" : "rgba(255,255,255,0.1)"} strokeWidth={1} />
                <text x={CX} y={CY + 91} textAnchor="middle" dominantBaseline="central"
                  fontSize={10} fontWeight={700} fontFamily="var(--fl-font-mono)"
                  fill={inTune ? "#3fa87a" : (cents < 0 ? "#e87c5a" : "#b7abf7")}
                  style={{ transition: "fill 300ms", letterSpacing: "0.08em" }}>
                  {inTune ? "♦  IN TUNE" : cents > 0 ? `+${cents}¢  SHARP` : `${cents}¢  FLAT`}
                </text>

                {/* Freq readout */}
                <text x={CX} y={CY + 118} textAnchor="middle" fontSize={12} fontFamily="var(--fl-font-mono)"
                  fill="rgba(255,255,255,0.25)">
                  {freq} Hz
                </text>

                {/* Signal level bar */}
                <rect x={CX - 70} y={CY + 138} width={140} height={3} rx={1.5} fill="rgba(255,255,255,0.08)" />
                <rect x={CX - 70} y={CY + 138} width={level * 140} height={3} rx={1.5}
                  fill={inTune ? "#3fa87a" : accentColor}
                  style={{ transition: "width 60ms, fill 300ms" }} />
              </svg>
            </div>

            {/* ── Mic permission note ── */}
            <div style={{ marginTop: 12, padding: "10px 20px", borderRadius: "var(--fl-r-pill)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", fontFamily: "var(--fl-font-mono)" }}>
              Microphone · demo mode · no audio recorded
            </div>
          </div>

          {/* ── Right column ────────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* String reference */}
            <div style={{ borderRadius: "var(--fl-r-xl)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "20px" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14, fontFamily: "var(--fl-font-mono)" }}>String reference</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {STRINGS.map(s => {
                  const isActive = activeString === s.num;
                  return (
                    <div key={s.num} onClick={() => setActiveString(s.num)} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: "var(--fl-r-lg)", cursor: "pointer",
                      background: isActive ? `${s.color}15` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? `${s.color}40` : "rgba(255,255,255,0.06)"}`,
                      transition: "all 140ms",
                    }}>
                      {/* String thickness indicator */}
                      <div style={{ width: 3 + (6 - s.num) * 0.5, height: 28, borderRadius: 2, background: isActive ? s.color : "rgba(255,255,255,0.15)", flexShrink: 0, transition: "background 200ms" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--fl-font-mono)", fontWeight: 700, fontSize: "0.95rem", color: isActive ? s.color : "rgba(255,255,255,0.5)" }}>
                          {s.note}<sub style={{ fontSize: "0.6rem", opacity: 0.6 }}>{s.octave}</sub>
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{s.hz} Hz</div>
                      </div>
                      <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.2)", fontFamily: "var(--fl-font-mono)" }}>String {s.num}</div>
                      {isActive && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            <div style={{ borderRadius: "var(--fl-r-xl)", border: "1px solid rgba(183,171,247,0.2)", background: "rgba(97,82,217,0.08)", padding: "20px" }}>
              <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(183,171,247,0.5)", marginBottom: 14 }}>Tuning tips</div>
              {[
                { title: "Always approach from below", body: "Tune up to the target pitch — never down. String slippage makes sharp notes go flat; flat notes stay put." },
                { title: "Stretch new strings", body: "After restringing, gently pull each string away from the body, retune, repeat until it holds." },
                { title: "G–B interval is a 3rd", body: "Every string pair is a 4th apart except G to B, which is a major 3rd. Use 4th fret on G for B tuning." },
              ].map((tip, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 12 : 0, paddingBottom: i < 2 ? 12 : 0, borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#b7abf7", marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>{tip.body}</div>
                </div>
              ))}
            </div>

            {/* A=440 reference */}
            <div style={{ borderRadius: "var(--fl-r-xl)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(97,82,217,0.2)", border: "1px solid rgba(183,171,247,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2a7 7 0 1 1 0 14A7 7 0 0 1 9 2zm0 3v4l3 2" stroke="#b7abf7" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>Reference pitch</div>
                <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", marginTop: 2 }}>A<sub>4</sub> = 440 Hz (concert standard)</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
