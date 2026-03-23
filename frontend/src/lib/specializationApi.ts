import { apiClient } from "./api";

export const specializationApi = {
  async getAllSpecializations() {
    const response = await apiClient.get(`/specializations`);
    return response.data;
  },

  async createSpecialization(data: { name: string }) {
    const response = await apiClient.post(`/specializations`, data);
    return response.data;
  },

  async updateSpecialization(id: string, data: { name: string }) {
    const response = await apiClient.put(`/specializations/${id}`, data);
    return response.data;
  },

  async deleteSpecialization(id: string) {
    const response = await apiClient.delete(`/specializations/${id}`);
    return response.data;
  },
};
