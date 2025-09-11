// Centralized scroll helpers with query-aware keys
const SCROLL_KEY = "scroll";

export const getScrollPosition = () => ({
  y: window.pageYOffset || document.documentElement.scrollTop || 0,
  x: window.pageXOffset || document.documentElement.scrollLeft || 0
});

const currentKey = () => {
  const { pathname, search } = window.location;
  return `${pathname}${search || ""}`;
};

const readStore = () => {
  if (typeof sessionStorage === "undefined") return {};
  try {
    const blob = sessionStorage.getItem(SCROLL_KEY);
    return blob ? JSON.parse(blob) : {};
  } catch {
    return {};
  }
};

const writeStore = (obj) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_KEY, JSON.stringify(obj));
  } catch {
    /* ignore quota/security errors */
  }
};

export const setScrollToSessionStorage = () => {
  const store = readStore();
  store[currentKey()] = getScrollPosition();
  writeStore(store);
};

export const setScrollForKey = (key, pos) => {
  const store = readStore();
  store[key] = pos || getScrollPosition();
  writeStore(store);
};

export const getScrollFromSessionStorage = (key = "*") => {
  const store = readStore();
  if (key === "*") return store;
  return store[key] || null;
};
