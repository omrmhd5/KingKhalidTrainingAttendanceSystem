import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Users, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { ClassStudentsModal } from "./ClassStudentsModal";
import { AddStudentsModal } from "./AssignStudentsModal";
import { classApi, Class, Teacher } from "@/lib/classApi";
import {
  classTimeScheduleApi,
  ClassTimeSchedule,
} from "@/lib/classTimeScheduleApi";

interface ClassesManagementTabProps {
  canWrite?: boolean;
}

export function ClassesManagementTab({
  canWrite = true,
}: ClassesManagementTabProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [schedules, setSchedules] = useState<ClassTimeSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    scheduleId: "",
  });

  useEffect(() => {
    loadClasses();
    loadSchedules();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAllClasses();
      setClasses(data);
    } catch (error: unknown) {
      toast({
        title: t("common.error"),
        description: t("classes.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSchedules = async () => {
    try {
      const data = await classTimeScheduleApi.getAllSchedules();
      setSchedules(data);
    } catch (error) {
      console.error("Failed to load schedules:", error);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", scheduleId: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      scheduleId:
        typeof classItem.schedule === "string"
          ? classItem.schedule
          : (classItem.schedule as any)?._id || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (classItem: Class) => {
    setSelectedClass(classItem);
    setDeleteTargetName(classItem.name);
    setIsDeleteOpen(true);
  };

  const handleAddClass = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t("common.error"),
        description: t("classes.needName"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduleId) {
      toast({
        title: t("common.error"),
        description: t("classes.needSchedule"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await classApi.createClass({
        name: formData.name,
        schedule: formData.scheduleId,
      });
      setClasses([...classes, response.class]);
      setIsAddOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.added"),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message || t("classes.addFailed");
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t("common.error"),
        description: t("classes.needName"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduleId) {
      toast({
        title: t("common.error"),
        description: t("classes.needSchedule"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await classApi.updateClass(selectedClass!._id, {
        name: formData.name,
        schedule: formData.scheduleId,
      });
      setClasses(
        classes.map((c) => (c._id === selectedClass?._id ? response.class : c)),
      );
      setIsEditOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.updated"),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message || t("classes.updateFailed");
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      setSubmitting(true);
      await classApi.deleteClass(selectedClass._id);
      setClasses(classes.filter((c) => c._id !== selectedClass._id));
      setIsDeleteOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.deleted"),
      });
    } catch (error: unknown) {
      const errorMessage =
        (error as any)?.response?.data?.message || t("classes.deleteFailed");
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
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("classes.classesCount", { count: classes.length })}</h3>
        </div>
        {canWrite && (
          <Button size="sm" onClick={handleOpenAdd} disabled={loading}>
            <Plus className="ml-2 h-4 w-4" />{t("classes.addClass")}</Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <Table className="border-collapse">
              <TableHeader className="bg-indigo-600">
                <TableRow>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                    {t("common.name")}
                  </TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("common.teacher")}</TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("classes.schedule")}</TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("teacher.totalStudents")}</TableHead>
                  {canWrite && (
                    <TableHead className="text-center text-white font-bold py-3 px-4">{t("common.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow className="hover:bg-blue-50">
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 px-4 text-muted-foreground border border-gray-300">{t("classes.empty")}</TableCell>
                  </TableRow>
                ) : (
                  classes
                    .sort((a, b) => {
                      let scheduleAStart = "";
                      let scheduleBStart = "";

                      if (typeof a.schedule === "string") {
                        scheduleAStart =
                          schedules.find((s) => s._id === a.schedule)
                            ?.start_time || "";
                      } else {
                        scheduleAStart =
                          (a.schedule as ClassTimeSchedule | undefined)
                            ?.start_time || "";
                      }

                      if (typeof b.schedule === "string") {
                        scheduleBStart =
                          schedules.find((s) => s._id === b.schedule)
                            ?.start_time || "";
                      } else {
                        scheduleBStart =
                          (b.schedule as ClassTimeSchedule | undefined)
                            ?.start_time || "";
                      }

                      return scheduleAStart.localeCompare(scheduleBStart);
                    })
                    .map((classItem, index) => (
                      <TableRow
                        key={classItem._id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                        <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                          {classItem.name}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          {typeof classItem.assignedTeacherId === "string"
                            ? "—"
                            : (
                                classItem.assignedTeacherId as
                                  | Teacher
                                  | undefined
                              )?.username || "—"}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          {typeof classItem.schedule === "string"
                            ? schedules.find(
                                (s) => s._id === classItem.schedule,
                              )?.name || "—"
                            : (
                                classItem.schedule as
                                  | ClassTimeSchedule
                                  | undefined
                              )?.name || "—"}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedClass(classItem);
                              setShowStudentModal(true);
                            }}>
                            <Users className="h-4 w-4 ml-1" />
                            {classItem.studentCount}
                          </Button>
                        </TableCell>
                        {canWrite && (
                          <TableCell className="text-center py-2 px-4 border border-gray-300">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("classes.addStudents")}
                                onClick={() => {
                                  setSelectedClass(classItem);
                                  setShowAssignModal(true);
                                }}>
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenEdit(classItem)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDelete(classItem)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {canWrite && (
        <>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent dir={i18n.dir()} className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">{t("classes.addClassTitle")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="class-name" className="text-right block mb-2">{t("classes.className")}</Label>
                  <Input
                    id="class-name"
                    placeholder={t("classes.periodPlaceholder")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                   
                  />
                </div>
                <div>
                  <Label
                    htmlFor="add-schedule"
                    className="text-right block mb-2">{t("classes.timeSchedule")}</Label>
                  <Select
                    value={formData.scheduleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, scheduleId: value })
                    }>
                    <SelectTrigger id="add-schedule">
                      <SelectValue placeholder={t("classes.selectScheduleShort")} />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={submitting}>{t("common.cancel")}</Button>
                <Button onClick={handleAddClass} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />{t("common.adding")}</>
                  ) : (
                    t("common.add")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Class Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent dir={i18n.dir()} className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">{t("classes.editClass")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="edit-class-name"
                    className="text-right block mb-2">{t("classes.className")}</Label>
                  <Input
                    id="edit-class-name"
                    placeholder={t("classes.periodPlaceholder")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                   
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-schedule"
                    className="text-right block mb-2">{t("classes.timeSchedule")}</Label>
                  <Select
                    value={formData.scheduleId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, scheduleId: value })
                    }>
                    <SelectTrigger id="edit-schedule">
                      <SelectValue placeholder={t("classes.selectScheduleShort")} />
                    </SelectTrigger>
                    <SelectContent>
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
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={submitting}>{t("common.cancel")}</Button>
                <Button onClick={handleUpdateClass} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />{t("common.updating")}</>
                  ) : (
                    t("common.update")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <ConfirmDeleteModal
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDeleteClass}
            itemName={deleteTargetName}
            itemType={t("common.class")}
          />
        </>
      )}

      {/* Student Assignment Modal - View/Delete current students */}
      {selectedClass && (
        <ClassStudentsModal
          open={showStudentModal}
          onOpenChange={setShowStudentModal}
          classItem={selectedClass}
          canWrite={canWrite}
          onStudentRemoved={loadClasses}
        />
      )}

      {/* Assign Students Modal - Add new students */}
      {selectedClass && canWrite && (
        <AddStudentsModal
          open={showAssignModal}
          onOpenChange={setShowAssignModal}
          classItem={selectedClass}
          onStudentsAdded={loadClasses}
        />
      )}
    </>
  );
}
