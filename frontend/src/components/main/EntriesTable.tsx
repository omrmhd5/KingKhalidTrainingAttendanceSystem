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
import { ArrowDownToLine } from "lucide-react";

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

const isOnTime = (arrivalTime: string, shiftStartTime: string): boolean => {
  const arrivalTimePart = arrivalTime.split(" ")[1]; // Extract "HH:mm:ss"
  if (!arrivalTimePart) return false;

  return arrivalTimePart <= shiftStartTime;
};

export interface EntryRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  arrivalTime: string;
  shift: string;
}

interface EntriesTableProps {
  entries: EntryRecord[];
  selectedShift: Shift | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onMilitaryIdChange?: (
    entryId: string,
    militaryId: string,
    shiftName: string,
  ) => void;
}

export default function EntriesTable({
  entries,
  selectedShift,
  selectedDate,
  onDateChange,
  onMilitaryIdChange,
}: EntriesTableProps) {
  // Count entries with actual data (non-empty militaryId)
  const entriesWithData = entries.filter((e) => e.militaryId.trim() !== "");
  const shiftEntries = selectedShift
    ? entriesWithData.filter((e) => e.shift === selectedShift.name)
    : entriesWithData;

  return (
    <Card className="border border-border shadow-md">
      <div className="flex items-center justify-between border-b-2 border-border bg-slate-50 p-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-success" />
            <h3 className="text-lg font-semibold text-foreground">
              سجل الدخول
            </h3>
          </div>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-40 h-10 bg-background border-border text-foreground"
          />
        </div>
        {selectedShift && (
          <Badge className="bg-success/20 text-success border-success text-sm font-semibold px-4 py-2 text-base">
            {shiftEntries.length} حاضر من {entriesWithData.length}
          </Badge>
        )}
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-blue-500 hover:bg-blue-500 border-b-2 border-blue-700">
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                تسجيل الدخول
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الاسم
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                وقت الوصول
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الحالة
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الشفت
              </TableHead>
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                ساعات الشفت
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground border border-border">
                  لا توجد سجلات دخول
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="border-b-2 border-blue-400 bg-blue-100 hover:bg-blue-150">
                  <TableCell className="text-foreground font-medium text-sm py-2 px-2 border-r-2 border-blue-400 bg-white whitespace-nowrap">
                    {entry.militaryId}
                  </TableCell>
                  <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-blue-400 whitespace-nowrap">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-foreground py-2 px-2 border-r-2 border-blue-400 whitespace-nowrap">
                    {entry.arrivalTime
                      ? formatTime12Hour(entry.arrivalTime)
                      : ""}
                  </TableCell>
                  <TableCell className="text-foreground py-2 px-2 border-r-2 border-blue-400 whitespace-nowrap">
                    {entry.arrivalTime && selectedShift ? (
                      isOnTime(entry.arrivalTime, selectedShift.start_time) ? (
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          في الموعد
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-red-300">
                          متأخر
                        </Badge>
                      )
                    ) : (
                      ""
                    )}
                  </TableCell>
                  <TableCell className="text-foreground py-2 px-2 border-r-2 border-blue-400 whitespace-nowrap">
                    {entry.shift ? entry.shift : ""}
                  </TableCell>
                  <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-blue-400 whitespace-nowrap">
                    {selectedShift && entry.shift === selectedShift.name
                      ? formatShiftTime(
                          selectedShift.start_time,
                          selectedShift.end_time,
                        )
                      : ""}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
