"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

import { ApiClientError, authApi } from "./api";
import { onAuthEvent } from "./auth-events";
const TOKEN_STORAGE_KEY = "novilearn.auth.token";
const USER_STORAGE_KEY = "novilearn.auth.user";
function isAuthFailure(error) {
  return error instanceof ApiClientError && error.error.statusCode === 401;
}
async function readStoredSession() {
  try {
    const pairs = await AsyncStorage.multiGet([
      TOKEN_STORAGE_KEY,
      USER_STORAGE_KEY,
    ]);
    const token = pairs[0]?.[1] ?? null;
    const userJson = pairs[1]?.[1] ?? null;
    if (token === null) {
      return {
        token: null,
        user: null,
      };
    }
    return {
      token,
      user: userJson !== null ? JSON.parse(userJson) : null,
    };
  } catch {
    return {
      token: null,
      user: null,
    };
  }
}
async function persistSession(token, user) {
  try {
    await AsyncStorage.multiSet([
      [TOKEN_STORAGE_KEY, token],
      [USER_STORAGE_KEY, JSON.stringify(user)],
    ]);
  } catch {
    // Storage failures should not break the in-memory session.
  }
}
async function clearStoredSession() {
  try {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
  } catch {
    // Storage failures should not block sign out.
  }
}
let restoreStarted = false;
export const useAuthStore = create()((set, get) => ({
  status: "loading",
  user: null,
  token: null,
  restore: async () => {
    if (restoreStarted) {
      return;
    }
    restoreStarted = true;
    const stored = await readStoredSession();
    if (stored.token === null) {
      set({
        status: "unauthenticated",
        user: null,
        token: null,
      });
      return;
    }
    try {
      const user = await authApi.me(stored.token);
      set({
        status: "authenticated",
        user,
        token: stored.token,
      });
    } catch (error) {
      if (isAuthFailure(error)) {
        await clearStoredSession();
        set({
          status: "unauthenticated",
          user: null,
          token: null,
        });
        return;
      }
      // A transient network/server failure should not destroy a valid
      // session. Resume optimistically from the cached user if present; the
      // stored token is kept so the next app start can re-validate it.
      if (stored.user !== null) {
        set({
          status: "authenticated",
          user: stored.user,
          token: stored.token,
        });
      } else {
        set({
          status: "unauthenticated",
          user: null,
          token: stored.token,
        });
      }
    }
  },
  login: async (input) => {
    const session = await authApi.login(input);
    await persistSession(session.token, session.user);
    set({
      status: "authenticated",
      user: session.user,
      token: session.token,
    });
  },
  signup: async (input) => {
    const session = await authApi.signup(input);
    await persistSession(session.token, session.user);
    set({
      status: "authenticated",
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
    set({
      status: "unauthenticated",
      user: null,
      token: null,
    });
  },
}));

// A 401 surfaced by an authenticated API call means the session is stale (or
// revoked server-side). Clear client auth state so guarded screens redirect to
// sign-in. Login/signup failures never emit (they send no token).
onAuthEvent(() => {
  const { status, token } = useAuthStore.getState();
  if (status === "authenticated" && token !== null) {
    void clearStoredSession();
    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      token: null,
    });
  }
});
