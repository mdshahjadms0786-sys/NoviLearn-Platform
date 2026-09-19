'use client';

import { create } from 'zustand';

import type { LoginInput, SignupInput, User } from '@novilearn/types';

import { authApi } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const TOKEN_KEY = 'novilearn.auth.token';

function readToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

function writeToken(token: string | null): void {
  if (typeof window === 'undefined') {
    return;
  }
  if (token === null) {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  restore: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

let restoreStarted = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  user: null,
  token: null,
  restore: async () => {
    if (restoreStarted) {
      return;
    }
    restoreStarted = true;

    const token = readToken();
    if (token === null) {
      set({ status: 'unauthenticated', user: null, token: null });
      return;
    }

    try {
      const user = await authApi.me(token);
      set({ status: 'authenticated', user, token });
    } catch {
      writeToken(null);
      set({ status: 'unauthenticated', user: null, token: null });
    }
  },
  login: async (input) => {
    const session = await authApi.login(input);
    writeToken(session.token);
    set({ status: 'authenticated', user: session.user, token: session.token });
  },
  signup: async (input) => {
    const session = await authApi.signup(input);
    writeToken(session.token);
    set({ status: 'authenticated', user: session.user, token: session.token });
  },
  logout: async () => {
    const token = get().token;
    if (token !== null) {
      try {
        await authApi.logout(token);
      } catch {
        // Best-effort server invalidation; client state is cleared regardless.
      }
    }
    writeToken(null);
    set({ status: 'unauthenticated', user: null, token: null });
  },
}));
