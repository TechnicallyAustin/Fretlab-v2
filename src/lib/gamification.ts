/* ── FretLab gamification model ──────────────────────────────── */

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForLevel: number;
  progress: number; // 0..1 toward next level
  totalXp: number;
}

const RANK_TITLES = [
  "Open String", "First Position", "Riff Rookie", "Chord Wrangler", "Scale Runner",
  "Fretboard Navigator", "Lead Breaker", "Session Player", "Studio Cat", "Virtuoso", "Guitar Sage",
];

/** Cumulative XP required to *reach* a given level (level 1 = 0 XP). */
function xpToReach(level: number): number {
  // quadratic curve: 1→0, 2→300, 3→800, 4→1500 ...
  const l = level - 1;
  return Math.round(150 * l * (l + 1));
}

export function levelFromXp(totalXp: number): LevelInfo {
  let level = 1;
  while (xpToReach(level + 1) <= totalXp) level++;
  const floor = xpToReach(level);
  const ceil = xpToReach(level + 1);
  const xpForLevel = ceil - floor;
  const xpIntoLevel = totalXp - floor;
  return {
    level,
    title: RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)],
    xpIntoLevel,
    xpForLevel,
    progress: xpForLevel > 0 ? xpIntoLevel / xpForLevel : 1,
    totalXp,
  };
}

/* ── Current player ──────────────────────────────────────────── */
export const PLAYER = {
  name: "Jamie Davis",
  initials: "JD",
  xp: 8450,
  weeklyXp: 1240,
  streak: 14,
  rankInLeague: 3,
};

/* ── League leaderboard (this week) ──────────────────────────── */
export interface LeaderRow {
  rank: number;
  name: string;
  initials: string;
  weeklyXp: number;
  streak: number;
  delta: number; // rank movement vs. last week (+ up, - down)
  you?: boolean;
  hue: number;
}

export const LEAGUE_NAME = "Amethyst League";
export const LEADERBOARD: LeaderRow[] = [
  { rank: 1, name: "Sofia Reyes", initials: "SR", weeklyXp: 2180, streak: 41, delta: 1, hue: 20 },
  { rank: 2, name: "Marcus Webb", initials: "MW", weeklyXp: 1620, streak: 9, delta: -1, hue: 150 },
  { rank: 3, name: "Jamie Davis", initials: "JD", weeklyXp: 1240, streak: 14, delta: 2, you: true, hue: 289 },
  { rank: 4, name: "Priya Nair", initials: "PN", weeklyXp: 1190, streak: 22, delta: 0, hue: 200 },
  { rank: 5, name: "Leo Fischer", initials: "LF", weeklyXp: 980, streak: 5, delta: -2, hue: 60 },
  { rank: 6, name: "Aiko Tanaka", initials: "AT", weeklyXp: 870, streak: 18, delta: 3, hue: 330 },
  { rank: 7, name: "Diego Salas", initials: "DS", weeklyXp: 640, streak: 3, delta: -1, hue: 100 },
];

/** Top 3 promote, bottom 2 relegate — mirrors typical league mechanics. */
export const PROMOTION_ZONE = 3;
export const RELEGATION_ZONE = 6;

/* ── Weekly challenges ───────────────────────────────────────── */
export interface Challenge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  progress: number;
  target: number;
  unit: string;
  xp: number;
}

export const WEEKLY_CHALLENGES: Challenge[] = [
  { id: "practice-days", icon: "📅", title: "Consistency", desc: "Practice on 5 different days", progress: 4, target: 5, unit: "days", xp: 300 },
  { id: "clean-chords", icon: "🎯", title: "Clean Changes", desc: "Land 200 clean chord changes", progress: 145, target: 200, unit: "changes", xp: 250 },
  { id: "tempo-push", icon: "⚡", title: "Tempo Push", desc: "Hit a new personal best BPM on any drill", progress: 1, target: 1, unit: "PB", xp: 200 },
  { id: "scale-master", icon: "🎸", title: "Scale Explorer", desc: "Run 3 scales at 100+ BPM cleanly", progress: 2, target: 3, unit: "scales", xp: 350 },
];

export function xpFmt(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);
}
