const SCROLL_POSITION_KEY = "local-notes-scroll-position";
const SKIP_HOME_FOCUS_KEY = "local-notes-skip-home-focus";

const isBrowser = () => typeof window !== "undefined";

export const saveScrollPosition = () => {
  if (!isBrowser()) return;
  sessionStorage.setItem(SCROLL_POSITION_KEY, String(window.scrollY));
  sessionStorage.setItem(SKIP_HOME_FOCUS_KEY, "true");
};

export const restoreScrollPosition = () => {
  if (!isBrowser()) return;
  const saved = sessionStorage.getItem(SCROLL_POSITION_KEY);
  if (!saved) return;

  const top = Number(saved);
  if (Number.isNaN(top)) return;

  requestAnimationFrame(() => {
    window.scrollTo({ top });
  });

  sessionStorage.removeItem(SCROLL_POSITION_KEY);
};

export const consumeSkipHomeFocusFlag = () => {
  if (!isBrowser()) return false;
  const shouldSkip = sessionStorage.getItem(SKIP_HOME_FOCUS_KEY);
  if (!shouldSkip) return false;
  sessionStorage.removeItem(SKIP_HOME_FOCUS_KEY);
  return true;
};
