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
import { ArrowUpFromLine } from "lucide-react";

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

export interface ExitRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  exitTime: string;
  entryTime: string;
}

interface ExitsTableProps {
  exits: ExitRecord[];
  selectedShift: Shift | null;
}

export default function ExitsTable({ exits, selectedShift }: ExitsTableProps) {
  // Count exits for the selected shift based on entry shift
  const filteredExits = selectedShift
    ? exits.filter((e) => {
        // For exits, we'll count all exits as present when they exited
        // In a real scenario, you might want to match the shift from the entry data
        return true;
      })
    : exits;

  return (
    <Card className="border border-border">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ArrowUpFromLine className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">سجل الخروج</h3>
        </div>
        {selectedShift && (
          <Badge className="bg-warning/20 text-warning border-warning text-sm font-semibold px-4 py-2 text-base">
            {filteredExits.length} غادر من {exits.length}
          </Badge>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="text-right text-foreground font-semibold">
                تسجيل الخروج
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                الاسم
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                وقت الخروج
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                الفارق الزمني
              </TableHead>
              <TableHead className="text-right text-foreground font-semibold">
                ساعات النوبة
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات خروج
                </TableCell>
              </TableRow>
            ) : (
              exits.map((exit) => {
                const entryDate = new Date(exit.entryTime);
                const exitDate = new Date(exit.exitTime);
                const diffMs = exitDate.getTime() - entryDate.getTime();
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                );
                const timeDiff = `${hours}h ${minutes}m`;

                return (
                  <TableRow
                    key={exit.id}
                    className="border-b border-border bg-red-200 hover:bg-red-300">
                    <TableCell className="text-foreground font-medium text-sm">
                      {exit.militaryId}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {exit.name}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatTime12Hour(exit.exitTime)}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {timeDiff}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {selectedShift
                        ? formatShiftTime(
                            selectedShift.start_time,
                            selectedShift.end_time,
                          )
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
