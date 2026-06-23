import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getTodayDateKSA,
  convertToKSADate,
  getGregorianDateArabic,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronDown } from "lucide-react";
import { classReportApi, ClassReport } from "@/lib/classReportApi";
import { classApi, Class } from "@/lib/classApi";
import {
  classTimeScheduleApi,
  ClassTimeSchedule,
} from "@/lib/classTimeScheduleApi";
import ReportSummary from "@/components/teacher/ReportSummary";
import StatDetailModal from "@/components/classes/StatDetailModal";
import { Trainee } from "@/lib/traineeApi";
import { ClassCoverageExportPDF } from "@/components/classes/ClassCoverageExportPDF";
import { ClassCoverageExportExcel } from "@/components/classes/ClassCoverageExportExcel";

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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateKSA());
  const [selectedReportForSummary, setSelectedReportForSummary] =
    useState<ClassReport | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [statModalOpen, setStatModalOpen] = useState(false);
  const [statModalData, setStatModalData] = useState<{
    title: string;
    students: Array<{
      studentId: string;
      student: Trainee;
      className: string;
      teacherName: string;
      date: string;
    }>;
    color: "green" | "red" | "orange" | "blue";
  }>({
    title: "",
    students: [],
    color: "green",
  });
  const [expandMissingClasses, setExpandMissingClasses] = useState(false);
  const [expandSentClasses, setExpandSentClasses] = useState(false);

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
    return getGregorianDateArabic(dateString);
  };

  // Transform ClassReport to ReportSummary format
  const transformReportForSummary = (report: ClassReport) => {
    // Create a map of all students and their data
    const studentMap = new Map<string, any>();

    // Add present students
    (report.presentReports || []).forEach((sr) => {
      const studentId =
        typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
      studentMap.set(studentId, {
        studentId,
        student:
          typeof sr.studentId === "object"
            ? (sr.studentId as Trainee)
            : ({} as Trainee),
        status: "present" as const,
        violations: [],
      });
    });

    // Add absence students
    (report.absenceReports || []).forEach((sr) => {
      const studentId =
        typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
      studentMap.set(studentId, {
        studentId,
        student:
          typeof sr.studentId === "object"
            ? (sr.studentId as Trainee)
            : ({} as Trainee),
        status: "absent" as const,
        violations: [],
      });
    });

    // Add escape students
    (report.escapeReports || []).forEach((sr) => {
      const studentId =
        typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
      studentMap.set(studentId, {
        studentId,
        student:
          typeof sr.studentId === "object"
            ? (sr.studentId as Trainee)
            : ({} as Trainee),
        status: "escape" as const,
        violations: [],
      });
    });

    // Add violations
    (report.violationReports || []).forEach((sr) => {
      const studentId =
        typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
      if (studentMap.has(studentId)) {
        studentMap.get(studentId).violations.push({
          type: sr.violationType as 1 | 2 | 3 | 4,
          description: sr.violationDescription,
        });
      } else {
        // If student only has violations and no status, create entry with violations
        studentMap.set(studentId, {
          studentId,
          student:
            typeof sr.studentId === "object"
              ? (sr.studentId as Trainee)
              : ({} as Trainee),
          status: null,
          violations: [
            {
              type: sr.violationType as 1 | 2 | 3 | 4,
              description: sr.violationDescription,
            },
          ],
        });
      }
    });

    const studentReports = Array.from(studentMap.values());

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

  const handleStatClick = (
    statType: "present" | "absent" | "escape" | "violations" | "total",
  ) => {
    const students: Array<{
      studentId: string;
      student: Trainee;
      className: string;
      teacherName: string;
      date: string;
      violationType?: string;
      violationDescription?: string;
    }> = [];

    reports.forEach((report) => {
      const className =
        typeof report.classId === "object" ? report.classId.name : "—";
      const teacherName =
        typeof report.teacherId === "object" ? report.teacherId.username : "—";
      const dateStr = report.date;

      if (statType === "present" && report.presentReports) {
        report.presentReports.forEach((sr) => {
          const student =
            typeof sr.studentId === "object" ? sr.studentId : ({} as Trainee);
          const studentId =
            typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
          students.push({
            studentId,
            student: student as Trainee,
            className,
            teacherName,
            date: dateStr,
          });
        });
      } else if (statType === "absent" && report.absenceReports) {
        report.absenceReports.forEach((sr) => {
          const student =
            typeof sr.studentId === "object" ? sr.studentId : ({} as Trainee);
          const studentId =
            typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
          students.push({
            studentId,
            student: student as Trainee,
            className,
            teacherName,
            date: dateStr,
          });
        });
      } else if (statType === "escape" && report.escapeReports) {
        report.escapeReports.forEach((sr) => {
          const student =
            typeof sr.studentId === "object" ? sr.studentId : ({} as Trainee);
          const studentId =
            typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
          students.push({
            studentId,
            student: student as Trainee,
            className,
            teacherName,
            date: dateStr,
          });
        });
      } else if (statType === "violations" && report.violationReports) {
        report.violationReports.forEach((sr) => {
          const student =
            typeof sr.studentId === "object" ? sr.studentId : ({} as Trainee);
          const studentId =
            typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
          students.push({
            studentId,
            student: student as Trainee,
            className,
            teacherName,
            date: dateStr,
            violationType: sr.violationType,
            violationDescription: sr.violationDescription,
          });
        });
      } else if (statType === "total") {
        // Include all students from all arrays
        [
          ...(report.presentReports || []),
          ...(report.absenceReports || []),
          ...(report.escapeReports || []),
        ].forEach((sr) => {
          const student =
            typeof sr.studentId === "object" ? sr.studentId : ({} as Trainee);
          const studentId =
            typeof sr.studentId === "object" ? sr.studentId._id : sr.studentId;
          students.push({
            studentId,
            student: student as Trainee,
            className,
            teacherName,
            date: dateStr,
          });
        });
      }
    });

    // Remove duplicates based on studentId within same report
    const uniqueStudents: typeof students = [];
    const seen = new Set<string>();
    students.forEach((item) => {
      const key = `${item.studentId}-${item.className}-${item.date}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueStudents.push(item);
      }
    });

    let title = "";
    let color: "green" | "red" | "orange" | "blue" = "green";

    if (statType === "present") {
      title = "الطلاب الحاضرون";
      color = "green";
    } else if (statType === "absent") {
      title = "الطلاب الغائبون";
      color = "red";
    } else if (statType === "escape") {
      title = "الطلاب الذين لم يسجلوا خروج";
      color = "orange";
    } else if (statType === "violations") {
      title = "الطلاب المخالفين";
      color = "red";
    } else if (statType === "total") {
      title = "إجمالي الطلاب";
      color = "blue";
    }

    setStatModalData({ title, students: uniqueStudents, color });
    setStatModalOpen(true);
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
      <div className="grid grid-cols-5 gap-2 text-xs">
        <div className="text-center bg-blue-200 p-2 rounded">
          <div className="font-bold text-blue-700">
            {(report.stats?.present || 0) +
              (report.stats?.absence || 0) +
              (report.stats?.escapes || 0)}
          </div>
          <div className="text-muted-foreground">الإجمالي</div>
        </div>
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
          <div className="text-muted-foreground">لم يسجل خروج</div>
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
                      schedules.find((s) => s._id === a.schedule)?.start_time ||
                      "";
                  } else {
                    scheduleAStart = (a.schedule as any)?.start_time || "";
                  }

                  if (typeof b.schedule === "string") {
                    scheduleBStart =
                      schedules.find((s) => s._id === b.schedule)?.start_time ||
                      "";
                  } else {
                    scheduleBStart = (b.schedule as any)?.start_time || "";
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
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
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
            lang="en"
            value={selectedDate}
            onChange={(e) => setSelectedDate(convertToKSADate(e.target.value))}
            dir="rtl"
            className="flex-row-reverse"
          />
        </div>
      </div>

      {/* Class Coverage Summary */}
      {!loading &&
        (() => {
          const relevantClasses =
            selectedClass !== "all"
              ? classes.filter((c) => c._id === selectedClass)
              : classes;

          const reportedClassIds = new Set(
            reports
              .filter((r) => r.classId != null)
              .map((r) =>
                typeof r.classId === "object"
                  ? (r.classId as { _id: string })._id
                  : (r.classId as string),
              ),
          );

          const sentClasses = relevantClasses
            .filter((c) => reportedClassIds.has(c._id))
            .map((c) => ({
              _id: c._id,
              name: c.name,
              teacherName:
                c.assignedTeacherId && typeof c.assignedTeacherId === "object"
                  ? (c.assignedTeacherId as { username: string }).username
                  : "—",
            }));

          const missingClasses = relevantClasses
            .filter((c) => !reportedClassIds.has(c._id))
            .map((c) => ({
              _id: c._id,
              name: c.name,
              teacherName:
                c.assignedTeacherId && typeof c.assignedTeacherId === "object"
                  ? (c.assignedTeacherId as { username: string }).username
                  : "—",
            }));

          return (
            <div className="space-y-4" dir="rtl">
              {/* Summary cards + export buttons */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-blue-50 border-2 border-blue-200 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-blue-700">
                      {relevantClasses.length}
                    </span>
                    <span className="text-xs text-blue-600">إجمالي الفصول</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-green-700">
                      {sentClasses.length}
                    </span>
                    <span className="text-xs text-green-600">أرسلوا</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 border-2 border-red-200 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-red-700">
                      {missingClasses.length}
                    </span>
                    <span className="text-xs text-red-600">لم يرسلوا</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ClassCoverageExportPDF
                    sentClasses={sentClasses}
                    missingClasses={missingClasses}
                    date={selectedDate}
                  />
                  <ClassCoverageExportExcel
                    sentClasses={sentClasses}
                    missingClasses={missingClasses}
                    date={selectedDate}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Sent classes collapsible */}
                <Card className="border-2 border-green-200">
                  <CardHeader
                    className="pb-2 pt-3 px-4 cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => setExpandSentClasses(!expandSentClasses)}>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-green-700">
                        ✓ أرسلوا التقارير ({sentClasses.length})
                      </CardTitle>
                      <ChevronDown
                        className={`h-5 w-5 text-green-700 transition-transform ${expandSentClasses ? "rotate-180" : ""}`}
                      />
                    </div>
                  </CardHeader>
                  {expandSentClasses && (
                    <CardContent className="p-0">
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <Table className="border-collapse">
                          <TableHeader className="bg-green-600">
                            <TableRow>
                              <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                                اسم الفصل
                              </TableHead>
                              <TableHead className="text-center text-white font-bold py-3 px-4">
                                المعلم المسؤول
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sentClasses.length === 0 ? (
                              <TableRow className="hover:bg-green-50">
                                <TableCell
                                  colSpan={2}
                                  className="text-center py-8 px-4 text-muted-foreground border border-gray-300">
                                  لا يوجد فصول أرسلت تقارير
                                </TableCell>
                              </TableRow>
                            ) : (
                              sentClasses.map((cls, i) => (
                                <TableRow
                                  key={cls._id}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-green-50"} hover:bg-green-100`}>
                                  <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                                    {cls.name}
                                  </TableCell>
                                  <TableCell className="text-center py-2 px-4 border border-gray-300 text-muted-foreground">
                                    {cls.teacherName}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Missing classes collapsible */}
                <Card className="border-2 border-red-200">
                  <CardHeader
                    className="pb-2 pt-3 px-4 cursor-pointer hover:bg-red-50 transition-colors"
                    onClick={() =>
                      setExpandMissingClasses(!expandMissingClasses)
                    }>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold text-red-700">
                        ✗ لم يرسلوا التقارير ({missingClasses.length})
                      </CardTitle>
                      <ChevronDown
                        className={`h-5 w-5 text-red-700 transition-transform ${expandMissingClasses ? "rotate-180" : ""}`}
                      />
                    </div>
                  </CardHeader>
                  {expandMissingClasses && (
                    <CardContent className="p-0">
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <Table className="border-collapse">
                          <TableHeader className="bg-red-600">
                            <TableRow>
                              <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                                اسم الفصل
                              </TableHead>
                              <TableHead className="text-center text-white font-bold py-3 px-4">
                                المعلم المسؤول
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {missingClasses.length === 0 ? (
                              <TableRow className="hover:bg-red-50">
                                <TableCell
                                  colSpan={2}
                                  className="text-center py-8 px-4 text-muted-foreground border border-gray-300">
                                  جميع الفصول أرسلت تقاريرها ✓
                                </TableCell>
                              </TableRow>
                            ) : (
                              missingClasses.map((cls, i) => (
                                <TableRow
                                  key={cls._id}
                                  className={`${i % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-100`}>
                                  <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                                    {cls.name}
                                  </TableCell>
                                  <TableCell className="text-center py-2 px-4 border border-gray-300 text-muted-foreground">
                                    {cls.teacherName}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  )}
                </Card>
              </div>
            </div>
          );
        })()}

      {/* Summary Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          <div
            className="text-center space-y-1 bg-blue-100 border-2 border-blue-300 rounded-lg p-3 hover:bg-blue-200 cursor-pointer transition-colors"
            onClick={() => handleStatClick("total")}>
            <p className="text-2xl font-bold text-blue-600">
              {reports.reduce(
                (sum, r) =>
                  sum +
                  ((r.stats?.present || 0) +
                    (r.stats?.absence || 0) +
                    (r.stats?.escapes || 0)),
                0,
              )}
            </p>
            <p className="text-xs text-muted-foreground">الإجمالي</p>
          </div>
          <div
            className="text-center space-y-1 bg-green-100 border-2 border-green-300 rounded-lg p-3 hover:bg-green-200 cursor-pointer transition-colors"
            onClick={() => handleStatClick("present")}>
            <p className="text-2xl font-bold text-green-600">
              {reports.reduce((sum, r) => sum + (r.stats?.present || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">حاضرون</p>
          </div>
          <div
            className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3 hover:bg-red-200 cursor-pointer transition-colors"
            onClick={() => handleStatClick("absent")}>
            <p className="text-2xl font-bold text-red-600">
              {reports.reduce((sum, r) => sum + (r.stats?.absence || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">غياب</p>
          </div>
          <div
            className="text-center space-y-1 bg-orange-100 border-2 border-orange-300 rounded-lg p-3 hover:bg-orange-200 cursor-pointer transition-colors"
            onClick={() => handleStatClick("escape")}>
            <p className="text-2xl font-bold text-orange-600">
              {reports.reduce((sum, r) => sum + (r.stats?.escapes || 0), 0)}
            </p>
            <p className="text-xs text-muted-foreground">لم يسجل خروج</p>
          </div>
          <div
            className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3 hover:bg-red-200 cursor-pointer transition-colors"
            onClick={() => handleStatClick("violations")}>
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

      {/* Stat Detail Modal */}
      <StatDetailModal
        open={statModalOpen}
        onOpenChange={setStatModalOpen}
        title={statModalData.title}
        students={statModalData.students}
        color={statModalData.color}
      />
    </div>
  );
}
