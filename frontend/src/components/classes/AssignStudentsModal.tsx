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
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { traineeApi, Trainee } from "@/lib/traineeApi";
import { classApi, Class } from "@/lib/classApi";

const ITEMS_PER_PAGE = 10;

interface AddStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: Class;
  onStudentsAdded?: () => void;
}

export function AddStudentsModal({
  open,
  onOpenChange,
  classItem,
  onStudentsAdded,
}: AddStudentsModalProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "assigned-this" | "assigned-other"
  >("all");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [allTrainees, setAllTrainees] = useState<Trainee[]>([]);

  useEffect(() => {
    if (open) {
      loadAllTrainees();
    }
  }, [open]);

  const loadAllTrainees = async () => {
    try {
      setLoading(true);
      const data = await traineeApi.getAllTrainees();
      setAllTrainees(data);
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if student is in this class (handles both string IDs and objects)
  const isStudentInThisClass = (student: Trainee): boolean => {
    if (!classItem.students) return false;
    return classItem.students.some((s) => {
      if (typeof s === "string") {
        return s === student._id;
      } else {
        return (s as any)._id === student._id;
      }
    });
  };

  // Filter students by search - show all except those already in this class
  const filteredStudents = useMemo(() => {
    return allTrainees.filter((student) => {
      // Filter by search term first
      const matchesSearch = [
        student.full_name,
        student.civil_id,
        student.military_id,
      ].some((v) => v?.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      const inThisClass = isStudentInThisClass(student);
      const hasOtherClass = !!student.class;
      const inOtherClass = hasOtherClass && !inThisClass;

      // Apply status filter
      if (statusFilter === "available") {
        return !hasOtherClass && !inThisClass;
      } else if (statusFilter === "assigned-this") {
        return inThisClass;
      } else if (statusFilter === "assigned-other") {
        return inOtherClass;
      }

      // "all" shows everything
      return true;
    });
  }, [search, allTrainees, classItem.students, statusFilter]);

  // Paginate filtered students
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Get students without a class (available for assignment)
  const availableStudents = useMemo(() => {
    return paginatedStudents.filter(
      (student) => !student.class && !isStudentInThisClass(student),
    );
  }, [paginatedStudents]);

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
    if (selectedStudents.size === availableStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(availableStudents.map((s) => s._id)));
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد طلاب للتعيين",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      const studentIds = Array.from(selectedStudents);
      await classApi.assignStudents(classItem._id, studentIds);

      toast({
        title: "نجاح",
        description: `تم تعيين ${selectedStudents.size} طالب(ة) للفصل`,
      });

      setSelectedStudents(new Set());
      onOpenChange(false);

      if (onStudentsAdded) {
        onStudentsAdded();
      }
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تعيين الطلاب",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-right">
            إضافة طلاب للفصل: {classItem.name}
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

          {/* Status Filter Bubbles */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "الكل", color: "bg-gray-100 text-gray-800" },
              {
                key: "available",
                label: "متاح",
                color: "bg-green-100 text-green-800",
              },
              {
                key: "assigned-this",
                label: "معين بهذا الفصل",
                color: "bg-blue-100 text-blue-800",
              },
              {
                key: "assigned-other",
                label: "معين بفصل آخر",
                color: "bg-yellow-100 text-yellow-800",
              },
            ].map(({ key, label, color }) => {
              const statusKey = key as
                | "all"
                | "available"
                | "assigned-this"
                | "assigned-other";
              let count = 0;

              allTrainees.forEach((student) => {
                const inThisClass = isStudentInThisClass(student);
                const hasOtherClass = !!student.class;
                const inOtherClass = hasOtherClass && !inThisClass;

                if (key === "all") {
                  count++;
                } else if (key === "available") {
                  if (!hasOtherClass && !inThisClass) count++;
                } else if (key === "assigned-this") {
                  if (inThisClass) count++;
                } else if (key === "assigned-other") {
                  if (inOtherClass) count++;
                }
              });

              return (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(statusKey);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === statusKey
                      ? `${color} ring-2 ring-offset-2 ring-offset-background`
                      : `${color} opacity-60 hover:opacity-100`
                  }`}>
                  {label} ({count})
                </button>
              );
            })}
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto border rounded">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">
                    <Checkbox
                      checked={
                        selectedStudents.size === availableStudents.length &&
                        availableStudents.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">السجل المدني</TableHead>
                  <TableHead className="text-right">الرقم العسكري</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : paginatedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground">
                      لا يوجد طلاب متاحين
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => {
                    const inThisClass = isStudentInThisClass(student);
                    const hasOtherClass = !!student.class;
                    return (
                      <TableRow
                        key={student._id}
                        className={
                          hasOtherClass || inThisClass
                            ? "opacity-50 bg-muted"
                            : ""
                        }>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedStudents.has(student._id)}
                            onCheckedChange={() =>
                              handleSelectStudent(student._id)
                            }
                            disabled={hasOtherClass || inThisClass}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {student.full_name}
                        </TableCell>
                        <TableCell className="text-right">
                          {student.civil_id}
                        </TableCell>
                        <TableCell className="text-right">
                          {student.military_id}
                        </TableCell>
                        <TableCell className="text-right">
                          {inThisClass ? (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              معين بهذا الفصل
                            </span>
                          ) : hasOtherClass ? (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              معين بفصل آخر
                            </span>
                          ) : (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              متاح
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
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

          {/* Selected Count */}
          <div className="text-sm text-muted-foreground text-right">
            عدد الطلاب المحددين: {selectedStudents.size}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}>
            إلغاء
          </Button>
          <Button onClick={handleAssignStudents} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري التعيين...
              </>
            ) : (
              "تعيين الطلاب"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
