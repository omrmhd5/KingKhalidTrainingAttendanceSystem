import { apiClient } from "./api";
import { Trainee } from "./traineeApi";

export interface Teacher {
  _id: string;
  username: string;
  email: string;
}

export interface Class {
  _id: string;
  name: string;
  assignedTeacherId?: string | Teacher;
  schedule?: string;
  students: string[] | Trainee[];
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClassCreateInput {
  name: string;
  assignedTeacherId?: string;
  schedule: string;
}

export interface ClassUpdateInput {
  name?: string;
  assignedTeacherId?: string;
  schedule?: string;
}

export const classApi = {
  // Get all classes
  async getAllClasses(filters?: { teacherId?: string }) {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append("teacherId", filters.teacherId);

    const response = await apiClient.get<Class[]>(
      `/classes${params.toString() ? `?${params.toString()}` : ""}`,
    );
    return response.data;
  },

  // Get single class by ID
  async getClassById(id: string) {
    const response = await apiClient.get<Class>(`/classes/${id}`);
    return response.data;
  },

  // Create new class
  async createClass(data: ClassCreateInput) {
    const response = await apiClient.post<{ message: string; class: Class }>(
      "/classes",
      data,
    );
    return response.data;
  },

  // Update class
  async updateClass(id: string, data: ClassUpdateInput) {
    const response = await apiClient.put<{ message: string; class: Class }>(
      `/classes/${id}`,
      data,
    );
    return response.data;
  },

  // Delete class
  async deleteClass(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/classes/${id}`,
    );
    return response.data;
  },

  // Assign students to class
  async assignStudents(classId: string, studentIds: string[]) {
    const response = await apiClient.post<{ message: string; class: Class }>(
      `/classes/${classId}/students`,
      { studentIds },
    );
    return response.data;
  },

  // Remove student from class
  async removeStudent(classId: string, studentId: string) {
    const response = await apiClient.delete<{ message: string; class: Class }>(
      `/classes/${classId}/students/${studentId}`,
    );
    return response.data;
  },
};
