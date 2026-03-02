import { useState, useCallback } from "react";
import { format } from "date-fns";
import ShiftSelector from "@/components/main/ShiftSelector";
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
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

const mockTrainees: Record<string, Trainee> = {
  BAR001: { id: "1", full_name: "أحمد محمد", rank: "جندي", group_id: "1" },
  BAR002: { id: "2", full_name: "فاطمة علي", rank: "عريف", group_id: "1" },
  "11111": { id: "11111", full_name: "mohammed ali", rank: "جندي", group_id: "1" },
  "22222": { id: "22222", full_name: "AHMED ALI", rank: "عريف", group_id: "1" },
  "123": { id: "123", full_name: "Test Trainee", rank: "جندي", group_id: "1" },
};


const mockEntries: EntryRecord[] = [
  {
    id: "entry_1",
    militaryId: "1",
    civilId: "1234567890",
    name: "أحمد محمد",
    arrivalTime: `${format(new Date(), "yyyy-MM-dd")} 08:15:30`,
    shift: "A",
  },
];

const mockExits: ExitRecord[] = [
  {
    id: "exit_1",
    militaryId: "2",
    civilId: "9876543210",
    name: "فاطمة علي",
    exitTime: `${format(new Date(), "yyyy-MM-dd")} 14:30:45`,
    entryTime: `${format(new Date(), "yyyy-MM-dd")} 06:05:15`,
  },
];

export default function MainPage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [entries, setEntries] = useState<EntryRecord[]>(mockEntries);
  const [exits, setExits] = useState<ExitRecord[]>(mockExits);
  const [scanning, setScanning] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Filter entries and exits by selected date
  const filteredEntries = entries.filter((e) =>
    e.arrivalTime === "" || e.arrivalTime.startsWith(selectedDate),
  );
  const filteredExits = exits.filter((e) =>
    e.exitTime === "" || e.exitTime.startsWith(selectedDate),
  );

  const handleEntryMilitaryIdChange = useCallback(
    (entryId: string, militaryId: string, shiftName: string) => {
      const trainee = mockTrainees[militaryId.trim()];

      setEntries((prev) =>
        prev.map((entry) => {
          if (entry.id !== entryId) return entry;

          if (!trainee) {
            // Clear the record if trainee not found
            return {
              ...entry,
              militaryId: "",
              civilId: "",
              name: "",
              arrivalTime: "",
              shift: "",
            };
          }

          // Populate with trainee data and current time
          const now = new Date();
          const timeString = format(now, "HH:mm:ss");

          return {
            ...entry,
            militaryId: trainee.id,
            civilId: "1234567890",
            name: trainee.full_name,
            arrivalTime: `${selectedDate} ${timeString}`,
            shift: shiftName,
          };
        }),
      );
    },
    [selectedDate],
  );

  const handleExitMilitaryIdChange = useCallback(
    (exitId: string, militaryId: string) => {
      const trainee = mockTrainees[militaryId.trim()];

      setExits((prev) =>
        prev.map((exit) => {
          if (exit.id !== exitId) return exit;

          if (!trainee) {
            // Clear the record if trainee not found
            return {
              ...exit,
              militaryId: "",
              civilId: "",
              name: "",
              exitTime: "",
              entryTime: "",
            };
          }

          // Populate with trainee data and current time
          const now = new Date();
          const timeString = format(now, "HH:mm:ss");
          // Find the last entry for this trainee
          const lastEntry = entries.find(
            (e) =>
              e.militaryId === trainee.id &&
              e.arrivalTime.startsWith(selectedDate),
          );

          return {
            ...exit,
            militaryId: trainee.id,
            civilId: "1234567890",
            name: trainee.full_name,
            exitTime: `${selectedDate} ${timeString}`,
            entryTime: lastEntry?.arrivalTime || `${selectedDate} 00:00:00`,
          };
        }),
      );
    },
    [selectedDate, entries],
  );

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

        if (!selectedShift) {
          throw new Error("لا توجد نوبة محددة");
        }

        const dateToUse = selectedDate;
        const now = new Date();
        const timeString = format(now, "HH:mm:ss");
        const shiftLabel = selectedShift.name;

        // Determine if this is an entry or exit based on existing records
        const todayEntries = entries.filter(
          (e) =>
            e.militaryId === trainee.id && e.arrivalTime.startsWith(dateToUse),
        );
        const todayExits = exits.filter(
          (e) =>
            e.militaryId === trainee.id && e.exitTime.startsWith(dateToUse),
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
            exitTime: `${dateToUse} ${timeString}`,
            entryTime: lastEntry.arrivalTime,
          };
          setExits((prev) => [...prev, exitRecord]);
        } else {
          // Add entry record
          const entryRecord: EntryRecord = {
            id: `entry_${Date.now()}`,
            militaryId: trainee.id,
            civilId: "1234567890",
            name: trainee.full_name,
            arrivalTime: `${dateToUse} ${timeString}`,
            shift: shiftLabel,
          };
          setEntries((prev) => [...prev, entryRecord]);
        }
      } finally {
        setScanning(false);
      }
    },
    [entries, exits, scanning, selectedShift, selectedDate],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-3 bg-background p-4">
      {/* Shift Selector - Top Section */}
      <div className="mx-auto w-full max-w-2xl">
        <ShiftSelector onShiftSelect={setSelectedShift} />
      </div>

      {/* Barcode Scanner */}
      <div className="mx-auto w-full max-w-2xl">
        <BarcodeScanner onScan={handleScan} isScanning={scanning} />
      </div>

      {/* Tables container */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 w-full">
        {/* Entries Table */}
        <div>
          <EntriesTable
            entries={filteredEntries}
            selectedShift={selectedShift}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onMilitaryIdChange={handleEntryMilitaryIdChange}
          />
        </div>

        {/* Exits Table */}
        <div>
          <ExitsTable
            exits={filteredExits}
            selectedShift={selectedShift}
            onMilitaryIdChange={handleExitMilitaryIdChange}
          />
        </div>
      </div>
    </div>
  );
}
