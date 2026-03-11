import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import BarcodeScanner from "@/components/main/BarcodeScanner";
import EntriesTable, { type EntryRecord } from "@/components/main/EntriesTable";
import ExitsTable, { type ExitRecord } from "@/components/main/ExitsTable";
import AttendanceStatsDisplay from "@/components/main/AttendanceStatsDisplay";
import { attendanceApi, type AttendanceRecord } from "@/lib/attendanceApi";
import { shiftApi } from "@/lib/shiftApi";

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

interface ShiftAPIResponse {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
  trainees_count?: number;
}

export default function MainPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [exits, setExits] = useState<ExitRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<ShiftAPIResponse[]>([]);

  // Helper function to get active shift based on current KSA time
  const getActiveShift =
    useCallback(async (): Promise<ShiftAPIResponse | null> => {
      try {
        const shiftsData = await shiftApi.getAllShifts();
        if (!shiftsData || shiftsData.length === 0) return null;

        const now = new Date();
        const ksaTime = new Date(
          now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
        );

        const currentHours = ksaTime.getHours();
        const currentMinutes = ksaTime.getMinutes();
        const currentTimeIn24 = currentHours * 100 + currentMinutes;

        for (const shift of shiftsData as ShiftAPIResponse[]) {
          const [startH, startM] = shift.start_time.split(":");
          const [endH, endM] = shift.end_time.split(":");

          const shiftStartTime = parseInt(startH) * 100 + parseInt(startM);
          const shiftEndTime = parseInt(endH) * 100 + parseInt(endM);

          if (
            currentTimeIn24 >= shiftStartTime &&
            currentTimeIn24 < shiftEndTime
          ) {
            return shift;
          }
        }
        return null;
      } catch (error) {
        console.error("Failed to get active shift:", error);
        return null;
      }
    }, []);

  // Load shifts on mount and auto-detect current shift
  useEffect(() => {
    const loadAndSelectCurrentShift = async () => {
      try {
        // Fetch all shifts
        const allShifts = await shiftApi.getAllShifts();
        setShifts(allShifts as ShiftAPIResponse[]);

        const activeShift = await getActiveShift();
        if (activeShift) {
          setSelectedShift({
            id: activeShift._id,
            name: activeShift.name,
            start_time: activeShift.start_time,
            end_time: activeShift.end_time,
            grace_minutes: activeShift.grace_minutes,
          });
        } else {
          setSelectedShift(null);
        }
      } catch (error) {
        console.error("Failed to load shifts:", error);
      }
    };
    loadAndSelectCurrentShift();
  }, [getActiveShift]);

  // Fetch attendance records when date or shift changes
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceApi.getAttendanceByDate(selectedDate);

        // Transform API data to component format
        const transformedEntries: EntryRecord[] = response.records
          .filter((r: AttendanceRecord) => r.entry_time)
          .map((r: AttendanceRecord) => ({
            id: r._id,
            militaryId: r.military_id,
            civilId: "",
            name:
              typeof r.trainee_id === "object"
                ? r.trainee_id?.full_name || ""
                : "",
            arrivalTime: r.entry_time || "",
            shift:
              typeof r.trainee_assigned_shift_id === "object"
                ? r.trainee_assigned_shift_id?.name || ""
                : "",
            shiftStartTime:
              typeof r.trainee_assigned_shift_id === "object"
                ? r.trainee_assigned_shift_id?.start_time || ""
                : "",
            shiftEndTime:
              typeof r.trainee_assigned_shift_id === "object"
                ? r.trainee_assigned_shift_id?.end_time || ""
                : "",
            actualShift:
              typeof r.shift_id === "object" ? r.shift_id?.name || "" : "",
            actualShiftStartTime:
              typeof r.shift_id === "object"
                ? r.shift_id?.start_time
                : undefined,
            actualShiftEndTime:
              typeof r.shift_id === "object" ? r.shift_id?.end_time : undefined,
            status: r.status,
            hasViolation:
              typeof r.trainee_id === "object"
                ? r.trainee_id?.hasViolation
                : false,
            hasDisciplinary:
              typeof r.trainee_id === "object"
                ? r.trainee_id?.hasDisciplinary
                : false,
          }));

        const transformedExits: ExitRecord[] = response.records
          .filter((r: AttendanceRecord) => r.exit_time)
          .map((r: AttendanceRecord) => ({
            id: r._id,
            militaryId: r.military_id,
            civilId: "",
            name:
              typeof r.trainee_id === "object"
                ? r.trainee_id?.full_name || ""
                : "",
            exitTime: r.exit_time || "",
            entryTime: r.entry_time || "",
            durationMinutes: r.duration_minutes,
          }));

        setEntries(transformedEntries);
        setExits(transformedExits);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setEntries([]);
        setExits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  const handleScan = useCallback(
    async (barcode: string, mode: "IN" | "OUT") => {
      if (scanning) return;
      setScanning(true);

      try {
        const activeShift = await getActiveShift();
        const activeShiftId = activeShift?._id;

        if (mode === "OUT") {
          // User selected exit mode - record exit
          await attendanceApi.recordExit(barcode.trim(), selectedDate);
          // Refresh the attendance data
          const response =
            await attendanceApi.getAttendanceByDate(selectedDate);
          const transformedExits: ExitRecord[] = response.records
            .filter((r: AttendanceRecord) => r.exit_time)
            .map((r: AttendanceRecord) => ({
              id: r._id,
              militaryId: r.military_id,
              civilId: "",
              name:
                typeof r.trainee_id === "object"
                  ? r.trainee_id?.full_name || ""
                  : "",
              exitTime: r.exit_time || "",
              entryTime: r.entry_time || "",
              durationMinutes: r.duration_minutes,
            }));
          setExits(transformedExits);
        } else {
          // User selected entry mode - record entry
          if (!activeShiftId) {
            throw new Error("لا يوجد شفت نشط حالياً");
          }
          await attendanceApi.recordEntry(
            barcode.trim(),
            activeShiftId,
            selectedDate,
          );
          // Refresh the attendance data
          const response =
            await attendanceApi.getAttendanceByDate(selectedDate);
          const transformedEntries: EntryRecord[] = response.records
            .filter((r: AttendanceRecord) => r.entry_time)
            .map((r: AttendanceRecord) => ({
              id: r._id,
              militaryId: r.military_id,
              civilId: "",
              name:
                typeof r.trainee_id === "object"
                  ? r.trainee_id?.full_name || ""
                  : "",
              arrivalTime: r.entry_time || "",
              shift:
                typeof r.trainee_assigned_shift_id === "object"
                  ? r.trainee_assigned_shift_id?.name || ""
                  : "",
              shiftStartTime:
                typeof r.trainee_assigned_shift_id === "object"
                  ? r.trainee_assigned_shift_id?.start_time || ""
                  : "",
              shiftEndTime:
                typeof r.trainee_assigned_shift_id === "object"
                  ? r.trainee_assigned_shift_id?.end_time || ""
                  : "",
              actualShift:
                typeof r.shift_id === "object" ? r.shift_id?.name || "" : "",
              actualShiftStartTime:
                typeof r.shift_id === "object"
                  ? r.shift_id?.start_time
                  : undefined,
              actualShiftEndTime:
                typeof r.shift_id === "object"
                  ? r.shift_id?.end_time
                  : undefined,
              status: r.status,
              hasViolation:
                typeof r.trainee_id === "object"
                  ? r.trainee_id?.hasViolation
                  : false,
              hasDisciplinary:
                typeof r.trainee_id === "object"
                  ? r.trainee_id?.hasDisciplinary
                  : false,
            }));
          setEntries(transformedEntries);
        }
      } finally {
        setScanning(false);
      }
    },
    [selectedDate, scanning, getActiveShift],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-3 bg-background p-4">
      {/* Attendance Stats - Full Width */}
      <div className="mx-auto w-full max-w-4xl">
        <AttendanceStatsDisplay
          entries={entries}
          shifts={shifts}
          currentShift={selectedShift}
        />
      </div>

      {/* Barcode Scanner */}
      <div className="mx-auto w-full max-w-4xl">
        <BarcodeScanner onScan={handleScan} isScanning={scanning} />
      </div>

      {/* Tables container */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 w-full">
        {/* Entries Table */}
        <div>
          <EntriesTable
            entries={entries}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Exits Table */}
        <div>
          <ExitsTable
            exits={exits}
            entries={entries}
            selectedShift={selectedShift}
          />
        </div>
      </div>
    </div>
  );
}
