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
import { rankApi } from "@/lib/rankApi";

export function RanksManagementTab() {
  const { t, i18n } = useTranslation();
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
        title: t("common.error"),
        description: t("ranks.loadFailed"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRank = async () => {
    if (!rankName.trim()) {
      toast({
        title: t("common.error"),
        description: t("ranks.needName"),
        variant: "destructive",
      });
      return;
    }
    try {
      const newRank = await rankApi.createRank({ name: rankName });
      setRanks([...ranks, newRank]);
      setRankName("");
      setDialogOpen(false);
      toast({ title: t("ranks.added") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("ranks.addFailed"),
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
        toast({ title: t("ranks.deleted") });
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        toast({
          title: t("common.error"),
          description: t("ranks.deleteFailed"),
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
        title: t("common.error"),
        description: t("ranks.needName"),
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
      toast({ title: t("ranks.updated") });
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("ranks.updateFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader
        className="flex flex-row items-center justify-between"
       >
        <CardTitle>{t("ranks.count", { count: ranks.length })}</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />{t("ranks.add")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">{t("ranks.newRank")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>{t("common.name")}</Label>
                <Input
                  value={rankName}
                  onChange={(e) => setRankName(e.target.value)}
                  placeholder={t("ranks.namePlaceholder")}
                  required
                />
              </div>
              <Button className="w-full" onClick={handleAddRank}>{t("common.add")}</Button>
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
          itemType={t("trainees.rank")}
        />
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-right">{t("ranks.edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <Label>{t("common.name")}</Label>
                <Input
                  value={editingRankName}
                  onChange={(e) => setEditingRankName(e.target.value)}
                  placeholder={t("ranks.namePlaceholder")}
                  required
                />
              </div>
              <Button className="w-full" onClick={handleUpdateRank}>{t("common.update")}</Button>
            </div>
          </DialogContent>
        </Dialog>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <Table className="border-collapse">
            <TableHeader className="bg-violet-600">
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
              ) : ranks.length === 0 ? (
                <TableRow className="hover:bg-blue-50">
                  <TableCell
                    colSpan={2}
                    className="text-center py-4 px-4 border border-gray-300">{t("ranks.empty")}</TableCell>
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
