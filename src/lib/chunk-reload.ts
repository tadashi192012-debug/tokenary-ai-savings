// After a new deploy, the browser may still hold an old HTML/route map that
// points at hashed chunks that no longer exist. Loading one then fails with
// "Failed to fetch dynamically imported module" and the page goes blank.
// Recover by reloading once (guarded so we never loop).

const RELOAD_FLAG = "tokenary:chunk-reloaded";

function isStaleChunkError(value: unknown): boolean {
  const message =
    value instanceof Error ? value.message : typeof value === "string" ? value : "";
  return (
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

function reloadOnce() {
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return;
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // sessionStorage unavailable — fall through and reload anyway.
  }
  window.location.reload();
}

export function installChunkReload() {
  if (typeof window === "undefined") return;

  try {
    // Clear the guard on a successful load so future deploys can recover too.
    if (document.readyState === "complete") sessionStorage.removeItem(RELOAD_FLAG);
    else window.addEventListener("load", () => sessionStorage.removeItem(RELOAD_FLAG));
  } catch {
    // ignore
  }

  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadOnce();
  });

  window.addEventListener("error", (event) => {
    if (isStaleChunkError((event as ErrorEvent).error ?? (event as ErrorEvent).message)) {
      reloadOnce();
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (isStaleChunkError((event as PromiseRejectionEvent).reason)) reloadOnce();
  });
}
