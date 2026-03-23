import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with credentials enabled
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Allow sending cookies with requests
});

export { API_URL, apiClient };
