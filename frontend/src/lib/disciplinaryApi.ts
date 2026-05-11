import { apiClient } from "./api";

const disciplinaryApi = {
  // Create a new disciplinary request
  createDisciplinary: async (trainee_id: string, reason: string) => {
    const response = await apiClient.post(`/disciplinary`, {
      trainee_id,
      reason,
    });
    return response.data;
  },

  // Get all disciplinary requests
  getAllDisciplinary: async () => {
    const response = await apiClient.get(`/disciplinary`);
    return response.data;
  },

  // Get disciplinary requests by trainee ID
  getDisciplinaryByTraineeId: async (trainee_id: string) => {
    const response = await apiClient.get(`/disciplinary/trainee/${trainee_id}`);
    return response.data;
  },

  // Update a disciplinary request
  updateDisciplinary: async (disciplinaryId: string, reason: string) => {
    const response = await apiClient.put(`/disciplinary/${disciplinaryId}`, {
      reason,
    });
    return response.data;
  },

  // Delete a specific disciplinary request
  deleteDisciplinary: async (disciplinaryId: string) => {
    const response = await apiClient.delete(`/disciplinary/${disciplinaryId}`);
    return response.data;
  },

  // Delete all disciplinary requests for a trainee
  deleteAllDisciplinaryByTrainee: async (trainee_id: string) => {
    const response = await apiClient.delete(
      `/disciplinary/trainee/${trainee_id}/all`,
    );
    return response.data;
  },
};

export { disciplinaryApi };
