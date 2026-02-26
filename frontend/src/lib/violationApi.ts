import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const violationApi = {
  // Create a new violation
  createViolation: async (trainee_id: string, description: string) => {
    const response = await axios.post(`${BASE_URL}/violations`, {
      trainee_id,
      description,
    });
    return response.data;
  },

  // Get all violations
  getAllViolations: async () => {
    const response = await axios.get(`${BASE_URL}/violations`);
    return response.data;
  },

  // Get violations by trainee ID
  getViolationsByTraineeId: async (trainee_id: string) => {
    const response = await axios.get(
      `${BASE_URL}/violations/trainee/${trainee_id}`,
    );
    return response.data;
  },

  // Delete a specific violation
  deleteViolation: async (violationId: string) => {
    const response = await axios.delete(
      `${BASE_URL}/violations/${violationId}`,
    );
    return response.data;
  },

  // Delete all violations for a trainee
  deleteAllViolationsByTrainee: async (trainee_id: string) => {
    const response = await axios.delete(
      `${BASE_URL}/violations/trainee/${trainee_id}/all`,
    );
    return response.data;
  },

  // Update a violation
  updateViolation: async (violationId: string, description: string) => {
    const response = await axios.put(`${BASE_URL}/violations/${violationId}`, {
      description,
    });
    return response.data;
  },
};

export { violationApi };
