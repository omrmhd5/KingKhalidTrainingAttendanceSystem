import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertCircle, Edit2 } from "lucide-react";
import {
  DisciplinaryFormModal,
  DisciplinaryFormData,
  ExportExcel,
  ExportPDF,
} from "@/components/disciplinary";
import { disciplinaryApi } from "@/lib/disciplinaryApi";

interface Disciplinary {
  _id: string;
  trainee_id: {
    _id: string;
    military_id: string;
    civil_id: string;
    full_name: string;
  } | null;
  reason: string;
  createdAt: string;
}

export default function DisciplinaryPage() {
  const { toast } = useToast();
  const [disciplinary, setDisciplinary] = useState<Disciplinary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDisciplinary, setIsLoadingDisciplinary] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDisciplinary, setEditingDisciplinary] =
    useState<Disciplinary | null>(null);

  // Fetch disciplinary requests on mount
  useEffect(() => {
    fetchDisciplinary();
  }, []);

  const fetchDisciplinary = async () => {
    try {
      setIsLoadingDisciplinary(true);
      const data = await disciplinaryApi.getAllDisciplinary();
      setDisciplinary(data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الطلبات",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoadingDisciplinary(false);
    }
  };

  const handleAddDisciplinary = async (data: DisciplinaryFormData) => {
    try {
      setIsLoading(true);

      if (editingDisciplinary) {
        // Update reason only
        const updatedDisciplinary = await disciplinaryApi.updateDisciplinary(
          editingDisciplinary._id,
          data.reason,
        );
        setDisciplinary(
          disciplinary.map((d) =>
            d._id === editingDisciplinary._id ? updatedDisciplinary : d,
          ),
        );
        toast({
          title: "تم التحديث",
          description: "تم تحديث سبب الاستدعاء بنجاح",
          duration: 1500,
        });
        setEditingDisciplinary(null);
      } else {
        // Create disciplinary request using the API
        const newDisciplinary = await disciplinaryApi.createDisciplinary(
          data.trainee_id,
          data.reason,
        );
        setDisciplinary([newDisciplinary, ...disciplinary]);
        toast({
          title: "تم إضافة الطلب",
          description: `تم تسجيل طلب جديد لـ ${data.full_name}`,
          duration: 1500,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تسجيل الطلب",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDisciplinary = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      await disciplinaryApi.deleteDisciplinary(deleteConfirm);
      setDisciplinary(disciplinary.filter((d) => d._id !== deleteConfirm));
      toast({
        title: "تم الحذف",
        description: "تم حذف الطلب بنجاح",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف الطلب",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-blue-600">طلبات الانضباط</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            قم بتسجيل طلبات الانضباط ومتابعتها
          </p>
          {disciplinary.length > 0 && (
            <p className="text-sm text-blue-600 font-medium mt-2">
              إجمالي الطلبات: {disciplinary.length}
            </p>
          )}
        </div>
      </div>

      <Card className="border-r-4 border-r-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">الطلبات المسجلة</CardTitle>
            <div className="flex gap-2">
              <ExportExcel data={disciplinary} />
              <ExportPDF data={disciplinary} />
              <DisciplinaryFormModal
                onSubmit={handleAddDisciplinary}
                isLoading={isLoading}
                editingDisciplinary={editingDisciplinary}
                onEditModeChange={(editing) => {
                  if (!editing) setEditingDisciplinary(null);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingDisciplinary ? (
            <div className="text-center py-8 text-muted-foreground p-4">
              جاري تحميل الطلبات...
            </div>
          ) : disciplinary.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground p-4">
              لا توجد طلبات مسجلة حتى الآن
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Table className="border-collapse">
                <TableHeader className="bg-blue-600">
                  <TableRow>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      الرقم العسكري
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      السجل المدني
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      الاسم
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      سبب الاستدعاء
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      تاريخ التسجيل
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4">
                      الإجراءات
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disciplinary
                    .filter((r) => r.trainee_id)
                    .map((request, index) => (
                      <TableRow
                        key={request._id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                        <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                          {request.trainee_id?.military_id ?? "—"}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          {request.trainee_id?.civil_id ?? "—"}
                        </TableCell>
                        <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                          {request.trainee_id?.full_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          {request.reason ?? "—"}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          {new Date(request.createdAt).toLocaleDateString(
                            "ar-SA",
                          )}
                        </TableCell>
                        <TableCell className="text-center py-2 px-4 border border-gray-300">
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingDisciplinary(request)}>
                              <Edit2 className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirm(request._id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-blue-600">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDisciplinary}
              disabled={isDeleting}
              className="bg-blue-600 hover:bg-blue-700">
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
