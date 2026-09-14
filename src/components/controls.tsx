import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

/* ── shared helpers ─────────────────────────────────────── */
function useOutsideClick(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function usePortal() {
  const [el] = useState(() => document.createElement("div"));
  useEffect(() => {
    document.body.appendChild(el);
    return () => { document.body.removeChild(el); };
  }, [el]);
  return el;
}

/* ── Kbd shortcut badge ─────────────────────────────────── */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "1px 5px",
        borderRadius: "var(--fl-r-xs)",
        background: "rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.12)",
        fontFamily: "var(--fl-font-mono)",
        fontSize: "0.68rem",
        lineHeight: 1.6,
        color: "var(--fl-ink-3)",
        letterSpacing: 0,
        userSelect: "none",
      }}
    >
      {children}
    </kbd>
  );
}

/* ── DropdownMenu ───────────────────────────────────────── */
export interface MenuSeparator { type: "separator" }
export interface MenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  description?: string;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
  sub?: MenuSection[];
  onSelect?: () => void;
}
export interface MenuSection {
  label?: string;
  items: MenuItem[];
}

interface DropdownMenuProps {
  trigger: ReactNode;
  sections: MenuSection[];
  align?: "left" | "right";
  width?: number;
  dark?: boolean;
}

export function DropdownMenu({ trigger, sections, align = "left", width = 240, dark = false }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [subPos, setSubPos] = useState<{ top: number; left: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const portal = usePortal();

  useOutsideClick(ref, () => { setOpen(false); setActiveId(null); });

  const [pos, setPos] = useState({ top: 0, left: 0 });

  const toggle = () => {
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({
        top: r.bottom + 6,
        left: align === "right" ? r.right - width : r.left,
      });
    }
    setOpen(v => !v);
    setActiveId(null);
  };

  const allItems = sections.flatMap(s => s.items);
  const focusable = allItems.filter(i => !i.disabled);

  function handleKey(e: KeyboardEvent) {
    if (!open) { if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") { e.preventDefault(); toggle(); } return; }
    if (e.key === "Escape") { setOpen(false); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = focusable.findIndex(i => i.id === activeId);
      setActiveId(focusable[(idx + 1) % focusable.length]?.id ?? null);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = focusable.findIndex(i => i.id === activeId);
      setActiveId(focusable[(idx - 1 + focusable.length) % focusable.length]?.id ?? null);
    }
    if (e.key === "Enter") {
      const item = focusable.find(i => i.id === activeId);
      item?.onSelect?.();
      setOpen(false);
    }
  }

  const bg = dark ? "var(--fl-dark-2)" : "var(--fl-surface)";
  const border = dark ? "rgba(255,255,255,0.09)" : "var(--fl-line)";
  const labelColor = dark ? "var(--fl-dark-ink)" : "var(--fl-ink)";
  const subLabelColor = dark ? "var(--fl-dark-ink-3)" : "var(--fl-ink-3)";
  const sectionLabelColor = dark ? "var(--fl-dark-ink-4)" : "var(--fl-ink-4)";
  const hoverBg = dark ? "rgba(255,255,255,0.07)" : "var(--fl-surface-sunk)";

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }} onKeyDown={handleKey}>
      <div
        onClick={toggle}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{ cursor: "pointer", userSelect: "none" }}
      >
        {trigger}
      </div>

      {open && createPortal(
        <div
          role="menu"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "var(--fl-r-lg)",
            boxShadow: "var(--fl-shadow-popover)",
            padding: "6px",
            zIndex: 9999,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            animation: "fl-menu-in 140ms var(--fl-ease-spring) both",
          }}
        >
          <style>{`
            @keyframes fl-menu-in {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes fl-sub-in {
              from { opacity: 0; transform: scale(0.96) translateX(-4px); }
              to { opacity: 1; transform: scale(1) translateX(0); }
            }
          `}</style>

          {sections.map((section, si) => (
            <div key={si}>
              {si > 0 && (
                <div style={{ height: 1, background: border, margin: "6px 0" }} />
              )}
              {section.label && (
                <div style={{
                  padding: "4px 10px 2px",
                  fontSize: "0.67rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: sectionLabelColor,
                  userSelect: "none",
                }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  active={activeId === item.id}
                  onHover={() => setActiveId(item.id)}
                  labelColor={labelColor}
                  subLabelColor={subLabelColor}
                  hoverBg={hoverBg}
                  border={border}
                  bg={bg}
                  dark={dark}
                  onClose={() => setOpen(false)}
                />
              ))}
            </div>
          ))}
        </div>,
        portal
      )}
    </div>
  );
}

function MenuItemRow({
  item, active, onHover, labelColor, subLabelColor, hoverBg, border, bg, dark, onClose,
}: {
  item: MenuItem;
  active: boolean;
  onHover: () => void;
  labelColor: string;
  subLabelColor: string;
  hoverBg: string;
  border: string;
  bg: string;
  dark: boolean;
  onClose: () => void;
}) {
  const [showSub, setShowSub] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [subCoords, setSubCoords] = useState({ top: 0, left: 0 });
  const portal = usePortal();

  const handleMouseEnter = () => {
    onHover();
    if (item.sub && rowRef.current) {
      const r = rowRef.current.getBoundingClientRect();
      setSubCoords({ top: r.top - 6, left: r.right + 4 });
      setShowSub(true);
    }
  };

  return (
    <div
      ref={rowRef}
      role="menuitem"
      tabIndex={-1}
      aria-disabled={item.disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShowSub(false)}
      onClick={() => {
        if (item.disabled) return;
        item.onSelect?.();
        if (!item.sub) onClose();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: "var(--fl-r-md)",
        cursor: item.disabled ? "not-allowed" : "default",
        opacity: item.disabled ? 0.45 : 1,
        background: active ? hoverBg : "transparent",
        transition: "background 80ms",
        userSelect: "none",
      }}
    >
      {item.icon && (
        <span style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", color: item.danger ? "var(--fl-danger)" : subLabelColor, flexShrink: 0 }}>
          {item.icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "0.88rem", fontWeight: 450, color: item.danger ? "var(--fl-danger)" : labelColor, lineHeight: 1.3 }}>
          {item.label}
        </span>
        {item.description && (
          <span style={{ display: "block", fontSize: "0.72rem", color: subLabelColor, marginTop: 1, lineHeight: 1.4 }}>
            {item.description}
          </span>
        )}
      </span>
      {item.badge && (
        <span style={{ padding: "1px 7px", borderRadius: "var(--fl-r-pill)", background: "var(--fl-accent-soft)", color: "var(--fl-accent-ink)", fontSize: "0.68rem", fontWeight: 600 }}>
          {item.badge}
        </span>
      )}
      {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
      {item.sub && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: subLabelColor, flexShrink: 0 }}>
          <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {showSub && item.sub && createPortal(
        <div
          style={{
            position: "fixed",
            top: subCoords.top,
            left: subCoords.left,
            width: 220,
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "var(--fl-r-lg)",
            boxShadow: "var(--fl-shadow-popover)",
            padding: "6px",
            zIndex: 10000,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            animation: "fl-sub-in 140ms var(--fl-ease-spring) both",
          }}
        >
          {item.sub.map((section, si) => (
            <div key={si}>
              {si > 0 && <div style={{ height: 1, background: border, margin: "6px 0" }} />}
              {section.label && (
                <div style={{ padding: "4px 10px 2px", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: subLabelColor }}>
                  {section.label}
                </div>
              )}
              {section.items.map(sub => (
                <MenuItemRow
                  key={sub.id}
                  item={sub}
                  active={false}
                  onHover={() => {}}
                  labelColor={labelColor}
                  subLabelColor={subLabelColor}
                  hoverBg={hoverBg}
                  border={border}
                  bg={bg}
                  dark={dark}
                  onClose={onClose}
                />
              ))}
            </div>
          ))}
        </div>,
        portal
      )}
    </div>
  );
}

/* ── ContextMenu ────────────────────────────────────────── */
interface ContextMenuProps {
  children: ReactNode;
  sections: MenuSection[];
}

export function ContextMenu({ children, sections }: ContextMenuProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const portal = usePortal();
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setPos(null), []);
  useOutsideClick(menuRef, close);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (pos) close(); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [pos, close]);

  const onContext = (e: React.MouseEvent) => {
    e.preventDefault();
    setPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div ref={ref} onContextMenu={onContext} style={{ userSelect: "none" }}>
        {children}
      </div>
      {pos && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{
            position: "fixed",
            top: Math.min(pos.y, window.innerHeight - 320),
            left: Math.min(pos.x, window.innerWidth - 256),
            width: 240,
            background: "var(--fl-surface)",
            border: "1px solid var(--fl-line)",
            borderRadius: "var(--fl-r-lg)",
            boxShadow: "var(--fl-shadow-popover)",
            padding: "6px",
            zIndex: 9999,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            animation: "fl-menu-in 120ms var(--fl-ease-spring) both",
          }}
        >
          {sections.map((section, si) => (
            <div key={si}>
              {si > 0 && <div style={{ height: 1, background: "var(--fl-line)", margin: "6px 0" }} />}
              {section.label && (
                <div style={{ padding: "4px 10px 2px", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)" }}>
                  {section.label}
                </div>
              )}
              {section.items.map(item => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  active={false}
                  onHover={() => {}}
                  labelColor="var(--fl-ink)"
                  subLabelColor="var(--fl-ink-3)"
                  hoverBg="var(--fl-surface-sunk)"
                  border="var(--fl-line)"
                  bg="var(--fl-surface)"
                  dark={false}
                  onClose={close}
                />
              ))}
            </div>
          ))}
        </div>,
        portal
      )}
    </>
  );
}

/* ── Command Palette ────────────────────────────────────── */
export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
  shortcut?: string;
  onSelect?: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
  trigger?: ReactNode;
  placeholder?: string;
}

export function CommandPalette({ items, trigger, placeholder = "Search commands, scales, chords…" }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const portal = usePortal();

  const filtered = query.trim()
    ? items.filter(i =>
        i.label.toLowerCase().includes(query.toLowerCase()) ||
        i.category?.toLowerCase().includes(query.toLowerCase()) ||
        i.description?.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  useEffect(() => { setActiveIdx(0); }, [query]);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
        setQuery("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter") {
      filtered[activeIdx]?.onSelect?.();
      setOpen(false);
    }
  }

  const categories = [...new Set(filtered.map(i => i.category ?? ""))];

  return (
    <>
      {trigger && (
        <div onClick={() => { setOpen(true); setQuery(""); }} style={{ cursor: "pointer" }}>
          {trigger}
        </div>
      )}

      {open && createPortal(
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(23,22,27,0.52)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "12vh",
            animation: "fl-backdrop-in 160ms ease both",
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <style>{`
            @keyframes fl-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes fl-palette-in { from { opacity: 0; transform: scale(0.97) translateY(-8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
          `}</style>
          <div
            style={{
              width: "min(640px, 94vw)",
              background: "var(--fl-surface)",
              border: "1px solid var(--fl-line)",
              borderRadius: "var(--fl-r-xl)",
              boxShadow: "var(--fl-shadow-popover)",
              overflow: "hidden",
              animation: "fl-palette-in 200ms var(--fl-ease-spring) both",
              maxHeight: "72vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Search bar */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid var(--fl-line-soft)",
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: "var(--fl-ink-3)", flexShrink: 0 }}>
                <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                style={{
                  flex: 1, border: 0, outline: "none", background: "transparent",
                  fontFamily: "var(--fl-font)", fontSize: "1rem", color: "var(--fl-ink)",
                }}
              />
              <Kbd>Esc</Kbd>
            </div>

            {/* Results */}
            <div style={{ overflowY: "auto", padding: "8px" }}>
              {filtered.length === 0 && (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--fl-ink-3)", fontSize: "0.88rem" }}>
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
              {categories.map(cat => {
                const catItems = filtered.filter(i => (i.category ?? "") === cat);
                return (
                  <div key={cat}>
                    {cat && (
                      <div style={{ padding: "8px 10px 4px", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)" }}>
                        {cat}
                      </div>
                    )}
                    {catItems.map(item => {
                      const idx = filtered.indexOf(item);
                      const isActive = idx === activeIdx;
                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIdx(idx)}
                          onClick={() => { item.onSelect?.(); setOpen(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 12,
                            padding: "9px 10px",
                            borderRadius: "var(--fl-r-md)",
                            cursor: "default",
                            background: isActive ? "var(--fl-accent-softer)" : "transparent",
                            transition: "background 80ms",
                          }}
                        >
                          {item.icon && (
                            <span style={{
                              width: 32, height: 32, borderRadius: "var(--fl-r-sm)",
                              background: isActive ? "var(--fl-accent-soft)" : "var(--fl-surface-sunk)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: isActive ? "var(--fl-accent-ink)" : "var(--fl-ink-3)",
                              flexShrink: 0, transition: "background 80ms, color 80ms",
                            }}>
                              {item.icon}
                            </span>
                          )}
                          <span style={{ flex: 1 }}>
                            <span style={{ display: "block", fontSize: "0.9rem", fontWeight: 500, color: isActive ? "var(--fl-accent-ink)" : "var(--fl-ink)" }}>
                              {item.label}
                            </span>
                            {item.description && (
                              <span style={{ display: "block", fontSize: "0.75rem", color: "var(--fl-ink-3)", marginTop: 1 }}>
                                {item.description}
                              </span>
                            )}
                          </span>
                          {item.shortcut && <Kbd>{item.shortcut}</Kbd>}
                          {isActive && (
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--fl-accent-ink)" }}>
                              <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              borderTop: "1px solid var(--fl-line-soft)",
              padding: "8px 16px",
              display: "flex", alignItems: "center", gap: 16,
              fontSize: "0.72rem", color: "var(--fl-ink-4)",
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Kbd>↑↓</Kbd> navigate</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Kbd>↵</Kbd> open</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Kbd>Esc</Kbd> close</span>
              <span style={{ marginLeft: "auto" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>,
        portal
      )}
    </>
  );
}

/* ── SegmentedControl ───────────────────────────────────── */
export interface SegOption { value: string; label: ReactNode; icon?: ReactNode }

interface SegmentedControlProps {
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
  dark?: boolean;
}

export function SegmentedControl({ options, value, onChange, compact = false, dark = false }: SegmentedControlProps) {
  const activeIdx = options.findIndex(o => o.value === value);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const el = itemRefs.current[activeIdx];
    const container = containerRef.current;
    if (el && container) {
      const cRect = container.getBoundingClientRect();
      const eRect = el.getBoundingClientRect();
      setSliderStyle({ left: eRect.left - cRect.left, width: eRect.width });
    }
  }, [activeIdx]);

  const bg = dark ? "rgba(255,255,255,0.07)" : "var(--fl-surface-sunk)";
  const sliderBg = dark ? "rgba(255,255,255,0.13)" : "var(--fl-surface)";
  const sliderBorder = dark ? "rgba(255,255,255,0.12)" : "var(--fl-line)";
  const activeFg = dark ? "var(--fl-dark-ink)" : "var(--fl-accent-ink)";
  const inactiveFg = dark ? "var(--fl-dark-ink-3)" : "var(--fl-ink-3)";

  return (
    <div
      ref={containerRef}
      role="group"
      style={{
        display: "inline-flex",
        background: bg,
        borderRadius: "var(--fl-r-lg)",
        padding: 4,
        position: "relative",
        gap: 2,
      }}
    >
      {/* animated slider */}
      <div style={{
        position: "absolute",
        top: 4,
        left: sliderStyle.left,
        width: sliderStyle.width,
        height: `calc(100% - 8px)`,
        background: sliderBg,
        border: `1px solid ${sliderBorder}`,
        borderRadius: "var(--fl-r-md)",
        boxShadow: "var(--fl-shadow-control)",
        transition: "left 220ms var(--fl-ease-spring), width 220ms var(--fl-ease-spring)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {options.map((opt, i) => (
        <button
          key={opt.value}
          ref={el => { itemRefs.current[i] = el; }}
          role="radio"
          aria-checked={opt.value === value}
          onClick={() => onChange(opt.value)}
          style={{
            position: "relative", zIndex: 1,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            padding: compact ? "6px 14px" : "9px 18px",
            borderRadius: "var(--fl-r-md)",
            border: 0, background: "transparent", cursor: "pointer",
            fontFamily: "var(--fl-font)",
            fontSize: compact ? "var(--fl-t-small)" : "var(--fl-t-body)",
            fontWeight: opt.value === value ? 500 : 400,
            color: opt.value === value ? activeFg : inactiveFg,
            transition: "color 180ms",
            whiteSpace: "nowrap",
          }}
        >
          {opt.icon && <span style={{ opacity: opt.value === value ? 1 : 0.7 }}>{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── FilterPills ────────────────────────────────────────── */
export interface PillOption { value: string; label: string; count?: number; icon?: ReactNode }

interface FilterPillsProps {
  options: PillOption[];
  value: string[];
  onChange: (v: string[]) => void;
  single?: boolean;
}

export function FilterPills({ options, value, onChange, single = false }: FilterPillsProps) {
  const toggle = (v: string) => {
    if (single) { onChange(value[0] === v ? [] : [v]); return; }
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  };

  return (
    <div role="group" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      {options.map(opt => {
        const on = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            role="checkbox"
            aria-checked={on}
            onClick={() => toggle(opt.value)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "7px 14px",
              borderRadius: "var(--fl-r-pill)",
              border: `1px solid ${on ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
              background: on ? "var(--fl-accent-soft)" : "var(--fl-surface)",
              color: on ? "var(--fl-accent-ink)" : "var(--fl-ink-2)",
              fontFamily: "var(--fl-font)",
              fontSize: "var(--fl-t-small)",
              fontWeight: on ? 500 : 400,
              cursor: "pointer",
              transition: "border-color 140ms, background 140ms, color 140ms",
              boxShadow: on ? "none" : "var(--fl-shadow-control)",
            }}
          >
            {opt.icon && <span style={{ opacity: on ? 1 : 0.7, display: "flex" }}>{opt.icon}</span>}
            {opt.label}
            {opt.count !== undefined && (
              <span style={{
                padding: "0 5px", borderRadius: "var(--fl-r-pill)",
                background: on ? "rgba(97,82,217,0.18)" : "var(--fl-surface-sunk)",
                fontSize: "0.68rem", fontWeight: 600,
                color: on ? "var(--fl-accent-ink)" : "var(--fl-ink-4)",
                minWidth: 18, textAlign: "center",
              }}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Stepper ────────────────────────────────────────────── */
interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function Stepper({ value, onChange, min = 0, max = 300, step = 1, unit, label, size = "md" }: StepperProps) {
  const decrement = () => onChange(Math.max(min, value - step));
  const increment = () => onChange(Math.min(max, value + step));
  const btnSize = size === "sm" ? 26 : size === "lg" ? 36 : 30;

  return (
    <div
      role="group"
      aria-label={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        border: "1px solid var(--fl-line)",
        borderRadius: "var(--fl-r-md)",
        background: "var(--fl-surface)",
        padding: 4,
        boxShadow: "var(--fl-shadow-control)",
      }}
    >
      <button
        aria-label={`Decrease ${label}`}
        onClick={decrement}
        disabled={value <= min}
        style={{
          width: btnSize, height: btnSize,
          border: 0, borderRadius: "var(--fl-r-sm)",
          background: "transparent", cursor: "pointer",
          color: "var(--fl-ink-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 120ms",
          opacity: value <= min ? 0.35 : 1,
        }}
        onMouseEnter={e => { if (value > min) (e.target as HTMLElement).style.background = "var(--fl-surface-sunk)"; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ minWidth: size === "lg" ? 64 : size === "sm" ? 42 : 52, textAlign: "center", padding: "0 4px" }}
      >
        <div style={{ fontSize: size === "lg" ? "1.3rem" : size === "sm" ? "0.88rem" : "1.05rem", fontWeight: 600, color: "var(--fl-ink)", lineHeight: 1.2 }}>
          {value}
        </div>
        {unit && (
          <div style={{ fontSize: "0.65rem", color: "var(--fl-ink-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {unit}
          </div>
        )}
      </div>

      <button
        aria-label={`Increase ${label}`}
        onClick={increment}
        disabled={value >= max}
        style={{
          width: btnSize, height: btnSize,
          border: 0, borderRadius: "var(--fl-r-sm)",
          background: "transparent", cursor: "pointer",
          color: "var(--fl-ink-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 120ms",
          opacity: value >= max ? 0.35 : 1,
        }}
        onMouseEnter={e => { if (value < max) (e.target as HTMLElement).style.background = "var(--fl-surface-sunk)"; }}
        onMouseLeave={e => { (e.target as HTMLElement).style.background = "transparent"; }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 3V11M3 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ── TapTempo ───────────────────────────────────────────── */
interface TapTempoProps {
  bpm: number;
  onBpm: (v: number) => void;
}

export function TapTempo({ bpm, onBpm }: TapTempoProps) {
  const taps = useRef<number[]>([]);

  const tap = () => {
    const now = performance.now();
    taps.current.push(now);
    if (taps.current.length > 8) taps.current = taps.current.slice(-8);
    if (taps.current.length > 1) {
      const diffs = taps.current.slice(1).map((t, i) => t - taps.current[i]);
      const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      onBpm(Math.round(60000 / avg));
    }
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); tap(); }
  };

  return (
    <button
      onClick={tap}
      onKeyDown={onKey}
      aria-label="Tap to set tempo"
      style={{
        padding: "10px 20px",
        border: "1px solid var(--fl-line)",
        borderRadius: "var(--fl-r-md)",
        background: "var(--fl-surface)",
        fontFamily: "var(--fl-font)",
        fontSize: "var(--fl-t-small)",
        fontWeight: 500,
        color: "var(--fl-ink-2)",
        cursor: "pointer",
        boxShadow: "var(--fl-shadow-control)",
        transition: "background 80ms, transform 60ms",
        userSelect: "none",
        letterSpacing: "0.02em",
      }}
      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
    >
      TAP
    </button>
  );
}

/* ── Switch ─────────────────────────────────────────────── */
interface SwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  size?: "sm" | "md";
}

export function Switch({ checked, onChange, label, description, size = "md" }: SwitchProps) {
  const id = useRef(`sw-${Math.random().toString(36).slice(2)}`).current;
  const w = size === "sm" ? 32 : 40;
  const h = size === "sm" ? 18 : 22;
  const knobSize = h - 4;
  const travel = w - knobSize - 4;

  return (
    <label htmlFor={id} style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", userSelect: "none" }}>
      <div
        style={{
          position: "relative", width: w, height: h, borderRadius: h / 2, flexShrink: 0, marginTop: 2,
          background: checked ? "var(--fl-accent)" : "var(--fl-line)",
          transition: "background 200ms var(--fl-ease-out)",
          boxShadow: checked ? `0 0 0 3px var(--fl-focus)` : "none",
        }}
        onClick={() => onChange(!checked)}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />
        <div style={{
          position: "absolute",
          top: 2, left: checked ? 2 + travel : 2,
          width: knobSize, height: knobSize,
          borderRadius: "50%",
          background: "white",
          boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          transition: "left 220ms var(--fl-ease-spring)",
        }} />
      </div>
      {(label || description) && (
        <div>
          {label && <div style={{ fontSize: "var(--fl-t-body)", fontWeight: 500, color: "var(--fl-ink)" }}>{label}</div>}
          {description && <div style={{ fontSize: "var(--fl-t-small)", color: "var(--fl-ink-3)", marginTop: 2 }}>{description}</div>}
        </div>
      )}
    </label>
  );
}

/* ── SliderField ─────────────────────────────────────────── */
interface SliderFieldProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  showValue?: boolean;
}

export function SliderField({ value, onChange, min = 0, max = 100, step = 1, label, unit, showValue = true }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      {(label || showValue) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          {label && <span style={{ fontSize: "var(--fl-t-small)", fontWeight: 500, color: "var(--fl-ink-2)" }}>{label}</span>}
          {showValue && (
            <span style={{ fontFamily: "var(--fl-font-mono)", fontSize: "var(--fl-t-small)", color: "var(--fl-accent-ink)", fontWeight: 500 }}>
              {value}{unit}
            </span>
          )}
        </div>
      )}
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", inset: "0 0 0 0",
          height: 6, top: "50%", transform: "translateY(-50%)",
          borderRadius: 3, background: "var(--fl-line)",
        }}>
          <div style={{
            height: "100%", width: `${pct}%`,
            borderRadius: 3,
            background: "linear-gradient(90deg, var(--fl-accent-soft), var(--fl-accent))",
          }} />
        </div>
        <input
          type="range"
          min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
          style={{
            position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%",
          }}
        />
        <div style={{
          position: "absolute",
          left: `${pct}%`,
          transform: "translateX(-50%)",
          width: 18, height: 18,
          borderRadius: "50%",
          background: "var(--fl-surface)",
          border: "2px solid var(--fl-accent)",
          boxShadow: "0 1px 6px rgba(97,82,217,0.32)",
          pointerEvents: "none",
          transition: "box-shadow 120ms",
        }} />
      </div>
    </div>
  );
}

/* ── Toast / notification ───────────────────────────────── */
export interface Toast { id: string; message: string; type?: "default" | "success" | "warn" | "error" }
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(v => [...v, { ...t, id }]);
    setTimeout(() => setToasts(v => v.filter(x => x.id !== id)), 3400);
  }, []);
  return { toasts, add };
}

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return createPortal(
    <div style={{
      position: "fixed", bottom: 24, right: 24,
      display: "flex", flexDirection: "column", gap: 8,
      zIndex: 99990, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          style={{
            padding: "11px 16px",
            borderRadius: "var(--fl-r-lg)",
            background: t.type === "error" ? "var(--fl-danger)" : t.type === "success" ? "var(--fl-success)" : t.type === "warn" ? "var(--fl-warn)" : "var(--fl-dark)",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 450,
            boxShadow: "var(--fl-shadow-float)",
            pointerEvents: "auto",
            animation: "fl-toast-in 260ms var(--fl-ease-spring) both",
            maxWidth: 320,
            lineHeight: 1.4,
          }}
        >
          <style>{`@keyframes fl-toast-in { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: none; } }`}</style>
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  );
}

/* ── SelectField ─────────────────────────────────────────── */
interface SelectFieldProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; group?: string }[];
  label?: string;
  placeholder?: string;
}

export function SelectField({ value, onChange, options, label, placeholder = "Select…" }: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const portal = usePortal();
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  useOutsideClick(ref, () => setOpen(false));

  const selected = options.find(o => o.value === value);
  const groups = [...new Set(options.map(o => o.group ?? ""))];

  const openMenu = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    setOpen(v => !v);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {label && <div style={{ fontSize: "var(--fl-t-small)", fontWeight: 500, color: "var(--fl-ink-2)", marginBottom: 6 }}>{label}</div>}
      <button
        onClick={openMenu}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "10px 14px",
          border: `1px solid ${open ? "var(--fl-accent-line)" : "var(--fl-line)"}`,
          borderRadius: "var(--fl-r-md)",
          background: "var(--fl-surface)",
          fontFamily: "var(--fl-font)",
          fontSize: "var(--fl-t-body)",
          color: selected ? "var(--fl-ink)" : "var(--fl-ink-4)",
          cursor: "pointer",
          textAlign: "left",
          boxShadow: "var(--fl-shadow-control)",
          transition: "border-color 140ms",
        }}
      >
        <span style={{ flex: 1 }}>{selected?.label ?? placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--fl-ink-3)", transform: open ? "rotate(180deg)" : "", transition: "transform 200ms" }}>
          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && createPortal(
        <div
          role="listbox"
          style={{
            position: "fixed",
            top: pos.top, left: pos.left, width: pos.width,
            background: "var(--fl-surface)",
            border: "1px solid var(--fl-line)",
            borderRadius: "var(--fl-r-lg)",
            boxShadow: "var(--fl-shadow-popover)",
            padding: "6px",
            zIndex: 9999,
            maxHeight: 280, overflowY: "auto",
            animation: "fl-menu-in 140ms var(--fl-ease-spring) both",
          }}
        >
          {groups.map((group, gi) => {
            const groupOpts = options.filter(o => (o.group ?? "") === group);
            return (
              <div key={gi}>
                {gi > 0 && <div style={{ height: 1, background: "var(--fl-line)", margin: "4px 0" }} />}
                {group && <div style={{ padding: "4px 10px 2px", fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--fl-ink-4)" }}>{group}</div>}
                {groupOpts.map(opt => (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={opt.value === value}
                    onClick={() => { onChange(opt.value); setOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: "var(--fl-r-md)",
                      cursor: "default",
                      background: opt.value === value ? "var(--fl-accent-softer)" : "transparent",
                      color: opt.value === value ? "var(--fl-accent-ink)" : "var(--fl-ink)",
                      fontSize: "0.88rem",
                      fontWeight: opt.value === value ? 500 : 400,
                      transition: "background 80ms",
                    }}
                    onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = "var(--fl-surface-sunk)"; }}
                    onMouseLeave={e => { if (opt.value !== value) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {opt.label}
                    {opt.value === value && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "var(--fl-accent)" }}>
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>,
        portal
      )}
    </div>
  );
}

/* ── Button ─────────────────────────────────────────────── */
interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline" | "quiet" | "onDark" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  onClick?: () => void;
  block?: boolean;
}

export function Button({ children, variant = "outline", size = "md", disabled, loading, icon, iconRight, onClick, block }: ButtonProps) {
  const h = size === "sm" ? "var(--fl-control-sm)" : size === "lg" ? "var(--fl-control-lg)" : "var(--fl-control-md)";
  const px = size === "sm" ? 12 : size === "lg" ? 22 : 16;
  const fs = size === "sm" ? "var(--fl-t-small)" : "var(--fl-t-body)";

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { background: "var(--fl-accent-soft)", borderColor: "var(--fl-accent-line)", color: "var(--fl-accent-ink)" },
    outline: { background: "var(--fl-surface)", borderColor: "var(--fl-line)", color: "var(--fl-ink)", boxShadow: "var(--fl-shadow-control)" },
    quiet: { background: "transparent", borderColor: "transparent", color: "var(--fl-ink-2)" },
    onDark: { background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "#fff" },
    danger: { background: "var(--fl-danger-soft)", borderColor: "rgba(182,77,101,0.3)", color: "var(--fl-danger)" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
        height: h, padding: `0 ${px}px`,
        borderRadius: "var(--fl-r-md)", border: "1px solid transparent",
        fontFamily: "var(--fl-font)", fontSize: fs, fontWeight: 500,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        width: block ? "100%" : undefined,
        transition: "background 140ms, border-color 140ms, transform 60ms",
        userSelect: "none",
        ...variantStyles[variant],
      }}
      onMouseDown={e => { if (!disabled && !loading) (e.currentTarget as HTMLElement).style.transform = "scale(0.97)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
    >
      {loading ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ animation: "fl-spin 700ms linear infinite" }}>
          <style>{`@keyframes fl-spin { to { transform: rotate(360deg); } }`}</style>
          <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="20" strokeDashoffset="10" />
        </svg>
      ) : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

/* ── IconButton ─────────────────────────────────────────── */
export function IconButton({ children, label, variant = "outline", size = "md", onClick }: { children: ReactNode; label: string; variant?: "outline" | "quiet" | "onDark"; size?: "sm" | "md" | "lg"; onClick?: () => void }) {
  const dim = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const variantStyles: Record<string, React.CSSProperties> = {
    outline: { background: "var(--fl-surface)", border: "1px solid var(--fl-line)", color: "var(--fl-ink-2)", boxShadow: "var(--fl-shadow-control)" },
    quiet: { background: "transparent", border: "1px solid transparent", color: "var(--fl-ink-2)" },
    onDark: { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff" },
  };
  return (
    <button
      aria-label={label}
      onClick={onClick}
      style={{
        width: dim, height: dim, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "var(--fl-r-md)", cursor: "pointer",
        transition: "background 120ms, transform 60ms",
        ...variantStyles[variant],
      }}
      onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = "scale(0.94)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
    >
      {children}
    </button>
  );
}

/* ── Tag / Badge ────────────────────────────────────────── */
type TagVariant = "accent" | "neutral" | "beginner" | "intermediate" | "advanced" | "live" | "warn";
export function Tag({ children, variant = "accent", removable, onRemove }: { children: ReactNode; variant?: TagVariant; removable?: boolean; onRemove?: () => void }) {
  const styles: Record<TagVariant, React.CSSProperties> = {
    accent: { background: "var(--fl-accent-softer)", color: "var(--fl-accent-ink)", border: "1px solid var(--fl-accent-line)" },
    neutral: { background: "var(--fl-surface-sunk)", color: "var(--fl-ink-2)", border: "1px solid var(--fl-line)" },
    beginner: { background: "var(--fl-beginner-bg)", color: "var(--fl-beginner)", border: "1px solid rgba(97,82,217,0.2)" },
    intermediate: { background: "var(--fl-intermediate-bg)", color: "var(--fl-intermediate)", border: "1px solid rgba(180,99,43,0.2)" },
    advanced: { background: "var(--fl-advanced-bg)", color: "var(--fl-advanced)", border: "1px solid rgba(163,59,87,0.2)" },
    live: { background: "rgba(63,168,122,0.12)", color: "var(--fl-live)", border: "1px solid rgba(63,168,122,0.25)" },
    warn: { background: "rgba(201,138,43,0.12)", color: "var(--fl-warn)", border: "1px solid rgba(201,138,43,0.25)" },
  };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      borderRadius: "var(--fl-r-pill)",
      fontSize: "var(--fl-t-small)", fontWeight: 500, lineHeight: 1.6,
      ...styles[variant],
    }}>
      {variant === "live" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--fl-live)", display: "inline-block" }} />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          aria-label={`Remove ${children}`}
          style={{ display: "flex", alignItems: "center", border: 0, background: "transparent", cursor: "pointer", padding: 0, color: "inherit", opacity: 0.7 }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  );
}
