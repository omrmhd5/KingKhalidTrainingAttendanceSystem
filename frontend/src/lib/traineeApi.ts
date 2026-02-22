import { API_URL } from "./api";

export const traineeApi = {
  async getAllTrainees() {
    const response = await fetch(`${API_URL}/trainees`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل تحميل المتدربين");
    }
    const data = await response.json();
    return data;
  },

  async getTraineeById(id: string) {
    const response = await fetch(`${API_URL}/trainees/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل تحميل المتدرب");
    }
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل إنشاء المتدرب");
    }
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل تحديث المتدرب");
    }
    const result = await response.json();
    return result;
  },

  async deleteTrainee(id: string) {
    const response = await fetch(`${API_URL}/trainees/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل حذف المتدرب");
    }
    return response.json();
  },

  async searchByIds(ids: string[], searchType: "military" | "civil") {
    const response = await fetch(`${API_URL}/trainees/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, searchType }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "فشل البحث عن المتدربين");
    }
    return response.json();
  },
};
