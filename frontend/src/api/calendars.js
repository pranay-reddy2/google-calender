import client from './client';

export const calendarsAPI = {
  getAll: async () => {
    const response = await client.get('/calendars');
    return response.data;
  },

  getById: async (id) => {
    const response = await client.get(`/calendars/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await client.post('/calendars', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await client.put(`/calendars/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await client.delete(`/calendars/${id}`);
    return response.data;
  },

  share: async (id, data) => {
    const response = await client.post(`/calendars/${id}/share`, data);
    return response.data;
  },

  getShares: async (id) => {
    const response = await client.get(`/calendars/${id}/shares`);
    return response.data;
  },

  removeShare: async (id, userId) => {
    const response = await client.delete(`/calendars/${id}/shares/${userId}`);
    return response.data;
  },
};
