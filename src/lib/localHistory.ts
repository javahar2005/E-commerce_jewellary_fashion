"use client";

const SEARCH_KEY = "velora_recent_searches";
const VIEWED_KEY = "velora_recently_viewed";
const SEARCH_LIMIT = 3;
const VIEWED_LIMIT = 10;

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(key: string, value: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getLocalSearches(): string[] {
  return read(SEARCH_KEY).slice(0, SEARCH_LIMIT);
}

export function addLocalSearch(query: string): string[] {
  const q = query.trim().replace(/\s+/g, " ");
  if (!q) return getLocalSearches();
  const next = [q, ...read(SEARCH_KEY).filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(
    0,
    SEARCH_LIMIT,
  );
  write(SEARCH_KEY, next);
  return next;
}

export function removeLocalSearch(query: string): string[] {
  const next = read(SEARCH_KEY).filter((s) => s.toLowerCase() !== query.toLowerCase());
  write(SEARCH_KEY, next);
  return next;
}

export function clearLocalSearches(): string[] {
  write(SEARCH_KEY, []);
  return [];
}

export function getLocalViewed(): string[] {
  return read(VIEWED_KEY).slice(0, VIEWED_LIMIT);
}

export function addLocalViewed(productId: string): string[] {
  if (!productId) return getLocalViewed();
  const next = [productId, ...read(VIEWED_KEY).filter((id) => id !== productId)].slice(0, VIEWED_LIMIT);
  write(VIEWED_KEY, next);
  return next;
}
