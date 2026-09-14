import { useState, useRef, useEffect } from "react";
import { SectionHeading, Eyebrow, LevelBadge } from "../components/ui";
import { Button } from "../components/controls";
import { TabStaff } from "../components/TabStaff";
import { CHORD_LIBRARY, ChordCard, ChordDetail } from "../components/ChordLibrary";

/* ── URL parsing ───────────────────────────────────────────── */
type PlayerType = "youtube" | "spotify" | null;

function parseUrl(url: string): { type: PlayerType; id: string } | null {
  try {
    const u = new URL(url.trim());
    // YouTube
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return { type: "youtube", id: u.searchParams.get("v")! };
    }
    if (u.hostname === "youtu.be") {
      return { type: "youtube", id: u.pathname.slice(1) };
    }
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return { type: "youtube", id: u.pathname.split("/")[2] };
    }
    // Spotify
    if (u.hostname.includes("spotify.com") && u.pathname.includes("/track/")) {
      const id = u.pathname.split("/track/")[1]?.split("?")[0];
      if (id) return { type: "spotify", id };
    }
    if (u.hostname.includes("spotify.com") && u.pathname.includes("/playlist/")) {
      const id = u.pathname.split("/playlist/")[1]?.split("?")[0];
      if (id) return { type: "spotify", id };
    }
  } catch { /* not a URL */ }
  return null;
}

/* ── Song data ─────────────────────────────────────────────── */
const SONGS = [
  {
    id: "wish",
    title: "Wish You Were Here",
    artist: "Pink Floyd",
    key: "G",
    tuning: "Standard",
    difficulty: "intermediate" as const,
    capo: null as number | null,
    genre: "Rock",
    bpm: 62,
    cover: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Intro / Main Riff
e|---0---0-3-0---0---0-0-3-0---0---0-0-3-0---0---0-0-3-0---|
B|---3---3---3---3---3---3---3---3---3---3---3---3---3---3--|
G|---0---0---0---0---0---0---0---0---0---0---0---0---0---0--|
D|------------------------------------------------------------|
A|------------------------------------------------------------|
E|------------------------------------------------------------|

Verse (chord shapes)
e|-0---2---0---3---0---2---|
B|-1---3---1---0---1---3---|
G|-0---2---0---0---0---2---|
D|-2---0---2---0---2---0---|
A|-3-------3---2---3-------|
E|---------0---3-----------|
   Am  G   Am  C   Am  G`,
    chords: ["Am", "G", "C", "D", "Em"],
  },
  {
    id: "smoke",
    title: "Smoke on the Water",
    artist: "Deep Purple",
    key: "G",
    tuning: "Standard",
    difficulty: "beginner" as const,
    capo: null as number | null,
    genre: "Rock",
    bpm: 112,
    cover: "https://images.unsplash.com/photo-1782737403705-19f10e302a6e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Main Riff (power chords on D/A strings)
e|--------------------------------------|
B|--------------------------------------|
G|--------------------------------------|
D|-0--3-5---0--6-5---0--3-5--3-0--------|
A|-0--3-5---0--6-5---0--3-5--3-0--------|
E|--------------------------------------|

Full power-chord progression
e|---3---3---1---3----|
B|---3---3---1---3----|
G|---5---5---2---5----|
D|---5---5---3---5----|
A|---3---3---3---3----|
E|---3---3---1---3----|
   Gm  Gm  Bb  Gm`,
    chords: ["Gm", "Bb", "Cm", "Eb"],
  },
  {
    id: "nothing",
    title: "Nothing Else Matters",
    artist: "Metallica",
    key: "Em",
    tuning: "Standard",
    difficulty: "intermediate" as const,
    capo: null as number | null,
    genre: "Metal",
    bpm: 69,
    cover: "https://images.unsplash.com/photo-1622382533983-a4ae7467a62d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Intro — Open string arpeggio
e|--0--------0--------0--------0--------|
B|----0--------0--------0--------0------|
G|------9--------9--------9--------9----|
D|--------9--------9--------9--------9--|
A|-0--------0--------0--------0---------|
E|--------------------------------------|

Verse (open chord shapes)
e|-0---2---0---0---0---2---0-----------|
B|-0---2---0---0---0---2---0-----------|
G|-9---9---9---9---9---9---9-----------|
D|-9---9---9---9---9---9---9-----------|
A|-7---7---7---7---7---7---7-----------|
E|-0---0---0---0---0---0---0-----------|
   Em  Em  Em  Em  Em  Em  Em`,
    chords: ["Em", "D", "C", "Am", "G"],
  },
  {
    id: "rising",
    title: "House of the Rising Sun",
    artist: "The Animals",
    key: "Am",
    tuning: "Standard",
    difficulty: "intermediate" as const,
    capo: null as number | null,
    genre: "Blues Rock",
    bpm: 78,
    cover: "https://images.unsplash.com/photo-1489602765044-5d661da88b24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Intro Arpeggio (6/8 feel)
e|-0---0---1---0---0---0---1---0--------|
B|-1---1---1---1---1---1---1---1--------|
G|-2---2---0---2---0---0---0---2--------|
D|-2---2---2---0---2---2---2---0--------|
A|-0---0---3---2---3---0---3---2--------|
E|------0-----------0-----------0------|
   Am  Am  C   Am  F   F   Am  E7

Progression: Am — C — D — F — Am — E — Am — E`,
    chords: ["Am", "C", "D", "F", "E7"],
  },
  {
    id: "blackbird",
    title: "Blackbird",
    artist: "The Beatles",
    key: "G",
    tuning: "Standard",
    difficulty: "advanced" as const,
    capo: null as number | null,
    genre: "Folk Rock",
    bpm: 95,
    cover: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Main Fingerpicking Pattern
e|---7---7---5---4---5---7---5---7---0---|
B|---8---8---5---5---5---8---5---8---0---|
G|---7---7---5---5---5---7---5---7---0---|
D|--9---9---7---5---5---9---7---9---2----|
A|-10--10---7---5---7--10---7--10---2----|
E|---0---0---0---0---0---0---0---0---0---|

Melody + Chord combined
e|-0---2---3---2---0---2---3---2--------|
B|-3---3---3---3---3---3---3---3--------|
G|-0---0---0---0---0---0---0---0--------|
D|-2---2---4---2---2---2---4---2--------|
A|-2---2---3---2---2---2---3---2--------|
E|-0---0---0---0---0---0---0---0--------|
   G  Am  Am  Am  G  Am   Am  Am`,
    chords: ["G", "Am", "C", "D"],
  },
  {
    id: "come-as-you-are",
    title: "Come as You Are",
    artist: "Nirvana",
    key: "F#m",
    tuning: "Standard",
    difficulty: "beginner" as const,
    capo: null as number | null,
    genre: "Grunge",
    bpm: 120,
    cover: "https://images.unsplash.com/photo-1552535867-bcffd9632b00?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Main Riff
e|-------------------------------------|
B|-------------------------------------|
G|-------------------------------------|
D|-------------------------------------|
A|-0--0--0-1--1--3--0--0--0-1--1-3-3--|
E|-0--0--0-0--0--0--0--0--0-0--0-0-0--|

Chord progression (verse)
e|-0---0---3---0---0---3---2---0--------|
B|-2---2---0---2---2---0---3---2--------|
G|-2---2---0---2---2---0---2---2--------|
D|-2---2---0---2---2---0---0---2--------|
A|-0---0---2---0---0---2-------0--------|
E|------3-----------3-----------3------|
   Am  Am  G   Am  Am  G  D   Am`,
    chords: ["Am", "G", "D"],
  },
  {
    id: "wonderwall",
    title: "Wonderwall",
    artist: "Oasis",
    key: "F#m",
    tuning: "Standard",
    difficulty: "beginner" as const,
    capo: 2,
    genre: "Britpop",
    bpm: 87,
    cover: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Intro (Capo 2)
e|-3---3---3---3---3---3---3---3--------|
B|-3---3---3---3---3---3---3---3--------|
G|-0---2---0---2---0---2---0---2--------|
D|-0---2---0---2---0---2---0---2--------|
A|-0---0---2---0---0---0---2---0--------|
E|-3---3---3---3---3---3---3---3--------|
   Em7 G  Sus4  G  Em7 G  Sus4  G

Strumming: D DU UDU (1 e + a 2 e + a)`,
    chords: ["Em7", "G", "Dsus4", "Cadd9"],
  },
  {
    id: "hotel",
    title: "Hotel California",
    artist: "Eagles",
    key: "Bm",
    tuning: "Standard",
    difficulty: "advanced" as const,
    capo: null as number | null,
    genre: "Rock",
    bpm: 75,
    cover: "https://images.unsplash.com/photo-1618901882475-4a8ce888ffda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
    tab: `Iconic Intro (Arpeggiated)
e|--2---2------2---2------2---2------2---2---|
B|----3---3------3---3------3---3------3---3--|
G|------2---2------2---2------2---2------2---|
D|-------------------------------------------|
A|-0----------------------------2------------|
E|----------------------0--------------------|
   Bm                   F#

Solo excerpt
e|-12--10-12--10-12-10---8--10-8--7---------|
B|-------------------------------10--7------|
G|------------------------------------------7|
D|--------------------------------------------|
A|--------------------------------------------|
E|--------------------------------------------|`,
    chords: ["Bm", "F#", "A", "E", "G", "D", "Em"],
  },
];

const GENRES = ["All", "Rock", "Metal", "Blues Rock", "Folk Rock", "Grunge", "Britpop"];

type SongEntry = typeof SONGS[0] & { imported?: true; playerType?: "youtube" | "spotify"; playerId?: string };

/* ── Import bar ─────────────────────────────────────────────── */
function ImportBar({ onImport }: { onImport: (song: SongEntry) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleImport() {
    setError(null);
    const parsed = parseUrl(url.trim());
    if (!parsed) { setError("Paste a YouTube or Spotify song URL"); return; }
    setLoading(true);
    // Simulate a brief fetch delay, then inject the song
    setTimeout(() => {
      const id = `imported-${Date.now()}`;
      const newSong: SongEntry = {
        id,
        title: parsed.type === "youtube" ? "YouTube Song" : "Spotify Track",
        artist: "Imported",
        key: "—",
        tuning: "Standard",
        difficulty: "beginner",
        capo: null,
        genre: "Imported",
        bpm: 0,
        cover: parsed.type === "youtube"
          ? `https://img.youtube.com/vi/${parsed.id}/mqdefault.jpg`
          : "https://images.unsplash.com/photo-1785813124593-52caee33a8a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80",
        tab: `Tab for this song is not available yet.\nPlay along with the embedded player above and use it as a reference.`,
        chords: [],
        imported: true,
        playerType: parsed.type,
        playerId: parsed.id,
      };
      onImport(newSong);
      setUrl("");
      setLoading(false);
    }, 800);
  }

  return (
    <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--fl-line)", flexShrink: 0 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--fl-ink-4)", marginBottom: 6 }}>Import from URL</div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, position: "relative" }}>
          {/* Platform icon hint */}
          <div style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 3, pointerEvents: "none" }}>
            <svg viewBox="0 0 16 16" width="11" height="11" fill="var(--fl-ink-4)">
              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.94 5.44-1.26 5.94c-.09.4-.33.5-.67.31l-1.86-1.37-.9.87c-.1.1-.18.18-.37.18l.13-1.86 3.37-3.04c.15-.13-.03-.2-.22-.07L4.9 9.77l-1.82-.57c-.4-.12-.41-.4.08-.59l7.1-2.74c.33-.12.62.08.68.57z" />
            </svg>
            <svg viewBox="0 0 16 16" width="11" height="11" fill="var(--fl-ink-4)">
              <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.67 11.48c-.15.24-.46.32-.7.17C9.03 10.3 6.8 9.93 4.14 10.53c-.27.06-.54-.11-.6-.38-.06-.27.11-.54.38-.6 2.93-.67 5.44-.38 7.4.85.24.16.32.46.17.7l-.02-.02zm.97-2.16c-.19.3-.58.39-.89.2-1.95-1.2-4.92-1.55-7.22-.85-.3.09-.61-.08-.7-.37-.09-.3.08-.61.37-.7 2.63-.8 5.9-.41 8.14 1 .31.19.4.58.21.89l.09-.17zm.08-2.26C10.49 5.59 7.04 5.48 5.12 6.07c-.36.11-.74-.09-.85-.45-.11-.36.09-.74.45-.85 2.18-.66 5.81-.53 8.1.97.33.2.43.62.23.95-.2.33-.62.43-.95.23l.02.04z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="url"
            placeholder="youtube.com/watch?v=... or open.spotify.com/track/..."
            value={url}
            onChange={e => { setUrl(e.target.value); setError(null); }}
            onKeyDown={e => e.key === "Enter" && handleImport()}
            style={{ width: "100%", boxSizing: "border-box", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7, borderRadius: "var(--fl-r-md)", border: `1px solid ${error ? "var(--fl-danger)" : "var(--fl-line)"}`, background: "var(--fl-surface-sunk)", fontFamily: "var(--fl-font)", fontSize: "0.7rem", color: "var(--fl-ink)", outline: "none" }}
          />
        </div>
        <button onClick={handleImport} disabled={loading || !url.trim()} style={{ padding: "7px 11px", borderRadius: "var(--fl-r-md)", border: "none", background: loading ? "var(--fl-accent-softer)" : "var(--fl-accent)", color: loading ? "var(--fl-accent-ink)" : "#fff", fontSize: "0.72rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--fl-font)", whiteSpace: "nowrap", flexShrink: 0 }}>
          {loading ? "…" : "Load"}
        </button>
      </div>
      {error && <div style={{ marginTop: 5, fontSize: "0.68rem", color: "var(--fl-danger)" }}>{error}</div>}
    </div>
  );
}

/* ── Embedded player ────────────────────────────────────────── */
function EmbeddedPlayer({ type, id }: { type: "youtube" | "spotify"; id: string }) {
  if (type === "youtube") {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: "relative", paddingBottom: "56.25%", borderRadius: "var(--fl-r-xl)", overflow: "hidden", background: "#000" }}>
          <iframe
            src={`https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`}
            title="YouTube player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 16 }}>
      <iframe
        src={`https://open.spotify.com/embed/track/${id}?utm_source=generator`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: "none", borderRadius: "var(--fl-r-xl)" }}
        title="Spotify player"
      />
    </div>
  );
}

/* ── ASCII tab parser ──────────────────────────────────────── */
interface ParsedNote { string: number; fret: number; col: number; }
const STRING_ORDER = ["e", "B", "G", "D", "A", "E"]; // index 0=high e, 5=low E

function parseAsciiTab(raw: string): ParsedNote[] {
  const notes: ParsedNote[] = [];
  const lines = raw.split("\n");
  for (const line of lines) {
    const m = line.match(/^([eBGDAE])\|(.+)/);
    if (!m) continue;
    const strIndex = STRING_ORDER.indexOf(m[1]);
    if (strIndex === -1) continue;
    const body = m[2];
    let col = 0;
    let i = 0;
    while (i < body.length) {
      const ch = body[i];
      if (ch === "-" || ch === "|") { col++; i++; continue; }
      if (/\d/.test(ch)) {
        let numStr = ch;
        if (/\d/.test(body[i + 1] ?? "")) { numStr += body[i + 1]; i++; }
        notes.push({ string: strIndex, fret: parseInt(numStr, 10), col });
        col++;
      }
      i++;
    }
  }
  return notes;
}

/* ── Visual Score component ─────────────────────────────────── */
const STRING_COLORS = ["#b7abf7", "#9d8ff0", "#8678e8", "#7060e0", "#6152d9", "#4e42c8"];
const STRING_LABELS = ["e", "B", "G", "D", "A", "E"];
const LANE_H = 42;
const COL_W = 28;
const LEFT_PAD = 36;
const TOP_PAD = 24;
const NOTE_H = 24;

function VisualScore({ tab, title }: { tab: string; title: string }) {
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const notes = parseAsciiTab(tab);
  const maxCol = notes.reduce((m, n) => Math.max(m, n.col), 0);
  const totalW = LEFT_PAD + (maxCol + 4) * COL_W;
  const totalH = TOP_PAD + 6 * LANE_H + 24;

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(rafRef.current); return; }
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setPlayhead(p => {
        const next = p + dt * 80;
        if (next > totalW - LEFT_PAD) { setPlaying(false); return 0; }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, totalW]);

  function togglePlay() {
    if (playing) { setPlaying(false); } else { setPlayhead(0); setPlaying(true); }
  }

  return (
    <div style={{ background: "#0e0d12", borderRadius: "var(--fl-r-xl)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Header bar */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.03)" }}>
        <button onClick={togglePlay} style={{
          width: 34, height: 34, borderRadius: "50%", background: "var(--fl-accent)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 2px 12px rgba(97,82,217,0.5)",
        }}>
          {playing
            ? <rect x="4" y="3" width="4" height="10" fill="currentColor" />
            : <svg viewBox="0 0 14 14" width="12" height="12" fill="none"><path d="M3 1.5L11 7L3 12.5V1.5Z" fill="white" /></svg>
          }
        </button>
        <div>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", fontFamily: "var(--fl-font-mono)" }}>Visual Score · {notes.length} notes detected</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {STRING_LABELS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: STRING_COLORS[i] }} />
              <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.62rem", color: "rgba(255,255,255,0.4)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable score canvas */}
      <div style={{ overflowX: "auto", overflowY: "hidden" }}>
        <svg width={Math.max(totalW, 700)} height={totalH} style={{ display: "block" }}>
          {/* Lane backgrounds */}
          {STRING_LABELS.map((_, i) => (
            <rect key={i} x={0} y={TOP_PAD + i * LANE_H} width={Math.max(totalW, 700)} height={LANE_H}
              fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.2)"} />
          ))}

          {/* Beat grid lines */}
          {Array.from({ length: maxCol + 5 }, (_, c) => (
            c % 4 === 0 && (
              <line key={c} x1={LEFT_PAD + c * COL_W} y1={TOP_PAD} x2={LEFT_PAD + c * COL_W} y2={TOP_PAD + 6 * LANE_H}
                stroke={c % 16 === 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"} strokeWidth={c % 16 === 0 ? 1.5 : 1} />
            )
          ))}

          {/* Measure numbers */}
          {Array.from({ length: Math.floor((maxCol + 4) / 16) + 1 }, (_, m) => (
            <text key={m} x={LEFT_PAD + m * 16 * COL_W + 4} y={TOP_PAD - 8} fontSize={9} fontFamily="var(--fl-font-mono)" fill="rgba(255,255,255,0.2)">
              {m + 1}
            </text>
          ))}

          {/* String labels */}
          {STRING_LABELS.map((s, i) => (
            <text key={s} x={LEFT_PAD - 8} y={TOP_PAD + i * LANE_H + LANE_H / 2} textAnchor="middle" dominantBaseline="central"
              fontSize={10} fontWeight={700} fontFamily="var(--fl-font-mono)" fill={STRING_COLORS[i]}>
              {s}
            </text>
          ))}

          {/* String center lines */}
          {STRING_LABELS.map((_, i) => (
            <line key={i} x1={LEFT_PAD} y1={TOP_PAD + i * LANE_H + LANE_H / 2} x2={Math.max(totalW, 700)} y2={TOP_PAD + i * LANE_H + LANE_H / 2}
              stroke={STRING_COLORS[i]} strokeWidth={0.5} opacity={0.2} />
          ))}

          {/* Notes */}
          {notes.map((n, idx) => {
            const x = LEFT_PAD + n.col * COL_W;
            const y = TOP_PAD + n.string * LANE_H + (LANE_H - NOTE_H) / 2;
            const w = Math.max(COL_W - 4, 20);
            const color = STRING_COLORS[n.string];
            const isRoot = n.fret === 0 || n.fret === 5 || n.fret === 7 || n.fret === 12;
            return (
              <g key={idx}>
                {/* Glow */}
                <rect x={x} y={y} width={w} height={NOTE_H} rx={5} fill={color} opacity={0.15} />
                {/* Note block */}
                <rect x={x + 1} y={y + 1} width={w - 2} height={NOTE_H - 2} rx={4}
                  fill={isRoot ? color : `${color}88`}
                  stroke={color} strokeWidth={isRoot ? 1.5 : 1} opacity={isRoot ? 1 : 0.8} />
                {/* Fret label */}
                <text x={x + w / 2} y={y + NOTE_H / 2} textAnchor="middle" dominantBaseline="central"
                  fontSize={isRoot ? 9 : 8} fontWeight={isRoot ? 800 : 600} fontFamily="var(--fl-font-mono)"
                  fill={isRoot ? "#fff" : "rgba(255,255,255,0.8)"}>
                  {n.fret}
                </text>
              </g>
            );
          })}

          {/* Playhead */}
          <line x1={LEFT_PAD + playhead} y1={TOP_PAD - 4} x2={LEFT_PAD + playhead} y2={TOP_PAD + 6 * LANE_H + 4}
            stroke="#b7abf7" strokeWidth={1.5} opacity={0.8}
            style={{ filter: "drop-shadow(0 0 6px rgba(183,171,247,0.8))", transition: "none" }} />
          <circle cx={LEFT_PAD + playhead} cy={TOP_PAD - 4} r={4} fill="#b7abf7" />
        </svg>
      </div>

      {/* Bottom legend */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 20, alignItems: "center", background: "rgba(0,0,0,0.2)" }}>
        <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.25)", fontFamily: "var(--fl-font-mono)" }}>
          Brighter block = root/power note · Vertical lines = beat markers · Bar lines every 4 beats
        </span>
      </div>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────── */
export function TabStudio() {
  const [songs, setSongs] = useState<SongEntry[]>(SONGS);
  const [selectedId, setSelectedId] = useState("wish");
  const [genre, setGenre] = useState("All");
  const [tab, setTab] = useState<"tab" | "score" | "chords" | "editor">("tab");
  const [search, setSearch] = useState("");
  const [selectedChord, setSelectedChord] = useState<string | null>(null);

  const selected = songs.find(s => s.id === selectedId)!;
  const filtered = songs.filter(s => {
    if (genre !== "All" && s.genre !== genre) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.artist.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function handleImport(song: SongEntry) {
    setSongs(prev => [song, ...prev]);
    setSelectedId(song.id);
    setTab("tab");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "286px 1fr", height: "calc(100vh - 52px)", fontFamily: "var(--fl-font)" }}>
      {/* ── Song list sidebar ──────────────────────────────── */}
      <aside style={{ borderRight: "1px solid var(--fl-line)", display: "flex", flexDirection: "column", background: "var(--fl-surface)", overflowY: "auto" }}>
        {/* Import */}
        <ImportBar onImport={handleImport} />

        {/* Search */}
        <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid var(--fl-line-soft)", flexShrink: 0 }}>
          <div style={{ position: "relative", marginBottom: 8 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--fl-ink-4)", pointerEvents: "none" }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M9 9L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search songs, artists..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", boxSizing: "border-box", padding: "7px 10px 7px 28px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", fontFamily: "var(--fl-font)", fontSize: "var(--fl-t-small)", color: "var(--fl-ink)", outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {GENRES.map(g => (
              <button key={g} onClick={() => setGenre(g)} style={{ padding: "3px 8px", borderRadius: "var(--fl-r-pill)", border: `1px solid ${genre === g ? "var(--fl-accent-line)" : "var(--fl-line)"}`, background: genre === g ? "var(--fl-accent-softer)" : "transparent", color: genre === g ? "var(--fl-accent-ink)" : "var(--fl-ink-3)", fontSize: "0.65rem", fontWeight: 600, cursor: "pointer" }}>{g}</button>
            ))}
          </div>
        </div>

        {/* Song list */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map(song => {
            const active = song.id === selectedId;
            return (
              <button key={song.id} onClick={() => { setSelectedId(song.id); setTab("tab"); setSelectedChord(null); }}
                style={{ width: "100%", padding: "10px 14px", textAlign: "left", background: active ? "var(--fl-accent-softer)" : "transparent", border: "none", borderLeft: `3px solid ${active ? "var(--fl-accent)" : "transparent"}`, cursor: "pointer", fontFamily: "var(--fl-font)", transition: "background 120ms", display: "flex", alignItems: "center", gap: 10 }}>
                {/* Cover thumbnail */}
                <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "var(--fl-surface-sunk)", position: "relative" }}>
                  <img src={song.cover} alt={song.title} loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                  />
                  {song.imported && (
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                      {song.playerType === "youtube"
                        ? <svg viewBox="0 0 16 16" width="14" height="14" fill="#fff"><path d="M6 4l6 4-6 4V4z"/></svg>
                        : <svg viewBox="0 0 16 16" width="14" height="14" fill="#1DB954"><circle cx="8" cy="8" r="8"/><path d="M11.5 10.5c-1.8-1.1-4-1.4-6.6-.8a.4.4 0 0 1-.2-.8c2.9-.7 5.4-.3 7.4.9a.4.4 0 1 1-.4.7l-.2-.02zm.9-2.2c-2.1-1.3-5.3-1.7-7.8-.9a.5.5 0 0 1-.3-.9c2.8-.8 6.3-.4 8.7 1a.5.5 0 0 1-.5.87l-.1-.08zm.1-2.3C10 4.7 6.5 4.6 4.6 5.2a.55.55 0 0 1-.3-1.05c2.2-.65 5.8-.5 8.2 1a.55.55 0 0 1-.55.95l.07-.12z" fill="#fff"/></svg>
                      }
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: active ? "var(--fl-accent-ink)" : "var(--fl-ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
                  <div style={{ fontSize: "0.7rem", color: active ? "var(--fl-accent-line)" : "var(--fl-ink-4)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.artist}</div>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <LevelBadge level={song.difficulty} />
                    {song.key !== "—" && <span style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)", fontFamily: "var(--fl-font-mono)" }}>Key {song.key}</span>}
                    {song.capo && <span style={{ fontSize: "0.62rem", color: "var(--fl-ink-4)" }}>Capo {song.capo}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <div style={{ padding: 24, textAlign: "center", color: "var(--fl-ink-4)", fontSize: "var(--fl-t-small)" }}>No songs found</div>}
        </div>
      </aside>

      {/* ── Tab viewer ─────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", overflowY: "auto", background: "var(--fl-canvas)" }}>
        {/* Song header */}
        <div style={{ flexShrink: 0, position: "relative" }}>
          {/* Cover image hero */}
          <div style={{ height: 160, position: "relative", overflow: "hidden", background: "var(--fl-dark)" }}>
            <img
              src={selected.cover}
              alt={selected.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.45 }}
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }}
            />
            {/* Gradient overlay */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(23,22,27,0.3) 0%, rgba(23,22,27,0.95) 100%)" }} />
            {/* Song info overlaid */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
              <div>
                <Eyebrow onDark>{selected.imported ? (selected.playerType === "youtube" ? "YouTube Import" : "Spotify Import") : `${selected.genre} · ${selected.tuning}`}</Eyebrow>
                <h1 style={{ margin: "3px 0 2px", fontSize: "var(--fl-t-title)", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1 }}>{selected.title}</h1>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: "var(--fl-t-small)", color: "rgba(255,255,255,0.6)" }}>{selected.artist}</span>
                  <LevelBadge level={selected.difficulty} onDark />
                  {selected.key !== "—" && <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-label)", color: "rgba(255,255,255,0.4)" }}>Key {selected.key}</span>}
                  {selected.bpm > 0 && <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-label)", color: "rgba(255,255,255,0.4)" }}>{selected.bpm} BPM</span>}
                  {selected.capo && <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-label)", color: "rgba(255,255,255,0.4)" }}>Capo {selected.capo}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <Button variant="onDark">Print</Button>
                <Button variant="primary">▶ Practice</Button>
              </div>
            </div>
          </div>

          {/* View tabs */}
          <div style={{ background: "var(--fl-dark)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 28px", display: "flex", gap: 1 }}>
            {([["tab", "Guitar Tab"], ["score", "✦ Score View"], ["chords", "Chord Diagrams"], ["editor", "Tab Editor"]] as const).map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 18px", border: "none", cursor: "pointer", fontFamily: "var(--fl-font)", fontSize: "var(--fl-t-small)", fontWeight: 600, borderRadius: "var(--fl-r-md) var(--fl-r-md) 0 0", background: tab === t ? "var(--fl-canvas)" : "transparent", color: tab === t ? "var(--fl-ink)" : "rgba(255,255,255,0.45)", transition: "background 140ms, color 140ms" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, padding: "22px 28px 60px" }}>
          {tab === "tab" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 196px", gap: 22 }}>
              <div>
                {/* Embedded player (imported songs) */}
                {selected.imported && selected.playerType && selected.playerId && (
                  <EmbeddedPlayer type={selected.playerType} id={selected.playerId} />
                )}

                <pre style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.78rem", lineHeight: 1.85, color: "var(--fl-ink-2)", background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "22px 26px", overflow: "auto", whiteSpace: "pre", margin: "0 0 14px" }}>{selected.tab}</pre>

                <div style={{ padding: "14px 18px", borderRadius: "var(--fl-r-lg)", background: "var(--fl-accent-softer)", border: "1px solid var(--fl-accent-line)" }}>
                  <div style={{ fontSize: "var(--fl-t-label)", fontWeight: 700, color: "var(--fl-accent-ink)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Tab notation</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {[["h", "hammer-on"], ["p", "pull-off"], ["/", "slide up"], ["\\", "slide down"], ["b", "bend"], ["×", "muted"]].map(([sym, desc]) => (
                      <div key={sym} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <code style={{ fontFamily: "var(--fl-font-mono)", fontSize: "0.74rem", fontWeight: 700, color: "var(--fl-accent)", background: "rgba(97,82,217,0.12)", padding: "1px 5px", borderRadius: 4 }}>{sym}</code>
                        <span style={{ fontSize: "0.68rem", color: "var(--fl-ink-3)" }}>{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Info panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Cover card */}
                <div style={{ borderRadius: "var(--fl-r-lg)", overflow: "hidden", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", aspectRatio: "1", position: "relative" }}>
                  <img src={selected.cover} alt={selected.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(23,22,27,0.8) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>{selected.title}</div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.6)" }}>{selected.artist}</div>
                  </div>
                </div>

                <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "14px" }}>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 8 }}>Song info</div>
                  {[
                    ["Key", selected.key], ["Tuning", selected.tuning],
                    ...(selected.bpm > 0 ? [["BPM", String(selected.bpm)]] : []),
                    ["Genre", selected.genre],
                    ...(selected.capo ? [["Capo", `Fret ${selected.capo}`]] : []),
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--fl-line-soft)" }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--fl-ink-4)" }}>{label}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, fontFamily: "var(--fl-font-mono)", color: "var(--fl-ink-2)" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {selected.chords.length > 0 && (
                  <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-lg)", padding: "14px" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 8 }}>Chords</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selected.chords.map(ch => (
                        <button key={ch} onClick={() => { setSelectedChord(CHORD_LIBRARY[ch] ? ch : null); setTab("chords"); }} style={{ padding: "3px 7px", borderRadius: "var(--fl-r-md)", background: "var(--fl-surface-sunk)", border: "1px solid var(--fl-line)", fontSize: "0.72rem", fontWeight: 700, fontFamily: "var(--fl-font-mono)", color: "var(--fl-accent)", cursor: "pointer" }}>{ch}</button>
                      ))}
                    </div>
                    <button onClick={() => setTab("chords")} style={{ marginTop: 8, width: "100%", padding: "6px", borderRadius: "var(--fl-r-md)", border: "1px solid var(--fl-line)", background: "var(--fl-surface-sunk)", fontSize: "0.7rem", color: "var(--fl-ink-3)", fontFamily: "var(--fl-font)", cursor: "pointer" }}>View diagrams →</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "score" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 4 }}>Score View — {selected.title}</div>
                <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>Visual guitar roll parsed from tab notation. Hit play to animate the playhead.</div>
              </div>
              <VisualScore tab={selected.tab} title={selected.title} />
            </div>
          )}

          {tab === "chords" && (
            <div>
              {selected.chords.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--fl-ink-4)", fontSize: "var(--fl-t-small)" }}>No chord data for this song yet</div>
              ) : (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 4 }}>Chords — {selected.title}</div>
                    <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>Select any chord to expand its full overview — voicing, notes, formula and piano.</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: selectedChord && CHORD_LIBRARY[selectedChord] ? "1fr 340px" : "1fr", gap: 24, alignItems: "start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                        {selected.chords.map(ch => {
                          const def = CHORD_LIBRARY[ch];
                          if (def) {
                            return (
                              <ChordCard
                                key={ch}
                                chord={def}
                                selected={selectedChord === ch}
                                onClick={() => setSelectedChord(selectedChord === ch ? null : ch)}
                              />
                            );
                          }
                          return (
                            <div key={ch} style={{ boxSizing: "border-box", height: 190, background: "var(--fl-surface)", border: "1.5px dashed var(--fl-line)", borderRadius: "var(--fl-r-xl)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
                              <div style={{ fontFamily: "var(--fl-font-mono)", fontWeight: 800, fontSize: "1.1rem", color: "var(--fl-ink)" }}>{ch}</div>
                              <div style={{ fontSize: "0.65rem", color: "var(--fl-ink-4)" }}>Voicing coming soon</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Chord progression strip */}
                      <div style={{ background: "var(--fl-surface)", border: "1px solid var(--fl-line)", borderRadius: "var(--fl-r-xl)", padding: "20px 22px" }}>
                        <SectionHeading title="Chord progression" />
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                          {selected.chords.map((ch, i) => (
                            <button key={i} onClick={() => CHORD_LIBRARY[ch] && setSelectedChord(ch)} style={{ padding: "10px 18px", borderRadius: "var(--fl-r-md)", cursor: CHORD_LIBRARY[ch] ? "pointer" : "default", background: selectedChord === ch ? "var(--fl-accent)" : i % 2 === 0 ? "var(--fl-accent-softer)" : "var(--fl-surface-sunk)", border: `1px solid ${selectedChord === ch ? "var(--fl-accent)" : i % 2 === 0 ? "var(--fl-accent-line)" : "var(--fl-line)"}`, fontFamily: "var(--fl-font-mono)", fontWeight: 700, fontSize: "var(--fl-t-body)", color: selectedChord === ch ? "#fff" : i % 2 === 0 ? "var(--fl-accent-ink)" : "var(--fl-ink)" }}>{ch}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedChord && CHORD_LIBRARY[selectedChord] && (
                      <ChordDetail chord={CHORD_LIBRARY[selectedChord]} />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "editor" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 700, color: "var(--fl-ink)", marginBottom: 4 }}>Tab Editor — {selected.title}</div>
                <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-4)" }}>Click on a string line to place a note. Select duration and technique from the toolbar. Click a note to remove it.</div>
              </div>
              <div style={{ borderRadius: "var(--fl-r-xl)", border: "1px solid var(--fl-line)", overflow: "hidden", background: "var(--fl-surface)" }}>
                <TabStaff />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
