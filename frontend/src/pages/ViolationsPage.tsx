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
import { Trash2, AlertTriangle, Edit2 } from "lucide-react";
import {
  ViolationFormModal,
  ViolationFormData,
  ExportExcel,
  ExportPDF,
} from "@/components/violations";
import { violationApi } from "@/lib/violationApi";

interface Violation {
  _id: string;
  trainee_id: {
    _id: string;
    military_id: string;
    civil_id: string;
    full_name: string;
  } | null;
  description: string;
  createdAt: string;
}

export default function ViolationsPage() {
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingViolations, setIsLoadingViolations] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingViolation, setEditingViolation] = useState<Violation | null>(
    null,
  );

  // Fetch violations on mount
  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      setIsLoadingViolations(true);
      const data = await violationApi.getAllViolations();
      setViolations(data || []);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المخالفات",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoadingViolations(false);
    }
  };

  const handleAddViolation = async (data: ViolationFormData) => {
    try {
      setIsLoading(true);

      // Check if editing or creating
      if (editingViolation) {
        // Update violation (description only)
        const updatedViolation = await violationApi.updateViolation(
          editingViolation._id,
          data.description,
        );

        // Update local state
        setViolations(
          violations.map((v) =>
            v._id === editingViolation._id ? updatedViolation : v,
          ),
        );

        toast({
          title: "تم التحديث",
          description: "تم تحديث المخالفة بنجاح",
          duration: 1500,
        });

        setEditingViolation(null);
      } else {
        // Create violation using the API
        const newViolation = await violationApi.createViolation(
          data.trainee_id,
          data.description,
        );

        // Add to local state
        setViolations([newViolation, ...violations]);

        toast({
          title: "تم إضافة المخالفة",
          description: `تم تسجيل مخالفة جديدة لـ ${data.full_name}`,
          duration: 1500,
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: editingViolation
          ? "فشل تحديث المخالفة"
          : "فشل تسجيل المخالفة",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteViolation = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      await violationApi.deleteViolation(deleteConfirm);
      setViolations(violations.filter((v) => v._id !== deleteConfirm));
      toast({
        title: "تم الحذف",
        description: "تم حذف المخالفة بنجاح",
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل حذف المخالفة",
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
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-red-600">تسجيل المخالفين</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            قم بتسجيل مخالفات المتدربين ومتابعتها
          </p>
          {violations.length > 0 && (
            <p className="text-sm text-red-600 font-medium mt-2">
              إجمالي المخالفات: {violations.length}
            </p>
          )}
        </div>
      </div>

      <Card className="border-r-4 border-r-red-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">المخالفات المسجلة</CardTitle>
            <div className="flex gap-2">
              <ExportExcel data={violations} />
              <ExportPDF data={violations} />
              <ViolationFormModal
                onSubmit={handleAddViolation}
                isLoading={isLoading}
                editingViolation={editingViolation}
                onEditModeChange={(editing) => {
                  if (!editing) {
                    setEditingViolation(null);
                  }
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingViolations ? (
            <div className="text-center py-8 text-muted-foreground p-4">
              جاري تحميل المخالفات...
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground p-4">
              لا توجد مخالفات مسجلة حتى الآن
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-red-50">
                <TableRow>
                  <TableHead className="text-right text-red-700 font-bold">
                    الرقم العسكري
                  </TableHead>
                  <TableHead className="text-right text-red-700 font-bold">
                    السجل المدني
                  </TableHead>
                  <TableHead className="text-right text-red-700 font-bold">
                    الاسم
                  </TableHead>
                  <TableHead className="text-right text-red-700 font-bold">
                    وصف المخالفة
                  </TableHead>
                  <TableHead className="text-right text-red-700 font-bold">
                    تاريخ التسجيل
                  </TableHead>
                  <TableHead className="text-center text-red-700 font-bold">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations
                  .filter((v) => v.trainee_id)
                  .map((violation) => (
                    <TableRow
                      key={violation._id}
                      className="bg-orange-50 hover:bg-orange-100">
                      <TableCell className="font-medium text-right">
                        {violation.trainee_id?.military_id ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {violation.trainee_id?.civil_id ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium text-right">
                        {violation.trainee_id?.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right max-w-sm truncate">
                        {violation.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Date(violation.createdAt).toLocaleDateString(
                          "ar-SA",
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingViolation(violation)}>
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(violation._id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right text-red-600">
              تأكيد الحذف
            </AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              هل أنت متأكد من حذف هذه المخالفة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteViolation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
