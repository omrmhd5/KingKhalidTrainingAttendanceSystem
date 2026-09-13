import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface ViolationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (violationType: 1 | 2 | 3 | 4, description?: string) => void;
  studentName: string;
}

export default function ViolationModal({
  open,
  onOpenChange,
  onConfirm,
  studentName,
}: ViolationModalProps) {
  const { t, i18n } = useTranslation();
  const [selectedViolation, setSelectedViolation] = useState<
    1 | 2 | 3 | 4 | null
  >(null);
  const [description, setDescription] = useState("");

  const violations = [
    { id: 1 as const, label: t("teacher.sleeping") },
    { id: 2 as const, label: t("teacher.phoneUse") },
    { id: 3 as const, label: t("teacher.disrespectOfficial") },
    { id: 4 as const, label: t("teacher.rulesViolation") },
  ];

  const handleConfirm = () => {
    if (!selectedViolation) return;
    onConfirm(selectedViolation, description);
    setSelectedViolation(null);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={i18n.dir()}>
        <DialogHeader>
          <DialogTitle className="text-start">{t("violations.add")}</DialogTitle>
          <p className="text-sm text-muted-foreground text-start">
            {studentName}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-start block">{t("teacher.violationType")}</Label>
            <RadioGroup
              value={selectedViolation?.toString() || ""}
              onValueChange={(val) =>
                setSelectedViolation(parseInt(val) as 1 | 2 | 3 | 4)
              }>
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center gap-2 pe-2">
                  <RadioGroupItem
                    value={violation.id.toString()}
                    id={`violation-${violation.id}`}
                  />
                  <Label
                    htmlFor={`violation-${violation.id}`}
                    className="cursor-pointer">
                    {violation.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2 py-4">
            <Label htmlFor="description" className="text-start block">
              {t("common.notesOptional")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("teacher.violationDetails")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedViolation(null);
              setDescription("");
            }}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedViolation}
            className="bg-red-600 hover:bg-red-700">
            {t("teacher.registerViolation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
