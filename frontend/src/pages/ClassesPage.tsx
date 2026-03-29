import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassesTimeScheduleTab } from "@/components/classes/ClassesTimeScheduleTab";
import { ClassesManagementTab } from "@/components/classes/ClassesManagementTab";
import { TeachersManagementTab } from "@/components/classes/TeachersManagementTab";
import { ClassDashboardTab } from "@/components/classes/ClassDashboardTab";

export default function ClassesPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Load from localStorage or default to "schedule"
    const savedTab = localStorage.getItem("classesActiveTab");
    return savedTab || "schedule";
  });

  const canWrite = role === "admin";

  // Save to localStorage when tab changes
  useEffect(() => {
    localStorage.setItem("classesActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">الفصول الدراسية</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          إدارة الفصول والمعلمين والطلاب وجداول الفصول
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إدارة الفصول والمعلمين والجداول</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule">الجداول</TabsTrigger>
              <TabsTrigger value="classes">الفصول</TabsTrigger>
              <TabsTrigger value="teachers">المعلمون</TabsTrigger>
              <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="mt-6">
              <ClassesTimeScheduleTab />
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              <ClassesManagementTab canWrite={canWrite} />
            </TabsContent>

            <TabsContent value="teachers" className="mt-6">
              <TeachersManagementTab canWrite={canWrite} />
            </TabsContent>

            <TabsContent value="dashboard" className="mt-6">
              <ClassDashboardTab canWrite={canWrite} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
