import axios from "axios";
import { API_URL } from "./api";

export const traineeApi = {
  async getAllTrainees() {
    const response = await axios.get(`${API_URL}/trainees`);
    return response.data;
  },

  async getTraineeById(id: string) {
    const response = await axios.get(`${API_URL}/trainees/${id}`);
    return response.data;
  },

  async createTrainee(data: {
    civil_id: string;
    military_id: string;
    full_name: string;
    rank_id: string;
    specialty_id: string;
    shift_id: string;
  }) {
    const response = await axios.post(`${API_URL}/trainees`, data);
    return response.data;
  },

  async updateTrainee(
    id: string,
    data: {
      civil_id?: string;
      military_id?: string;
      full_name?: string;
      rank_id?: string;
      specialty_id?: string;
      shift_id?: string;
    },
  ) {
    const response = await axios.put(`${API_URL}/trainees/${id}`, data);
    return response.data;
  },

  async deleteTrainee(id: string) {
    const response = await axios.delete(`${API_URL}/trainees/${id}`);
    return response.data;
  },

  async searchByIds(ids: string[], searchType: "military" | "civil") {
    const response = await axios.post(`${API_URL}/trainees/search`, {
      ids,
      searchType,
    });
    return response.data;
  },
};
