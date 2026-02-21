import { API_URL } from "./api";

export const specializationApi = {
  async getAllSpecializations() {
    const response = await fetch(`${API_URL}/specializations`);
    if (!response.ok) throw new Error("Failed to fetch specializations");
    return response.json();
  },

  async createSpecialization(data: { name: string }) {
    const response = await fetch(`${API_URL}/specializations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create specialization");
    return response.json();
  },

  async updateSpecialization(id: string, data: { name: string }) {
    const response = await fetch(`${API_URL}/specializations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update specialization");
    return response.json();
  },

  async deleteSpecialization(id: string) {
    const response = await fetch(`${API_URL}/specializations/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete specialization");
    return response.json();
  },
};
