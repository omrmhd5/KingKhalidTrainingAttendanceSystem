import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { classReportApi, ClassReport } from "@/lib/classReportApi";
import { classApi, Class } from "@/lib/classApi";
import {
  classTimeScheduleApi,
  ClassTimeSchedule,
} from "@/lib/classTimeScheduleApi";
import ReportSummary from "@/components/teacher/ReportSummary";
import { Trainee } from "@/lib/traineeApi";

interface ClassReportTabProps {
  canWrite?: boolean;
}

export function ClassReportTab({ canWrite = true }: ClassReportTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ClassReport[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<ClassTimeSchedule[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSchedule, setSelectedSchedule] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedReportForSummary, setSelectedReportForSummary] =
    useState<ClassReport | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    loadClasses();
    loadSchedules();
  }, []);

  useEffect(() => {
    loadReports();
  }, [selectedClass, selectedSchedule, selectedDate]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await classApi.getAllClasses();
      setClasses(classesData);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الفصول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const schedulesData = await classTimeScheduleApi.getAllSchedules();
      setSchedules(schedulesData);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الجداول الزمنية",
        variant: "destructive",
      });
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      const filters: any = {
        startDate: selectedDate,
        endDate: selectedDate,
      };

      if (selectedClass && selectedClass !== "all") {
        filters.classId = selectedClass;
      }

      if (selectedSchedule && selectedSchedule !== "all") {
        filters.scheduleId = selectedSchedule;
      }

      const data = await classReportApi.getClassReports(filters);
      setReports(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
  };

  // Transform ClassReport to ReportSummary format
  const transformReportForSummary = (report: ClassReport) => {
    const studentReports = report.studentReports.map((sr) => ({
      studentId:
        typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId,
      student:
        typeof sr.studentId === "object"
          ? (sr.studentId as Trainee)
          : ({} as Trainee),
      status: (sr.status === "absent" || sr.status === "escape"
        ? sr.status
        : null) as "present" | "absent" | "escape" | null,
      violations:
        sr.status === "violation"
          ? [
              {
                type: sr.violationType as 1 | 2 | 3 | 4,
                description: sr.violationDescription,
              },
            ]
          : [],
    }));

    return {
      stats: {
        present: report.stats?.present || 0,
        absent: report.stats?.absence || 0,
        escape: report.stats?.escapes || 0,
        violations: report.stats?.violations || 0,
      },
      studentReports,
    };
  };

  const handleReportClick = (report: ClassReport) => {
    setSelectedReportForSummary(report);
    setSummaryOpen(true);
  };

  const renderReportCard = (report: ClassReport) => (
    <div
      key={report._id}
      onClick={() => handleReportClick(report)}
      className="border-2 border-blue-100 rounded-lg p-4 cursor-pointer bg-blue-50 hover:bg-blue-100 transition">
      <div className="space-y-2 mb-4 pb-3 border-b" dir="rtl">
        {/* Row 1: Schedule */}
        <div className="text-sm font-semibold">
          {typeof report.schedule === "object" ? report.schedule.name : "—"}
        </div>

        {/* Row 2: Class and Teacher */}
        <div className="flex items-center gap-3 text-sm">
          <span>
            {typeof report.classId === "object" ? report.classId.name : "—"}
          </span>
          <span className="text-gray-400">|</span>
          <span>
            {typeof report.teacherId === "object"
              ? report.teacherId.username
              : "—"}
          </span>
        </div>

        {/* Row 3: Date */}
        <div className="text-xs text-muted-foreground">
          {new Date(report.date).toLocaleDateString("en-US")}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center bg-green-200 p-2 rounded">
          <div className="font-bold text-green-700">
            {report.stats?.present || 0}
          </div>
          <div className="text-muted-foreground">حاضرين</div>
        </div>
        <div className="text-center bg-red-200 p-2 rounded">
          <div className="font-bold text-red-700">
            {report.stats?.absence || 0}
          </div>
          <div className="text-muted-foreground">غياب</div>
        </div>
        <div className="text-center bg-orange-200 p-2 rounded">
          <div className="font-bold text-orange-700">
            {report.stats?.escapes || 0}
          </div>
          <div className="text-muted-foreground">هروب</div>
        </div>
        <div className="text-center bg-red-200 p-2 rounded">
          <div className="font-bold text-red-700">
            {report.stats?.violations || 0}
          </div>
          <div className="text-muted-foreground">مخالفات</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
        <div>
          <label className="text-sm font-medium text-right block mb-2">
            الفصل
          </label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger dir="rtl">
              <SelectValue placeholder="اختر الفصل" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">الكل</SelectItem>
              {[...classes]
                .sort((a, b) => {
                  let scheduleAStart = "";
                  let scheduleBStart = "";

                  if (typeof a.schedule === "string") {
                    scheduleAStart =
                      schedules.find((s) => s._id === a.schedule)
                        ?.start_time || "";
                  } else {
                    scheduleAStart =
                      (a.schedule as any)?.start_time || "";
                  }

                  if (typeof b.schedule === "string") {
                    scheduleBStart =
                      schedules.find((s) => s._id === b.schedule)
                        ?.start_time || "";
                  } else {
                    scheduleBStart =
                      (b.schedule as any)?.start_time || "";
                  }

                  return scheduleAStart.localeCompare(scheduleBStart);
                })
                .map((cls) => (
                  <SelectItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-right block mb-2">
            الجدول الزمني
          </label>
          <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
            <SelectTrigger dir="rtl">
              <SelectValue placeholder="اختر الجدول الزمني" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">الكل</SelectItem>
              {[...schedules]
                .sort((a, b) =>
                  a.start_time.localeCompare(b.start_time),
                )
                .map((schedule) => (
                  <SelectItem key={schedule._id} value={schedule._id}>
                    {schedule.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-right block mb-2">
            التاريخ
          </label>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            dir="rtl"
            className="flex-row-reverse"
          />
        </div>
      </div>

      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center space-y-1 bg-green-100 border-2 border-green-300 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-600">
              {reports.reduce((sum, r) => sum + (r.stats?.present || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">حاضرون</p>
          </div>
          <div className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3">
            <p className="text-2xl font-bold text-red-600">
              {reports.reduce((sum, r) => sum + (r.stats?.absence || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">غياب</p>
          </div>
          <div className="text-center space-y-1 bg-orange-100 border-2 border-orange-300 rounded-lg p-3">
            <p className="text-2xl font-bold text-orange-600">
              {reports.reduce((sum, r) => sum + (r.stats?.escapes || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">هروب</p>
          </div>
          <div className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3">
            <p className="text-2xl font-bold text-red-600">
              {reports.reduce((sum, r) => sum + (r.stats?.violations || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">مخالفات</p>
          </div>
        </div>
      )}

      {/* Reports List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تقارير
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => renderReportCard(report))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Summary Dialog */}
      {selectedReportForSummary && (
        <ReportSummary
          open={summaryOpen}
          onOpenChange={setSummaryOpen}
          stats={transformReportForSummary(selectedReportForSummary).stats}
          studentReports={
            transformReportForSummary(selectedReportForSummary).studentReports
          }
        />
      )}
    </div>
  );
}
