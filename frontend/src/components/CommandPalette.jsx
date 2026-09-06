import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";

const raised = {
  background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
  boxShadow:
    "7px 7px 16px rgba(163,167,178,0.45), -7px -7px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const pressed = {
  background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
  boxShadow:
    "inset 2px 2px 5px rgba(163,167,178,0.5), inset -2px -2px 5px rgba(255,255,255,0.9)",
};

// Subsequence match: returns score (higher = better) or -1 if no match
const fuzzyScore = (query, text) => {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct === 0) return 1000;
  if (direct > 0) return 700 - direct;
  let qi = 0;
  let score = 300;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      score += 1;
      qi++;
    } else {
      score -= 0.25;
    }
  }
  return qi === q.length ? score : -1;
};

const GROUP_ORDER = ["Actions", "Files"];

// Rendered fresh on every open (parent mounts/unmounts it), so local
// state starts clean without needing reset effects
const CommandPalette = ({ onClose, items }) => {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setActiveIndex(0);
  }, []);

  const filteredGroups = useMemo(() => {
    const scored = items
      .map((item) => ({
        ...item,
        score: Math.max(
          fuzzyScore(query, item.label),
          ...(item.keywords || []).map((k) => fuzzyScore(query, k) - 50),
        ),
      }))
      .filter((item) => item.score >= 0)
      .sort((a, b) => b.score - a.score);

    const groups = new Map();
    for (const group of GROUP_ORDER) {
      const groupItems = scored.filter((i) => i.group === group);
      if (groupItems.length > 0) groups.set(group, groupItems);
    }
    return groups;
  }, [items, query]);

  const flatItems = useMemo(
    () => Array.from(filteredGroups.values()).flat(),
    [filteredGroups],
  );

  // Keep the active row visible while navigating
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runItem = useCallback(
    (item) => {
      onClose();
      item.run();
    },
    [onClose],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (flatItems.length ? (i + 1) % flatItems.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          flatItems.length ? (i - 1 + flatItems.length) % flatItems.length : 0,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[activeIndex];
        if (item) runItem(item);
      }
    },
    [flatItems, activeIndex, onClose, runItem],
  );

  if (!items) return null;

  let flatIdx = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-[20px] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={raised}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid rgba(163,167,178,0.2)" }}
        >
          <Search className="w-4 h-4 shrink-0" style={{ color: "#C1652F" }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search files or type a command..."
            className="flex-1 bg-transparent outline-none text-sm font-medium"
            style={{ color: "#26262B" }}
          />
          <kbd
            className="hidden sm:flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ ...pressed, color: "#787B85" }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto custom-scrollbar p-2">
          {flatItems.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "#787B85" }}>
              No matches for "{query}"
            </p>
          )}

          {GROUP_ORDER.map((group) => {
            const groupItems = filteredGroups.get(group);
            if (!groupItems?.length) return null;
            return (
              <div key={group} className="mb-1">
                <p
                  className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5"
                  style={{ color: "#9CA0AA" }}
                >
                  {group}
                </p>
                {groupItems.map((item) => {
                  flatIdx++;
                  const isActive = flatIdx === activeIndex;
                  const myIndex = flatIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      data-index={myIndex}
                      onMouseEnter={() => setActiveIndex(myIndex)}
                      onClick={() => runItem(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-150"
                      style={
                        isActive
                          ? {
                              ...pressed,
                              boxShadow:
                                "inset 2px 2px 5px rgba(163,167,178,0.5), inset -2px -2px 5px rgba(255,255,255,0.9), 0 0 0 2px rgba(193,101,47,0.6)",
                            }
                          : undefined
                      }
                    >
                      {Icon && (
                        <Icon
                          className="w-4 h-4 shrink-0"
                          style={{ color: item.color || "#C1652F" }}
                        />
                      )}
                      <span
                        className="flex-1 text-sm font-medium truncate"
                        style={{ color: isActive ? "#26262B" : "#4A4C53" }}
                      >
                        {item.label}
                      </span>
                      {item.hint && (
                        <span
                          className="text-[10px] font-medium hidden sm:block truncate max-w-[140px]"
                          style={{ color: "#9CA0AA" }}
                        >
                          {item.hint}
                        </span>
                      )}
                      {isActive && (
                        <CornerDownLeft
                          className="w-3 h-3 shrink-0"
                          style={{ color: "#C1652F" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer hints */}
        <div
          className="flex items-center gap-4 px-4 py-2 text-[10px]"
          style={{
            borderTop: "1px solid rgba(163,167,178,0.15)",
            color: "#9CA0AA",
          }}
        >
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            navigate
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            open
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in-95 { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-duration: 150ms; animation-fill-mode: both; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in-95; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(193,101,47,0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
};

export default CommandPalette;
