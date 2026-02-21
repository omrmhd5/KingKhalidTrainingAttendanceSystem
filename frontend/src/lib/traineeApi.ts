import { API_URL } from "./api";

export const traineeApi = {
  async getAllTrainees() {
    const response = await fetch(`${API_URL}/trainees`);
    if (!response.ok) throw new Error("Failed to fetch trainees");
    const data = await response.json();
    return data;
  },

  async getTraineeById(id: string) {
    const response = await fetch(`${API_URL}/trainees/${id}`);
    if (!response.ok) throw new Error("Failed to fetch trainee");
    return response.json();
  },

  async createTrainee(data: {
    civil_id: string;
    military_id: string;
    full_name: string;
    rank_id: string;
    specialty_id: string;
    shift_id: string;
  }) {
    const response = await fetch(`${API_URL}/trainees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create trainee");
    const result = await response.json();
    return result;
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
    const response = await fetch(`${API_URL}/trainees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update trainee");
    const result = await response.json();
    return result;
  },

  async deleteTrainee(id: string) {
    const response = await fetch(`${API_URL}/trainees/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete trainee");
    return response.json();
  },
};
