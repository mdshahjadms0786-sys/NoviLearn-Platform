const listeners = new Set();
export function emitAuthEvent() {
  for (const listener of listeners) {
    listener();
  }
}
export function onAuthEvent(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
