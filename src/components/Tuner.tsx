import { useState, useEffect, useRef } from "react";

interface TunerProps {
  simulated?: boolean;
}

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const STRING_NOTES = [
  { note: "E", octave: 4, string: "1" },
  { note: "B", octave: 3, string: "2" },
  { note: "G", octave: 3, string: "3" },
  { note: "D", octave: 3, string: "4" },
  { note: "A", octave: 2, string: "5" },
  { note: "E", octave: 2, string: "6" },
];

export function Tuner({ simulated = true }: TunerProps) {
  const [cents, setCents] = useState(0);
  const [note, setNote] = useState("A");
  const [octave, setOctave] = useState(3);
  const [freq, setFreq] = useState(440);
  const [level, setLevel] = useState(0.72);
  const [locked, setLocked] = useState(false);
  const [targetString, setTargetString] = useState<string | null>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!simulated) return;
    let t = 0;
    const animate = () => {
      t += 0.018;
      // Simulate needle drifting, finding pitch, locking
      const target = Math.sin(t * 0.7) * 18 + Math.sin(t * 1.3) * 8;
      const drift = target * (0.85 + Math.sin(t * 0.4) * 0.15);
      setCents(Math.round(drift));
      setLevel(0.6 + Math.sin(t * 2.1) * 0.22);
      const noteIdx = Math.floor((t * 0.2) % NOTES.length);
      setNote(NOTES[noteIdx]);
      setOctave(Math.abs(drift) < 5 ? 3 : 4);
      setFreq(Math.round(440 + drift * 2.57));
      setLocked(Math.abs(drift) < 5);
      timeRef.current = t;
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [simulated]);

  const needleAngle = Math.max(-45, Math.min(45, cents * 0.9));
  const inTune = Math.abs(cents) <= 5;

  const cx = 200;
  const cy = 170;
  const R = 150;

  const arcPath = (r: number, startDeg: number, endDeg: number) => {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const a1 = toRad(startDeg + 90);
    const a2 = toRad(endDeg + 90);
    return `M ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* String selector */}
      <div style={{ display: "flex", gap: 6 }}>
        {STRING_NOTES.map((s) => {
          const isTarget = targetString === s.string;
          return (
            <button
              key={s.string}
              onClick={() => setTargetString(isTarget ? null : s.string)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                padding: "6px 10px", borderRadius: "var(--fl-r-md)",
                border: `1px solid ${isTarget ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
                background: isTarget ? "var(--fl-accent-soft)" : "var(--fl-surface)",
                cursor: "pointer", gap: 2,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: isTarget ? "var(--fl-accent-ink)" : "var(--fl-ink)", fontFamily: "var(--fl-font-mono)" }}>
                {s.note}
              </span>
              <span style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)" }}>{s.string}</span>
            </button>
          );
        })}
      </div>

      {/* Meter SVG */}
      <svg width={400} height={220} viewBox="0 0 400 220" style={{ display: "block" }}>
        {/* Outer arc track */}
        <path d={arcPath(R, -50, 50)} fill="none" stroke="var(--fl-line)" strokeWidth="3" strokeLinecap="round" />

        {/* Color zones */}
        <path d={arcPath(R, -50, -10)} fill="none" stroke="#f4c0cc" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path d={arcPath(R, 10, 50)} fill="none" stroke="#f4c0cc" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
        <path d={arcPath(R, -8, 8)} fill="none" stroke={inTune ? "#3fa87a" : "var(--fl-accent-line)"} strokeWidth="6" strokeLinecap="round" style={{ transition: "stroke 300ms" }} />

        {/* Tick marks */}
        {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const r1 = R - 10;
          const r2 = R + (deg === 0 ? 14 : 6);
          return (
            <line
              key={deg}
              x1={cx + r1 * Math.cos(rad)} y1={cy + r1 * Math.sin(rad)}
              x2={cx + r2 * Math.cos(rad)} y2={cy + r2 * Math.sin(rad)}
              stroke={deg === 0 ? "var(--fl-ink-2)" : "var(--fl-line)"}
              strokeWidth={deg === 0 ? 2 : 1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Cent labels */}
        {[-40, -20, 0, 20, 40].map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const r = R + 22;
          return (
            <text
              key={`l-${deg}`}
              x={cx + r * Math.cos(rad)} y={cy + r * Math.sin(rad)}
              textAnchor="middle" dominantBaseline="central"
              fontSize="9" fill="var(--fl-ink-4)"
              style={{ fontFamily: "var(--fl-font-mono)" }}
            >
              {deg > 0 ? `+${deg}` : deg}
            </text>
          );
        })}

        {/* Needle */}
        <g
          transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
          style={{ transition: "transform 80ms cubic-bezier(.2,.8,.2,1)" }}
        >
          <line
            x1={cx} y1={cy}
            x2={cx} y2={cy - R + 18}
            stroke={inTune ? "#3fa87a" : "var(--fl-accent)"}
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: "stroke 300ms" }}
          />
          <circle cx={cx} cy={cy} r={6}
            fill={inTune ? "#3fa87a" : "var(--fl-accent)"}
            style={{ transition: "fill 300ms" }}
          />
        </g>

        {/* Note display */}
        <text x={cx} y={cy + 28} textAnchor="middle" fontSize="36" fontWeight="700" fill="var(--fl-ink)" style={{ fontFamily: "var(--fl-font)" }}>
          {note}
        </text>
        <text x={cx + 22} y={cy + 16} textAnchor="middle" fontSize="16" fill="var(--fl-ink-3)" style={{ fontFamily: "var(--fl-font-mono)" }}>
          {octave}
        </text>

        {/* Cents readout */}
        <text x={cx} y={cy + 60} textAnchor="middle" fontSize="13" fontWeight="500"
          fill={inTune ? "#3fa87a" : cents < 0 ? "#b64d65" : "var(--fl-warn)"}
          style={{ fontFamily: "var(--fl-font-mono)", transition: "fill 300ms" }}
        >
          {inTune ? "♦ IN TUNE" : cents > 0 ? `+${cents}¢ SHARP` : `${cents}¢ FLAT`}
        </text>

        {/* Freq */}
        <text x={cx} y={cy + 80} textAnchor="middle" fontSize="10" fill="var(--fl-ink-4)" style={{ fontFamily: "var(--fl-font-mono)" }}>
          {freq} Hz
        </text>

        {/* Level bar */}
        <rect x={cx - 60} y={195} width={120} height={6} rx={3} fill="var(--fl-line)" />
        <rect x={cx - 60} y={195} width={level * 120} height={6} rx={3} fill={inTune ? "#3fa87a" : "var(--fl-accent)"} style={{ transition: "width 80ms, fill 300ms" }} />
        <text x={cx - 68} y={198} textAnchor="end" dominantBaseline="central" fontSize="8" fill="var(--fl-ink-4)">IN</text>
      </svg>
    </div>
  );
}
