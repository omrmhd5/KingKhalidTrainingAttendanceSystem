import { API_URL } from "./api";

export const shiftApi = {
  async getAllShifts() {
    const response = await fetch(`${API_URL}/shifts`);
    if (!response.ok) throw new Error("Failed to fetch shifts");
    return response.json();
  },

  async createShift(data: {
    name: string;
    start_time: string;
    end_time: string;
    grace_minutes: number;
  }) {
    const response = await fetch(`${API_URL}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create shift");
    return response.json();
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
    const response = await fetch(`${API_URL}/shifts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update shift");
    return response.json();
  },

  async deleteShift(id: string) {
    const response = await fetch(`${API_URL}/shifts/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete shift");
    return response.json();
  },
};
