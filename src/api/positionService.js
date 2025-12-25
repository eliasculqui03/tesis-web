import { apiClient } from "./apiClient.js";

export const positionService = {
  getAll: async (search = "") => {
    const { data } = await apiClient.post("/get-positions", { search });
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.post("/detail-position", { id });
    return data.data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post("/create-position", {
      name_position: payload.name_position,
      description: payload.description,
      status: payload.status ? 1 : 0,
    });
    return data;
  },

  update: async (payload) => {
    const { data } = await apiClient.post("/update-position", {
      id: payload.id,
      name_position: payload.name_position,
      description: payload.description,
      status: payload.status ? 1 : 0,
    });
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await apiClient.post("/change-status-position", { id });
    return data;
  },
};
