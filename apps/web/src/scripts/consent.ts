type Listener = (isGranted: boolean) => void;

const listeners = new Set<Listener>();
const state = {
  isGranted: false,
  isDecided: false,
  isWatching: false,
  cursor: 0,
};

// gtag pushes `arguments`, an array-like, not an array
function readUpdate(entry: unknown) {
  if (typeof entry !== "object" || entry === null) return;

  const command = entry as Record<number, unknown>;
  if (command[0] !== "consent" || command[1] !== "update") return;

  const storage = (command[2] as { analytics_storage?: unknown } | undefined)
    ?.analytics_storage;
  if (storage === "granted" || storage === "denied") {
    return storage === "granted";
  }

  return;
}

// a repeated decision still notifies: a withdrawal from an earlier visit
// arrives as an update while `isGranted` is already false
function sync() {
  const dataLayer = globalThis.dataLayer ?? [];

  // the cursor moves first: listeners read the state back
  while (state.cursor < dataLayer.length) {
    const next = readUpdate(dataLayer[state.cursor++]);
    if (next === undefined) continue;

    state.isGranted = next;
    state.isDecided = true;
    for (const listener of listeners) listener(next);
  }
}

// the CMP is not picked yet, so its Consent Mode commands are the only
// CMP-agnostic signal: see ADR 0028
function watch() {
  const dataLayer = globalThis.dataLayer;
  if (state.isWatching || !dataLayer) return;
  state.isWatching = true;

  // GTM swaps `push` too and calls the one it found, so either load order
  // keeps both. Reads still rescan, in case one day it does not
  const push = dataLayer.push;
  dataLayer.push = function (...entries: unknown[]) {
    const length = push.apply(dataLayer, entries);
    sync();
    return length;
  };
}

export function hasAnalyticsConsent() {
  watch();
  sync();
  return state.isGranted;
}

export function onAnalyticsConsent(listener: Listener) {
  watch();
  sync();
  listeners.add(listener);

  // a decision already made is replayed, after the caller has finished
  // setting up
  if (state.isDecided) {
    queueMicrotask(() => {
      if (listeners.has(listener)) listener(state.isGranted);
    });
  }

  return function stop() {
    listeners.delete(listener);
  };
}
