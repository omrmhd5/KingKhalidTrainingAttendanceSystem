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
                الفرق الزمني
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
                    className="border-b border-border hover:bg-muted/50">
                    <TableCell className="text-foreground text-center text-orange-600 font-bold">
                      ✓
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {exit.name}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {exit.exitTime}
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
