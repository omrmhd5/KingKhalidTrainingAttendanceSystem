import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Class } from "@/lib/classApi";
import { BookOpen } from "lucide-react";

interface TeacherClassCardProps {
  classData: Class;
  selectedDate: string;
  onDateChange: (date: string) => void;
  attendanceMap: Map<string, string>;
  reportStats?: {
    present: number;
    absent: number;
    escape: number;
    violations: number;
  };
}

export default function TeacherClassCard({
  classData,
  selectedDate,
  onDateChange,
  attendanceMap,
  reportStats,
}: TeacherClassCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="text-right space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>معلومات الفصل</CardTitle>
          <BookOpen className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex items-center gap-2" dir="rtl">
          <label className="text-sm font-medium text-muted-foreground">
            التاريخ:
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-40 text-right"
          />
        </div>
      </CardHeader>
      <CardContent className="text-right space-y-4" dir="rtl">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              اسم الفصل
            </p>
            <p className="text-lg font-semibold">{classData.name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              عدد الطلاب
            </p>
            <p className="text-lg font-semibold">
              {classData.studentCount || classData.students.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-4 border-t">
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {reportStats?.present ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">الحاضرون</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-red-600">
              {reportStats?.absent ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">الغياب</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-orange-600">
              {reportStats?.escape ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">الهروب</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-purple-600">
              {reportStats?.violations ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">المخالفات</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
