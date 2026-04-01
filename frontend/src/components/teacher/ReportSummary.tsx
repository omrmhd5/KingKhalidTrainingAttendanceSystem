import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { Trainee } from "@/lib/traineeApi";
import { useState } from "react";

interface ReportSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stats: {
    present: number;
    absent: number;
    escape: number;
    violations: number;
  };
  studentReports: Array<{
    studentId: string;
    student: Trainee;
    status: "present" | "absent" | "escape" | null;
    violations: Array<{
      type: 1 | 2 | 3 | 4;
      description?: string;
    }>;
  }>;
}

const violationLabels: Record<1 | 2 | 3 | 4, string> = {
  1: "النوم في الفصل",
  2: "استخدام الجوال",
  3: "عدم احترام المسؤول",
  4: "مخالفة الأنظمة والتعليمات",
};

export default function ReportSummary({
  open,
  onOpenChange,
  stats,
  studentReports,
}: ReportSummaryProps) {
  const [activeTab, setActiveTab] = useState("violations");
  const [searchQuery, setSearchQuery] = useState("");

  const studentsPresent = studentReports.filter((r) => r.status === "present");
  const studentsWithViolations = studentReports.filter(
    (r) => r.violations.length > 0,
  );
  const studentsAbsent = studentReports.filter((r) => r.status === "absent");
  const studentsEscaped = studentReports.filter((r) => r.status === "escape");

  // Filter students based on search query (name, military_id, civil_id)
  const filterStudents = (students: typeof studentReports) => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (report) =>
        report.student.full_name.toLowerCase().includes(query) ||
        report.student.military_id.toLowerCase().includes(query) ||
        report.student.civil_id.toLowerCase().includes(query),
    );
  };

  const filteredPresent = filterStudents(studentsPresent);
  const filteredViolations = filterStudents(studentsWithViolations);
  const filteredAbsent = filterStudents(studentsAbsent);
  const filteredEscaped = filterStudents(studentsEscaped);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-right">ملخص التقرير</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* Statistics Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center space-y-1 bg-green-100 border-2 border-green-300 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">
                {stats.present}
              </p>
              <p className="text-xs text-muted-foreground">حاضرون</p>
            </div>
            <div className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">غياب</p>
            </div>
            <div className="text-center space-y-1 bg-orange-100 border-2 border-orange-300 rounded-lg p-3">
              <p className="text-2xl font-bold text-orange-600">
                {stats.escape}
              </p>
              <p className="text-xs text-muted-foreground">هروب</p>
            </div>
            <div className="text-center space-y-1 bg-red-100 border-2 border-red-300 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-600">
                {stats.violations}
              </p>
              <p className="text-xs text-muted-foreground">مخالفات</p>
            </div>
          </div>

          {/* Violations Detail with Tabs */}
          {(studentsPresent.length > 0 ||
            studentsWithViolations.length > 0 ||
            studentsAbsent.length > 0 ||
            studentsEscaped.length > 0) && (
            <div className="border-t pt-4 space-y-4">
              {/* Search Bar */}
              <Input
                placeholder="ابحث باسم الطالب أو رقم عسكري أو هوية..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-right"
                dir="rtl"
              />

              <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="present" className="text-xs">
                    <span>حاضرون</span>
                    <span className="mr-1 font-bold">
                      ({filteredPresent.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="violations" className="text-xs">
                    <span>المخالفات</span>
                    <span className="mr-1 font-bold">
                      ({filteredViolations.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="absent" className="text-xs">
                    <span>الغياب</span>
                    <span className="mr-1 font-bold">
                      ({filteredAbsent.length})
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="escape" className="text-xs">
                    <span>الهروب</span>
                    <span className="mr-1 font-bold">
                      ({filteredEscaped.length})
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Present Tab */}
                <TabsContent value="present" className="space-y-2 mt-4">
                  {filteredPresent.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredPresent.map((report) => (
                        <div
                          key={report.studentId}
                          className="bg-green-100 border-2 border-green-300 rounded-lg p-3 space-y-1 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {report.student.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.student.military_id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      لا يوجد طلاب حاضرين
                    </p>
                  )}
                </TabsContent>

                {/* Absent Tab */}
                <TabsContent value="absent" className="space-y-2 mt-4">
                  {filteredAbsent.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredAbsent.map((report) => (
                        <div
                          key={report.studentId}
                          className="bg-red-100 border-2 border-red-300 rounded-lg p-3 space-y-1 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {report.student.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.student.military_id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      لا يوجد غياب
                    </p>
                  )}
                </TabsContent>

                {/* Escape Tab */}
                <TabsContent value="escape" className="space-y-2 mt-4">
                  {filteredEscaped.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredEscaped.map((report) => (
                        <div
                          key={report.studentId}
                          className="bg-orange-100 border-2 border-orange-300 rounded-lg p-3 space-y-1 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {report.student.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.student.military_id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      لا يوجد هروب
                    </p>
                  )}
                </TabsContent>
                {/* Violations Tab */}
                <TabsContent value="violations" className="space-y-2 mt-4">
                  {filteredViolations.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredViolations.map((report) => (
                        <div
                          key={report.studentId}
                          className="bg-red-100 border-2 border-red-300 rounded-lg p-3 space-y-1 text-sm">
                          <div className="flex justify-between items-start">
                            <span className="font-medium">
                              {report.student.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {report.student.military_id}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {report.violations.map((violation, idx) => (
                              <Badge
                                key={idx}
                                variant="destructive"
                                className="text-xs">
                                {violationLabels[violation.type]}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      لا توجد مخالفات
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* All Clear Message */}
          {studentsPresent.length === 0 &&
            studentsWithViolations.length === 0 &&
            studentsAbsent.length === 0 &&
            studentsEscaped.length === 0 && (
              <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 text-right text-sm text-green-700">
                ✓ لم يتم تسجيل أي بيانات حتى الآن
              </div>
            )}
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
