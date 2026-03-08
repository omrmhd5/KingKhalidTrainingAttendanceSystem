import { useState, useEffect } from "react";
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
import { shiftApi } from "@/lib/shiftApi";

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

const formatTime12HourShort = (time: string): string => {
  const [hours, minutes] = time.split(":");
  let h = parseInt(hours);
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${h}:${minutes} ${period}`;
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
}

interface ShiftAPIResponse {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

interface EntriesTableProps {
  entries: EntryRecord[];
  selectedShift: Shift | null;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onShiftChange: (shift: Shift | null) => void;
}

export default function EntriesTable({
  entries,
  selectedShift,
  selectedDate,
  onDateChange,
  onShiftChange,
}: EntriesTableProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await shiftApi.getAllShifts();
        const mappedShifts = (data as ShiftAPIResponse[]).map((shift) => ({
          ...shift,
          id: shift._id,
        }));
        setShifts(mappedShifts || []);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
        setShifts([]);
      } finally {
        setLoadingShifts(false);
      }
    };

    fetchShifts();
  }, []);

  const handleShiftChange = (shiftId: string) => {
    const shift =
      shiftId === "all" ? null : shifts.find((s) => s.id === shiftId) || null;
    onShiftChange(shift);
  };
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
            className="w-36 h-9 text-sm bg-background border-border text-foreground"
          />
          <Select
            value={selectedShift?.id || "all"}
            onValueChange={handleShiftChange}>
            <SelectTrigger dir="rtl" className="w-40 h-9 text-sm border-border">
              <SelectValue placeholder={loadingShifts ? "جاري..." : "الكل"} />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" className="text-sm">
                الكل
              </SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id} className="text-sm">
                  {shift.name} ({formatTime12HourShort(shift.start_time)} -{" "}
                  {formatTime12HourShort(shift.end_time)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Badge className="bg-success/20 text-success border-success text-sm font-semibold px-4 py-2 text-base">
          {shiftEntries.length} دخول
        </Badge>
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
                  className="border-b-2 border-gray-300 bg-white hover:bg-gray-50">
                  <TableCell className="text-foreground font-medium text-sm py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.militaryId}
                  </TableCell>
                  <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-foreground py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.arrivalTime
                      ? formatTime12Hour(entry.arrivalTime)
                      : ""}
                  </TableCell>
                  <TableCell className="text-foreground py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
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
                  <TableCell
                    className={`text-foreground font-medium py-2 px-2 border-2 whitespace-nowrap ${getShiftCellColor(entry.shift)}`}>
                    {entry.shift ? entry.shift : ""}
                  </TableCell>
                  <TableCell className="text-foreground font-medium py-2 px-2 border-r-2 border-gray-300 whitespace-nowrap">
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
