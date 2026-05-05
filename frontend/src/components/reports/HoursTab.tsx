import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { HoursReportFilters } from "./HoursReportFilters";
import Barcode from "react-barcode";
import { attendanceApi } from "@/lib/attendanceApi";
import { shiftApi } from "@/lib/shiftApi";
import { formatTime12HourKSA, minutesToTimeString } from "@/lib/timeUtils";
import { AttendanceRecord } from "@/lib/attendanceApi";

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface HourRow {
  id: string;
  militaryId: string;
  full_name: string;
  shift: string;
  checkIn: string;
  checkOut: string;
  scheduledHours: string;
  lostHours: string;
  actualHours: string;
  barcode: string;
}

interface HoursTabProps {
  date: string;
  onFilteredDataChange?: (data: AttendanceRecord[]) => void;
}

const getShiftCellColor = (shift: string): string => {
  const shiftLetter = shift?.charAt(0).toUpperCase();
  switch (shiftLetter) {
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

export function HoursTab({ date, onFilteredDataChange }: HoursTabProps) {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("all");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch attendance records for the date
        const attendanceRes = await attendanceApi.getAttendanceByDate(date);

        // Fetch shifts
        const shiftsData = await shiftApi.getAllShifts();
        setShifts(shiftsData);

        setAttendanceData(attendanceRes.records || []);
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
        setAttendanceData([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (date) {
      fetchData();
    }
  }, [date]);

  const filteredData = attendanceData.filter((record: AttendanceRecord) => {
    const matchesSearch =
      record.military_id?.toLowerCase().includes(search.toLowerCase()) ||
      record.trainee_id?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchesShift =
      !filterShift ||
      filterShift === "all" ||
      record.trainee_assigned_shift_id?._id === filterShift;

    return matchesSearch && matchesShift;
  });

  // Notify parent of filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData, onFilteredDataChange]);

  const hoursData = filteredData.map((record: AttendanceRecord) => {
    const scheduledMinutes = 4 * 60 + 45; // 4:45:00
    const actualMinutes = record.duration_minutes || 0;
    const lostMinutes = Math.max(0, scheduledMinutes - actualMinutes);

    return {
      id: record._id,
      militaryId: record.military_id,
      full_name: record.trainee_id?.full_name || "—",
      shift: record.trainee_assigned_shift_id?.name || "—",
      checkIn: record.entry_time ? formatTime12HourKSA(record.entry_time) : "—",
      checkOut: record.exit_time ? formatTime12HourKSA(record.exit_time) : "—",
      scheduledHours: minutesToTimeString(scheduledMinutes),
      lostHours: minutesToTimeString(lostMinutes),
      actualHours: minutesToTimeString(actualMinutes),
      barcode: record.military_id,
    };
  });

  return (
    <Card dir="rtl" className="bg-gray-50 border-gray-300">
      <CardContent className="p-6">
        <HoursReportFilters
          search={search}
          onSearchChange={setSearch}
          filterShift={filterShift}
          onShiftChange={setFilterShift}
          shifts={shifts}
        />
        <Table dir="rtl">
          <TableHeader className="bg-gray-200">
            <TableRow className="border-gray-300 hover:bg-gray-200">
              <TableHead className="text-right text-gray-800 font-bold">
                الرقم العسكري
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الإسم
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الشفت
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الحضور
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الخروج
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الساعات المجدولة
              </TableHead>
              <TableHead className="text-right text-gray-800 font-bold">
                الساعات المفقودة
              </TableHead>
              <TableHead className="text-right text-white font-bold bg-green-800">
                الساعات الفعلية
              </TableHead>
              <TableHead className="text-center text-gray-800 font-bold">
                الباركود
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : hoursData?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات
                </TableCell>
              </TableRow>
            ) : (
              hoursData?.map((h: HourRow) => (
                <TableRow
                  key={h.id}
                  className="h-10 border-gray-200 hover:bg-gray-100">
                  <TableCell className="font-medium text-right py-1 text-gray-700">
                    {h.militaryId}
                  </TableCell>
                  <TableCell className="text-right py-1 text-gray-700">
                    {h.full_name}
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium py-1 px-2 border-2 whitespace-nowrap ${getShiftCellColor(h.shift)}`}>
                    {h.shift}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right py-1 text-gray-700">
                    {h.checkIn}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right py-1 text-gray-700">
                    {h.checkOut}
                  </TableCell>
                  <TableCell className="text-right py-1 text-gray-700">
                    {h.scheduledHours}
                  </TableCell>
                  <TableCell className="text-right py-1 text-gray-700">
                    {h.lostHours}
                  </TableCell>
                  <TableCell className="text-right py-1 text-green-900 font-semibold bg-green-300">
                    {h.actualHours}
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <div className="flex justify-center scale-75 origin-center">
                      <Barcode
                        value={h.barcode.toString()}
                        width={1.5}
                        height={40}
                        displayValue={true}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
