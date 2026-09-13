import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { traineeApi } from "@/lib/traineeApi";

interface DisciplinaryFormModalProps {
  onSubmit: (data: DisciplinaryFormData) => void;
  isLoading?: boolean;
  editingDisciplinary?: {
    _id: string;
    reason: string | null;
    trainee_id: {
      _id: string;
      military_id: string;
      civil_id: string;
      full_name: string;
    };
  } | null;
  onEditModeChange?: (editing: boolean) => void;
}

export interface DisciplinaryFormData {
  trainee_id: string;
  military_id: string;
  civil_id: string;
  full_name: string;
  id_type: "military" | "civil";
  id_number: string;
  reason: string;
}

export function DisciplinaryFormModal({
  onSubmit,
  isLoading = false,
  editingDisciplinary = null,
  onEditModeChange,
}: DisciplinaryFormModalProps) {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!!editingDisciplinary);
  const [form, setForm] = useState<
    Omit<
      DisciplinaryFormData,
      "trainee_id" | "military_id" | "civil_id" | "full_name"
    >
  >({
    id_type: "military",
    id_number: "",
    reason: "",
  });

  useEffect(() => {
    if (editingDisciplinary) {
      setOpen(true);
      setIsEditMode(true);
      setForm({
        id_type: "military",
        id_number: editingDisciplinary.trainee_id.military_id,
        reason: editingDisciplinary.reason || "",
      });
    }
  }, [editingDisciplinary]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && isEditMode) {
      onEditModeChange?.(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.reason.trim()) {
      toast({
        title: t("common.warning"),
        description: t("disciplinary.needReason"),
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    // Handle edit mode - only update reason
    if (isEditMode && editingDisciplinary) {
      onSubmit({
        trainee_id: editingDisciplinary.trainee_id._id,
        military_id: editingDisciplinary.trainee_id.military_id,
        civil_id: editingDisciplinary.trainee_id.civil_id,
        full_name: editingDisciplinary.trainee_id.full_name,
        id_type: form.id_type,
        id_number: form.id_number,
        reason: form.reason,
      });
      setForm({ id_type: "military", id_number: "", reason: "" });
      handleOpenChange(false);
      return;
    }

    if (!form.id_number.trim()) {
      toast({
        title: t("common.warning"),
        description: t("violations.needId"),
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    if (!form.reason.trim()) {
      toast({
        title: t("common.warning"),
        description: t("disciplinary.needReason"),
        variant: "destructive",
        duration: 1500,
      });
      return;
    }

    try {
      setIsSearching(true);

      // Search for trainee using the ID
      const trainees = await traineeApi.searchByIds(
        [form.id_number],
        form.id_type,
      );

      if (!trainees || trainees.length === 0) {
        toast({
          title: t("violations.notFound"),
          description: t("violations.notFoundDesc", { type: form.id_type === "military" ? t("violations.militaryType") : t("violations.civilType"), id: form.id_number }),
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
        reason: form.reason,
      });

      setForm({
        id_type: "military",
        id_number: "",
        reason: "",
      });
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("common.searchTraineeFailed"),
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
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="ml-2 h-4 w-4" />{t("disciplinary.add")}</Button>
      </DialogTrigger>
      <DialogContent dir={i18n.dir()}
        className="max-w-md border-r-4 border-r-blue-600">
        <DialogHeader>
          <DialogTitle className="text-right text-blue-600">
            {isEditMode ? t("disciplinary.editReason") : t("disciplinary.newTitle")}
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
          {!isEditMode && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium block">{t("violations.idType")}</label>
                <RadioGroup
                  value={form.id_type}
                  onValueChange={(value) =>
                    setForm({ ...form, id_type: value as "military" | "civil" })
                  }>
                  <div className="flex justify-end items-center space-x-2">
                    <Label
                      htmlFor="military"
                      className="cursor-pointer font-normal">{t("violations.militaryNumber")}</Label>
                    <RadioGroupItem value="military" id="military" />
                  </div>
                  <div className="flex justify-end items-center space-x-2">
                    <Label
                      htmlFor="civil"
                      className="cursor-pointer font-normal">{t("violations.civilNumber")}</Label>
                    <RadioGroupItem value="civil" id="civil" />
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="id_number" className="text-sm font-medium">{t("violations.idRequired")}</Label>
                <Input
                  id="id_number"
                  type="number"
                  placeholder={
                    form.id_type === "military"
                      ? t("violations.militaryPlaceholder")
                      : t("violations.civilPlaceholder")
                  }
                  value={form.id_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers
                    if (value === "" || /^\d+$/.test(value)) {
                      setForm({ ...form, id_number: value });
                    }
                  }}
                 
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="reason" className="text-sm font-medium">{t("disciplinary.reasonRequired")}</Label>
            <Textarea
              id="reason"
              placeholder={t("disciplinary.reasonPlaceholder")}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
             
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}>{t("common.cancel")}</Button>
            <Button
              type="submit"
              disabled={isLoading || isSearching}
              className="bg-blue-600 hover:bg-blue-700">
              {isSearching
                ? t("common.searching")
                : isLoading
                  ? t("common.saving")
                  : isEditMode
                    ? t("common.saveEdit")
                    : t("disciplinary.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
