import axios from "axios";
import { API_URL } from "./api";

export interface Trainee {
  _id: string;
  full_name: string;
  military_id: string;
  rank_id: string;
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
  military_id: string;
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
  summary: {
    totalRecords: number;
    attended: number;
    exited: number;
    onTime: number;
    late: number;
    byShift: Record<
      string,
      {
        attended: number;
        exited: number;
        onTime: number;
        late: number;
      }
    >;
  };
}

export const attendanceApi = {
  async recordEntry(militaryId: string, shiftId: string, date: string) {
    const response = await axios.post(`${API_URL}/attendance/entry`, {
      military_id: militaryId,
      shift_id: shiftId,
      date,
    });
    return response.data;
  },

  async recordExit(militaryId: string, date: string) {
    const response = await axios.post(`${API_URL}/attendance/exit`, {
      military_id: militaryId,
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
    const response = await axios.get(`${API_URL}/attendance/by-date`, {
      params,
    });
    return response.data;
  },

  async getDailySummary(date: string): Promise<DailySummary> {
    const response = await axios.get(`${API_URL}/attendance/summary`, {
      params: { date },
    });
    return response.data;
  },
};
