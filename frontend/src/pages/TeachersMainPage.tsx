import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { classApi, Class } from "@/lib/classApi";
import { attendanceApi, type AttendanceRecord } from "@/lib/attendanceApi";
import { useToast } from "@/hooks/use-toast";
import TeacherClassCard from "@/components/teacher/TeacherClassCard";
import TeacherScheduleCard from "@/components/teacher/TeacherScheduleCard";
import TeacherStudentsCard from "@/components/teacher/TeacherStudentsCard";

export default function TeachersMainPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");
  const [teacherClass, setTeacherClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [attendanceMap, setAttendanceMap] = useState<Map<string, string>>(
    new Map(),
  );

  useEffect(() => {
    const loadTeacherClass = async () => {
      try {
        if (!user?.id) return;

        setLoading(true);
        const classes = await classApi.getAllClasses({ teacherId: user.id });

        if (classes.length > 0) {
          setTeacherClass(classes[0]);
        } else {
          toast({
            title: "معلومات",
            description: "لم يتم تعيين فصل لك بعد",
          });
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل بيانات الفصل",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeacherClass();
  }, [user?.id, toast]);

  // Fetch attendance records for selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await attendanceApi.getAttendanceByDate(selectedDate);

        // Create a map of trainee ID to status
        const map = new Map<string, string>();
        response.records.forEach((record: AttendanceRecord) => {
          if (typeof record.trainee_id === "object" && record.trainee_id?._id) {
            map.set(record.trainee_id._id, record.status || "present");
          }
        });
        setAttendanceMap(map);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceMap(new Map());
      }
    };

    fetchAttendance();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!teacherClass) {
    return (
      <Card className="m-4">
        <CardHeader className="text-right" dir="rtl">
          <CardTitle>معلومات الفصل</CardTitle>
        </CardHeader>
        <CardContent className="text-right py-8" dir="rtl">
          <p className="text-muted-foreground">لم يتم تعيين فصل لك بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-4" dir="rtl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TeacherClassCard
          classData={teacherClass}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendanceMap={attendanceMap}
        />
        <TeacherScheduleCard classData={teacherClass} />
      </div>
      <TeacherStudentsCard
        classData={teacherClass}
        selectedDate={selectedDate}
        attendanceMap={attendanceMap}
      />
    </div>
  );
}
