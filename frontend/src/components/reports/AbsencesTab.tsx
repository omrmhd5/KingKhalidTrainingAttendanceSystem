import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AbsenceRecord {
  id: string;
  trainees?: {
    full_name: string;
    civil_id: string;
    rank: string;
  };
  shifts?: {
    name: string;
  };
}

interface AbsencesTabProps {
  date: string;
}

export function AbsencesTab({ date }: AbsencesTabProps) {
  const absences: AbsenceRecord[] = [];

  return (
    <Card dir="rtl">
      <CardContent className="p-0">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">اسم المتدرب</TableHead>
              <TableHead className="text-right">رقم الهوية</TableHead>
              <TableHead className="text-right">الرتبة</TableHead>
              <TableHead className="text-right">الشفت</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد غيابات
                </TableCell>
              </TableRow>
            ) : (
              absences?.map((a: AbsenceRecord) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    {a.trainees?.full_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {a.trainees?.civil_id}
                  </TableCell>
                  <TableCell>{a.trainees?.rank}</TableCell>
                  <TableCell>{a.shifts?.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
