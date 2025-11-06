import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const availabilityAPI = {
  // Working hours
  getWorkingHours: async (userId = null) => {
    const url = userId
      ? `/availability/working-hours/${userId}`
      : "/availability/working-hours";
    const response = await api.get(url);
    return response.data;
  },

  updateWorkingHours: async (workingHours) => {
    const response = await api.put("/availability/working-hours", {
      workingHours,
    });
    return response.data;
  },

  // Availability preferences
  getAvailabilityPreferences: async () => {
    const response = await api.get("/availability/availability-preferences");
    return response.data;
  },

  updateAvailabilityPreferences: async (preferences) => {
    const response = await api.put(
      "/availability/availability-preferences",
      preferences
    );
    return response.data;
  },

  // User preferences
  getUserPreferences: async () => {
    const response = await api.get("/availability/preferences");
    return response.data;
  },

  updateUserPreferences: async (preferences) => {
    const response = await api.put("/availability/preferences", preferences);
    return response.data;
  },

  deleteUserPreferences: async () => {
    const response = await api.delete("/availability/preferences");
    return response.data;
  },

  // Check availability
  checkAvailability: async (userId, startTime, endTime) => {
    const response = await api.get(
      `/availability/check-availability/${userId}`,
      {
        params: { startTime, endTime },
      }
    );
    return response.data;
  },

  // Timezone
  getUserTimezone: async (userId = null) => {
    const url = userId
      ? `/availability/timezone/${userId}`
      : "/availability/timezone";
    const response = await api.get(url);
    return response.data;
  },

  updateUserTimezone: async (timezone) => {
    const response = await api.put("/availability/timezone", { timezone });
    return response.data;
  },
};
