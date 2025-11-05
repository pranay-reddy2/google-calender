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

export const attendeesAPI = {
  // Add attendee to event
  addAttendee: async (eventId, data) => {
    const response = await api.post(`/events/${eventId}/attendees`, data);
    return response.data;
  },

  // Get event attendees
  getEventAttendees: async (eventId) => {
    const response = await api.get(`/events/${eventId}/attendees`);
    return response.data;
  },

  // Update RSVP status
  updateRsvp: async (eventId, status) => {
    const response = await api.put(`/events/${eventId}/rsvp`, { status });
    return response.data;
  },

  // Remove attendee
  removeAttendee: async (eventId, attendeeId) => {
    const response = await api.delete(
      `/events/${eventId}/attendees/${attendeeId}`
    );
    return response.data;
  },

  // Get my invitations
  getMyInvitations: async () => {
    const response = await api.get("/my-invitations");
    return response.data;
  },
};
