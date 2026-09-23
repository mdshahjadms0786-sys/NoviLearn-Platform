'use client';

type AuthEventListener = () => void;

const listeners = new Set<AuthEventListener>();

export function emitAuthEvent(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function onAuthEvent(listener: AuthEventListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}