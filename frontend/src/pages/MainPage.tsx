import { useState, useCallback } from "react";
import { format } from "date-fns";
import BarcodeScanner from "@/components/main/BarcodeScanner";
import EntriesTable, { type EntryRecord } from "@/components/main/EntriesTable";
import ExitsTable, { type ExitRecord } from "@/components/main/ExitsTable";

interface Trainee {
  id: string;
  full_name: string;
  rank: string;
  group_id: string;
}
interface Shift {
  start_time: string;
  end_time: string;
  grace_minutes: number;
}
interface Schedule {
  shift_id: string;
  shifts: Shift;
}

// Mock trainees database
const mockTrainees: Record<string, Trainee> = {
  BAR001: { id: "1", full_name: "أحمد محمد", rank: "جندي", group_id: "1" },
  BAR002: { id: "2", full_name: "فاطمة علي", rank: "عريف", group_id: "1" },
};

const mockSchedules: Record<string, Schedule> = {
  "1": {
    shift_id: "1",
    shifts: {
      start_time: "08:00",
      end_time: "16:00",
      grace_minutes: 10,
    },
  },
};

export default function MainPage() {
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [exits, setExits] = useState<ExitRecord[]>([]);
  const [scanning, setScanning] = useState(false);

  const handleScan = useCallback(
    async (barcode: string) => {
      if (scanning) return;
      setScanning(true);

      try {
        // Mock: Find trainee by barcode
        const trainee = mockTrainees[barcode.trim()];

        if (!trainee) {
          throw new Error("لم يتم العثور على المتدرب");
        }

        const today = format(new Date(), "yyyy-MM-dd");
        const now = new Date();
        const timeString = format(
          now,
          "HH:mm:ss",
        );

        // Mock: Find today's scheduled shift for the trainee's group
        const schedule = mockSchedules[trainee.group_id];

        if (!schedule) {
          throw new Error("لا توجد نوبة محددة اليوم");
        }

        const shift = schedule.shifts;
        const shiftLabel = `${shift.start_time} - ${shift.end_time}`;

        // Determine if this is an entry or exit based on existing records
        const todayEntries = entries.filter(
          (e) => e.militaryId === trainee.id && e.arrivalTime.includes(today),
        );
        const todayExits = exits.filter(
          (e) => e.militaryId === trainee.id && e.exitTime.includes(today),
        );

        // Simple logic: if entries > exits, scan as exit, otherwise as entry
        if (todayEntries.length > todayExits.length) {
          // Add exit record - find the last entry for this trainee to get entry time
          const lastEntry = todayEntries[todayEntries.length - 1];
          const exitRecord: ExitRecord = {
            id: `exit_${Date.now()}`,
            militaryId: trainee.id,
            civilId: "1234567890",
            name: trainee.full_name,
            exitTime: `${today} ${timeString}`,
            entryTime: lastEntry.arrivalTime,
          };
          setExits((prev) => [exitRecord, ...prev]);
        } else {
          // Add entry record
          const entryRecord: EntryRecord = {
            id: `entry_${Date.now()}`,
            militaryId: trainee.id,
            civilId: "1234567890",
            name: trainee.full_name,
            arrivalTime: `${today} ${timeString}`,
            shift: shiftLabel,
          };
          setEntries((prev) => [entryRecord, ...prev]);
        }
      } catch (err) {
        throw err;
      } finally {
        setScanning(false);
      }
    },
    [entries, exits, scanning],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-8 bg-background p-8">
      {/* Scanner at the top */}
      <div className="mx-auto w-full max-w-2xl">
        <BarcodeScanner onScan={handleScan} isScanning={scanning} />
      </div>

      {/* Tables container */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {/* Entries Table */}
        <div>
          <EntriesTable entries={entries} />
        </div>

        {/* Exits Table */}
        <div>
          <ExitsTable exits={exits} />
        </div>
      </div>
    </div>
  );
}
