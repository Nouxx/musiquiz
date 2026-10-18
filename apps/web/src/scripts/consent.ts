type Listener = (isGranted: boolean) => void;

const listeners = new Set<Listener>();
const state = {
  isGranted: false,
  isDecided: false,
  isWatching: false,
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

function record(entry: unknown) {
  const next = readUpdate(entry);
  if (next === undefined) return;

  state.isGranted = next;
  state.isDecided = true;
  return next;
}

// a repeated decision still notifies: a withdrawal from an earlier visit
// arrives as an update while `isGranted` is already false
function apply(entry: unknown) {
  const next = record(entry);
  if (next === undefined) return;

  for (const listener of listeners) listener(next);
}

// the CMP is not picked yet, so its Consent Mode commands are the only
// CMP-agnostic signal: see ADR 0028
function watch() {
  const dataLayer = globalThis.dataLayer;
  if (state.isWatching || !dataLayer) return;
  state.isWatching = true;

  for (const entry of dataLayer) record(entry);

  // GTM swaps `push` too and calls the one it found, so either load order
  // keeps both. It also trims the array to its last 300 entries, so only
  // the pushed entries can be trusted, never an index
  const push = dataLayer.push;
  dataLayer.push = function (...entries: unknown[]) {
    const length = push.apply(dataLayer, entries);
    for (const entry of entries) apply(entry);
    return length;
  };
}

export function hasAnalyticsConsent() {
  watch();
  return state.isGranted;
}

export function onAnalyticsConsent(listener: Listener) {
  watch();
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
