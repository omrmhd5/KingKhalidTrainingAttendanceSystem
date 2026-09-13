import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { classApi, Class } from "@/lib/classApi";
import { useToast } from "@/hooks/use-toast";
import TeacherDailyReport from "@/components/teacher/TeacherDailyReport";

export default function TeachersMainPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
            title: t("teacher.infoTitle"),
            description: t("teacher.noClassYet"),
          });
        }
      } catch (error) {
        toast({
          title: t("common.error"),
          description: t("teacher.loadFailed"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeacherClass();
  }, [user?.id, toast, t]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!teacherClass) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">{t("teacher.welcome")}</CardTitle>
          </CardHeader>
          <CardContent className="py-6 space-y-2">
            <p className="text-muted-foreground">{t("teacher.thanks")}</p>
            <p className="text-muted-foreground">{t("teacher.noClass")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <TeacherDailyReport classData={teacherClass} />
    </div>
  );
}
