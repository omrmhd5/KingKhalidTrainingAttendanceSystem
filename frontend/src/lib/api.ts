import axios from "axios";
import i18n, { normalizeLanguage } from "@/i18n";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://king-khalid-training-attendance-system.onrender.com/api"
    : "http://localhost:5000/api");

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const lang = normalizeLanguage(i18n.resolvedLanguage || i18n.language);
  config.headers = config.headers || {};
  config.headers["Accept-Language"] = lang;
  config.headers["X-Language"] = lang;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    if (data?.message) {
      error.message = data.message;
    } else if (typeof data?.error === "string" && !/^[A-Z_]+$/.test(data.error)) {
      error.message = data.error;
    }
    return Promise.reject(error);
  },
);

export { API_URL, apiClient };
