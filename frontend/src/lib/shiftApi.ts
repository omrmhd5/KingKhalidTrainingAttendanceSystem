import { apiClient } from "./api";

export const shiftApi = {
  async getAllShifts() {
    const response = await apiClient.get(`/shifts`);
    return response.data;
  },

  async createShift(data: {
    name: string;
    start_time: string;
    end_time: string;
    grace_minutes: number;
  }) {
    const response = await apiClient.post(`/shifts`, data);
    return response.data;
  },

  async updateShift(
    id: string,
    data: {
      name: string;
      start_time: string;
      end_time: string;
      grace_minutes: number;
    },
  ) {
    const response = await apiClient.put(`/shifts/${id}`, data);
    return response.data;
  },

  async deleteShift(id: string) {
    const response = await apiClient.delete(`/shifts/${id}`);
    return response.data;
  },
};
