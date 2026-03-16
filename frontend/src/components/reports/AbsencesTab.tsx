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

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface AbsenceRecord {
  _id: string;
  military_id: string;
  civil_id: string;
  full_name: string;
  shift_id?: {
    name: string;
  };
}

interface AbsencesTabProps {
  date: string;
  absences?: AbsenceRecord[];
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

export function AbsencesTab({
  date,
  absences = [],
  isLoading = false,
}: AbsencesTabProps) {
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

  const filteredAbsences = absences.filter((absence: AbsenceRecord) => {
    const matchesSearch =
      absence.military_id?.toLowerCase().includes(search.toLowerCase()) ||
      absence.full_name?.toLowerCase().includes(search.toLowerCase());

    const matchesShift =
      !filterShift ||
      filterShift === "all" ||
      absence.shift_id?._id === filterShift;

    return matchesSearch && matchesShift;
  });

  return (
    <Card dir="rtl" className="bg-red-100 border-red-900">
      <CardContent className="p-6">
        <HoursReportFilters
          search={search}
          onSearchChange={setSearch}
          filterShift={filterShift}
          onShiftChange={setFilterShift}
          shifts={shifts}
        />
        <div className="mb-4 text-sm font-semibold text-red-800">
          الإجمالي: <span className="text-lg">{filteredAbsences.length}</span>
        </div>
        <Table dir="rtl">
          <TableHeader className="bg-red-600">
            <TableRow className="border-red-600 hover:bg-red-600">
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
            ) : filteredAbsences?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد غيابات
                </TableCell>
              </TableRow>
            ) : (
              filteredAbsences?.map((a: AbsenceRecord) => (
                <TableRow
                  key={a._id}
                  className="h-10 border-red-300 hover:bg-red-200">
                  <TableCell className="font-medium text-right py-1 text-red-900">
                    {a.military_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-red-900">
                    {a.civil_id}
                  </TableCell>
                  <TableCell className="text-right py-1 text-red-900">
                    {a.full_name}
                  </TableCell>
                  <TableCell
                    className={`text-center font-medium py-1 px-2 border-2 whitespace-nowrap ${getShiftCellColor(a.shift_id?.name || "")}`}>
                    {a.shift_id?.name || "—"}
                  </TableCell>
                  <TableCell className="text-center py-1">
                    <div className="flex justify-center scale-75 origin-center">
                      <Barcode
                        value={a.military_id.toString()}
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
