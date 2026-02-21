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

export function RanksManagementTab() {
  const { toast } = useToast();
  const [ranks, setRanks] = useState<any[]>([
    { id: "1", name: "جندي" },
    { id: "2", name: "عريف" },
  ]);
  const [rankName, setRankName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [editingRankName, setEditingRankName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  const handleAddRank = () => {
    if (!rankName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الرتبة",
        variant: "destructive",
      });
      return;
    }
    const newRank = {
      id: Math.random().toString(),
      name: rankName,
    };
    setRanks([...ranks, newRank]);
    setRankName("");
    setDialogOpen(false);
    toast({ title: "تم إضافة الرتبة" });
  };

  const handleDeleteRank = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTargetId) {
      setRanks(ranks.filter((r) => r.id !== deleteTargetId));
      toast({ title: "تم حذف الرتبة" });
      setDeleteTargetId(null);
      setDeleteTargetName("");
    }
  };

  const handleEditRank = (rank: any) => {
    setEditingRankId(rank.id);
    setEditingRankName(rank.name);
    setEditDialogOpen(true);
  };

  const handleUpdateRank = () => {
    if (!editingRankName.trim() || !editingRankId) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الرتبة",
        variant: "destructive",
      });
      return;
    }
    setRanks(
      ranks.map((r) =>
        r.id === editingRankId ? { ...r, name: editingRankName } : r,
      ),
    );
    setEditDialogOpen(false);
    setEditingRankId(null);
    setEditingRankName("");
    toast({ title: "تم تحديث الرتبة" });
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>إدارة الرتب</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              إضافة رتبة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">رتبة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={rankName}
                  onChange={(e) => setRankName(e.target.value)}
                  placeholder="أدخل اسم الرتبة"
                  required
                />
              </div>
              <Button className="w-full" onClick={handleAddRank}>
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
          itemType="الرتبة"
        />
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">تعديل الرتبة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>الاسم</Label>
                <Input
                  value={editingRankName}
                  onChange={(e) => setEditingRankName(e.target.value)}
                  placeholder="أدخل اسم الرتبة"
                  required
                />
              </div>
              <Button className="w-full" onClick={handleUpdateRank}>
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
            {ranks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  لا توجد رتب
                </TableCell>
              </TableRow>
            ) : (
              ranks.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium text-right">
                    {r.name}
                  </TableCell>
                  <TableCell className="text-right flex gap-2 justify-start">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditRank(r)}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRank(r.id, r.name)}>
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
