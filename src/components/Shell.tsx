import { NavLink, Outlet, useLocation } from "react-router";
import { AIProvider, useAI } from "../lib/aiContext";
import { AIPanel } from "./AIPanel";

/* ── Navigation data ──────────────────────────────────────── */
const NAV = [
  { path: "/", label: "Practice Studio", index: "01" },
  { path: "/tab", label: "Tab Studio", index: "02" },
  { path: "/library", label: "Library", index: "03" },
  { path: "/theory", label: "Theory Studio", index: "04" },
  { path: "/tuner", label: "Tuner", index: "05" },
  { path: "/profile", label: "You", index: "06" },
];

const EXPLORE = [
  { label: "Key map", count: 12 },
  { label: "Chords", count: 48 },
  { label: "Scales", count: 14 },
  { label: "Songs", count: 9 },
];

/* ── BrandMark ────────────────────────────────────────────── */
function BrandMark() {
  return (
    <div style={{ padding: "28px 22px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--fl-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <path
              d="M13 3C14.1 2 15.8 2 16.8 3L16.3 3.5C16.3 3.5 15.8 3.5 15.3 4L12 7.5C12.6 8.6 12.6 9.8 11.5 10.8L8.5 14C7.4 15.1 5.7 15.1 4.6 14L5.6 13C6.2 13.6 6.8 13.6 7.4 13L10.4 10C11 9.4 11 8.8 10.4 8.2L7.4 5.2C6.8 4.6 6.8 4 7.4 3.4"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="5.5" cy="13.5" r="2" stroke="#fff" strokeWidth="1.2" />
          </svg>
        </div>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.025em",
          }}
        >
          FretLab
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.35)",
          lineHeight: 1.4,
          letterSpacing: "0.01em",
        }}
      >
        Practice one key. Know the whole neck.
      </p>
    </div>
  );
}

/* ── Nav ──────────────────────────────────────────────────── */
function Nav({ current }: { current: string }) {
  return (
    <nav style={{ padding: "16px 12px 0" }}>
      <div
        style={{
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          padding: "0 10px",
          marginBottom: 6,
        }}
      >
        Navigation
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((item) => {
          const active = item.label === current;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 10px",
                borderRadius: 10,
                textDecoration: "none",
                transition: "background 140ms",
                background: isActive ? "rgba(97,82,217,0.28)" : "transparent",
                position: "relative",
              })}
            >
              {({ isActive }) => (
                <>
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: isActive ? "var(--fl-accent)" : "rgba(255,255,255,0.2)",
                      flexShrink: 0,
                      transition: "background 140ms",
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                      transition: "color 140ms",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontFamily: "var(--fl-font-mono)",
                      color: isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)",
                      transition: "color 140ms",
                    }}
                  >
                    {item.index}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

/* ── ExploreList ──────────────────────────────────────────── */
function ExploreList() {
  return (
    <div style={{ padding: "20px 12px 0" }}>
      <div
        style={{
          fontSize: "0.62rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          padding: "0 10px",
          marginBottom: 6,
        }}
      >
        Explore
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {EXPLORE.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 8,
              cursor: "pointer",
              transition: "background 120ms",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              {item.label}
            </span>
            <span
              style={{
                fontSize: "0.68rem",
                fontFamily: "var(--fl-font-mono)",
                color: "rgba(255,255,255,0.22)",
              }}
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SidebarNote ──────────────────────────────────────────── */
function SidebarNote() {
  return (
    <div
      style={{
        margin: "20px 12px",
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.28)",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        One connected practice system for the entire fretboard.
      </p>
    </div>
  );
}

/* ── Shell ────────────────────────────────────────────────── */
const CRUMBS: Record<string, string> = {
  "/": "Practice Studio",
  "/tab": "Tab Studio",
  "/library": "Library",
  "/theory": "Theory Studio",
  "/tuner": "Tuner",
  "/profile": "You",
};

function AIButton() {
  const { ask, isOpen } = useAI();
  return (
    <button
      type="button"
      onClick={() => ask({ prompt: "" })}
      title="Ask FretLab AI"
      style={{
        padding: "6px 12px",
        borderRadius: "var(--fl-r-md)",
        border: "1px solid var(--fl-accent-line)",
        background: isOpen ? "var(--fl-accent-softer)" : "transparent",
        color: "var(--fl-accent)",
        fontFamily: "var(--fl-font)",
        fontSize: "0.78rem",
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "background 120ms",
      }}
    >
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path d="M7 1.5L8.8 5H12L9.2 7L10.3 10.5L7 8.8L3.7 10.5L4.8 7L2 5H5.2L7 1.5Z" fill="currentColor" />
      </svg>
      Ask AI
    </button>
  );
}

function ShellInner() {
  const location = useLocation();
  const currentLabel = CRUMBS[location.pathname] ?? "FretLab";
  const currentItem = NAV.find(
    (n) =>
      n.path === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(n.path)
  );

  return (
    <>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "224px 1fr",
        minHeight: "100vh",
        background: "var(--fl-canvas)",
        fontFamily: "var(--fl-font)",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        style={{
          background: "var(--fl-dark)",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <BrandMark />
        <Nav current={currentItem?.label ?? ""} />
        <ExploreList />
        <div style={{ flex: 1 }} />
        <SidebarNote />

        {/* Avatar + settings row */}
        <div
          style={{
            padding: "12px 16px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <NavLink to="/profile" style={{ textDecoration: "none" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b7cec 0%, #6152d9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#fff",
                border: "2px solid rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            >
              JD
            </div>
          </NavLink>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Jamie Davis
            </div>
            <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.28)" }}>
              Intermediate
            </div>
          </div>
          <button
            title="Settings"
            style={{
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.3)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.4 3.4L4.46 4.46M13.54 13.54L14.6 14.6M3.4 14.6L4.46 13.54M13.54 4.46L14.6 3.4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Content ─────────────────────────────────────────── */}
      <main
        style={{
          overflow: "auto",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* TopBar */}
        <header
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "0 28px",
            height: 52,
            borderBottom: "1px solid var(--fl-line)",
            background: "var(--fl-surface)",
            position: "sticky",
            top: 0,
            zIndex: 20,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              color: "var(--fl-ink-4)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>FretLab</span>
            <span style={{ opacity: 0.4 }}>/</span>
            <span style={{ color: "var(--fl-ink-2)", fontWeight: 500 }}>{currentLabel}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 10px",
                borderRadius: "var(--fl-r-pill)",
                background: "var(--fl-surface-sunk)",
                border: "1px solid var(--fl-line)",
                fontSize: "0.72rem",
                color: "var(--fl-ink-3)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--fl-live)",
                  display: "inline-block",
                }}
              />
              {currentLabel}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
            }}
          >
            {/* Key badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 12px 5px 8px",
                borderRadius: "var(--fl-r-md)",
                background: "var(--fl-surface)",
                border: "1px solid var(--fl-line)",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "var(--fl-key-soft)",
                  border: "1px solid var(--fl-key-line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--fl-key-ink)",
                }}
              >
                C
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--fl-ink-3)" }}>
                C major
              </span>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ color: "var(--fl-ink-4)" }}>
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <AIButton />
            {/* Quick train button */}
            <button
              type="button"
              style={{
                padding: "7px 14px",
                borderRadius: "var(--fl-r-md)",
                border: "none",
                background: "var(--fl-accent)",
                color: "#fff",
                fontFamily: "var(--fl-font)",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Quick train →
            </button>
          </div>
        </header>

        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </main>
    </div>
    <AIPanel />
    </>
  );
}

export function Shell() {
  return (
    <AIProvider>
      <ShellInner />
    </AIProvider>
  );
}
