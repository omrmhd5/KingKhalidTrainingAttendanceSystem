import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { getGregorianDateArabic } from "@/lib/utils";
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
  const { t, i18n } = useTranslation();
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
        title: t("common.error"),
        description: t("violations.loadFailed"),
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
          title: t("violations.updated"),
          description: t("violations.updatedDesc"),
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
          title: t("violations.added"),
          description: t("violations.addedDesc", { name: data.full_name }),
          duration: 1500,
        });
      }
    } catch (error) {
      toast({
        title: t("common.error"),
        description: editingViolation
          ? t("violations.updateFailed")
          : t("violations.createFailed"),
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
        title: t("violations.deleted"),
        description: t("violations.deletedDesc"),
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("violations.deleteFailed"),
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const visibleViolations = violations.filter((v) => v.trainee_id);

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h1 className="text-2xl font-bold text-red-600">{t("violations.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("violations.subtitle")}
          </p>
          {visibleViolations.length > 0 && (
            <p className="text-sm text-red-600 font-medium mt-2">
              {t("violations.totalCount", { count: visibleViolations.length })}
            </p>
          )}
        </div>
      </div>

      <Card className="border-r-4 border-r-red-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{t("violations.registered")}</CardTitle>
            <div className="flex gap-2">
              <ExportExcel data={visibleViolations} />
              <ExportPDF data={visibleViolations} />
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
              {t("violations.loadingList")}
            </div>
          ) : visibleViolations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground p-4">
              {t("violations.empty")}
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Table className="border-collapse">
                <TableHeader className="bg-red-600">
                  <TableRow>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      {t("trainees.militaryId")}
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      {t("trainees.civilId")}
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      {t("common.name")}
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      {t("violations.descCol")}
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                      {t("violations.registeredAt")}
                    </TableHead>
                    <TableHead className="text-center text-white font-bold py-3 px-4">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleViolations.map((violation, index) => (
                    <TableRow
                      key={violation._id}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                      <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                        {violation.trainee_id?.military_id ?? "—"}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {violation.trainee_id?.civil_id ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                        {violation.trainee_id?.full_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300 max-w-sm truncate">
                        {violation.description}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
                        {getGregorianDateArabic(violation.createdAt)}
                      </TableCell>
                      <TableCell className="text-center py-2 px-4 border border-gray-300">
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
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-start text-red-600">
              {t("common.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-start">
              {t("violations.confirmDelete")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteViolation}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700">
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
