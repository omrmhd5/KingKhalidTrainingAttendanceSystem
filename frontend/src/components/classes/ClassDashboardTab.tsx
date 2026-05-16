import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { getGregorianDateArabic } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ReportedItem {
  _id: string;
  studentName: string;
  studentId: string;
  className: string;
  teacherName: string;
  type: "absence" | "escape";
  date: string;
  notes?: string;
}

interface ClassDashboardTabProps {
  canWrite?: boolean;
}

export function ClassDashboardTab({ canWrite = true }: ClassDashboardTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<"absence" | "escape">("absence");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [reports, setReports] = useState<ReportedItem[]>([]);
  const [classes, setClasses] = useState<Array<{ _id: string; name: string }>>(
    [],
  );

  useEffect(() => {
    loadClasses();
    loadReports();
  }, [reportType, selectedClass]);

  const loadClasses = async () => {
    try {
      // TODO: Replace with actual API call
      const mockClasses = [
        { _id: "c1", name: "الفصل الأول" },
        { _id: "c2", name: "الفصل الثاني" },
        { _id: "c3", name: "الفصل الثالث" },
      ];
      setClasses(mockClasses);
      if (!selectedClass && mockClasses.length > 0) {
        setSelectedClass(mockClasses[0]._id);
      }
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      const mockReports: ReportedItem[] = [
        {
          _id: "r1",
          studentName: "محمد أحمد",
          studentId: "001",
          className: "الفصل الأول",
          teacherName: "معلم1",
          type: "absence",
          date: "2026-03-23",
          notes: "غياب بدون عذر",
        },
        {
          _id: "r2",
          studentName: "فاطمة علي",
          studentId: "002",
          className: "الفصل الأول",
          teacherName: "معلم1",
          type: "escape",
          date: "2026-03-23",
          notes: "هروب من الفصل",
        },
        {
          _id: "r3",
          studentName: "عمر محمد",
          studentId: "003",
          className: "الفصل الأول",
          teacherName: "معلم1",
          type: "absence",
          date: "2026-03-22",
          notes: "غياب بعذر طبي",
        },
      ];

      const filtered = mockReports.filter(
        (r) =>
          r.type === reportType &&
          (!selectedClass || r.className === selectedClass),
      );

      setReports(filtered);
    } catch (error: unknown) {
      toast({
        title: "خطأ",
        description: "فشل في تحميل التقارير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: "absence" | "escape") => {
    return type === "absence" ? "الغياب" : "الهروب";
  };

  const getTypeColor = (type: "absence" | "escape") => {
    return type === "absence"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-end" dir="rtl">
        <div className="flex-1">
          <label className="text-sm font-medium text-right block mb-2">
            نوع التقرير
          </label>
          <Select
            value={reportType}
            onValueChange={(v: string) =>
              setReportType(v as "absence" | "escape")
            }>
            <SelectTrigger dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl" className="flex-row-reverse">
              <SelectItem value="absence">الغياب</SelectItem>
              <SelectItem value="escape">الهروب</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-right block mb-2">
            الفصل
          </label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger dir="rtl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent dir="rtl" className="flex-row-reverse">
              {classes.map((cls) => (
                <SelectItem key={cls._id} value={cls._id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-right">
              إجمالي التقارير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>

        {reportType === "absence" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-right text-yellow-800">
                عدد الغيابات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-800">
                {reports.length}
              </div>
            </CardContent>
          </Card>
        )}

        {reportType === "escape" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-right text-red-800">
                عدد الهروب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">
                {reports.length}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-right">
              الطلاب المتأثرين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(reports.map((r) => r.studentId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {getTypeLabel(reportType)} -{" "}
            {selectedClass
              ? classes.find((c) => c._id === selectedClass)?.name
              : "الكل"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table dir="rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الطالب</TableHead>
                    <TableHead className="text-right">رقم الطالب</TableHead>
                    <TableHead className="text-right">الفصل</TableHead>
                    <TableHead className="text-right">المعلم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground">
                        لا توجد تقارير
                      </TableCell>
                    </TableRow>
                  ) : (
                    reports.map((report) => (
                      <TableRow key={report._id}>
                        <TableCell className="font-medium text-right">
                          {report.studentName}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.studentId}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.className}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.teacherName}
                        </TableCell>
                        <TableCell className="text-right">
                          {getGregorianDateArabic(report.date)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          {report.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
