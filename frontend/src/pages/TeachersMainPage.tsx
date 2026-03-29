import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { classApi, Class } from "@/lib/classApi";
import { useToast } from "@/hooks/use-toast";
import TeacherDailyReport from "@/components/teacher/TeacherDailyReport";

export default function TeachersMainPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teacherClass, setTeacherClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="p-4">
      <TeacherDailyReport classData={teacherClass} />
    </div>
  );
}
