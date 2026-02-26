import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";
import { ViolationFormModal, ViolationFormData } from "@/components/violations";

interface Violation {
  id: string;
  military_id: string;
  civil_id: string;
  full_name: string;
  description: string;
  created_at: string;
}

export default function ViolationsPage() {
  const { toast } = useToast();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddViolation = (data: ViolationFormData) => {
    // TODO: Replace with actual API call to fetch trainee details
    // For now, creating mock trainee data based on the ID entered
    const newViolation: Violation = {
      id: Date.now().toString(),
      military_id: data.id_type === "military" ? data.id_number : "غير محدد",
      civil_id: data.id_type === "civil" ? data.id_number : "غير محدد",
      full_name: `المتدرب ${data.id_number}`,
      description: data.description,
      created_at: new Date().toISOString(),
    };

    setViolations([newViolation, ...violations]);
    toast({
      title: "تم إضافة المخالفة",
      description: `تم تسجيل مخالفة جديدة`,
      duration: 1500,
    });
  };

  const handleDeleteViolation = (violationId: string) => {
    setViolations(violations.filter((v) => v.id !== violationId));
    toast({
      title: "تم الحذف",
      description: "تم حذف المخالفة بنجاح",
      duration: 1500,
    });
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
            <ViolationFormModal
              onSubmit={handleAddViolation}
              isLoading={isLoading}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {violations.length === 0 ? (
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
                {violations.map((violation) => (
                  <TableRow
                    key={violation.id}
                    className="bg-orange-50 hover:bg-orange-100">
                    <TableCell className="font-medium text-right">
                      {violation.military_id}
                    </TableCell>
                    <TableCell className="text-right">
                      {violation.civil_id}
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {violation.full_name}
                    </TableCell>
                    <TableCell className="text-right max-w-sm truncate">
                      {violation.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(violation.created_at).toLocaleDateString(
                        "ar-SA",
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteViolation(violation.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
