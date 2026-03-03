import axios from "axios";

const API_BASE =
  "https://decs.site.eliasculqui.com/vituya-jass/services/public/api";

// Base URL para redirecciones
const APP_BASE = import.meta.env.BASE_URL;

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getToken = () => localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const { data } = response;
    // Si la API devuelve un campo status diferente de 200, lo tratamos como error
    if (data && typeof data.status !== "undefined" && data.status !== 200) {
      return Promise.reject(data.message || "Error del servidor");
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData();
      window.location.href = `${APP_BASE}login`;
    }
    return Promise.reject(
      error.response?.data?.message || error.message || "Error de conexión"
    );
  }
);
