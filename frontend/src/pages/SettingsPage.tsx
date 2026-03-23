import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersManagementTab } from "@/components/settings/UsersManagementTab";
import { ShiftsManagementTab } from "@/components/settings/ShiftsManagementTab";
import { RanksManagementTab } from "@/components/settings/RanksManagementTab";
import { SpecializationsManagementTab } from "@/components/settings/SpecializationsManagementTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem("settingsActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("settingsActiveTab", value);
  };

  return (
    <div className="space-y-6 animate-slide-in" dir="rtl">
      <h1 className="text-2xl font-bold text-right">الإعدادات</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
        <TabsList>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="shifts">ادارة الشفتات</TabsTrigger>
          <TabsTrigger value="ranks">إدارة الرتب</TabsTrigger>
          <TabsTrigger value="specializations">إدارة التخصصات</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users">
          <UsersManagementTab />
        </TabsContent>

        {/* Shifts */}
        <TabsContent value="shifts">
          <ShiftsManagementTab />
        </TabsContent>

        {/* Ranks */}
        <TabsContent value="ranks">
          <RanksManagementTab />
        </TabsContent>

        {/* Specializations */}
        <TabsContent value="specializations">
          <SpecializationsManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
