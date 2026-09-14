import { useEffect, useRef, useState } from "react";
import { useAI } from "../lib/aiContext";

/* ── Canned knowledge base ─────────────────────────────────── */
const KB: Array<{ kw: string[]; body: string }> = [
  { kw: ["root", "tonic", "tonal center"],
    body: `The **root** is the tonal anchor — the pitch every other note in the scale or chord orbits around. On the fretboard, root markers appear brighter than scale tones for exactly this reason.

When you move a shape up or down the neck you're relocating the root; all interval relationships follow identically. This is the fretboard's superpower — one shape, every key.

**Hear it:** Play the root, run the scale up and back, land on the root again. Notice how landing there feels like arriving home. That resolution sense is tonic gravity, and it governs all of Western harmony.` },

  { kw: ["interval", "semitone", "half step", "whole step", "distance"],
    body: `An **interval** is the distance between two pitches measured in semitones. Every chord, scale, and melody is nothing but a stack of intervals.

The 12 intervals have distinct sonic personalities:
- **P5 (7 st)** — open, stable. The power chord is just root + fifth.
- **M3 (4 st)** — bright. What makes a major chord sound major.
- **m3 (3 st)** — darker. The signature of a minor chord.
- **TT (6 st)** — tritone. Maximum tension — the "devil's interval."
- **P4 (5 st)** — open, static. Strong in bass lines, weak as a melody lead.

**Practice tip:** Learn intervals by reference songs. M6 = NBC chime first two notes. m3 = Smoke on the Water riff. P5 = Star Wars theme.` },

  { kw: ["pentatonic", "penta", "box", "five note"],
    body: `The **minor pentatonic** (1 ♭3 4 5 ♭7) is the most consequential 5-note scale in rock and blues. It works because removing the 2nd and 6th eliminates the two notes most likely to clash with dominant seventh chords.

Box 1 starts at the root on the low-E string. Once you've internalised it in all 5 positions you have access to the entire vocabulary of Hendrix, Clapton, Page, and SRV.

**Exercise:** Over an Am drone, play Box 1 (fret 5) using only bends and vibrato — no rushing through. Listen to each note ring. The ♭3 bent up to the 3rd is the blues sound in one motion.` },

  { kw: ["chord", "triad", "major chord", "minor chord", "augmented", "diminished"],
    body: `A **triad** stacks two thirds — root→third→fifth. The quality is determined entirely by which thirds:

| Triad | Formula | Sound |
|-------|---------|-------|
| Major | 1 M3 P5 | Bright, stable |
| Minor | 1 m3 P5 | Dark, stable |
| Augmented | 1 M3 A5 | Tense, unresolved |
| Diminished | 1 m3 d5 | Maximally tense |

**Key insight:** Any open guitar chord is one of these triads with doubled notes. F major = F+A+C, spread across 6 strings — same three pitch classes.` },

  { kw: ["circle", "fifth", "key signature", "modulation"],
    body: `The **circle of fifths** arranges all 12 keys so adjacent keys share 6 of 7 notes. Moving clockwise adds one sharp; counter-clockwise adds one flat.

**Three things to memorise:**
1. Adjacent keys share 6 notes — easy modulation, compatible chords.
2. The strongest harmonic motion moves in 4ths (counter-clockwise) — that's what a V→I resolution is.
3. The ii-V-I jazz progression is three consecutive counter-clockwise steps: Dm-G-C in C major.

Every time you hear a song "change key" and it sounds smooth, the writer moved to an adjacent key on the circle.` },

  { kw: ["mode", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian", "ionian"],
    body: `**Modes** are the 7 rotations of the major scale, each with a different tonal character despite sharing the same pitch classes.

The two you'll use most on guitar:
- **Dorian (ii)** — natural minor with a raised 6th. The raised 6th adds brightness without losing the minor feel. Santana, Carlos, every funk-minor groove.
- **Mixolydian (V)** — major scale with a flat 7th. The flat 7 creates that slightly unresolved, dominant feeling. Every blues-rock and classic rock lead lives here.

**Shortcut:** Dorian = natural minor + one fret higher on the 6th scale degree. Mixolydian = major scale + one fret lower on the 7th. Hear the difference; build from there.` },

  { kw: ["scale", "pattern", "position", "neck", "fretboard"],
    body: `The fretboard is fully redundant — every pitch appears multiple times across strings and positions. This is a gift and a trap: it's easy to get lost.

**The CAGED system** maps 5 overlapping chord shapes across the neck: C, A, G, E, D. Every scale pattern connects to one of these shapes. Learn a pentatonic box, then find which CAGED chord shape anchors it. Now the box has a harmonic context.

**Practical rule:** Practice each scale in one position until you can play it in eighth notes at 120 BPM without looking. Only then move to the next position. Five patterns × one key × 2 weeks = you know that key cold.` },
];

function canned(prompt: string): string {
  const low = prompt.toLowerCase();
  const match = KB.find(r => r.kw.some(k => low.includes(k)));
  return match?.body ?? `Good question about **"${prompt}"**.\n\nEvery concept in music theory has a fretboard shape. The process is always:\n1. **Formula** — what intervals define it?\n2. **One string** — see distances as fret counts.\n3. **One position** — build the shape before moving it.\n4. **Context** — play over a backing track, not in a vacuum.\n\nTap any highlighted marker on the fretboard and I'll explain exactly what that note is doing in the current scale.`;
}

/** Very basic bold + paragraph markdown → safe HTML. No XSS risk — source is internal constant strings. */
function md(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

/* ── Panel ─────────────────────────────────────────────────── */
export function AIPanel() {
  const { isOpen, request, close } = useAI();
  const [input, setInput] = useState("");
  const [streamed, setStreamed] = useState("");
  const [thinking, setThinking] = useState(false);
  const [done, setDone] = useState(false);
  const [lastFull, setLastFull] = useState("");
  const timerRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && request?.prompt) setInput(request.prompt);
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isOpen, request]);

  function stopStream() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  function stream(text: string) {
    stopStream();
    setLastFull(text);
    setStreamed("");
    setThinking(false);
    setDone(false);
    let i = 0;
    timerRef.current = window.setInterval(() => {
      i++;
      setStreamed(text.slice(0, i));
      if (i >= text.length) { stopStream(); setDone(true); }
    }, 10);
  }

  function ask() {
    if (!input.trim()) return;
    setStreamed(""); setDone(false); setThinking(true);
    setTimeout(() => stream(canned(input)), 420);
  }

  function retry() { stream(lastFull); }

  useEffect(() => () => stopStream(), []);

  if (!isOpen) return null;

  const QUICK = [
    "Explain the minor pentatonic scale",
    "Why does ii-V-I sound so resolved?",
    "What modes work over a minor chord?",
    "How do I read the circle of fifths?",
  ];

  return (
    <>
      {/* Backdrop (mobile) — invisible on desktop */}
      <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 99, pointerEvents: "none" }} />

      <div role="dialog" aria-label="FretLab AI assistant" style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: 380, zIndex: 100,
        background: "var(--fl-surface)", borderLeft: "1px solid var(--fl-line)",
        display: "flex", flexDirection: "column", fontFamily: "var(--fl-font)",
        boxShadow: "-10px 0 40px rgba(0,0,0,0.2)",
        animation: "slideInRight 180ms var(--fl-ease-out) both",
      }}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--fl-line)", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #8b7cec 0%, var(--fl-accent) 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1.5L8.8 5H12L9.2 7L10.3 10.5L7 8.8L3.7 10.5L4.8 7L2 5H5.2L7 1.5Z" fill="#fff" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--fl-ink)" }}>FretLab AI</div>
            <div style={{ fontSize: "0.63rem", color: "var(--fl-ink-4)" }}>Music theory assistant</div>
          </div>
          <button onClick={close} aria-label="Close AI panel" style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "var(--fl-surface-sunk)", color: "var(--fl-ink-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        {/* Context badge — shows when opened from a marker */}
        {request?.context && (
          <div style={{ padding: "7px 16px", background: "var(--fl-accent-softer)", borderBottom: "1px solid var(--fl-accent-line)", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="var(--fl-accent)" strokeWidth="1.2" /><path d="M5 3v2.5L6.5 7" stroke="var(--fl-accent)" strokeWidth="1.2" strokeLinecap="round" /></svg>
            <span style={{ fontSize: "0.68rem", color: "var(--fl-accent-ink)", fontFamily: "var(--fl-font-mono)" }}>{request.context}</span>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--fl-line-soft)", flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
            placeholder="Ask about any scale, chord, interval, or technique… (Enter to send)"
            rows={3}
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", fontFamily: "var(--fl-font)", fontSize: "0.8rem", color: "var(--fl-ink)", resize: "none", outline: "none", lineHeight: 1.5 }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 7 }}>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["Explain this scale", "Why does this work?", "Give an exercise"].map(s => (
                <button key={s} onClick={() => setInput(s)} style={{ padding: "2px 7px", borderRadius: "var(--fl-r-pill)", border: "1px solid var(--fl-line)", background: "transparent", fontSize: "0.63rem", color: "var(--fl-ink-4)", cursor: "pointer" }}>{s}</button>
              ))}
            </div>
            <button onClick={ask} disabled={!input.trim() || thinking} style={{ padding: "6px 14px", borderRadius: "var(--fl-r-md)", border: "none", background: "var(--fl-accent)", color: "#fff", fontSize: "0.78rem", fontWeight: 600, cursor: input.trim() && !thinking ? "pointer" : "not-allowed", opacity: input.trim() && !thinking ? 1 : 0.5, fontFamily: "var(--fl-font)", whiteSpace: "nowrap", flexShrink: 0 }}>
              {thinking ? "…" : "Ask →"}
            </button>
          </div>
        </div>

        {/* Response area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {thinking && !streamed && (
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--fl-accent)", opacity: 0.6, animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${i * 0.18}s` }} />
              ))}
              <span style={{ fontSize: "0.75rem", color: "var(--fl-ink-4)", marginLeft: 4 }}>Thinking…</span>
            </div>
          )}

          {streamed && (
            <div style={{ fontSize: "0.82rem", lineHeight: 1.8, color: "var(--fl-ink-2)" }}>
              <div dangerouslySetInnerHTML={{ __html: `<p>${md(streamed)}</p>` }} />
              {!done && <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--fl-accent)", borderRadius: 1, verticalAlign: "middle", animation: "pulse 0.6s ease-in-out infinite" }} />}
            </div>
          )}

          {done && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--fl-line-soft)", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Provenance */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 9px", borderRadius: "var(--fl-r-md)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)" }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="3.5" stroke="var(--fl-ink-4)" strokeWidth="1" /><path d="M4.5 2.5v2L6 5.5" stroke="var(--fl-ink-4)" strokeWidth="1" strokeLinecap="round" /></svg>
                <span style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)" }}>Generated by FretLab AI · Verify before use in performance or teaching</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={retry} style={{ padding: "5px 11px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "transparent", fontSize: "0.7rem", color: "var(--fl-ink-3)", cursor: "pointer", fontFamily: "var(--fl-font)" }}>↻ Retry</button>
                <button onClick={() => { try { navigator.clipboard.writeText(lastFull); } catch { /* noop */ } }} style={{ padding: "5px 11px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "transparent", fontSize: "0.7rem", color: "var(--fl-ink-3)", cursor: "pointer", fontFamily: "var(--fl-font)" }}>Copy</button>
              </div>
            </div>
          )}

          {/* Empty state: quick prompts */}
          {!streamed && !thinking && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.7rem", color: "var(--fl-ink-4)", marginBottom: 4 }}>Try asking:</div>
              {QUICK.map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ padding: "9px 11px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", cursor: "pointer", textAlign: "left", fontFamily: "var(--fl-font)", transition: "border-color 120ms" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--fl-accent-line)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--fl-line)")}>
                  <div style={{ fontSize: "0.78rem", color: "var(--fl-ink)" }}>{q}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
