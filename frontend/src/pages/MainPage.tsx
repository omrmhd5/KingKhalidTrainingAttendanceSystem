import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
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
    e.arrivalTime.startsWith(selectedDate),
  );
  const filteredExits = exits.filter((e) =>
    e.exitTime.startsWith(selectedDate),
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
          setExits((prev) => [exitRecord, ...prev]);
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
          setEntries((prev) => [entryRecord, ...prev]);
        }
      } finally {
        setScanning(false);
      }
    },
    [entries, exits, scanning, selectedShift, selectedDate],
  );

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col gap-6 bg-background p-8">
      {/* Date and Shift Selector - Top Section */}
      <div className="mx-auto w-full max-w-2xl grid grid-cols-2 gap-4">
        {/* Shift Selector */}
        <ShiftSelector onShiftSelect={setSelectedShift} />
        {/* Date Selector */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            التاريخ
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full h-10 bg-background border-border text-foreground flex-row-reverse"
          />
        </div>
      </div>

      {/* Scanner - Middle Section */}
      <div className="mx-auto w-full max-w-2xl">
        <BarcodeScanner onScan={handleScan} isScanning={scanning} />
      </div>

      {/* Tables container */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {/* Entries Table */}
        <div>
          <EntriesTable
            entries={filteredEntries}
            selectedShift={selectedShift}
          />
        </div>

        {/* Exits Table */}
        <div>
          <ExitsTable exits={filteredExits} selectedShift={selectedShift} />
        </div>
      </div>
    </div>
  );
}
