import { apiClient } from "./api";

export interface Trainee {
  _id: string;
  full_name: string;
  civil_id: string;
  military_id: string;
  class?: string;
  rank_id: string;
  specialty_id: string;
  shift_id: string;
  violations?: string[];
  disciplinary?: string[];
}

export const traineeApi = {
  async getAllTrainees() {
    const response = await apiClient.get<Trainee[]>(`/trainees`);
    return response.data;
  },

  async getTraineeById(id: string) {
    const response = await apiClient.get<Trainee>(`/trainees/${id}`);
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
    const response = await apiClient.post(`/trainees`, data);
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
    const response = await apiClient.put(`/trainees/${id}`, data);
    return response.data;
  },

  async deleteTrainee(id: string) {
    const response = await apiClient.delete(`/trainees/${id}`);
    return response.data;
  },

  async searchByIds(ids: string[], searchType: "military" | "civil") {
    const response = await apiClient.post(`/trainees/search`, {
      ids,
      searchType,
    });
    return response.data;
  },

  async bulkImportTrainees(
    traineesData: Array<{
      military_id: string;
      civil_id?: string;
      full_name: string;
      rank_id?: string;
      specialty_id?: string;
      shift_id?: string;
    }>,
  ) {
    const response = await apiClient.post(`/trainees/bulk-import`, {
      trainees: traineesData,
    });
    return response.data;
  },

  async bulkUpdateShift(ids: string[], shiftId: string) {
    const response = await apiClient.put(`/trainees/bulk-shift`, {
      ids,
      shiftId,
    });
    return response.data;
  },
};
