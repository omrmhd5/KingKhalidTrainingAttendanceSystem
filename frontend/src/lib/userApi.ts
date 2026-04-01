import { apiClient } from "./api";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "operator" | "teacher";
  class?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "admin" | "operator" | "teacher";
  class?: string;
}

export interface UserUpdateInput {
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: "admin" | "operator" | "teacher";
  class?: string;
}

export const userApi = {
  // Authentication
  async login(username: string, password: string) {
    const response = await apiClient.post<LoginResponse>("/users/login", {
      username,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await apiClient.post("/users/logout");
    return response.data;
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiClient.get<User>("/users/me");
    return response.data;
  },

  // User Management (Admin only)
  async getAllUsers(filters?: { role?: string; isActive?: boolean }) {
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.isActive !== undefined)
      params.append("isActive", filters.isActive.toString());

    const response = await apiClient.get<User[]>(`/users?${params.toString()}`);
    return response.data;
  },

  async getUserById(id: string) {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: UserCreateInput) {
    const response = await apiClient.post<{
      message: string;
      user: User;
      plainTextPassword?: string;
    }>("/users", data);
    return response.data;
  },

  async updateUser(id: string, data: UserUpdateInput) {
    const response = await apiClient.put<{ message: string; user: User }>(
      `/users/${id}`,
      data,
    );
    return response.data;
  },

  async deleteUser(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/users/${id}`,
    );
    return response.data;
  },

  async toggleUserStatus(id: string) {
    const response = await apiClient.patch<{ message: string; user: User }>(
      `/users/${id}/toggle-status`,
    );
    return response.data;
  },
};
