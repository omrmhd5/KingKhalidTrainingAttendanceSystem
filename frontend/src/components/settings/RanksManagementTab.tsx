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
import { rankApi } from "@/lib/rankApi";

export function RanksManagementTab() {
  const { toast } = useToast();
  const [ranks, setRanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankName, setRankName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRankId, setEditingRankId] = useState<string | null>(null);
  const [editingRankName, setEditingRankName] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Load ranks on component mount
  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = async () => {
    try {
      setLoading(true);
      const data = await rankApi.getAllRanks();
      setRanks(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الرتب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRank = async () => {
    if (!rankName.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الرتبة",
        variant: "destructive",
      });
      return;
    }
    try {
      const newRank = await rankApi.createRank({ name: rankName });
      setRanks([...ranks, newRank]);
      setRankName("");
      setDialogOpen(false);
      toast({ title: "تم إضافة الرتبة" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل إضافة الرتبة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRank = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await rankApi.deleteRank(deleteTargetId);
        setRanks(ranks.filter((r) => r._id !== deleteTargetId));
        toast({ title: "تم حذف الرتبة" });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل حذف الرتبة",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditRank = (rank: any) => {
    setEditingRankId(rank._id);
    setEditingRankName(rank.name);
    setEditDialogOpen(true);
  };

  const handleUpdateRank = async () => {
    if (!editingRankName.trim() || !editingRankId) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال اسم الرتبة",
        variant: "destructive",
      });
      return;
    }
    try {
      const updatedRank = await rankApi.updateRank(editingRankId, {
        name: editingRankName,
      });
      setRanks(ranks.map((r) => (r._id === editingRankId ? updatedRank : r)));
      setEditDialogOpen(false);
      setEditingRankId(null);
      setEditingRankName("");
      toast({ title: "تم تحديث الرتبة" });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحديث الرتبة",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
        dir="rtl">
        <CardTitle>إدارة الرتب ({ranks.length})</CardTitle>
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
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table dir="rtl" className="border-collapse">
            <TableHeader className="bg-violet-600">
              <TableRow>
                <TableHead className="text-center text-white font-bold py-3 px-4 border-r border-gray-400">
                  الاسم
                </TableHead>
                <TableHead className="text-center text-white font-bold py-3 px-4">
                  الإجراءات
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 px-4 border border-gray-300">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : ranks.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 px-4 border border-gray-300">
                    لا توجد رتب
                  </TableCell>
                </TableRow>
              ) : (
                ranks.map((r, index) => (
                  <TableRow
                    key={r._id}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"} hover:bg-blue-50`}>
                    <TableCell className="font-medium text-center py-2 px-4 border border-gray-300">
                      {r.name}
                    </TableCell>
                    <TableCell className="text-center flex gap-2 justify-center py-2 px-4 border border-gray-300 border-b-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditRank(r)}>
                        <Edit className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRank(r._id, r.name)}>
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
