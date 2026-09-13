import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { specializationApi } from "@/lib/specializationApi";

export function SpecializationsManagementTab() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [specializationName, setSpecializationName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpecializationId, setEditingSpecializationId] = useState<
    string | null
  >(null);
  const [editingSpecializationName, setEditingSpecializationName] =
    useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Load specializations on component mount
  useEffect(() => {
    loadSpecializations();
  }, []);

  const loadSpecializations = async () => {
    try {
      setLoading(true);
      const data = await specializationApi.getAllSpecializations();
      setSpecializations(data);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("specializations.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialization = async () => {
    if (!specializationName.trim()) {
      toast({
        title: t("common.error"),
        description: t("specializations.needName"),
        variant: "destructive",
      });
      return;
    }
    try {
      const newSpecialization = await specializationApi.createSpecialization({
        name: specializationName,
      });
      setSpecializations([...specializations, newSpecialization]);
      setSpecializationName("");
      setDialogOpen(false);
      toast({ title: t("specializations.added") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("specializations.addFailed"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecialization = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await specializationApi.deleteSpecialization(deleteTargetId);
        setSpecializations(
          specializations.filter((s) => s._id !== deleteTargetId),
        );
        toast({ title: t("specializations.deleted") });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        toast({
          title: t("common.error"),
          description: t("specializations.deleteFailed"),
          variant: "destructive",
        });
      }
    }
  };

  const handleEditSpecialization = (specialization: any) => {
    setEditingSpecializationId(specialization._id);
    setEditingSpecializationName(specialization.name);
    setEditDialogOpen(true);
  };

  const handleUpdateSpecialization = async () => {
    if (!editingSpecializationName.trim() || !editingSpecializationId) {
      toast({
        title: t("common.error"),
        description: t("specializations.needName"),
        variant: "destructive",
      });
      return;
    }
    try {
      const updatedSpecialization =
        await specializationApi.updateSpecialization(editingSpecializationId, {
          name: editingSpecializationName,
        });
      setSpecializations(
        specializations.map((s) =>
          s._id === editingSpecializationId ? updatedSpecialization : s,
        ),
      );
      setEditDialogOpen(false);
      setEditingSpecializationId(null);
      setEditingSpecializationName("");
      toast({ title: t("specializations.updated") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("specializations.updateFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
       >
        <CardTitle>{t("specializations.count", { count: specializations.length })}</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />{t("specializations.add")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">{t("specializations.newSpec")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>{t("common.name")}</Label>
                <Input
                  value={specializationName}
                  onChange={(e) => setSpecializationName(e.target.value)}
                  placeholder={t("specializations.namePlaceholder")}
                  required
                />
              </div>
              <Button className="w-full" onClick={handleAddSpecialization}>{t("common.add")}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <ConfirmDeleteModal
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={confirmDelete}
          itemName={deleteTargetName}
          itemType={t("trainees.specialty")}
        />
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">{t("specializations.edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>{t("common.name")}</Label>
                <Input
                  value={editingSpecializationName}
                  onChange={(e) => setEditingSpecializationName(e.target.value)}
                  placeholder={t("specializations.namePlaceholder")}
                  required
                />
              </div>
              <Button className="w-full" onClick={handleUpdateSpecialization}>{t("common.update")}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table className="border-collapse">
            <TableHeader className="bg-fuchsia-600">
              <TableRow>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  {t("common.name")}
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 px-4 border border-gray-300">{t("common.loading")}</TableCell>
                </TableRow>
              ) : specializations.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 px-4 border border-gray-300">{t("specializations.empty")}</TableCell>
                </TableRow>
              ) : (
                specializations.map((s, index) => (
                  <TableRow
                    key={s._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                    <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-center flex gap-2 justify-center py-2 px-4 border border-gray-300 border-b-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSpecialization(s)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleDeleteSpecialization(s._id, s.name)
                        }>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
