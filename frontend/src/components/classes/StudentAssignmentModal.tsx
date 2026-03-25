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

interface StudentAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem;
  canWrite?: boolean;
}

export function StudentAssignmentModal({
  open,
  onOpenChange,
  classItem,
  canWrite = true,
}: StudentAssignmentModalProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock data - TODO: Replace with actual API call
  const mockStudents: Student[] = [
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
    {
      _id: "s6",
      full_name: "خالد منصور",
      civil_id: "1234567895",
      military_id: "006",
    },
    {
      _id: "s7",
      full_name: "ليلى حسن",
      civil_id: "1234567896",
      military_id: "007",
    },
    {
      _id: "s8",
      full_name: "يوسف إبراهيم",
      civil_id: "1234567897",
      military_id: "008",
    },
    {
      _id: "s9",
      full_name: "ريم عبدالله",
      civil_id: "1234567898",
      military_id: "009",
    },
    {
      _id: "s10",
      full_name: "أحمد سعيد",
      civil_id: "1234567899",
      military_id: "010",
    },
    {
      _id: "s11",
      full_name: "هناء محمود",
      civil_id: "1234567900",
      military_id: "011",
    },
    {
      _id: "s12",
      full_name: "إبراهيم حسين",
      civil_id: "1234567901",
      military_id: "012",
    },
  ];

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return mockStudents.filter((student) =>
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
      // TODO: Call API to assign students to class
      toast({
        title: "نجاح",
        description: `تم تعيين ${selectedStudents.size} طالب(ة) للفصل`,
      });
      setSelectedStudents(new Set());
      onOpenChange(false);
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
        className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-right">
            تعيين الطلاب للفصل: {classItem.name}
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
                  {canWrite && (
                    <TableHead className="text-center w-12">
                      <Checkbox
                        checked={
                          selectedStudents.size === paginatedStudents.length &&
                          paginatedStudents.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">السجل المدني</TableHead>
                  <TableHead className="text-right">الرقم العسكري</TableHead>
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
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground">
                      لا يوجد طلاب
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student._id}>
                      {canWrite && (
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedStudents.has(student._id)}
                            onCheckedChange={() =>
                              handleSelectStudent(student._id)
                            }
                          />
                        </TableCell>
                      )}
                      <TableCell className="text-right font-medium">
                        {student.full_name}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.civil_id}
                      </TableCell>
                      <TableCell className="text-right">
                        {student.military_id}
                      </TableCell>
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
            {canWrite ? "إلغاء" : "إغلاق"}
          </Button>
          {canWrite && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
