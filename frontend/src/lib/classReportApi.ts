import { apiClient } from "./api";

export interface StudentReport {
  studentId: string;
  status: "absent" | "escape" | "violation";
  violationType?: number; // 1-4, only for violations
  violationDescription?: string;
}

export interface ClassReportStats {
  present: number;
  absence: number;
  escapes: number;
  violations: number;
}

export interface ClassReport {
  _id: string;
  date: string;
  teacherId: string;
  classId: string;
  schedule: string;
  studentReports: StudentReport[];
  stats: ClassReportStats;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassReportCreateInput {
  date: string;
  teacherId: string;
  classId: string;
  schedule: string;
  studentReports: StudentReport[];
}

export interface ClassReportUpdateInput {
  date?: string;
  teacherId?: string;
  classId?: string;
  schedule?: string;
  studentReports?: StudentReport[];
}

export const classReportApi = {
  async createClassReport(data: ClassReportCreateInput) {
    const response = await apiClient.post<{
      message: string;
      report: ClassReport;
    }>("/class-reports", data);
    return response.data;
  },

  async getClassReports(filters?: {
    teacherId?: string;
    classId?: string;
    scheduleId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.teacherId) params.append("teacherId", filters.teacherId);
    if (filters?.classId) params.append("classId", filters.classId);
    if (filters?.scheduleId) params.append("scheduleId", filters.scheduleId);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const response = await apiClient.get<ClassReport[]>(
      `/class-reports${params.toString() ? `?${params.toString()}` : ""}`,
    );
    return response.data;
  },

  async getClassReportById(id: string) {
    const response = await apiClient.get<ClassReport>(`/class-reports/${id}`);
    return response.data;
  },

  async updateClassReport(id: string, data: ClassReportUpdateInput) {
    const response = await apiClient.put<{
      message: string;
      report: ClassReport;
    }>(`/class-reports/${id}`, data);
    return response.data;
  },

  async deleteClassReport(id: string) {
    const response = await apiClient.delete<{ message: string }>(
      `/class-reports/${id}`,
    );
    return response.data;
  },
};
