import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { HoursTab } from "@/components/reports/HoursTab";
import { AbsencesTab } from "@/components/reports/AbsencesTab";
import { EscapesTab } from "@/components/reports/EscapesTab";
import { attendanceApi, AttendanceRecord } from "@/lib/attendanceApi";

export default function ReportsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [hoursCount, setHoursCount] = useState(0);
  const [absencesCount, setAbsencesCount] = useState(0);
  const [escapesCount, setEscapesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        const response = await attendanceApi.getAttendanceByDate(date);
        const records = response.records || [];

        // Count hours (all attendance records with entry_time)
        const hours = records.filter(
          (r: AttendanceRecord) => r.entry_time,
        ).length;

        // Count absences (records without entry_time)
        const absences = records.filter(
          (r: AttendanceRecord) => !r.entry_time,
        ).length;

        // Count escapes (placeholder for future implementation)
        const escapes = 0;

        setHoursCount(hours);
        setAbsencesCount(absences);
        setEscapesCount(escapes);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
        setHoursCount(0);
        setAbsencesCount(0);
        setEscapesCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    if (date) {
      fetchCounts();
    }
  }, [date]);

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold">التقارير</h1>
        <p className="text-sm text-muted-foreground">
          تقارير الحضور والبيانات اليومية
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm">التاريخ</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-44 justify-end"
        />
      </div>

      <Tabs defaultValue="hours" dir="rtl">
        <TabsList>
          <TabsTrigger value="hours">الساعات ({hoursCount})</TabsTrigger>
          <TabsTrigger value="absences">الغيابات ({absencesCount})</TabsTrigger>
          <TabsTrigger value="escapes">الهروب ({escapesCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <HoursTab date={date} />
        </TabsContent>

        <TabsContent value="absences">
          <AbsencesTab date={date} />
        </TabsContent>

        <TabsContent value="escapes">
          <EscapesTab date={date} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
