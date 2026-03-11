import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowUpFromLine } from "lucide-react";

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

const formatTime12Hour = (dateTimeString: string): string => {
  try {
    const date = new Date(dateTimeString);
    // Convert to KSA timezone
    const ksaTime = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
    );
    const hours = ksaTime.getHours();
    const minutes = ksaTime.getMinutes();
    const seconds = ksaTime.getSeconds();

    const period = hours >= 12 ? "م" : "ص";
    const h = hours % 12 || 12;

    const pad = (num: number) => String(num).padStart(2, "0");
    return `${h}:${pad(minutes)}:${pad(seconds)} ${period}`;
  } catch {
    return dateTimeString;
  }
};

const formatShiftTime = (startTime: string, endTime: string): string => {
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours);
    const isAM = h < 12;
    h = h % 12 || 12;
    const period = isAM ? "ص" : "م";
    return `${h}:${minutes} ${period}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const getShiftCellColor = (shift: string): string => {
  switch (shift) {
    case "A":
      return "bg-green-100 border-green-400";
    case "B":
      return "bg-blue-100 border-blue-400";
    case "C":
      return "bg-yellow-100 border-yellow-400";
    default:
      return "bg-gray-100 border-gray-400";
  }
};

export interface ExitRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  exitTime: string;
  entryTime: string;
  durationMinutes: number | null;
}

interface ExitsTableProps {
  exits: ExitRecord[];
  entries: EntryRecord[];
  selectedShift: Shift | null;
}

export interface EntryRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  arrivalTime: string;
  shift: string;
}

export default function ExitsTable({
  exits,
  entries,
  selectedShift,
}: ExitsTableProps) {
  // Count exits with actual data (non-empty militaryId)
  const exitsWithData = exits.filter((e) => e.militaryId.trim() !== "");
  const filteredExits = exitsWithData;

  // Count attended trainees (unique entries with militaryId)
  const attendedCount = new Set(
    entries.filter((e) => e.militaryId.trim() !== "").map((e) => e.militaryId),
  ).size;

  return (
    <Card className="border border-border shadow-md">
      <div className="flex items-center justify-between border-b-2 border-border bg-slate-50 p-2">
        <div className="flex items-center gap-2">
          <ArrowUpFromLine className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">سجل الخروج</h3>
        </div>
        <Badge className="bg-warning/20 text-warning border-warning text-sm font-semibold px-4 py-2 text-base">
          {filteredExits.length} خروج
        </Badge>
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-green-500 hover:bg-green-500 border-b-2 border-green-700">
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                تسجيل الخروج
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                الاسم
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                وقت الخروج
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                الفارق الزمني
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                الشفت
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground border border-border">
                  لا توجد سجلات خروج
                </TableCell>
              </TableRow>
            ) : (
              exits.map((exit) => {
                // Format duration from backend
                const hours = Math.floor((exit.durationMinutes || 0) / 60);
                const minutes = (exit.durationMinutes || 0) % 60;
                const timeDiff = `${hours} س ${minutes} د`;

                // Find corresponding entry to get shift info
                const correspondingEntry = entries.find(
                  (e) => e.militaryId === exit.militaryId,
                );
                const shiftForColor = correspondingEntry?.shift || "";

                return (
                  <TableRow
                    key={exit.id}
                    className="border-b-2 border-gray-300 bg-white hover:bg-gray-50">
                    <TableCell className="text-center font-medium text-sm py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.militaryId}
                    </TableCell>
                    <TableCell className="text-center font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.name}
                    </TableCell>
                    <TableCell className="text-center py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.exitTime ? formatTime12Hour(exit.exitTime) : ""}
                    </TableCell>
                    <TableCell className="text-center font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.exitTime && exit.entryTime ? timeDiff : ""}
                    </TableCell>
                    <TableCell
                      className={`text-center font-medium py-2 px-2 border-2 whitespace-nowrap ${getShiftCellColor(shiftForColor)}`}>
                      {shiftForColor || "N/A"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
