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
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedReportForSummary, setSelectedReportForSummary] =
    useState<ClassReport | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    // Set date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    loadClasses();
  }, []);

  useEffect(() => {
    loadReports();
  }, [selectedClass, selectedDate]);

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
      stats: report.stats || {
        present: 0,
        absence: 0,
        escapes: 0,
        violations: 0,
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
      className="border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition">
      <div className="flex justify-between items-start mb-2" dir="rtl">
        <div>
          <div className="font-medium">
            الجدول:{" "}
            {typeof report.schedule === "object" ? report.schedule.name : "—"}
          </div>
          <div className="text-sm text-muted-foreground">
            الفصل:{" "}
            {typeof report.classId === "object" ? report.classId.name : "—"}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 text-xs">
        <div className="text-center bg-green-50 p-2 rounded">
          <div className="font-bold text-green-600">
            {report.stats?.present || 0}
          </div>
          <div className="text-muted-foreground">حاضرين</div>
        </div>
        <div className="text-center bg-red-50 p-2 rounded">
          <div className="font-bold text-red-600">
            {report.stats?.absence || 0}
          </div>
          <div className="text-muted-foreground">غياب</div>
        </div>
        <div className="text-center bg-orange-50 p-2 rounded">
          <div className="font-bold text-orange-600">
            {report.stats?.escapes || 0}
          </div>
          <div className="text-muted-foreground">هروب</div>
        </div>
        <div className="text-center bg-red-50 p-2 rounded">
          <div className="font-bold text-red-600">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
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
              {classes.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name}
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
