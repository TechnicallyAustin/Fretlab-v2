import { useState } from "react";

interface PracticeGraphProps {
  weeks?: number;
}

function generateData(weeks: number) {
  const days = weeks * 7;
  const today = new Date();
  const data: { date: Date; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const rand = Math.random();
    let minutes = 0;
    if (rand > 0.28) {
      minutes = Math.round(
        (isWeekend ? 30 : 15) + Math.random() * (isWeekend ? 90 : 75)
      );
    }
    // Recent weeks more active
    if (i < 14 && rand > 0.1) minutes = Math.max(minutes, Math.round(20 + Math.random() * 80));
    data.push({ date: d, minutes });
  }
  return data;
}

function minutesToColor(m: number): string {
  if (m === 0) return "var(--fl-line)";
  if (m < 20) return "var(--fl-accent-softer)";
  if (m < 45) return "var(--fl-accent-soft)";
  if (m < 75) return "var(--fl-accent-line)";
  return "var(--fl-accent)";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function PracticeGraph({ weeks = 52 }: PracticeGraphProps) {
  const [tooltip, setTooltip] = useState<{ date: Date; minutes: number; x: number; y: number } | null>(null);
  const data = useState(() => generateData(weeks))[0];

  const cellSize = 13;
  const gap = 3;
  const step = cellSize + gap;
  const labelW = 28;
  const labelH = 18;

  const today = new Date();
  const startDow = new Date(today);
  startDow.setDate(startDow.getDate() - (weeks * 7 - 1));
  const startOffset = startDow.getDay();

  const totalWidth = labelW + weeks * step;
  const totalHeight = labelH + 7 * step;

  // Month label positions
  const monthLabels: { month: string; col: number }[] = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const d = new Date(today);
    d.setDate(d.getDate() - (weeks - 1 - w) * 7);
    if (d.getMonth() !== lastMonth) {
      monthLabels.push({ month: MONTHS[d.getMonth()], col: w });
      lastMonth = d.getMonth();
    }
  }

  const totalMinutes = data.reduce((a, b) => a + b.minutes, 0);
  const streak = (() => {
    let s = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].minutes > 0) s++;
      else break;
    }
    return s;
  })();

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
        <Stat label="Total sessions" value={data.filter((d) => d.minutes > 0).length.toString()} />
        <Stat label="Current streak" value={`${streak}d`} accent />
        <Stat label="Total practice" value={`${Math.round(totalMinutes / 60)}h ${totalMinutes % 60}m`} />
        <Stat label="Avg/session" value={`${Math.round(totalMinutes / Math.max(1, data.filter((d) => d.minutes > 0).length))}m`} />
      </div>

      {/* Graph */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <svg
          width={totalWidth}
          height={totalHeight + 4}
          style={{ display: "block" }}
          onMouseLeave={() => setTooltip(null)}
        >
          {/* Day labels */}
          {[1, 3, 5].map((d) => (
            <text
              key={d}
              x={labelW - 4}
              y={labelH + d * step + cellSize / 2}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="9"
              fill="var(--fl-ink-4)"
              style={{ fontFamily: "var(--fl-font)" }}
            >
              {DAYS[d].slice(0, 3)}
            </text>
          ))}

          {/* Month labels */}
          {monthLabels.map(({ month, col }) => (
            <text
              key={`${month}-${col}`}
              x={labelW + col * step}
              y={labelH / 2}
              textAnchor="start"
              dominantBaseline="central"
              fontSize="9"
              fill="var(--fl-ink-3)"
              style={{ fontFamily: "var(--fl-font)" }}
            >
              {month}
            </text>
          ))}

          {/* Cells — column-first (week columns) */}
          {data.map((day, idx) => {
            const dow = day.date.getDay();
            const weekIdx = Math.floor(idx / 7);
            const col = weekIdx;
            const row = dow;
            const x = labelW + col * step;
            const y = labelH + row * step;
            return (
              <rect
                key={idx}
                x={x} y={y}
                width={cellSize} height={cellSize}
                rx={3}
                fill={minutesToColor(day.minutes)}
                style={{ cursor: "pointer", transition: "opacity 100ms" }}
                onMouseEnter={(e) => {
                  setTooltip({ ...day, x: x + cellSize / 2, y: y - 6 });
                }}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
              background: "var(--fl-dark)",
              color: "#fff",
              borderRadius: "var(--fl-r-sm)",
              padding: "5px 10px",
              fontSize: "0.75rem",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              boxShadow: "var(--fl-shadow-float)",
            }}
          >
            {tooltip.minutes === 0
              ? "No practice"
              : `${tooltip.minutes}m`}{" "}
            — {tooltip.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>Less</span>
          {[0, 15, 35, 60, 90].map((m) => (
            <div
              key={m}
              style={{ width: 13, height: 13, borderRadius: 3, background: minutesToColor(m) }}
              title={`${m}m`}
            />
          ))}
          <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-4)" }}>More</span>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "1.35rem", fontWeight: 700, color: accent ? "var(--fl-accent)" : "var(--fl-ink)", letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.72rem", color: "var(--fl-ink-3)", marginTop: 1 }}>{label}</div>
    </div>
  );
}
