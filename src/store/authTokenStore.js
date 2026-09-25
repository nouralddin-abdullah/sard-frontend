import { create } from "zustand";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../constants/token-key";

// `secure` only on https so the cookie still works on http://localhost during development.
const TOKEN_COOKIE_OPTIONS = {
  expires: 30,
  sameSite: "lax",
  secure: typeof window !== "undefined" && window.location.protocol === "https:",
};

const useAuthStore = create((set, get) => ({
  // State to hold the tokens
  token: Cookies.get(TOKEN_KEY) || null,
  isAuthenticated: !!Cookies.get(TOKEN_KEY),

  // Function to create/set the auth token
  setToken: (value) => {
    console.log("Setting token:", value ? "***TOKEN***" : "null");
    if (value) {
      Cookies.set(TOKEN_KEY, value, TOKEN_COOKIE_OPTIONS);
      set({ token: value, isAuthenticated: true });
    } else {
      Cookies.remove(TOKEN_KEY);
      set({ token: null, isAuthenticated: false });
    }
  },

  // Function to get/read the auth token
  getToken: () => {
    const token = Cookies.get(TOKEN_KEY) || null;
    const isAuthenticated = !!token;
    console.log("Getting token:", token ? "***TOKEN_EXISTS***" : "null");
    set({ token, isAuthenticated });
    return token;
  },

  // Function to update the auth token
  updateToken: (newToken) => {
    console.log("Updating token:", newToken ? "***NEW_TOKEN***" : "null");
    if (newToken) {
      Cookies.set(TOKEN_KEY, newToken, TOKEN_COOKIE_OPTIONS);
      set({ token: newToken, isAuthenticated: true });
    } else {
      get().deleteToken();
    }
  },

  // Function to delete token and clear auth state
  deleteToken: () => {
    console.log("Deleting token");
    Cookies.remove(TOKEN_KEY);
    set({ token: null, isAuthenticated: false });
  },

  // Check if user is authenticated (synchronous)
  checkAuth: () => {
    const token = Cookies.get(TOKEN_KEY);
    const isAuthenticated = !!token;
    console.log("Checking auth:", isAuthenticated);
    set({ token, isAuthenticated });
    return isAuthenticated;
  },
}));

export default useAuthStore;
