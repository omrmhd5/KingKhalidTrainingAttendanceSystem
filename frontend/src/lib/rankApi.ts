import axios from "axios";
import { API_URL } from "./api";

export const rankApi = {
  async getAllRanks() {
    const response = await axios.get(`${API_URL}/ranks`);
    return response.data;
  },

  async createRank(data: { name: string }) {
    const response = await axios.post(`${API_URL}/ranks`, data);
    return response.data;
  },

  async updateRank(id: string, data: { name: string }) {
    const response = await axios.put(`${API_URL}/ranks/${id}`, data);
    return response.data;
  },

  async deleteRank(id: string) {
    const response = await axios.delete(`${API_URL}/ranks/${id}`);
    return response.data;
  },
};
