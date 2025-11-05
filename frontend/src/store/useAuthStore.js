import { create } from "zustand";
import { authAPI } from "../api/auth"; // Assuming you have an API utility for authentication
import axios from "axios";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // Add a loading state
  error: null,

  // Login with Google (updated to only have one function)
  loginWithGoogle: async (googleToken) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authAPI.googleLogin(googleToken); // Assuming this function exists
      localStorage.setItem("token", data.token);
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error || "Login failed",
        isLoading: false,
      });
      throw error;
    }
  },

  // Load user data (either from demo or real authentication)
  loadUser: async () => {
    const token = localStorage.getItem("token");

    // If there's no token, set loading to false and return
    if (!token) {
      set({ isLoading: false });
      return;
    }

    // Simulating demo mode - Always authenticated
    set({
      isAuthenticated: true,
      user: { id: 1, name: "Demo User", email: "demo@example.com" },
      isLoading: false,
    });

    set({ isLoading: true });
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        user: response.data,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // Logout (clear the user and token)
  logout: () => {
    localStorage.removeItem("token");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Register and other possible functions
  // You can add other methods for sign up, password reset, etc.
}));
