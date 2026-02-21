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
import { rankApi } from "@/lib/rankApi";
import { specializationApi } from "@/lib/specializationApi";

interface TraineeForm {
  civil_id: string;
  military_id: string;
  full_name: string;
  rank_id: string;
  specialty_id: string;
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
  const [ranks, setRanks] = useState<any[]>([]);
  const [ranksLoading, setRanksLoading] = useState(false);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [specializationsLoading, setSpecializationsLoading] = useState(false);

  useEffect(() => {
    loadShifts();
    loadRanks();
    loadSpecializations();
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

  const loadRanks = async () => {
    try {
      setRanksLoading(true);
      const data = await rankApi.getAllRanks();
      setRanks(data);
    } catch (error) {
      console.error("Failed to load ranks:", error);
    } finally {
      setRanksLoading(false);
    }
  };

  const loadSpecializations = async () => {
    try {
      setSpecializationsLoading(true);
      const data = await specializationApi.getAllSpecializations();
      setSpecializations(data);
    } catch (error) {
      console.error("Failed to load specializations:", error);
    } finally {
      setSpecializationsLoading(false);
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
        <style>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>الرقم العسكري</Label>
            <Input
              type="number"
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
              type="number"
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
            <Select
              value={form.rank_id}
              onValueChange={(v) => setForm({ ...form, rank_id: v })}>
              <SelectTrigger disabled={ranksLoading} dir="rtl">
                <SelectValue
                  placeholder={ranksLoading ? "جاري التحميل..." : "اختر الرتبة"}
                />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {ranks?.map((rank) => (
                  <SelectItem key={rank._id} value={rank._id}>
                    {rank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>التخصص</Label>
            <Select
              value={form.specialty_id}
              onValueChange={(v) => setForm({ ...form, specialty_id: v })}>
              <SelectTrigger disabled={specializationsLoading} dir="rtl">
                <SelectValue
                  placeholder={
                    specializationsLoading ? "جاري التحميل..." : "اختر التخصص"
                  }
                />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {specializations?.map((specialization) => (
                  <SelectItem
                    key={specialization._id}
                    value={specialization._id}>
                    {specialization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
