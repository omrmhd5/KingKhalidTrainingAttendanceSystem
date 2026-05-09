import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trainee } from "@/lib/traineeApi";
import { useState } from "react";
import { ExportPDF } from "@/components/classes/ExportPDF";
import { ExportExcel } from "@/components/classes/ExportExcel";

interface StudentWithReport {
  studentId: string;
  student: Trainee;
  className: string;
  teacherName: string;
  date: string;
  violationType?: string;
  violationDescription?: string;
}

interface StatDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  students: StudentWithReport[];
  color: "green" | "red" | "orange" | "blue";
}

const colorStyles = {
  green: "bg-green-100 border-green-300",
  red: "bg-red-100 border-red-300",
  orange: "bg-orange-100 border-orange-300",
  blue: "bg-blue-100 border-blue-300",
};

const colorTextStyles = {
  green: "text-green-700",
  red: "text-red-700",
  orange: "text-orange-700",
  blue: "text-blue-700",
};

const violationTypes: Record<number | string, string> = {
  1: "النوم في الفصل",
  2: "استخدام الجوال في الفصل",
  3: "عدم احترام المسؤول",
  4: "مخالفة الأنظمة والتعليمات",
};

export default function StatDetailModal({
  open,
  onOpenChange,
  title,
  students,
  color,
}: StatDetailModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter students based on search query (name, military_id, civil_id)
  const filteredStudents = students.filter(
    (item) =>
      item.student.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.student.military_id
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.student.civil_id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4" dir="rtl">
          {/* Search Bar */}
          <Input
            placeholder="ابحث باسم الطالب أو رقم عسكري أو هوية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-right"
            dir="rtl"
          />

          {/* Students List */}
          {filteredStudents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredStudents.map((item, idx) => (
                <div
                  key={`${item.studentId}-${idx}`}
                  className={`border-2 rounded-lg p-3 text-sm ${colorStyles[color]}`}>
                  <div
                    className={`grid gap-4 ${
                      item.violationType ? "grid-cols-4" : "grid-cols-3"
                    }`}>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        الاسم
                      </p>
                      <p className="font-medium">{item.student.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        الرقم العسكري
                      </p>
                      <p className="font-medium">{item.student.military_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        السجل المدني
                      </p>
                      <p className="font-medium">{item.student.civil_id}</p>
                    </div>
                    {item.violationType && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          المخالفة
                        </p>
                        <div className="font-medium">
                          <p>
                            {violationTypes[item.violationType] ||
                              item.violationType}
                          </p>
                          {item.violationDescription && (
                            <p className="text-xs text-gray-600 mt-1">
                              {item.violationDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد طلاب
            </div>
          )}

          {/* Count */}
          <div
            className={`text-center py-2 rounded-lg font-semibold ${colorTextStyles[color]}`}>
            إجمالي: {filteredStudents.length}
          </div>
        </div>

        <DialogFooter className="pt-4 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إغلاق
          </Button>
          <ExportPDF data={filteredStudents} title={title} />
          <ExportExcel data={filteredStudents} title={title} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
