import client from './client';

export const authAPI = {
  googleLogin: async (token) => {
    const response = await client.post('/auth/google', { token });
    return response.data;
  },

  getProfile: async () => {
    const response = await client.get('/auth/profile');
    return response.data;
  },
};
