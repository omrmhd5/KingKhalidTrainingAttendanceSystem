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
import { userApi, User } from "@/lib/userApi";

interface ClassesManagementTabProps {
  canWrite?: boolean;
}

export function ClassesManagementTab({
  canWrite = true,
}: ClassesManagementTabProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
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
    teacherId: "",
  });

  // Mock data for now
  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await classApi.getAllClasses();
      setClasses(data);
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الفصول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      const data = await userApi.getAllUsers({ role: "teacher" });
      setTeachers(data);
    } catch (error) {
      console.error("Failed to load teachers:", error);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", teacherId: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    const teacherId =
      typeof classItem.assignedTeacherId === "string"
        ? classItem.assignedTeacherId
        : (classItem.assignedTeacherId as Teacher | undefined)?._id;
    setFormData({
      name: classItem.name,
      teacherId: teacherId || "",
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
        title: "خطأ",
        description: "الرجاء إدخال اسم الفصل",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await classApi.createClass({
        name: formData.name,
        assignedTeacherId: formData.teacherId || undefined,
      });
      setClasses([...classes, response.class]);
      setIsAddOpen(false);
      toast({
        title: "نجاح",
        description: "تم إضافة الفصل بنجاح",
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الفصل",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateClass = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الفصل",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await classApi.updateClass(selectedClass!._id, {
        name: formData.name,
        assignedTeacherId: formData.teacherId || undefined,
      });
      setClasses(
        classes.map((c) => (c._id === selectedClass?._id ? response.class : c)),
      );
      setIsEditOpen(false);
      toast({
        title: "نجاح",
        description: "تم تحديث الفصل بنجاح",
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث الفصل",
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
        title: "نجاح",
        description: "تم حذف الفصل بنجاح",
      });
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الفصل",
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
          <h3 className="text-lg font-semibold">الفصول ({classes.length})</h3>
        </div>
        {canWrite && (
          <Button size="sm" onClick={handleOpenAdd} disabled={loading}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة فصل
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
                <TableHead className="text-right">المعلم</TableHead>
                <TableHead className="text-right">عدد الطلاب</TableHead>
                {canWrite && (
                  <TableHead className="text-center">الإجراءات</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground">
                    لا توجد فصول
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow key={classItem._id}>
                    <TableCell className="font-medium text-right">
                      {classItem.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {typeof classItem.assignedTeacherId === "string"
                        ? teachers.find(
                            (t) => t._id === classItem.assignedTeacherId,
                          )?.username || "—"
                        : (classItem.assignedTeacherId as Teacher | undefined)
                            ?.username || "—"}
                    </TableCell>
                    <TableCell className="text-right">
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
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="إضافة طلاب"
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
      )}

      {/* Add Class Modal */}
      {canWrite && (
        <>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">إضافة فصل جديد</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="class-name" className="text-right block mb-2">
                    اسم الفصل
                  </Label>
                  <Input
                    id="class-name"
                    placeholder="مثال: الفصل الأول"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={submitting}>
                  إلغاء
                </Button>
                <Button onClick={handleAddClass} disabled={submitting}>
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

          {/* Edit Class Modal */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent dir="rtl" className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تعديل الفصل</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="edit-class-name"
                    className="text-right block mb-2">
                    اسم الفصل
                  </Label>
                  <Input
                    id="edit-class-name"
                    placeholder="مثال: الفصل الأول"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    dir="rtl"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit-teacher"
                    className="text-right block mb-2">
                    المعلم
                  </Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teacherId: value })
                    }>
                    <SelectTrigger id="edit-teacher" dir="rtl">
                      <SelectValue placeholder="اختر معلم" />
                    </SelectTrigger>
                    <SelectContent dir="rtl">
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {teacher.username}
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
                  disabled={submitting}>
                  إلغاء
                </Button>
                <Button onClick={handleUpdateClass} disabled={submitting}>
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
            onConfirm={handleDeleteClass}
            itemName={deleteTargetName}
            itemType="الفصل"
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
        />
      )}

      {/* Assign Students Modal - Add new students */}
      {selectedClass && canWrite && (
        <AddStudentsModal
          open={showAssignModal}
          onOpenChange={setShowAssignModal}
          classItem={selectedClass}
        />
      )}
    </>
  );
}
