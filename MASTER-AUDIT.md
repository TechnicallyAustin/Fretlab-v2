# FretLab Master Audit &amp; Remediation Plan

**This is the canonical working document.** It merges the code audit, the UI audit and the task
backlog into one file an agent can track progress through from start to finish.

Audited 2026-09-13 against the running app. Target state is full conformance to
[APP-TEMPLATE-CONTRACT.md](APP-TEMPLATE-CONTRACT.md) as a `tmpl-mern` stem: React 19 + Vite web
client, Express 5 + Mongoose API, MongoDB 7.

| | |
|---|---|
| **Findings** | 114 (42 code · 72 UI), every one mapped to at least one task |
| **Tasks** | 143 across 10 phases, each atomic and independently verifiable |
| **Source evidence** | [AUDIT.md](AUDIT.md) · [UI-AUDIT.md](UI-AUDIT.md) · screenshots in [docs/ui-audit/](docs/ui-audit/) |

> The three source documents are retained as evidence. **Do not track progress in them** — they are
> the findings record. This file is the plan of record.

---

## Agent protocol

**Working a task**

1. Run `grep -n "^### \[ \] P" MASTER-AUDIT.md` to list open tasks.
2. Pick the first open task whose every **Depends on** ID is already `[x]`. If none qualifies, report that and stop.
3. Read that task block only. It is self-contained — you do not need any other section.
4. Do the work. Touch only the files listed, or report what else you touched and why.
5. Run the **Verify** step. Do not proceed on a failing verification.
6. Change the heading `### [ ] P0-01 —` to `### [x] P0-01 —`.
7. Append one line to **Agent log** at the bottom: date, task ID, what changed, anything the next agent needs.

**Status markers**

| Marker | Meaning |
|---|---|
| `[ ]` | Open |
| `[x]` | Done and verified |
| `[~]` | In progress — claim a task by setting this before starting |
| `[!]` | Blocked — append the blocker to the Agent log |

**Rules**

- **Never mark a task done without running its Verify step.** If Verify cannot run, mark `[!]` and say why.
- **Never widen a task.** If you find something outside its scope, log it as a new finding in the register rather than fixing it silently.
- **One task per commit** unless the task says otherwise.
- Tasks marked **serial** must run alone — no parallel agents on the repo.
- Four build decisions are settled below. Do not re-litigate them.

**Progress check**

```bash
echo "$(grep -c '^### \[x\] P' MASTER-AUDIT.md) / $(grep -c '^### \[.\] P' MASTER-AUDIT.md) done"
```

---

## Build decisions (settled)

Where these amend the contract, the amendment is recorded here per §10 ("amend this document before
amending a template").

| Decision | Choice | Consequence |
|---|---|---|
| **Auth** | `AUTH_MODE=local` only, for now | Build the complete §2 endpoint surface, implement the local JWT branch, leave the OIDC branch as typed, tested stubs returning 501. The frontend must never learn which mode runs. |
| **Repo shape** | Monorepo in this repo | `apps/web` + `apps/api` + `packages/shared`, one npm workspace, one `docker compose`. Wire types live in `packages/shared`, imported by both sides. |
| **Theme** | Both, switchable | **Amendment to §6.** FretLab keeps its cream/violet identity with Lexend as default; Bloom DS v2 dark ships alongside as a selectable family. HeroUI semantic tokens map onto whichever is active. |
| **Conformance** | Full | §1, §3, §4, §5, §6, §7 and §9 are all binding. The verification checklist at the end is the gate. |

**The `Item` seam.** §4 says `Item` exists to be renamed. In FretLab it becomes **`TabSheet`** — a
user-authored tab with `owner_id`, `title`, `body`, `status` (`draft|active|archived`), `tags[]`.
Every contract field and wire carries over unchanged; FretLab's domain entities sit alongside it.

---

## Target state

The app is **not** currently built to contract standards. This plan assumes the finished state is,
and the checklist at the end verifies it. In summary, when this plan is complete:

- **§1** Every identity, account, resource, files and notification flow works end to end against MongoDB. Every screen handles loading, empty, error and ready.
- **§2** `AUTH_MODE=local` fully implemented behind the shared endpoint surface; backend is the confidential client; no tokens in `localStorage`.
- **§3** All traffic under `/api/v1`, snake_case wire, error envelope on every failure, collection envelope on every list, `Idempotency-Key` in and `X-Request-Id` out.
- **§4** The five baseline entities plus FretLab's domain entities, identical field names to the contract.
- **§5** L1/L2/L3 enforced by `eslint-plugin-boundaries` at error level; a violating import fails the build.
- **§6** HeroUI v3 on Tailwind v4, two token families, breakpoints `sm 640 / md 768 / lg 1024 / xl 1280`, sidebar collapsing to a bottom bar under `md`.
- **§7** Copy follows all six rules. No em dashes, sentence case, buttons name outcomes.
- **§9** Every definition-of-done checkbox passes.

---

## Finding register

Every finding carries an ID and maps to the task(s) that close it. **No finding is unmapped.**
Severity: **C**ritical (ships wrong information or blocks use) · **H**igh · **M**edium · **L**ow.

### Code and feature findings

| ID | Finding | Sev | Closed by |
|---|---|:--:|---|
| C-01 | Seven chord `frets` arrays sound the wrong notes; diagrams render wrong shapes | C | P0-01 |
| C-02 | `C7.notes` over-declares a 5th the voicing does not sound | M | P0-02 |
| C-03 | No audio anywhere — zero `AudioContext`, oscillator or `<audio>` in 10,390 lines | C | P5-01, P5-02, P5-04 |
| C-04 | Tuner is a `Math.sin` simulation reporting "IN TUNE" with the mic closed | C | P0-13, P5-03 |
| C-05 | No persistence — every stat resets on refresh | C | P1-02, P1-04, P3-03, P4-01 |
| C-06 | Four TypeScript errors; `vite build` does not typecheck | H | P0-04, P0-05, P0-06, P0-07, P0-08 |
| C-07 | ~40 finished components built and never imported | M | P0-17, P6-04, P6-05, P6-07, P9-05 |
| C-08 | `src/imports/` is the design system, not dead weight, and is unused | C | P0-07, P6-02, P6-03 |
| C-09 | Songs and scales each defined twice; sidebar counts match nothing | H | P0-15, P8-01, P8-04 |
| C-10 | `PracticeGraph` range toggle leaves summary stats frozen | M | P0-10, P4-04 |
| C-11 | Dead `goals`/`editingGoal` state in Profile | L | P0-11 |
| C-12 | Sixteen controls render as buttons and do nothing | H | P0-12 |
| C-13 | Practice heatmap generated by `Math.random()` at module scope | H | P0-09, P4-04 |
| C-14 | Hero stats are string literals, including a fabricated 14-day streak | H | P4-03 |
| C-15 | "AI" is a seven-entry keyword table | H | P0-14, P5-09 |
| C-16 | `AIRequest.context` is designed for fretboard context and never set | M | P5-10 |
| C-17 | `measuresToAsciiTab` never imported; tab edits cannot save or export | H | P4-07, P9-11 |
| C-18 | Score playhead runs at a fixed 80 px/s regardless of BPM | M | P5-05 |
| C-19 | Tab parser silently drops `h p / \ b ~ x` documented in its own legend | M | P5-06 |
| C-20 | "Tab Generator from Songs" is a headline feature with no implementation | H | P8-11 |
| C-21 | URL import fabricates a placeholder after a fake 800 ms delay | M | P4-11, P8-11 |
| C-22 | Diatonic chord table hardcoded to C major | M | P6-13 |
| C-23 | Quiz results computed, displayed and discarded | M | P7-09 |
| C-24 | Exercise `progress` values are hardcoded constants | M | P4-06 |
| C-25 | XP is a constant; nothing mints points | H | P7-01 |
| C-26 | Streak hardcoded to 14 | H | P7-02 |
| C-27 | League is seven fictional rows in a client constant | M | P7-06 |
| C-28 | Weekly challenges never increment and never pay out | M | P7-07 |
| C-29 | Achievements are hardcoded earned flags with typed dates | M | P7-08 |
| C-30 | "+ Add goal" inert; goals are a constant | M | P7-11 |
| C-31 | Settings flip and reset on navigation | M | P4-08 |
| C-32 | Account panel fabricates plan, renewal date and storage | H | P4-12, P9-10 |
| C-33 | No auth layer; none of the contract's §1 identity flows exist | C | P2-01 … P2-12 |
| C-34 | Library scale positions are hand-typed two-string fragments | H | P8-04 |
| C-35 | `Library.tsx:273` passes props that do not exist on `Fretboard` | M | P0-04 |
| C-36 | Library "View tab →" does not navigate | M | P0-12 |
| C-37 | No drills tab, though the product spec places drills in the Library | M | P8-08 |
| C-38 | Library `buildMarkers` mislabels the first marker as root regardless of pitch | M | P8-04 |
| C-39 | Single 554 kB bundle chunk | L | P6-14 |
| C-40 | No error boundary — one bad object white-screens the app | H | P4-10 |
| C-41 | Song transcriptions carry no licensing metadata | H | P8-12 |
| C-42 | Metronome runs on wall-clock `setInterval` and drifts audibly | M | P5-02 |

### UI findings

| ID | Finding | Sev | Closed by |
|---|---|:--:|---|
| U-01 | 441 component classes specified, 0 used; 1,078 inline style objects instead | C | P6-02 |
| U-02 | The design system's dark-theme token block was never copied to the app | H | P6-03 |
| U-03 | `--fl-fifth`, `--fl-z-sticky`, `--fl-z-toast` dropped from the shipped tokens | M | P6-03, P6-21 |
| U-04 | `"Atkinson Hyperlegible"` fallback dropped from `--fl-font` | M | P6-03 |
| U-05 | 41 distinct font sizes against a 6-step scale, 8 inside one 0.08rem band | H | P6-20 |
| U-06 | 11 literal border radii alongside 201 token uses | M | P6-20 |
| U-07 | 15 motion durations; both motion tokens used zero times | M | P6-20 |
| U-08 | No spacing scale defined anywhere; 20 distinct `gap` values | H | P6-20 |
| U-09 | 183 raw hex literals, several exact duplicates of existing tokens | H | P6-02, P6-20 |
| U-10 | Twelve z-index values escalating to 99999, with no scale | M | P6-21 |
| U-11 | Practice Studio hero ends on an unresolved hard horizontal edge | M | P6-15 |
| U-12 | Practice-history card is ~68% dead space | M | P6-17 |
| U-13 | Two competing solid-accent primary buttons visible at once | H | P6-18 |
| U-14 | Warm-up card rows do not share a baseline | M | P6-16 |
| U-15 | Four hero stats use four unrelated decorative colors | M | P6-18 |
| U-16 | "2 of 5 tasks done" renders at 1.94:1 on the dark hero | H | P6-03, P9-07 |
| U-17 | Sidebar `01`–`06` numerals imply a sequence that does not exist | L | P6-18 |
| U-18 | `ChordDiagram` loses the nut on 8 of 16 open chords, showing a false position marker | C | P0-18 |
| U-19 | An orphaned chord card sits alone on the last grid row | L | P6-25 |
| U-20 | ~700px of vertical dead space beside the Library detail panel | M | P6-25 |
| U-21 | Three different selection treatments on one screen | M | P6-22 |
| U-22 | Finger numbers inside chord dots are near-illegible at ~7px | M | P6-25 |
| U-23 | Chord name left-aligned, formula centered, within the same card | L | P6-25 |
| U-24 | 706px of fixed chrome at 1440px leaves the tab under half the window | H | P6-24 |
| U-25 | The tab is the smallest text on the page it exists to serve | H | P6-24 |
| U-26 | The same cover photo renders twice ~400px apart | L | P6-24 |
| U-27 | Song hero image over-darkened past the point of reading as an image | L | P6-24 |
| U-28 | "Print" is a light button on unpredictable cover photography | M | P6-24 |
| U-29 | Import field placeholder clipped mid-word by overlapping icons | M | P6-24 |
| U-30 | ~350px of dead canvas below the notation legend | L | P6-17 |
| U-31 | Circle of fifths palette is a 360° hue rotation disconnected from the app | M | P6-26 |
| U-32 | ~440px of dead space below the circle | M | P6-17 |
| U-33 | Six identical quiet inert "Play" buttons stacked in a column | M | P0-12, P5-04 |
| U-34 | Neighbouring-key cards use the app's disabled surface, reading as unavailable | M | P6-26 |
| U-35 | Hero heights vary 0–440px across routes, making the layout jump | M | P6-15 |
| U-36 | Tuner gauge geometry double-rotates; needle and scale in different frames | C | P0-19 |
| U-37 | Tuner labels "0¢" twice at two ring positions | H | P0-19 |
| U-38 | Three tuner text elements overlap in one 60px band | C | P0-19 |
| U-39 | Tuner level meter runs underneath the demo-mode pill | H | P0-19 |
| U-40 | Tuner note letter and octave mispositioned; needle passes through the glyph | H | P0-19 |
| U-41 | Two simultaneous string selectors doing the same job | M | P6-23 |
| U-42 | ~60% of the tuner page is empty | M | P6-23 |
| U-43 | Tuner is the only fully dark route, against the light-first spec | M | P6-23 |
| U-44 | Profile shows two different streaks and two hour totals on one screen | C | P0-09, P0-10, P4-03 |
| U-45 | Profile decorative bloom clips to a visible hard-edged rectangle | M | P0-20 |
| U-46 | Weekly Challenge cards have unequal heights across rows | M | P6-16 |
| U-47 | Level progress bar is effectively invisible on dark | M | P6-18 |
| U-48 | League promotion and relegation dividers are imperceptible | M | P6-18 |
| U-49 | Emoji stand in for iconography beside a custom SVG set | M | P6-19 |
| U-50 | Accent applied to one of four figures in the stat row, arbitrarily | L | P6-18 |
| U-51 | Zero `@media` queries in 10,390 lines, against 18 in the design system | C | P6-06 |
| U-52 | Sidebar is a fixed 224px — 57% of a 390px viewport — and never collapses | C | P6-06 |
| U-53 | Tab Studio is functionally unreachable at 390px (510px of fixed columns) | C | P6-06, P6-24 |
| U-54 | Nine contrast pairs fail AA for normal text; five fail large-text too | C | P6-03, P9-07 |
| U-55 | `--fl-ink-4`, the metadata color, fails on every surface it is used on | C | P6-03 |
| U-56 | `--fl-live` at 2.91:1 used as text in 17 places | H | P6-03 |
| U-57 | Clickable `<div>`s carry primary interaction on four kinds of card list | H | P6-08 |
| U-58 | One global focus style against the system's 8 component treatments | M | P6-02, P6-08 |
| U-59 | No `aria-expanded` on any of four kinds of expand/collapse card | H | P6-08 |
| U-60 | Selection encoded by color alone, against an explicit spec rule | H | P6-22 |
| U-61 | No `prefers-reduced-motion` handling against 6 rules in the system | H | P6-10 |
| U-62 | Touch targets at 11px, 24px and 28px against a 32/40/48 spec | H | P6-20 |
| U-63 | Hover exists in six places, implemented in JavaScript handlers | H | P6-02 |
| U-64 | No `:active` state anywhere, against the spec's 0.97 press scale | M | P6-02 |
| U-65 | No disabled styling despite 14 `:disabled` rules in the system | M | P6-02 |
| U-66 | No loading or pending states; the only one is an artificial 800 ms timeout | H | P4-11 |
| U-67 | Top bar is largely non-functional furniture | M | P0-12, P6-12 |
| U-68 | Breadcrumb and centre pill show the same page name in one 52px band | L | P6-12 |
| U-69 | Sidebar Explore rows hover-styled but unclickable, with wrong counts | M | P0-12, P0-15 |
| U-70 | Em dashes throughout shipped copy, against an explicit prohibition | M | P6-11 |
| U-71 | All-caps labels used widely against "sentence case throughout" | L | P6-11 |
| U-72 | Copy asserts things that are not true in at least four places | H | P0-13, P0-14, P4-12, P9-10 |

### Coverage

Every one of the 114 findings above names at least one closing task. To re-verify coverage after
editing this file:

```bash
# every finding ID should appear in at least one task's "Covers:" line
for id in $(grep -oE '^\| [CU]-[0-9]+' MASTER-AUDIT.md | tr -d '| '); do
  grep -q "Covers:.*$id" MASTER-AUDIT.md || echo "UNCOVERED: $id"
done
```

---

## Phase map

| Phase | Tasks | Theme | Gate |
|---|:--:|---|---|
| **0** | 20 | Correctness and hygiene, on the current layout | All 20 merged before P1-01 |
| **1** | 14 | Monorepo, MongoDB, Express 5, wire format | P1-02 takes your connection string |
| **2** | 12 | Identity, `AUTH_MODE=local` | §2 surface complete |
| **3** | 12 | Data model and domain API | §3 and §4 conformant |
| **4** | 12 | Client integration, offline sync | No mock data remains |
| **5** | 11 | Audio, pitch detection, session player | The app makes sound and listens |
| **6** | 26 | Design system adoption, §5 boundary law, responsive, a11y | The UI audit closes here |
| **7** | 12 | Gamification, server authoritative | The loop closes |
| **8** | 12 | Content library and seeding | Generated, licensed content |
| **9** | 12 | Definition of done and deploy | §9 checklist passes |
| | **143** | | |

**Critical path**

```
Phase 0 (all)  →  P1-01  →  P1-02  →  P1-03  →  P1-04
                                          ↘  P2-01 → P2-03 → P2-04 → P2-08
                                          ↘  P3-03 → P3-04 → P4-01 → P4-03
P5-01 → P5-02 → P5-07 → P7-01 → P7-03 → P7-04
P1-14 → P6-01 → P6-02 → P6-03 / P6-06 / P6-20
```

- **P1-01 is serial** — it moves every file. All of Phase 0 must be `[x]` first.
- **P6-01 and P6-02 are serial** — each touches every file in the web app.
- **P6-02 must follow P6-01.** Migrating files you are about to move wastes the work.
- Independent of the backend once P1-01 lands: **P5-01** and **P1-14**.

---

# Phase 0 — Correctness and hygiene

*Runs on the current single-app layout. Every task here is independent unless stated. **All 20 must
be `[x]` before P1-01 starts**, because P1-01 moves every file in the project.*

---

### [ ] P0-01 — Correct seven wrong chord fret arrays

**Covers:** C-01 · **Files:** `src/components/ChordLibrary.tsx` · **Depends on:** —

**Do:** Seven `CHORD_LIBRARY` entries sound the wrong notes, and `ChordDiagram` renders from `frets`,
so the shape a learner copies is wrong. Replace each array exactly. Order is `[high-e, B, G, D, A, low-E]`; `-1` muted, `0` open.

| Chord | Current (wrong) | Replace with | Sounds |
|---|---|---|---|
| `D` | `[-1,-1,2,3,2,-1]` | `[2,3,2,0,-1,-1]` | D F♯ A |
| `Dm` | `[-1,-1,0,2,3,1]` | `[1,3,2,0,-1,-1]` | D F A |
| `E7` | `[0,2,0,1,2,0]` | `[0,0,1,0,2,0]` | E G♯ B D |
| `Em7` | `[0,0,0,2,2,0]` | `[0,0,0,0,2,0]` | E G B D |
| `Bdim` | `[-1,-1,0,1,0,1]` | `[-1,3,4,3,2,-1]` | B D F |
| `Dsus4` | `[-1,-1,0,2,3,-1]` | `[3,3,2,0,-1,-1]` | D G A |
| `Caug` | `[-1,-1,2,1,1,0]` | `[0,1,1,2,3,-1]` | C E G♯ |

Update each `fingers` array to a playable fingering for the new shape (`0` open/muted, `1`–`4` index
to pinky), same order. **Do not change `C7`** — its array is a valid voicing omitting the 5th; P0-02
handles its `notes` field.

**Verify:** For each of the seven, sound the new array against standard tuning (open pitch classes
`E B G D A E`) and confirm it matches the Sounds column exactly. On `/library` → Chords all seven
render playable shapes with no dot above the nut line.

---

### [ ] P0-02 — Derive chord notes from frets, delete the duplicated field

**Covers:** C-02 · **Files:** `src/components/ChordLibrary.tsx` · **Depends on:** P0-01

**Do:** `ChordDef` stores both `frets` and `notes`, hand-maintained — which is what let P0-01's bugs
survive. Remove `notes` from the interface and all 24 entries, and add:

```ts
const CHROMATIC = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const OPEN_PITCH = [4, 11, 7, 2, 9, 4]; // [high-e, B, G, D, A, low-E]

/** Pitch classes actually sounded by a voicing, low string to high. */
export function voicedNotes(frets: number[]): string[] {
  const seen = new Set<string>(); const out: string[] = [];
  for (let i = frets.length - 1; i >= 0; i--) {
    if (frets[i] < 0) continue;
    const n = CHROMATIC[(OPEN_PITCH[i] + frets[i]) % 12];
    if (!seen.has(n)) { seen.add(n); out.push(n); }
  }
  return out;
}
```

Replace every `chord.notes` read with `voicedNotes(chord.frets)`. Keep `formula` — the theoretical
spelling is legitimately different from what a voicing sounds.

**Verify:** `npx tsc --noEmit` clean. `/library` → `C7` shows notes `C E A#` and formula `1 3 5 b7`.
No entry contains a `notes:` key.

---

### [ ] P0-03 — Add chord validation to the build

**Covers:** C-01, C-02 · **Files:** new `scripts/validate-chords.mjs`, `package.json` · **Depends on:** P0-02

**Do:** Script that loads `CHORD_LIBRARY` and asserts per entry: `frets.length === 6` with values
`-1` or `0`–`24`; `fingers.length === 6` with values `0`–`4`; every pitch class implied by `formula`
is sounded **or is the 5th** (the one degree a guitar voicing may omit) — anything else fails; span
between lowest and highest fretted note ≤ 5 frets. Exit non-zero with a per-chord message. Add
`"validate:chords"` to scripts and call it from `build`.

**Verify:** `npm run validate:chords` passes. Revert one chord to its pre-P0-01 value and the script
fails naming it. Restore.

---

### [ ] P0-04 — Fix the invalid Fretboard props in Library

**Covers:** C-35 · **Files:** `src/pages/Library.tsx` · **Depends on:** —

**Do:** `Library.tsx:273` passes `frets={15} startFret={0}`. Neither exists on `FretboardProps` — the
real props are `toFret` and `fromFret` — so they are silently ignored and the scale view renders
0–12 instead of 0–15. Change to `toFret={15} fromFret={0}`.

**Verify:** `npx tsc --noEmit` no longer reports `Library.tsx:273`. The scale fretboard visibly
renders 15 frets.

---

### [ ] P0-05 — Fix the nullable PlayerType error

**Covers:** C-06 · **Files:** `src/pages/TabStudio.tsx` · **Depends on:** —

**Do:** `TabStudio.tsx:295` passes a `PlayerType` (which includes `null`) to a prop typed
`"youtube" | "spotify" | undefined`. Narrow at the source: change `parseUrl`'s return type to
`{ type: "youtube" | "spotify"; id: string } | null` so the impossible state stops being
representable.

**Verify:** `npx tsc --noEmit` clean for that line. A valid YouTube URL and a valid Spotify track URL
both still render the correct embed.

---

### [ ] P0-06 — Add the missing onDark prop to LevelBadge

**Covers:** C-06 · **Files:** `src/components/ui.tsx`, `src/pages/TabStudio.tsx` · **Depends on:** —

**Do:** `TabStudio.tsx:651` passes `onDark` to `LevelBadge`, which does not accept it. The badge sits
on the dark song hero, so the intent is real. Add `onDark?: boolean` and use the dark-surface
treatment matching the neighbouring `Eyebrow onDark`. Tokens only, no literals.

**Verify:** `npx tsc --noEmit` clean for that line. The badge on the `/tab` hero is legible against
the cover image; light-surface instances elsewhere unchanged.

---

### [ ] P0-07 — Extract src/imports as the design system of record

**Covers:** C-06, C-08 · **Files:** `src/imports/` → new `packages/design-system/` · **Depends on:** —

**Do:** `src/imports/` is **not dead weight** — it is this project's design system, and the app does
not use it. Preserve these four files by moving them to `packages/design-system/`:

- `tokens.css` — 76 tokens **including a dark-theme block the app never received**
- `fretlab-ui.css` — **441 component classes** with 42 `:hover`, 10 `:active`, 14 `:disabled`, 8 `:focus-visible`, 32 `aria-*`, 18 `@media`, 6 `prefers-reduced-motion`
- `CONTROL-SYSTEM.md` — the written interaction spec
- `README.md` — the component inventory

**Discard only the build artifacts:** the three ~17,000-line `gallery*.html` files,
`gallery-enhancements.js`, the PNG screenshot, and `index.tsx` (whose `'../primitives'` import
resolves to nothing — one of the four type errors).

**Verify:** `npx tsc --noEmit` no longer reports `imports/index.tsx`. `npm run build` succeeds.
`packages/design-system/` holds exactly the four preserved files. Nothing under `src/` references the
old path.

---

### [ ] P0-08 — Add a typecheck script and build gate

**Covers:** C-06 · **Files:** `package.json` · **Depends on:** P0-04, P0-05, P0-06, P0-07

**Do:** `npm run build` succeeds with four type errors because Vite does not typecheck, and two of
them were silently broken UI. Add `"typecheck": "tsc --noEmit"` and change `build` to
`"tsc --noEmit && vite build"`.

**Verify:** `npm run typecheck` and `npm run build` both exit 0. Introduce a deliberate type error;
`build` fails. Remove it.

---

### [ ] P0-09 — Replace the randomised practice heatmap

**Covers:** C-13, U-44 · **Files:** `src/pages/PracticeStudio.tsx` · **Depends on:** —

**Do:** `PracticeStudio.tsx:37` builds `HEATMAP` with `Math.random()` at module scope, so the user's
history changes on every load and contradicts the Profile page. Replace with a fixed deterministic
16×7 array checked into the file, plus `// TODO(P4-04): read from the sessions API`.

**Verify:** Reload `/` five times; the heatmap is pixel-identical each time. No `Math.random()`
remains in the file.

---

### [ ] P0-10 — Fix the contribution graph range toggle

**Covers:** C-10, U-44 · **Files:** `src/components/PracticeGraph.tsx` · **Depends on:** —

**Do:** `PracticeGraph.tsx:42` captures data in a `useState` initializer, so the 13/26/52-week switch
redraws the grid while "Total sessions", "Current streak", "Total practice" and "Avg/session" stay
frozen at the initial dataset. Replace with `useMemo(() => generateData(weeks), [weeks])`, make
`generateData` deterministic for a given `weeks`, and add `// TODO(P4-04): read from the sessions API`.

**Verify:** Switching 13 → 26 → 52 changes the grid *and* all four tiles. Returning to 13 reproduces
the first numbers exactly.

---

### [ ] P0-11 — Remove dead state from Profile

**Covers:** C-11 · **Files:** `src/pages/Profile.tsx` · **Depends on:** —

**Do:** `Profile` declares `goals`/`setGoals` and `editingGoal`/`setEditingGoal`, then renders the
`GOALS` constant. No setter is ever called. Delete both `useState` declarations, keep rendering the
constant. Do not build the editing flow — that is P7-11.

**Verify:** `npx tsc --noEmit` reports no unused-variable complaint from this file. `/profile` renders
the four goals as before.

---

### [ ] P0-12 — Triage the sixteen inert controls

**Covers:** C-12, C-36, U-33, U-67, U-69 · **Files:** `src/components/Shell.tsx`, `src/pages/{PracticeStudio,TabStudio,TheoryStudio,Library,Profile}.tsx` · **Depends on:** —

**Do:** Sixteen controls render as buttons and do nothing. An inert button reads as a bug, not as
"coming soon". Apply exactly one of **W** wire it · **D** `disabled` with an explanatory `title` ·
**R** remove it.

| Location | Control | Do |
|---|---|---|
| `Shell.tsx:371` | settings gear | **W** → link `/profile` |
| `Shell.tsx:517` | "Quick train →" | **D** until P5-07 |
| `Shell.tsx` `EXPLORE` | four hover-styled rows | **W** → `/library` with matching tab |
| `Shell.tsx` top bar | "C major" key badge | **D** until P6-12 |
| `PracticeStudio.tsx:135` | "Start today's session" | **D** until P5-07 |
| `PracticeStudio.tsx` warm-up | "▶ Start" (only `stopPropagation`) | **D** until P5-07 |
| `PracticeStudio.tsx:344` | "▶ Start drill" | **D** until P5-07 |
| `Library.tsx:348` | "View tab →" ×9 | **W** → navigate `/tab` for that song |
| `TabStudio.tsx:658` | "Print" | **W** → `window.print()` |
| `TabStudio.tsx:659` | "▶ Practice" | **D** until P5-07 |
| `TheoryStudio.tsx:201` | "Play" ×6 | **D** until P5-04 |
| `TheoryStudio.tsx:812` | "Save for later" | **D** until P4-08 |
| `Profile.tsx:194` | "+ Add goal" | **D** until P7-11 |
| `Profile.tsx:300` | "Manage plan" | **D** until P9-10 |
| `Profile.tsx:324` | "Export"/"Manage"/"Delete" ×3 | **D** until P2-09 |
| `Profile.tsx:330` | "Sign out" | **D** until P2-08 |

If Library and Tab Studio song IDs do not match, mark `Library.tsx:348` **D** and log the blocker.

**Verify:** Click every button on every route. Each does something, is visibly disabled with a
tooltip, or is gone. Log what you chose per control.

---

### [ ] P0-13 — Label the tuner as a demo

**Covers:** C-04, U-72 · **Files:** `src/pages/TunerPage.tsx` · **Depends on:** —

**Do:** `TunerPage.tsx:50` drives the needle from `Math.sin(t)` and the note name cycles
independently. It shows "♦ IN TUNE" and a frequency with the microphone closed, which will cause a
user to detune their instrument. Until P5-03, add a prominent non-dismissible banner: "Demo mode.
This tuner is not listening to your guitar yet." Style with `--fl-warn`. Keep the simulation as a
UI harness.

**Verify:** `/tuner` shows the banner above the gauge at first paint, at desktop and 400px width, and
it cannot be dismissed.

---

### [ ] P0-14 — Label the AI panel honestly

**Covers:** C-15, U-72 · **Files:** `src/components/AIPanel.tsx` · **Depends on:** —

**Do:** `AIPanel` answers from a seven-entry keyword table; anything outside it returns the same
generic fallback for every user, while presenting itself as "FretLab AI · Music theory assistant".
Change the subtitle to "Offline theory reference. Limited topics." and change the provenance line to
say the answer came from a built-in reference rather than being generated. Keep the streaming
animation and every other affordance — P5-09 fills the shell.

**Verify:** Ask something outside the keyword set. Nothing in the UI claims the answer was generated
for that question.

---

### [ ] P0-15 — Derive sidebar Explore counts from real data

**Covers:** C-09, U-69 · **Files:** `src/components/Shell.tsx` · **Depends on:** —

**Do:** `EXPLORE` hardcodes `Chords 48`, `Scales 14`, `Songs 9`, `Key map 12`. The chord library holds
24, Library's scale list 8, the song lists 9 each. Import the real collections and render `.length`.
If a collection is not importable without a cycle, use the correct literal with a `// TODO(P8-01)`
comment rather than shipping a wrong number.

**Verify:** Every sidebar count matches what the corresponding page renders. Count by hand on each page.

---

### [ ] P0-16 — Fix the Profile card spacing

**Covers:** U-46 · **Files:** `src/pages/Profile.tsx` · **Depends on:** —

**Do:** Achievements, Settings and Account each have `padding: "28px"` and no bottom margin, so all
three butt together while every card above has `marginBottom: 24`. Wrap the page's card stack in a
flex column with `gap: 24` and remove the per-card margins, so spacing is set once by layout.

**Verify:** On `/profile`, the vertical gap between every adjacent pair of cards is identical from the
hero to the Account card.

---

### [ ] P0-17 — Inventory unused components, delete nothing

**Covers:** C-07 · **Files:** new `docs/unused-components.md` · **Depends on:** —

**Do:** ~40 exported components are built and never imported, all shipping in the 554 kB bundle.
**Do not delete them in this phase** — Phases 5 and 6 adopt several and P6-02's HeroUI adoption may
replace others wholesale. Write an inventory instead: per unused export, its file, line count, and a
recommendation of **adopt** (a later task uses it), **replace** (HeroUI v3 has an equivalent) or
**delete**, each with a one-line rationale.

Known adopters: `CommandPalette` → P6-05, `ToastStack`/`useToasts` → P6-04, `EmptyState` → P6-07,
`TempoLadder` → P9-05. `src/components/Tuner.tsx` is a second unused 182-line tuner with no adopter —
recommend delete.

**Verify:** The document lists every unused export with a recommendation and rationale. Counts are
verified, not estimated.

---

### [ ] P0-18 — Fix ChordDiagram nut rendering for open chords

**Covers:** U-18 · **Files:** `src/components/ChordLibrary.tsx` · **Depends on:** —

**Do:** `ChordDiagram` computes `baseFret = Math.min(...positives)` and draws the nut only when
`baseFret === 1`. Any **open** chord whose lowest *fretted* note is at fret 2+ therefore renders with
no nut and a misleading `"2fr"` marker, as though it were a movable shape high on the neck. Visible
today on **G, Em, D, A, Bm, Asus2, Dsus4 and Caug** — 8 of the 16 chords shown. Separate bug from P0-01.

Derive open position from the presence of open strings, not the minimum fretted value:

```ts
const isOpenPosition = frets.some(f => f === 0);
const baseFret = isOpenPosition ? 1 : (positives.length ? Math.min(...positives) : 1);
```

Draw the nut whenever `isOpenPosition`; show the `"Nfr"` marker only when it is false. Muted strings
(`-1`) must not count as open.

**Verify:** On `/library` → Chords, every chord containing an open string renders a nut and no
position marker. Genuine barre shapes (`F`, `Bm`, `Gm`, `Bb`, `Cm`, `Eb`, `F#`) still show their
correct `"Nfr"` marker. No diagram draws a dot above the nut line.

---

### [ ] P0-19 — Fix the tuner gauge geometry and overlapping readouts

**Covers:** U-36, U-37, U-38, U-39, U-40 · **Files:** `src/pages/TunerPage.tsx` · **Depends on:** —

**Do:** The gauge is visibly broken. `arcPath` applies `toRad(d - 90)` to an argument already offset
by `+90`, double-rotating the scale arc out of the needle's coordinate frame: the needle points
up-left while the arc renders as a partial ring on the right only. Consequences visible on screen:

- the scale and the needle disagree about where 0¢ is, and **"0¢" is labelled twice**;
- the "455 Hz" readout, the demo-mode pill and a tick label **collide in one ~60px band**;
- the level meter runs **underneath** the demo-mode pill;
- the note letter sits left of centre with the octave floating away, and the needle passes through
  the glyph.

Rebuild the geometry on one convention: a single `polar(cx, cy, r, deg)` helper where `deg` is
measured from vertical, used by the arc, the ticks, the labels and the needle alike. Then lay the
readout stack out in explicit non-overlapping bands: note + octave, cents, frequency, level meter,
status pill — each with reserved vertical space.

Do not change the simulation itself; P5-03 replaces it. This task fixes what is drawn.

**Verify:** At rest and through a full simulated sweep, the needle points at the tick it names, "0¢"
appears exactly once, and no two text elements overlap at any needle position. The level meter clears
the pill. Screenshot at 1440px and at 400px to confirm both.

---

### [ ] P0-20 — Fix the Profile hero bloom artifact

**Covers:** U-45 · **Files:** `src/pages/Profile.tsx` · **Depends on:** —

**Do:** The hero's decorative bloom is a 400px circle at `opacity: 0.08` positioned `top:-100
right:-80` inside a container with `overflow: hidden`. It clips to a **visible hard-edged rectangle**
behind the stats rather than reading as a soft glow. Replace the clipped circle with a radial
gradient on the container (matching the treatment already used on the Practice Studio and Library
heroes), so the falloff is continuous and nothing clips.

**Verify:** The Profile hero shows a smooth falloff with no visible straight edge at any viewport
width. Compare against the Library hero, which already does this correctly.

---

# Phase 1 — Monorepo and backend foundation

*Express 5 + Mongoose behind the §3 wire format, with MongoDB running and your connection string
stubbed. **P1-01 is serial.***

---

### [ ] P1-01 — Restructure into an npm workspace monorepo  **(serial)**

**Covers:** C-05 · **Files:** repo root, all of `src/` · **Depends on:** all of Phase 0

**Do:** Convert to `apps/web` + `apps/api` + `packages/shared`. **Run alone — this moves every file.**

1. `git mv src apps/web/src`; move `index.html`, `vite.config.ts`, `tsconfig.json` into `apps/web/`.
2. Create `apps/api/` and `packages/shared/` with their own `package.json` and `tsconfig.json`.
3. Root `package.json` declares `"workspaces": ["apps/*", "packages/*"]` with fan-out scripts: `dev`, `build`, `typecheck`, `test`, `lint`.
4. TypeScript project references so both apps resolve `@fretlab/shared`.
5. Keep the `@` alias pointing at `apps/web/src`.
6. Preserve the Figma Make plugins and the `$PORT`/8443 dev-server behaviour in `apps/web/vite.config.ts` — the existing preview flow must keep working.

**Change no application logic.** This is a move, not a refactor. An agent that "improves" code while
moving files has exceeded the task.

**Verify:** Root `npm install` succeeds. `npm run dev` serves the web app on `$PORT` with hot reload.
`npm run typecheck` passes across all three packages. Every route renders exactly as before.

---

### [ ] P1-02 — Stand up MongoDB with a stubbed connection string

**Covers:** C-05 · **Files:** new `docker-compose.yml`, `.env.example`, `.gitignore` · **Depends on:** P1-01

**Do:** Two supported paths — local Docker for development, and your own cluster via one variable.

`docker-compose.yml` runs `mongo:7` with a named volume, a healthcheck and port 27017.

`.env.example` puts the connection string first, with a marked slot to paste your own:

```bash
# ── Database ───────────────────────────────────────────────
# Local Docker (default, works with `docker compose up -d`):
MONGODB_URI=mongodb://localhost:27017/fretlab
#
# Or paste your own cluster here (MongoDB Atlas, self-hosted, etc.)
# and comment out the line above:
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fretlab?retryWrites=true&w=majority

MONGODB_DB_NAME=fretlab
```

Also stub with safe local defaults and a comment each: `NODE_ENV`, `API_PORT`, `WEB_ORIGIN`,
`AUTH_MODE=local`, `JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `COOKIE_DOMAIN`, `LOG_LEVEL`.
Add OIDC vars commented out so the shape is visible: `OIDC_ISSUER`, `OIDC_CLIENT_ID`,
`OIDC_CLIENT_SECRET`, `OIDC_REDIRECT_URI`. Add `.env` to `.gitignore`. Never commit a real secret.

**Verify:** `cp .env.example .env && docker compose up -d` brings up a healthy Mongo.
`mongosh "$MONGODB_URI"` connects. Swapping in an Atlas SRV string connects with no other change.
`.env` is gitignored and no real credential appears in a tracked file.

---

### [ ] P1-03 — Bootstrap the Express 5 API server

**Covers:** C-05 · **Files:** `apps/api/src/{index,app}.ts`, `apps/api/package.json` · **Depends on:** P1-02

**Do:** JSON body parsing with a size limit, `cookie-parser`, CORS restricted to `WEB_ORIGIN` with
credentials, `helmet`, graceful shutdown on `SIGTERM` closing the HTTP server and the Mongoose
connection. Mount everything under `/api/v1`. Catch-all 404 returns the §3 error envelope with code
`not_found` — the envelope applies to unmatched routes too. Keep `app.ts` (wiring) separate from
`index.ts` (listen) so tests can import the app without binding a port.

**Verify:** `npm run dev --workspace apps/api` starts and logs the port. `GET /api/v1/nope` returns
404 with a well-formed envelope. `SIGTERM` shuts down with no open-handle warning.

---

### [ ] P1-04 — Connect Mongoose with retry and health reporting

**Covers:** C-05 · **Files:** `apps/api/src/db/connect.ts` · **Depends on:** P1-03

**Do:** Connect Mongoose 8 with pool sizing, a server-selection timeout, and exponential-backoff
retry on initial failure — do not crash-loop on a cold database. Expose connection state for the
health endpoint. Log connect, disconnect and reconnect through the structured logger. Fail fast and
loudly if `MONGODB_URI` is missing: a clear message naming `.env.example`, not a stack trace.

**Verify:** Start with Mongo down — it retries with readable backoff rather than crashing. Start
Mongo — it connects with no restart. Unset `MONGODB_URI` — it exits naming the variable and the file.

---

### [ ] P1-05 — Implement the §3 error envelope

**Covers:** C-40 · **Files:** `apps/api/src/middleware/errors.ts`, `packages/shared/src/errors.ts` · **Depends on:** P1-03

**Do:** Every failure returns this shape, no exceptions including unhandled 500s:

```json
{ "error": { "code": "validation_failed",
             "message": "Display name must be under 64 characters.",
             "field": "display_name",
             "request_id": "01J8..." } }
```

Define a typed `ApiError` in `packages/shared` carrying `code`, `message`, optional `field` and an
HTTP status, and export the stable code union — clients switch on `code`, never `message`. Write
messages per §7: what happened and the next move, no apology, no vagueness, no em dashes. Add an
Express 5 error handler converting `ApiError`, Zod failures, Mongoose validation and cast errors, and
duplicate-key errors into the envelope at the right status. Any unrecognised throw becomes
`internal_error` with a generic message; the real error goes to the log with the same `request_id`.

Status codes per §3: 200 read · 201 create · 204 delete · 400 malformed · 401 unauthenticated ·
403 unauthorized · 404 missing · 409 conflict · 422 validation · 429 throttled.

**Verify:** Force one of each — a Zod failure returns 422 with `field` set, a duplicate key 409, an
unhandled throw 500 with a generic message while the log holds the stack and a matching `request_id`.
No response anywhere returns a bare string or unwrapped object.

---

### [ ] P1-06 — Add request IDs and structured logging

**Covers:** C-40 · **Files:** `apps/api/src/middleware/requestId.ts`, `apps/api/src/lib/logger.ts` · **Depends on:** P1-03

**Do:** Generate a ULID per request, expose it on `req`, set `X-Request-Id` on every response
including errors, and honour an inbound one so traces cross services. Configure Pino with
`LOG_LEVEL`, pretty in development and JSON in production, one line per request with method, path,
status, duration and request id. **Redact** `authorization`, `cookie`, `set-cookie`, `password`,
`token` and `refresh_token`.

**Verify:** Every response carries `X-Request-Id`. A failing request's log line and its envelope share
the id. After a login, `grep` the logs: no password or token value appears.

---

### [ ] P1-07 — Implement idempotency for mutating requests

**Covers:** C-05 · **Files:** `apps/api/src/middleware/idempotency.ts`, `apps/api/src/models/IdempotencyKey.ts` · **Depends on:** P1-04, P1-05

**Do:** §3 requires `Idempotency-Key` on every mutation. Enforce on POST, PUT, PATCH, DELETE under
`/api/v1`, excluding auth endpoints where replay has its own semantics — document which and why.
Store `key`, `user_id`, `method`, `path`, a body hash, response status and response body, with a
24-hour TTL index. Same key + same body replays the stored response without re-executing. Same key +
different body returns 409 `idempotency_key_reuse`. Missing key on a mutating route returns 400
`idempotency_key_required`.

**Verify:** POST the same create twice with one key — exactly one document exists and both responses
are byte-identical. Reuse the key with a changed body — 409. Omit the header — 400. The TTL index
exists in Mongo.

---

### [ ] P1-08 — Define the shared wire types package

**Covers:** C-09 · **Files:** `packages/shared/src/**` · **Depends on:** P1-01

**Do:** `packages/shared` is the single definition of the wire, imported by both sides so they cannot
drift. Export, **in snake_case exactly as §4 specifies for every template including MERN**: entity
interfaces, request and response types per endpoint, the collection envelope
`{ data, page: { limit, offset, total } }`, the error envelope and its code union, and a Zod schema
per request body that the API validates against and the client reuses. **Do not camelCase at the
boundary** — the contract is explicit that cross-template consistency beats ecosystem habit.

**Verify:** Both apps import from `@fretlab/shared` and typecheck. Renaming a field there produces
type errors on both sides. No duplicate wire type exists outside the package.

---

### [ ] P1-09 — Add the health endpoint

**Covers:** C-05 · **Files:** `apps/api/src/routes/health.ts` · **Depends on:** P1-04, P1-06

**Do:** `GET /api/v1/health` returns 200 when the process is up and Mongo reachable, 503 otherwise,
reporting service name, version, uptime, Mongo connection state and resolved `AUTH_MODE`. Never
report secrets, the connection string, or other environment values. Unauthenticated, and excluded
from request-log noise and rate limits.

**Verify:** With Mongo up, 200 with an accurate body. Stop Mongo — 503 within the server-selection
timeout. Restart it — 200 again with no API restart.

---

### [ ] P1-10 — Add rate limiting

**Covers:** C-33 · **Files:** `apps/api/src/middleware/rateLimit.ts` · **Depends on:** P1-05

**Do:** A general limiter on `/api/v1`, and a much stricter per-IP-and-per-account limiter on
`login`, `register`, `password/reset` and `verify/resend` to blunt credential stuffing. Exceeding
returns 429 with the envelope, code `rate_limited`, and `Retry-After`. Keep the store behind an
interface so Redis can replace the default without touching call sites.

**Verify:** Exceed the auth limit — 429 with envelope and `Retry-After`. The general limit does not
trip during normal app use. `/api/v1/health` is never limited.

---

### [ ] P1-11 — Wire the Vite dev proxy and API client base

**Covers:** C-05 · **Files:** `apps/web/vite.config.ts`, `apps/web/src/lib/api/client.ts` · **Depends on:** P1-03, P1-08

**Do:** Proxy `/api` from the Vite dev server to `API_PORT` so the browser sees one origin in
development and the session cookie behaves as it will in production. Build the base transport:
`credentials: "include"` on every request, JSON headers, automatic `Idempotency-Key` on mutations,
`X-Request-Id` captured from responses for error reporting, and envelope parsing that throws a typed
`ApiError` from `@fretlab/shared`. Transport only — per-resource files are P4-01.

**Verify:** `fetch("/api/v1/health")` from the web app returns the API's response with no CORS error
and no absolute URL in client code. A forced API error surfaces as a typed `ApiError` carrying `code`
and `request_id`.

---

### [ ] P1-12 — Add the API test harness

**Covers:** C-06 · **Files:** `apps/api/vitest.config.ts`, `apps/api/src/test/setup.ts` · **Depends on:** P1-03, P1-04

**Do:** The repo has no test runner. Add Vitest plus `mongodb-memory-server` so API tests run against
a real MongoDB with no external service. Helpers: build the app without listening, reset collections
between tests, create an authenticated agent (filled in once Phase 2 lands), assert the envelope
shape. Wire root `npm test` to run all workspaces.

**Verify:** `npm test` runs green from a clean checkout with no Docker. A deliberately failing
assertion reports clearly. Tests leave no database state between files.

---

### [ ] P1-13 — Add the seed script

**Covers:** C-05 · **Files:** `apps/api/src/seed/index.ts` · **Depends on:** P1-04, P1-08

**Do:** §9 requires one owner, one member, twelve items and three notifications. `npm run seed` does
exactly that, where "items" are twelve `TabSheet` documents. Idempotent — safe to run repeatedly —
and refuses to run against a database whose name does not look like development unless `--force`.
Print the seeded credentials. Phases 7 and 8 extend it; keep the structure ready.

**Verify:** Run twice — same state, not duplicates. The printed credentials sign in once Phase 2
lands. A production-looking database name refuses without `--force`.

---

### [ ] P1-14 — Add boundary and lint configuration

**Covers:** U-09 · **Files:** `eslint.config.js` ×3 · **Depends on:** P1-01

**Do:** §5 requires the L1/L2/L3 direction enforced by lint rather than discipline. Configure
`eslint-plugin-boundaries` with element types for `pages` (L1), `sections` (L2),
`elements`/`components` (L3), `lib` and `theme`:

```
L1 -> L2, L3, lib/*
L2 -> L3 only
L3 -> L3 and HeroUI only
```

L3 may not import the API client, the auth store, the router, or anything from L1 or L2. On the API
side, forbid `routes/` importing `models/` directly (it goes through `services/`) and `services/`
importing Express types. Add a rule banning raw hex colours in component files, and one banning
`<button>` without `onClick` or `type="submit"`.

The existing tree violates these everywhere. **Land the boundary rules at `warn`** with a
`// TODO(P6-01): promote to error` comment; P6-01 flips them.

**Verify:** `npm run lint` runs across all workspaces. A deliberate L3-imports-API import warns naming
the rule. A deliberate raw hex in a component file errors.

---

# Phase 2 — Identity

*The complete §2 surface with `AUTH_MODE=local` implemented and the OIDC branch stubbed behind the
same contract. The frontend never learns which mode runs.*

---

### [ ] P2-01 — Model User and Session

**Covers:** C-33 · **Files:** `apps/api/src/models/{User,Session}.ts`, `packages/shared/src/entities.ts` · **Depends on:** P1-04, P1-08

**Do:** Implement §4 exactly, snake_case on the wire.

**User** — `id`, `email`, `email_verified_at`, `display_name`, `avatar_file_id`, `role`,
`external_id`, `password_hash`, `created_at`, `updated_at`, `deleted_at`.
**Session** — `id`, `user_id`, `refresh_token_hash`, `user_agent`, `ip`, `expires_at`, `revoked_at`,
`created_at`.

Soft delete on User, hard delete on Session. Unique index on `email` scoped to non-deleted docs.
Index `Session.user_id` and a TTL on `expires_at`. `role` is `owner|admin|member`. `password_hash`
and `refresh_token_hash` must never be selected by default nor appear in any response — add a
`toWire()` that strips them and use it everywhere.

**Verify:** A created user fetched through `toWire()` yields exactly the §4 fields with no hash. A
duplicate email surfaces as 409. The TTL index exists.

---

### [ ] P2-02 — Implement local credential auth

**Covers:** C-33 · **Files:** `apps/api/src/services/auth/local.ts`, `apps/api/src/lib/password.ts` · **Depends on:** P2-01

**Do:** Hash with Argon2id (preferred) or bcrypt at a documented cost. Implement register,
verify-credentials and change-password as service functions with no Express types. Enforce a password
policy at the Zod layer returning 422 with `field: "password"` and a message saying what is required.
Compare in constant time. On a failed login return the **same message and the same timing** whether
or not the email exists.

**Verify:** Register, then sign in with the right and wrong password. Both failure paths return an
identical message and indistinguishable timing. The stored hash is Argon2id/bcrypt, never plaintext
or a fast digest.

---

### [ ] P2-03 — Implement session issuance and the cookie contract

**Covers:** C-33 · **Files:** `apps/api/src/services/auth/session.ts`, `apps/api/src/middleware/auth.ts` · **Depends on:** P2-02

**Do:** §2 is explicit: **the backend is the confidential client; access and refresh tokens stay
server side; the browser holds an httpOnly, SameSite=Lax session cookie; no tokens in
`localStorage`, ever.** Issue a short-lived access JWT and a long-lived refresh token, storing only a
hash of the refresh token. Set the cookie `httpOnly`, `SameSite=Lax`, `Secure` outside development,
`Path=/`, with `COOKIE_DOMAIN` when set. Add middleware resolving the current user from the cookie,
returning 401 with the envelope when absent or invalid. Record `user_agent` and `ip` on the session.

**Verify:** After login the browser holds exactly one httpOnly cookie and `localStorage` is empty. An
authenticated request succeeds; deleting the cookie makes it 401. The JWT is not readable from JS.

---

### [ ] P2-04 — Build the §2 endpoint surface

**Covers:** C-33 · **Files:** `apps/api/src/routes/auth.ts`, `apps/api/src/services/auth/index.ts` · **Depends on:** P2-03

**Do:** Implement the full surface. The route layer must not know which mode is active — it calls a
strategy resolved from `AUTH_MODE`.

```
GET    /api/v1/auth/session               current user or 401
POST   /api/v1/auth/login                 local: credentials. oidc: returns authorize URL
GET    /api/v1/auth/callback              oidc only
POST   /api/v1/auth/refresh               rotates, both modes
POST   /api/v1/auth/logout                clears session; oidc also hits end_session
POST   /api/v1/auth/register              local only, 404 under oidc
POST   /api/v1/auth/password/reset
POST   /api/v1/auth/password/reset/confirm
POST   /api/v1/auth/verify/resend
GET    /api/v1/auth/verify/:token
```

Under `AUTH_MODE=local` implement every route. `/auth/callback` returns 501 `oidc_not_configured`
with the envelope — a typed stub, not a missing route, so the OIDC branch drops into a shape that
already exists and is already tested.

**Verify:** Every endpoint returns its documented shape under `AUTH_MODE=local`. `/auth/callback`
returns a well-formed 501. Setting `AUTH_MODE=oidc` makes `/auth/register` return 404 per the
contract, with no frontend change.

---

### [ ] P2-05 — Implement refresh rotation and reuse detection

**Covers:** C-33 · **Files:** `apps/api/src/services/auth/session.ts` · **Depends on:** P2-04

**Do:** `POST /auth/refresh` rotates: validate against the stored hash, revoke that session row, issue
a new pair, set the new cookie. **Detect reuse** — a refresh token presented after its session was
revoked means the token leaked: revoke **every** session for that user, return 401
`session_reuse_detected`, log at warn with user id and request id. Support silent refresh on cold
start: `GET /auth/session` with an expired access token but valid refresh token refreshes
transparently and returns the user rather than 401.

**Verify:** Refresh twice in sequence — both succeed, the old token stops working. Replay a consumed
refresh token — 401 `session_reuse_detected` and every other session for that user is revoked. Expire
the access token and call `/auth/session` — it returns the user.

---

### [ ] P2-06 — Implement password reset and email verification

**Covers:** C-33 · **Files:** `apps/api/src/services/auth/tokens.ts`, `apps/api/src/lib/mailer.ts` · **Depends on:** P2-04

**Do:** Single-use, expiring, hashed-at-rest tokens for both flows. `password/reset` always returns
200 whether or not the email exists. Completing a reset revokes every session for that user.
`verify/:token` sets `email_verified_at`. Abstract the mailer behind an interface with a development
transport writing to the log (so flows are demonstrable with no provider) and a production SMTP
transport selected by env.

**Verify:** Request a reset for a real address — the token appears in the dev log, completes once, and
is rejected on reuse and after expiry, with all other sessions revoked. An unknown address returns an
identical 200.

---

### [ ] P2-07 — Implement role resolution and route guards

**Covers:** C-33 · **Files:** `apps/api/src/middleware/requireRole.ts`, `apps/api/src/services/auth/roles.ts` · **Depends on:** P2-03

**Do:** §2 defines `owner|admin|member`, resolved from Authentik groups under OIDC and the
`users.role` column under local. **Guards read the resolved role, never the raw claim** — resolution
lives in one function with two implementations behind it, so only that function changes when OIDC
lands. Add `requireAuth` and `requireRole(...roles)` returning 401 unauthenticated and 403
unauthorized, both enveloped. Enforce ownership separately from role: a `member` acts on their own
resources only.

**Verify:** A `member` gets 403 on an admin-only route and 200 on their own resource. An
unauthenticated request gets 401, not 403. Role resolution is called from exactly one place.

---

### [ ] P2-08 — Build the web auth client, session hook and guards

**Covers:** C-33 · **Files:** `apps/web/src/lib/auth/**`, `routes.ts`, `Shell.tsx` · **Depends on:** P2-04, P1-11

**Do:** Client identity in `lib/auth` so L3 elements can never import it. `useSession()` exposing
current user plus loading and error, restored on cold start via `GET /auth/session` and silently
refreshed on expiry. `<RequireAuth>` and `<RequireRole>` route wrappers; public routes stay public.
Redirect to sign-in preserving the attempted path and return there after success. Sign out clears
server session and client cache, then routes home. Wire the "Sign out" control P0-12 disabled.

**Verify:** Sign in then reload — the session holds with no flash of signed-out UI. A protected route
while signed out redirects and returns to the original path. Sign out clears the cookie and cache.

---

### [ ] P2-09 — Build the auth screens

**Covers:** C-33 · **Files:** `apps/web/src/pages/Auth/**` · **Depends on:** P2-08

**Do:** L1 pages with L2 sections for sign in, register, forgot password, reset password, verify
email. Each handles §1's four states and writes copy per §7 — buttons name the outcome ("Create
account", not "Submit"), errors say what happened and the next move, sentence case, no em dashes. Map
envelope `code` values to field-level messages using `field`; never surface a raw code. Where the API
does not leak account existence, the UI must not either. Re-enable the Account controls P0-12
disabled.

**Verify:** Every flow completes end to end. A wrong password shows a field-level message, not a
toast with a code. The form is fully keyboard operable with a visible focus ring and a password
manager can fill it.

---

### [ ] P2-10 — Implement profile read and update

**Covers:** C-33 · **Files:** `apps/api/src/routes/me.ts`, `apps/web/src/pages/Profile/**` · **Depends on:** P2-07, P2-08

**Do:** `GET /api/v1/me` and `PATCH /api/v1/me` (`display_name`, and email with a re-verification
flow). Replace the hardcoded "Jamie Davis", initials "JD", "Intermediate" and "Member since March
2024" in both `Shell` and the Profile hero with real session data. Derive initials from
`display_name`.

**Verify:** Changing the display name updates the sidebar avatar, initials and Profile hero without a
reload. Changing email requires re-verification before `email_verified_at` is set again. A signed-out
app shows no fictional person anywhere.

---

### [ ] P2-11 — Implement account deletion

**Covers:** C-33 · **Files:** `apps/api/src/routes/me.ts`, `apps/api/src/services/account.ts` · **Depends on:** P2-10

**Do:** `DELETE /api/v1/me` soft-deletes the user, revokes every session, and either anonymises or
cascades owned documents — decide per collection and document the choice. The UI requires typed
confirmation of the account email, states what is deleted and what is retained, and signs the user
out on success.

**Verify:** Deleting signs the user out, prevents sign-in with the same credentials, and leaves no
orphaned owned documents. A signed-in user cannot delete another user's account.

---

### [ ] P2-12 — Test the identity flows

**Covers:** C-33 · **Files:** `apps/api/src/routes/__tests__/auth.test.ts` · **Depends on:** P2-05, P2-06, P2-07, P1-12

**Do:** Cover register → verify → login → session → refresh → logout; password reset request, confirm,
reuse rejection and session revocation; refresh rotation and reuse detection; role guard 401 vs 403;
account-existence non-leakage on both login and reset; and cookie attributes (`httpOnly`, `SameSite`,
`Secure` outside development).

**Verify:** `npm test` covers every flow above and passes from a clean checkout with no Docker.
Deliberately breaking the reuse-detection branch fails a named test.

---

# Phase 3 — Data model and domain API

*The contract's baseline entities plus FretLab's own, behind §3-conformant endpoints.*

---

### [ ] P3-01 — Model the TabSheet resource (the renamed `Item`)

**Covers:** C-05 · **Files:** `apps/api/src/models/TabSheet.ts`, `packages/shared/src/entities.ts` · **Depends on:** P2-01

**Do:** §4's `Item`, renamed: `id`, `owner_id`, `title`, `body` (tab content), `status`
(`draft|active|archived`), `tags[]`, `created_at`, `updated_at`, `deleted_at`, soft-deleted. Add
FretLab fields **alongside, not instead of**: `song_id` (nullable), `tuning`, `capo`, `bpm`. Index
`owner_id`, `status`, and a text index over `title` and `tags`.

**Verify:** All §4 `Item` fields exist with those exact names. A soft-deleted sheet is excluded from
default queries. The text index exists and matches on title and tag.

---

### [ ] P3-02 — Build TabSheet CRUD with pagination, search and sort

**Covers:** C-05, C-17 · **Files:** `apps/api/src/routes/tabsheets.ts`, `services/tabsheets.ts` · **Depends on:** P3-01, P1-07, P2-07

**Do:** `GET /api/v1/tabsheets` takes `limit`, `offset`, `q`, `sort`, `status`, `tag`, returning the
collection envelope. Cap `limit`. **Whitelist sortable fields** — never interpolate user input into a
sort. Scope every query to the requesting user unless `admin`/`owner`. `GET/POST/PATCH/DELETE
/api/v1/tabsheets/:id` complete the set: 201 with `Location`, 204 on delete, **404 for another
user's document (not 403 — do not confirm existence)**.

**Verify:** Paginate a seeded set — `total` correct, pages neither overlap nor skip. Search matches
title and tag. An unwhitelisted `sort` is rejected, not passed through. Another user's sheet returns 404.

---

### [ ] P3-03 — Model FretLab's practice entities

**Covers:** C-05 · **Files:** `apps/api/src/models/{PracticeSession,XpEvent,ExerciseRecord,Routine,Goal}.ts` · **Depends on:** P2-01

**Do:** Follow §4's conventions exactly — snake_case, `id`, `created_at`, `updated_at`, soft delete
only where a user can restore.

- **PracticeSession** — `id`, `user_id`, `started_at`, `ended_at`, `minutes`, `items[]` (`item_type`, `item_id`, `minutes`, `bpm_reached`, `clean_run`), `source`, `created_at`
- **XpEvent** — `id`, `user_id`, `at`, `source`, `amount`, `multiplier`, `session_id`, `created_at`
- **ExerciseRecord** — `id`, `user_id`, `exercise_id`, `best_bpm`, `target_bpm`, `mastery_state`, `clean_runs`, `last_practiced_at`, `created_at`, `updated_at`
- **Routine** — `id`, `owner_id`, `name`, `steps[]` (`item_type`, `item_id`, `minutes`, `target_bpm`), `is_template`, `scheduled_days[]`, timestamps, `deleted_at`
- **Goal** — `id`, `user_id`, `label`, `target_date`, `linked_metric`, `progress`, `completed_at`, timestamps

Index every `user_id`, plus `PracticeSession.started_at` and `ExerciseRecord.last_practiced_at` — the
graph and review queue query on those.

**Verify:** Every model round-trips through `@fretlab/shared` with no field-name mismatch. Indexes
exist. No model helper can read another user's rows.

---

### [ ] P3-04 — Build the practice session API

**Covers:** C-05, C-13, C-14 · **Files:** `apps/api/src/routes/sessions.ts`, `services/sessions.ts` · **Depends on:** P3-03, P1-07

**Do:** `POST /sessions` logs a completed session; `GET /sessions` lists with pagination and date
range; `GET /sessions/:id`; `DELETE` for a mis-logged one. Add `GET /sessions/stats` returning total
minutes, session count, current streak, average BPM, and a per-day bucketed series for a requested
window. **Bucket by the user's local day, not UTC** — an 11pm session must land on that day; accept a
timezone or offset parameter and document it. Compute aggregates with a Mongo aggregation pipeline,
not by loading sessions into Node.

**Verify:** Log sessions across known dates — `stats` returns correct daily buckets, streak and
totals. An 11pm local session lands on the correct day for a non-UTC offset. The aggregation does not
fetch full documents.

---

### [ ] P3-05 — Build the exercise record and mastery API

**Covers:** C-24 · **Files:** `apps/api/src/routes/exercises.ts`, `services/exercises.ts` · **Depends on:** P3-03

**Do:** `GET /exercise-records` lists the user's records. `PUT /exercise-records/:exercise_id` upserts
after a practice step, recording `best_bpm` **only when it improves**, incrementing `clean_runs`,
stamping `last_practiced_at`. `GET /exercise-records/due` returns items due for spaced review. Keep
promotion, decay and interval maths in `services/` as pure functions so P7-03 and P7-04 build on them
without touching routes.

**Verify:** Upserting a lower BPM does not lower `best_bpm`; a higher one raises it. `due` returns
only items past their interval, most overdue first.

---

### [ ] P3-06 — Build the routine and goal APIs

**Covers:** C-30 · **Files:** `apps/api/src/routes/{routines,goals}.ts` · **Depends on:** P3-03, P1-07

**Do:** Full CRUD for both, owner-scoped. Routines support reordering steps and cloning a template
into a user-owned copy. Goals support linking to a measurable metric so progress computes server side
rather than being self-reported. `GET /routines/today` returns the generated routine for today — **a
stub in this task** returning the user's default routine; P7-05 replaces the body while keeping this
contract.

**Verify:** Create, reorder, clone and delete a routine. Create a goal linked to an exercise BPM
target, record that BPM through P3-05, and the goal's progress updates with no client write.

---

### [ ] P3-07 — Build file upload and storage

**Covers:** C-32 · **Files:** `apps/api/src/routes/files.ts`, `services/storage.ts`, `models/FileObject.ts` · **Depends on:** P2-07, P1-05

**Do:** §1 requires direct upload with progress, server-side type and size validation, signed read
URLs and delete. §4's **FileObject** — `id`, `owner_id`, `bucket_key`, `filename`, `content_type`,
`bytes`, `checksum`, `created_at`; hard delete. **Validate content type by sniffing magic bytes**, not
the client header or extension. Enforce a size cap, compute and store a checksum. Put storage behind
an interface with local-disk for development and S3-compatible for production. Signed read URLs must
expire and not be guessable.

**Verify:** Upload a valid image and read it through a signed URL. Upload a file whose extension lies
about its content — rejected on magic bytes. Exceed the cap — 413 enveloped. An expired signed URL is
refused.

---

### [ ] P3-08 — Implement avatar upload and removal

**Covers:** C-33 · **Files:** `apps/api/src/routes/me.ts`, `apps/web/src/pages/Profile/**` · **Depends on:** P3-07, P2-10

**Do:** Complete §1 Account: upload an avatar (stored as a `FileObject`, `avatar_file_id` set) and
remove it. **Show real upload progress** — §1 requires it, so use a request that reports progress, not
a bare `fetch`. Replace the gradient-initials avatar with the real image when one exists, falling back
to initials. Removal deletes the `FileObject` and clears the reference.

**Verify:** Upload an avatar and see it in the sidebar and Profile hero immediately with a real
progress indicator. Remove it and the initials fallback returns. The `FileObject` is deleted, not
orphaned.

---

### [ ] P3-09 — Build notifications

**Covers:** C-33 · **Files:** `apps/api/src/routes/notifications.ts`, `models/Notification.ts`, client · **Depends on:** P2-07

**Do:** §4's **Notification** — `id`, `user_id`, `category`, `title`, `body`, `link`, `read_at`,
`created_at`. §1 requires in-app list, unread count, mark read, mark all read, a server push channel
(SSE on web) and per-category preferences on settings. Build all six. Categories:
`streak_at_risk`, `challenge_complete`, `achievement_unlocked`, `review_due`, `weekly_summary`,
`account`. The SSE endpoint authenticates from the session cookie, heartbeats to survive proxies, and
the client reconnects with backoff.

**Verify:** A server-created notification appears in the open client with no reload. Unread count
updates on read and mark-all. Disabling a category stops those being created. Killing and restoring
the connection reconnects automatically.

---

### [ ] P3-10 — Test one CRUD round trip and one upload

**Covers:** C-06 · **Files:** `apps/api/src/routes/__tests__/{tabsheets,files}.test.ts` · **Depends on:** P3-02, P3-07, P1-12

**Do:** §9 requires a CRUD round trip, an upload, and the envelope shape under test. Cover create →
read → list with pagination and search → update → delete → confirm gone; ownership isolation (another
user gets 404); idempotency replay on create; upload accept and reject paths; and an assertion that
every error response in these suites matches the envelope schema exactly.

**Verify:** `npm test` passes. A deliberate change to the envelope shape fails a named test.

---

### [ ] P3-11 — Document the API

**Covers:** C-06 · **Files:** `apps/api/openapi.yaml` or `docs/api.md` · **Depends on:** P3-02, P2-04

**Do:** Document every endpoint: path, method, auth requirement, request and response schema, and the
error codes it can return. Generate from the Zod schemas in `@fretlab/shared` where practical so the
document cannot drift.

**Verify:** Every registered route appears in the document. A route added without documentation is
detectable — implement that check (test, script or lint rule) and say which.

---

### [ ] P3-12 — Add database migrations

**Covers:** C-05 · **Files:** `apps/api/src/migrations/**` · **Depends on:** P1-04

**Do:** Mongoose reads documents written against an older shape happily, which makes silent drift
easy. Add a migration runner with an applied-migrations collection, `npm run migrate` and
`migrate:status`, and a first migration creating every index the models declare. **Migrations run on
deploy, not on app boot.**

**Verify:** `npm run migrate` applies and is idempotent. `migrate:status` lists applied and pending.
Every declared index exists in Mongo after running.

---

# Phase 4 — Client integration

*Every mock, constant and `Math.random()` replaced by real API data, with an offline queue.*

---

### [ ] P4-01 — Build the typed API client

**Covers:** C-05 · **Files:** `apps/web/src/lib/api/**` · **Depends on:** P1-11, P1-08

**Do:** §5 requires `lib/api/` with one file per resource. Build over P1-11's transport: `auth`, `me`,
`tabsheets`, `sessions`, `exercises`, `routines`, `goals`, `files`, `notifications`, each taking and
returning `@fretlab/shared` types. Add a query cache (TanStack Query or equivalent) with sensible
stale times, request deduplication, and mutation helpers supporting optimistic update and rollback.
**Only `lib/` and L1 pages may import these** — P1-14's rules enforce it.

**Verify:** Every endpoint is reachable through a typed function with no `any`. A failed mutation
rolls back its optimistic update. Deleting a field in `@fretlab/shared` produces a client compile error.

---

### [ ] P4-02 — Add the offline queue and sync

**Covers:** C-05 · **Files:** `apps/web/src/lib/api/offline.ts` · **Depends on:** P4-01

**Do:** Practice happens in garages and basements. Reads serve from an IndexedDB cache when offline;
writes queue durably and replay on reconnect **in order, reusing each request's original
`Idempotency-Key`** so a replay cannot double-apply. Show connection state in the shell. Resolve
conflicts last-write-wins and say so in the UI when a queued write is superseded. **Cache practice
data freely but never tokens or credentials** — the session cookie remains the only auth state.

**Verify:** Go offline, complete a session, return online — exactly one session recorded. Replay the
queue twice — still one. No token or credential is written to IndexedDB or `localStorage`.

---

### [ ] P4-03 — Replace the hardcoded dashboard statistics

**Covers:** C-14, U-44 · **Files:** `apps/web/src/pages/Dashboard/**` · **Depends on:** P4-01, P3-04

**Do:** The hero stats "14", "147", "312", "68" are string literals, as is "Your 14-day streak is
alive." Derive all four from `GET /sessions/stats`. **Write a real empty state for a new user with
zero sessions** — the dashboard must not greet a first-time user with a fabricated 14-day streak.
Handle all four §1 states.

**Verify:** A brand-new account shows zeroes and new-user copy. Logging a session updates every
figure. Killing the API shows an error state naming what failed and the next move, not a blank page.

---

### [ ] P4-04 — Drive both practice graphs from the sessions API

**Covers:** C-10, C-13, U-44 · **Files:** Dashboard sections, `PracticeGraph.tsx` · **Depends on:** P4-01, P3-04, P0-09, P0-10

**Do:** Replace the interim deterministic arrays from P0-09 and P0-10 with the bucketed series from
`GET /sessions/stats`. Keep the existing colour thresholds and hover tooltip. Remove both
`TODO(P4-04)` comments. Pass the browser's timezone so buckets match what the user experienced.

**Verify:** Log sessions on three known past dates — exactly those cells light, on the correct days,
at intensities matching duration. The week strip and the 16-week heatmap agree. **The Profile hero
and the Practice Activity card now report the same streak and the same total hours.** A user in UTC+13
sees their own days.

---

### [ ] P4-05 — Wire the routine checklist to the API

**Covers:** C-05 · **Files:** Dashboard sections · **Depends on:** P4-01, P3-06

**Do:** "Today's routine" is a five-item constant with local checkbox state. Back it with
`GET /routines/today`, persist step completion, and let the user reorder, swap or remove a step with
an optimistic update and rollback on failure (§1 requires optimistic edit with rollback).

**Verify:** Ticking a step persists across reload and devices. Reordering shows instantly and survives
refresh. Forcing the API to fail rolls the change back visibly and explains what happened.

---

### [ ] P4-06 — Wire exercise progress to the API

**Covers:** C-24 · **Files:** Dashboard sections · **Depends on:** P4-01, P3-05

**Do:** The five exercises show hardcoded `progress` constants and a static `bpm → targetBpm` pair.
Read `GET /exercise-records`: `progress` becomes best BPM over target BPM, and the displayed current
BPM is the user's real best.

**Verify:** Completing a drill at 90 BPM shows 90 as current on that card with the ring advanced
proportionally, persisting across reload and visible on a second device.

---

### [ ] P4-07 — Move tab editing to the server

**Covers:** C-17 · **Files:** `pages/TabStudio/**`, `TabStaff.tsx` · **Depends on:** P4-01, P3-02

**Do:** `TabStaff` is a working editor, but `measuresToAsciiTab` is exported and never imported, so
edits can neither save nor export and are lost on navigation. Persist working measures as a
`TabSheet` (`body` holds the serialized tab), autosave on a debounce, restore on mount, and add
"Export ASCII" rendering `measuresToAsciiTab` into a copyable block plus a clipboard action. Show a
save indicator, and a toast once P6-04 lands.

**Verify:** Place six notes across three strings, navigate away and back — still there, and present
after a hard reload on another device. Exported ASCII round-trips through `parseAsciiTab` to the same
note positions.

---

### [ ] P4-08 — Persist settings and lesson progress

**Covers:** C-31 · **Files:** `pages/Profile/**`, `apps/api/src/routes/me.ts` · **Depends on:** P4-01, P2-10

**Do:** Profile toggles flip and reset on navigation. Persist on the user document via `PATCH /me`:
notification preferences (feeding P3-09's filtering), default metronome BPM, preferred practice key,
theme family and mode, left-handed mode, default tuning. Make the practice defaults actually apply —
default BPM seeds the metronome, preferred key seeds Theory Studio and Library. Wire the "Save for
later" lesson bookmark P0-12 disabled.

**Verify:** Set default BPM to 96, navigate away, reload, sign in on another browser — it holds
everywhere and the metronome opens at 96. Disabling a notification category stops those arriving.

---

### [ ] P4-09 — Add the four states to every screen

**Covers:** C-40 · **Files:** all of `apps/web/src/pages/` · **Depends on:** P4-01

**Do:** §1 is explicit: **every screen handles loading, empty, error and ready.** An empty state names
the action that fills it; an error state names what failed and what to do next. Audit every route and
add the missing states: no sessions yet, no goals, no search results, no chords matching a filter, no
saved tabs, no notifications, no achievements earned.

**Verify:** Walk every route on a fresh account and with the API stopped. No blank grid, no bare zero,
no orphaned heading, no spinner that never resolves. Every empty state offers an action.

---

### [ ] P4-10 — Add the error boundary and API error surface

**Covers:** C-40 · **Files:** `components/ErrorBoundary.tsx`, `routes.ts` · **Depends on:** P4-01

**Do:** One malformed object white-screens the app. Add a route-level boundary so a failure in one
page does not take down the shell. Show what broke, offer "Reload this page" and "Go home", and
display the `X-Request-Id` from the failed call so a log line can be found. Copy per §7.

**Verify:** Throw deliberately inside Tab Studio — the sidebar still works, the error UI appears in the
content area with a request id, and navigating to `/library` recovers fully.

---

### [ ] P4-11 — Add loading and pending states

**Covers:** C-21, U-66 · **Files:** `apps/web/src/pages/**` · **Depends on:** P4-01, P4-09

**Do:** The only "loading" is a fake 800 ms delay in the song importer. Real async work now exists
everywhere. Add skeletons for list and detail screens, and make every async trigger disable itself
while in flight so it cannot be double-fired. **Delete the artificial delay.**

**Verify:** Throttle to Slow 3G and exercise each page — a pending state appears immediately, the
trigger is disabled, a second click does nothing. No artificial delay remains.

---

### [ ] P4-12 — Replace the remaining client-side mock data

**Covers:** C-32, U-72 · **Files:** `pages/**`, `Gamification.tsx` · **Depends on:** P4-01, P4-03, P4-04

**Do:** Sweep what earlier Phase 4 tasks did not reach: `PLAYER` in `lib/gamification.ts`,
`LEADERBOARD`, `WEEKLY_CHALLENGES` progress, `ACHIEVEMENTS` earned flags, `RECENT_SESSIONS`, `GOALS`,
and the Account panel's "FretLab Pro" and "2.4 GB / 10 GB". Where Phase 7 owns the real
implementation, read from the API and render a documented empty state **rather than a fabricated
constant**. Storage figures come from `FileObject` sums; anything with no source yet is removed, not
faked.

**Verify:** `grep -rn "Jamie Davis\|2.4 GB\|const PLAYER\|const LEADERBOARD" apps/web/src` returns
nothing. A fresh account shows no invented numbers anywhere.

---

# Phase 5 — Audio and instrument features

*The app makes sound and listens. P5-01 is independent of the backend and can run alongside Phases 1–2.*

---

### [ ] P5-01 — Build the audio engine singleton

**Covers:** C-03 · **Files:** `apps/web/src/lib/audio/engine.ts` · **Depends on:** P1-01

**Do:** There is no `AudioContext`, `<audio>` or oscillator in 10,390 lines. Expose `getContext()`
(lazy, resumed), `unlock()` (from a user gesture, handling the autoplay policy), `isUnlocked()`,
`now()` (the context clock every scheduler must use), and a master `GainNode` with `setMasterVolume`,
`mute()`, `unmute()`. **All timing goes through `AudioContext.currentTime`** — never wall-clock. Add
no dependencies.

**Verify:** From a temporary button, `unlock()` then a 440 Hz oscillator for 200 ms is audible. No
audio context is created before a user gesture and no autoplay warning appears on load.

---

### [ ] P5-02 — Replace the metronome with a scheduled audio metronome

**Covers:** C-03, C-42 · **Files:** `components/practice.tsx`, `lib/audio/**` · **Depends on:** P5-01

**Do:** `MetronomeDialLive` uses `setInterval((60 / bpm) * 1000)` — silent, and audibly drifting within
a minute. Use the lookahead pattern: a 25 ms `setInterval` scheduling every beat inside the next
100 ms against `AudioContext.currentTime`, plus a `requestAnimationFrame` loop updating the visual
indicator from the scheduled times. Keep the existing dial, tap tempo and presets. Add an accented
downbeat, a `timeSignature` prop (2/4, 3/4, 4/4, 6/8) and a `subdivision` prop (eighths, triplets,
sixteenths). Synthesise the click from a short oscillator envelope — no sample, no dependency.

**Verify:** Run at 120 BPM for two minutes against a stopwatch — 240 beats within ~100 ms of two
minutes. The downbeat is audibly distinct. Changing BPM while running does not glitch or double a beat.

---

### [ ] P5-03 — Replace the simulated tuner with real pitch detection

**Covers:** C-04 · **Files:** `pages/Tuner/**`, `lib/audio/pitch.ts` · **Depends on:** P5-01, P0-13, P0-19

**Do:** Implement genuine detection and delete the `Math.sin` simulation.
`getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })`
into an `AnalyserNode`, detecting fundamental frequency per frame with autocorrelation using a
normalised square difference function (YIN or MPM, ~120 lines, no dependency). Return
`{ frequency, clarity }` and reject frames below a clarity threshold. In the page: convert to nearest
note and cents, median-filter the last five accepted frames so the needle does not jitter, and render
three distinct states — **no permission**, **no signal**, **detecting**. The needle rests at centre and
the readout is blank in the first two. Remove the P0-13 banner. Keep P0-19's corrected geometry.

**Verify:** With the mic off or silent the page shows "no signal" and never displays a note or "IN
TUNE". A tuned A string reads A2 ±5 cents. Detuning moves the needle the correct way. Denying
permission shows a clear recovery message.

---

### [ ] P5-04 — Add note and chord playback

**Covers:** C-03, U-33 · **Files:** `lib/audio/instrument.ts`, `Piano.tsx`, `Fretboard.tsx`, `ChordLibrary.tsx`, Theory pages · **Depends on:** P5-01, P0-02

**Do:** Expose `playNote(midi, duration?)`, `playChord(midiNotes, strum?)` and
`playSequence(notes, bpm)`. Synthesise a plucked-string timbre with Karplus–Strong — a noise burst
through a delay line with a lowpass feedback filter; short, dependency-free, and far more guitar-like
than an oscillator. `strum` offsets each note a few milliseconds low to high. Wire: `Piano` keys sound
on click; `Fretboard` markers sound the pitch from `stringIndex` and `fret`; `ChordDetail` strums via
`voicedNotes`; Theory Studio's six progression "Play" buttons play their chords in time (re-enable the
controls P0-12 disabled).

**Verify:** All four surfaces produce the correct pitch. A chord from `ChordDetail` matches the same
chord played note-by-note on the piano. `I–V–vi–IV` in C sounds C–G–Am–F.

---

### [ ] P5-05 — Make the score playhead follow tempo

**Covers:** C-18 · **Files:** `pages/TabStudio/**` · **Depends on:** P5-01, P5-04

**Do:** The playhead advances at a fixed `80` px/s regardless of BPM and treats column index as time.
Drive it from the song's `bpm` and the parsed columns: `COL_W * (bpm / 60) * subdivisionsPerBeat`.
Sound notes as the playhead crosses them via `playSequence`. Add a tempo slider (25–150% of song
tempo) and an A/B loop toggle.

**Verify:** "Smoke on the Water" at 112 BPM takes the seconds its riff length implies and sounds in
time with a metronome at 112. Halving the slider halves the speed with pitch unchanged.

---

### [ ] P5-06 — Parse technique glyphs in the tab parser

**Covers:** C-19 · **Files:** `pages/TabStudio/**` · **Depends on:** P5-05

**Do:** `parseAsciiTab` handles two-digit frets and per-string columns well but **drops technique
glyphs** — `h`, `p`, `/`, `\`, `b`, `~`, `x` — which the UI documents in its own legend. Parse them
into the note model, render them distinguishably in the score view, and articulate them in playback:
slides glide pitch, bends bend, hammer-ons and pull-offs re-trigger without a pick attack, muted notes
are percussive.

**Verify:** A tab containing every glyph parses with each note carrying its technique, renders
distinguishably, and sounds articulated rather than as plain notes.

---

### [ ] P5-07 — Build the practice session player

**Covers:** C-03 · **Files:** `apps/web/src/pages/Session/**`, `routes.ts` · **Depends on:** P5-01, P5-02, P4-05

**Do:** "Start today's session" is the most important button in the app and has no handler. Build what
it opens: a focused full-screen runner at `/session`.

- Steps through a routine from `GET /routines/today`, or a single item.
- Per step: name, target BPM, countdown, the running metronome, and the drill's tab or fretboard pattern where it has one.
- Controls: pause, skip, previous, extend by 2 minutes, end early.
- Auto-advance on expiry with an audible cue and a two-second transition.
- On completion or early end, `POST /sessions` and show a summary — time practiced, steps completed, XP earned — with a route home.
- **Keyboard: `Space` pauses, `→` skips, `Esc` prompts to end.** A user holding a guitar cannot use a mouse.
- **Phone-first layout** — the most likely mobile surface in the product.

Wire "Start today's session", the warm-up "▶ Start", "▶ Start drill" and Tab Studio's "▶ Practice" to
enter it, re-enabling the controls P0-12 disabled.

**Verify:** Start from the dashboard, let one step auto-advance, skip one, end early. A session
persists with the correct duration and item list, and the dashboard stats include it. Works fully at
375px.

---

### [ ] P5-08 — Score drill accuracy from audio input

**Covers:** C-03 · **Files:** `lib/audio/scoring.ts`, `pages/Session/**` · **Depends on:** P5-03, P5-07

**Do:** The clean-run multiplier and half the achievement taxonomy need to know whether the user
actually played the drill. During a session step, compare detected onsets against the metronome grid
and detected pitches against the drill's expected notes. Report per step: notes attempted, notes
correct, timing deviation in milliseconds, and a clean-run boolean, submitted with the session. Set a
**forgiving** default threshold — this must encourage, not punish. Opt-in with a clear "listening"
indicator, degrading gracefully to untimed completion when the mic is unavailable.

**Verify:** Play a drill accurately — clean run. Play deliberately out of time — not. Deny mic
permission — the session still completes and awards base XP.

---

### [ ] P5-09 — Replace the canned AI with a real model call

**Covers:** C-15 · **Files:** `apps/api/src/routes/ai.ts`, `components/AIPanel.tsx` · **Depends on:** P2-07, P0-14

**Do:** Replace `canned()` with a real Claude API call. **The key lives on the server.** Add
`POST /api/v1/ai/ask`, authenticated, rate limited per user, which calls the model and streams back —
the client never sees a provider key, the same confidential-client principle §2 applies to tokens.
Stream to the existing character-by-character renderer, which already has the right shell. Send a
system prompt scoping answers to guitar and music theory and including the user's current key, scale
and fretboard context when present. Handle no-key-configured, network failure, rate limit and empty
response with distinct actionable messages. Keep the provenance line and restore the subtitle P0-14
changed.

**Verify:** Ask something outside the old keyword set and get a specific answer. Disconnect the network
— a clear error, not a hang. `grep -r "sk-ant" apps/web/dist/` returns nothing and the key appears in
no client bundle or network response.

---

### [ ] P5-10 — Wire fretboard context into the AI panel

**Covers:** C-16 · **Files:** `Fretboard.tsx`, Theory and Library pages, `lib/aiContext.tsx` · **Depends on:** P5-09

**Do:** `AIRequest.context` exists so a user can tap a note and ask about *that note in this scale*,
and nothing ever sets it. Add an "Ask about this note" affordance to `Fretboard` markers
(`onMarkerClick` already exists), `Piano` keys and chord diagrams, passing a structured string naming
the note, its scale degree, the current scale and key, and the string and fret — for example
`"A minor pentatonic · ♭3 (C) · string 2, fret 5"`.

**Verify:** Tap the 5th fret of the 2nd string with A minor pentatonic displayed — the panel opens with
an accurate context badge and the answer references that specific scale degree.

---

### [ ] P5-11 — Add an audio settings surface

**Covers:** C-03 · **Files:** `pages/Profile/**`, `lib/audio/engine.ts` · **Depends on:** P5-01, P4-08

**Do:** The audio engine needs user-facing controls and none exist. Add to settings: master volume,
metronome click sound and accent on/off, count-in bars, note-playback instrument volume, and an
explicit microphone permission state with a way to re-request. Persist through `PATCH /me`. Show the
current audio state (locked / ready / muted) somewhere persistent in the shell so a silent app is
never a mystery.

**Verify:** Every control takes effect immediately and persists across reload. With audio locked, the
shell says so and offers a one-click unlock.

---

# Phase 6 — Design system, architecture and UI

*Every UI finding closes here. **P6-01 and P6-02 are serial** — each touches every file in the web
app, and P6-02 must follow P6-01 or you migrate files you are about to move.*

---

### [ ] P6-01 — Restructure the web app to the L1/L2/L3 law  **(serial)**

**Covers:** C-07 · **Files:** all of `apps/web/src/` · **Depends on:** P1-14, P4-01

**Do:** §5 defines three levels with a hard dependency direction. The current tree has none of it —
pages are 400–900 line files holding fetching, layout, sections and primitives together. Restructure
to the §5 shape: one `pages/<Name>/<Name>Page.tsx` per route (**L1** — owns data fetching, URL state,
page layout, error boundary), `sections/` beneath it (**L2** — composes elements, receives props, owns
only local interaction state, never fetches, never reads the router), and `elements/` (**L3** —
page-local, props in and events out, may import HeroUI and other L3 only).

Apply §5's promotion rule: an element starts page-local and moves to `components/` **in the same
commit** a second page needs it. Nothing lands in `components/` speculatively.

Then **flip P1-14's boundary rules from `warn` to `error`** and remove the `TODO(P6-01)` comment.

§5 sizing guidance: an L1 over ~150 lines is holding a section it should have extracted; an L3 with a
`useEffect` talking to anything outside itself is an L2 in disguise. **One page per commit.**

**Verify:** `npm run lint` passes with boundary rules at `error`. A deliberate L3-imports-API violation
fails the build. Every route renders identically to before. No L1 file exceeds ~150 lines without a
written justification.

---

### [ ] P6-02 — Adopt HeroUI v3 and migrate off inline styles  **(serial)**

**Covers:** U-01, U-09, U-58, U-63, U-64, U-65 · **Files:** all of `apps/web/src/` · **Depends on:** P6-01, P0-07

**Do:** HeroUI v3 is installed with **zero imports**; Tailwind v4 is installed with **zero
`className=` usages**; the app renders **1,078 inline `style={{…}}` objects**, which cannot express
hover, focus, active or dark variants. That is the clearest "not a real SaaS" tell, and the root
cause of most of this phase.

`packages/design-system/fretlab-ui.css` (preserved by P0-07) already contains **441 component classes**
carrying 42 `:hover`, 10 `:active`, 14 `:disabled` and 8 `:focus-visible` rules. **Adopt them rather
than reinventing.**

Set up per §6 — order matters:

```css
@import "tailwindcss";
@import "@heroui/styles";
```

v3 needs no provider. Its compound API (`Card.Header`, `Card.Title`, `Card.Content`) is the L2/L3
boundary made literal: a section arranges compound parts, an element is a configured leaf. Replace
hand-rolled primitives with HeroUI equivalents where one exists (button, input, select, switch,
dialog, dropdown, tabs, tooltip, popover) and migrate the rest to the design system's classes or
Tailwind utilities. **Delete every `onMouseEnter`/`onMouseLeave` hover hack** as you replace it with a
`hover:` variant. Replace all **183 raw hex literals** with tokens — several are exact duplicates
(`#6152d9` = `--fl-accent`, `#b7abf7` = `--fl-root`, `#3fa87a` = `--fl-live`, `#8b7cec` = `--fl-third`).

**Preserve appearance exactly — this is a refactor, not a redesign.** SVG-internal attributes (`fill`,
`stroke`, path geometry) stay as attributes. **One file per commit**, reported as a list.

**Verify:** Every route renders as before at 1440px. `grep -rn "style={{" apps/web/src` is
substantially reduced — report before and after. `grep -rEn "#[0-9a-fA-F]{3,6}" apps/web/src/pages
apps/web/src/components` returns nothing. Every interactive element has visible hover, focus and
active states. `npm run build` succeeds.

---

### [ ] P6-03 — Ship both theme families and fix the failing contrast

**Covers:** U-02, U-03, U-04, U-16, U-54, U-55, U-56 · **Files:** `apps/web/src/theme/**`, `index.css`, Profile settings · **Depends on:** P6-02, P4-08

**Do:** **This is the recorded amendment to §6.** FretLab keeps its identity as default; Bloom DS v2
dark ships alongside, selectable.

**The dark palette already exists.** `packages/design-system/tokens.css` carries a complete
`@media (prefers-color-scheme: dark)` block that was never copied into the app. **Port it rather than
authoring one.** Also restore the three dropped tokens (`--fl-fifth`, `--fl-z-sticky`,
`--fl-z-toast`) and the `"Atkinson Hyperlegible"` fallback in `--fl-font` — a low-vision legibility
face that was a deliberate choice.

Define two families HeroUI's semantic tokens map onto:

- **`fretlab`** (default) — cream/violet with Lexend and JetBrains Mono, shipping light and dark.
- **`bloom`** — §6's table exactly: background `#060A10`, surface `rgba(22,27,34,0.6)`, surface-raised `#090D13`, border `rgba(255,255,255,0.07)`, foreground `#E6EDF3`, foreground-muted `#8B949E`, foreground-subtle `#6E7681`, primary `#1F5C99`, success `#3FB950`, warning `#D29922`, with IBM Plex Sans and IBM Plex Mono.

**Fix the nine failing contrast pairs while you are in the token file:**

| Token | Current | Problem | Action |
|---|---|---|---|
| `--fl-ink-4` | `#a19caa` | 2.33–2.63:1 on every surface it is used on. It is the app's **metadata color** — fret numbers, counts, durations, legends | darken to ~`#6f6a7b` (≥4.5:1 on `--fl-surface`) |
| `--fl-live` | `#3fa87a` | 2.91:1, used as **text** in 17 places | keep as a dot only; `--fl-success` (`#27845f`, 4.54:1) takes the text role |
| `--fl-warn` | `#c98a2b` | 2.89:1 | darken to clear 4.5:1 |
| `--fl-ink-3` | `#79747f` | 4.14–4.48:1, just misses | darken to clear 4.5:1 on canvas |
| `--fl-dark-ink-4` | 28% white | **1.94:1** — "2 of 5 tasks done" is effectively invisible | raise to ≥3:1, or stop using it for text |
| `--fl-dark-ink-3` | 48% white | 4.19:1 | raise to clear 4.5:1 |

Structure for all three viewer states: bare `:root` carries the full default light palette;
`@media (prefers-color-scheme: dark)` redefines tokens guarded as `:root:not([data-theme="light"])`;
`[data-theme]` / `[data-theme-family]` redefine again so an explicit choice wins both ways. **Never
define a colour only inside a media or attribute block.** Components consume semantic names only.
Persist family and mode through `PATCH /me`.

**Verify:** All three states behave — dark OS with no choice renders `fretlab` dark; choosing light on
a dark OS renders light; choosing `bloom` renders Bloom dark on either. **Re-run the contrast table:
every pair clears AA for its text size in all three combinations.** No element renders one theme's
text on another theme's ground.

---

### [ ] P6-04 — Mount the toast system

**Covers:** C-07 · **Files:** `components/**`, `Shell` · **Depends on:** P6-02

**Do:** `ToastStack` and `useToasts` are fully written and never imported; the app has no feedback
layer. Mount `ToastStack` in the shell, expose `useToasts` through context, and wire the real cases
now that mutations exist: settings saved, session logged, tab saved, tab exported, song imported,
import failed, AI request failed, offline write queued, queued write synced. Copy per §7 — the
confirmation reuses the button's verb ("Save changes" → "Changes saved").

**Verify:** Saving a setting raises a toast that auto-dismisses. Three in quick succession stack
correctly. Toasts are announced with `role="status"` and `aria-live="polite"`.

---

### [ ] P6-05 — Mount the command palette

**Covers:** C-07 · **Files:** `components/**`, `Shell` · **Depends on:** P6-02

**Do:** `CommandPalette` is fully written and never mounted. Mount on `⌘K` / `Ctrl+K` with: navigate
to each route, start a session, open the metronome, open the tuner, search chords, scales, songs and
saved tabs by name, toggle theme family and mode, sign out.

**Verify:** `⌘K` opens from any route. Typing "pent" surfaces the pentatonic scales. `Esc` closes.
Arrows and `Enter` work without a mouse. Focus returns to the previously focused element on close.

---

### [ ] P6-06 — Add responsive breakpoints across every route

**Covers:** U-51, U-52, U-53 · **Files:** `Shell`, all pages · **Depends on:** P6-02

**Do:** **Zero `@media` queries in 10,390 lines**, against 18 in the design system. This is the biggest
UX gap in the product.

Measured at 390px today: the sidebar is a fixed `224px` — **57% of the viewport** — and never
collapses; the greeting renders as "**Good**", clipped mid-phrase; the primary CTA wraps to three
lines; the page scrolls horizontally. **Tab Studio is functionally unreachable**: `224px` sidebar +
`286px` song list = **510px of fixed columns in a 390px viewport**, so the tab begins at x=510 and is
never visible with no affordance to reveal it.

§6 fixes the breakpoints: **`sm 640 / md 768 / lg 1024 / xl 1280`**, mobile-first shells, **sidebar
collapsing to a bottom bar under `md`**.

Per route: Practice Studio stacks its `1fr 280px` grid and reflows warm-ups 3 → 2 → 1; Tab Studio's
song list becomes a slide-over drawer and the tab `<pre>` gets its own `overflow-x: auto`; Library's
chord grid reflows and the detail panel becomes a sheet under `lg`; Theory's circle scales to
container width; Profile's grids stack with the leaderboard readable at 360px; the Tuner gauge scales
and its string selector wraps; the session player is already phone-first from P5-07.

Keep a minimum 16px side gutter at every width.

**Verify:** §9 requires **375px to 1920px with no horizontal scroll**. Test every route at 375, 640,
768, 1024, 1440 and 1920: no horizontal body scroll, no clipped text, no overlap, every interactive
target ≥44px. **On a 390px viewport the tab content in Tab Studio is visible and readable.**

---

### [ ] P6-07 — Adopt EmptyState as the shared element

**Covers:** C-07 · **Files:** `components/EmptyState.tsx`, pages · **Depends on:** P6-02, P4-09

**Do:** P4-09 added the four states inline. Promote the empty-state treatment to the single shared L3
element per §5's promotion rule and replace the inline versions. §7: empty states are invitations, not
shrugs — "No items yet. Create your first one."

**Verify:** Every empty state renders through one component. No page defines its own. Each names the
action that fills it.

---

### [ ] P6-08 — Fix keyboard access and expand semantics on card lists

**Covers:** U-57, U-58, U-59 · **Files:** Dashboard, Theory, Library, Tab Studio pages · **Depends on:** P6-01

**Do:** Warm-up cards, exercise rows, lesson rows and song cards are `<div onClick>` — not focusable,
not activatable by `Enter` or `Space`, invisible to screen readers as controls. Convert each to a real
`<button>` where it triggers an action, or add `role="button"`, `tabIndex={0}` and an `onKeyDown` for
`Enter`/`Space` where markup cannot change. **Add `aria-expanded`** to all four kinds of
expand/collapse card. Replace the single global focus rule with the design system's 8 component-level
`:focus-visible` treatments.

**Verify:** §9 requires the app **keyboard reachable with visible focus rings**. Tab through every
route with the keyboard alone: every card that responds to a click responds to `Enter`, shows a focus
ring, and announces its role and expanded state.

---

### [ ] P6-09 — Add practice keyboard shortcuts

**Covers:** C-03 · **Files:** `lib/hooks/useHotkeys.ts`, Session, Dashboard, Tuner · **Depends on:** P5-07

**Do:** A user holding a guitar cannot reach for a mouse, and there are no shortcuts at all — not even
`Space` for the metronome. Bind: `Space` start/stop metronome, `↑`/`↓` BPM ±1, `⇧↑`/`⇧↓` BPM ±5, `T`
tap tempo, `M` mute, `1`–`6` select tuner string, `?` shortcut overlay. Suppress all of them while a
text input has focus.

**Verify:** Every binding works on its route. Typing in the Tab Studio search box triggers nothing.
`?` lists the bindings accurately.

---

### [ ] P6-10 — Respect prefers-reduced-motion

**Covers:** U-61 · **Files:** `index.css`, animated components · **Depends on:** P6-02

**Do:** §9 requires it and the design system ships 6 rules, while the app has none and animates a
playhead, a tuner needle, a metronome pulse, progress rings, streaming text and a slide-in panel. Add
a global reduce rule removing decorative transitions and animations. Audit the cases where motion is
**informational** — the playhead, the needle, the metronome beat. Those are reduced, not removed: no
easing, no pulsing, no slide.

**Verify:** Enable reduced motion at OS level. No decorative animation plays. The playhead and needle
still convey their information without easing or pulse.

---

### [ ] P6-11 — Audit interface copy against §7

**Covers:** U-70, U-71 · **Files:** all of `apps/web/src/` · **Depends on:** P6-02

**Do:** §7 is binding: buttons name the outcome and the confirmation reuses the verb; errors state
what happened and the next move without apologising or being vague; empty states are invitations;
sentence case throughout, no all-caps labels; **no em dashes in any shipped copy**; name things the
way a user would.

Sweep every string. **Em dashes appear throughout today** — "Chords, scales, and songs — your complete
reference", "Your contribution graph — inspired by GitHub". **All-caps labels** are used widely via
`textTransform: uppercase`; decide per instance whether it is decorative typography (defensible) or a
field label (not), and bring the labels into line.

**Verify:** `grep -rn "—" apps/web/src --include=*.tsx` returns no shipped user-facing copy. No button
reads "Submit". Every error message names a next action. Report the strings you changed.

---

### [ ] P6-12 — Make the top bar functional

**Covers:** U-67, U-68 · **Files:** `Shell`, `lib/keyContext.tsx`, Theory and Library pages · **Depends on:** P4-08

**Do:** The top bar is largely non-functional furniture. The key badge permanently reads "C major"
with a dropdown chevron but is not a control. The centre pill duplicates the breadcrumb already at the
left, so the page name appears **twice in one 52px band**.

Make the key badge real: a context holding key and mode, a dropdown for all 12 keys × major/minor,
persisted through `PATCH /me`, seeded from the preferred-key setting, with Theory Studio's scale
explorer and Library's scale view reading from it instead of local state. Re-enable the control P0-12
disabled. **Remove the duplicate centre pill** or repurpose it for something the breadcrumb does not
already say (connection state from P4-02 is a good candidate).

**Verify:** Change to F♯ minor in the top bar — `/theory` and `/library` both reflect it and it
persists across reload and devices. The page name appears exactly once in the top bar.

---

### [ ] P6-13 — Fix the diatonic chord table

**Covers:** C-22 · **Files:** Theory Studio pages · **Depends on:** P6-12

**Do:** `DIATONIC_CHORDS_C` is hardcoded to C major — select F♯ and you still get C–Dm–Em–F–G–Am–B°.
Generate the diatonic triads and sevenths for the selected key and mode from intervals, using the same
engine `buildFretboardMarkers` already uses.

**Verify:** Each of the 12 keys in both modes produces the correct seven diatonic chords with correct
Roman numerals. Spot-check three against a reference.

---

### [ ] P6-14 — Code-split the bundle

**Covers:** C-39 · **Files:** `routes.ts`, `vite.config.ts` · **Depends on:** P6-01

**Do:** The build emits one 554 kB chunk. Convert routes to `React.lazy` with a `Suspense` fallback so
each page loads on demand and the shell ships small. Split the audio engine and pitch detection out of
the initial bundle too — they are only needed once a user starts practising.

**Verify:** `npm run build` emits multiple chunks with the entry chunk substantially under 554 kB;
report before and after. Every route loads and the fallback shows only briefly.

---

### [ ] P6-15 — Resolve hero treatment and height consistency

**Covers:** U-11, U-35 · **Files:** `Shell`, all page heroes · **Depends on:** P6-02

**Do:** Two related problems. **The Practice Studio hero ends on an unresolved hard horizontal edge** —
the dark band stops against the cream canvas with no gradient, shadow or overlap, so the page reads as
two documents stacked. And **hero heights vary 0–440px across routes** (Practice ~440, Library ~250,
Theory ~250, Tab ~200, Profile none), so navigating makes the whole layout jump.

Define one hero component with two documented sizes — `feature` (dashboard only) and `standard`
(every other route) — and one resolved bottom edge treatment: either a gradient falloff into the
canvas or a deliberate raised surface with shadow. Apply consistently. Profile either gets a
`standard` hero or the pattern is documented as intentionally absent there.

**Verify:** Navigate `/` → `/library` → `/theory` → `/tab` → `/profile` in sequence. Content start
positions are consistent for same-size heroes and the transition to canvas is resolved on every route.

---

### [ ] P6-16 — Give repeated card rows shared baselines and equal heights

**Covers:** U-14, U-46 · **Files:** Dashboard, Profile sections · **Depends on:** P6-02

**Do:** Cards in a row size to content, so a one-line description lifts that card's meta row above its
neighbours'. Visible on **warm-up cards** (row 2 col 3 sits higher) and **Weekly Challenge cards**
(the completed card carries a "Complete" line where others carry a count, making row 2 taller than
row 1).

Repeated things in a row must share edges, baselines and inner padding, with recurring elements in the
same place on each. Use a grid with equal-height rows and push the meta row to the card bottom with
`margin-top: auto`, so descriptions of different lengths do not move it.

**Verify:** In every card grid, the meta row (BPM chip, progress bar, count) sits at the same vertical
offset on every card in a row, at 1440px and at 768px.

---

### [ ] P6-17 — Layout density pass on dead space

**Covers:** U-12, U-30, U-32 · **Files:** Dashboard, Theory, Tab Studio pages · **Depends on:** P6-02, P6-06

**Do:** Three cards stretch over dead space rather than sizing to their content:

- **Practice history** card runs the full ~710px content width while the heatmap inside occupies ~220px flushed left — roughly **68% dead space**.
- **Theory Studio** leaves ~440px below the circle of fifths, which sits in a `1fr` column sized for a much taller sibling.
- **Tab Studio** leaves ~350px of dead canvas below the notation legend.

For each: either scale the content up to earn the space, or size the container to its content and let
the layout reflow. Let content set container height; never stretch a container over emptiness.

**Verify:** On each of the three routes, no card contains more than ~20% unused area at 1440px, and
none of the three pages ends with more than one viewport-height of empty canvas.

---

### [ ] P6-18 — Colour semantics and hierarchy pass

**Covers:** U-13, U-15, U-17, U-47, U-48, U-50 · **Files:** Dashboard, Profile, Shell · **Depends on:** P6-02, P6-03

**Do:** Colour is currently spent as decoration, which leaves nothing for real state. Fix six specific
instances:

1. **Two competing solid-accent primaries visible at once** — "Quick train" in the top bar and "Start today's session" in the hero. The control spec reserves primary for *"the next or highest-confidence action"*. Demote one to outline.
2. **Four hero stats in four unrelated colours** (orange, lavender, green, yellow) with no semantic meaning. Use one colour, or encode something true (for example, streak in the streak colour and the rest neutral).
3. **Accent applied to one of four figures** in the Profile stat row, arbitrarily. Same rule.
4. **The level progress bar is effectively invisible** on dark — a thin track with a small fill. Raise the track contrast and thicken it to the design system's progress geometry.
5. **League promotion and relegation dividers are imperceptible** — 1px dashed at low alpha. Use the semantic success/danger tokens at a legible weight, and label them in text, not colour alone.
6. **Sidebar `01`–`06` numerals imply a sequence that does not exist.** Navigation is not a process. Remove them, or replace with something true (a count, a state dot).

**Verify:** Exactly one solid-accent primary is visible per view. Every remaining use of colour encodes
something a user could name. The level bar and the league dividers are legible in both theme families.

---

### [ ] P6-19 — Replace emoji iconography with the SVG set

**Covers:** U-49 · **Files:** Dashboard, Profile, `data/drills`, `Gamification.tsx` · **Depends on:** P6-02

**Do:** Emoji stand in for iconography throughout — 🔥 📅 🎯 ⚡ 🎸 🏅 ✋ 🕷️ 🔨 📐 — beside an otherwise
custom SVG icon language. They render inconsistently across platforms, carry no theme awareness, and
are the one visual choice in the product that reads as template rather than design. One renders as a
clipped glyph on the Profile page today.

Replace with SVG icons drawn in the app's existing line style, sized on the control scale and coloured
through tokens. Where a drill or achievement genuinely needs a distinguishing mark, use a shape or
monogram from the system rather than an emoji.

**Verify:** `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" apps/web/src --include=*.tsx` returns
nothing in rendered copy. Every icon inherits `currentColor` and is legible in both theme families.

---

### [ ] P6-20 — Adopt the scales and fix control geometry

**Covers:** U-05, U-06, U-07, U-08, U-62 · **Files:** all of `apps/web/src/`, `theme/` · **Depends on:** P6-02

**Do:** The app improvises around its own scales. Measured today:

| Scale | Steps defined | Distinct literals used |
|---|---|---|
| Type | 6 (`2.55 / 1.9 / 1.35 / 0.95 / 0.82 / 0.7` rem) | **41** |
| Radius | 6 (`4 / 8 / 12 / 16 / 22 / 999`) | **11** |
| Motion | 2 (`140ms`, `240ms`) | **15**, with both tokens used **zero** times |
| Spacing | **none defined** | **20** distinct `gap` values |

The 41 font sizes include eight steps inside a 0.08rem band — below the threshold anyone perceives as
hierarchy, and the main reason the interface feels unresolved at small sizes.

1. **Collapse every font size onto the 6-step scale.** Where a literal is genuinely needed, add a step to the scale rather than a one-off.
2. **Collapse every radius onto the 6-step scale.**
3. **Collapse every duration onto `--fl-motion-fast` / `--fl-motion-base`** and use the tokens.
4. **Define a spacing scale** (`4 / 8 / 12 / 16 / 24 / 32 / 48`) as tokens and collapse the 20 gap values onto it.
5. **Fix touch targets.** Several controls fall below 44px: heatmap cells **11px**, sidebar settings **28px**, AI panel close **28px**, quick-tempo chips ~24px. The control system specifies 32 / 40 / 48px heights — conform, and ensure the hit area reaches 44px even where the visual is smaller.

**Verify:** Distinct literal font sizes ≤ 8, radii ≤ 6, durations ≤ 3 — report the counts before and
after. A spacing scale exists in the token file and gap literals outside it are gone. Every
interactive target measures ≥44px in the browser inspector.

---

### [ ] P6-21 — Introduce a z-index scale

**Covers:** U-03, U-10 · **Files:** `theme/`, `Shell`, `controls.tsx`, `AIPanel.tsx`, `TabStaff.tsx` · **Depends on:** P6-02

**Do:** Twelve z-index values with no scale — `0, 1, 20, 20, 99, 100, 200, 9999, 9999, 10000, 99999`.
`controls.tsx` alone escalates 9999 → 10000 → 99999. The design system defines `--fl-z-sticky: 20` and
`--fl-z-toast: 80` and neither is used.

Define a complete named scale in the token file — base, sticky, dropdown, overlay, drawer, modal,
popover, toast — restore the two dropped tokens, and replace every literal with a token. No component
may introduce a raw z-index.

**Verify:** `grep -rn "zIndex" apps/web/src` returns only token references. Every layered surface
stacks correctly: dropdown over sticky header, modal over dropdown, toast over modal.

---

### [ ] P6-22 — Unify the selection language

**Covers:** U-21, U-60 · **Files:** Library, Theory, Tab Studio, `components/` · **Depends on:** P6-02

**Do:** Three different selection treatments appear on one Library screen — folder tabs
(Chords/Scales/Songs), filter pills (All/Major/Minor), and card selection — reading as three unrelated
languages. The control spec distinguishes them deliberately: **pills filter a broad collection,
segmented controls switch between two to four mutually exclusive peer views, tabs switch document
sections.** Audit every selection surface, assign the correct control per that rule, and use one
visual treatment per control type across the whole app.

Also fix **selection encoded by colour alone**, against the spec's explicit *"selection uses shape,
boundary and elevation in addition to colour"*. Every selected state needs at least two of those.

**Verify:** Each selection control in the app maps to one of the three types by the spec's rule, and
same-type controls look identical across routes. Every selected state remains distinguishable in
greyscale.

---

### [ ] P6-23 — Rebuild the tuner layout

**Covers:** U-41, U-42, U-43 · **Files:** `pages/Tuner/**` · **Depends on:** P0-19, P6-02, P6-06

**Do:** Three layout problems remain after P0-19 fixes the gauge geometry:

1. **Two simultaneous string selectors** doing the same job — the chip row across the top and the "String reference" list down the right. Keep one. The right-hand list carries more information (note, octave, frequency, string number); the chip row is faster to hit. Choose and justify.
2. **~60% of the page is empty**, all of it lower-left. Rebalance so the gauge and the reference occupy the space, or narrow the content column.
3. **It is the only fully dark route.** `CONTROL-SYSTEM.md` states the direction is light-first with cinematic contrast *"contained inside artwork, fretboard, and instrument surfaces so contrast feels intentional rather than global."* Here the instrument surface has eaten the page. Contain the dark treatment to the gauge and its immediate surround, on the app's normal canvas — or document a deliberate exception and make it read as a decision, not an accident.

**Verify:** One string selector. No region of the page larger than ~25% is empty at 1440px. The route
sits in the same visual world as the other five, or carries a written justification for why it does
not.

---

### [ ] P6-24 — Rebalance Tab Studio toward its content

**Covers:** U-24, U-25, U-26, U-27, U-28, U-29, U-53 · **Files:** `pages/TabStudio/**` · **Depends on:** P6-02, P6-06

**Do:** Chrome overwhelms content. Global nav 224px + song list 286px + right rail 196px = **706px of
fixed furniture**, leaving the tab ~650px at 1440px — less than half the window — and making the route
unreachable at 390px.

1. **Collapse the right rail into the song hero or a drawer.** Its content (cover, key, tuning, BPM, genre, chord chips) mostly duplicates what the hero already shows.
2. **Make the tab the largest text on the page.** It renders at `0.78rem` mono against 0.8–0.92rem UI text; it is the reason the page exists.
3. **Remove the duplicate cover photo** — the same image renders in the hero and again in the rail ~400px apart.
4. **Lighten the hero image treatment.** It is over-darkened past reading as an image while still costing a full-width fetch. Either let it read, or drop it and use a tonal fill.
5. **Fix the "Print" button on unpredictable photography** — give it a solid surface rather than relying on whatever cover art loads.
6. **Fix the clipped import placeholder** — two 11px icons at `left: 8` against a `paddingLeft: 28` leave ~3px clearance, so the placeholder reads "youtube.com/watch?v=… or o". Either widen the padding or drop to one icon.

**Verify:** At 1440px the tab occupies at least 60% of the content area and is the largest text on the
page. At 390px the tab is visible and readable. The cover image appears once. The import placeholder
is fully legible.

---

### [ ] P6-25 — Rebalance the Library grid and detail panel

**Covers:** U-19, U-20, U-22, U-23 · **Files:** `pages/Library/**`, `ChordLibrary.tsx` · **Depends on:** P6-02, P6-06

**Do:** Four layout and legibility problems:

1. **An orphaned card sits alone on the last row** — 16 chords in a 5-column grid. Pick a column count the collection fills at each breakpoint, or let the grid auto-fit so the last row is never a single item.
2. **~700px of vertical dead space** beside the detail panel, which is 320×110 in a column running the full page height. Let the column size to its content, or move the empty state inline.
3. **Finger numbers inside chord dots are near-illegible** — dark text at ~7px on saturated fills. Raise the dot size, the type size, or the contrast; measure the result against AA.
4. **Within-card alignment is inconsistent** — chord name left-aligned, formula centered. Pick one.

**Verify:** No grid row contains a single orphaned card at 1440, 1024 or 768px. The detail column
contains no more than ~20% unused area. Finger numbers clear AA against their dot fill. Card contents
share one alignment.

---

### [ ] P6-26 — Integrate the circle of fifths palette

**Covers:** U-31, U-34 · **Files:** `CircleOfFifths.tsx`, Theory pages · **Depends on:** P6-02, P6-03

**Do:** The circle of fifths is the best-executed component in the product, in a palette that belongs
to a different one. Its wedge fills run a full 360° hue rotation (`289 + i × 30`) while the rest of
the app is violet-on-cream, so it reads as an imported rainbow rather than a system.

The intent — **key identity as hue** — is sound and is documented in the design system's README
(`--fl-key-h`, served as `289 + fifths * 30`). The problem is that **nothing else in the app carries
the key hue**. Two honest options, choose one and say which:

- **(a) Commit to it.** Wire `--fl-key-h` through the app as the design system intends, so the key badge, chord cards, scale cards, degree chips and neighbour rows all tint to the current key. The circle then reads as the legend for a system the whole app uses.
- **(b) Contain it.** Reduce the circle to the app's violet family with lightness rather than hue encoding position, and drop the key-hue idea from the token file so it stops implying a system that does not exist.

Also fix **neighbouring-key cards using `--fl-surface-sunk`**, which is the app's disabled treatment
elsewhere, so adjacent keys read as unavailable. Use a neutral raised surface instead.

**Verify:** For (a): changing the global key visibly tints at least four distinct component types
consistently. For (b): no component uses a hue outside the app's family, and `--fl-key-*` is gone from
the token file. Either way, neighbouring-key cards no longer read as disabled.

---

# Phase 7 — Gamification, server authoritative

*Connect playing a guitar to XP, streaks, leagues and achievements — with the server as source of
truth, because a client-authoritative economy is trivially cheatable.*

---

### [ ] P7-01 — Implement the XP mint server side

**Covers:** C-25 · **Files:** `apps/api/src/services/xp.ts`, `routes/sessions.ts` · **Depends on:** P3-04, P3-05

**Do:** The XP curve and rank titles in `lib/gamification.ts` are correct and complete; nothing feeds
them and `PLAYER.xp` is a constant. **Award XP on the server when a session is logged. Never accept a
client-supplied XP amount.**

| Event | XP |
|---|---|
| Practice minute logged | 2, capped at 90 min/day |
| Drill completed at target BPM | 40 |
| New personal-best BPM | 60 |
| Clean run, no missed beats | ×1.5 multiplier |
| Lesson quiz question, first pass | 25 each |
| Song section mastered | 120 |
| Daily streak maintained | +10% per day, capped at +50% |
| Weekly challenge cleared | 200–350, per the existing `Challenge.xp` |

Write an `XpEvent` per award so the ledger is auditable. Move the level curve into `packages/shared`
so both sides compute the same level from the same total.

**Verify:** A 10-minute session with one drill at target BPM awards exactly 60 XP (20 + 40) and the
level card reflects it. 100 minutes in a day caps minute XP at 180. A client POSTing a forged XP
amount changes nothing.

---

### [ ] P7-02 — Implement streak mechanics

**Covers:** C-26 · **Files:** `apps/api/src/services/streaks.ts`, Profile, Dashboard · **Depends on:** P3-04

**Do:** The streak is hardcoded to 14. Implement it properly, with the mechanics that stop streaks
dying by accident:

- **Minimum viable day** — 5 minutes or one completed drill counts.
- **Streak freeze** — earn one per 7-day streak, hold at most two, auto-spend on a missed day.
- **Streak repair** — within 48 hours, restore a broken streak with a double session.
- **Rest days** — one user-designated weekly rest day never breaks a streak.
- **Milestones** at 7, 14, 30, 100, 365.

All date arithmetic in the **user's local timezone**, stored on the user record. Handle DST changes
and a user travelling across timezones without destroying a streak.

**Verify:** Simulate a missed day with one freeze banked — the streak survives and the freeze is
consumed. With none — it breaks and a repair offer appears for 48 hours. A rest day never breaks it. A
user moving UTC+13 → UTC-8 keeps their streak.

---

### [ ] P7-03 — Build the per-item mastery ladder

**Covers:** C-24 · **Files:** `apps/api/src/services/mastery.ts`, `models/ExerciseRecord.ts` · **Depends on:** P3-05

**Do:** Progress is one global number. Real practice apps track mastery **per drill, per chord, per
scale shape**. Implement the five-state ladder — `new → learning → familiar → solid → mastered` — on
`ExerciseRecord` and equivalent records for chords and scales. Promotion requires *n* clean runs at
increasing tempo (define thresholds per state). Demotion happens through time decay: an item not
practiced for its interval drops one state, never to zero. This is what makes P7-04, honest
achievements and meaningful heatmap colours possible.

**Verify:** Practice one drill cleanly four times at rising tempo — it climbs all five states.
Backdate `last_practiced_at` past the decay interval — it drops exactly one state.

---

### [ ] P7-04 — Build the spaced-repetition review queue

**Covers:** C-24 · **Files:** `apps/api/src/services/review.ts`, Dashboard sections · **Depends on:** P7-03, P3-05

**Do:** "7 items are due for review" is the strongest possible reason to open the app. Compute due
items from each record's state and `last_practiced_at` using expanding intervals (1, 3, 7, 14, 30 days
by state), served from `GET /exercise-records/due`. Surface the queue prominently on the dashboard and
let it seed a session directly.

**Verify:** With items at different states and dates, the queue lists exactly those past their
interval, most overdue first. Completing one from a review session removes it and resets its interval.

---

### [ ] P7-05 — Generate the daily routine from weakest items

**Covers:** C-24 · **Files:** `apps/api/src/services/routines.ts` · **Depends on:** P7-03, P7-04, P3-06

**Do:** Replace the stub body of `GET /routines/today` (P3-06 left the contract in place) with real
selection: one warm-up appropriate to the user's level, the most overdue review items, one drill
targeting the lowest-mastery technique, and one song section in progress. Respect a target session
length from settings. Keep it overridable — a user can swap or remove a step and that choice persists
for the day.

**Verify:** With a populated account the routine reflects real weak areas and changes as mastery
changes. Swapping a step persists across reload on the same day and resets tomorrow.

---

### [ ] P7-06 — Expand leagues to ten tiers with real cohorts

**Covers:** C-27 · **Files:** `apps/api/src/models/League*.ts`, `services/leagues.ts` · **Depends on:** P7-01

**Do:** There is one league ("Amethyst") with seven fictional rows in a client constant. Build the real
system server side:

- **Ten tiers:** Nylon → Bronze → Copper → Amethyst → Sapphire → Emerald → Ruby → Obsidian → Platinum → Legend.
- **Cohorts of 30**, assigned on the first qualifying session of the week; top 7 promote, bottom 5 relegate.
- **Weekly reset Sunday 23:59 local**, run by a scheduled job. Make the existing "Ends in 3d" badge a live countdown.
- **Bot cohorts.** With no user base, seed each cohort with plausible bot XP schedules that accrue through the week rather than appearing fully formed. Standard practice, and the only way leagues work pre-scale. **Mark bots in the data model** so they can be removed cleanly, and never let one appear in a real user's notification or social surface.
- A rank-change reveal on the first visit after a reset.

**Verify:** Earning XP moves your row. Advancing the clock past Sunday 23:59 runs the reset, changes
tier correctly on promotion and relegation, and shows the reveal once. Bots are identifiable in the
database and excluded from anything social.

---

### [ ] P7-07 — Wire the weekly challenges

**Covers:** C-28 · **Files:** `apps/api/src/models/Challenge.ts`, `services/challenges.ts` · **Depends on:** P7-01, P7-02

**Do:** Four challenges have progress bars nothing increments and rewards never paid. Move them server
side and connect each to a real event source: practice days from the session log, clean chord changes
from P5-08's scoring, personal bests from `ExerciseRecord`, scales run at tempo from mastery. Write at
least **12 challenges**, rotate weekly on the league schedule, reset progress, and award the `xp` value
on completion with a notification and a visible celebration.

**Verify:** Completing a challenge lands XP in the ledger and the level card, and raises a
notification. Past the reset, a different set appears with progress at zero.

---

### [ ] P7-08 — Implement the achievement engine

**Covers:** C-29 · **Files:** `apps/api/src/services/achievements.ts`, `models/Achievement.ts`, Profile · **Depends on:** P7-01, P7-02, P7-03

**Do:** Eight achievements have hardcoded `earned` flags and hand-typed dates. Build an engine
evaluating criteria against real data after each session, unlocking with a timestamp and a
notification. Expand to the full taxonomy:

- **Consistency** — streaks at 7/14/30/100/365 · Dawn Patrol (10 sessions before 7am) · Night Shift (10 after 11pm) · a full calendar month
- **Technique** — Speed Demon (any drill at 180 BPM) · Box Set (all 5 pentatonic boxes at 120) · Barre Exam (F barre clean at 80) · Sweeper (sweep arpeggio clean at 140)
- **Knowledge** — Theory Scholar (all 10 lessons) · Straight A (5 perfect quizzes) · Circle Master (all 12 key signatures) · Golden Ear (20 intervals by ear)
- **Repertoire** — Encore (first song end to end) · Setlist (10 songs mastered) · Session Cat (a song in each of 5 genres) · Composer (export an original tab)
- **Exploration** — Twelve Tones (all 12 keys) · Retuned (all 5 alternate tunings) · Modal Nomad (every mode)
- **Hidden** — Perfect Pitch (all 6 strings within 2¢ in one pass) · No Days Off (practice on a public holiday) · Obligatory (play Smoke on the Water on day one)

Achievements whose criteria are not yet measurable must be **defined but marked unobtainable** rather
than silently never firing. List which in your log entry.

**Verify:** Trigger three from different categories through real activity. Each unlocks once with an
accurate date and never re-fires. Locked achievements show progress where the criterion is countable.

---

### [ ] P7-09 — Award XP for theory lessons and quizzes

**Covers:** C-23 · **Files:** `apps/api/src/routes/lessons.ts`, Theory Studio pages · **Depends on:** P7-01

**Do:** Quiz results in `CheckForUnderstanding` are computed, displayed and discarded — no XP, no
completion state, no progress toward Theory Scholar. Ten genuinely complete lessons earn nothing.
Persist per-lesson completion and best quiz score server side, award 25 XP per **first-pass** correct
answer, mark completed lessons in the list, and back the "Save for later" bookmark P4-08 wired.

**Verify:** Completing a quiz lands XP, marks the lesson complete, and persists across devices.
Retaking it does not re-award first-pass XP.

---

### [ ] P7-10 — Build the gamification client surfaces

**Covers:** C-25, C-27 · **Files:** `pages/Profile/**`, `Gamification.tsx` · **Depends on:** P7-01, P7-06, P7-07, P7-08, P4-12

**Do:** Point `LevelCard`, `Leaderboard` and `WeeklyChallenges` at the API instead of the constants in
`lib/gamification.ts`. Delete `PLAYER` and `LEADERBOARD`. Keep the level-curve helpers, now imported
from `packages/shared` so client and server agree. Add the **XP ledger view** — a user should be able
to see where their points came from.

**Verify:** Every number on `/profile` traces to an API response. Two browsers on the same account show
identical figures. `grep -rn "const PLAYER\|const LEADERBOARD" apps/web/src` returns nothing.

---

### [ ] P7-11 — Make goals real

**Covers:** C-30 · **Files:** Profile pages, `services/goals.ts` · **Depends on:** P3-06, P0-11

**Do:** The four goals are a constant and "+ Add goal" is inert. Implement create, edit, complete and
delete against the API. Where a goal can be tied to a measurable target — a BPM on a named exercise, a
song mastered, a lesson finished — let the user link it so progress computes server side instead of
being self-reported. Re-enable the control P0-12 disabled.

**Verify:** Create a goal linked to 100 BPM on a named exercise. Practice that exercise to 100 BPM —
the goal completes on its own. Deleting a goal keeps it deleted across devices.

---

### [ ] P7-12 — Make the heatmap encode mastery

**Covers:** C-24 · **Files:** `PracticeGraph.tsx`, `services/sessions.ts` · **Depends on:** P7-03, P4-04

**Do:** Cell intensity maps to minutes, which rewards sitting with a guitar rather than improving. Add
a mastery series to the stats endpoint and a toggle between "Minutes" and "Mastery gained", with
mastery as the default, colouring by net mastery-state promotions that day.

**Verify:** A long unproductive session and a short productive one are visibly distinguishable in
mastery mode. The toggle persists per user.

---

# Phase 8 — Content library

*One source of truth, generated rather than hand-typed, seeded into Mongo, and licensed before it
scales.*

---

### [ ] P8-01 — Model content and move it server side

**Covers:** C-09 · **Files:** `apps/api/src/models/{Chord,Scale,Drill,Song,Lesson}.ts` · **Depends on:** P3-01, P0-15

**Do:** Content is defined inline in page files and duplicated — songs twice (Tab Studio 9, Library 9,
overlapping but not identical), scales twice (Library 8 hand-typed, Theory 12 generated), with sidebar
counts matching neither. Model each as a collection with a `slug`, a `version`, and a `source` of
`system` or `user`, so seeded and user-created content coexist. Serve read-only list and detail
endpoints under `/api/v1/content/*` with the collection envelope, filtering and search. Cache
aggressively — this changes on deploy, not per request.

**Verify:** `grep -rn "const SONGS\|const SCALES\|const CHORDS\|const WARMUPS" apps/web/src` returns
nothing. Every page renders the same content as before, from the API. Sidebar counts come from
`page.total`.

---

### [ ] P8-02 — Generate the chord library from formulas and shapes

**Covers:** C-01 · **Files:** `apps/api/src/seed/chords.ts`, `lib/chordgen.ts` · **Depends on:** P8-01, P0-03

**Do:** 24 hand-typed chords produced 7 wrong voicings. Hand-typing 120 will produce more. Generate
instead: a **formula table** (quality → interval set) and a **shape table** (CAGED root-string
templates with movable fingerings), producing every root × quality × position combination, each
validated by P0-03's validator **before it is written**. Cover triads (maj, min, dim, aug); sevenths
(maj7, 7, m7, mMaj7, m7♭5, dim7); suspended (sus2, sus4, 7sus4); added (add9, 6, m6, 6/9); extended
(9, maj9, m9, 11, 13); altered (7♯5, 7♭5, 7♯9 — the Hendrix chord — 7♭9); power and octave shapes.

**Verify:** At least 120 chords seed. Validation passes on all. Spot-check ten against a published
chord dictionary. No voicing exceeds a 5-fret span.

---

### [ ] P8-03 — Enrich the chord model

**Covers:** C-09 · **Files:** `models/Chord.ts`, Library pages · **Depends on:** P8-02

**Do:** Add per chord: multiple voicings (open, E-shape barre, A-shape barre, drop-2, drop-3,
top-3-string triad); labelled inversions (root, 1st, 2nd); a difficulty rating and `requires_barre`
flag so beginners can filter; function tags (which keys it is I/IV/V/ii/vi in); common substitutions;
and the songs that use it. Surface voicing switching and difficulty filtering in the UI.

**Verify:** Select C major and cycle at least four distinct voicings, each rendering and sounding
correctly. Filtering to "no barre" excludes every barre voicing.

---

### [ ] P8-04 — Unify scales onto the Theory Studio engine

**Covers:** C-09, C-34, C-38 · **Files:** `apps/api/src/seed/scales.ts`, `lib/scales.ts`, Library and Theory pages · **Depends on:** P8-01

**Do:** Library's scale positions are **hand-typed two-string fragments** — six or seven dots, not a
real pattern. Theory Studio already has a correct generator (`buildFretboardMarkers`) producing every
occurrence across the neck with proper tone roles, and Library does not use it. Move the generator to
shared code, delete Library's `buildMarkers` and its hand-typed arrays, and drive both pages from
interval definitions. Note Library's `buildMarkers` also **mislabels the first marker as root
regardless of pitch** — that bug disappears with it.

**Verify:** Every scale in Library shows a complete correct neck pattern with roots marked in every
octave. Library and Theory show identical markers for the same scale and key.

---

### [ ] P8-05 — Expand to 30 scales

**Covers:** C-09 · **Files:** `apps/api/src/seed/scales.ts` · **Depends on:** P8-04

**Do:** Add as interval definitions: **Modes** — Phrygian, Lydian, Locrian in Library (Theory has them);
**Minor family** — melodic minor, Phrygian dominant, Dorian ♭2, Lydian ♯2; **Pentatonic** — Hirajoshi,
In Sen, Egyptian; **Blues** — major blues, composite blues; **Symmetric** — whole tone, diminished (H-W
and W-H), chromatic; **Jazz** — bebop dominant, bebop major, altered, Lydian dominant; **World** —
harmonic major, Hungarian minor, Byzantine, Enigmatic.

**Verify:** All 30 render correct patterns in all 12 keys. Spot-check five interval sets against a
reference.

---

### [ ] P8-06 — Add per-scale teaching data

**Covers:** C-34 · **Files:** `models/Scale.ts`, Library pages · **Depends on:** P8-05

**Do:** A diagram is not a lesson. Add per scale: all 5–7 box positions individually selectable, a
3-note-per-string layout, the characteristic note that gives the scale its flavour, the parent scale,
the chords it fits over, and two reference songs.

**Verify:** Minor pentatonic offers all five boxes individually and highlights the ♭3 as its
characteristic note. The listed chords are genuinely diatonic to it.

---

### [ ] P8-07 — Expand drills to 30 with real pattern data

**Covers:** C-37 · **Files:** `apps/api/src/seed/drills.ts` · **Depends on:** P8-01

**Do:** Six warm-ups exist as description-only cards, which is why "▶ Start" had nothing to run. Expand
to 30 with a `tab_pattern` on every one so it renders on the fretboard and runs in the session player.
Families: Spider 4, Picking 4, Rhythm 4, Legato 4, Expression 3, Chords 4, Scales 4, Knowledge 3. The
full proposed list is in [AUDIT.md §6.1](AUDIT.md). Required fields: `tab_pattern`, `start_bpm`,
`target_bpm`, `success_criteria`, `prerequisites`, `related_lesson`, `family`, `level`,
`estimated_minutes`.

**Verify:** All 30 have a non-empty `tab_pattern` that parses. Each renders on the fretboard, runs in
the session player, and its prerequisites reference real drill slugs.

---

### [ ] P8-08 — Add a drills tab to the Library

**Covers:** C-37 · **Files:** `pages/Library/**` · **Depends on:** P8-07

**Do:** The product spec says "Library (Chord, Drills, exercises)" and there is no drills tab — drills
live only on the dashboard. Add a fourth tab with filtering by family, level and mastery state, and a
detail view showing the pattern, prerequisites and related lesson.

**Verify:** `/library` shows four tabs. The drills tab lists all 30, filters correctly, and starting one
enters the session player.

---

### [ ] P8-09 — Build the song difficulty ladder

**Covers:** C-09 · **Files:** `apps/api/src/seed/songs.ts` · **Depends on:** P8-01, P8-12

**Do:** The nine current songs skew classic-rock and intermediate with no path for a beginner.
Restructure into five tiers grouped by **what a song teaches**, not genre — full list in
[AUDIT.md §6.4](AUDIT.md): (1) two to four open chords, (2) riffs before barre chords, (3) barre
chords and fingerpicking, (4) lead and solo studies, (5) technique showcases. **Read P8-12 first.**
Build the ladder from public-domain, traditional, original and chord-only material.

**Verify:** Every tier has at least five entries. A complete beginner has an unbroken path from tier 1
to tier 2 with no unexplained difficulty jump.

---

### [ ] P8-10 — Add song sections and metadata

**Covers:** C-09 · **Files:** `models/Song.ts`, Tab Studio pages · **Depends on:** P8-09

**Do:** Songs are one undifferentiated tab blob. Add a `sections[]` array (intro, verse, chorus, solo,
outro), each separately selectable, practiceable and loopable, plus `techniques_required`,
`prerequisite_drills`, `slow_practice_tempo` and `licensing`. Let a user practice one section rather
than the whole song.

**Verify:** Select a song → intro only, and the session player loops just that section at the
slow-practice tempo.

---

### [ ] P8-11 — Build the tab generator, or remove the claim

**Covers:** C-20, C-21 · **Files:** `apps/api/src/services/tabgen.ts`, Tab Studio pages · **Depends on:** P5-03, P5-06

**Do:** "Tab Generator from Songs" is a headline feature with no implementation. Importing a URL
invents a placeholder titled "YouTube Song" after a fake 800 ms delay and produces "Tab for this song
is not available yet." Two honest options — choose one and say which:

- **(a) Build it.** Audio → pitch and onset detection (reuse P5-03) → note events → fret-position assignment minimising hand movement → tab. Substantial and approximate: present output as a **draft the user edits in `TabStaff`**, never as authoritative. Run analysis server side so a long track does not block the browser.
- **(b) Cut it.** Remove the claim, and change import to fetch real title and artist via oEmbed so the embed is a genuine play-along reference paired with the existing editor.

**Do not leave it as a fake.**

**Verify:** For (a): importing a simple single-note melody produces a tab whose pitches match. For (b):
importing a URL shows the real title and artist, and nothing claims a tab was generated.

---

### [ ] P8-12 — Add licensing metadata and gate the content pipeline

**Covers:** C-41 · **Files:** `models/Song.ts`, `docs/content-licensing.md` · **Depends on:** P8-01

**Do:** Tab transcriptions of copyrighted songs are derivative works. NMPA enforcement in the 2010s
closed several large tab sites; Ultimate Guitar and Songsterr operate under publisher licences. Scaling
to 60 songs without addressing this is a legal risk, not a content task.

Add a required `licensing` field — `public-domain` | `traditional` | `original` | `chord-only` |
`user-private` | `licensed` — and refuse to seed or serve a song lacking it. Enforce that
`user-private` songs are never returned to another user. Document the policy in
`docs/content-licensing.md`: which categories may ship publicly, that user-uploaded tabs stay private
to that user, and that commercial licensing is a business-development step rather than a content task.

**Verify:** Every seeded song carries a `licensing` value. A song added without one fails the seed. A
`user-private` song is invisible to every other account, including an admin listing. The policy
document exists and names the safe categories explicitly.

---

# Phase 9 — Definition of done and deploy

*Each task maps to one line of the contract's §9 checklist.*

---

### [ ] P9-01 — Make `docker compose up` produce a working app

**Covers:** C-05 · **Files:** `docker-compose.yml`, Dockerfiles, `README.md` · **Depends on:** P1-02, P1-03, P2-04

**Do:** §9: **`cp .env.example .env && docker compose up -d` produces a working app, no manual steps.**
Services for Mongo, the API and the web build, with healthchecks and `depends_on` conditions so the API
waits for a healthy database. Multi-stage Dockerfiles, non-root users, no dev dependencies in the
runtime image. Run migrations and the seed on first start, guarded so a restart does not re-seed.

**Verify:** From a clean checkout with no Node installed locally, those two commands produce a working
app in a browser, signed in with the seeded credentials, with **no manual steps**. Verify on a machine
that has never run the project.

---

### [ ] P9-02 — Verify `AUTH_MODE=local` needs no external services

**Covers:** C-33 · **Files:** `docker-compose.yml`, CI config · **Depends on:** P9-01, P2-12

**Do:** §9 requires `AUTH_MODE=local` to work with no external services. Verify and document: no IdP,
no mail provider (the dev transport logs), no object store (local disk), no Redis. Add a CI job running
the full test suite and a smoke test of the §1 flows with only Mongo available.

**Verify:** With networking to everything but Mongo blocked, register, verify, sign in, log a session,
upload a file and sign out all work. CI passes on a runner with no external services.

---

### [ ] P9-03 — Prepare the OIDC branch without enabling it

**Covers:** C-33 · **Files:** `services/auth/oidc.ts`, `docs/auth-oidc.md` · **Depends on:** P2-04, P2-07

**Do:** §9 requires `AUTH_MODE=oidc` to work against Authentik. That is **out of scope per the settled
decision**, but the branch must not rot. Keep the strategy interface, the `/auth/callback` route and
the role-resolution seam typed and tested against a mock. Write `docs/auth-oidc.md` naming exactly what
completing it requires: Authorization Code + PKCE, the Authentik group-to-role mapping, `end_session`
on logout, and the env vars already stubbed. Add a test asserting `AUTH_MODE=oidc` makes
`/auth/register` return 404 and `/auth/callback` stop returning 501.

**Verify:** The document names every remaining step. The strategy interface compiles with both
implementations present. Tests pin the mode-switching behaviour the contract specifies.

---

### [ ] P9-04 — Extend the seed to cover every §1 flow

**Covers:** C-05 · **Files:** `apps/api/src/seed/**` · **Depends on:** P1-13, P7-01, P8-01

**Do:** §9 requires one owner, one member, twelve items and three notifications. Extend P1-13 to also
seed what makes the app demonstrable: practice sessions across the last 60 days (so graphs and streak
are non-empty), exercise records at varied mastery states, a populated league cohort with bots, two
goals, and the full content library. Keep it idempotent with the production-name guard.

**Verify:** After seeding, every §1 flow is demonstrable without manually creating data, and the
dashboard, graphs, leaderboard and library all render populated.

---

### [ ] P9-05 — Wire the tempo ladder into the session player

**Covers:** C-07 · **Files:** `components/practice.tsx`, Session pages · **Depends on:** P5-07, P5-08

**Do:** `TempoLadder` is already written and unused. Wire it: after each clean pass, auto-increment BPM
by a configurable 2–5; after a failed pass, hold or step down. Show the ladder's history for the session
so progress is visible, and record the reached BPM through `PUT /exercise-records/:id`.

**Verify:** Three clean passes climb by the configured step each time. One failure holds rather than
advancing. The best BPM persists.

---

### [ ] P9-06 — Complete the test suite against §9

**Covers:** C-06 · **Files:** `__tests__` across both apps · **Depends on:** P2-12, P3-10, P1-12

**Do:** §9 requires tests for auth flows, one CRUD round trip, one upload and the envelope shape —
landed in P2-12 and P3-10. Add what FretLab specifically needs: the XP award table, streak edge cases
(freeze, repair, rest day, timezone move), mastery promotion and decay, the chord validator, and the
tab parser round trip including technique glyphs. Add a **boundary-violation test** per §9: a deliberate
L3-imports-API import fails the build.

**Verify:** `npm test` passes from a clean checkout with no Docker. Every item in §9's test line is
covered by a named test. The boundary test fails when the rule is removed.

---

### [ ] P9-07 — Verify responsive and accessibility requirements

**Covers:** U-16, U-54 · **Files:** `apps/web/src/**`, `docs/accessibility.md` · **Depends on:** P6-06, P6-08, P6-10, P6-20

**Do:** §9 requires **375px to 1920px with no horizontal scroll**, and **keyboard reachable, visible
focus rings, `prefers-reduced-motion` respected**. Audit every route against all four and fix what
fails. Add an automated pass (axe or equivalent) in CI covering every route in **both theme families**,
and document known exceptions with a reason and an owner.

**Verify:** Every route at 375, 768, 1024, 1440 and 1920 with no horizontal body scroll. Full keyboard
traversal with visible focus. Reduced motion honoured. The automated pass reports no violations, or only
documented exceptions. **Re-run the contrast table from the evidence appendix: every pair passes.**

---

### [ ] P9-08 — Write the README and rename procedure

**Covers:** C-06 · **Files:** `README.md`, `docs/` · **Depends on:** P9-01, P3-11

**Do:** §9 requires the README to document **every env var** and the **rename-`Item` starting
procedure**. Document each variable from `.env.example` with what it does, whether it is required, and
its safe default. Call out the `MONGODB_URI` slot explicitly as the one a new developer fills first.
Since FretLab already renamed `Item` to `TabSheet`, document that as the worked example: which files
changed, which wires stayed identical, and how to repeat it for a new resource.

**Verify:** A developer who has never seen the repo gets from clone to running app using only the
README. Every variable in `.env.example` appears in it. The rename procedure is followed successfully
for a test resource.

---

### [ ] P9-09 — Ship the deploy configuration

**Covers:** C-05 · **Files:** `docker-compose.prod.yml`, CI config, `docs/deploy.md` · **Depends on:** P9-01

**Do:** §9 requires deploying to Lab-v2 with a compose file, Traefik labels and a `*.platform.local`
hostname. Write the production compose with Traefik labels for web and API, TLS, health-gated rollout,
and migrations as a **pre-deploy step rather than on app boot**. Document rollback and where logs and
the health endpoint live.

**Verify:** Deploying to Lab-v2 serves the app on its `*.platform.local` hostname over TLS, health
endpoint green, migrations applied. A rollback restores the previous version.

---

### [ ] P9-10 — Decide the billing surface

**Covers:** C-32, U-72 · **Files:** Profile pages, `docs/billing.md` · **Depends on:** P4-12, P2-10

**Do:** The Account panel advertises "FretLab Pro", "Renews Jan 14, 2027" and a "Manage plan" button
over nothing. P4-12 removed the fabricated values; this settles what replaces them. Either implement a
real billing integration, or **remove the plan card entirely until there is a product to sell**. Do not
ship a plan card describing a subscription that does not exist. Record the decision in
`docs/billing.md`.

**Verify:** The Account panel either reflects real subscription state from a real provider, or contains
no plan card. No fabricated renewal date or storage figure appears anywhere.

---

### [ ] P9-11 — Add export formats

**Covers:** C-17 · **Files:** `apps/api/src/services/export.ts`, Tab Studio and Library pages · **Depends on:** P4-07

**Do:** The Account panel promised exports and none exist. Add PDF chord sheets, plain ASCII tab (P4-07
covers the generator), MusicXML, and Guitar Pro `.gp5` if feasible. Add a print stylesheet so the
`window.print()` P0-12 wired produces something usable. Generate server side so a large export does not
block the browser, delivered through the P3-07 signed-URL path.

**Verify:** Export a tab as ASCII and MusicXML; the MusicXML opens correctly in MuseScore. Printing a
song produces a clean readable sheet with no UI chrome.

---

### [ ] P9-12 — Ship as an installable offline PWA

**Covers:** C-05 · **Files:** `manifest.json`, service worker, `vite.config.ts` · **Depends on:** P6-06, P4-02

**Do:** Practice happens in garages, practice rooms and basements. Add a manifest, icons and a service
worker caching the app shell plus all library content. The metronome, tuner, chord and scale libraries
and the session player must work fully offline, with sessions queued through P4-02's offline queue and
synced on reconnect. **Never cache an authenticated API response containing another user's data, and
never cache auth responses at all.**

**Verify:** Install to a phone home screen. In airplane mode the app launches, a full session runs, and
it syncs once connectivity returns — producing exactly one session record.

---

# Contract conformance checklist

**This is the gate.** The plan is not complete until every box below is checked. Each line maps to a
clause of [APP-TEMPLATE-CONTRACT.md](APP-TEMPLATE-CONTRACT.md). Check a box only after demonstrating
it in the running app — not by reading code.

## §1 — The invariant

**Identity**
- [ ] Sign up
- [ ] Sign in
- [ ] Sign out
- [ ] Session restored on cold start
- [ ] Silent refresh on expiry
- [ ] Password reset request
- [ ] Password reset completion
- [ ] Email verification
- [ ] Protected routes
- [ ] Public routes
- [ ] Role-gated routes

**Account**
- [ ] Read own profile
- [ ] Update own profile
- [ ] Upload avatar (with real progress)
- [ ] Remove avatar
- [ ] Delete account

**Resource (`TabSheet`, the renamed `Item`)**
- [ ] List
- [ ] Detail
- [ ] Create
- [ ] Edit
- [ ] Delete
- [ ] Pagination on the list
- [ ] Search on the list
- [ ] Sort on the list
- [ ] Optimistic update on edit
- [ ] Rollback on failure

**Files**
- [ ] Direct upload with progress
- [ ] Type validation server side (by magic bytes, not header)
- [ ] Size validation server side
- [ ] Signed read URLs
- [ ] Delete

**Notifications**
- [ ] In-app list
- [ ] Unread count
- [ ] Mark read
- [ ] Mark all read
- [ ] Server push channel (SSE)
- [ ] Per-category preferences on the settings screen

**Every screen**
- [ ] Loading state on every screen
- [ ] Empty state on every screen, naming the action that fills it
- [ ] Error state on every screen, naming what failed and what to do next
- [ ] Ready state on every screen

## §2 — Auth contract

- [ ] `AUTH_MODE` selects the implementation; the frontend never learns which
- [ ] All ten `/api/v1/auth/*` endpoints exist and return their documented shapes
- [ ] `AUTH_MODE=local` fully implemented
- [ ] `AUTH_MODE=oidc` branch typed, stubbed and tested against a mock *(deferred by decision — P9-03)*
- [ ] Access and refresh tokens stay server side
- [ ] Browser holds an httpOnly, SameSite=Lax session cookie
- [ ] **No tokens in `localStorage`, ever** — verified in DevTools and in the offline cache
- [ ] Refresh rotates, both modes
- [ ] Refresh reuse revokes every session for that user
- [ ] `role` resolved to `owner` | `admin` | `member`
- [ ] Route guards read the resolved role, not the raw claim

## §3 — Wire format

- [ ] Base path `/api/v1` on every route
- [ ] JSON only
- [ ] UTC ISO-8601 timestamps
- [ ] Error envelope on **every** failure including unhandled 500s
- [ ] `code` is a stable machine string; clients switch on it, never on `message`
- [ ] `message` follows §7 copy rules
- [ ] `request_id` matches the server log line
- [ ] Collection envelope `{ data, page: { limit, offset, total } }` on every list
- [ ] Status codes: 200 / 201 / 204 / 400 / 401 / 403 / 404 / 409 / 422 / 429 used correctly
- [ ] `Idempotency-Key` required on every mutating request
- [ ] `X-Request-Id` on every response

## §4 — Data model

- [ ] `User` has every listed field, exact names
- [ ] `Session` has every listed field, exact names
- [ ] `TabSheet` (renamed `Item`) has every listed field, exact names
- [ ] `FileObject` has every listed field, exact names
- [ ] `Notification` has every listed field, exact names
- [ ] **Field names are snake_case on the wire** — including in MERN
- [ ] Soft delete via `deleted_at` on User and TabSheet
- [ ] Hard delete on Session and FileObject
- [ ] FretLab domain entities follow the same conventions

## §5 — Frontend architecture law

- [ ] One L1 page per route, owning fetching, URL state, layout and error boundary
- [ ] L2 sections compose L3, receive props, own only local interaction state
- [ ] L2 never fetches and never reads the router
- [ ] L3 elements are pure presentation, props in and events out
- [ ] L3 imports nothing from the API client, auth store, router, L1 or L2
- [ ] Directory shape matches the contract
- [ ] Promotion rule followed — nothing lands in `components/` speculatively
- [ ] `eslint-plugin-boundaries` configured at **error**
- [ ] **A deliberate L3-imports-API violation fails the build**
- [ ] No L1 file over ~150 lines without written justification

## §6 — HeroUI and theming

- [ ] HeroUI v3 installed **and imported**
- [ ] `@import "tailwindcss"` then `@import "@heroui/styles"`, in that order
- [ ] Components consume semantic tokens only
- [ ] **No raw hex in any component file** (lint-enforced)
- [ ] `fretlab` theme family ships light and dark
- [ ] `bloom` theme family ships per the contract's token table *(amendment: both families, switchable)*
- [ ] Breakpoints are `sm 640 / md 768 / lg 1024 / xl 1280`
- [ ] Layout shells are mobile first
- [ ] **Sidebar collapses to a bottom bar under `md`**

## §7 — Interface copy

- [ ] Buttons name the outcome ("Save changes", not "Submit")
- [ ] Confirmations reuse the verb ("Changes saved")
- [ ] Errors state what happened and the next move, without apologising
- [ ] Empty states are invitations, not shrugs
- [ ] Sentence case throughout; no all-caps labels
- [ ] **No em dashes in any shipped copy**
- [ ] Things named the way a user would name them
- [ ] **No copy asserts anything the app cannot demonstrate**

## §9 — Definition of done

- [ ] `cp .env.example .env && docker compose up -d` produces a working app, no manual steps
- [ ] `AUTH_MODE=local` works with no external services running
- [ ] `AUTH_MODE=oidc` works against Authentik *(deferred by decision — see P9-03)*
- [ ] Seed creates one owner, one member, twelve items, three notifications
- [ ] Every §1 flow demonstrable in the running app
- [ ] Boundary lint passes; a deliberate L3-imports-API violation fails the build
- [ ] Tests: auth flows, one CRUD round trip, one upload, error envelope shape
- [ ] **Responsive from 375px to 1920px with no horizontal scroll**
- [ ] Keyboard reachable, visible focus rings, `prefers-reduced-motion` respected
- [ ] README documents every env var and the rename-`Item` procedure
- [ ] Health endpoint, structured logs with request ids
- [ ] Deploys to Lab-v2: compose file, Traefik labels, `*.platform.local` hostname

## FretLab-specific gate

Beyond the contract. These are the findings that make the product untrustworthy rather than
incomplete, and none may remain open at ship.

- [ ] Every chord voicing sounds its formula (validator in CI)
- [ ] Every open chord renders a nut, not a false position marker
- [ ] The tuner listens to the microphone, or says plainly that it does not
- [ ] The tuner needle points at the tick it names, with no overlapping readouts
- [ ] No screen displays two different values for the same fact
- [ ] No number in the UI is a hardcoded literal or `Math.random()`
- [ ] Every button either does something or is visibly disabled with a reason
- [ ] The app makes sound
- [ ] **Every contrast pair in the evidence appendix passes AA for its text size, in both theme families**
- [ ] Tab Studio is usable on a 390px phone

---

# Evidence appendix

Measured 2026-09-13 against the running app. Re-run these after Phase 6 and Phase 9 to confirm the
fixes landed. Screenshots in [docs/ui-audit/](docs/ui-audit/).

## Contrast — the nine failures

| Pair | Ratio | AA normal | AA large | Fixed by |
|---|---:|---|---|---|
| `--fl-dark-ink-4` on `--fl-dark` | **1.94:1** | fail | **fail** | P6-03 |
| `--fl-ink-4` on `--fl-surface-sunk` | **2.33:1** | fail | **fail** | P6-03 |
| `--fl-ink-4` on `--fl-canvas` | **2.44:1** | fail | **fail** | P6-03 |
| `--fl-ink-4` on `--fl-surface` | **2.63:1** | fail | **fail** | P6-03 |
| `--fl-warn` on `--fl-surface` | **2.89:1** | fail | **fail** | P6-03 |
| `--fl-live` on `--fl-surface` | **2.91:1** | fail | **fail** | P6-03 |
| third-tone label (`#fff` on `--fl-third`) | 3.39:1 | fail | pass | P6-03 |
| intermediate badge on its bg | 3.87:1 | fail | pass | P6-03 |
| `--fl-ink-3` on `--fl-canvas` | 4.14:1 | fail | pass | P6-03 |
| `--fl-dark-ink-3` on `--fl-dark` | 4.19:1 | fail | pass | P6-03 |
| `--fl-ink-3` on `--fl-surface` | 4.48:1 | fail | pass | P6-03 |

Passing today, keep them passing: `--fl-success` 4.54:1 · `--fl-accent` 5.56:1 · white on accent
5.65:1 · `--fl-ink` 17.02:1.

## Scale discipline — before

| Scale | Steps defined | Distinct literals | Token uses | Fixed by |
|---|---|---:|---:|---|
| Type | 6 | **41** | 149 | P6-20 |
| Radius | 6 | **11** | 201 | P6-20 |
| Motion | 2 | **15** | **0** | P6-20 |
| Spacing | none | **20** gaps | — | P6-20 |
| Colour | 76 tokens | **183** raw hex | 604 | P6-02 |
| z-index | 2 tokens | **12** literals | **0** | P6-21 |

## Design system conformance — before

| | Specified in `packages/design-system/` | Shipped |
|---|---|---|
| Component classes | 441 | **0 used** |
| `:hover` rules | 42 | 0 (JS in ~6 places) |
| `:active` rules | 10 | 0 |
| `:disabled` rules | 14 | 0 |
| `:focus-visible` rules | 8 | 1 global |
| `aria-*` selectors | 32 | 0 |
| `@media` queries | 18 | **0** |
| `prefers-reduced-motion` | 6 | 0 |
| Dark theme | full token block | **absent** |

## Re-measurement commands

```bash
# inline styles remaining
grep -rn "style={{" apps/web/src | wc -l

# raw hex in components
grep -rEn "#[0-9a-fA-F]{3,6}" apps/web/src/pages apps/web/src/components | wc -l

# distinct font sizes
grep -rEoh 'fontSize: *"[0-9.]+rem"' apps/web/src | grep -oE '[0-9.]+rem' | sort -u | wc -l

# z-index literals
grep -rn "zIndex" apps/web/src | grep -v "var(--fl-z" | wc -l

# em dashes in shipped copy
grep -rn "—" apps/web/src --include=*.tsx | wc -l

# media queries present
grep -rc "@media" apps/web/src/index.css apps/web/src/theme/*

# progress
echo "$(grep -c '^### \[x\] P' MASTER-AUDIT.md) / $(grep -c '^### \[.\] P' MASTER-AUDIT.md) tasks done"
```

---

# Agent log

Append one line per completed task. Newest at the bottom.

| Date | Task | What changed | Notes for the next agent |
|---|---|---|---|
| | | | |
