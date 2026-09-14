import { useState } from "react";
import type { NoteSet } from "../lib/noteSet";
import { noteNames, rootName } from "../lib/noteSet";

const WHITE_NOTES = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_POSITIONS = [1, 2, 0, 4, 5, 6, 0]; // black key after white key index (0=none)

interface PianoProps {
  noteSet?: NoteSet;
  highlightedNotes?: string[];
  rootNote?: string;
  octaves?: number;
  startOctave?: number;
  onNoteClick?: (note: string, octave: number) => void;
}

const BLACK_OFFSETS = [null, 0, 1, null, 2, 3, 4]; // which black key slot after each white key

export function Piano({
  noteSet,
  highlightedNotes,
  rootNote,
  octaves = 2,
  startOctave = 3,
  onNoteClick,
}: PianoProps) {
  const resolvedHighlights = noteSet ? noteNames(noteSet) : (highlightedNotes ?? []);
  const resolvedRoot = noteSet ? rootName(noteSet) : rootNote;

  const [pressed, setPressed] = useState<string | null>(null);

  const wKeyW = 38;
  const wKeyH = 120;
  const bKeyW = 24;
  const bKeyH = 74;
  const totalWhite = octaves * 7;
  const totalW = totalWhite * wKeyW;

  // Build key data
  interface KeyData { note: string; octave: number; isBlack: boolean; x: number }
  const keys: KeyData[] = [];

  for (let o = 0; o < octaves; o++) {
    const oct = startOctave + o;
    WHITE_NOTES.forEach((note, wi) => {
      const wX = (o * 7 + wi) * wKeyW;
      keys.push({ note, octave: oct, isBlack: false, x: wX });

      // Black key between this and next white key
      const blackNote: Record<string, string> = { C: "C#", D: "D#", F: "F#", G: "G#", A: "A#" };
      if (blackNote[note]) {
        keys.push({
          note: blackNote[note],
          octave: oct,
          isBlack: true,
          x: wX + wKeyW - bKeyW / 2,
        });
      }
    });
  }

  const white = keys.filter((k) => !k.isBlack);
  const black = keys.filter((k) => k.isBlack);

  function isHighlighted(note: string) {
    return resolvedHighlights.includes(note) || resolvedHighlights.includes(note.replace("#", "♯"));
  }

  function keyId(k: KeyData) {
    return `${k.note}${k.octave}`;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={totalW + 2}
        height={wKeyH + 2}
        viewBox={`-1 -1 ${totalW + 2} ${wKeyH + 2}`}
        style={{ display: "block" }}
      >
        {/* White keys */}
        {white.map((k) => {
          const hl = isHighlighted(k.note);
          const isRoot = resolvedRoot === k.note;
          const isPressed = pressed === keyId(k);
          return (
            <g
              key={keyId(k)}
              style={{ cursor: "pointer" }}
              onClick={() => {
                setPressed(keyId(k));
                onNoteClick?.(k.note, k.octave);
                setTimeout(() => setPressed(null), 200);
              }}
            >
              <rect
                x={k.x + 1} y={0}
                width={wKeyW - 2} height={wKeyH}
                rx={3}
                fill={
                  isPressed ? "var(--fl-accent-soft)" :
                  isRoot ? "var(--fl-accent-soft)" :
                  hl ? "var(--fl-key-soft)" :
                  "#fff"
                }
                stroke="var(--fl-line)"
                strokeWidth="1"
                style={{ transition: "fill 80ms" }}
              />
              {(hl || isRoot) && (
                <circle
                  cx={k.x + wKeyW / 2}
                  cy={wKeyH - 16}
                  r={9}
                  fill={isRoot ? "var(--fl-accent)" : "var(--fl-key)"}
                />
              )}
              {(hl || isRoot) && (
                <text
                  x={k.x + wKeyW / 2}
                  y={wKeyH - 16}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="9"
                  fontWeight="600"
                  fill={isRoot ? "#fff" : "var(--fl-key-ink)"}
                  style={{ fontFamily: "var(--fl-font)", pointerEvents: "none" }}
                >
                  {k.note}
                </text>
              )}
              {/* Octave label */}
              {k.note === "C" && (
                <text
                  x={k.x + wKeyW / 2}
                  y={wKeyH - 5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fill="var(--fl-ink-4)"
                  style={{ fontFamily: "var(--fl-font-mono)", pointerEvents: "none" }}
                >
                  C{k.octave}
                </text>
              )}
            </g>
          );
        })}

        {/* Black keys (rendered on top) */}
        {black.map((k) => {
          const hl = isHighlighted(k.note);
          const isRoot = resolvedRoot === k.note;
          const isPressed = pressed === keyId(k);
          return (
            <g
              key={keyId(k)}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                setPressed(keyId(k));
                onNoteClick?.(k.note, k.octave);
                setTimeout(() => setPressed(null), 200);
              }}
            >
              <rect
                x={k.x} y={0}
                width={bKeyW} height={bKeyH}
                rx={3}
                fill={
                  isPressed ? "var(--fl-accent)" :
                  isRoot ? "var(--fl-accent)" :
                  hl ? "#3a3360" :
                  "#1e1c24"
                }
                style={{ transition: "fill 80ms" }}
              />
              {(hl || isRoot) && (
                <circle
                  cx={k.x + bKeyW / 2}
                  cy={bKeyH - 14}
                  r={7}
                  fill={isRoot ? "var(--fl-accent-soft)" : "rgba(183,171,247,0.5)"}
                />
              )}
              {(hl || isRoot) && (
                <text
                  x={k.x + bKeyW / 2}
                  y={bKeyH - 14}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7"
                  fontWeight="600"
                  fill="#fff"
                  style={{ fontFamily: "var(--fl-font)", pointerEvents: "none" }}
                >
                  {k.note.replace("#", "♯")}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
