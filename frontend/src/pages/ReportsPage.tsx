import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { HoursTab } from "@/components/reports/HoursTab";
import { AbsencesTab } from "@/components/reports/AbsencesTab";
import { EscapesTab } from "@/components/reports/EscapesTab";
import { LateTab } from "@/components/reports/LateTab";
import { ReportsExportExcel } from "@/components/reports/ExportExcel";
import { ReportsExportPDF } from "@/components/reports/ExportPDF";
import {
  attendanceApi,
  AttendanceRecord,
  Absence,
  Escape,
  Late,
} from "@/lib/attendanceApi";

export default function ReportsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [activeTab, setActiveTab] = useState("hours");
  const [hoursCount, setHoursCount] = useState(0);
  const [absencesCount, setAbsencesCount] = useState(0);
  const [escapesCount, setEscapesCount] = useState(0);
  const [latesCount, setLatesCount] = useState(0);
  const [hoursData, setHoursData] = useState<AttendanceRecord[]>([]);
  const [absencesList, setAbsencesList] = useState<Absence[]>([]);
  const [escapesList, setEscapesList] = useState<Escape[]>([]);
  const [latesList, setLatesList] = useState<Late[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved tab from localStorage
    const savedTab = localStorage.getItem("reportsActiveTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("reportsActiveTab", value);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        const [attendanceRes, absencesRes, escapesRes, latesRes] =
          await Promise.all([
            attendanceApi.getAttendanceByDate(date),
            attendanceApi.getAbsences(date),
            attendanceApi.getEscapes(date),
            attendanceApi.getLates(date),
          ]);

        const records = attendanceRes.records || [];

        // Count hours (all attendance records with entry_time)
        const hours = records.filter(
          (r: AttendanceRecord) => r.entry_time,
        ).length;

        // Count absences from API
        const absences = absencesRes.absenceCount || 0;

        // Count escapes from API
        const escapes = escapesRes.escapeCount || 0;

        // Count lates from API
        const lates = latesRes.lateCount || 0;

        setHoursCount(hours);
        setAbsencesCount(absences);
        setEscapesCount(escapes);
        setLatesCount(lates);
        setHoursData(records);
        setAbsencesList(absencesRes.absences || []);
        setEscapesList(escapesRes.escapes || []);
        setLatesList(latesRes.lates || []);
      } catch (error) {
        console.error("Failed to fetch counts:", error);
        setHoursCount(0);
        setAbsencesCount(0);
        setEscapesCount(0);
        setLatesCount(0);
        setHoursData([]);
        setAbsencesList([]);
        setEscapesList([]);
        setLatesList([]);
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

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-sm">التاريخ</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-44 justify-end"
          />
        </div>
        <div className="flex gap-2">
          {activeTab === "hours" && (
            <>
              <ReportsExportExcel data={hoursData} type="hours" />
              <ReportsExportPDF data={hoursData} type="hours" />
            </>
          )}
          {activeTab === "absences" && (
            <>
              <ReportsExportExcel data={absencesList} type="absences" />
              <ReportsExportPDF data={absencesList} type="absences" />
            </>
          )}
          {activeTab === "escapes" && (
            <>
              <ReportsExportExcel data={escapesList} type="escapes" />
              <ReportsExportPDF data={escapesList} type="escapes" />
            </>
          )}
          {activeTab === "lates" && (
            <>
              <ReportsExportExcel data={latesList} type="lates" />
              <ReportsExportPDF data={latesList} type="lates" />
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} dir="rtl">
        <TabsList>
          <TabsTrigger value="hours">الساعات ({hoursCount})</TabsTrigger>
          <TabsTrigger value="absences">الغيابات ({absencesCount})</TabsTrigger>
          <TabsTrigger value="lates">التأخيرات ({latesCount})</TabsTrigger>
          <TabsTrigger value="escapes">الهروب ({escapesCount})</TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <HoursTab date={date} />
        </TabsContent>

        <TabsContent value="absences">
          <AbsencesTab
            date={date}
            absences={absencesList}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="lates">
          <LateTab date={date} lates={latesList} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="escapes">
          <EscapesTab date={date} escapes={escapesList} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
