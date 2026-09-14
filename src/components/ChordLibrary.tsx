import { Piano } from "./Piano";

/* ── Types ─────────────────────────────────────────────────── */
export type ChordQuality = "major" | "minor" | "dominant" | "diminished" | "augmented" | "sus";
export interface ChordDef {
  name: string;
  quality: ChordQuality;
  /** [high-e, B, G, D, A, low-E] — -1 = muted, 0 = open */
  frets: number[];
  fingers: number[];
  formula: string;
  notes: string[];
  desc: string;
}

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: "Major", minor: "Minor", dominant: "Dom 7", diminished: "Dim", augmented: "Aug", sus: "Sus",
};
export const QUALITY_COLORS: Record<ChordQuality, string> = {
  major: "oklch(0.72 0.11 140)", minor: "oklch(0.72 0.11 240)", dominant: "oklch(0.72 0.11 30)",
  diminished: "oklch(0.72 0.11 0)", augmented: "oklch(0.72 0.11 60)", sus: "oklch(0.72 0.11 200)",
};

/* ── Shared chord library ──────────────────────────────────── */
export const CHORD_LIBRARY: Record<string, ChordDef> = {
  C: { name: "C", quality: "major", frets: [0, 1, 0, 2, 3, -1], fingers: [0, 1, 0, 2, 3, 0], formula: "1 3 5", notes: ["C", "E", "G"], desc: "Open C major" },
  Am: { name: "Am", quality: "minor", frets: [0, 1, 2, 2, 0, -1], fingers: [0, 1, 2, 3, 0, 0], formula: "1 b3 5", notes: ["A", "C", "E"], desc: "Open A minor" },
  G: { name: "G", quality: "major", frets: [3, 0, 0, 0, 2, 3], fingers: [4, 0, 0, 0, 1, 3], formula: "1 3 5", notes: ["G", "B", "D"], desc: "Open G major" },
  Em: { name: "Em", quality: "minor", frets: [0, 0, 0, 2, 2, 0], fingers: [0, 0, 0, 2, 1, 0], formula: "1 b3 5", notes: ["E", "G", "B"], desc: "Open E minor" },
  D: { name: "D", quality: "major", frets: [-1, -1, 2, 3, 2, -1], fingers: [0, 0, 1, 3, 2, 0], formula: "1 3 5", notes: ["D", "F#", "A"], desc: "Open D major" },
  F: { name: "F", quality: "major", frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 4, 3, 1], formula: "1 3 5", notes: ["F", "A", "C"], desc: "F major barre" },
  Dm: { name: "Dm", quality: "minor", frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], formula: "1 b3 5", notes: ["D", "F", "A"], desc: "Open D minor" },
  E: { name: "E", quality: "major", frets: [0, 0, 1, 2, 2, 0], fingers: [0, 0, 1, 3, 2, 0], formula: "1 3 5", notes: ["E", "G#", "B"], desc: "Open E major" },
  A: { name: "A", quality: "major", frets: [0, 2, 2, 2, 0, -1], fingers: [0, 1, 2, 3, 0, 0], formula: "1 3 5", notes: ["A", "C#", "E"], desc: "Open A major" },
  Bm: { name: "Bm", quality: "minor", frets: [2, 3, 4, 4, 2, -1], fingers: [1, 2, 3, 4, 1, 0], formula: "1 b3 5", notes: ["B", "D", "F#"], desc: "Bm barre (II)" },
  C7: { name: "C7", quality: "dominant", frets: [0, 1, 3, 2, 3, -1], fingers: [0, 1, 3, 2, 4, 0], formula: "1 3 5 b7", notes: ["C", "E", "G", "A#"], desc: "C dominant 7" },
  G7: { name: "G7", quality: "dominant", frets: [1, 0, 0, 0, 2, 3], fingers: [1, 0, 0, 0, 2, 3], formula: "1 3 5 b7", notes: ["G", "B", "D", "F"], desc: "G dominant 7" },
  E7: { name: "E7", quality: "dominant", frets: [0, 2, 0, 1, 2, 0], fingers: [0, 3, 0, 1, 2, 0], formula: "1 3 5 b7", notes: ["E", "G#", "B", "D"], desc: "E dominant 7" },
  Em7: { name: "Em7", quality: "minor", frets: [0, 0, 0, 2, 2, 0], fingers: [0, 0, 0, 2, 1, 0], formula: "1 b3 5 b7", notes: ["E", "G", "B", "D"], desc: "E minor 7" },
  Bdim: { name: "Bdim", quality: "diminished", frets: [-1, -1, 0, 1, 0, 1], fingers: [0, 0, 0, 2, 1, 3], formula: "1 b3 b5", notes: ["B", "D", "F"], desc: "B diminished" },
  Asus2: { name: "Asus2", quality: "sus", frets: [0, 0, 2, 2, 0, -1], fingers: [0, 0, 1, 2, 0, 0], formula: "1 2 5", notes: ["A", "B", "E"], desc: "A suspended 2nd" },
  Dsus4: { name: "Dsus4", quality: "sus", frets: [-1, -1, 0, 2, 3, -1], fingers: [0, 0, 0, 1, 3, 0], formula: "1 4 5", notes: ["D", "G", "A"], desc: "D suspended 4th" },
  Caug: { name: "Caug", quality: "augmented", frets: [-1, -1, 2, 1, 1, 0], fingers: [0, 0, 3, 1, 2, 0], formula: "1 3 #5", notes: ["C", "E", "G#"], desc: "C augmented" },
  Cadd9: { name: "Cadd9", quality: "major", frets: [0, 3, 0, 2, 3, -1], fingers: [0, 3, 0, 1, 4, 0], formula: "1 3 5 9", notes: ["C", "E", "G", "D"], desc: "C add 9" },
  Gm: { name: "Gm", quality: "minor", frets: [3, 3, 3, 5, 5, 3], fingers: [1, 1, 1, 3, 4, 1], formula: "1 b3 5", notes: ["G", "A#", "D"], desc: "G minor barre (III)" },
  Bb: { name: "Bb", quality: "major", frets: [1, 3, 3, 3, 1, -1], fingers: [1, 2, 3, 4, 1, 0], formula: "1 3 5", notes: ["A#", "D", "F"], desc: "B♭ major barre" },
  Cm: { name: "Cm", quality: "minor", frets: [3, 4, 5, 5, 3, -1], fingers: [1, 2, 4, 3, 1, 0], formula: "1 b3 5", notes: ["C", "D#", "G"], desc: "C minor barre (III)" },
  Eb: { name: "Eb", quality: "major", frets: [6, 8, 8, 8, 6, -1], fingers: [1, 4, 3, 2, 1, 0], formula: "1 3 5", notes: ["D#", "G", "A#"], desc: "E♭ major barre" },
  "F#": { name: "F#", quality: "major", frets: [2, 2, 3, 4, 4, 2], fingers: [1, 1, 2, 3, 4, 1], formula: "1 3 5", notes: ["F#", "A#", "C#"], desc: "F# major barre" },
};

/* ── Chord diagram SVG ───────────────────────────────────────── */
export function ChordDiagram({ frets, fingers, quality, size = "md" }: {
  frets: number[]; fingers?: number[]; quality: ChordQuality; size?: "sm" | "md" | "lg";
}) {
  const strings = 6;
  const fretCount = 4;
  const positives = frets.filter(v => v > 0);
  const baseFret = positives.length ? Math.min(...positives) : 1;
  const scale = size === "lg" ? 1.7 : size === "sm" ? 1 : 1.15;
  const W = 78 * scale, H = 82 * scale;
  const padL = 15 * scale, padR = 9 * scale, padT = 20 * scale, padB = 9 * scale;
  const gW = W - padL - padR;
  const gH = H - padT - padB;
  const sw = gW / (strings - 1);
  const fh = gH / fretCount;
  const qColor = QUALITY_COLORS[quality];
  const dot = sw * 0.33;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      {baseFret === 1 && <rect x={padL} y={padT - 3 * scale} width={gW} height={3 * scale} fill="var(--fl-ink)" rx={1} />}
      {baseFret > 1 && <text x={padL - 11 * scale} y={padT + fh * 0.6} fontSize={7 * scale} fill="var(--fl-ink-3)" fontFamily="var(--fl-font-mono)">{baseFret}fr</text>}
      {Array.from({ length: fretCount + 1 }).map((_, i) => (
        <line key={`f${i}`} x1={padL} x2={padL + gW} y1={padT + i * fh} y2={padT + i * fh} stroke="var(--fl-line)" strokeWidth={(i === 0 ? 0.5 : 0.8) * scale} />
      ))}
      {Array.from({ length: strings }).map((_, i) => (
        <line key={`s${i}`} x1={padL + i * sw} x2={padL + i * sw} y1={padT} y2={padT + gH} stroke="var(--fl-line)" strokeWidth={0.7 * scale} />
      ))}
      {frets.map((fret, i) => {
        if (fret <= 0) return null;
        const relFret = fret - baseFret + 1;
        return (
          <g key={`d${i}`}>
            <circle cx={padL + (5 - i) * sw} cy={padT + (relFret - 0.5) * fh} r={dot} fill={qColor} />
            {fingers && fingers[i] > 0 && (
              <text x={padL + (5 - i) * sw} y={padT + (relFret - 0.5) * fh + 3 * scale} textAnchor="middle" fontSize={7 * scale} fill="rgba(0,0,0,0.72)" fontFamily="var(--fl-font-mono)" fontWeight="bold">{fingers[i]}</text>
            )}
          </g>
        );
      })}
      {frets.map((fret, i) => (
        fret === -1 ? <text key={`m${i}`} x={padL + (5 - i) * sw} y={padT - 7 * scale} textAnchor="middle" fontSize={8 * scale} fill="var(--fl-ink-4)" fontFamily="var(--fl-font-mono)">×</text> :
        fret === 0 ? <circle key={`o${i}`} cx={padL + (5 - i) * sw} cy={padT - 9 * scale} r={3 * scale} fill="none" stroke="var(--fl-ink-3)" strokeWidth={0.8 * scale} /> : null
      ))}
    </svg>
  );
}

/* ── Standardized chord card ─────────────────────────────────── */
export function ChordCard({ chord, selected, onClick }: {
  chord: ChordDef; selected?: boolean; onClick?: () => void;
}) {
  const qColor = QUALITY_COLORS[chord.quality];
  return (
    <button
      onClick={onClick}
      style={{
        boxSizing: "border-box", height: 190, width: "100%", textAlign: "left",
        display: "flex", flexDirection: "column", alignItems: "stretch",
        background: "var(--fl-surface)",
        border: `1.5px solid ${selected ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
        borderRadius: "var(--fl-r-xl)", padding: "14px 14px 12px", cursor: "pointer",
        fontFamily: "var(--fl-font)", transition: "border-color 140ms, box-shadow 140ms, transform 140ms",
        boxShadow: selected ? "var(--fl-shadow-raised)" : "none",
      }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = "var(--fl-accent-line)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = "var(--fl-line)"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--fl-ink)", fontFamily: "var(--fl-font-mono)" }}>{chord.name}</span>
        <span style={{ fontSize: "0.58rem", fontWeight: 700, color: "#fff", background: qColor, padding: "2px 7px", borderRadius: "var(--fl-r-pill)", letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{QUALITY_LABELS[chord.quality]}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ChordDiagram frets={chord.frets} fingers={chord.fingers} quality={chord.quality} size="md" />
      </div>
      <div style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)", textAlign: "center", fontFamily: "var(--fl-font-mono)" }}>{chord.formula}</div>
    </button>
  );
}

/* ── Full chord overview detail ──────────────────────────────── */
export function ChordDetail({ chord, sticky = true, onPractice }: {
  chord: ChordDef; sticky?: boolean; onPractice?: () => void;
}) {
  return (
    <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px", position: sticky ? "sticky" : "static", top: 20 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 2 }}>
        <div style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--fl-ink)", fontFamily: "var(--fl-font-mono)" }}>{chord.name}</div>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "#fff", background: QUALITY_COLORS[chord.quality], padding: "2px 8px", borderRadius: "var(--fl-r-pill)", letterSpacing: "0.04em", textTransform: "uppercase" }}>{QUALITY_LABELS[chord.quality]}</span>
      </div>
      <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)", marginBottom: 16 }}>{chord.desc}</div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, padding: "14px", background: "var(--fl-surface-sunk)", borderRadius: "var(--fl-r-lg)" }}>
        <ChordDiagram frets={chord.frets} fingers={chord.fingers} quality={chord.quality} size="lg" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
        {chord.notes.map((n, i) => (
          <span key={i} style={{ minWidth: 34, textAlign: "center", padding: "6px 8px", borderRadius: "var(--fl-r-md)", background: i === 0 ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)", border: `1px solid ${i === 0 ? "var(--fl-accent-line)" : "var(--fl-line)"}`, fontFamily: "var(--fl-font-mono)", fontSize: "0.8rem", fontWeight: 700, color: i === 0 ? "var(--fl-accent-ink)" : "var(--fl-ink)" }}>{n}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {[
          ["Formula", chord.formula],
          ["Quality", QUALITY_LABELS[chord.quality]],
          ["Fingers", chord.fingers.filter(f => f > 0).join(" ")],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--fl-line-soft)" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>{label}</span>
            <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.72rem", fontWeight: 700, color: "var(--fl-ink)" }}>{value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--fl-line-soft)" }}>
        <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 10 }}>Same notes on piano</div>
        <div style={{ overflowX: "auto" }}>
          <Piano highlightedNotes={chord.notes} rootNote={chord.notes[0]} octaves={1} startOctave={4} />
        </div>
      </div>
      {onPractice && (
        <button onClick={onPractice} style={{ marginTop: 16, width: "100%", padding: "10px", borderRadius: "var(--fl-r-md)", border: "1.5px solid var(--fl-accent-line)", background: "var(--fl-accent-softer)", color: "var(--fl-accent-ink)", fontFamily: "var(--fl-font)", fontSize: "var(--fl-t-small)", fontWeight: 700, cursor: "pointer" }}>Practice this chord →</button>
      )}
    </div>
  );
}
