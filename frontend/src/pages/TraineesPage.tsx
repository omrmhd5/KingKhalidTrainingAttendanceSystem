import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TraineeFormModal } from "@/components/trainees/TraineeFormModal";
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
        toast({
          title: "خطأ",
          description: editing ? "فشل تحديث المتدرب" : "فشل إنشاء المتدرب",
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
        toast({
          title: "خطأ",
          description: "فشل حذف المتدرب",
          variant: "destructive",
        });
      }
    }
  };

  const canWrite = role === "admin";

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المتدربون</h1>
          <p className="text-sm text-muted-foreground">
            {trainees.length} متدربون مسجلون
          </p>
        </div>
        {canWrite && (
          <>
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
            <ConfirmDeleteModal
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onConfirm={confirmDelete}
              itemName={deleteTargetName}
              itemType="المتدرب"
            />
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث حسب: الرقم العسكري أو السجل المدني أو الاسم"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select value={filterRank} onValueChange={setFilterRank}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="جميع الرتب" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">جميع الرتب</SelectItem>
                {ranks?.map((rank) => (
                  <SelectItem key={rank._id} value={rank._id}>
                    {rank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="جميع التخصصات" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">جميع التخصصات</SelectItem>
                {specializations?.map((spec) => (
                  <SelectItem key={spec._id} value={spec._id}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterShift} onValueChange={setFilterShift}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="جميع الشفتات" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="all">جميع الشفتات</SelectItem>
                {shifts?.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
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
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filtered?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground">
                    لم يتم العثور على متدربين
                  </TableCell>
                </TableRow>
              ) : (
                filtered?.map((t: any) => (
                  <TableRow key={t._id}>
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
