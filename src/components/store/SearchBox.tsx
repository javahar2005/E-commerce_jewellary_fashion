"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import {
  getLocalSearches,
  addLocalSearch,
  removeLocalSearch,
  clearLocalSearches,
} from "@/lib/localHistory";
import { Spinner } from "@/components/ui/States";
import { cn } from "@/lib/utils";

export function SearchBox({
  isCustomer,
  autoFocus = false,
  onNavigate,
}: {
  isCustomer: boolean;
  autoFocus?: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sugState, setSugState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  const showSuggest = q.trim().length >= 3;

  const loadRecent = useCallback(async () => {
    const local = getLocalSearches();
    if (isCustomer) {
      const res = await api<{ searches: string[] }>("/api/search/recent");
      setRecent(res.ok && res.data.searches.length ? res.data.searches : local);
    } else {
      setRecent(local);
    }
  }, [isCustomer]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Debounced autocomplete.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!showSuggest) return;
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSugState("loading");
    debounceRef.current = setTimeout(async () => {
      const id = ++reqIdRef.current;
      const res = await api<{ suggestions: string[] }>(
        `/api/search/suggest?q=${encodeURIComponent(q.trim())}`,
      );
      if (id !== reqIdRef.current) return; // stale
      if (!res.ok) {
        setSuggestions([]);
        setSugState("error");
        return;
      }
      setSuggestions(res.data.suggestions);
      setSugState("done");
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, showSuggest]);

  async function runSearch(term: string) {
    const value = term.trim();
    if (!value) return;
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();

    // Optimistic local update + persistence.
    setRecent(addLocalSearch(value));
    if (isCustomer) {
      const res = await api<{ searches: string[] }>("/api/search/recent", {
        method: "POST",
        body: JSON.stringify({ query: value }),
      });
      if (res.ok && res.data.searches?.length) setRecent(res.data.searches);
    }

    onNavigate?.();
    router.push(`/products?q=${encodeURIComponent(value)}`);
  }

  async function clearAll() {
    setRecent(clearLocalSearches());
    if (isCustomer) await api("/api/search/recent", { method: "DELETE" });
  }

  async function removeOne(term: string) {
    setRecent(removeLocalSearch(term));
    if (isCustomer)
      await api(`/api/search/recent?q=${encodeURIComponent(term)}`, { method: "DELETE" });
  }

  const options = showSuggest ? suggestions : recent;

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && options[activeIndex]) runSearch(options[activeIndex]);
      else runSearch(q);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    }
  }

  const dropdownVisible =
    open && (showSuggest || recent.length > 0);

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(q);
        }}
        className="flex items-center gap-2"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            ref={inputRef}
            autoFocus={autoFocus}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              setOpen(true);
              loadRecent();
            }}
            onKeyDown={onKeyDown}
            placeholder="Search jewellery, fashion, materials…"
            aria-label="Search"
            aria-expanded={dropdownVisible}
            role="combobox"
            aria-controls="search-listbox"
            className="h-10 w-full border border-charcoal/20 bg-white pl-9 pr-8 text-sm text-charcoal placeholder:text-stone/60 focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal/15"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQ("");
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
            >
              ✕
            </button>
          )}
        </div>
        <button className="h-10 shrink-0 bg-charcoal px-5 text-sm text-ivory">Search</button>
      </form>

      {dropdownVisible && (
        <div
          id="search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto border border-charcoal/15 bg-white shadow-sm thin-scroll"
        >
          {!showSuggest ? (
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between px-1">
                <p className="eyebrow">Recent searches</p>
                <button
                  onClick={clearAll}
                  className="text-[0.7rem] text-stone underline hover:text-charcoal"
                >
                  Clear
                </button>
              </div>
              <ul>
                {recent.map((term, i) => (
                  <li key={term} className="group flex items-center">
                    <button
                      role="option"
                      aria-selected={activeIndex === i}
                      onClick={() => runSearch(term)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex flex-1 items-center gap-2 px-2 py-2 text-left text-sm text-charcoal",
                        activeIndex === i ? "bg-beige" : "hover:bg-beige/60",
                      )}
                    >
                      <span className="text-stone">⌕</span>
                      {term}
                    </button>
                    <button
                      aria-label={`Remove ${term}`}
                      onClick={() => removeOne(term)}
                      className="px-2 text-xs text-stone opacity-0 transition-opacity hover:text-charcoal group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="p-2">
              {sugState === "loading" && (
                <div className="flex items-center gap-2 px-2 py-3 text-sm text-stone">
                  <Spinner /> Searching…
                </div>
              )}
              {sugState === "error" && (
                <p className="px-2 py-3 text-sm text-[#8f5748]">
                  Couldn't load suggestions. Press Enter to search anyway.
                </p>
              )}
              {sugState === "done" && suggestions.length === 0 && (
                <p className="px-2 py-3 text-sm text-stone">No suggestions found</p>
              )}
              {suggestions.length > 0 && (
                <ul>
                  {suggestions.map((s, i) => (
                    <li key={s}>
                      <button
                        role="option"
                        aria-selected={activeIndex === i}
                        onClick={() => runSearch(s)}
                        onMouseEnter={() => setActiveIndex(i)}
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-2 text-left text-sm text-charcoal",
                          activeIndex === i ? "bg-beige" : "hover:bg-beige/60",
                        )}
                      >
                        <span className="text-stone">⌕</span>
                        <span className="truncate">{s}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
