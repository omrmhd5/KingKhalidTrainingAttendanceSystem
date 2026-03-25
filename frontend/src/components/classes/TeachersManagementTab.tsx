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
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface Teacher {
  _id: string;
  username: string;
  email: string;
  assignedClass?: {
    _id: string;
    name: string;
  } | null;
}

interface TeachersManagementTabProps {
  canWrite?: boolean;
}

export function TeachersManagementTab({
  canWrite = true,
}: TeachersManagementTabProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
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
  });

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setTeachers([
        {
          _id: "t1",
          username: "محمد علي",
          email: "teacher1@example.com",
          assignedClass: { _id: "c1", name: "الفصل الأول" },
        },
        {
          _id: "t2",
          username: "فاطمة عبدالله",
          email: "teacher2@example.com",
          assignedClass: null,
        },
      ]);
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

  const handleOpenAdd = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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
      // TODO: Call API to create teacher
      const newTeacher: Teacher = {
        _id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        assignedClass: null,
      };
      setTeachers([...teachers, newTeacher]);
      setIsAddOpen(false);
      toast({
        title: "نجاح",
        description: "تم إضافة المعلم بنجاح. سيتم تعيينه لفصل من تبويب الفصول",
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
    if (!formData.username || !formData.email) {
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
      // TODO: Call API to update teacher
      setTeachers(
        teachers.map((t) =>
          t._id === selectedTeacher?._id
            ? {
                ...t,
                username: formData.username,
                email: formData.email,
              }
            : t,
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
      // TODO: Call API to delete teacher
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
                      {teacher.assignedClass ? (
                        <Badge variant="outline">
                          {teacher.assignedClass.name}
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

                <p className="text-sm text-muted-foreground text-right">
                  ملاحظة: سيتم تعيين الفصل للمعلم من تبويب الفصول
                </p>
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
