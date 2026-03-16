import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Barcode from "react-barcode";

interface AbsenceRecord {
  _id: string;
  military_id: string;
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

export function AbsencesTab({
  date,
  absences = [],
  isLoading = false,
}: AbsencesTabProps) {
  return (
    <Card dir="rtl">
      <CardContent className="p-6">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الرقم العسكري</TableHead>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الشفت</TableHead>
              <TableHead className="text-center">الباركود</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : absences?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground">
                  لا توجد غيابات
                </TableCell>
              </TableRow>
            ) : (
              absences?.map((a: AbsenceRecord) => (
                <TableRow key={a._id} className="h-10">
                  <TableCell className="font-medium text-right py-1">
                    {a.military_id}
                  </TableCell>
                  <TableCell className="text-right py-1">
                    {a.full_name}
                  </TableCell>
                  <TableCell className="text-right py-1">
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
