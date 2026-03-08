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
}

export default function MainPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [exits, setExits] = useState<ExitRecord[]>([]);
  const [scanning, setScanning] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(false);

  // Load shifts on mount and auto-select first one
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const data = await shiftApi.getAllShifts();
        if (data && data.length > 0) {
          const firstShift = data[0] as ShiftAPIResponse;
          setSelectedShift({
            id: firstShift._id,
            name: firstShift.name,
            start_time: firstShift.start_time,
            end_time: firstShift.end_time,
            grace_minutes: firstShift.grace_minutes,
          });
        }
      } catch (error) {
        console.error("Failed to load shifts:", error);
      }
    };
    loadShifts();
  }, []);

  // Fetch attendance records when date or shift changes
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await attendanceApi.getAttendanceByDate(
          selectedDate,
          selectedShift?.id,
        );

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
            shift: typeof r.shift_id === "object" ? r.shift_id?.name || "" : "",
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

    if (selectedShift) {
      fetchAttendance();
    }
  }, [selectedDate, selectedShift]);

  const handleScan = useCallback(
    async (barcode: string) => {
      if (scanning || !selectedShift) return;
      setScanning(true);

      try {
        // Try to record entry
        try {
          await attendanceApi.recordEntry(
            barcode.trim(),
            selectedShift.id,
            selectedDate,
          );
          // Refresh the attendance data
          const response = await attendanceApi.getAttendanceByDate(
            selectedDate,
            selectedShift.id,
          );
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
                typeof r.shift_id === "object" ? r.shift_id?.name || "" : "",
            }));
          setEntries(transformedEntries);
        } catch (entryError: any) {
          // If entry already exists, try exit
          if (entryError.response?.data?.error === "DUPLICATE_ENTRY") {
            try {
              await attendanceApi.recordExit(barcode.trim(), selectedDate);
              // Refresh the attendance data
              const response = await attendanceApi.getAttendanceByDate(
                selectedDate,
                selectedShift.id,
              );
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
                }));
              setExits(transformedExits);
            } catch (exitError: any) {
              throw exitError; // Re-throw exit errors
            }
          } else {
            throw entryError;
          }
        }
      } catch (err: any) {
        throw err; // Re-throw so BarcodeScanner catches it
      } finally {
        setScanning(false);
      }
    },
    [selectedShift, selectedDate, scanning],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-3 bg-background p-4">
      {/* Attendance Stats - Full Width */}
      <div className="mx-auto w-full max-w-4xl">
        <AttendanceStatsDisplay entries={entries} />
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
            selectedShift={selectedShift}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onShiftChange={setSelectedShift}
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
