/**
 * NoteSet — shared type consumed by both Piano and Fretboard.
 * One note set lights both instruments identically.
 */

export type NoteTone = "root" | "third" | "fifth" | "seventh" | "scale";

export interface ScaleNote {
  /** Pitch class: "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B" */
  name: string;
  tone: NoteTone;
}

export type NoteSet = ScaleNote[];

/** Structural match for Fretboard's Marker — no import cycle needed. */
export interface FretMarker {
  stringIndex: number; // 0 = high E
  fret: number;
  label?: string;
  tone?: NoteTone;
  emphasis?: boolean;
}

const CHROMATIC = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Standard EADGBE open strings as semitone indices (0 = C). Index 0 = high e.
const STD_OPEN = [4, 11, 7, 2, 9, 4];

/** Expands a NoteSet into fret-position markers for Fretboard. */
export function noteSetToMarkers(
  notes: NoteSet,
  fromFret = 0,
  toFret = 12,
  openStrings = STD_OPEN
): FretMarker[] {
  const map = new Map(notes.map(n => [n.name, n]));
  const out: FretMarker[] = [];
  for (let si = 0; si < openStrings.length; si++) {
    for (let fret = fromFret; fret <= toFret; fret++) {
      const name = CHROMATIC[(openStrings[si] + fret) % 12];
      const n = map.get(name);
      if (n) {
        out.push({ stringIndex: si, fret, label: name, tone: n.tone, emphasis: n.tone === "root" });
      }
    }
  }
  return out;
}

/** Assigns semantic tone roles by interval position. */
function roleForInterval(iv: number): NoteTone {
  if (iv === 0) return "root";
  if (iv === 3 || iv === 4) return "third";
  if (iv === 7) return "fifth";
  if (iv === 10 || iv === 11) return "seventh";
  return "scale";
}

/** Converts a root + interval array into a NoteSet with automatic tone roles. */
export function intervalsToNoteSet(root: string, intervals: number[]): NoteSet {
  const rootIdx = CHROMATIC.indexOf(root);
  if (rootIdx < 0) return [];
  return intervals.map(iv => ({
    name: CHROMATIC[(rootIdx + iv) % 12],
    tone: roleForInterval(iv),
  }));
}

/** Returns all pitch classes in the NoteSet as an array of note names. */
export function noteNames(notes: NoteSet): string[] {
  return notes.map(n => n.name);
}

/** Returns the root note name from a NoteSet. */
export function rootName(notes: NoteSet): string | undefined {
  return notes.find(n => n.tone === "root")?.name;
}
