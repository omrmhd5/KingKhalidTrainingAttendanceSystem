import { apiClient } from "./api";

export const rankApi = {
  async getAllRanks() {
    const response = await apiClient.get(`/ranks`);
    return response.data;
  },

  async createRank(data: { name: string }) {
    const response = await apiClient.post(`/ranks`, data);
    return response.data;
  },

  async updateRank(id: string, data: { name: string }) {
    const response = await apiClient.put(`/ranks/${id}`, data);
    return response.data;
  },

  async deleteRank(id: string) {
    const response = await apiClient.delete(`/ranks/${id}`);
    return response.data;
  },
};
