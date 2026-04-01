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
        title: "خطأ",
        description: "فشل في تحميل المعلمين",
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
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.class
    ) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
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
        class: formData.class,
      });
      setTeachers([...teachers, response.user]);
      setIsAddOpen(false);
      toast({
        title: "نجاح",
        description: `تم إضافة المعلم بنجاح\nكلمة المرور: ${(response as any).plainTextPassword}`,
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة المعلم",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeacher = async () => {
    if (!formData.username || !formData.email || !formData.class) {
      toast({
        title: "خطأ",
        description: "الرجاء ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمات المرور غير متطابقة",
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
        class: formData.class,
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
        title: "نجاح",
        description: "تم تحديث المعلم بنجاح",
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث المعلم",
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
        title: "نجاح",
        description: "تم حذف المعلم بنجاح",
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المعلم",
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
            المعلمون ({teachers.length})
          </h3>
        </div>
        {canWrite && (
          <Button size="sm" onClick={handleOpenAdd} disabled={loading}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة معلم
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الفصل المعين</TableHead>
                {canWrite && (
                  <TableHead className="text-center">الإجراءات</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={canWrite ? 4 : 3}
                    className="text-center py-8 text-muted-foreground">
                    لا يوجد معلمون
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell className="font-medium text-right">
                      {teacher.username}
                    </TableCell>
                    <TableCell className="text-right">
                      {teacher.email}
                    </TableCell>
                    <TableCell className="text-right">
                      {teacher.class ? (
                        <Badge variant="outline">
                          {classes.find((c) => c._id === teacher.class)?.name ||
                            "فصل محذوف"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">غير معين</span>
                      )}
                    </TableCell>
                    {canWrite && (
                      <TableCell className="text-center">
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
      )}

      {/* Add Teacher Modal */}
      {canWrite && (
        <>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">
                  إضافة معلم جديد
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="teacher-name"
                    className="text-right block mb-2">
                    اسم المعلم
                  </Label>
                  <Input
                    id="teacher-name"
                    placeholder="أدخل اسم المعلم"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-email"
                    className="text-right block mb-2">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-password"
                    className="text-right block mb-2">
                    كلمة المرور
                  </Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-confirm-password"
                    className="text-right block mb-2">
                    تأكيد كلمة المرور
                  </Label>
                  <Input
                    id="teacher-confirm-password"
                    type="password"
                    placeholder="أكد كلمة المرور"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="teacher-class"
                    className="text-right block mb-2">
                    الفصل
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class: value })
                    }>
                    <SelectTrigger id="teacher-class" dir="rtl">
                      <SelectValue placeholder="اختر فصل" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
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
                  disabled={submitting}>
                  إلغاء
                </Button>
                <Button onClick={handleAddTeacher} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    "إضافة"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Teacher Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل المعلم</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="edit-teacher-name"
                    className="text-right block mb-2">
                    اسم المعلم
                  </Label>
                  <Input
                    id="edit-teacher-name"
                    placeholder="أدخل اسم المعلم"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-teacher-email"
                    className="text-right block mb-2">
                    البريد الإلكتروني
                  </Label>
                  <Input
                    id="edit-teacher-email"
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="edit-teacher-password"
                    className="text-right block mb-2">
                    كلمة المرور الجديدة (اختياري)
                  </Label>
                  <Input
                    id="edit-teacher-password"
                    type="password"
                    placeholder="اترك فارغاً لعدم تغيير كلمة المرور"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>

                {formData.password && (
                  <div>
                    <Label
                      htmlFor="edit-teacher-confirm-password"
                      className="text-right block mb-2">
                      تأكيد كلمة المرور
                    </Label>
                    <Input
                      id="edit-teacher-confirm-password"
                      type="password"
                      placeholder="أكد كلمة المرور"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      dir="rtl"
                    />
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="edit-teacher-class"
                    className="text-right block mb-2">
                    الفصل
                  </Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class: value })
                    }>
                    <SelectTrigger id="edit-teacher-class" dir="rtl">
                      <SelectValue placeholder="اختر فصل" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
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
                  disabled={submitting}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateTeacher} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحديث...
                    </>
                  ) : (
                    "تحديث"
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
            itemType="المعلم"
          />
        </>
      )}
    </>
  );
}
