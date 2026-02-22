import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Edit, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { TraineeFormModal } from "@/components/trainees/TraineeFormModal";
import { TraineeSearchFilters } from "@/components/trainees/TraineeSearchFilters";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { traineeApi } from "@/lib/traineeApi";
import { rankApi } from "@/lib/rankApi";
import { specializationApi } from "@/lib/specializationApi";
import { shiftApi } from "@/lib/shiftApi";

interface TraineeForm {
  civil_id: string;
  military_id: string;
  full_name: string;
  rank_id: string;
  specialty_id: string;
  shift_id: string;
}

const emptyForm: TraineeForm = {
  civil_id: "",
  military_id: "",
  full_name: "",
  rank_id: "",
  specialty_id: "",
  shift_id: "",
};

export default function TraineesPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterRank, setFilterRank] = useState("all");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterShift, setFilterShift] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [form, setForm] = useState<TraineeForm>(emptyForm);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ranks, setRanks] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<Set<string>>(
    new Set(),
  );
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Load trainees on component mount
  useEffect(() => {
    loadTrainees();
    loadFilters();
  }, []);

  const loadTrainees = async () => {
    try {
      setIsLoading(true);
      const data = await traineeApi.getAllTrainees();
      setTrainees(data);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل المتدربين",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const [ranksData, specializationsData, shiftsData] = await Promise.all([
        rankApi.getAllRanks(),
        specializationApi.getAllSpecializations(),
        shiftApi.getAllShifts(),
      ]);
      setRanks(ranksData);
      setSpecializations(specializationsData);
      setShifts(shiftsData);
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  };

  const saveMutation = {
    mutate: async (formData: TraineeForm) => {
      try {
        setIsSaving(true);
        if (editing) {
          // Update existing trainee
          const updated = await traineeApi.updateTrainee(editing, formData);
          setTrainees(trainees.map((t) => (t._id === editing ? updated : t)));
          toast({ title: "تم تحديث المتدرب" });
        } else {
          // Create new trainee
          const newTrainee = await traineeApi.createTrainee(formData);
          setTrainees([...trainees, newTrainee]);
          toast({ title: "تم إنشاء المتدرب" });
        }
        setDialogOpen(false);
        setEditing(null);
        setForm(emptyForm);
      } catch (error) {
        const errorMessage =
          (error as Error)?.message ||
          (editing ? "فشل تحديث المتدرب" : "فشل إنشاء المتدرب");
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    isPending: isSaving,
  };

  const filtered = trainees.filter((t: any) => {
    const matchesSearch = [t.full_name, t.civil_id, t.military_id].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    );
    const matchesRank =
      !filterRank || filterRank === "all" || t.rank_id?._id === filterRank;
    const matchesSpecialty =
      !filterSpecialty ||
      filterSpecialty === "all" ||
      t.specialty_id?._id === filterSpecialty;
    const matchesShift =
      !filterShift || filterShift === "all" || t.shift_id?._id === filterShift;

    return matchesSearch && matchesRank && matchesSpecialty && matchesShift;
  });

  const openEdit = (t: any) => {
    setEditing(t._id);
    setForm({
      civil_id: t.civil_id,
      military_id: t.military_id,
      full_name: t.full_name,
      rank_id: (t.rank_id?._id || t.rank_id) ?? "",
      specialty_id: (t.specialty_id?._id || t.specialty_id) ?? "",
      shift_id: (t.shift_id?._id || t.shift_id) ?? "",
    });
    setDialogOpen(true);
  };

  const openDelete = (id: string, name: string) => {
    setDeleteTargetId(id);
    setDeleteTargetName(name);
    setDeleteOpen(true);
  };

  const handleSubmit = (formData: TraineeForm) => {
    saveMutation.mutate(formData);
  };

  const confirmDelete = async () => {
    if (deleteTargetId) {
      try {
        await traineeApi.deleteTrainee(deleteTargetId);
        setTrainees(trainees.filter((t) => t._id !== deleteTargetId));
        toast({ title: "تم حذف المتدرب" });
        setDeleteOpen(false);
        setDeleteTargetId(null);
        setDeleteTargetName("");
      } catch (error) {
        const errorMessage = (error as Error)?.message || "فشل حذف المتدرب";
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const canWrite = role === "admin";

  const toggleSelectTrainee = (id: string) => {
    const newSelected = new Set(selectedTrainees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTrainees(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedTrainees.size === filtered.length && filtered.length > 0) {
      setSelectedTrainees(new Set());
    } else {
      setSelectedTrainees(new Set(filtered.map((t) => t._id)));
    }
  };

  const handleBulkDelete = () => {
    if (selectedTrainees.size === 0) return;
    setBulkDeleteOpen(true);
  };

  const confirmBulkDelete = async () => {
    try {
      const selectedArray = Array.from(selectedTrainees);
      await Promise.all(
        selectedArray.map((id) => traineeApi.deleteTrainee(id)),
      );
      setTrainees(trainees.filter((t) => !selectedTrainees.has(t._id)));
      setSelectedTrainees(new Set());
      setBulkDeleteOpen(false);
      toast({
        title: "تم الحذف",
        description: `تم حذف ${selectedArray.length} متدرب`,
      });
    } catch (error) {
      const errorMessage =
        (error as Error)?.message || "فشل حذف المتدربين المحددين";
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المتدربون</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} متدربون معروضون{" "}
            {filtered.length !== trainees.length && `من ${trainees.length}`}
          </p>
          <div
            className="mt-3 space-y-1 text-sm text-muted-foreground"
            dir="rtl">
            <p>إجمالي: {trainees.length} متدرب</p>
            {shifts.map((shift: any) => {
              const count = trainees.filter(
                (t: any) => t.shift_id?._id === shift._id,
              ).length;
              return (
                <p key={shift._id} dir="ltr">
                  {count} :{shift.name}
                </p>
              );
            })}
          </div>
        </div>
        {canWrite && (
          <>
            <div className="flex gap-2">
              {selectedTrainees.size > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  size="sm">
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف ({selectedTrainees.size})
                </Button>
              )}
              <TraineeFormModal
                open={dialogOpen}
                onOpenChange={(o) => {
                  setDialogOpen(o);
                  if (!o) {
                    setEditing(null);
                    setForm(emptyForm);
                  }
                }}
                onSubmit={handleSubmit}
                form={form}
                setForm={setForm}
                editing={editing}
                isLoading={saveMutation.isPending}
              />
            </div>
            <ConfirmDeleteModal
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onConfirm={confirmDelete}
              itemName={deleteTargetName}
              itemType="المتدرب"
            />
            <ConfirmDeleteModal
              open={bulkDeleteOpen}
              onOpenChange={setBulkDeleteOpen}
              onConfirm={confirmBulkDelete}
              itemName={`${selectedTrainees.size} متدربي`}
              itemType="المتدربين"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <TraineeSearchFilters
            search={search}
            onSearchChange={setSearch}
            filterRank={filterRank}
            onRankChange={setFilterRank}
            filterSpecialty={filterSpecialty}
            onSpecialtyChange={setFilterSpecialty}
            filterShift={filterShift}
            onShiftChange={setFilterShift}
            ranks={ranks}
            specializations={specializations}
            shifts={shifts}
          />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-12">
                  <Checkbox
                    checked={
                      selectedTrainees.size === filtered.length &&
                      filtered.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-right">الرقم العسكري</TableHead>
                <TableHead className="text-right">السجل المدني</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الرتبة</TableHead>
                <TableHead className="text-right">التخصص</TableHead>
                <TableHead className="text-right">الشفت</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground">
                    لم يتم العثور على متدربين
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((t: any) => (
                  <TableRow key={t._id}>
                    <TableCell className="text-center w-12">
                      <Checkbox
                        checked={selectedTrainees.has(t._id)}
                        onCheckedChange={() => toggleSelectTrainee(t._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-right">
                      {t.military_id}
                    </TableCell>
                    <TableCell className="text-right">{t.civil_id}</TableCell>
                    <TableCell className="font-medium text-right">
                      {t.full_name}
                    </TableCell>
                    <TableCell className="text-right">
                      {(t as any).rank_id?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {(t as any).specialty_id?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {(t as any).shift_id?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDelete(t._id, t.full_name)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
