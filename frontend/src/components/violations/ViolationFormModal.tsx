import { useState } from "react";
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

interface ViolationFormModalProps {
  onSubmit: (data: ViolationFormData) => void;
  isLoading?: boolean;
}

export interface ViolationFormData {
  id_type: "military" | "civil";
  id_number: string;
  description: string;
}

export function ViolationFormModal({
  onSubmit,
  isLoading = false,
}: ViolationFormModalProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ViolationFormData>({
    id_type: "military",
    id_number: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.id_number.trim()) {
      toast({
        title: "تحذير",
        description: "يرجى إدخال الرقم",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    if (!form.description.trim()) {
      toast({
        title: "تحذير",
        description: "يرجى إدخال وصف المخالفة",
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    onSubmit(form);
    setForm({
      id_type: "military",
      id_number: "",
      description: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-red-600 hover:bg-red-700">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مخالفة
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>تسجيل مخالفة جديدة</DialogTitle>
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
                <Label htmlFor="civil" className="cursor-pointer font-normal">
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
              onClick={() => setOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "جاري الحفظ..." : "حفظ المخالفة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
