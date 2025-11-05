import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

export const notificationsAPI = {
  // Get upcoming events (next 7 days)
  getUpcomingEvents: async () => {
    const response = await api.get("/upcoming-events");
    return response.data;
  },

  // Get today's events
  getTodayEvents: async () => {
    const response = await api.get("/today-events");
    return response.data;
  },

  // Get pending reminders
  getPendingReminders: async () => {
    const response = await api.get("/pending-reminders");
    return response.data;
  },

  // Mark reminder as sent
  markReminderSent: async (reminderId) => {
    const response = await api.put(`/reminders/${reminderId}/sent`);
    return response.data;
  },

  // Advanced search with filters
  searchEvents: async (params) => {
    const response = await api.get("/search-events", { params });
    return response.data;
  },
};
