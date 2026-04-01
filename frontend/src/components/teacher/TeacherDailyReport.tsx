import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { Class } from "@/lib/classApi";
import { Trainee } from "@/lib/traineeApi";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { classReportApi } from "@/lib/classReportApi";
import StudentReportRow from "@/components/teacher/StudentReportRow";
import QuickClearModal from "@/components/teacher/QuickClearModal";
import ReportSummary from "@/components/teacher/ReportSummary";
import TeacherClassCard from "@/components/teacher/TeacherClassCard";
import TeacherScheduleCard from "@/components/teacher/TeacherScheduleCard";

interface StudentReport {
  studentId: string;
  student: Trainee;
  status: "present" | "absent" | "escape" | null;
  violations: Array<{
    type: 1 | 2 | 3 | 4;
    description?: string;
  }>;
}

interface ClassTimeSchedule {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface TeacherDailyReportProps {
  classData: Class;
}

export default function TeacherDailyReport({
  classData,
}: TeacherDailyReportProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const today = format(new Date(), "yyyy-MM-dd");

  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [quickClearOpen, setQuickClearOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState("");
  const [existingReportId, setExistingReportId] = useState<string | null>(null);

  const schedule = classData.schedule as unknown as
    | ClassTimeSchedule
    | undefined;
  const students = classData.students as Trainee[];

  // Initialize student reports on mount
  useEffect(() => {
    if (students && students.length > 0) {
      const reports = students.map((student) => ({
        studentId: student._id,
        student,
        status: null,
        violations: [],
      }));
      setStudentReports(reports);
    }
  }, [students]);

  // Load existing report when date changes
  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setExistingReportId(null);

        // Initialize all students with null status (not present until report is found)
        const updatedReports = (classData.students as Trainee[]).map(
          (student) => ({
            studentId: student._id,
            student,
            status: null as "present" | "absent" | "escape" | null,
            violations: [] as Array<{
              type: 1 | 2 | 3 | 4;
              description?: string;
            }>,
          }),
        );

        // Query reports filtered by date then classId
        const reports = await classReportApi.getClassReports({
          classId: classData._id,
          startDate: selectedDate,
          endDate: selectedDate,
        });

        console.log("📥 API Response - Reports fetched:", reports);
        console.log("📥 Class ID searched:", classData._id);
        console.log("📥 Date searched:", selectedDate);

        if (reports && reports.length > 0) {
          const report = reports[0];
          console.log("✅ Report found:", report);

          setExistingReportId(report._id);

          // Create a map to track which students are in which category
          const presentStudentIds = new Set(
            report.presentReports?.map((r: any) =>
              typeof r.studentId === "string" ? r.studentId : r.studentId._id,
            ) || [],
          );

          const absenceStudentIds = new Set(
            report.absenceReports?.map((r: any) =>
              typeof r.studentId === "string" ? r.studentId : r.studentId._id,
            ) || [],
          );

          const escapeStudentIds = new Set(
            report.escapeReports?.map((r: any) =>
              typeof r.studentId === "string" ? r.studentId : r.studentId._id,
            ) || [],
          );

          const violationsByStudentId = new Map();
          report.violationReports?.forEach((v: any) => {
            const studentId =
              typeof v.studentId === "string" ? v.studentId : v.studentId._id;
            if (!violationsByStudentId.has(studentId)) {
              violationsByStudentId.set(studentId, []);
            }
            violationsByStudentId.get(studentId).push({
              type: v.violationType as 1 | 2 | 3 | 4,
              description: v.violationDescription,
            });
          });

          // Update student reports with loaded data
          updatedReports.forEach((reportUI) => {
            if (presentStudentIds.has(reportUI.studentId)) {
              reportUI.status = "present";
            } else if (absenceStudentIds.has(reportUI.studentId)) {
              reportUI.status = "absent";
            } else if (escapeStudentIds.has(reportUI.studentId)) {
              reportUI.status = "escape";
            }

            // Add violations from map
            if (violationsByStudentId.has(reportUI.studentId)) {
              reportUI.violations = violationsByStudentId.get(
                reportUI.studentId,
              );
            }
          });

          console.log(
            "\n✨ Final updated reports after loading 4 arrays:",
            updatedReports,
          );
        } else {
          console.log("⚠️ No reports found for this date");
        }

        console.log(
          "\n✨ Final updated reports before setState:",
          updatedReports,
        );
        setStudentReports(updatedReports);
      } catch (error) {
        console.error("Failed to load report:", error);
        // Reset to initial state on error - all null (not assigned)
        const reports = (classData.students as Trainee[]).map((student) => ({
          studentId: student._id,
          student,
          status: null as "present" | "absent" | "escape" | null,
          violations: [] as Array<{
            type: 1 | 2 | 3 | 4;
            description?: string;
          }>,
        }));
        setStudentReports(reports);
      } finally {
        setLoading(false);
      }
    };

    if (classData._id && classData.students) {
      loadReport();
    }
  }, [selectedDate, classData._id, classData.students]);

  const handleStatusChange = (
    studentId: string,
    status: "present" | "absent" | "escape",
  ) => {
    setStudentReports((prev) =>
      prev.map((report) =>
        report.studentId === studentId ? { ...report, status } : report,
      ),
    );
  };

  // Debug effect to log studentReports state after it changes
  useEffect(() => {
    console.log(
      "\n🎨 UI State - StudentReports updated:",
      studentReports.map((r) => ({
        studentId: r.studentId,
        name: r.student.full_name,
        status: r.status,
        violations: r.violations,
      })),
    );
  }, [studentReports]);

  const handleViolationAdd = (
    studentId: string,
    violationType: 1 | 2 | 3 | 4,
    description?: string,
  ) => {
    setStudentReports((prev) =>
      prev.map((report) =>
        report.studentId === studentId
          ? {
              ...report,
              violations: [
                ...report.violations,
                { type: violationType, description },
              ],
            }
          : report,
      ),
    );
  };

  const handleViolationRemove = (studentId: string, violationIndex: number) => {
    setStudentReports((prev) =>
      prev.map((report) =>
        report.studentId === studentId
          ? {
              ...report,
              violations: report.violations.filter(
                (_, i) => i !== violationIndex,
              ),
            }
          : report,
      ),
    );
  };

  const handleQuickClear = () => {
    setStudentReports((prev) =>
      prev.map((report) => ({
        ...report,
        status: "present",
        violations: [],
      })),
    );
    setQuickClearOpen(false);
    toast({
      title: "تم",
      description: "تم تعليم الجميع حاضرون بدون مشاكل",
    });
  };

  const handleReset = () => {
    setStudentReports((prev) =>
      prev.map((report) => ({
        ...report,
        status: null,
        violations: [],
      })),
    );
    setShowSummary(false);
    toast({
      title: "تم",
      description: "تم إعادة تعيين التقرير",
    });
  };

  const handleSubmit = async () => {
    // Check if all students have status assigned
    const incomplete = studentReports.some((r) => r.status === null);
    if (incomplete) {
      toast({
        title: "خطأ",
        description: "الرجاء تحديد حالة جميع الطلاب",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Transform student reports for API - separate into 4 arrays
      const presentReports: any[] = [];
      const absenceReports: any[] = [];
      const escapeReports: any[] = [];
      const violationReports: any[] = [];

      studentReports.forEach((report) => {
        // Add to status-specific arrays
        if (report.status === "present") {
          presentReports.push({
            studentId: report.studentId,
          });
        } else if (report.status === "absent") {
          absenceReports.push({
            studentId: report.studentId,
          });
        } else if (report.status === "escape") {
          escapeReports.push({
            studentId: report.studentId,
          });
        }

        // Add violation entries (can exist with any status)
        if (report.violations.length > 0) {
          report.violations.forEach((violation) => {
            violationReports.push({
              studentId: report.studentId,
              violationType: violation.type,
              violationDescription: violation.description || null,
            });
          });
        }
      });

      console.log("🚀 Submitting to API - 4 arrays:", {
        presentReports,
        absenceReports,
        escapeReports,
        violationReports,
      });

      const reportData = {
        date: selectedDate,
        teacherId: user?.id || "",
        classId: classData._id,
        schedule:
          typeof classData.schedule === "string"
            ? classData.schedule
            : (classData.schedule as any)?._id || "",
        presentReports,
        absenceReports,
        escapeReports,
        violationReports,
      };

      console.log("🚀 Full reportData being sent:", reportData);

      // Create or update based on whether report exists
      if (existingReportId) {
        await classReportApi.updateClassReport(existingReportId, reportData);
        console.log("✅ Report updated successfully");
        toast({
          title: "نجاح",
          description: "تم تحديث التقرير بنجاح",
        });
      } else {
        const response = await classReportApi.createClassReport(reportData);
        console.log("✅ Report created successfully:", response);
        setExistingReportId(response.report._id);
        toast({
          title: "نجاح",
          description: "تم إرسال التقرير بنجاح",
        });
      }

      // Don't reset - keep showing submitted data
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "فشل إرسال التقرير";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Check if all students have status assigned
  const isComplete = studentReports.every((r) => r.status !== null);

  // Filter students based on search query
  const filteredStudents = studentReports.filter((report) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.student.full_name.toLowerCase().includes(query) ||
      report.student.military_id.toLowerCase().includes(query) ||
      report.student.civil_id.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const stats = {
    present: studentReports.filter((r) => r.status === "present").length,
    absent: studentReports.filter((r) => r.status === "absent").length,
    escape: studentReports.filter((r) => r.status === "escape").length,
    violations: studentReports.reduce((sum, r) => sum + r.violations.length, 0),
  };

  // Debug: Log stats calculation
  console.log("📊 Stats Summary:", stats);
  console.log("📊 Status breakdown:", {
    presentCount: studentReports.filter((r) => r.status === "present").length,
    absentCount: studentReports.filter((r) => r.status === "absent").length,
    escapeCount: studentReports.filter((r) => r.status === "escape").length,
    violationCount: studentReports.reduce(
      (sum, r) => sum + r.violations.length,
      0,
    ),
    studentsWithViolations: studentReports
      .filter((r) => r.violations.length > 0)
      .map((r) => ({ name: r.student.full_name, violations: r.violations })),
  });

  return (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Class and Schedule Info Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TeacherClassCard
          classData={classData}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendanceMap={new Map()}
          reportStats={stats}
        />
        <TeacherScheduleCard classData={classData} />
      </div>

      {/* Quick Clear Button */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <Button
            onClick={() => setQuickClearOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold">
            ✓ الجميع حاضرون - لا توجد مشاكل
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            اضغط إذا كان جميع الطلاب حاضرين وبدون أي مشاكل
          </p>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader className="text-right space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>
              الطلاب ({filteredStudents.length}/{studentReports.length})
            </CardTitle>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحميل...
              </div>
            )}
          </div>
          <Input
            placeholder="ابحث باسم الطالب أو رقم عسكري أو هوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-right"
            dir="rtl"
            disabled={loading}
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((report) => (
                <StudentReportRow
                  key={report.studentId}
                  report={report}
                  onStatusChange={handleStatusChange}
                  onViolationAdd={handleViolationAdd}
                  onViolationRemove={handleViolationRemove}
                />
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                لا توجد نتائج تطابق البحث
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Preview */}
      <ReportSummary
        open={showSummary}
        onOpenChange={setShowSummary}
        stats={stats}
        studentReports={studentReports}
      />

      {/* Action Buttons */}
      <div className="flex gap-2 sticky bottom-4">
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1"
          disabled={submitting || loading}>
          <RotateCcw className="ml-2 h-4 w-4" />
          إعادة تعيين
        </Button>
        <Button
          onClick={() => setShowSummary(!showSummary)}
          variant="outline"
          className="flex-1"
          disabled={!isComplete || submitting || loading}>
          عرض الملخص
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!isComplete || submitting || loading}>
          {submitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري {existingReportId ? "التحديث" : "الإرسال"}...
            </>
          ) : (
            <>
              <Send className="ml-2 h-4 w-4" />
              {existingReportId ? "تحديث التقرير" : "إرسال التقرير"}
            </>
          )}
        </Button>
      </div>

      {/* Quick Clear Modal */}
      <QuickClearModal
        open={quickClearOpen}
        onOpenChange={setQuickClearOpen}
        onConfirm={handleQuickClear}
      />
    </div>
  );
}
