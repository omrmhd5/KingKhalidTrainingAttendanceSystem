import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight, AlertCircle, X } from "lucide-react";
import { Trainee } from "@/lib/traineeApi";
import ViolationModal from "@/components/teacher/ViolationModal";

interface StudentReportRowProps {
  report: {
    studentId: string;
    student: Trainee;
    status: "present" | "absent" | "escape" | null;
    violations: Array<{
      type: 1 | 2 | 3 | 4;
      description?: string;
    }>;
  };
  onStatusChange: (
    studentId: string,
    status: "present" | "absent" | "escape",
  ) => void;
  onViolationAdd: (
    studentId: string,
    type: 1 | 2 | 3 | 4,
    description?: string,
  ) => void;
  onViolationRemove: (studentId: string, index: number) => void;
}

const violationLabels: Record<1 | 2 | 3 | 4, string> = {
  1: "نوم",
  2: "جوال",
  3: "عدم احترام",
  4: "مخالفة أنظمة",
};

export default function StudentReportRow({
  report,
  onStatusChange,
  onViolationAdd,
  onViolationRemove,
}: StudentReportRowProps) {
  const [violationModalOpen, setViolationModalOpen] = useState(false);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "present":
        return "bg-green-100 border-green-300";
      case "absent":
        return "bg-red-100 border-red-300";
      case "escape":
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <>
      <div
        className={`p-3 rounded-lg border-2 transition-colors ${getStatusColor(report.status)}`}
        dir="rtl">
        {/* Student Info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
            <p className="font-semibold text-sm">{report.student.full_name}</p>
            <p className="text-xs text-muted-foreground">
              {report.student.military_id} • {report.student.civil_id}
            </p>
          </div>

          {/* Status Badge */}
          {report.status && (
            <Badge
              className={`${
                report.status === "present"
                  ? "bg-green-600"
                  : report.status === "absent"
                    ? "bg-red-600"
                    : "bg-orange-600"
              }`}>
              {report.status === "present"
                ? "حاضر"
                : report.status === "absent"
                  ? "غايب"
                  : "لم يسجل خروج"}
            </Badge>
          )}
        </div>

        {/* Violations */}
        {report.violations.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {report.violations.map((violation, idx) => (
              <Badge
                key={idx}
                variant="destructive"
                className="text-xs flex items-center gap-1">
                {violationLabels[violation.type]}
                <button
                  onClick={() => onViolationRemove(report.studentId, idx)}
                  className="text-white hover:text-gray-200">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Present */}
          <Button
            size="sm"
            variant={report.status === "present" ? "default" : "outline"}
            className={
              report.status === "present"
                ? "bg-green-600 hover:bg-green-700"
                : ""
            }
            onClick={() => onStatusChange(report.studentId, "present")}>
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">حاضر</span>
          </Button>

          {/* Absent */}
          <Button
            size="sm"
            variant={report.status === "absent" ? "default" : "outline"}
            className={
              report.status === "absent" ? "bg-red-600 hover:bg-red-700" : ""
            }
            onClick={() => onStatusChange(report.studentId, "absent")}>
            <XCircle className="h-4 w-4" />
            <span className="hidden sm:inline">غايب</span>
          </Button>

          {/* Escape */}
          <Button
            size="sm"
            variant={report.status === "escape" ? "default" : "outline"}
            className={
              report.status === "escape"
                ? "bg-orange-600 hover:bg-orange-700"
                : ""
            }
            onClick={() => onStatusChange(report.studentId, "escape")}>
            <ArrowRight className="h-4 w-4" />
            <span className="hidden sm:inline">لم يسجل خروج</span>
          </Button>

          {/* Violation */}
          <Button
            size="sm"
            variant={report.violations.length > 0 ? "default" : "outline"}
            className={
              report.violations.length > 0
                ? "bg-red-600 hover:bg-red-700"
                : "text-red-600 hover:text-red-700"
            }
            onClick={() => setViolationModalOpen(true)}>
            <AlertCircle className="h-4 w-4" />
            <span className="hidden sm:inline">مخالفة</span>
          </Button>
        </div>
      </div>

      {/* Violation Modal */}
      <ViolationModal
        open={violationModalOpen}
        onOpenChange={setViolationModalOpen}
        onConfirm={(violationType, description) => {
          onViolationAdd(report.studentId, violationType, description);
          setViolationModalOpen(false);
        }}
        studentName={report.student.full_name}
      />
    </>
  );
}
