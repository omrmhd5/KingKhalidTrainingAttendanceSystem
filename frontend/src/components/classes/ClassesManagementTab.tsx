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
import { StudentAssignmentModal } from "./StudentAssignmentModal";

interface Class {
  _id: string;
  name: string;
  teacher: {
    _id: string;
    username: string;
    email: string;
  } | null;
  studentCount: number;
}

interface Teacher {
  _id: string;
  username: string;
  email: string;
}

interface ClassesManagementTabProps {
  canWrite?: boolean;
}

export function ClassesManagementTab({
  canWrite = true,
}: ClassesManagementTabProps) {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
  });

  // Mock data for now
  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      setClasses([
        {
          _id: "1",
          name: "الفصل الأول",
          teacher: {
            _id: "t1",
            username: "معلم1",
            email: "teacher1@example.com",
          },
          studentCount: 30,
        },
        {
          _id: "2",
          name: "الفصل الثاني",
          teacher: null,
          studentCount: 0,
        },
      ]);
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
      // TODO: Replace with actual API call
      setTeachers([
        { _id: "t1", username: "معلم1", email: "teacher1@example.com" },
        { _id: "t2", username: "معلم2", email: "teacher2@example.com" },
      ]);
    } catch (error) {
      console.error("Failed to load teachers:", error);
    }
  };

  const handleOpenAdd = () => {
    setFormData({ name: "" });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (classItem: Class) => {
    setSelectedClass(classItem);
    setFormData({ name: classItem.name });
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
      // TODO: Call API to create class
      const newClass: Class = {
        _id: Date.now().toString(),
        name: formData.name,
        teacher: null,
        studentCount: 0,
      };
      setClasses([...classes, newClass]);
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
      // TODO: Call API to update class
      setClasses(
        classes.map((c) =>
          c._id === selectedClass?._id ? { ...c, name: formData.name } : c,
        ),
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
      // TODO: Call API to delete class
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
                      {classItem.teacher?.username || "—"}
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

      {/* Student Assignment Modal */}
      {selectedClass && (
        <StudentAssignmentModal
          open={showStudentModal}
          onOpenChange={setShowStudentModal}
          classItem={selectedClass}
          canWrite={canWrite}
        />
      )}
    </>
  );
}
