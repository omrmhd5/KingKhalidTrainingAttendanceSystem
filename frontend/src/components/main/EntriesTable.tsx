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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownToLine } from "lucide-react";

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

const getIdCellStyle = (
  hasViolation?: boolean,
  hasDisciplinary?: boolean,
  isFirst: boolean = false,
): string => {
  if (hasViolation) {
    return "bg-red-200 border-red-500";
  }
  if (hasDisciplinary) {
    return "bg-blue-200 border-blue-500";
  }
  if (isFirst) {
    return "bg-yellow-200 border-yellow-500";
  }
  return "";
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

export interface EntryRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  arrivalTime: string;
  shift: string;
  shiftStartTime: string;
  shiftEndTime: string;
  actualShift: string;
  actualShiftStartTime?: string;
  actualShiftEndTime?: string;
  status: "on-time" | "late" | "absent" | "pending";
  hasViolation?: boolean;
  hasDisciplinary?: boolean;
}

interface EntriesTableProps {
  entries: EntryRecord[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  selectedShiftFilter: string;
  onShiftFilterChange: (filter: string) => void;
}

export default function EntriesTable({
  entries,
  selectedDate,
  onDateChange,
  selectedShiftFilter,
  onShiftFilterChange,
}: EntriesTableProps) {
  // Get unique shifts from entries
  const uniqueShifts = Array.from(new Set(entries.map((e) => e.shift)))
    .filter(Boolean)
    .sort();

  // Filter entries based on selected shift
  const filteredEntries =
    selectedShiftFilter === "all"
      ? entries
      : entries.filter((e) => e.shift === selectedShiftFilter);

  // Count entries with actual data (non-empty militaryId)
  const entriesWithData = filteredEntries.filter(
    (e) => e.militaryId.trim() !== "",
  );

  return (
    <Card className="border border-border shadow-md">
      <div className="flex items-center justify-between border-b-2 border-border bg-slate-50 p-2">
        <div className="flex items-center gap-3">
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
            className="w-36 h-9 text-sm bg-background border-border text-foreground"
          />
          <Select
            value={selectedShiftFilter}
            onValueChange={onShiftFilterChange}>
            <SelectTrigger className="w-40 h-9 text-sm border-border flex-row-reverse">
              <SelectValue placeholder="اختر الشفت" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" className="text-sm">
                الكل
              </SelectItem>
              {uniqueShifts.map((shift) => (
                <SelectItem key={shift} value={shift} className="text-sm">
                  {shift}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge className="bg-success/20 text-success border-success font-semibold px-4 py-2 text-base">
          {entriesWithData.length} دخول
        </Badge>
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-blue-500 hover:bg-blue-500 border-b-2 border-blue-700">
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                تسجيل الدخول
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الاسم
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                وقت الوصول
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الحالة
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                الشفت
              </TableHead>
              <TableHead className="text-center text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                ساعات الشفت
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground border border-border">
                  لا توجد سجلات دخول
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry, index) => (
                <TableRow
                  key={entry.id}
                  className="border-b-2 border-gray-300 bg-white hover:bg-gray-50">
                  <TableCell
                    className={`text-center font-medium text-sm py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap ${getIdCellStyle(entry.hasViolation, entry.hasDisciplinary, index === 0)}`}>
                    {entry.militaryId}
                  </TableCell>
                  <TableCell className="text-center font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-center py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.arrivalTime
                      ? formatTime12Hour(entry.arrivalTime)
                      : ""}
                  </TableCell>
                  <TableCell className="text-center py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.status === "on-time" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        في الموعد
                      </Badge>
                    ) : entry.status === "late" ? (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        متأخر
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                        {entry.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium py-2 px-2 border-2 whitespace-nowrap ${getShiftCellColor(entry.shift)}`}>
                    {entry.shift ? entry.shift : ""}
                  </TableCell>
                  <TableCell className="text-center font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.shiftStartTime && entry.shiftEndTime
                      ? formatShiftTime(
                          entry.shiftStartTime,
                          entry.shiftEndTime,
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
