import i18n from "@/i18n";
import { useTranslation } from "react-i18next";
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
  const period = hours >= 12 ? i18n.t("pm") : i18n.t("am");
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
  const { t, i18n } = useTranslation();
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
        title: t("common.error"),
        description: t("classes.loadSchedulesFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleClassName.trim() || !scheduleStart || !scheduleEnd) {
      toast({
        title: t("common.error"),
        description: t("common.required"),
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
        title: t("common.success"),
        description: t("classes.addedSchedule"),
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t("classes.addScheduleFailed"));
      toast({
        title: t("common.error"),
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
          title: t("common.success"),
          description: t("classes.deletedSchedule"),
        });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error, t("classes.deleteScheduleFailed"));
        toast({
          title: t("common.error"),
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
        title: t("common.error"),
        description: t("common.required"),
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
        title: t("common.success"),
        description: t("classes.updatedSchedule"),
      });
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t("classes.updateScheduleFailed"));
      toast({
        title: t("common.error"),
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
       >
        <CardTitle>{t("classes.schedulesCount", { count: schedules.length })}</CardTitle>
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
            <Plus className="ml-2 h-4 w-4" />{t("classes.addSchedule")}</Button>
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
              itemType={t("teacher.classSchedule")}
            />
          </>
        )}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table className="border-collapse">
            <TableHeader className="bg-cyan-600">
              <TableRow>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  {t("common.name")}
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("common.start")}</TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("common.end")}</TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("classes.classCount")}</TableHead>
                {canWrite && (
                  <TableHead className="text-center text-white font-bold py-3 px-4">{t("common.actions")}</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 px-4 border border-gray-300">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : schedules.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 px-4 border border-gray-300">{t("classes.emptySchedules")}</TableCell>
                </TableRow>
              ) : (
                [...schedules]
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map((s: ClassTimeSchedule, index) => {
                    const startTime12 = convertTo12HourArabic(
                      s.start_time || "",
                    );
                    const endTime12 = convertTo12HourArabic(s.end_time || "");
                    const [startTimeNum, startPeriod] = startTime12.split(" ");
                    const [endTimeNum, endPeriod] = endTime12.split(" ");
                    return (
                      <TableRow
                        key={s._id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                        <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                          {s.name}
                        </TableCell>
                        <TableCell className="font-mono text-center py-2 px-4 border border-gray-300">
                          {startTimeNum}
                          <span className="text-md font-semibold">
                            {" "}
                            {startPeriod}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-center py-2 px-4 border border-gray-300">
                          {endTimeNum}
                          <span className="text-md font-semibold">
                            {" "}
                            {endPeriod}
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-semibold py-2 px-4 border border-gray-300">
                          {s.classes?.length || 0}
                        </TableCell>
                        {canWrite && (
                          <TableCell className="text-center flex gap-2 justify-center py-2 px-4 border border-gray-300">
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
                              onClick={() =>
                                handleDeleteSchedule(s._id, s.name)
                              }
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
        </div>
      </CardContent>
    </Card>
  );
}
