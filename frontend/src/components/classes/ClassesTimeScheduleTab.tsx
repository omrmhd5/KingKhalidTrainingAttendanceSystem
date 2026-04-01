import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  classTimeScheduleApi,
  ClassTimeSchedule,
} from "@/lib/classTimeScheduleApi";
import { ClassTimeScheduleModal } from "@/components/classes/ClassTimeScheduleModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import axios, { AxiosError } from "axios";

// Helper function to convert 24-hour format to 12-hour Arabic format
const convertTo12HourArabic = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

// Helper to extract error message from axios errors
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (
      (error as AxiosError<{ message: string }>).response?.data?.message ||
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

interface ClassesTimeScheduleTabProps {
  canWrite?: boolean;
}

export function ClassesTimeScheduleTab({
  canWrite = true,
}: ClassesTimeScheduleTabProps = {}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Add Schedule
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleClassName, setScheduleClassName] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  const [schedules, setSchedules] = useState<ClassTimeSchedule[]>([]);

  // Edit Schedule
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(
    null,
  );
  const [editingScheduleName, setEditingScheduleName] = useState("");
  const [editingScheduleStart, setEditingScheduleStart] = useState("");
  const [editingScheduleEnd, setEditingScheduleEnd] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Load schedules on component mount
  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await classTimeScheduleApi.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل جداول الفصول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleClassName.trim() || !scheduleStart || !scheduleEnd) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      const response = await classTimeScheduleApi.createSchedule({
        name: scheduleClassName,
        start_time: scheduleStart,
        end_time: scheduleEnd,
      });
      setSchedules([...schedules, response.schedule]);
      setScheduleDialogOpen(false);
      setScheduleClassName("");
      setScheduleStart("");
      setScheduleEnd("");
      toast({
        title: "نجاح",
        description: "تم إضافة الجدول",
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "فشل إضافة الجدول");
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSchedule = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        setSubmitting(true);
        await classTimeScheduleApi.deleteSchedule(deleteTargetId);
        setSchedules(schedules.filter((s) => s._id !== deleteTargetId));
        toast({
          title: "نجاح",
          description: "تم حذف الجدول",
        });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, "فشل حذف الجدول");
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
        setDeleteConfirmOpen(false);
      }
    }
  };

  const handleEditSchedule = (schedule: ClassTimeSchedule) => {
    setEditingScheduleId(schedule._id);
    setEditingScheduleName(schedule.name);
    setEditingScheduleStart(schedule.start_time || "");
    setEditingScheduleEnd(schedule.end_time || "");
    setEditDialogOpen(true);
  };

  const handleUpdateSchedule = async () => {
    if (
      !editingScheduleName.trim() ||
      !editingScheduleStart ||
      !editingScheduleEnd ||
      !editingScheduleId
    ) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    try {
      setSubmitting(true);
      const response = await classTimeScheduleApi.updateSchedule(
        editingScheduleId,
        {
          name: editingScheduleName,
          start_time: editingScheduleStart,
          end_time: editingScheduleEnd,
        },
      );
      setSchedules(
        schedules.map((s) =>
          s._id === editingScheduleId ? response.schedule : s,
        ),
      );
      setEditDialogOpen(false);
      setEditingScheduleId(null);
      setEditingScheduleName("");
      setEditingScheduleStart("");
      setEditingScheduleEnd("");
      toast({
        title: "نجاح",
        description: "تم تحديث الجدول",
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, "فشل تحديث الجدول");
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>جداول الفصول ({schedules.length})</CardTitle>
        {canWrite && (
          <Button
            size="sm"
            onClick={() => {
              setScheduleClassName("");
              setScheduleStart("");
              setScheduleEnd("");
              setScheduleDialogOpen(true);
            }}
            disabled={loading}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة جدول
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {canWrite && (
          <>
            <ClassTimeScheduleModal
              open={scheduleDialogOpen}
              onOpenChange={setScheduleDialogOpen}
              onSubmit={handleAddSchedule}
              className={scheduleClassName}
              setClassName={setScheduleClassName}
              startTime={scheduleStart}
              setStartTime={setScheduleStart}
              endTime={scheduleEnd}
              setEndTime={setScheduleEnd}
            />
            <ClassTimeScheduleModal
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              onSubmit={handleUpdateSchedule}
              isEditing={true}
              className={editingScheduleName}
              setClassName={setEditingScheduleName}
              startTime={editingScheduleStart}
              setStartTime={setEditingScheduleStart}
              endTime={editingScheduleEnd}
              setEndTime={setEditingScheduleEnd}
            />
            <ConfirmDeleteModal
              open={deleteConfirmOpen}
              onOpenChange={setDeleteConfirmOpen}
              onConfirm={confirmDelete}
              itemName={deleteTargetName}
              itemType="جدول الفصل"
            />
          </>
        )}
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">البداية</TableHead>
              <TableHead className="text-right">النهاية</TableHead>
              <TableHead className="text-right">عدد الفصول</TableHead>
              {canWrite && (
                <TableHead className="text-right">الإجراءات</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  لا توجد جداول
                </TableCell>
              </TableRow>
            ) : (
              [...schedules]
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((s: ClassTimeSchedule) => {
                  const startTime12 = convertTo12HourArabic(s.start_time || "");
                  const endTime12 = convertTo12HourArabic(s.end_time || "");
                  const [startTimeNum, startPeriod] = startTime12.split(" ");
                  const [endTimeNum, endPeriod] = endTime12.split(" ");
                  return (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium text-right">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        {startTimeNum}
                        <span className="text-md font-semibold">
                          {" "}
                          {startPeriod}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-right">
                        {endTimeNum}
                        <span className="text-md font-semibold">
                          {" "}
                          {endPeriod}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {s.classes?.length || 0}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-right flex gap-2 justify-start">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSchedule(s)}
                            disabled={submitting}>
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSchedule(s._id, s.name)}
                            disabled={submitting}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
