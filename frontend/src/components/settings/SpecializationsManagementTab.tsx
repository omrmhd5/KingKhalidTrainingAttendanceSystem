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
        title: "خطأ",
        description: "فشل تحميل التخصصات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecialization = async () => {
    if (!specializationName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم التخصص",
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
      toast({ title: "تم إضافة التخصص" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة التخصص",
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
        toast({ title: "تم حذف التخصص" });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل حذف التخصص",
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
        title: "خطأ",
        description: "الرجاء إدخال اسم التخصص",
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
      toast({ title: "تم تحديث التخصص" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث التخصص",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>إدارة التخصصات</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة تخصص
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">تخصص جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={specializationName}
                  onChange={(e) => setSpecializationName(e.target.value)}
                  placeholder="أدخل اسم التخصص"
                  required
                />
              </div>
              <Button className="w-full" onClick={handleAddSpecialization}>
                إضافة
              </Button>
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
          itemType="التخصص"
        />
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل التخصص</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={editingSpecializationName}
                  onChange={(e) => setEditingSpecializationName(e.target.value)}
                  placeholder="أدخل اسم التخصص"
                  required
                />
              </div>
              <Button className="w-full" onClick={handleUpdateSpecialization}>
                تحديث
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">الاسم</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  جاري التحميل...
                </TableCell>
              </TableRow>
            ) : specializations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  لا توجد تخصصات
                </TableCell>
              </TableRow>
            ) : (
              specializations.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-medium text-right">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditSpecialization(s)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSpecialization(s._id, s.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
