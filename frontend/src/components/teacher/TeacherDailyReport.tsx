import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, RotateCcw } from "lucide-react";
import { Class } from "@/lib/classApi";
import { Trainee } from "@/lib/traineeApi";
import { useToast } from "@/hooks/use-toast";
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
  const today = format(new Date(), "yyyy-MM-dd");

  const [studentReports, setStudentReports] = useState<StudentReport[]>([]);
  const [quickClearOpen, setQuickClearOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [searchQuery, setSearchQuery] = useState("");

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
      // Placeholder for API call - will be added later
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "نجاح",
        description: "تم إرسال التقرير بنجاح",
      });

      // Reset after successful submission
      handleReset();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إرسال التقرير",
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

  return (
    <div className="space-y-4 p-4" dir="rtl">
      {/* Class and Schedule Info Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TeacherClassCard
          classData={classData}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          attendanceMap={new Map()}
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
          <CardTitle>
            الطلاب ({filteredStudents.length}/{studentReports.length})
          </CardTitle>
          <Input
            placeholder="ابحث باسم الطالب أو رقم عسكري أو هوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-right"
            dir="rtl"
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
          disabled={submitting}>
          <RotateCcw className="ml-2 h-4 w-4" />
          إعادة تعيين
        </Button>
        <Button
          onClick={() => setShowSummary(!showSummary)}
          variant="outline"
          className="flex-1"
          disabled={!isComplete || submitting}>
          عرض الملخص
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
          disabled={!isComplete || submitting}>
          {submitting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الإرسال...
            </>
          ) : (
            <>
              <Send className="ml-2 h-4 w-4" />
              إرسال التقرير
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
