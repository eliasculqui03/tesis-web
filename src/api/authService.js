import { apiClient, clearAuthData } from "./apiClient.js";

export const authService = {
  login: async (document_number, password) => {
    const { data } = await apiClient.post("/login", {
      document_number,
      password,
    });

    if (data.data?.token) localStorage.setItem("token", data.data.token);
    if (data.data?.user)
      localStorage.setItem("user", JSON.stringify(data.data.user));

    return data.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/logout");
    } finally {
      clearAuthData();
    }
  },
};
