import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ArrowDownToLine } from "lucide-react";

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
}

export default function EntriesTable({ entries }: EntriesTableProps) {
  return (
    <Card className="border border-border">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <ArrowDownToLine className="h-5 w-5 text-success" />
        <h3 className="text-lg font-semibold text-foreground">سجل الدخول</h3>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد سجلات دخول
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  className="border-b border-border hover:bg-muted/50">
                  <TableCell className="text-foreground text-center text-green-600 font-bold">
                    ✓
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {entry.arrivalTime}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {entry.shift}
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
