import { useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpFromLine, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTime12HourKSA } from "@/lib/timeUtils";

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

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

const getIdCellStyle = (
  hasViolation?: boolean,
  hasDisciplinary?: boolean,
  isFirst: boolean = false,
): string => {
  if (hasViolation) {
    return "bg-red-500 border-red-500";
  }
  if (hasDisciplinary) {
    return "bg-blue-400 border-blue-500";
  }
  if (isFirst) {
    return "bg-yellow-200 border-yellow-500";
  }
  return "";
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
  selectedShiftFilter: string;
  selectedExits: Set<string>;
  onToggleExit: (id: string) => void;
  onToggleAll: () => void;
  onClearExits: () => void;
}

export interface EntryRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  arrivalTime: string;
  shift: string;
  hasViolation?: boolean;
  hasDisciplinary?: boolean;
}

export default function ExitsTable({
  exits,
  entries,
  selectedShift,
  selectedShiftFilter,
  selectedExits,
  onToggleExit,
  onToggleAll,
  onClearExits,
}: ExitsTableProps) {
  // Filter exits based on selected shift
  const filteredExits =
    selectedShiftFilter === "all"
      ? exits
      : exits.filter((exit) => {
          const correspondingEntry = entries.find(
            (e) => e.militaryId === exit.militaryId,
          );
          return correspondingEntry?.shift === selectedShiftFilter;
        });

  // Sort exits by exit_time descending (most recent first)
  const sortedExits = [...filteredExits].sort((a, b) => {
    const timeA = a.exitTime ? new Date(a.exitTime).getTime() : 0;
    const timeB = b.exitTime ? new Date(b.exitTime).getTime() : 0;
    return timeB - timeA; // Descending - most recent first
  });

  // Count exits with actual data (non-empty militaryId)
  const exitsWithData = sortedExits.filter((e) => e.militaryId.trim() !== "");

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
          {selectedExits.size > 0 && (
            <Button
              size="sm"
              onClick={onClearExits}
              className="mr-2 bg-orange-600 hover:bg-orange-700 text-white">
              <Eraser className="ml-1 h-4 w-4" />
              مسح الخروج ({selectedExits.size})
            </Button>
          )}
        </div>
        <Badge
          className={`font-semibold px-4 py-2 text-base ${
            exitsWithData.length === attendedCount
              ? "bg-green-700 text-white border-green-900"
              : "bg-warning/20 text-warning border-warning"
          }`}>
          {exitsWithData.length} خروج من أصل {attendedCount}
        </Badge>
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-green-500 hover:bg-green-500 border-b-2 border-green-700">
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-green-700 w-10">
                <Checkbox
                  checked={
                    sortedExits.length > 0 &&
                    selectedExits.size === sortedExits.length
                  }
                  onCheckedChange={onToggleAll}
                  className="border-white data-[state=checked]:bg-white data-[state=checked]:text-green-700"
                />
              </TableHead>
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
            {sortedExits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground border border-border">
                  لا توجد سجلات خروج
                </TableCell>
              </TableRow>
            ) : (
              sortedExits.map((exit, index) => {
                // Format duration from backend
                const hours = Math.floor((exit.durationMinutes || 0) / 60);
                const minutes = (exit.durationMinutes || 0) % 60;
                const timeDiff = `${hours} س ${minutes} د`;

                // Find corresponding entry to get shift info and violation/disciplinary status
                const correspondingEntry = entries.find(
                  (e) => e.militaryId === exit.militaryId,
                );
                const shiftForColor = correspondingEntry?.shift || "";

                return (
                  <TableRow
                    key={exit.id}
                    className="border-b-2 border-gray-300 bg-white hover:bg-gray-50">
                    <TableCell className="text-center py-2 px-2 border-r-2 border-gray-300 w-10">
                      <Checkbox
                        checked={selectedExits.has(exit.id)}
                        onCheckedChange={() => onToggleExit(exit.id)}
                      />
                    </TableCell>
                    <TableCell
                      className={`text-center font-black text-2xl py-4 px-2 border-r-2 border-gray-300 whitespace-nowrap ${getIdCellStyle(correspondingEntry?.hasViolation, correspondingEntry?.hasDisciplinary, index === sortedExits.length - 1)}`}>
                      {exit.civilId}
                    </TableCell>
                    <TableCell className="text-center font-black text-2xl py-4 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.name}
                    </TableCell>
                    <TableCell className="text-center py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.exitTime ? formatTime12HourKSA(exit.exitTime) : ""}
                    </TableCell>
                    <TableCell className="text-center font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                      {exit.exitTime && exit.entryTime ? timeDiff : ""}
                    </TableCell>
                    <TableCell
                      className={`text-center font-black text-2xl py-4 px-2 border-2 whitespace-nowrap ${getShiftCellColor(shiftForColor)}`}>
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
