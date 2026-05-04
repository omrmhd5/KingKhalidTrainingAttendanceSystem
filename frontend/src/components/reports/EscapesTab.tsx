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
import { attendanceApi, Escape } from "@/lib/attendanceApi";

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface EscapeRecord {
  _id: string;
  military_id: string;
  full_name: string;
  civil_id: string;
  shift_id?: {
    _id: string;
    name: string;
  };
  entry_time: string;
}

interface EscapesTabProps {
  date: string;
  escapes?: EscapeRecord[];
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

export function EscapesTab({
  date,
  escapes = [],
  isLoading = false,
}: EscapesTabProps) {
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

  const filteredEscapes = escapes.filter((escape: EscapeRecord) => {
    const matchesSearch =
      escape.military_id?.toLowerCase().includes(search.toLowerCase()) ||
      escape.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesShift =
      !filterShift ||
      filterShift === "all" ||
      escape.shift_id?._id === filterShift;

    return matchesSearch && matchesShift;
  });

  return (
    <Card dir="rtl" className="bg-orange-50 border-orange-900">
      <CardContent className="p-6">
        <HoursReportFilters
          search={search}
          onSearchChange={setSearch}
          filterShift={filterShift}
          onShiftChange={setFilterShift}
          shifts={shifts}
        />
        <div className="mb-4 text-sm font-semibold text-orange-800">
          الإجمالي: <span className="text-lg">{filteredEscapes.length}</span>
        </div>
        <Table dir="rtl">
          <TableHeader className="bg-orange-600">
            <TableRow className="border-orange-600 hover:bg-orange-600">
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
              <TableHead className="text-center text-white font-bold">
                الباركود
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : filteredEscapes?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد حالات هروب
                </TableCell>
              </TableRow>
            ) : (
              filteredEscapes?.map((e: EscapeRecord) => (
                <TableRow
                  key={e._id}
                  className="h-10 border-orange-300 hover:bg-orange-200">
                  <TableCell className="font-medium text-right py-1 text-orange-900">
                    {e.military_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-orange-900">
                    {e.civil_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-orange-900">
                    {e.full_name}
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium py-1 px-2 border-2 whitespace-nowrap ${getShiftCellColor(e.shift_id?.name || "")}`}>
                    {e.shift_id?.name || "—"}
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <div className="flex justify-center scale-75 origin-center">
                      <Barcode
                        value={e.military_id.toString()}
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
