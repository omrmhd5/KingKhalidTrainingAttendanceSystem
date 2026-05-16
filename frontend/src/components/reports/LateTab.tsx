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
import { shiftApi } from "@/lib/shiftApi";
import { formatTime12HourKSA } from "@/lib/timeUtils";

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface LateRecord {
  _id: string;
  military_id: string;
  civil_id: string;
  full_name: string;
  shift_id?: {
    name: string;
  };
  entry_time: string;
}

interface LateTabProps {
  date: string;
  lates?: LateRecord[];
  isLoading?: boolean;
  onFilteredDataChange?: (data: LateRecord[]) => void;
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

export function LateTab({
  date,
  lates = [],
  isLoading = false,
  onFilteredDataChange,
}: LateTabProps) {
  const [search, setSearch] = useState("");
  const [filterShift, setFilterShift] = useState("all");
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const shiftsData = await shiftApi.getAllShifts();
        setShifts(shiftsData);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
      }
    };

    fetchShifts();
  }, []);

  const filteredLates = lates.filter((late: LateRecord) => {
    const matchesSearch =
      late.military_id?.toLowerCase().includes(search.toLowerCase()) ||
      late.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesShift =
      !filterShift ||
      filterShift === "all" ||
      late.shift_id?._id === filterShift;

    return matchesSearch && matchesShift;
  });

  // Notify parent of filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredLates);
    }
  }, [filteredLates, onFilteredDataChange]);

  return (
    <Card dir="rtl" className="bg-purple-100 border-purple-900">
      <CardContent className="p-6">
        <HoursReportFilters
          search={search}
          onSearchChange={setSearch}
          filterShift={filterShift}
          onShiftChange={setFilterShift}
          shifts={shifts}
        />
        <div className="mb-4 text-sm font-semibold text-purple-800">
          الإجمالي: <span className="text-lg">{filteredLates.length}</span>
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table dir="rtl" className="border-collapse">
            <TableHeader className="bg-purple-600">
              <TableRow>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  الرقم العسكري
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  السجل المدني
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  الاسم
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  الشفت
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  وقت الدخول
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4">
                  الباركود
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 px-4 text-muted-foreground border border-gray-300">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredLates?.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 px-4 text-muted-foreground border border-gray-300">
                    لا توجد حضورات متأخرة
                  </TableCell>
                </TableRow>
              ) : (
                filteredLates?.map((late: LateRecord, index) => (
                  <TableRow
                    key={late._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                    <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                      {late.military_id}
                    </TableCell>
                    <TableCell className="text-center py-2 px-4 border border-gray-300">
                      {late.civil_id}
                    </TableCell>
                    <TableCell className="text-center py-2 px-4 border border-gray-300">
                      {late.full_name}
                    </TableCell>
                    <TableCell
                      className={`text-center font-medium py-2 px-2 border rounded ${getShiftCellColor(late.shift_id?.name || "")}`}>
                      {late.shift_id?.name || "—"}
                    </TableCell>
                    <TableCell className="text-center py-2 px-4 border border-gray-300 text-sm">
                      {formatTime12HourKSA(late.entry_time)}
                    </TableCell>
                    <TableCell className="text-center py-2 px-4 border border-gray-300">
                      <div className="flex justify-center scale-75 origin-center">
                        <Barcode
                          value={late.military_id}
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
        </div>
      </CardContent>
    </Card>
  );
}
