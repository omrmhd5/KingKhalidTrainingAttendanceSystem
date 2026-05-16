import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownToLine } from "lucide-react";
import { formatTime12HourKSA } from "@/lib/timeUtils";
import { shiftApi } from "@/lib/shiftApi";

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
  actualShift: string;
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
  selectedEntries: Set<string>;
  onToggleEntry: (id: string) => void;
  onToggleAll: () => void;
}

export default function EntriesTable({
  entries,
  selectedDate,
  onDateChange,
  selectedShiftFilter,
  onShiftFilterChange,
  selectedEntries,
  onToggleEntry,
  onToggleAll,
}: EntriesTableProps) {
  const [apiShifts, setApiShifts] = useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  // Load shifts from API
  useEffect(() => {
    const loadShifts = async () => {
      try {
        setLoadingShifts(true);
        const shifts = await shiftApi.getAllShifts();
        setApiShifts(shifts);
      } catch (error) {
        console.error("Failed to load shifts:", error);
      } finally {
        setLoadingShifts(false);
      }
    };

    loadShifts();
  }, []);

  // Restore filter from localStorage on mount
  useEffect(() => {
    const savedFilter = localStorage.getItem("entriesTableShiftFilter");
    if (savedFilter) {
      onShiftFilterChange(savedFilter);
    }
  }, []);

  // Save filter to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("entriesTableShiftFilter", selectedShiftFilter);
  }, [selectedShiftFilter]);

  // Filter entries based on selected shift
  const filteredEntries =
    selectedShiftFilter === "all"
      ? entries
      : entries.filter((e) => e.actualShift === selectedShiftFilter);

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
            className="w-36 h-9 text-sm bg-background border-border text-foreground justify-start"
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
              {apiShifts.map((shift) => (
                <SelectItem
                  key={shift._id}
                  value={shift.name}
                  className="text-sm">
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="w-full">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-blue-500 hover:bg-blue-500 border-b-2 border-blue-700">
              <TableHead className="text-right text-white font-bold py-2 px-2 border-r-2 border-blue-700 whitespace-nowrap">
                <Checkbox
                  checked={
                    selectedEntries.size === filteredEntries.length &&
                    filteredEntries.length > 0
                  }
                  onCheckedChange={onToggleAll}
                />
              </TableHead>
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
                  <TableCell className="text-left w-2">
                    <Checkbox
                      checked={selectedEntries.has(entry.id)}
                      onCheckedChange={() => onToggleEntry(entry.id)}
                    />
                  </TableCell>
                  <TableCell
                    className={`text-center font-semibold text-base py-3 px-2 border-r-2 border-gray-300 whitespace-nowrap ${getIdCellStyle(entry.hasViolation, entry.hasDisciplinary, index === filteredEntries.length - 1)}`}>
                    {entry.civilId}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-base py-3 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-base py-3 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.arrivalTime
                      ? formatTime12HourKSA(entry.arrivalTime)
                      : ""}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-base py-3 px-2 border-r-2 border-gray-300 whitespace-nowrap">
                    {entry.status === "on-time" ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300 text-sm font-semibold px-3 py-1">
                        في الموعد
                      </Badge>
                    ) : entry.status === "late" ? (
                      <Badge className="bg-red-100 text-red-700 border-red-300 text-sm font-semibold px-3 py-1">
                        متأخر
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700 border-gray-300 text-sm font-semibold px-3 py-1">
                        {entry.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell
                    className={`text-center font-semibold text-base py-3 px-2 border-2 whitespace-nowrap ${getShiftCellColor(entry.shift)}`}>
                    {entry.shift ? entry.shift : ""}
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
