import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { classApi, Class } from "@/lib/classApi";

interface Student {
  _id: string;
  full_name: string;
  civil_id: string;
  military_id: string;
}

const ITEMS_PER_PAGE = 10;

interface ClassStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: Class;
  canWrite?: boolean;
  onStudentRemoved?: () => void;
}

export function ClassStudentsModal({
  open,
  onOpenChange,
  classItem,
  canWrite = true,
  onStudentRemoved,
}: ClassStudentsModalProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [classStudents, setClassStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (open) {
      loadClassStudents();
    }
  }, [open, classItem._id]);

  const loadClassStudents = async () => {
    try {
      setLoading(true);
      const classData = await classApi.getClassById(classItem._id);
      setClassStudents((classData.students as Student[]) || []);
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلاب الفصل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search
  const filteredStudents = useMemo(() => {
    if (!search) {
      return classStudents; // Show all students if search is empty
    }
    return classStudents.filter((student) =>
      [student.full_name, student.civil_id, student.military_id].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, classStudents]);

  // Paginate filtered students
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setDeleting(studentId);
      await classApi.removeStudent(classItem._id, studentId);
      setClassStudents(classStudents.filter((s) => s._id !== studentId));
      toast({
        title: "نجاح",
        description: "تم حذف الطالب من الفصل",
      });
      if (onStudentRemoved) {
        onStudentRemoved();
      }
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الطالب",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setConfirmDeleteOpen(false);
    }
  };

  const handleDeleteSelectedStudents = async () => {
    try {
      setDeleting("bulk");
      const studentIds = Array.from(selectedStudents);

      // Delete each student
      for (const studentId of studentIds) {
        await classApi.removeStudent(classItem._id, studentId);
      }

      setClassStudents(
        classStudents.filter((s) => !selectedStudents.has(s._id)),
      );
      setSelectedStudents(new Set());

      toast({
        title: "نجاح",
        description: `تم حذف ${studentIds.length} طالب(ة) من الفصل`,
      });

      if (onStudentRemoved) {
        onStudentRemoved();
      }
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في حذف الطلاب",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
      setConfirmDeleteOpen(false);
    }
  };

  const handleSelectStudent = (id: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedStudents.size === paginatedStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(paginatedStudents.map((s) => s._id)));
    }
  };

  const handleOpenDeleteConfirm = (student: Student) => {
    setStudentToDelete(student);
    setIsBulkDelete(false);
    setConfirmDeleteOpen(true);
  };

  const handleOpenBulkDeleteConfirm = () => {
    setStudentToDelete(null);
    setIsBulkDelete(true);
    setConfirmDeleteOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-right">
            طلاب الفصل: {classItem.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث برقم السجل المدني أو الرقم العسكري أو الاسم"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              dir="rtl"
              className="pl-10 pr-10"
            />
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto border border-gray-300 rounded-lg overflow-hidden">
            <Table dir="rtl" className="border-collapse">
              <TableHeader className="bg-rose-600">
                <TableRow>
                  {canWrite && (
                    <TableHead className="text-center w-12 text-white font-bold py-3 px-4 border-r border-gray-400">
                      <Checkbox
                        checked={
                          selectedStudents.size === paginatedStudents.length &&
                          paginatedStudents.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                    الاسم
                  </TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                    السجل المدني
                  </TableHead>
                  <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                    الرقم العسكري
                  </TableHead>
                  {canWrite && (
                    <TableHead className="text-center text-white font-bold py-3 px-4">
                      الإجراءات
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow className="hover:bg-blue-50">
                    <TableCell
                      colSpan={canWrite ? 5 : 4}
                      className="text-center py-8 px-4 border border-gray-300">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow className="hover:bg-blue-50">
                    <TableCell
                      colSpan={canWrite ? 5 : 4}
                      className="text-center py-8 px-4 text-muted-foreground border border-gray-300">
                      لا يوجد طلاب
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student, index) => (
                    <TableRow
                      key={student._id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                      {canWrite && (
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          <Checkbox
                            checked={selectedStudents.has(student._id)}
                            onCheckedChange={() =>
                              handleSelectStudent(student._id)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-center font-medium py-2 px-4 border border-gray-300">
                        {student.full_name}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {student.civil_id}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {student.military_id}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteConfirm(student)}
                            disabled={deleting !== null}>
                            {deleting === student._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">
                الصفحة {currentPage} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}>
                التالي
              </Button>
            </div>
          )}

          {/* Student Count */}
          <div className="text-sm text-muted-foreground text-right">
            إجمالي الطلاب: {filteredStudents.length}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {canWrite && selectedStudents.size > 0 && (
            <Button
              variant="destructive"
              onClick={handleOpenBulkDeleteConfirm}
              disabled={deleting !== null}>
              <Trash2 className="ml-2 h-4 w-4" />
              حذف المحددين ({selectedStudents.size})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting !== null}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      {(studentToDelete || isBulkDelete) && (
        <ConfirmDeleteModal
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          itemName={
            isBulkDelete
              ? `${selectedStudents.size} طالب(ة)`
              : studentToDelete?.full_name || ""
          }
          itemType={isBulkDelete ? "الطلاب" : "الطالب"}
          onConfirm={() => {
            if (isBulkDelete) {
              handleDeleteSelectedStudents();
            } else if (studentToDelete) {
              handleDeleteStudent(studentToDelete._id);
            }
          }}
        />
      )}
    </Dialog>
  );
}
