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
  const timePart = dateTimeString.split(" ")[1]; // Extract "HH:mm:ss"
  if (!timePart) return dateTimeString;
  const [hours, minutes, seconds] = timePart.split(":");
  let h = parseInt(hours);
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${h}:${minutes}:${seconds} ${period}`;
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

export interface ExitRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  exitTime: string;
  entryTime: string;
}

interface ExitsTableProps {
  exits: ExitRecord[];
  entries: EntryRecord[];
  selectedShift: Shift | null;
  onMilitaryIdChange?: (exitId: string, militaryId: string) => void;
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
  onMilitaryIdChange,
}: ExitsTableProps) {
  // Count exits with actual data (non-empty militaryId)
  const exitsWithData = exits.filter((e) => e.militaryId.trim() !== "");
  const filteredExits = exitsWithData;

  // Count attended trainees (unique entries with militaryId)
  const attendedCount = new Set(
    entries.filter((e) => e.militaryId.trim() !== "").map((e) => e.militaryId),
  ).size;
  const totalTrainees = attendedCount || 1; // Use attended count or 1 to avoid division issues

  return (
    <Card className="border border-border shadow-md">
      <div className="flex items-center justify-between border-b-2 border-border bg-slate-50 p-2">
        <div className="flex items-center gap-2">
          <ArrowUpFromLine className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">سجل الخروج</h3>
        </div>
        <Badge className="bg-warning/20 text-warning border-warning text-sm font-semibold px-4 py-2 text-base">
          {filteredExits.length} غادر من {totalTrainees}
        </Badge>
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-green-500 hover:bg-green-500 border-b-2 border-green-700">
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                تسجيل الخروج
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                الاسم
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                وقت الخروج
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                الفارق الزمني
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-green-700 whitespace-nowrap">
                ساعات الشفت
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
                const entryDate = new Date(exit.entryTime);
                const exitDate = new Date(exit.exitTime);
                const diffMs = exitDate.getTime() - entryDate.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                );
                const timeDiff = `${hours}h ${minutes}m`;

                return (
                  <TableRow
                    key={exit.id}
                    className="border-b-2 border-green-400 bg-green-100 hover:bg-green-150">
                    <TableCell className="text-foreground font-medium text-sm py-2 px-2 border-r-2 border-green-400 bg-white whitespace-nowrap">
                      {exit.militaryId}
                    </TableCell>
                    <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-green-400 whitespace-nowrap">
                      {exit.name}
                    </TableCell>
                    <TableCell className="text-foreground py-2 px-2 border-r-2 border-green-400 whitespace-nowrap">
                      {exit.exitTime ? formatTime12Hour(exit.exitTime) : ""}
                    </TableCell>
                    <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-green-400 whitespace-nowrap">
                      {exit.exitTime && exit.entryTime ? timeDiff : ""}
                    </TableCell>
                    <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-green-400 whitespace-nowrap">
                      {selectedShift
                        ? formatShiftTime(
                            selectedShift.start_time,
                            selectedShift.end_time,
                          )
                        : ""}
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
