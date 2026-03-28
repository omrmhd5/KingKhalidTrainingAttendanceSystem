import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface Student {
  _id: string;
  full_name: string;
  civil_id: string;
  military_id: string;
  currentClassId?: string;
}

interface ClassItem {
  _id: string;
  name: string;
  studentCount: number;
}

const ITEMS_PER_PAGE = 10;

interface ClassStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem;
  canWrite?: boolean;
}

export function ClassStudentsModal({
  open,
  onOpenChange,
  classItem,
  canWrite = true,
}: ClassStudentsModalProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Mock data - Students currently in this class
  // TODO: Replace with actual API call
  const classStudents: Student[] = [
    {
      _id: "s1",
      full_name: "محمد أحمد",
      civil_id: "1234567890",
      military_id: "001",
    },
    {
      _id: "s2",
      full_name: "فاطمة علي",
      civil_id: "1234567891",
      military_id: "002",
    },
    {
      _id: "s3",
      full_name: "عمر محمد",
      civil_id: "1234567892",
      military_id: "003",
    },
    {
      _id: "s4",
      full_name: "نور احمد",
      civil_id: "1234567893",
      military_id: "004",
    },
    {
      _id: "s5",
      full_name: "سارة علي",
      civil_id: "1234567894",
      military_id: "005",
    },
  ];

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return classStudents.filter((student) =>
      [student.full_name, student.civil_id, student.military_id].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search]);

  // Paginate filtered students
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setDeleting(studentId);
      // TODO: Call API to remove student from class
      toast({
        title: "نجاح",
        description: "تم حذف الطالب من الفصل",
      });
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

  const handleOpenDeleteConfirm = (student: Student) => {
    setStudentToDelete(student);
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
          <div className="overflow-x-auto border rounded">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">السجل المدني</TableHead>
                  <TableHead className="text-right">الرقم العسكري</TableHead>
                  {canWrite && (
                    <TableHead className="text-center">الإجراءات</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={canWrite ? 4 : 3}
                      className="text-center py-8 text-muted-foreground">
                      لا يوجد طلاب
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-right font-medium">
                        {student.full_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.civil_id}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.military_id}
                      </TableCell>
                      {canWrite && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteConfirm(student)}
                            disabled={deleting === student._id}>
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting !== null}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <ConfirmDeleteModal
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          itemName={studentToDelete.full_name}
          itemType="الطالب"
          onConfirm={() => handleDeleteStudent(studentToDelete._id)}
        />
      )}
    </Dialog>
  );
}
