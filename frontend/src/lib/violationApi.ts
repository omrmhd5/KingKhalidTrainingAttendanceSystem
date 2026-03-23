import { apiClient } from "./api";

const violationApi = {
  // Create a new violation
  createViolation: async (trainee_id: string, description: string) => {
    const response = await apiClient.post(`/violations`, {
      trainee_id,
      description,
    });
    return response.data;
  },

  // Get all violations
  getAllViolations: async () => {
    const response = await apiClient.get(`/violations`);
    return response.data;
  },

  // Get violations by trainee ID
  getViolationsByTraineeId: async (trainee_id: string) => {
    const response = await apiClient.get(`/violations/trainee/${trainee_id}`);
    return response.data;
  },

  // Delete a specific violation
  deleteViolation: async (violationId: string) => {
    const response = await apiClient.delete(`/violations/${violationId}`);
    return response.data;
  },

  // Delete all violations for a trainee
  deleteAllViolationsByTrainee: async (trainee_id: string) => {
    const response = await apiClient.delete(
      `/violations/trainee/${trainee_id}/all`,
    );
    return response.data;
  },

  // Update a violation
  updateViolation: async (violationId: string, description: string) => {
    const response = await apiClient.put(`/violations/${violationId}`, {
      description,
    });
    return response.data;
  },
};

export { violationApi };
