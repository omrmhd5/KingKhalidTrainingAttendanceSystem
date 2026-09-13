import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersManagementTab } from "@/components/settings/UsersManagementTab";
import { ShiftsManagementTab } from "@/components/settings/ShiftsManagementTab";
import { RanksManagementTab } from "@/components/settings/RanksManagementTab";
import { SpecializationsManagementTab } from "@/components/settings/SpecializationsManagementTab";

export default function SettingsPage() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const { t } = useTranslation();

  // Only admins can access settings
  if (role !== "admin") {
    return <Navigate to="/" replace />;
  }

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
    <div className="space-y-6 animate-slide-in">
      <h1 className="text-2xl font-bold text-start">{t("settings.title")}</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="users">{t("settings.users")}</TabsTrigger>
          <TabsTrigger value="shifts">{t("settings.shifts")}</TabsTrigger>
          <TabsTrigger value="ranks">{t("settings.ranks")}</TabsTrigger>
          <TabsTrigger value="specializations">
            {t("settings.specializations")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersManagementTab />
        </TabsContent>

        <TabsContent value="shifts">
          <ShiftsManagementTab />
        </TabsContent>

        <TabsContent value="ranks">
          <RanksManagementTab />
        </TabsContent>

        <TabsContent value="specializations">
          <SpecializationsManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
