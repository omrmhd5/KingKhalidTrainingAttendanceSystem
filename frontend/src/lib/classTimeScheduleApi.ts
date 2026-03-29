import { apiClient } from "./api";

export interface ClassTimeSchedule {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
  classes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassTimeScheduleCreateInput {
  name: string;
  start_time: string;
  end_time: string;
}

export interface ClassTimeScheduleUpdateInput {
  name?: string;
  start_time?: string;
  end_time?: string;
}

export const classTimeScheduleApi = {
  // Get all schedules
  async getAllSchedules() {
    const response = await apiClient.get<ClassTimeSchedule[]>(
      "/class-time-schedules",
    );
    return response.data;
  },

  // Get single schedule by ID
  async getScheduleById(id: string) {
    const response = await apiClient.get<ClassTimeSchedule>(
      `/class-time-schedules/${id}`,
    );
    return response.data;
  },

  // Create new schedule
  async createSchedule(data: ClassTimeScheduleCreateInput) {
    const response = await apiClient.post<{
      message: string;
      schedule: ClassTimeSchedule;
    }>("/class-time-schedules", data);
    return response.data;
  },

  // Update schedule
  async updateSchedule(id: string, data: ClassTimeScheduleUpdateInput) {
    const response = await apiClient.put<{
      message: string;
      schedule: ClassTimeSchedule;
    }>(`/class-time-schedules/${id}`, data);
    return response.data;
  },

  // Delete schedule
  async deleteSchedule(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/class-time-schedules/${id}`,
    );
    return response.data;
  },

  // Assign classes to schedule
  async assignClasses(scheduleId: string, classIds: string[]) {
    const response = await apiClient.post<{
      message: string;
      schedule: ClassTimeSchedule;
    }>(`/class-time-schedules/${scheduleId}/classes`, { classIds });
    return response.data;
  },

  // Remove class from schedule
  async removeClass(scheduleId: string, classId: string) {
    const response = await apiClient.delete<{
      message: string;
      schedule: ClassTimeSchedule;
    }>(`/class-time-schedules/${scheduleId}/classes/${classId}`);
    return response.data;
  },
};
