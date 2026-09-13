import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { userApi } from "@/lib/userApi";
import { classApi, Class } from "@/lib/classApi";

interface Teacher {
  _id: string;
  username: string;
  email: string;
  class?: string;
  isActive: boolean;
}

interface TeachersManagementTabProps {
  canWrite?: boolean;
}

export function TeachersManagementTab({
  canWrite = true,
}: TeachersManagementTabProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [classesLoading, setClassesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    class: "",
  });

  useEffect(() => {
    loadTeachers();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      const data = await classApi.getAllClasses();
      setClasses(data);
    } catch (error: unknown) {
      console.error("Failed to load classes:", error);
    } finally {
      setClassesLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers({ role: "teacher" });
      setTeachers(data);
    } catch (error: unknown) {
      toast({
        title: t("common.error"),
        description: t("classes.loadTeachersFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableClasses = (currentClassId?: string | null): Class[] => {
    // Filter classes: show unassigned classes + the currently assigned class
    return classes.filter((cls) => {
      // If class has no assignedTeacherId, show it
      if (!cls.assignedTeacherId) return true;
      // If we're editing and this is the current class, show it
      if (
        currentClassId && typeof cls.assignedTeacherId === "object"
          ? cls.assignedTeacherId._id === currentClassId
          : cls.assignedTeacherId === currentClassId
      ) {
        return true;
      }
      return false;
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      class: "",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      username: teacher.username,
      email: teacher.email,
      password: "",
      confirmPassword: "",
      class: teacher.class || "",
    });
    setIsEditOpen(true);
  };

  const handleOpenDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDeleteTargetName(teacher.username);
    setIsDeleteOpen(true);
  };

  const handleAddTeacher = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast({
        title: t("common.error"),
        description: t("common.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordsMismatch"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await userApi.createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: "teacher",
        ...(formData.class ? { class: formData.class } : {}),
      });
      setTeachers([...teachers, response.user]);
      setIsAddOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.addedTeacher", { password: (response as any).plainTextPassword }),
      });
    } catch (error: unknown) {
      toast({
        title: t("common.error"),
        description: t("classes.addTeacherFailed"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!formData.username || !formData.email) {
      toast({
        title: t("common.error"),
        description: t("common.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: t("common.error"),
        description: t("settings.passwordsMismatch"),
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const updateData: any = {
        username: formData.username,
        email: formData.email,
        role: "teacher",
        class: formData.class || null,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const response = await userApi.updateUser(
        selectedTeacher!._id,
        updateData,
      );
      setTeachers(
        teachers.map((t) =>
          t._id === selectedTeacher?._id ? response.user : t,
        ),
      );
      setIsEditOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.updatedTeacher"),
      });
    } catch (error: unknown) {
      toast({
        title: t("common.error"),
        description: t("classes.updateTeacherFailed"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      setSubmitting(true);
      await userApi.deleteUser(selectedTeacher._id);
      setTeachers(teachers.filter((t) => t._id !== selectedTeacher._id));
      setIsDeleteOpen(false);
      toast({
        title: t("common.success"),
        description: t("classes.deletedTeacher"),
      });
    } catch (error: unknown) {
      toast({
        title: t("common.error"),
        description: t("classes.deleteTeacherFailed"),
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
          <h3 className="text-lg font-semibold">
            {t("classes.teachersCount", { count: teachers.length })}
          </h3>
        </div>
        {canWrite && (
          <Button size="sm" onClick={handleOpenAdd} disabled={loading}>
            <Plus className="ml-2 h-4 w-4" />{t("classes.addTeacher")}</Button>
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
              <TableHeader className="bg-purple-600">
                <TableRow>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                    {t("common.name")}
                  </TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("common.email")}</TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">{t("classes.assignedClass")}</TableHead>
                  {canWrite && (
                    <TableHead className="text-center text-white font-bold py-3 px-4">{t("common.actions")}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.length === 0 ? (
                  <TableRow className="hover:bg-blue-50">
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="text-center py-8 px-4 text-muted-foreground border border-gray-300">{t("classes.emptyTeachers")}</TableCell>
                  </TableRow>
                ) : (
                  teachers.map((teacher, index) => (
                    <TableRow
                      key={teacher._id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                      <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                        {teacher.username}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {teacher.class ? (
                          <Badge variant="outline">
                            {classes.find((c) => c._id === teacher.class)
                              ?.name || t("classes.deletedClass")}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{t("classes.unassigned")}</span>
                        )}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(teacher)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(teacher)}>
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

      {/* Add Teacher Modal */}
      {canWrite && (
        <>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent dir={i18n.dir()} className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">{t("classes.addTeacherTitle")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="teacher-name"
                    className="text-right block mb-2">{t("classes.teacherName")}</Label>
                  <Input
                    id="teacher-name"
                    placeholder={t("classes.teacherNamePlaceholder")}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-email"
                    className="text-right block mb-2">{t("common.email")}</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-password"
                    className="text-right block mb-2">
                    {t("common.password")}
                  </Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder={t("login.passwordPlaceholder")}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-confirm-password"
                    className="text-right block mb-2">{t("settings.confirmPassword")}</Label>
                  <Input
                    id="teacher-confirm-password"
                    type="password"
                    placeholder={t("common.confirmPasswordPlaceholder")}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-class"
                    className="text-right block mb-2">
                    {t("classes.assignedClassLabel")}{" "}
                    <span className="text-muted-foreground text-xs">{t("common.optional")}</span>
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class: value })
                    }>
                    <SelectTrigger id="teacher-class">
                      <SelectValue placeholder={t("classes.noClass")} />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableClasses().map((cls) => (
                        <SelectItem key={cls._id} value={cls._id}>
                          {cls.name}
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
                <Button onClick={handleAddTeacher} disabled={submitting}>
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

          {/* Edit Teacher Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent dir={i18n.dir()} className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">{t("classes.editTeacher")}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="edit-teacher-name"
                    className="text-right block mb-2">{t("classes.teacherName")}</Label>
                  <Input
                    id="edit-teacher-name"
                    placeholder={t("classes.teacherNamePlaceholder")}
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-teacher-email"
                    className="text-right block mb-2">{t("common.email")}</Label>
                  <Input
                    id="edit-teacher-email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                   
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-teacher-password"
                    className="text-right block mb-2">{t("settings.newPasswordOptional")}</Label>
                  <Input
                    id="edit-teacher-password"
                    type="password"
                    placeholder={t("settings.leavePasswordBlank")}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                   
                  />
                </div>

                {formData.password && (
                  <div>
                    <Label
                      htmlFor="edit-teacher-confirm-password"
                      className="text-right block mb-2">{t("settings.confirmPassword")}</Label>
                    <Input
                      id="edit-teacher-confirm-password"
                      type="password"
                      placeholder={t("common.confirmPasswordPlaceholder")}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                     
                    />
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="edit-teacher-class"
                    className="text-right block mb-2">
                    {t("classes.assignedClassLabel")}{" "}
                    <span className="text-muted-foreground text-xs">{t("common.optional")}</span>
                  </Label>
                  <Select
                    value={formData.class || "__none__"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        class: value === "__none__" ? "" : value,
                      })
                    }>
                    <SelectTrigger id="edit-teacher-class">
                      <SelectValue placeholder={t("classes.noClass")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">{t("teacher.noClassDash")}</SelectItem>
                      {getAvailableClasses(selectedTeacher?.class).map(
                        (cls) => (
                          <SelectItem key={cls._id} value={cls._id}>
                            {cls.name}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  disabled={submitting}>{t("common.cancel")}</Button>
                <Button onClick={handleUpdateTeacher} disabled={submitting}>
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
            onConfirm={handleDeleteTeacher}
            itemName={deleteTargetName}
            itemType={t("common.teacher")}
          />
        </>
      )}
    </>
  );
}
