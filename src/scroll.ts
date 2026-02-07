// Centralized scroll helpers with query-aware keys
const SCROLL_KEY = "scroll";

export interface ScrollPosition {
  x: number;
  y: number;
}

export const getScrollPosition = (): ScrollPosition => ({
  y: window.pageYOffset || document.documentElement.scrollTop || 0,
  x: window.pageXOffset || document.documentElement.scrollLeft || 0,
});

const currentKey = (): string => {
  const { pathname, search } = window.location;
  return `${pathname}${search || ""}`;
};

const readStore = (): Record<string, ScrollPosition> => {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const blob = sessionStorage.getItem(SCROLL_KEY);
    return blob ? (JSON.parse(blob) as Record<string, ScrollPosition>) : {};
  } catch {
    return {};
  }
};

const writeStore = (obj: Record<string, ScrollPosition>): void => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch {
    /* ignore quota/security errors */
  }
};

export const setScrollToSessionStorage = (): void => {
  const store = readStore();
  store[currentKey()] = getScrollPosition();
  writeStore(store);
};

export const setScrollForKey = (key: string, pos?: ScrollPosition): void => {
  const store = readStore();
  store[key] = pos || getScrollPosition();
  writeStore(store);
};

export function getScrollFromSessionStorage(key: "*"): Record<string, ScrollPosition>;
export function getScrollFromSessionStorage(key: string): ScrollPosition | null;
export function getScrollFromSessionStorage(
  key?: string,
): Record<string, ScrollPosition> | ScrollPosition | null {
  const store = readStore();
  if (key === "*" || key === undefined) return store;
  return store[key] || null;
}
