'use client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import type { LoginInput, SignupInput, User } from '@novilearn/types';

import { authApi } from './api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

const TOKEN_STORAGE_KEY = 'novilearn.auth.token';
const USER_STORAGE_KEY = 'novilearn.auth.user';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  token: string | null;
  restore: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
}

interface StoredSession {
  token: string | null;
  user: User | null;
}

async function readStoredSession(): Promise<StoredSession> {
  try {
    const pairs = await AsyncStorage.multiGet([
      TOKEN_STORAGE_KEY,
      USER_STORAGE_KEY,
    ]);
    const token = pairs[0]?.[1] ?? null;
    const userJson = pairs[1]?.[1] ?? null;
    if (token === null) {
      return { token: null, user: null };
    }
    return {
      token,
      user: userJson !== null ? (JSON.parse(userJson) as User) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

async function persistSession(token: string, user: User): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_STORAGE_KEY, token],
      [USER_STORAGE_KEY, JSON.stringify(user)],
    ]);
  } catch {
    // Storage failures should not break the in-memory session.
  }
}

async function clearStoredSession(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch {
    // Storage failures should not block sign out.
  }
}

let restoreStarted = false;

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: 'loading',
  user: null,
  token: null,
  restore: async () => {
    if (restoreStarted) {
      return;
    }
    restoreStarted = true;
    const stored = await readStoredSession();
    if (stored.token === null) {
      set({ status: 'unauthenticated', user: null, token: null });
      return;
    }
    try {
      const user = await authApi.me(stored.token);
      set({ status: 'authenticated', user, token: stored.token });
    } catch {
      await clearStoredSession();
      set({ status: 'unauthenticated', user: null, token: null });
    }
  },
  login: async (input) => {
    const session = await authApi.login(input);
    await persistSession(session.token, session.user);
    set({
      status: 'authenticated',
      user: session.user,
      token: session.token,
    });
  },
  signup: async (input) => {
    const session = await authApi.signup(input);
    await persistSession(session.token, session.user);
    set({
      status: 'authenticated',
      user: session.user,
      token: session.token,
    });
  },
  logout: async () => {
    const { token } = get();
    if (token !== null) {
      try {
        await authApi.logout(token);
      } catch {
        // Even if the server call fails, clear the local session.
      }
    }
    await clearStoredSession();
    set({ status: 'unauthenticated', user: null, token: null });
  },
}));
