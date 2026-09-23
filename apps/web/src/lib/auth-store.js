"use client";

import { create } from "zustand";

import { ApiClientError, authApi } from "./api";
import { onAuthEvent } from "./auth-events";
const TOKEN_KEY = "novilearn.auth.token";
function readToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}
function writeToken(token) {
  if (typeof window === "undefined") {
    return;
  }
  if (token === null) {
    window.localStorage.removeItem(TOKEN_KEY);
  } else {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}
function isAuthFailure(error) {
  return error instanceof ApiClientError && error.error.statusCode === 401;
}
let restoreStarted = false;
export const useAuthStore = create((set, get) => ({
  status: "loading",
  user: null,
  token: null,
  restore: async () => {
    if (restoreStarted) {
      return;
    }
    restoreStarted = true;
    const token = readToken();
    if (token === null) {
      set({
        status: "unauthenticated",
        user: null,
        token: null,
      });
      return;
    }
    try {
      const user = await authApi.me(token);
      set({
        status: "authenticated",
        user,
        token,
      });
    } catch (error) {
      if (isAuthFailure(error)) {
        writeToken(null);
        set({
          status: "unauthenticated",
          user: null,
          token: null,
        });
        return;
      }
      // A transient network/server failure should not destroy a valid
      // session. Keep the stored token so a reload can retry; the UI shows
      // the sign-in screen in the meantime.
      set({
        status: "unauthenticated",
        user: null,
        token,
      });
    }
  },
  login: async (input) => {
    const session = await authApi.login(input);
    writeToken(session.token);
    set({
      status: "authenticated",
      user: session.user,
      token: session.token,
    });
  },
  signup: async (input) => {
    const session = await authApi.signup(input);
    writeToken(session.token);
    set({
      status: "authenticated",
      user: session.user,
      token: session.token,
    });
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
    set({
      status: "unauthenticated",
      user: null,
      token: null,
    });
  },
}));

// A 401 surfaced by an authenticated API call means the session is stale (or
// revoked server-side). Clear client auth state so guarded routes redirect to
// sign-in. Login/signup failures never emit (they send no token).
onAuthEvent(() => {
  const { status, token } = useAuthStore.getState();
  if (status === "authenticated" && token !== null) {
    writeToken(null);
    useAuthStore.setState({
      status: "unauthenticated",
      user: null,
      token: null,
    });
  }
});
