import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const disciplinaryApi = {
  // Create a new disciplinary request
  createDisciplinary: async (trainee_id: string) => {
    const response = await axios.post(`${BASE_URL}/disciplinary`, {
      trainee_id,
    });
    return response.data;
  },

  // Get all disciplinary requests
  getAllDisciplinary: async () => {
    const response = await axios.get(`${BASE_URL}/disciplinary`);
    return response.data;
  },

  // Get disciplinary requests by trainee ID
  getDisciplinaryByTraineeId: async (trainee_id: string) => {
    const response = await axios.get(
      `${BASE_URL}/disciplinary/trainee/${trainee_id}`,
    );
    return response.data;
  },

  // Delete a specific disciplinary request
  deleteDisciplinary: async (disciplinaryId: string) => {
    const response = await axios.delete(
      `${BASE_URL}/disciplinary/${disciplinaryId}`,
    );
    return response.data;
  },

  // Delete all disciplinary requests for a trainee
  deleteAllDisciplinaryByTrainee: async (trainee_id: string) => {
    const response = await axios.delete(
      `${BASE_URL}/disciplinary/trainee/${trainee_id}/all`,
    );
    return response.data;
  },
};

export { disciplinaryApi };
