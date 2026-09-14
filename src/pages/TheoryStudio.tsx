import { useState } from "react";
import { CircleOfFifths } from "../components/CircleOfFifths";
import { Piano } from "../components/Piano";
import { Fretboard, type Marker } from "../components/Fretboard";
import { ScaleTab } from "../components/ScaleTab";
import { SegmentedControl, SelectField, Tag, Button } from "../components/controls";
import { DegreeChips } from "../components/practice";
import { Eyebrow, SectionHeading, LevelBadge } from "../components/ui";

/* ── Music theory data ──────────────────────────────────────── */
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const SCALE_INTERVALS: Record<string, { intervals: number[]; name: string; description: string; mood: string }> = {
  major: { intervals: [0, 2, 4, 5, 7, 9, 11], name: "Major (Ionian)", description: "The foundation of Western music. Used in pop, classical, country.", mood: "Bright, happy" },
  minor: { intervals: [0, 2, 3, 5, 7, 8, 10], name: "Natural Minor", description: "The parallel minor, used in rock, metal, and classical.", mood: "Dark, melancholic" },
  "harmonic-minor": { intervals: [0, 2, 3, 5, 7, 8, 11], name: "Harmonic Minor", description: "Natural minor with a raised 7th — creates strong dominant pull.", mood: "Exotic, tense" },
  "melodic-minor": { intervals: [0, 2, 3, 5, 7, 9, 11], name: "Melodic Minor", description: "Raised 6th and 7th ascending. Used in jazz and classical.", mood: "Sophisticated" },
  "pentatonic-major": { intervals: [0, 2, 4, 7, 9], name: "Major Pentatonic", description: "5-note scale — forgiving and singable. Country and folk staple.", mood: "Open, country" },
  "pentatonic-minor": { intervals: [0, 3, 5, 7, 10], name: "Minor Pentatonic", description: "The most important scale for rock and blues guitar soloing.", mood: "Blues, rock" },
  blues: { intervals: [0, 3, 5, 6, 7, 10], name: "Blues Scale", description: "Pentatonic minor + the ♭5 'blue note'. Raw and expressive.", mood: "Raw, expressive" },
  dorian: { intervals: [0, 2, 3, 5, 7, 9, 10], name: "Dorian Mode", description: "Minor with raised 6th. Santana, Miles Davis, and funk legends.", mood: "Funky, soulful" },
  phrygian: { intervals: [0, 1, 3, 5, 7, 8, 10], name: "Phrygian Mode", description: "Dark Spanish flavor. The ♭2 is its signature interval.", mood: "Spanish, dark" },
  lydian: { intervals: [0, 2, 4, 6, 7, 9, 11], name: "Lydian Mode", description: "Major with raised 4th. Dreamy and floating — film music favourite.", mood: "Dreamy, floating" },
  mixolydian: { intervals: [0, 2, 4, 5, 7, 9, 10], name: "Mixolydian Mode", description: "Major with ♭7. Classic rock — Hendrix, Clapton, Carlos Santana.", mood: "Rock, dominant" },
  locrian: { intervals: [0, 1, 3, 5, 6, 8, 10], name: "Locrian Mode", description: "The unstable mode. ♭2 and ♭5 make it extremely dissonant.", mood: "Unstable, dark" },
};

const INTERVALS_DATA = [
  { semitones: 0, name: "Unison", abbr: "P1", quality: "Perfect", vibe: "Same note — identical pitch" },
  { semitones: 1, name: "Minor 2nd", abbr: "m2", quality: "Minor", vibe: "Half step — very dissonant, leading" },
  { semitones: 2, name: "Major 2nd", abbr: "M2", quality: "Major", vibe: "Whole step — stepwise melody" },
  { semitones: 3, name: "Minor 3rd", abbr: "m3", quality: "Minor", vibe: "Minor chords — sad, dark coloring" },
  { semitones: 4, name: "Major 3rd", abbr: "M3", quality: "Major", vibe: "Major chords — bright, happy" },
  { semitones: 5, name: "Perfect 4th", abbr: "P4", quality: "Perfect", vibe: "Open, static — horn fifths" },
  { semitones: 6, name: "Tritone", abbr: "TT", quality: "Augmented", vibe: "Devil's interval — maximally tense" },
  { semitones: 7, name: "Perfect 5th", abbr: "P5", quality: "Perfect", vibe: "Power chord — open and stable" },
  { semitones: 8, name: "Minor 6th", abbr: "m6", quality: "Minor", vibe: "Tender, slightly dark coloring" },
  { semitones: 9, name: "Major 6th", abbr: "M6", quality: "Major", vibe: "Bright — added sweetness" },
  { semitones: 10, name: "Minor 7th", abbr: "m7", quality: "Minor", vibe: "Dominant, bluesy — wants to resolve" },
  { semitones: 11, name: "Major 7th", abbr: "M7", quality: "Major", vibe: "Jazzy, dreamy — half step from root" },
  { semitones: 12, name: "Octave", abbr: "P8", quality: "Perfect", vibe: "Same note, doubled pitch" },
];

/* Key → relative minor / parallel minor */
const KEY_FIFTHS_ORDER = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const KEY_RELATIVE_MINOR: Record<string, string> = {
  C: "Am", G: "Em", D: "Bm", A: "F#m", E: "C#m", B: "G#m",
  "F#": "D#m", Db: "Bbm", Ab: "Fm", Eb: "Cm", Bb: "Gm", F: "Dm",
};
const KEY_SHARPS_FLATS: Record<string, string> = {
  C: "0 ♯/♭", G: "1 ♯", D: "2 ♯", A: "3 ♯", E: "4 ♯", B: "5 ♯",
  "F#": "6 ♯", Db: "5 ♭", Ab: "4 ♭", Eb: "3 ♭", Bb: "2 ♭", F: "1 ♭",
};

const DIATONIC_CHORDS_C: Array<{ numeral: string; chord: string; quality: string }> = [
  { numeral: "I", chord: "C", quality: "major" },
  { numeral: "ii", chord: "Dm", quality: "minor" },
  { numeral: "iii", chord: "Em", quality: "minor" },
  { numeral: "IV", chord: "F", quality: "major" },
  { numeral: "V", chord: "G", quality: "major" },
  { numeral: "vi", chord: "Am", quality: "minor" },
  { numeral: "vii°", chord: "B°", quality: "dim" },
];

const PROGRESSIONS = [
  { name: "I – V – vi – IV", numerals: ["I", "V", "vi", "IV"], mood: "Pop anthem", eg: "C – G – Am – F" },
  { name: "I – IV – V", numerals: ["I", "IV", "V"], mood: "Rock / Blues", eg: "C – F – G" },
  { name: "ii – V – I", numerals: ["ii", "V", "I"], mood: "Jazz standard", eg: "Dm – G – C" },
  { name: "I – vi – IV – V", numerals: ["I", "vi", "IV", "V"], mood: "50s doo-wop", eg: "C – Am – F – G" },
  { name: "vi – IV – I – V", numerals: ["vi", "IV", "I", "V"], mood: "Minor pop", eg: "Am – F – C – G" },
  { name: "I – III – IV – iv", numerals: ["I", "III", "IV", "iv"], mood: "Andalusian", eg: "C – E – F – Fm" },
];

const LESSONS = [
  {
    id: "intervals", title: "Understanding Intervals", level: "beginner" as const, duration: "8 min",
    desc: "Intervals are the distance between two notes — the DNA of all melody and harmony. Learn every interval from unison to the octave by sound and by shape on the guitar.",
    topics: ["Perfect intervals", "Major and minor intervals", "Augmented and diminished", "Interval inversion", "Playing intervals on guitar"],
  },
  {
    id: "triads", title: "Triads & Chord Construction", level: "beginner" as const, duration: "12 min",
    desc: "Every chord is built from stacked intervals. Major, minor, augmented, and diminished triads each have a unique formula — understand them and you can build any chord in any key.",
    topics: ["Major triad (1 3 5)", "Minor triad (1 ♭3 5)", "Augmented (1 3 #5)", "Diminished (1 ♭3 ♭5)", "Triads across the neck"],
  },
  {
    id: "scales", title: "The Major Scale & its Modes", level: "beginner" as const, duration: "15 min",
    desc: "The major scale is the ruler of Western music. Every mode — Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian — is a rotation of its seven notes, each with its own unique color.",
    topics: ["Major scale formula", "All 7 modes", "Mode comparisons", "Modal interchange", "Playing modes on guitar"],
  },
  {
    id: "cof", title: "The Circle of Fifths", level: "intermediate" as const, duration: "15 min",
    desc: "Twelve keys arranged in a perfect logical circle. Master the circle and you instantly understand key signatures, chord relationships, modulation, and why certain chords work together.",
    topics: ["Key signatures", "Relative minors", "Neighbouring keys", "Modulation", "Applying to songwriting"],
  },
  {
    id: "diatonic", title: "Diatonic Harmony & Roman Numerals", level: "intermediate" as const, duration: "18 min",
    desc: "Roman numerals let you describe chord progressions in any key with one notation. Understand diatonic harmony and you can instantly analyse or transpose any song.",
    topics: ["Diatonic chords", "Roman numerals I–vii°", "Major key harmony", "Minor key harmony", "Borrowed chords"],
  },
  {
    id: "seventh-chords", title: "Seventh Chords", level: "intermediate" as const, duration: "14 min",
    desc: "Add a fourth note to any triad and you get a seventh chord — richer, more colorful, and indispensable in jazz, blues, and soul. Maj7, m7, dom7, m7♭5, and dim7 — all covered.",
    topics: ["Major 7th", "Minor 7th", "Dominant 7th", "Half-diminished m7♭5", "Fully-diminished dim7"],
  },
  {
    id: "progressions", title: "Chord Progressions & Cadences", level: "intermediate" as const, duration: "20 min",
    desc: "The ii–V–I, the I–V–vi–IV, the 12-bar blues — these progressions appear in thousands of songs because they work. Learn what makes them work harmonically.",
    topics: ["Authentic cadence V–I", "Plagal cadence IV–I", "Deceptive cadence V–vi", "Turnarounds", "12-bar blues"],
  },
  {
    id: "voice-leading", title: "Voice Leading", level: "advanced" as const, duration: "22 min",
    desc: "Voice leading is the art of moving between chords with the smallest possible motion. It's what separates mechanical chord playing from musical guitar. Bach, Coltrane, and EVH all used it.",
    topics: ["Common tones", "Step-wise motion", "Contrary motion", "Voice leading on guitar", "Inner voices"],
  },
  {
    id: "modal-interchange", title: "Modal Interchange & Borrowed Chords", level: "advanced" as const, duration: "25 min",
    desc: "Borrow chords from the parallel minor to add dramatic color to major key music. The ♭VII, ♭VI, and iv chord from minor appear in countless classic songs.",
    topics: ["Parallel vs relative minor", "Common borrowed chords", "♭VII chord", "iv chord (minor IV)", "Re-harmonization"],
  },
  {
    id: "secondary-dominants", title: "Secondary Dominants", level: "advanced" as const, duration: "20 min",
    desc: "Any chord can be preceded by its own dominant chord. This technique adds forward momentum and color, and is the secret behind countless key changes in jazz and pop.",
    topics: ["V/V (5 of 5)", "V/ii, V/vi, V/IV", "Resolving secondary dominants", "Applied dominants in jazz", "Guitar voicings"],
  },
];

/* ── Helpers ─────────────────────────────────────────────────── */
function buildScaleNotes(root: string, intervals: number[]): string[] {
  const rootIdx = NOTES.indexOf(root);
  return intervals.map(i => NOTES[(rootIdx + i) % 12]);
}

function buildFretboardMarkers(root: string, intervals: number[]): Marker[] {
  const openStrings = [4, 11, 7, 2, 9, 4]; // EADGBE as semitone indices
  const rootIdx = NOTES.indexOf(root);
  const markers: Marker[] = [];
  for (let si = 0; si < 6; si++) {
    for (let fret = 0; fret <= 12; fret++) {
      const note = (openStrings[si] + fret) % 12;
      const interval = (note - rootIdx + 12) % 12;
      if (intervals.includes(interval)) {
        markers.push({
          stringIndex: si,
          fret,
          tone: interval === 0 ? "root" : interval === 4 || interval === 3 ? "third" : interval === 7 ? "fifth" : "scale",
          label: NOTES[(rootIdx + interval) % 12],
          emphasis: interval === 0,
        });
      }
    }
  }
  return markers;
}

/* ── Neighbour row for CoF ───────────────────────────────────── */
function KeyInfoPanel({ selectedKey }: { selectedKey: string }) {
  const idx = KEY_FIFTHS_ORDER.indexOf(selectedKey);
  const prev = KEY_FIFTHS_ORDER[(idx - 1 + 12) % 12];
  const next = KEY_FIFTHS_ORDER[(idx + 1) % 12];
  const relMinor = KEY_RELATIVE_MINOR[selectedKey] ?? "?";
  const sharpsFlats = KEY_SHARPS_FLATS[selectedKey] ?? "?";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Key details */}
      <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px 24px" }}>
        <div style={{ fontSize: "var(--fl-t-label)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 8 }}>Selected key</div>
        <div style={{ fontSize: "2.4rem", fontWeight: 900, letterSpacing: "-0.04em", color: "var(--fl-accent-ink)", marginBottom: 4 }}>{selectedKey} Major</div>
        <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-3)", marginBottom: 18 }}>Relative minor: {relMinor} · {sharpsFlats}</div>
        <DegreeChips degrees={DIATONIC_CHORDS_C.map(d => ({ numeral: d.numeral, chord: d.chord }))} />
      </div>

      {/* Neighbouring keys */}
      <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "18px 20px" }}>
        <div style={{ fontSize: "var(--fl-t-label)", fontWeight: 700, color: "var(--fl-ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Neighbouring keys</div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { key: prev, label: "← one 5th down", sub: "share 6 notes" },
            { key: selectedKey, label: "current", sub: "", current: true },
            { key: next, label: "one 5th up →", sub: "share 6 notes" },
          ].map(item => (
            <div key={item.key} style={{ flex: 1, padding: "12px 10px", borderRadius: "var(--fl-r-lg)", background: item.current ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)", border: `1px solid ${item.current ? "var(--fl-accent-line)" : "var(--fl-line)"}`, textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: item.current ? "var(--fl-accent-ink)" : "var(--fl-ink)", fontFamily: "var(--fl-font-mono)", marginBottom: 2 }}>{item.key}</div>
              <div style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)", lineHeight: 1.3 }}>{item.label}</div>
              {item.sub && <div style={{ fontSize: "0.6rem", color: "var(--fl-ink-4)" }}>{item.sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Common progressions */}
      <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "18px 20px" }}>
        <div style={{ fontSize: "var(--fl-t-label)", fontWeight: 700, color: "var(--fl-ink-3)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Common progressions</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {PROGRESSIONS.map((prog, i) => (
            <div key={prog.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < PROGRESSIONS.length - 1 ? "1px solid var(--fl-line-soft)" : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--fl-ink)", fontFamily: "var(--fl-font-mono)" }}>{prog.name}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)", marginTop: 1 }}>{prog.eg} · {prog.mood}</div>
              </div>
              <Button variant="quiet" size="sm">Play</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Interval Diagram ────────────────────────────────────────── */
function IntervalDiagram({ highlighted = -1 }: { highlighted?: number }) {
  const W = 540; const H = 56; const cellW = W / 13;
  return (
    <svg width={W} height={H + 24} viewBox={`0 0 ${W} ${H + 24}`} style={{ display: "block", maxWidth: "100%" }}>
      {Array.from({ length: 13 }, (_, i) => {
        const iv = INTERVALS_DATA[i];
        const isHL = i === highlighted;
        const qColor = i === 6 ? "#e87c5a" : i === 0 || i === 5 || i === 7 || i === 12 ? "var(--fl-accent)" : "var(--fl-key)";
        return (
          <g key={i}>
            <rect x={i * cellW + 1} y={0} width={cellW - 2} height={H} rx={4}
              fill={isHL ? qColor : "var(--fl-surface-sunk)"} stroke={isHL ? qColor : "var(--fl-line)"} strokeWidth={1} />
            <text x={i * cellW + cellW / 2} y={18} textAnchor="middle" fontSize={9}
              fontFamily="var(--fl-font-mono)" fontWeight={700} fill={isHL ? "#fff" : "var(--fl-accent)"}>{iv.abbr}</text>
            <text x={i * cellW + cellW / 2} y={32} textAnchor="middle" fontSize={7.5}
              fontFamily="var(--fl-font)" fill={isHL ? "rgba(255,255,255,0.8)" : "var(--fl-ink-3)"}>{iv.semitones}</text>
            <text x={i * cellW + cellW / 2} y={48} textAnchor="middle" fontSize={7}
              fontFamily="var(--fl-font)" fill={isHL ? "rgba(255,255,255,0.6)" : "var(--fl-ink-4)"}>st</text>
            <text x={i * cellW + cellW / 2} y={H + 16} textAnchor="middle" fontSize={7.5}
              fontFamily="var(--fl-font-mono)" fill="var(--fl-ink-4)">{iv.name.split(" ").slice(-1)[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Concept Card ─────────────────────────────────────────────── */
interface ConceptCardProps { title: string; body: string; example?: string; }
function ConceptCard({ title, body, example }: ConceptCardProps) {
  return (
    <div style={{ borderRadius: "var(--fl-r-lg)", border: "1px solid var(--fl-accent-line)", background: "var(--fl-accent-softer)", padding: "16px 20px" }}>
      <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-accent-ink)", marginBottom: 6 }}>Key concept</div>
      <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--fl-ink-2)" }}>{body}</div>
      {example && (
        <div style={{ marginTop: 12, padding: "9px 12px", borderRadius: "var(--fl-r-md)", background: "var(--fl-surface)", border: "1px solid var(--fl-accent-line)", fontFamily: "var(--fl-font-mono)", fontSize: "0.78rem", color: "var(--fl-accent-ink)" }}>
          Ex: {example}
        </div>
      )}
    </div>
  );
}

/* ── Check for Understanding quiz ─────────────────────────────── */
interface QuizQuestion { q: string; choices: string[]; correct: number; explain: string; }
function CheckForUnderstanding({ questions }: { questions: QuizQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[current].correct) setScore(s => s + 1);
  }

  function next() {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  }

  function restart() { setCurrent(0); setSelected(null); setScore(0); setDone(false); }

  if (done) {
    return (
      <div style={{ borderRadius: "var(--fl-r-lg)", border: "1px solid var(--fl-line)", background: "var(--fl-surface)", padding: "24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: 8 }}>{score === questions.length ? "🏆" : score >= questions.length / 2 ? "✓" : "📖"}</div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 4 }}>{score} / {questions.length} correct</div>
        <div style={{ fontSize: "0.8rem", color: "var(--fl-ink-4)", marginBottom: 16 }}>
          {score === questions.length ? "Perfect — you nailed it!" : score >= questions.length / 2 ? "Good — review the concepts you missed." : "Keep studying — try again after reviewing the material."}
        </div>
        <button onClick={restart} style={{ padding: "8px 18px", borderRadius: "var(--fl-r-md)", border: "none", background: "var(--fl-accent)", color: "#fff", fontFamily: "var(--fl-font)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Try again</button>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div style={{ borderRadius: "var(--fl-r-lg)", border: "1px solid var(--fl-line)", background: "var(--fl-surface)", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)" }}>Check for understanding</div>
        <div style={{ fontSize: "0.7rem", color: "var(--fl-ink-4)" }}>{current + 1} / {questions.length}</div>
      </div>
      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 14, lineHeight: 1.5 }}>{q.q}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {q.choices.map((c, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          let bg = "var(--fl-surface-sunk)";
          let borderColor = "var(--fl-line)";
          let color = "var(--fl-ink)";
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(63,168,122,0.12)"; borderColor = "#3fa87a"; color = "#3fa87a"; }
            else if (isSelected) { bg = "rgba(232,99,74,0.1)"; borderColor = "#e8634a"; color = "#e8634a"; }
          }
          return (
            <button key={i} onClick={() => choose(i)} style={{ padding: "10px 14px", borderRadius: "var(--fl-r-md)", border: `1.5px solid ${borderColor}`, background: bg, color, textAlign: "left", fontFamily: "var(--fl-font)", fontSize: "0.82rem", cursor: selected === null ? "pointer" : "default", transition: "all 120ms" }}>
              {String.fromCharCode(65 + i)}. {c}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div style={{ marginBottom: 12, padding: "10px 14px", borderRadius: "var(--fl-r-md)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", fontSize: "0.78rem", color: "var(--fl-ink-3)", lineHeight: 1.6 }}>
          {q.explain}
        </div>
      )}
      {selected !== null && (
        <button onClick={next} style={{ padding: "8px 16px", borderRadius: "var(--fl-r-md)", border: "none", background: "var(--fl-accent)", color: "#fff", fontFamily: "var(--fl-font)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
          {current + 1 >= questions.length ? "Finish" : "Next →"}
        </button>
      )}
    </div>
  );
}

/* ── Lesson content ──────────────────────────────────────────── */
const LESSON_CONTENT: Record<string, { concepts: ConceptCardProps[]; intervals?: number[]; workedExample: string; quiz: QuizQuestion[] }> = {
  intervals: {
    concepts: [
      { title: "An interval is a distance", body: "Count semitones (half steps) between two notes. That number is the interval. From C to E is 4 semitones — a Major 3rd. Every melody, chord, and scale is built from intervals.", example: "C→D=2 st (M2), C→G=7 st (P5)" },
      { title: "Quality names the interval type", body: "Perfect intervals (P1, P4, P5, P8) cannot be major or minor. All others are major or minor — then augmented or diminished when altered by one semitone. Learn these distinctions and you can name any interval by ear.", example: "M3 raised → A3; m3 lowered → d3" },
      { title: "Guitar strings are mostly P4 apart", body: "Every adjacent string pair is a Perfect 4th (5 frets) apart except G to B — a Major 3rd (4 frets). This means any shape you know repeats up 5 frets on the next string, shifted by 1 fret at the G-B boundary.", example: "E to A = P4 (5 frets); G to B = M3 (4 frets)" },
    ],
    intervals: [0, 2, 4, 7, 12],
    workedExample: "Starting on A (fret 5, low E), count up 7 frets to reach E — a Perfect 5th. That's the power chord interval. The same 7 frets gives you P5 anywhere on the neck except crossing the G-B string pair where you need 8 frets.",
    quiz: [
      { q: "How many semitones is a Perfect 5th?", choices: ["5", "7", "9", "6"], correct: 1, explain: "P5 = 7 semitones. It's the power chord interval, and the engine of the circle of fifths." },
      { q: "What is the interval from C to F?", choices: ["Major 3rd", "Perfect 4th", "Minor 7th", "Tritone"], correct: 1, explain: "C→F = 5 semitones = Perfect 4th." },
      { q: "Which interval has maximum dissonance?", choices: ["Perfect 5th", "Major 7th", "Tritone", "Minor 2nd"], correct: 2, explain: "The Tritone (6 st) divides the octave perfectly in half and creates the most tension of any diatonic interval." },
      { q: "Adjacent guitar strings are mostly a __ apart", choices: ["Major 2nd", "Major 3rd", "Perfect 4th", "Perfect 5th"], correct: 2, explain: "Almost all adjacent strings are a Perfect 4th (5 frets) apart. The G-B pair is the exception — it's a Major 3rd (4 frets)." },
    ],
  },
  triads: {
    concepts: [
      { title: "A triad is two stacked thirds", body: "Root + third + fifth. The quality depends entirely on which type of third is stacked. Major third (4 st) on bottom and minor third (3 st) on top = major triad. Reverse the order and you get minor.", example: "C + E (M3) + G (m3) = C major triad" },
      { title: "Four triad qualities", body: "Major (M3 + m3), Minor (m3 + M3), Augmented (M3 + M3), Diminished (m3 + m3). Each has a unique sound fingerprint. Major sounds bright, minor sounds melancholic, augmented sounds dreamy/unresolved, diminished sounds tense.", example: "Cm: C + Eb + G; Cdim: C + Eb + Gb" },
      { title: "Inversions change voicing, not quality", body: "A triad in root position has the root on the bottom. First inversion has the 3rd on the bottom. Second inversion has the 5th on the bottom. The chord name stays the same — only the bass note changes. Guitarists use inversions constantly without realizing it.", example: "C major root: C-E-G; 1st inv: E-G-C; 2nd inv: G-C-E" },
    ],
    workedExample: "Build Am: count 3 st up from A to get C (minor 3rd), then 4 st up from C to E (major 3rd). Together that's 7 st — A to E = P5. A-C-E on guitar: x02210. Notice the open strings (E, A) double the root and 5th, making it ring beautifully.",
    quiz: [
      { q: "What intervals make a major triad?", choices: ["m3 + M3", "M3 + m3", "M3 + M3", "m3 + m3"], correct: 1, explain: "Major triad = root + M3 (4 st) + P5 (7 st total). The bottom third is major, top is minor." },
      { q: "A diminished triad is built from:", choices: ["Two major thirds", "Major then minor third", "Minor then major third", "Two minor thirds"], correct: 3, explain: "Diminished = m3 + m3. Both thirds are minor, giving it its characteristic instability." },
      { q: "What note is the 5th of a G major triad?", choices: ["B", "C", "D", "F#"], correct: 2, explain: "G major = G–B–D. The 5th is D (7 semitones above G)." },
      { q: "Which triad sounds 'dreamy' or 'floating'?", choices: ["Major", "Minor", "Augmented", "Diminished"], correct: 2, explain: "Augmented triads (M3 + M3) sound unresolved and floating because neither interval suggests a clear root, creating ambiguity." },
    ],
  },
  scales: {
    concepts: [
      { title: "The major scale formula", body: "W W H W W W H (whole-whole-half pattern). This interval sequence sounds the same on any root — that's why one formula works in all 12 keys. The two half steps always fall between scale degrees 3–4 and 7–8.", example: "C major: C D E F G A B C" },
      { title: "Modes are rotations", body: "Start the major scale on any degree and play to its octave — that's a mode. Same notes, different home base, radically different sound. Dorian (2nd degree) sounds jazzy and soulful. Mixolydian (5th degree) sounds bluesy and dominant.", example: "A Dorian = C major starting on A" },
      { title: "The pentatonic shortcut", body: "Remove scale degrees 4 and 7 from the major scale and you get the 5-note major pentatonic. It's the basis of most rock, blues, and country soloing because every note sounds safe — there are no half-step collisions. Minor pentatonic removes 2nd and 6th from natural minor.", example: "A minor pentatonic: A C D E G (box 1: frets 5-8)" },
    ],
    workedExample: "Play all white keys from C to C — that's Ionian (major). Play all white keys from A to A — that's Aeolian (natural minor). Same seven notes, completely different feel. The home note (tonal center) changes everything. Apply this on guitar: C major box starts at fret 8 on the low E; A minor box starts at fret 5.",
    quiz: [
      { q: "The major scale formula is:", choices: ["W H W W H W W", "W W H W W W H", "H W W W H W W", "W W W H W W H"], correct: 1, explain: "W W H W W W H — whole whole half whole whole whole half. The two half steps are between scale degrees 3–4 and 7–8." },
      { q: "Dorian mode starts on scale degree:", choices: ["1", "2", "4", "5"], correct: 1, explain: "Dorian is the 2nd mode of the major scale. In C major, D Dorian starts on D." },
      { q: "What makes Mixolydian different from major?", choices: ["Flat 3rd", "Flat 6th", "Flat 7th", "Raised 4th"], correct: 2, explain: "Mixolydian = major scale with a ♭7. This is what makes classic rock and blues dominant seventh chords work." },
      { q: "Minor pentatonic omits which two scale degrees from natural minor?", choices: ["1st and 5th", "3rd and 7th", "2nd and 6th", "4th and 7th"], correct: 2, explain: "Minor pentatonic removes the 2nd and 6th from the natural minor scale, leaving 5 notes: 1 ♭3 4 5 ♭7." },
    ],
  },
  cof: {
    concepts: [
      { title: "Keys a 5th apart share 6 notes", body: "Move one step clockwise on the circle and you add one sharp (or remove one flat). C major has 0 sharps; G major has 1 (F#); D major has 2 (F#, C#). This is why neighboring keys feel 'close' — they differ by just one note.", example: "C→G: add F#. G→D: add C#." },
      { title: "Every major key has a relative minor", body: "The relative minor uses the exact same notes but starts on the 6th degree. C major's relative minor is A minor — both use C D E F G A B. They share the same key signature but have a different tonal center and emotional quality.", example: "C major ↔ A minor; G major ↔ E minor" },
      { title: "The circle predicts chord relationships", body: "Chords built on notes that are close on the circle sound smooth together. The I–IV–V progression (C–F–G in C major) forms a tight cluster of three adjacent keys. Jazz and pop writers use this to plan key changes that feel inevitable.", example: "In C: I=C, IV=F (counter-clockwise), V=G (clockwise)" },
    ],
    intervals: [0, 7, 5],
    workedExample: "To find key signatures fast: clockwise = sharps. The first sharp is always F#. Go clockwise again and add C#, then G#, D#, A#, E#, B# — that's the order of sharps. Counter-clockwise = flats in reverse order. Memorize FCGDAEB (Father Charles Goes Down And Ends Battle).",
    quiz: [
      { q: "Moving clockwise on the circle adds:", choices: ["One flat", "One sharp", "One minor chord", "Two half steps"], correct: 1, explain: "Each clockwise step adds one sharp to the key signature. C (0#) → G (1#) → D (2#) → A (3#)..." },
      { q: "What is the relative minor of F major?", choices: ["D minor", "A minor", "B minor", "E minor"], correct: 0, explain: "Count up to the 6th degree of F major: F G A Bb C D — the 6th is D. So F major's relative minor is D minor." },
      { q: "How many sharps does E major have?", choices: ["2", "3", "4", "5"], correct: 2, explain: "E major has 4 sharps: F#, C#, G#, D#. Use FCGDAEB — the first 4 notes of the sharp order." },
      { q: "The IV chord in the key of G is:", choices: ["C", "D", "A", "F"], correct: 0, explain: "G major: G A B C D E F#. The 4th degree is C, so the IV chord is C major." },
    ],
  },
  diatonic: {
    concepts: [
      { title: "Seven diatonic chords from one scale", body: "Build a triad on each note of the major scale using only notes from that scale. You get a fixed pattern of qualities: I ii iii IV V vi vii°. This pattern is the same in every major key — just transpose the root.", example: "C major: Cmaj Dm Em Fmaj Gmaj Am Bdim" },
      { title: "Roman numerals describe function", body: "Uppercase = major, lowercase = minor. The I chord is home (tonic). The V chord creates tension that resolves to I (dominant function). The IV chord moves away from home (subdominant). These three functions drive 90% of Western music.", example: "I=tonic, IV=subdominant, V=dominant" },
      { title: "The ii–V–I is the most powerful progression", body: "In jazz and pop, ii–V–I is everywhere. The ii chord (minor) sets up the V chord (dominant), which has maximum pull to I (tonic). It's the gravitational engine of harmony. In C: Dm7 → G7 → Cmaj7.", example: "In G: Am7 → D7 → Gmaj7" },
    ],
    workedExample: "In the key of A major: A B C# D E F# G#. Build triads — A(I) Bm(ii) C#m(iii) D(IV) E(V) F#m(vi) G#dim(vii°). The chord progression Am–F–C–G in the key of C is actually vi–IV–I–V. Knowing Roman numerals lets you identify it — and instantly transpose to any key.",
    quiz: [
      { q: "The V chord in C major is:", choices: ["Fmaj", "Am", "Gmaj", "Em"], correct: 2, explain: "C major scale degrees: C D E F G A B. The 5th degree is G, and its triad (G B D) is major — so the V chord is G major." },
      { q: "Which numeral represents a minor chord in major key harmony?", choices: ["I", "IV", "V", "ii"], correct: 3, explain: "In major keys, the diatonic minor chords are ii, iii, and vi. The ii, IV, and V chords are the most commonly used." },
      { q: "The strongest resolution in Western music is:", choices: ["IV → I", "vi → IV", "V → I", "ii → iii"], correct: 2, explain: "V → I is the authentic cadence — the V chord's dominant function creates maximum tension that resolves to the tonic I." },
      { q: "The vi chord is called the relative minor because:", choices: ["It's the saddest chord", "It shares all notes with the I chord's key", "It always follows the V chord", "It has a minor 7th"], correct: 1, explain: "The vi chord is built from the same notes as the I chord's key signature — it IS the tonic of the relative minor key." },
    ],
  },
  "seventh-chords": {
    concepts: [
      { title: "Add a 7th above the 5th", body: "A seventh chord is a triad with one more third stacked on top. The 7th above the root creates new color. There are four common 7th chord types: major 7th (Maj7), dominant 7th (7), minor 7th (m7), and half-diminished (m7♭5).", example: "Cmaj7: C E G B; C7: C E G Bb; Cm7: C Eb G Bb" },
      { title: "The dominant 7th creates tension", body: "The V7 chord (dominant seventh) is the most tension-filled chord in common practice. It contains a tritone between the 3rd and ♭7 (e.g., B and F in G7), which desperately wants to resolve to the tonic. This tritone resolution is the engine of jazz harmony.", example: "G7 → C: B resolves up to C, F resolves down to E" },
      { title: "Major 7th sounds lush, minor 7th sounds smooth", body: "Maj7 chords (1 3 5 7) have a sophisticated, dreamy quality used heavily in bossa nova, R&B, and jazz ballads. Minor 7th chords (1 ♭3 5 ♭7) are smoother than plain minor triads and form the backbone of jazz's ii–V–I movement.", example: "Cmaj7: airy/dreamy; Cm7: dark but smooth" },
    ],
    workedExample: "Build G7 (dominant 7th): G (root) + B (M3, 4 st) + D (P5, 7 st) + F (m7, 10 st). The tritone is B→F (6 st). On guitar, G7 open chord: 320001. The F on the high E string is the ♭7 that creates the tension — pull it down mentally to E and you hear it wanting to resolve to C major.",
    quiz: [
      { q: "A major 7th chord (Maj7) contains which interval above the root?", choices: ["Minor 7th (10 st)", "Diminished 7th (9 st)", "Major 7th (11 st)", "Perfect 7th (12 st)"], correct: 2, explain: "Major 7th = 11 semitones. Cmaj7 = C E G B, where B is 11 semitones above C." },
      { q: "What creates tension in a dominant 7th chord?", choices: ["The root note", "A tritone between the 3rd and ♭7", "The perfect 5th", "The major 3rd"], correct: 1, explain: "The tritone (6 st) between the chord's 3rd and ♭7 is maximally dissonant and wants to resolve — that's the G7's pull to C." },
      { q: "The ii7 chord in C major is:", choices: ["Cmaj7", "Dm7", "Em7", "Fmaj7"], correct: 1, explain: "The 2nd degree of C major is D, and its diatonic 7th chord uses notes from C major: D F A C = Dm7." },
      { q: "Which 7th chord type is built on the V (5th) degree?", choices: ["Maj7", "m7", "Dominant 7th", "Half-diminished"], correct: 2, explain: "The V chord in any major key is always a dominant 7th (major triad + minor 7th). In C: G7 = G B D F." },
    ],
  },
  progressions: {
    concepts: [
      { title: "Progressions create narrative", body: "A chord progression is a journey — tension and resolution over time. The I chord is home. Moving to IV or vi creates departure. The V chord creates maximum tension and the listener anticipates return to I. Even listeners with no music training feel this.", example: "I–V–vi–IV: C–G–Am–F ('the pop progression')" },
      { title: "The 12-bar blues formula", body: "The 12-bar blues is the most important harmonic cycle in American music. I I I I / IV IV I I / V IV I V. In A: A7 A7 A7 A7 / D7 D7 A7 A7 / E7 D7 A7 E7. All three chords are dominant 7ths — the unresolved tension is intentional.", example: "In A: bars 1-4: A7; bars 5-6: D7; bar 7-8: A7; bar 9: E7; bar 10: D7; bars 11-12: A7 E7" },
      { title: "Authentic vs plagal cadence", body: "A cadence is a progression used as punctuation. The authentic cadence (V→I) is the strongest ending — a full stop. The plagal cadence (IV→I) is softer — the 'Amen' cadence. The deceptive cadence (V→vi) tricks the ear by resolving to the relative minor instead of tonic.", example: "Authentic: G→C; Plagal: F→C; Deceptive: G→Am" },
    ],
    workedExample: "The I–V–vi–IV progression (C–G–Am–F in C major) powers thousands of songs: Let It Be, Someone Like You, No Woman No Cry, With or Without You. The secret: it starts on tonic (stable), moves through the dominant (tension), drops to the relative minor (emotional), and lifts back to IV before returning. It's a complete emotional arc in four chords.",
    quiz: [
      { q: "The 12-bar blues uses which three chord functions?", choices: ["I, ii, V", "I, IV, V", "I, IV, vii°", "ii, V, I"], correct: 1, explain: "Classic 12-bar blues uses the I, IV, and V chords — all as dominant 7ths (e.g., A7, D7, E7 in A)." },
      { q: "A deceptive cadence resolves V to:", choices: ["I", "IV", "vi", "ii"], correct: 2, explain: "The deceptive cadence goes V→vi instead of the expected V→I, creating surprise by landing on the relative minor." },
      { q: "What Roman numerals are in the 'pop progression'?", choices: ["I–IV–V–I", "I–V–vi–IV", "ii–V–I–IV", "vi–IV–I–V"], correct: 1, explain: "I–V–vi–IV (e.g., C–G–Am–F) is the 'axis progression' found in hundreds of pop songs from the Beatles to modern pop." },
      { q: "Which cadence is called the 'Amen cadence'?", choices: ["Authentic (V→I)", "Deceptive (V→vi)", "Plagal (IV→I)", "Half cadence (I→V)"], correct: 2, explain: "The plagal cadence (IV→I) is nicknamed the 'Amen cadence' because it ends many hymns — softer and less final than the authentic V→I." },
    ],
  },
  "voice-leading": {
    concepts: [
      { title: "Move each voice by the smallest interval", body: "Voice leading is the art of choosing which note each finger plays as chords change. The goal: move each voice (soprano, alto, tenor, bass) by the smallest possible interval. Smooth voice leading makes chord changes sound connected rather than jumpy.", example: "C→Am: keep G and E in place, move C down to A" },
      { title: "Preserve common tones", body: "When two chords share a note, keep that note in the same voice. C major and A minor share E and G — hold those still and only move C down to A. This creates the smoothest possible transition. Classical composers called this 'oblique motion'.", example: "C(C E G) → Am(A E G): only C moves" },
      { title: "Guide tones are 3rds and 7ths", body: "In jazz, the 3rd and 7th of each chord are called guide tones because they define the chord quality and create voice-leading pull. When resolving V7→I, the 7th of V steps down by half-step to the 3rd of I. This half-step resolution is the core of jazz harmony.", example: "G7→Cmaj7: F (7th of G7) → E (3rd of Cmaj7)" },
    ],
    workedExample: "Play a C major open chord, then switch to Am. Instead of lifting all fingers, notice that the E on the 1st string and the G on the 3rd string don't need to move. Only the C (2nd fret, B string) needs to change — lift it and let the open A string ring. That's voice leading: three voices stay still, one moves by step.",
    quiz: [
      { q: "Voice leading is primarily concerned with:", choices: ["Chord rhythm patterns", "How individual notes move between chords", "Strumming techniques", "Picking speed"], correct: 1, explain: "Voice leading focuses on the motion of individual pitch lines (voices) as they move from chord to chord." },
      { q: "When C major moves to F major, which note is a common tone?", choices: ["C", "E", "G", "None"], correct: 0, explain: "C major (C E G) and F major (F A C) share the note C. Keeping C in the same voice creates smooth voice leading." },
      { q: "In a V7→I resolution, the ♭7 of the V chord resolves:", choices: ["Up by a whole step", "Up by a half step", "Down by a half step", "Down by a whole step"], correct: 2, explain: "The ♭7 of the dominant chord (e.g., F in G7) resolves down by a half step to the 3rd of the tonic (E in Cmaj7)." },
      { q: "The term 'guide tones' refers to:", choices: ["Root and 5th of a chord", "3rd and 7th of a chord", "Root and octave", "2nd and 6th"], correct: 1, explain: "Guide tones are the 3rd and 7th — they define chord quality and create the strongest voice-leading pull in jazz harmony." },
    ],
  },
  "modal-interchange": {
    concepts: [
      { title: "Borrowing from the parallel minor", body: "Modal interchange means temporarily borrowing chords from a parallel key (same root, different mode). The most common: borrowing from the parallel minor while in a major key. C major borrows from C minor (C D Eb F G Ab Bb). The ♭VII, ♭VI, and iv chords are the most popular loans.", example: "In C major: borrow Bb (♭VII from C minor)" },
      { title: "The ♭VII chord is everywhere in rock", body: "The ♭VII chord borrowed from the parallel minor appears in countless rock anthems: Sweet Home Alabama (D–C–G in G major uses C as ♭VII from G minor), Hey Jude, Back in Black, Knockin' on Heaven's Door. It has a bittersweet, anthemic quality that pure major can't provide.", example: "In G major: the ♭VII is F major (borrowed from G minor)" },
      { title: "The iv chord adds drama", body: "The minor iv chord (borrowed from parallel minor) creates a haunting, cinematic effect when used in a major key. In C major, the iv is Fm (F Ab C). The ♭3 of the iv chord (Ab in Fm) is the borrowed note — it clashes gently with the major key, creating bittersweet tension.", example: "C major: F → Fm (iv) → C: dark turn on the Fm" },
    ],
    workedExample: "Listen to 'The Beatles – Hey Jude': it's in F major, but uses Eb (the ♭VII from F minor) in the na-na-na chorus. The borrowed Eb gives the song its anthemic, lifting quality. On guitar in F: try Fmaj → Eb → Bb → Fmaj. The Eb is the borrowed chord — it's not in F major but sounds completely natural because our ears accept it as a color loan.",
    quiz: [
      { q: "Modal interchange borrows chords from:", choices: ["The relative minor", "A parallel key (same root)", "A neighbouring key on the circle", "The dominant key"], correct: 1, explain: "Modal interchange borrows from the parallel mode — same root note, different scale. C major borrows from C minor (not A minor)." },
      { q: "The ♭VII chord in D major is:", choices: ["C major", "C# major", "E major", "A major"], correct: 0, explain: "D major's ♭VII is built on the flattened 7th degree. D major's 7th is C#; flatten it to C and build a major triad: C major." },
      { q: "The iv chord in C major (borrowed from C minor) is:", choices: ["F major", "F minor", "G minor", "D minor"], correct: 1, explain: "The iv chord is a minor chord. In C major, the 4th degree is F. The iv borrowed from C minor is F minor (F Ab C)." },
      { q: "Which Beatles song famously uses the ♭VII chord?", choices: ["Yesterday", "Let It Be", "Hey Jude", "Blackbird"], correct: 2, explain: "Hey Jude (F major) uses Eb as the ♭VII borrowed chord in the 'na-na-na' section, giving it its anthemic sing-along quality." },
    ],
  },
  "secondary-dominants": {
    concepts: [
      { title: "Any chord can have its own V7", body: "A secondary dominant is a dominant 7th chord that temporarily tonicizes a non-tonic chord. V7/ii means 'five of two' — the dominant of the ii chord. In C major, ii is Dm, and its V7 is A7 (since A7 → Dm parallels G7 → C). Inserting A7 before Dm makes Dm feel like a temporary home.", example: "In C: A7 → Dm (V7/ii → ii)" },
      { title: "Listen for the chromatic note", body: "Secondary dominants always contain a note foreign to the key — that chromatic note is the giveaway. In C major, A7 contains C# (the major 3rd of A) which is not in C major. That raised note creates a half-step pull to D, making the ear hear a temporary modulation without actually leaving C major.", example: "C major: A7 has C# (not in key) → pulls to D" },
      { title: "V/V is the most common secondary dominant", body: "The most used secondary dominant is V/V — the dominant of the dominant. In C major, the V chord is G, so V/V is D major (or D7). The progression D7 → G7 → C is a ii–V–I decorated with a secondary dominant. You hear this constantly in classical music, jazz standards, and even country.", example: "In C: D7 (V/V) → G7 (V) → C (I)" },
    ],
    workedExample: "In the key of G major, try this progression: G – E7 – Am – D7 – G. The E7 is V7/vi (it's the dominant of Am, the vi chord). The D7 is your standard V7. Notice how E7 makes the Am feel earned and inevitable — the C# in E7 pulls up to D (in Am), creating motion. This technique is everywhere in jazz, gospel, and country.",
    quiz: [
      { q: "A secondary dominant is always built as a:", choices: ["Major triad", "Minor 7th chord", "Dominant 7th chord", "Diminished chord"], correct: 2, explain: "Secondary dominants are always dominant 7th chords (major triad + minor 7th) built on the 5th of a non-tonic target chord." },
      { q: "V/V in the key of C major is:", choices: ["G7", "A7", "D7", "F7"], correct: 2, explain: "The V chord of C is G. The V of G is D. So V/V in C major is D major (or D7)." },
      { q: "What makes a secondary dominant recognizable?", choices: ["It's louder", "It contains a chromatic note not in the key", "It always follows the I chord", "It uses an open string"], correct: 1, explain: "Secondary dominants contain a note foreign to the home key — the raised 3rd creates a half-step pull to the target chord's root." },
      { q: "In G major, E7 functions as:", choices: ["V/I", "V/ii", "V/vi", "V/IV"], correct: 2, explain: "In G major, the vi chord is Em. E7 is the dominant 7th of Em — so it functions as V7/vi, temporarily pulling toward the vi chord." },
    ],
  },
};

/* ── Lesson reader ─────────────────────────────────────────────── */
function LessonReader({ lessonId, onBack }: { lessonId: string; onBack: () => void }) {
  const lesson = LESSONS.find(l => l.id === lessonId);
  const content = LESSON_CONTENT[lessonId];
  const [hlInterval, setHlInterval] = useState(-1);

  if (!lesson) return null;

  return (
    <div style={{ maxWidth: 740, margin: "0 auto" }}>
      {/* Back */}
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", padding: 0, marginBottom: 20, cursor: "pointer", color: "var(--fl-ink-4)", fontSize: "0.8rem" }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Back to lessons
      </button>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <LevelBadge level={lesson.level} />
          <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>{lesson.duration}</span>
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: "var(--fl-t-title)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--fl-ink)" }}>{lesson.title}</h1>
        <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--fl-ink-3)", lineHeight: 1.7 }}>{lesson.desc}</p>
      </div>

      {/* Topics */}
      <div style={{ marginBottom: 24, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {lesson.topics.map(t => (
          <span key={t} style={{ padding: "3px 10px", borderRadius: "var(--fl-r-pill)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", fontSize: "0.7rem", color: "var(--fl-ink-3)" }}>{t}</span>
        ))}
      </div>

      {content ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Concept cards */}
          {content.concepts.map((c, i) => <ConceptCard key={i} {...c} />)}

          {/* Interval diagram */}
          {content.intervals && (
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "18px 20px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 12 }}>Key intervals in this lesson</div>
              <div style={{ overflowX: "auto" }}>
                <IntervalDiagram highlighted={hlInterval} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                {content.intervals.map(iv => {
                  const ivd = INTERVALS_DATA[iv];
                  return (
                    <button key={iv} onClick={() => setHlInterval(iv === hlInterval ? -1 : iv)}
                      style={{ padding: "4px 10px", borderRadius: "var(--fl-r-pill)", border: `1.5px solid ${hlInterval === iv ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: hlInterval === iv ? "var(--fl-accent-softer)" : "transparent", color: hlInterval === iv ? "var(--fl-accent-ink)" : "var(--fl-ink-3)", fontSize: "0.72rem", fontWeight: 600, fontFamily: "var(--fl-font-mono)", cursor: "pointer" }}>
                      {ivd.abbr} — {ivd.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Worked example */}
          <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "18px 20px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 10 }}>Worked example</div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.75, color: "var(--fl-ink-2)", borderLeft: "3px solid var(--fl-accent)", paddingLeft: 14 }}>
              {content.workedExample}
            </div>
          </div>

          {/* Quiz */}
          <CheckForUnderstanding questions={content.quiz} />
        </div>
      ) : (
        <div style={{ padding: "40px 24px", textAlign: "center", color: "var(--fl-ink-4)", fontSize: "0.85rem", background: "var(--fl-surface)", borderRadius: "var(--fl-r-xl)", border: "1px solid var(--fl-line)" }}>
          Full lesson content coming soon. Topics covered: {lesson.topics.join(", ")}.
        </div>
      )}
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export function TheoryStudio() {
  const [view, setView] = useState<"circle" | "scales" | "intervals" | "lessons">("circle");
  const [selectedKey, setSelectedKey] = useState("C");
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);
  const [selectedScale, setSelectedScale] = useState("major");
  const [rootNote, setRootNote] = useState("A");
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [lessonFilter, setLessonFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");
  const [readingLesson, setReadingLesson] = useState<string | null>(null);

  const scaleInfo = SCALE_INTERVALS[selectedScale];
  const scaleNotes = buildScaleNotes(rootNote, scaleInfo?.intervals ?? []);
  const fretMarkers = buildFretboardMarkers(rootNote, scaleInfo?.intervals ?? []);

  const filteredLessons = lessonFilter === "all" ? LESSONS : LESSONS.filter(l => l.level === lessonFilter);

  return (
    <div style={{ fontFamily: "var(--fl-font)", minHeight: "100%" }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{ background: "var(--fl-dark)", padding: "26px 36px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, oklch(0.45 0.18 289 / 0.4) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <Eyebrow onDark>Music theory</Eyebrow>
          <h1 style={{ margin: "4px 0 6px", fontSize: "var(--fl-t-title)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>Theory Studio</h1>
          <p style={{ margin: "0 0 20px", fontSize: "var(--fl-t-small)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>Circle of fifths, scale explorer, intervals, and structured lessons.</p>
          <div style={{ display: "flex", gap: 2 }}>
            {(["circle", "scales", "intervals", "lessons"] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "8px 18px", border: "none", cursor: "pointer", fontFamily: "var(--fl-font)", fontSize: "var(--fl-t-small)", fontWeight: 600, borderRadius: "var(--fl-r-md) var(--fl-r-md) 0 0", background: view === v ? "var(--fl-canvas)" : "transparent", color: view === v ? "var(--fl-ink)" : "rgba(255,255,255,0.45)", textTransform: "capitalize", transition: "background 140ms, color 140ms" }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 36px 80px" }}>

        {/* ── Circle of Fifths ─────────────────────────────── */}
        {view === "circle" && (
          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 32, alignItems: "start" }}>
            <div>
              <div style={{ marginBottom: 12 }}>
                <CircleOfFifths
                  activeIndex={selectedKeyIndex}
                  mode="major"
                  onSelect={(i, name) => {
                    setSelectedKeyIndex(i);
                    setSelectedKey(KEY_FIFTHS_ORDER[i] ?? name);
                  }}
                  size={348}
                />
              </div>
              <div style={{ padding: "12px 14px", borderRadius: "var(--fl-r-md)", background: "var(--fl-surface)", border: "1px solid var(--fl-line)", fontSize: "0.72rem", color: "var(--fl-ink-4)", lineHeight: 1.6 }}>
                Click any key segment to select it. Adjacent keys share 6 of 7 notes — the more notes in common, the more harmonically compatible.
              </div>
            </div>
            <KeyInfoPanel selectedKey={selectedKey} />
          </div>
        )}

        {/* ── Scale Explorer ───────────────────────────────── */}
        {view === "scales" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Controls */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div style={{ width: 130 }}>
                <SelectField label="Root note" value={rootNote} onChange={setRootNote} options={NOTES.map(n => ({ value: n, label: n }))} />
              </div>
              <div style={{ width: 240 }}>
                <SelectField label="Scale / Mode" value={selectedScale} onChange={setSelectedScale} options={Object.entries(SCALE_INTERVALS).map(([k, v]) => ({ value: k, label: v.name }))} />
              </div>
              <div style={{ padding: "6px 12px", borderRadius: "var(--fl-r-md)", background: "var(--fl-accent-softer)", border: "1px solid var(--fl-accent-line)", fontSize: "var(--fl-t-small)", color: "var(--fl-accent-ink)", fontWeight: 600 }}>
                {scaleInfo?.mood}
              </div>
            </div>

            {/* Scale identity card */}
            <div style={{ background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 40%, oklch(0.45 0.18 289 / 0.35) 0%, transparent 55%)", pointerEvents: "none" }} />
              <div style={{ position: "relative" }}>
                <Eyebrow onDark>{scaleInfo?.mood}</Eyebrow>
                <h2 style={{ margin: "4px 0 6px", fontSize: "var(--fl-t-section)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>{rootNote} {scaleInfo?.name}</h2>
                <p style={{ margin: "0 0 18px", fontSize: "var(--fl-t-small)", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: "60ch" }}>{scaleInfo?.description}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {scaleNotes.map((note, i) => {
                    const deg = scaleInfo?.intervals[i] ?? 0;
                    const degLabels = ["R", "2", "♭3", "3", "4", "♭5", "5", "♭6", "6", "♭7", "7", ""];
                    return (
                      <div key={note} style={{ textAlign: "center" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: deg === 0 ? "var(--fl-accent)" : "rgba(255,255,255,0.08)", border: `1px solid ${deg === 0 ? "var(--fl-accent)" : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fl-font-mono)", fontWeight: 700, fontSize: "0.8rem", color: "#fff", marginBottom: 5 }}>{note}</div>
                        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--fl-font-mono)" }}>{degLabels[deg]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Fretboard + Tab mirror */}
            <div style={{ background: "var(--fl-dark)", borderRadius: "var(--fl-r-xl)", padding: "24px 28px" }}>
              <div style={{ fontSize: "var(--fl-t-label)", color: "rgba(255,255,255,0.4)", marginBottom: 16, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {rootNote} {scaleInfo?.name} — Full Neck
              </div>
              <Fretboard fromFret={0} toFret={12} markers={fretMarkers} />
              <div style={{ marginTop: 14, display: "flex", gap: 16, marginBottom: 22 }}>
                {[
                  { color: "var(--fl-accent)", label: "Root note" },
                  { color: "var(--fl-key-soft)", label: "3rd / 5th" },
                  { color: "rgba(255,255,255,0.3)", label: "Scale tones" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
              {/* Tab mirror */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, background: "var(--fl-surface)", borderRadius: "var(--fl-r-lg)", padding: "18px 20px", marginTop: 4 }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 12 }}>Tab notation mirror</div>
                <ScaleTab markers={fretMarkers} />
              </div>
            </div>

            {/* Piano mirror */}
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "var(--fl-t-small)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 2 }}>Piano Mirror</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>Scale highlighted across the keyboard</div>
                </div>
                <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-small)", fontWeight: 600, color: "var(--fl-accent)", padding: "4px 10px", background: "var(--fl-accent-softer)", borderRadius: "var(--fl-r-pill)", border: "1px solid var(--fl-accent-line)" }}>{scaleNotes.join(" · ")}</span>
              </div>
              <Piano highlightedNotes={scaleNotes} rootNote={rootNote} octaves={2} startOctave={3} />
            </div>

            {/* Mode comparison quick table */}
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "20px 24px" }}>
              <SectionHeading title="Mode comparison (relative to major)" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginTop: 10 }}>
                {["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"].map((mode, i) => {
                  const isActive = selectedScale === ["major", "dorian", "phrygian", "lydian", "mixolydian", "minor", "locrian"][i];
                  return (
                    <div key={mode} onClick={() => setSelectedScale(["major", "dorian", "phrygian", "lydian", "mixolydian", "minor", "locrian"][i])}
                      style={{ padding: "10px 8px", borderRadius: "var(--fl-r-md)", background: isActive ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)", border: `1.5px solid ${isActive ? "var(--fl-accent-line)" : "var(--fl-line)"}`, cursor: "pointer", textAlign: "center", transition: "border-color 140ms" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: isActive ? "var(--fl-accent-ink)" : "var(--fl-ink)", marginBottom: 2 }}>{mode}</div>
                      <div style={{ fontSize: "0.58rem", fontFamily: "var(--fl-font-mono)", color: "var(--fl-ink-4)" }}>{["I", "ii", "iii", "IV", "V", "vi", "vii°"][i]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Intervals table ──────────────────────────────── */}
        {view === "intervals" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <SectionHeading title="Intervals reference" />
              <p style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-3)", marginTop: 4, lineHeight: 1.6, maxWidth: "60ch" }}>
                An interval is the distance between two notes measured in semitones. Every chord, scale, and melody is made from intervals stacked on top of each other.
              </p>
            </div>
            <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", overflow: "hidden", marginBottom: 20 }}>
              {/* Header */}
              <div style={{ display: "grid", gridTemplateColumns: "52px 60px 1fr 110px 2fr", padding: "10px 16px", background: "var(--fl-surface-sunk)", borderBottom: "1px solid var(--fl-line)" }}>
                {["Semi", "Abbr", "Name", "Quality", "Character"].map(col => (
                  <div key={col} style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--fl-ink-4)", textTransform: "uppercase" }}>{col}</div>
                ))}
              </div>
              {INTERVALS_DATA.map((interval, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "52px 60px 1fr 110px 2fr", padding: "11px 16px", borderBottom: i < INTERVALS_DATA.length - 1 ? "1px solid var(--fl-line-soft)" : "none", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.82rem", color: "var(--fl-ink-4)" }}>{interval.semitones}</span>
                  <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.82rem", fontWeight: 700, color: "var(--fl-accent)" }}>{interval.abbr}</span>
                  <span style={{ fontSize: "0.85rem", color: "var(--fl-ink)" }}>{interval.name}</span>
                  <span>
                    <span style={{
                      padding: "2px 9px", borderRadius: "var(--fl-r-pill)", fontSize: "0.68rem", fontWeight: 600,
                      background: interval.quality === "Perfect" ? "oklch(0.72 0.11 140 / 0.12)" : interval.quality === "Major" ? "var(--fl-accent-softer)" : interval.quality === "Minor" ? "var(--fl-surface-sunk)" : "oklch(0.72 0.11 0 / 0.1)",
                      color: interval.quality === "Perfect" ? "oklch(0.45 0.11 140)" : interval.quality === "Major" ? "var(--fl-accent-ink)" : interval.quality === "Minor" ? "var(--fl-ink-2)" : "oklch(0.5 0.15 20)",
                      border: "1px solid transparent",
                    }}>
                      {interval.quality}
                    </span>
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--fl-ink-3)" }}>{interval.vibe}</span>
                </div>
              ))}
            </div>

            {/* Interval quality legend */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { quality: "Perfect", color: "oklch(0.45 0.11 140)", bg: "oklch(0.72 0.11 140 / 0.1)", desc: "Unison, 4th, 5th, Octave — stable, resonant" },
                { quality: "Major", color: "var(--fl-accent-ink)", bg: "var(--fl-accent-softer)", desc: "2nd, 3rd, 6th, 7th — bright, assertive" },
                { quality: "Minor", color: "var(--fl-ink-2)", bg: "var(--fl-surface-sunk)", desc: "2nd, 3rd, 6th, 7th — darker, softer versions" },
                { quality: "Augmented/Dim", color: "oklch(0.5 0.15 20)", bg: "oklch(0.72 0.11 0 / 0.08)", desc: "Altered — dissonant, colorful, tense" },
              ].map(item => (
                <div key={item.quality} style={{ padding: "14px 16px", borderRadius: "var(--fl-r-lg)", background: item.bg, border: "1px solid var(--fl-line)" }}>
                  <div style={{ fontSize: "var(--fl-t-small)", fontWeight: 700, color: item.color, marginBottom: 4 }}>{item.quality}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-3)", lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Lessons ─────────────────────────────────────── */}
        {view === "lessons" && (
          readingLesson ? (
            <LessonReader lessonId={readingLesson} onBack={() => setReadingLesson(null)} />
          ) : (
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {(["all", "beginner", "intermediate", "advanced"] as const).map(f => (
                <button key={f} onClick={() => setLessonFilter(f)} style={{ padding: "6px 14px", borderRadius: "var(--fl-r-pill)", border: `1.5px solid ${lessonFilter === f ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: lessonFilter === f ? "var(--fl-accent-softer)" : "var(--fl-surface)", color: lessonFilter === f ? "var(--fl-accent-ink)" : "var(--fl-ink-3)", fontSize: "var(--fl-t-small)", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{f}</button>
              ))}
              <span style={{ marginLeft: "auto", fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)", display: "flex", alignItems: "center" }}>{filteredLessons.length} lessons</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredLessons.map(lesson => {
                const isOpen = openLesson === lesson.id;
                const hasContent = !!LESSON_CONTENT[lesson.id];
                return (
                  <div key={lesson.id} style={{ background: "var(--fl-surface)", border: `1.5px solid ${isOpen ? "var(--fl-accent-line)" : "var(--fl-line)"}`, borderRadius: "var(--fl-r-xl)", overflow: "hidden", boxShadow: isOpen ? "var(--fl-shadow-raised)" : "none", transition: "border-color 160ms, box-shadow 160ms" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", cursor: "pointer" }} onClick={() => setOpenLesson(isOpen ? null : lesson.id)}>
                      <div style={{ width: 40, height: 40, borderRadius: "var(--fl-r-md)", background: isOpen ? "var(--fl-accent)" : "var(--fl-accent-softer)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 160ms" }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <rect x="3" y="3" width="12" height="12" rx="2" stroke={isOpen ? "#fff" : "var(--fl-accent)"} strokeWidth="1.3" />
                          <path d="M6 7H12M6 10H10" stroke={isOpen ? "#fff" : "var(--fl-accent)"} strokeWidth="1.3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 600, color: "var(--fl-ink)", marginBottom: 5 }}>{lesson.title}</div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <LevelBadge level={lesson.level} />
                          <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>{lesson.duration}</span>
                          {hasContent && <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: "var(--fl-r-pill)", background: "rgba(63,168,122,0.12)", color: "#3fa87a", border: "1px solid rgba(63,168,122,0.2)" }}>Full lesson</span>}
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: "var(--fl-ink-4)", transform: isOpen ? "rotate(180deg)" : "", transition: "transform 200ms", flexShrink: 0 }}>
                        <path d="M3 5.5L8 10.5L13 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 22px 22px" }}>
                        <div style={{ height: 1, background: "var(--fl-line-soft)", marginBottom: 16 }} />
                        <p style={{ margin: "0 0 16px", fontSize: "var(--fl-t-small)", color: "var(--fl-ink-2)", lineHeight: 1.7 }}>{lesson.desc}</p>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--fl-ink-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Topics covered</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {lesson.topics.map(t => (
                              <span key={t} style={{ padding: "3px 10px", borderRadius: "var(--fl-r-pill)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", fontSize: "0.72rem", color: "var(--fl-ink-3)" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Button variant="primary" onClick={() => setReadingLesson(lesson.id)}>▶ Start lesson</Button>
                          <Button variant="outline">Save for later</Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )
        )}
      </div>
    </div>
  );
}
