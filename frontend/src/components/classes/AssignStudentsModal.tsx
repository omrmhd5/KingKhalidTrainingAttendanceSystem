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
}

interface ClassItem {
  _id: string;
  name: string;
  studentCount: number;
}

const ITEMS_PER_PAGE = 10;

interface AddStudentsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem;
}

export function AddStudentsModal({
  open,
  onOpenChange,
  classItem,
}: AddStudentsModalProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set(),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Mock data - All available students (not in this class)
  // TODO: Replace with actual API call
  const availableStudents: Student[] = [
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
    {
      _id: "s13",
      full_name: "مريم محمد",
      civil_id: "1234567902",
      military_id: "013",
    },
    {
      _id: "s14",
      full_name: "علي حسن",
      civil_id: "1234567903",
      military_id: "014",
    },
    {
      _id: "s15",
      full_name: "زينب علي",
      civil_id: "1234567904",
      military_id: "015",
    },
  ];

  // Filter students by search
  const filteredStudents = useMemo(() => {
    return availableStudents.filter((student) =>
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

          {/* Students Table */}
          <div className="overflow-x-auto border rounded">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-12">
                    <Checkbox
                      checked={
                        selectedStudents.size === paginatedStudents.length &&
                        paginatedStudents.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
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
                      لا يوجد طلاب متاحين
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedStudents.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selectedStudents.has(student._id)}
                          onCheckedChange={() =>
                            handleSelectStudent(student._id)
                          }
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
