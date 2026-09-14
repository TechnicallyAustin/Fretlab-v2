import { useCallback, useEffect, useRef, useState } from "react";

/* ── Types ──────────────────────────────────────────────────── */
export type Technique = "normal" | "h" | "p" | "/" | "\\" | "b" | "~" | "pm";
export type Duration = "w" | "h" | "q" | "e" | "s";

export interface Note {
  id: string;
  string: number;    // 1 (high e) – 6 (low E)
  fret: number;
  duration: Duration;
  technique: Technique;
  beat: number;      // 1-based position within measure (can be fractional)
}

export interface Measure {
  id: string;
  timeNum: number;
  timeDen: number;
  notes: Note[];
}

/* ── Constants ──────────────────────────────────────────────── */
const STRING_LABELS = ["e", "B", "G", "D", "A", "E"];  // index 0 = string 1 = high e
const DURATION_BEATS: Record<Duration, number> = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25 };
const TECHNIQUE_LABEL: Record<Technique, string> = {
  normal: "—", h: "h", p: "p", "/": "/", "\\": "\\", b: "b", "~": "~", pm: "p.m.",
};
const TECHNIQUE_TITLE: Record<Technique, string> = {
  normal: "Normal", h: "Hammer-on", p: "Pull-off",
  "/": "Slide up", "\\": "Slide down", b: "Bend", "~": "Vibrato", pm: "Palm mute",
};

/* ── Staff geometry ──────────────────────────────────────────── */
const STR_H = 18;           // px between string lines
const STAFF_H = STR_H * 5;  // 6 lines = 5 gaps
const MEAS_W = 200;         // px per measure (4 beats)
const LEFT_PAD = 44;        // space for string labels
const RIGHT_PAD = 20;

function stringY(s: number): number { return (s - 1) * STR_H; }  // s 1-6

/* ── ASCII export ─────────────────────────────────────────────── */
export function measuresToAsciiTab(measures: Measure[]): string {
  const COLS = 4;
  const allNotes = measures.flatMap(m => m.notes);
  if (allNotes.length === 0) return STRING_LABELS.map(l => `${l}|--`).join("\n");

  // One column per beat position
  const beatPositions = Array.from(new Set(allNotes.map(n => n.beat))).sort((a, b) => a - b);

  const lines: string[][] = STRING_LABELS.map(l => [`${l}|`]);
  for (const beat of beatPositions) {
    for (let si = 0; si < 6; si++) {
      const s = si + 1;
      const note = allNotes.find(n => n.beat === beat && n.string === s);
      lines[si].push(note ? String(note.fret) : "-");
      lines[si].push("-");
    }
  }
  lines.forEach(l => l.push("|"));
  return lines.map(l => l.join("")).join("\n");
}

/* ── uid ─────────────────────────────────────────────────────── */
let _uid = 0;
function uid() { return `n${++_uid}`; }
function mid() { return `m${++_uid}`; }

/* ── Default measures ─────────────────────────────────────────── */
function defaultMeasures(): Measure[] {
  return [
    { id: mid(), timeNum: 4, timeDen: 4, notes: [] },
    { id: mid(), timeNum: 4, timeDen: 4, notes: [] },
    { id: mid(), timeNum: 4, timeDen: 4, notes: [] },
    { id: mid(), timeNum: 4, timeDen: 4, notes: [] },
  ];
}

/* ── TabStaff Component ──────────────────────────────────────── */
interface TabStaffProps {
  initialMeasures?: Measure[];
  readOnly?: boolean;
}

export function TabStaff({ initialMeasures, readOnly = false }: TabStaffProps) {
  const [measures, setMeasures] = useState<Measure[]>(initialMeasures ?? defaultMeasures());
  const [selectedTechnique, setSelectedTechnique] = useState<Technique>("normal");
  const [selectedDuration, setSelectedDuration] = useState<Duration>("q");
  const [bpm, setBpm] = useState(80);
  const [playing, setPlaying] = useState(false);
  const [playBeat, setPlayBeat] = useState(0); // global beat for playhead
  const [copied, setCopied] = useState(false);
  const [pendingEntry, setPendingEntry] = useState<{ mIdx: number; stringNum: number; beat: number } | null>(null);
  const [pendingFret, setPendingFret] = useState("");
  const playRef = useRef<number | null>(null);

  /* ── Transport ── */
  const totalBeats = measures.reduce((s, m) => s + m.timeNum, 0);

  const startPlay = useCallback(() => {
    setPlaying(true);
    setPlayBeat(0);
    const interval = (60 / bpm) * 0.25 * 1000; // 16th note tick
    playRef.current = window.setInterval(() => {
      setPlayBeat(b => {
        const next = b + 0.25;
        if (next > totalBeats) { stopPlay(); return 0; }
        return next;
      });
    }, interval);
  }, [bpm, totalBeats]);

  function stopPlay() {
    if (playRef.current) { clearInterval(playRef.current); playRef.current = null; }
    setPlaying(false);
    setPlayBeat(0);
  }

  useEffect(() => () => stopPlay(), []);

  /* ── Note entry ── */
  function handleStaffClick(e: React.MouseEvent<SVGSVGElement>, mIdx: number) {
    if (readOnly) return;
    const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    const localX = e.clientX - rect.left - LEFT_PAD;
    const localY = e.clientY - rect.top;
    const m = measures[mIdx];
    const beatsPerPx = m.timeNum / MEAS_W;
    const beat = Math.max(1, Math.round((localX * beatsPerPx) / 0.25 + 1) * 0.25);
    const stringNum = Math.round(localY / STR_H) + 1;
    if (stringNum < 1 || stringNum > 6) return;
    setPendingEntry({ mIdx, stringNum, beat: Math.min(beat, m.timeNum) });
    setPendingFret("");
  }

  function commitEntry() {
    if (!pendingEntry) return;
    const fret = parseInt(pendingFret, 10);
    if (isNaN(fret) || fret < 0 || fret > 24) { setPendingEntry(null); return; }
    const note: Note = {
      id: uid(),
      string: pendingEntry.stringNum,
      fret,
      duration: selectedDuration,
      technique: selectedTechnique,
      beat: pendingEntry.beat,
    };
    setMeasures(ms => ms.map((m, i) => {
      if (i !== pendingEntry.mIdx) return m;
      const filtered = m.notes.filter(n => !(n.string === note.string && n.beat === note.beat));
      return { ...m, notes: [...filtered, note].sort((a, b) => a.beat - b.beat || a.string - b.string) };
    }));
    setPendingEntry(null);
  }

  function deleteNote(mIdx: number, noteId: string) {
    if (readOnly) return;
    setMeasures(ms => ms.map((m, i) => i === mIdx ? { ...m, notes: m.notes.filter(n => n.id !== noteId) } : m));
  }

  function addMeasure() {
    setMeasures(ms => [...ms, { id: mid(), timeNum: 4, timeDen: 4, notes: [] }]);
  }

  function exportTab() {
    const text = measuresToAsciiTab(measures);
    try { navigator.clipboard.writeText(text); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ── Render ── */
  const svgW = LEFT_PAD + MEAS_W + RIGHT_PAD;
  const svgH = STAFF_H + 28; // extra for beat numbers

  function renderMeasure(m: Measure, mIdx: number) {
    const notesByBeat: Map<number, Note[]> = new Map();
    for (const n of m.notes) {
      const arr = notesByBeat.get(n.beat) ?? [];
      arr.push(n);
      notesByBeat.set(n.beat, arr);
    }

    const beatPx = MEAS_W / m.timeNum;

    return (
      <div key={m.id} style={{ position: "relative", display: "inline-block", verticalAlign: "top" }}>
        <svg
          width={svgW}
          height={svgH}
          onClick={e => handleStaffClick(e, mIdx)}
          style={{ display: "block", cursor: readOnly ? "default" : "crosshair", userSelect: "none" }}
        >
          {/* String lines */}
          {[0, 1, 2, 3, 4, 5].map(si => (
            <line key={si} x1={LEFT_PAD} y1={si * STR_H} x2={LEFT_PAD + MEAS_W} y2={si * STR_H}
              stroke="var(--fl-line)" strokeWidth={1} />
          ))}

          {/* String labels — only first measure */}
          {mIdx === 0 && STRING_LABELS.map((l, si) => (
            <text key={l + si} x={LEFT_PAD - 8} y={si * STR_H} dominantBaseline="central"
              textAnchor="end" fontSize={10} fontFamily="var(--fl-font-mono)" fill="var(--fl-ink-4)">{l}</text>
          ))}

          {/* Bar line (left) */}
          <line x1={LEFT_PAD} y1={0} x2={LEFT_PAD} y2={STAFF_H} stroke="var(--fl-ink-3)" strokeWidth={1.5} />
          {/* Bar line (right) */}
          <line x1={LEFT_PAD + MEAS_W} y1={0} x2={LEFT_PAD + MEAS_W} y2={STAFF_H} stroke="var(--fl-ink-3)" strokeWidth={1.5} />

          {/* Beat markers */}
          {Array.from({ length: m.timeNum + 1 }, (_, i) => (
            <g key={i}>
              {i > 0 && i < m.timeNum && (
                <line x1={LEFT_PAD + i * beatPx} y1={0} x2={LEFT_PAD + i * beatPx} y2={STAFF_H}
                  stroke="var(--fl-line-soft)" strokeWidth={0.5} strokeDasharray="2,3" />
              )}
              {i < m.timeNum && (
                <text x={LEFT_PAD + i * beatPx + 3} y={STAFF_H + 12} fontSize={9}
                  fontFamily="var(--fl-font-mono)" fill="var(--fl-ink-4)">{i + 1}</text>
              )}
            </g>
          ))}

          {/* Notes */}
          {m.notes.map(n => {
            const x = LEFT_PAD + (n.beat - 1) * beatPx;
            const y = (n.string - 1) * STR_H;
            const tech = n.technique !== "normal" ? n.technique : "";
            return (
              <g key={n.id} style={{ cursor: "pointer" }} onClick={e => { e.stopPropagation(); deleteNote(mIdx, n.id); }}>
                <rect x={x + 2} y={y - 8} width={Math.max(16, String(n.fret).length * 7 + 6)} height={16}
                  rx={3} fill="var(--fl-surface)" stroke="var(--fl-accent)" strokeWidth={1} />
                <text x={x + 10} y={y} dominantBaseline="central" textAnchor="middle"
                  fontSize={11} fontWeight={600} fontFamily="var(--fl-font-mono)" fill="var(--fl-accent)">
                  {n.fret}
                </text>
                {tech && (
                  <text x={x + Math.max(16, String(n.fret).length * 7 + 6) + 2} y={y}
                    dominantBaseline="central" fontSize={9} fontFamily="var(--fl-font-mono)" fill="var(--fl-ink-3)">
                    {tech}
                  </text>
                )}
              </g>
            );
          })}

          {/* Playhead */}
          {playing && (() => {
            const globalStart = measures.slice(0, mIdx).reduce((s, mm) => s + mm.timeNum, 0);
            const localBeat = playBeat - globalStart;
            if (localBeat < 0 || localBeat > m.timeNum) return null;
            const px = LEFT_PAD + localBeat * beatPx;
            return (
              <line x1={px} y1={-2} x2={px} y2={STAFF_H + 2}
                stroke="var(--fl-accent)" strokeWidth={1.5} opacity={0.7} />
            );
          })()}

          {/* Time signature — only first measure */}
          {mIdx === 0 && (
            <g>
              <text x={LEFT_PAD - 28} y={STR_H * 2 - 2} fontSize={14} fontWeight={700}
                fontFamily="var(--fl-font)" fill="var(--fl-ink-3)">{m.timeNum}</text>
              <text x={LEFT_PAD - 28} y={STR_H * 3 - 2} fontSize={14} fontWeight={700}
                fontFamily="var(--fl-font)" fill="var(--fl-ink-3)">{m.timeDen}</text>
            </g>
          )}
        </svg>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Transport */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "var(--fl-surface-sunk)", borderBottom: "1px solid var(--fl-line)", flexWrap: "wrap" }}>
        <button onClick={playing ? stopPlay : startPlay} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "var(--fl-accent)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {playing ? (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><rect x="0" y="0" width="3" height="12" fill="#fff" /><rect x="7" y="0" width="3" height="12" fill="#fff" /></svg>
          ) : (
            <svg width="10" height="12" viewBox="0 0 10 12" fill="none"><path d="M0 0L10 6L0 12Z" fill="#fff" /></svg>
          )}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.78rem", color: "var(--fl-ink-3)" }}>
          <button onClick={() => setBpm(b => Math.max(40, b - 5))} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--fl-line)", background: "transparent", cursor: "pointer", color: "var(--fl-ink-3)" }}>-</button>
          <span style={{ fontFamily: "var(--fl-font-mono)", minWidth: 34, textAlign: "center" }}>{bpm}</span>
          <button onClick={() => setBpm(b => Math.min(240, b + 5))} style={{ width: 22, height: 22, borderRadius: 5, border: "1px solid var(--fl-line)", background: "transparent", cursor: "pointer", color: "var(--fl-ink-3)" }}>+</button>
          <span style={{ fontSize: "0.68rem" }}>BPM</span>
        </div>

        <div style={{ width: 1, height: 20, background: "var(--fl-line)", margin: "0 4px" }} />

        {/* Duration selector */}
        <div style={{ display: "flex", gap: 3 }}>
          {(["w", "h", "q", "e", "s"] as Duration[]).map(d => (
            <button key={d} onClick={() => setSelectedDuration(d)}
              title={{ w: "Whole", h: "Half", q: "Quarter", e: "Eighth", s: "Sixteenth" }[d]}
              style={{ padding: "3px 7px", borderRadius: 5, border: `1px solid ${selectedDuration === d ? "var(--fl-accent)" : "var(--fl-line)"}`, background: selectedDuration === d ? "var(--fl-accent-softer)" : "transparent", color: selectedDuration === d ? "var(--fl-accent)" : "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)", fontSize: "0.72rem", cursor: "pointer" }}>
              {d}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {!readOnly && (
          <>
            <button onClick={addMeasure} style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid var(--fl-line)", background: "transparent", color: "var(--fl-ink-3)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--fl-font)" }}>
              + Measure
            </button>
            <button onClick={exportTab} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid var(--fl-line)", background: copied ? "var(--fl-accent-softer)" : "var(--fl-surface)", color: copied ? "var(--fl-accent)" : "var(--fl-ink-3)", fontSize: "0.75rem", cursor: "pointer", fontFamily: "var(--fl-font)", transition: "all 150ms" }}>
              {copied ? "Copied!" : "Export ASCII"}
            </button>
          </>
        )}
      </div>

      {/* Articulation row */}
      {!readOnly && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "var(--fl-surface)", borderBottom: "1px solid var(--fl-line)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)", marginRight: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Technique</span>
          {(Object.keys(TECHNIQUE_LABEL) as Technique[]).map(t => (
            <button key={t} onClick={() => setSelectedTechnique(t)} title={TECHNIQUE_TITLE[t]}
              style={{ padding: "3px 9px", borderRadius: 6, border: `1px solid ${selectedTechnique === t ? "var(--fl-accent)" : "var(--fl-line)"}`, background: selectedTechnique === t ? "var(--fl-accent-softer)" : "transparent", color: selectedTechnique === t ? "var(--fl-accent)" : "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)", fontSize: "0.72rem", cursor: "pointer", transition: "all 100ms" }}>
              {TECHNIQUE_LABEL[t]}
            </button>
          ))}
        </div>
      )}

      {/* Staff */}
      <div style={{ overflowX: "auto", background: "var(--fl-canvas)", padding: "24px 16px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 0, alignItems: "flex-start" }}>
          {measures.map((m, i) => renderMeasure(m, i))}
        </div>
        {!readOnly && (
          <div style={{ marginTop: 10, fontSize: "0.68rem", color: "var(--fl-ink-4)" }}>
            Click on a string line to add a note · Click a note to delete · Use controls above to set duration and technique
          </div>
        )}
      </div>

      {/* Fret input dialog */}
      {pendingEntry && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.25)" }}
          onClick={() => setPendingEntry(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "18px 22px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 12, minWidth: 220 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--fl-ink)" }}>
              Enter fret — string {STRING_LABELS[pendingEntry.stringNum - 1]}, beat {pendingEntry.beat}
            </div>
            <input
              autoFocus
              type="number"
              min={0}
              max={24}
              value={pendingFret}
              onChange={e => setPendingFret(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commitEntry(); if (e.key === "Escape") setPendingEntry(null); }}
              placeholder="0–24"
              style={{ padding: "8px 11px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", fontFamily: "var(--fl-font-mono)", fontSize: "1rem", color: "var(--fl-ink)", outline: "none", width: "100%", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={commitEntry} style={{ flex: 1, padding: "7px 0", borderRadius: "var(--fl-r-md)", border: "none", background: "var(--fl-accent)", color: "#fff", fontFamily: "var(--fl-font)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Add</button>
              <button onClick={() => setPendingEntry(null)} style={{ flex: 1, padding: "7px 0", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "transparent", color: "var(--fl-ink-3)", fontFamily: "var(--fl-font)", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
