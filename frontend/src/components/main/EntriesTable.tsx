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
}

export default function EntriesTable({
  entries,
  selectedShift,
}: EntriesTableProps) {
  // Count entries for the selected shift
  const shiftEntries = selectedShift
    ? entries.filter((e) => e.shift === selectedShift.name)
    : entries;

  return (
    <Card className="border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">سجل الدخول</h3>
        </div>
        {selectedShift && (
          <Badge className="bg-success/20 text-success border-success text-sm font-semibold px-4 py-2 text-base">
            {shiftEntries.length} حاضر من {entries.length}
          </Badge>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-right text-foreground font-semibold">
                تسجيل الدخول
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                الاسم
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                وقت الوصول
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                النوبة
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                ساعات النوبة
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات دخول
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="border-b border-border bg-blue-200 hover:bg-blue-300">
                  <TableCell className="text-foreground font-medium text-sm">
                    {entry.militaryId}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {formatTime12Hour(entry.arrivalTime)}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {entry.shift}
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {selectedShift && entry.shift === selectedShift.name
                      ? formatShiftTime(
                          selectedShift.start_time,
                          selectedShift.end_time,
                        )
                      : "—"}
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
