const MAJORS = ["C", "G", "D", "A", "E", "B", "F#", "Db", "Ab", "Eb", "Bb", "F"];
const MINORS = ["Am", "Em", "Bm", "F#m", "C#m", "G#m", "D#m", "Bbm", "Fm", "Cm", "Gm", "Dm"];
const SHARPS = ["0", "1♯", "2♯", "3♯", "4♯", "5♯", "6♯", "5♭", "4♭", "3♭", "2♭", "1♭"];

const keyHue = (i: number) => (289 + i * 30) % 360;

interface CircleOfFifthsProps {
  activeIndex?: number;
  mode?: "major" | "minor";
  onSelect?: (index: number, name: string, mode: "major" | "minor") => void;
  size?: number;
}

export function CircleOfFifths({
  activeIndex = 0,
  mode = "major",
  onSelect,
  size = 340,
}: CircleOfFifthsProps) {
  const c = size / 2;
  const rOuter = c - 5;
  const rMid = c * 0.71;
  const rInner = c * 0.48;
  const rCenter = c * 0.28;
  const step = (Math.PI * 2) / 12;

  function wedge(i: number, r1: number, r2: number) {
    const a0 = i * step - step / 2 - Math.PI / 2;
    const a1 = a0 + step;
    const p = (r: number, a: number) =>
      `${c + Math.cos(a) * r} ${c + Math.sin(a) * r}`;
    return [
      `M ${p(r1, a0)}`,
      `A ${r1} ${r1} 0 0 1 ${p(r1, a1)}`,
      `L ${p(r2, a1)}`,
      `A ${r2} ${r2} 0 0 0 ${p(r2, a0)}`,
      "Z",
    ].join(" ");
  }

  function at(i: number, r: number) {
    const a = i * step - Math.PI / 2;
    return { x: c + Math.cos(a) * r, y: c + Math.sin(a) * r };
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="group"
      aria-label="Circle of fifths"
      style={{ display: "block", "--fl-key-h": keyHue(activeIndex) } as React.CSSProperties}
    >
      {/* Outer major slices */}
      {MAJORS.map((name, i) => {
        const hue = keyHue(i);
        const on = i === activeIndex && mode === "major";
        const pos = at(i, (rOuter + rMid) / 2);
        return (
          <g
            key={name}
            onClick={() => onSelect?.(i, name, "major")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-pressed={on}
            aria-label={`${name} major`}
          >
            <path
              d={wedge(i, rOuter, rMid)}
              fill={`oklch(${on ? "0.72 0.11" : "0.95 0.035"} ${hue})`}
              stroke="var(--fl-surface)"
              strokeWidth={2}
              style={{ transition: "fill 180ms" }}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.048}
              fontWeight={on ? 700 : 500}
              fill={on ? `oklch(0.24 0.08 ${hue})` : "var(--fl-ink-2)"}
              style={{ pointerEvents: "none", fontFamily: "var(--fl-font)" }}
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Inner minor slices */}
      {MINORS.map((name, i) => {
        const hue = keyHue(i);
        const on = i === activeIndex && mode === "minor";
        const pos = at(i, (rMid + rInner) / 2);
        return (
          <g
            key={name}
            onClick={() => onSelect?.(i, name, "minor")}
            style={{ cursor: "pointer" }}
            role="button"
            aria-pressed={on}
            aria-label={`${name} minor`}
          >
            <path
              d={wedge(i, rMid, rInner)}
              fill={`oklch(${on ? "0.78 0.09" : "0.975 0.02"} ${hue})`}
              stroke="var(--fl-surface)"
              strokeWidth={1.5}
              style={{ transition: "fill 180ms" }}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={size * 0.034}
              fontWeight={on ? 600 : 400}
              fill={on ? `oklch(0.30 0.09 ${hue})` : "var(--fl-ink-3)"}
              style={{ pointerEvents: "none", fontFamily: "var(--fl-font)" }}
            >
              {name}
            </text>
          </g>
        );
      })}

      {/* Sharps / flats ring */}
      {SHARPS.map((s, i) => {
        const pos = at(i, (rInner + rCenter) / 2);
        return (
          <text
            key={`sf-${i}`}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.026}
            fontWeight={500}
            fill="var(--fl-ink-4)"
            style={{ pointerEvents: "none", fontFamily: "var(--fl-font-mono)" }}
          >
            {s}
          </text>
        );
      })}

      {/* Center disc */}
      <circle
        cx={c}
        cy={c}
        r={rCenter}
        fill="var(--fl-key-soft)"
        stroke="var(--fl-key-line)"
        strokeWidth={1.5}
      />
      <text
        x={c}
        y={c - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.07}
        fontWeight={800}
        letterSpacing="-0.04em"
        fill="var(--fl-key-ink)"
        style={{ fontFamily: "var(--fl-font)" }}
      >
        {mode === "major" ? MAJORS[activeIndex] : MINORS[activeIndex]}
      </text>
      <text
        x={c}
        y={c + size * 0.06}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.022}
        fontWeight={600}
        fill="var(--fl-key-ink)"
        opacity={0.55}
        style={{ fontFamily: "var(--fl-font)", letterSpacing: "0.06em" }}
      >
        {mode.toUpperCase()}
      </text>
    </svg>
  );
}
