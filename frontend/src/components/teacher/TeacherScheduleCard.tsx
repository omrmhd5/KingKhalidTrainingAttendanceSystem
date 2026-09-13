import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Class } from "@/lib/classApi";
import { Clock } from "lucide-react";

interface ClassTimeSchedule {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
  classes: string[];
}

interface TeacherScheduleCardProps {
  classData: Class;
}

// Helper function to convert 24-hour format to 12-hour Arabic format
const convertTo12HourArabic = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? i18n.t("pm") : i18n.t("am");
  const hours12 = hours % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

export default function TeacherScheduleCard({
  classData,
}: TeacherScheduleCardProps) {
  const { t, i18n } = useTranslation();
  const schedule = classData.schedule as unknown as
    | ClassTimeSchedule
    | string
    | undefined;

  // Handle case where schedule might be a string (ID) or object
  if (!schedule || typeof schedule === "string") {
    return (
      <Card>
        <CardHeader className="text-right">
          <div className="flex items-center justify-between">
            <CardTitle>{t("teacher.schedule")}</CardTitle>
            <Clock className="h-5 w-5 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent className="text-right text-muted-foreground py-8">{t("teacher.scheduleUndefined")}</CardContent>
      </Card>
    );
  }

  const startTime12 = convertTo12HourArabic(
    (schedule as ClassTimeSchedule).start_time || "",
  );
  const endTime12 = convertTo12HourArabic(
    (schedule as ClassTimeSchedule).end_time || "",
  );

  return (
    <Card>
      <CardHeader className="text-right">
        <div className="flex items-center justify-between">
          <CardTitle>{t("teacher.schedule")}</CardTitle>
          <Clock className="h-5 w-5 text-purple-500" />
        </div>
      </CardHeader>
      <CardContent className="text-right space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{t("classes.periodName")}</p>
          <p className="text-lg font-semibold">
            {(schedule as ClassTimeSchedule).name}
          </p>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t("common.startTime")}</span>
            <span className="text-base font-semibold">{startTime12}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{t("common.endTime")}</span>
            <span className="text-base font-semibold">{endTime12}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
