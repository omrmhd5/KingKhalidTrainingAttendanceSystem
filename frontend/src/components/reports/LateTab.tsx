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

export function LateTab({ date, lates = [], isLoading = false }: LateTabProps) {
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
        <Table dir="rtl">
          <TableHeader className="bg-purple-600">
            <TableRow className="border-purple-600 hover:bg-purple-600">
              <TableHead className="text-right text-white font-bold">
                الرقم العسكري
              </TableHead>
              <TableHead className="text-right text-white font-bold">
                السجل المدني
              </TableHead>
              <TableHead className="text-right text-white font-bold">
                الاسم
              </TableHead>
              <TableHead className="text-right text-white font-bold">
                الشفت
              </TableHead>
              <TableHead className="text-right text-white font-bold">
                وقت الدخول
              </TableHead>
              <TableHead className="text-center text-white font-bold">
                الباركود
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filteredLates?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد حضورات متأخرة
                </TableCell>
              </TableRow>
            ) : (
              filteredLates?.map((late: LateRecord) => (
                <TableRow
                  key={late._id}
                  className="h-10 border-purple-300 hover:bg-purple-200">
                  <TableCell className="font-medium text-right py-1 text-purple-900">
                    {late.military_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-purple-900">
                    {late.civil_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-purple-900">
                    {late.full_name}
                  </TableCell>
                  <TableCell
                    className={`text-right py-1 font-medium border rounded ${getShiftCellColor(
                      late.shift_id?.name || "",
                    )}`}>
                    {late.shift_id?.name || "—"}
                  </TableCell>
                  <TableCell className="text-right py-1 text-purple-900 text-sm">
                    {formatTime12HourKSA(late.entry_time)}
                  </TableCell>
                  <TableCell className="text-center py-1">
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
      </CardContent>
    </Card>
  );
}
