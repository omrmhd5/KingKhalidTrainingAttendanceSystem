import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ArrowUpFromLine } from "lucide-react";

const formatTime12Hour = (dateTimeString: string): string => {
  const timePart = dateTimeString.split(" ")[1]; // Extract "HH:mm:ss"
  if (!timePart) return dateTimeString;
  const [hours, minutes, seconds] = timePart.split(":");
  let h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minutes}:${seconds} ${ampm}`;
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
}

export default function ExitsTable({ exits }: ExitsTableProps) {
  return (
    <Card className="border border-border">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <ArrowUpFromLine className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-semibold text-foreground">سجل الخروج</h3>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {exits.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
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
