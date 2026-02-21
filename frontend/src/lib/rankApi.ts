import { API_URL } from "./api";

export const rankApi = {
  async getAllRanks() {
    const response = await fetch(`${API_URL}/ranks`);
    if (!response.ok) throw new Error("Failed to fetch ranks");
    return response.json();
  },

  async createRank(data: { name: string }) {
    const response = await fetch(`${API_URL}/ranks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create rank");
    return response.json();
  },

  async updateRank(id: string, data: { name: string }) {
    const response = await fetch(`${API_URL}/ranks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update rank");
    return response.json();
  },

  async deleteRank(id: string) {
    const response = await fetch(`${API_URL}/ranks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete rank");
    return response.json();
  },
};
