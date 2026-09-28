// Where to take the reader after they sign in, for a page that sends them to sign in (or to Google) and wants them
// back, such as /delete-account. Kept for this tab only (sessionStorage, which survives the trip to Google) and for
// 15 minutes; only the paths listed here are ever followed.
const KEY = "sard-return-path";
const MAX_AGE_MS = 15 * 60 * 1000;
const ALLOWED = new Set(["/delete-account"]);

export const rememberReturnPath = (path) => {
  if (!ALLOWED.has(path)) return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ path, at: Date.now() }));
  } catch {
    // Storage is off: the reader lands on the home page instead.
  }
};

// The remembered path (once: it is forgotten here), or null.
export const takeReturnPath = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    sessionStorage.removeItem(KEY);
    return saved && ALLOWED.has(saved.path) && Date.now() - saved.at < MAX_AGE_MS ? saved.path : null;
  } catch {
    return null;
  }
};
