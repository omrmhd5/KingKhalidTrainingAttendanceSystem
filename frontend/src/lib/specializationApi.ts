import axios from "axios";
import { API_URL } from "./api";

export const specializationApi = {
  async getAllSpecializations() {
    const response = await axios.get(`${API_URL}/specializations`);
    return response.data;
  },

  async createSpecialization(data: { name: string }) {
    const response = await axios.post(`${API_URL}/specializations`, data);
    return response.data;
  },

  async updateSpecialization(id: string, data: { name: string }) {
    const response = await axios.put(`${API_URL}/specializations/${id}`, data);
    return response.data;
  },

  async deleteSpecialization(id: string) {
    const response = await axios.delete(`${API_URL}/specializations/${id}`);
    return response.data;
  },
};
