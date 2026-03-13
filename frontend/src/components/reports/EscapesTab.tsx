import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

interface EscapeRecord {
  id: string;
  trainees?: {
    full_name: string;
  };
  type?: string;
  detected_at: string;
  notes?: string;
}

interface EscapesTabProps {
  date: string;
}

export function EscapesTab({ date }: EscapesTabProps) {
  const escapes: EscapeRecord[] = [];

  return (
    <Card dir="rtl">
      <CardContent className="p-0">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم المتدرب</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">وقت الاكتشاف</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {escapes?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد حالات هروب
                </TableCell>
              </TableRow>
            ) : (
              escapes?.map((e: EscapeRecord) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.trainees?.full_name}
                  </TableCell>
                  <TableCell>{e.type ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(e.detected_at), "HH:mm")}
                  </TableCell>
                  <TableCell className="text-sm">{e.notes ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
