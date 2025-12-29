import { apiClient } from "./apiClient.js";

export const userService = {
  getAll: async (page = 1, search = "") => {
    const { data } = await apiClient.post("/get-users", { page, search });
    return data;
  },

  getById: async (id) => {
    const { data } = await apiClient.post("/detail-user", { id });
    return data.data;
  },

  create: async (payload) => {
    const { data } = await apiClient.post("/create-user", {
      ...payload,
      status: payload.status ? 1 : 0,
    });
    return data;
  },

  update: async (payload) => {
    const { data } = await apiClient.post("/update-user", {
      ...payload,
      status: payload.status ? 1 : 0,
    });
    return data;
  },

  toggleStatus: async (id) => {
    const { data } = await apiClient.post("/change-status-user", { id });
    return data;
  },

  changePassword: async (id, new_password) => {
    const { data } = await apiClient.post("/change-password", {
      id,
      new_password,
    });
    return data;
  },
};
