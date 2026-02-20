import { useState } from "react";
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
import { Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TraineeFormModal } from "@/components/trainees/TraineeFormModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";

interface TraineeForm {
  civil_id: string;
  military_id: string;
  full_name: string;
  rank: string;
  specialty: string;
  shift_id: string;
}

const emptyForm: TraineeForm = {
  civil_id: "",
  military_id: "",
  full_name: "",
  rank: "",
  specialty: "",
  shift_id: "",
};

export default function TraineesPage() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [form, setForm] = useState<TraineeForm>(emptyForm);

  // Mock data
  const trainees = [
    {
      id: "1",
      full_name: "أحمد محمد",
      rank: "جندي",
      civil_id: "123456789",
      military_id: "M123456",
      shift_id: "1",
      specialty: "تقني",
      shift: { name: "الصباحي" },
    },
  ];
  const isLoading = false;

  const saveMutation = {
    mutate: (form: TraineeForm) => {
      toast({ title: editing ? "تم تحديث المتدرب" : "تم إنشاء المتدرب" });
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    isPending: false,
  };

  const filtered = trainees.filter((t: any) =>
    [t.full_name, t.civil_id, t.military_id].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const openEdit = (t: any) => {
    setEditing(t.id);
    setForm({
      civil_id: t.civil_id,
      military_id: t.military_id,
      full_name: t.full_name,
      rank: t.rank ?? "",
      specialty: t.specialty ?? "",
      shift_id: t.shift_id ?? "",
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

  const confirmDelete = () => {
    toast({ title: "تم حذف المتدرب" });
    setDeleteOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetName("");
  };

  const canWrite = role === "admin";

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المتدربون</h1>
          <p className="text-sm text-muted-foreground">
            {trainees?.length ?? 0} متدربون مسجلون
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
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو رقم الهوية..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
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
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-right">
                      {t.military_id}
                    </TableCell>
                    <TableCell className="text-right">{t.civil_id}</TableCell>
                    <TableCell className="font-medium text-right">
                      {t.full_name}
                    </TableCell>
                    <TableCell className="text-right">{t.rank}</TableCell>
                    <TableCell className="text-right">{t.specialty}</TableCell>
                    <TableCell className="text-right">
                      {(t as any).shift?.name ?? "—"}
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
                          onClick={() => openDelete(t.id, t.full_name)}>
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
