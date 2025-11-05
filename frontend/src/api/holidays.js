import apiClient from './client';

export const holidaysApi = {
  // Get holidays for a date range
  getHolidays: async (startDate, endDate) => {
    const response = await apiClient.get('/holidays', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get user's holiday preferences
  getHolidayPreferences: async () => {
    const response = await apiClient.get('/holidays/preferences');
    return response.data;
  },

  // Update holiday preference
  updateHolidayPreference: async (countryCode, region, isEnabled) => {
    const response = await apiClient.post('/holidays/preferences', {
      countryCode,
      region,
      isEnabled
    });
    return response.data;
  },

  // Get list of supported countries
  getSupportedCountries: async () => {
    const response = await apiClient.get('/holidays/countries');
    return response.data;
  },

  // Manually sync holidays
  syncHolidays: async (countryCode, year) => {
    const response = await apiClient.post('/holidays/sync', {
      countryCode,
      year
    });
    return response.data;
  }
};
