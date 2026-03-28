import { apiClient } from "./api";
import { Trainee } from "./traineeApi";

export interface ClassStats {
  present: number;
  absence: number;
  escapes: number;
  violations: number;
}

export interface Teacher {
  _id: string;
  username: string;
  email: string;
}

export interface Class {
  _id: string;
  name: string;
  assignedTeacherId?: string | Teacher;
  students: string[] | Trainee[];
  studentCount: number;
  stats: ClassStats;
  createdAt: string;
  updatedAt: string;
}

export interface ClassCreateInput {
  name: string;
  assignedTeacherId?: string;
}

export interface ClassUpdateInput {
  name?: string;
  assignedTeacherId?: string;
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

  // Get class statistics
  async getClassStats(id: string) {
    const response = await apiClient.get<ClassStats>(`/classes/${id}/stats`);
    return response.data;
  },

  // Update class statistics
  async updateClassStats(id: string, stats: Partial<ClassStats>) {
    const response = await apiClient.put<{ message: string; class: Class }>(
      `/classes/${id}/stats`,
      { stats },
    );
    return response.data;
  },

  // Increment class statistic
  async incrementStat(id: string, statName: keyof ClassStats) {
    const response = await apiClient.post<{ message: string; class: Class }>(
      `/classes/${id}/stats/${statName}/increment`,
    );
    return response.data;
  },
};
