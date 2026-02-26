import axios from "axios";
import { API_URL } from "./api";

export const shiftApi = {
  async getAllShifts() {
    const response = await axios.get(`${API_URL}/shifts`);
    return response.data;
  },

  async createShift(data: {
    name: string;
    start_time: string;
    end_time: string;
    grace_minutes: number;
  }) {
    const response = await axios.post(`${API_URL}/shifts`, data);
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
    const response = await axios.put(`${API_URL}/shifts/${id}`, data);
    return response.data;
  },

  async deleteShift(id: string) {
    const response = await axios.delete(`${API_URL}/shifts/${id}`);
    return response.data;
  },
};
