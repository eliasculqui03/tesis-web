import { apiClient } from "./apiClient.js";

export const measurementService = {
  getAll: async (params = {}) => {
    const { data } = await apiClient.post("/get-measurements", params);
    return data;
  },

  getLastReadings: async () => {
    const { data } = await apiClient.post("/get-last-readings", {});
    return data;
  },
};
