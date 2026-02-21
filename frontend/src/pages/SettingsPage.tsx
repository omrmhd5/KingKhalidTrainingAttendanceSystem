import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShiftsManagementTab } from "@/components/settings/ShiftsManagementTab";
import { RanksManagementTab } from "@/components/settings/RanksManagementTab";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-slide-in" dir="rtl">
      <h1 className="text-2xl font-bold text-right">الإعدادات</h1>

      <Tabs defaultValue="shifts" dir="rtl">
        <TabsList>
          <TabsTrigger value="shifts">ادارة الشفتات</TabsTrigger>
          <TabsTrigger value="ranks">إدارة الرتب</TabsTrigger>
        </TabsList>

        {/* Shifts */}
        <TabsContent value="shifts">
          <ShiftsManagementTab />
        </TabsContent>

        {/* Ranks */}
        <TabsContent value="ranks">
          <RanksManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
