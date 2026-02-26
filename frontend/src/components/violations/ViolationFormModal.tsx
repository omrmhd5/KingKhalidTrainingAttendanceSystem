import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { traineeApi } from "@/lib/traineeApi";

interface ViolationFormModalProps {
  onSubmit: (data: ViolationFormData) => void;
  isLoading?: boolean;
  editingViolation?: {
    _id: string;
    description: string;
    trainee_id: {
      _id: string;
      military_id: string;
      civil_id: string;
      full_name: string;
    };
  } | null;
  onEditModeChange?: (editing: boolean) => void;
}

export interface ViolationFormData {
  trainee_id: string;
  military_id: string;
  civil_id: string;
  full_name: string;
  id_type: "military" | "civil";
  id_number: string;
  description: string;
}

export function ViolationFormModal({
  onSubmit,
  isLoading = false,
  editingViolation = null,
  onEditModeChange,
}: ViolationFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!editingViolation);
  const [form, setForm] = useState<
    Omit<
      ViolationFormData,
      "trainee_id" | "military_id" | "civil_id" | "full_name"
    >
  >({
    id_type: editingViolation ? "military" : "military",
    id_number: editingViolation ? editingViolation.trainee_id.military_id : "",
    description: editingViolation?.description || "",
  });

  // Update open state when editingViolation changes
  useEffect(() => {
    if (editingViolation) {
      setOpen(true);
      setIsEditMode(true);
      setForm({
        id_type: "military",
        id_number: editingViolation.trainee_id.military_id,
        description: editingViolation.description,
      });
    }
  }, [editingViolation]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && isEditMode) {
      onEditModeChange?.(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.description.trim()) {
      toast({
        title: "تحذير",
        description: "يرجى إدخال وصف المخالفة",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    try {
      setIsSearching(true);

      // Handle edit mode - only update description
      if (isEditMode && editingViolation) {
        onSubmit({
          trainee_id: editingViolation.trainee_id._id || "",
          military_id: editingViolation.trainee_id.military_id,
          civil_id: editingViolation.trainee_id.civil_id,
          full_name: editingViolation.trainee_id.full_name,
          id_type: form.id_type,
          id_number: form.id_number,
          description: form.description,
        });
        setForm({
          id_type: "military",
          id_number: "",
          description: "",
        });
        handleOpenChange(false);
        return;
      }

      // Handle create mode - search for trainee
      if (!form.id_number.trim()) {
        toast({
          title: "تحذير",
          description: "يرجى إدخال الرقم",
          variant: "destructive",
          duration: 1500,
        });
        return;
      }

      // Search for trainee using the ID
      const trainees = await traineeApi.searchByIds(
        [form.id_number],
        form.id_type,
      );

      if (!trainees || trainees.length === 0) {
        toast({
          title: "لم يتم العثور على المتدرب",
          description: `لا يوجد متدرب برقم ${form.id_type === "military" ? "عسكري" : "مدني"}: ${form.id_number}`,
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      const trainee = trainees[0];

      // Call onSubmit with trainee data
      onSubmit({
        trainee_id: trainee._id,
        military_id: trainee.military_id,
        civil_id: trainee.civil_id,
        full_name: trainee.full_name,
        id_type: form.id_type,
        id_number: form.id_number,
        description: form.description,
      });

      setForm({
        id_type: "military",
        id_number: "",
        description: "",
      });
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء البحث عن المتدرب",
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-red-600 hover:bg-red-700">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مخالفة
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-md border-r-4 border-r-red-600">
        <DialogHeader>
          <DialogTitle className="text-right text-red-600">
            {isEditMode ? "تحرير المخالفة" : "تسجيل مخالفة جديدة"}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          {isEditMode && editingViolation ? (
            <div className="space-y-2 p-3 bg-red-50 rounded-md">
              <div>
                <p className="text-xs text-muted-foreground">الرقم العسكري</p>
                <p className="font-medium">
                  {editingViolation.trainee_id.military_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">السجل المدني</p>
                <p className="font-medium">
                  {editingViolation.trainee_id.civil_id}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">الاسم</p>
                <p className="font-medium">
                  {editingViolation.trainee_id.full_name}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium block">نوع الرقم</label>
                <RadioGroup
                  value={form.id_type}
                  onValueChange={(value) =>
                    setForm({ ...form, id_type: value as "military" | "civil" })
                  }>
                  <div className="flex justify-end items-center space-x-2">
                    <Label
                      htmlFor="military"
                      className="cursor-pointer font-normal">
                      رقم عسكري
                    </Label>
                    <RadioGroupItem value="military" id="military" />
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    <Label
                      htmlFor="civil"
                      className="cursor-pointer font-normal">
                      سجل مدني
                    </Label>
                    <RadioGroupItem value="civil" id="civil" />
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="id_number" className="text-sm font-medium">
                  الرقم *
                </Label>
                <Input
                  id="id_number"
                  type="number"
                  placeholder={
                    form.id_type === "military"
                      ? "أدخل الرقم العسكري"
                      : "أدخل رقم السجل المدني"
                  }
                  value={form.id_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers
                    if (value === "" || /^\d+$/.test(value)) {
                      setForm({ ...form, id_number: value });
                    }
                  }}
                  dir="rtl"
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              وصف المخالفة *
            </Label>
            <Textarea
              id="description"
              placeholder="أدخل تفاصيل المخالفة"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="min-h-24"
              dir="rtl"
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSearching}
              className="bg-red-600 hover:bg-red-700">
              {isSearching
                ? "جاري البحث..."
                : isLoading
                  ? isEditMode
                    ? "جاري التحديث..."
                    : "جاري الحفظ..."
                  : isEditMode
                    ? "تحديث المخالفة"
                    : "حفظ المخالفة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
