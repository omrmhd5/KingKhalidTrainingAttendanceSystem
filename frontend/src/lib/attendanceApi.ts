import { apiClient, API_URL } from "./api";

export interface Trainee {
  _id: string;
  full_name: string;
  military_id: string;
  rank_id: string;
  hasViolation?: boolean;
  hasDisciplinary?: boolean;
}

export interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

export interface AttendanceRecord {
  _id: string;
  trainee_id: Trainee;
  civil_id: string;
  military_id: string;
  trainee_assigned_shift_id: Shift;
  shift_id: Shift;
  date: string;
  entry_time: string | null;
  exit_time: string | null;
  status: "on-time" | "late" | "absent" | "pending";
  duration_minutes: number | null;
  notes?: string;
}

export interface AttendanceByDateResponse {
  date: string;
  recordCount: number;
  records: AttendanceRecord[];
}

export interface DailySummary {
  date: string;
  attended: number;
  exited: number;
  onTime: number;
  late: number;
  shiftSummary: Record<string, Record<string, number>>;
}

export interface Absence {
  _id: string;
  military_id: string;
  full_name: string;
  civil_id: string;
  rank_id?: {
    name: string;
  };
  specialty_id?: {
    name: string;
  };
  shift_id?: {
    name: string;
  };
}

export interface AbsencesByDateResponse {
  date: string;
  absenceCount: number;
  absences: Absence[];
}

export interface Escape {
  _id: string;
  military_id: string;
  full_name: string;
  civil_id: string;
  shift_id?: {
    name: string;
  };
  entry_time: string;
}

export interface EscapesByDateResponse {
  date: string;
  escapeCount: number;
  escapes: Escape[];
}

export interface Late {
  _id: string;
  military_id: string;
  full_name: string;
  civil_id: string;
  shift_id?: {
    name: string;
  };
  entry_time: string;
}

export interface LatesByDateResponse {
  date: string;
  lateCount: number;
  lates: Late[];
}

export const attendanceApi = {
  async recordEntry(scannedId: string, shiftId: string, date: string) {
    const response = await apiClient.post(`/attendance/entry`, {
      scannedId,
      shift_id: shiftId,
      date,
    });
    return response.data;
  },

  async recordExit(scannedId: string, date: string) {
    const response = await apiClient.post(`/attendance/exit`, {
      scannedId,
      date,
    });
    return response.data;
  },

  async getAttendanceByDate(
    date: string,
    shiftId?: string,
  ): Promise<AttendanceByDateResponse> {
    const params: Record<string, string> = { date };
    if (shiftId) {
      params.shift_id = shiftId;
    }
    const response = await apiClient.get(`/attendance/by-date`, {
      params,
    });
    return response.data;
  },

  async getDailySummary(date: string): Promise<DailySummary> {
    const response = await apiClient.get(`/attendance/summary`, {
      params: { date },
    });
    return response.data;
  },

  async getAbsences(date: string): Promise<AbsencesByDateResponse> {
    const response = await apiClient.get(`/attendance/absences`, {
      params: { date },
    });
    return response.data;
  },

  async getEscapes(date: string): Promise<EscapesByDateResponse> {
    const response = await apiClient.get(`/attendance/escapes`, {
      params: { date },
    });
    return response.data;
  },

  async getLates(date: string): Promise<LatesByDateResponse> {
    const response = await apiClient.get(`/attendance/lates`, {
      params: { date },
    });
    return response.data;
  },
};
