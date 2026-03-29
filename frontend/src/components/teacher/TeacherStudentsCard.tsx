import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Class } from "@/lib/classApi";
import { Trainee } from "@/lib/traineeApi";
import { Users, CheckCircle, XCircle } from "lucide-react";

interface TeacherStudentsCardProps {
  classData: Class;
  selectedDate: string;
  attendanceMap: Map<string, string>;
}

export default function TeacherStudentsCard({
  classData,
  selectedDate,
  attendanceMap,
}: TeacherStudentsCardProps) {
  const students = classData.students as Trainee[];

  const getAttendanceStatus = (studentId: string) => {
    return attendanceMap.get(studentId) || "absent";
  };

  return (
    <Card>
      <CardHeader className="text-right">
        <div className="flex items-center justify-between">
          <CardTitle>الطلاب ({students.length})</CardTitle>
          <Users className="h-5 w-5 text-green-500" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الرقم العسكري</TableHead>
              <TableHead className="text-right">السجل المدني</TableHead>
              <TableHead className="text-right">الاسم الكامل</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student: Trainee) => {
              const status = getAttendanceStatus(student._id);
              const isPresent =
                status === "present" ||
                status === "early" ||
                status === "on_time";

              return (
                <TableRow key={student._id}>
                  <TableCell className="text-right font-mono">
                    {student.military_id || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {student.civil_id || "-"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {student.full_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {isPresent ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600">حاضر</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm text-red-600">غايب</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
