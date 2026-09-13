import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassesTimeScheduleTab } from "@/components/classes/ClassesTimeScheduleTab";
import { ClassesManagementTab } from "@/components/classes/ClassesManagementTab";
import { TeachersManagementTab } from "@/components/classes/TeachersManagementTab";
import { ClassReportTab } from "@/components/classes/ClassReportTab";

export default function ClassesPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("classesActiveTab");
    return savedTab || "schedule";
  });

  const canWrite = role === "admin";

  useEffect(() => {
    localStorage.setItem("classesActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">{t("classes.title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("classes.subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("classes.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">{t("classes.schedule")}</TabsTrigger>
              <TabsTrigger value="classes">{t("classes.classes")}</TabsTrigger>
              <TabsTrigger value="teachers">{t("classes.teachers")}</TabsTrigger>
              <TabsTrigger value="reports">{t("classes.reports")}</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="mt-6">
              <ClassesTimeScheduleTab canWrite={canWrite} />
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              <ClassesManagementTab canWrite={canWrite} />
            </TabsContent>

            <TabsContent value="teachers" className="mt-6">
              <TeachersManagementTab canWrite={canWrite} />
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <ClassReportTab canWrite={canWrite} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
