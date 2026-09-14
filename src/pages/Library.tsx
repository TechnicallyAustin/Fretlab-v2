import { useState } from "react";
import { Fretboard, type Marker } from "../components/Fretboard";
import { ScaleTab } from "../components/ScaleTab";
import { Piano } from "../components/Piano";
import { SectionHeading, Eyebrow, LevelBadge } from "../components/ui";
import { Button } from "../components/controls";
import { CHORD_LIBRARY, QUALITY_LABELS, ChordCard, ChordDetail, type ChordDef, type ChordQuality } from "../components/ChordLibrary";

/* ── Types ─────────────────────────────────────────────────── */
type Tab = "chords" | "scales" | "songs";

/* ── Chord data (from shared library) ───────────────────────── */
const CHORD_ORDER = ["C", "Am", "G", "Em", "D", "F", "Dm", "E", "A", "Bm", "C7", "G7", "Bdim", "Asus2", "Dsus4", "Caug"];
const CHORDS: ChordDef[] = CHORD_ORDER.map(n => CHORD_LIBRARY[n]);

/* ── Scale data ──────────────────────────────────────────────── */
const SCALES = [
  {
    id: "major",
    name: "Major (Ionian)",
    formula: "W W H W W W H",
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    notes: ["C", "D", "E", "F", "G", "A", "B"],
    category: "Diatonic",
    use: "Foundation of Western music. Bright, happy sound.",
    markers: [
      { string: 6, fret: 8 }, { string: 6, fret: 10 }, { string: 5, fret: 7 },
      { string: 5, fret: 8 }, { string: 5, fret: 10 }, { string: 4, fret: 7 },
      { string: 4, fret: 9 }, { string: 4, fret: 10 },
    ],
  },
  {
    id: "natural-minor",
    name: "Natural Minor (Aeolian)",
    formula: "W H W W H W W",
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7"],
    notes: ["A", "B", "C", "D", "E", "F", "G"],
    category: "Diatonic",
    use: "Dark, melancholic. The basis for most rock and metal.",
    markers: [
      { string: 6, fret: 5 }, { string: 6, fret: 7 }, { string: 6, fret: 8 },
      { string: 5, fret: 5 }, { string: 5, fret: 7 }, { string: 4, fret: 5 },
      { string: 4, fret: 7 },
    ],
  },
  {
    id: "pentatonic-major",
    name: "Major Pentatonic",
    formula: "W W 1½ W 1½",
    degrees: ["1", "2", "3", "5", "6"],
    notes: ["G", "A", "B", "D", "E"],
    category: "Pentatonic",
    use: "Country, blues, rock leads. Very singable, forgiving.",
    markers: [
      { string: 6, fret: 3 }, { string: 6, fret: 5 }, { string: 5, fret: 3 },
      { string: 5, fret: 5 }, { string: 4, fret: 2 }, { string: 4, fret: 5 },
    ],
  },
  {
    id: "pentatonic-minor",
    name: "Minor Pentatonic",
    formula: "1½ W W 1½ W",
    degrees: ["1", "b3", "4", "5", "b7"],
    notes: ["A", "C", "D", "E", "G"],
    category: "Pentatonic",
    use: "The most used scale in blues, rock, and metal solos.",
    markers: [
      { string: 6, fret: 5 }, { string: 6, fret: 8 }, { string: 5, fret: 5 },
      { string: 5, fret: 7 }, { string: 4, fret: 5 }, { string: 4, fret: 7 },
    ],
  },
  {
    id: "blues",
    name: "Blues Scale",
    formula: "1½ W H H 1½ W",
    degrees: ["1", "b3", "4", "b5", "5", "b7"],
    notes: ["A", "C", "D", "Eb", "E", "G"],
    category: "Blues",
    use: "Minor pentatonic + blue note (b5). Raw, expressive.",
    markers: [
      { string: 6, fret: 5 }, { string: 6, fret: 8 }, { string: 5, fret: 5 },
      { string: 5, fret: 6 }, { string: 5, fret: 7 }, { string: 4, fret: 5 },
      { string: 4, fret: 7 },
    ],
  },
  {
    id: "dorian",
    name: "Dorian Mode",
    formula: "W H W W W H W",
    degrees: ["1", "2", "b3", "4", "5", "6", "b7"],
    notes: ["D", "E", "F", "G", "A", "B", "C"],
    category: "Modes",
    use: "Minor with a raised 6th. Jazz, Latin, and funk fusion.",
    markers: [
      { string: 6, fret: 10 }, { string: 6, fret: 12 }, { string: 5, fret: 10 },
      { string: 5, fret: 12 }, { string: 4, fret: 9 }, { string: 4, fret: 10 },
      { string: 4, fret: 12 },
    ],
  },
  {
    id: "mixolydian",
    name: "Mixolydian Mode",
    formula: "W W H W W H W",
    degrees: ["1", "2", "3", "4", "5", "6", "b7"],
    notes: ["G", "A", "B", "C", "D", "E", "F"],
    category: "Modes",
    use: "Major with b7. Classic rock, Hendrix, Clapton.",
    markers: [
      { string: 6, fret: 3 }, { string: 6, fret: 5 }, { string: 5, fret: 2 },
      { string: 5, fret: 3 }, { string: 5, fret: 5 }, { string: 4, fret: 2 },
      { string: 4, fret: 5 },
    ],
  },
  {
    id: "harmonic-minor",
    name: "Harmonic Minor",
    formula: "W H W W H 1½ H",
    degrees: ["1", "2", "b3", "4", "5", "b6", "7"],
    notes: ["A", "B", "C", "D", "E", "F", "G#"],
    category: "Minor Variants",
    use: "Classical and metal. The raised 7th creates tension.",
    markers: [
      { string: 6, fret: 5 }, { string: 6, fret: 7 }, { string: 6, fret: 8 },
      { string: 5, fret: 5 }, { string: 5, fret: 7 }, { string: 4, fret: 4 },
      { string: 4, fret: 5 }, { string: 4, fret: 7 },
    ],
  },
];

const SCALE_CATEGORIES = ["All", "Diatonic", "Pentatonic", "Blues", "Modes", "Minor Variants"];

/* ── Song data ───────────────────────────────────────────────── */
const SONGS = [
  { title: "Wish You Were Here", artist: "Pink Floyd", key: "G", genre: "Rock", difficulty: "intermediate" as const, hue: 140 },
  { title: "Nothing Else Matters", artist: "Metallica", key: "Em", genre: "Metal", difficulty: "intermediate" as const, hue: 0 },
  { title: "Blackbird", artist: "The Beatles", key: "G", genre: "Folk", difficulty: "advanced" as const, hue: 200 },
  { title: "Wonderwall", artist: "Oasis", key: "F#m", genre: "Rock", difficulty: "beginner" as const, hue: 40 },
  { title: "Hotel California", artist: "Eagles", key: "Bm", genre: "Rock", difficulty: "advanced" as const, hue: 289 },
  { title: "Smoke on the Water", artist: "Deep Purple", key: "G", genre: "Rock", difficulty: "beginner" as const, hue: 170 },
  { title: "Come as You Are", artist: "Nirvana", key: "F#m", genre: "Grunge", difficulty: "beginner" as const, hue: 230 },
  { title: "House of the Rising Sun", artist: "The Animals", key: "Am", genre: "Blues Rock", difficulty: "intermediate" as const, hue: 60 },
  { title: "Comfortably Numb", artist: "Pink Floyd", key: "Bm", genre: "Rock", difficulty: "advanced" as const, hue: 140 },
];

/* ── Fretboard markers builder ───────────────────────────────── */
// string: 1=high e, 6=low E (standard guitar convention)
// stringIndex: 0=high e (top), 5=low E (bottom) — matches Fretboard's orientation
function buildMarkers(positions: Array<{ string: number; fret: number }>): Marker[] {
  return positions.map(({ string, fret }, i) => ({
    stringIndex: string - 1,
    fret,
    label: "",
    tone: (i === 0 ? "root" : "scale") as Marker["tone"],
  }));
}

/* ── Page ──────────────────────────────────────────────────── */
export function Library() {
  const [activeTab, setActiveTab] = useState<Tab>("chords");
  const [selectedQuality, setSelectedQuality] = useState<"All" | ChordQuality>("All");
  const [selectedScaleCategory, setSelectedScaleCategory] = useState("All");
  const [selectedScale, setSelectedScale] = useState(SCALES[0]);
  const [selectedChord, setSelectedChord] = useState<ChordDef | null>(null);

  const filteredChords = selectedQuality === "All" ? CHORDS : CHORDS.filter(c => c.quality === selectedQuality);

  return (
    <div style={{ fontFamily: "var(--fl-font)", minHeight: "100%" }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ background: "var(--fl-dark)", padding: "28px 36px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 75% 50%, oklch(0.45 0.18 289 / 0.4) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <Eyebrow onDark>Reference library</Eyebrow>
          <h1 style={{ margin: "4px 0 6px", fontSize: "var(--fl-t-title)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>Library</h1>
          <p style={{ margin: "0 0 20px", fontSize: "var(--fl-t-small)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Chords, scales, and songs — your complete reference.</p>
          <div style={{ display: "flex", gap: 2 }}>
            {(["chords", "scales", "songs"] as Tab[]).map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{ padding: "8px 18px", border: "none", cursor: "pointer", fontFamily: "var(--fl-font)", fontSize: "var(--fl-t-small)", fontWeight: 600, borderRadius: "var(--fl-r-md) var(--fl-r-md) 0 0", background: activeTab === t ? "var(--fl-canvas)" : "transparent", color: activeTab === t ? "var(--fl-ink)" : "rgba(255,255,255,0.45)", textTransform: "capitalize", transition: "background 140ms, color 140ms" }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 36px 80px" }}>

        {/* ── Chords tab ─────────────────────────────────────── */}
        {activeTab === "chords" && (
          <div>
            {/* Quality filter */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
              {(["All", ...Object.keys(QUALITY_LABELS)] as Array<"All" | ChordQuality>).map(q => (
                <button key={q} onClick={() => setSelectedQuality(q)} style={{ padding: "6px 14px", borderRadius: "var(--fl-r-pill)", border: `1.5px solid ${selectedQuality === q ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: selectedQuality === q ? "var(--fl-accent-softer)" : "var(--fl-surface)", color: selectedQuality === q ? "var(--fl-accent-ink)" : "var(--fl-ink-3)", fontSize: "var(--fl-t-small)", fontWeight: 600, cursor: "pointer" }}>
                  {q === "All" ? "All" : QUALITY_LABELS[q]}
                </button>
              ))}
            </div>

            {/* Chord grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12, alignContent: "start" }}>
                {filteredChords.map(chord => (
                  <ChordCard
                    key={chord.name}
                    chord={chord}
                    selected={selectedChord?.name === chord.name}
                    onClick={() => setSelectedChord(selectedChord?.name === chord.name ? null : chord)}
                  />
                ))}
              </div>

              {/* Detail panel */}
              <div>
                {selectedChord ? (
                  <ChordDetail chord={selectedChord} onPractice={() => {}} />
                ) : (
                  <div style={{ background: "var(--fl-surface-sunk)", border: "1px dashed var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "40px 20px", textAlign: "center", color: "var(--fl-ink-4)", fontSize: "var(--fl-t-small)" }}>
                    Select a chord to see the full overview — diagram, notes, formula and piano voicing.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Scales tab ─────────────────────────────────────── */}
        {activeTab === "scales" && (
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 }}>
            {/* Scale list sidebar */}
            <div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {SCALE_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setSelectedScaleCategory(cat)} style={{ padding: "3px 8px", borderRadius: "var(--fl-r-pill)", border: `1px solid ${selectedScaleCategory === cat ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: selectedScaleCategory === cat ? "var(--fl-accent-softer)" : "transparent", color: selectedScaleCategory === cat ? "var(--fl-accent-ink)" : "var(--fl-ink-3)", fontSize: "0.66rem", fontWeight: 600, cursor: "pointer" }}>{cat}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {SCALES.filter(s => selectedScaleCategory === "All" || s.category === selectedScaleCategory).map(scale => {
                  const isSelected = selectedScale.id === scale.id;
                  return (
                    <button key={scale.id} onClick={() => setSelectedScale(scale)} style={{ boxSizing: "border-box", minHeight: 66, display: "flex", flexDirection: "column", justifyContent: "center", padding: "12px 14px", textAlign: "left", borderRadius: "var(--fl-r-lg)", border: `1.5px solid ${isSelected ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: isSelected ? "var(--fl-accent-softer)" : "var(--fl-surface)", cursor: "pointer", fontFamily: "var(--fl-font)", transition: "border-color 140ms, background 140ms" }}>
                      <div style={{ fontSize: "var(--fl-t-small)", fontWeight: 700, color: isSelected ? "var(--fl-accent-ink)" : "var(--fl-ink)", marginBottom: 3 }}>{scale.name}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>{scale.degrees.join(" · ")}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale detail */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)", padding: "24px 28px", overflow: "hidden", position: "relative" }}>
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 40%, oklch(0.45 0.18 289 / 0.35) 0%, transparent 55%)", pointerEvents: "none" }} />
                <div style={{ position: "relative" }}>
                  <Eyebrow onDark>{selectedScale.category}</Eyebrow>
                  <h2 style={{ margin: "4px 0 6px", fontSize: "var(--fl-t-section)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{selectedScale.name}</h2>
                  <p style={{ margin: "0 0 16px", fontSize: "var(--fl-t-small)", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: "52ch" }}>{selectedScale.use}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                    {selectedScale.notes.map((note, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? "var(--fl-accent)" : "rgba(255,255,255,0.08)", border: `1px solid ${i === 0 ? "var(--fl-accent)" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fl-font-mono)", fontWeight: 700, fontSize: "0.8rem", color: "#fff", marginBottom: 4 }}>{note}</div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--fl-font-mono)" }}>{selectedScale.degrees[i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Fretboard + Tab mirror */}
              <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <SectionHeading title="Scale on fretboard" />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <Fretboard markers={buildMarkers(selectedScale.markers)} frets={15} startFret={0} />
                </div>
                {/* Tab mirror — same markers, tab notation */}
                <div style={{ borderTop: "1px solid var(--fl-line-soft)", paddingTop: 18 }}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 12 }}>Tab notation</div>
                  <ScaleTab markers={buildMarkers(selectedScale.markers)} title="" />
                </div>
              </div>

              {/* Piano keyboard — same notes as scale */}
              <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: "var(--fl-t-small)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 2 }}>Piano — same notes</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--fl-ink-4)" }}>One linear octave showing scale tones</div>
                  </div>
                  <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.72rem", fontWeight: 600, color: "var(--fl-accent)", padding: "4px 10px", background: "var(--fl-accent-softer)", borderRadius: "var(--fl-r-pill)", border: "1px solid var(--fl-accent-line)" }}>
                    {selectedScale.notes.join(" · ")}
                  </span>
                </div>
                <Piano
                  highlightedNotes={selectedScale.notes}
                  rootNote={selectedScale.notes[0]}
                  octaves={2}
                  startOctave={3}
                />
              </div>

              {/* Formula + intervals */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "18px" }}>
                  <div style={{ fontSize: "var(--fl-t-label)", fontWeight: 700, color: "var(--fl-ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Formula (steps)</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedScale.formula.split(" ").map((step, i) => (
                      <span key={i} style={{ padding: "5px 10px", borderRadius: "var(--fl-r-md)", background: step === "H" ? "oklch(0.72 0.11 0 / 0.12)" : step === "W" ? "oklch(0.72 0.11 140 / 0.12)" : "oklch(0.72 0.11 60 / 0.12)", border: `1px solid ${step === "H" ? "oklch(0.72 0.11 0 / 0.3)" : step === "W" ? "oklch(0.72 0.11 140 / 0.3)" : "oklch(0.72 0.11 60 / 0.3)"}`, fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-small)", fontWeight: 700, color: "var(--fl-ink)" }}>{step}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: "0.7rem", color: "var(--fl-ink-4)" }}>W = whole step (2 frets) · H = half step (1 fret) · 1½ = 3 frets</div>
                </div>
                <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "18px" }}>
                  <div style={{ fontSize: "var(--fl-t-label)", fontWeight: 700, color: "var(--fl-ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Scale degrees</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedScale.degrees.map((deg, i) => (
                      <span key={i} style={{ padding: "5px 10px", borderRadius: "var(--fl-r-md)", background: i === 0 ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)", border: `1px solid ${i === 0 ? "var(--fl-accent-line)" : "var(--fl-line)"}`, fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-small)", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "var(--fl-accent-ink)" : "var(--fl-ink)" }}>{deg}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Songs tab ──────────────────────────────────────── */}
        {activeTab === "songs" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {SONGS.map((song, i) => (
                <div key={i} style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", overflow: "hidden", transition: "border-color 140ms" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--fl-accent-line)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--fl-line)")}>
                  {/* Color bar */}
                  <div style={{ height: 4, background: `oklch(0.72 0.11 ${song.hue})` }} />
                  <div style={{ padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 2 }}>{song.title}</div>
                        <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>{song.artist}</div>
                      </div>
                      <LevelBadge level={song.difficulty} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                      {[`Key: ${song.key}`, song.genre].map(tag => (
                        <span key={tag} style={{ padding: "3px 8px", borderRadius: "var(--fl-r-pill)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", fontSize: "0.68rem", fontWeight: 600, color: "var(--fl-ink-3)", fontFamily: "var(--fl-font-mono)" }}>{tag}</span>
                      ))}
                    </div>
                    <Button variant="outline" block>View tab →</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
