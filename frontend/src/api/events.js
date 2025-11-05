import client from './client';

export const eventsAPI = {
  getAll: async (params) => {
    const response = await client.get('/events', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/events/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/events', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id, deleteAll = false) => {
    const response = await client.delete(`/events/${id}`, {
      params: { deleteAll }
    });
    return response.data;
  },

  updateAttendeeStatus: async (id, status) => {
    const response = await client.patch(`/events/${id}/attendee-status`, { status });
    return response.data;
  },

  search: async (query, calendarIds) => {
    const response = await client.get('/events/search', {
      params: { q: query, calendarIds }
    });
    return response.data;
  },
};
