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

export const sharingAPI = {
  // Share calendar with user
  shareCalendar: async (calendarId, data) => {
    const response = await api.post(`/calendars/${calendarId}/share`, data);
    return response.data;
  },

  // Get calendar shares
  getCalendarShares: async (calendarId) => {
    const response = await api.get(`/calendars/${calendarId}/shares`);
    return response.data;
  },

  // Update share permission
  updateSharePermission: async (calendarId, shareId, permission) => {
    const response = await api.put(
      `/calendars/${calendarId}/shares/${shareId}`,
      { permission }
    );
    return response.data;
  },

  // Remove calendar share
  removeCalendarShare: async (calendarId, shareId) => {
    const response = await api.delete(
      `/calendars/${calendarId}/shares/${shareId}`
    );
    return response.data;
  },

  // Get shared calendars
  getSharedCalendars: async () => {
    const response = await api.get("/shared-calendars");
    return response.data;
  },
};
