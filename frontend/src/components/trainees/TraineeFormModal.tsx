import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { shiftApi } from "@/lib/shiftApi";

interface TraineeForm {
  civil_id: string;
  military_id: string;
  full_name: string;
  rank: string;
  specialty: string;
  shift_id: string;
}

interface TraineeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (form: TraineeForm) => void;
  form: TraineeForm;
  setForm: (form: TraineeForm) => void;
  editing: string | null;
  isLoading: boolean;
}

export function TraineeFormModal({
  open,
  onOpenChange,
  onSubmit,
  form,
  setForm,
  editing,
  isLoading,
}: TraineeFormModalProps) {
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    try {
      setShiftsLoading(true);
      const data = await shiftApi.getAllShifts();
      setShifts(data);
    } catch (error) {
      console.error("Failed to load shifts:", error);
    } finally {
      setShiftsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة متدرب
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-right">
            {editing ? "تعديل المتدرب" : "متدرب جديد"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>الرقم العسكري</Label>
            <Input
              value={form.military_id}
              onChange={(e) =>
                setForm({ ...form, military_id: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-1">
            <Label>السجل المدني</Label>
            <Input
              value={form.civil_id}
              onChange={(e) => setForm({ ...form, civil_id: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>الاسم</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>الرتبة</Label>
            <Input
              value={form.rank}
              onChange={(e) => setForm({ ...form, rank: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>التخصص</Label>
            <Input
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>الشفت</Label>
            <Select
              value={form.shift_id}
              onValueChange={(v) => setForm({ ...form, shift_id: v })}>
              <SelectTrigger disabled={shiftsLoading} dir="rtl">
                <SelectValue
                  placeholder={shiftsLoading ? "جاري التحميل..." : "اختر الشفت"}
                />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {shifts?.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
