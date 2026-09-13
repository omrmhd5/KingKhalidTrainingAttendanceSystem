import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

interface ShiftTimeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  shiftName: string;
  setShiftName: (value: string) => void;
  shiftStart: string;
  setShiftStart: (value: string) => void;
  shiftEnd: string;
  setShiftEnd: (value: string) => void;
  shiftGrace: string;
  setShiftGrace: (value: string) => void;
}

export function ShiftTimeModal({
  open,
  onOpenChange,
  onSubmit,
  isEditing = false,
  shiftName,
  setShiftName,
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  shiftGrace,
  setShiftGrace,
}: ShiftTimeModalProps) {
  const { t, i18n } = useTranslation();

  const convertTo12Hour = (time24: string): string => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? t("pm") : t("am");
    const hours12 = hours % 12 || 12;
    return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={i18n.dir()}>
        <DialogHeader className="text-start">
          <DialogTitle className="text-start">
            {isEditing ? t("shifts.edit") : t("shifts.newShift")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4">
          <div>
            <Label>{t("common.name")}</Label>
            <Input
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t("common.startTime")}</Label>
              <Input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                required
                className="flex justify-end"
              />
              {shiftStart && (
                <p className="text-xs text-muted-foreground mt-1 text-start">
                  {convertTo12Hour(shiftStart)}
                </p>
              )}
            </div>
            <div>
              <Label>{t("common.endTime")}</Label>
              <Input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                required
                className="flex justify-end"
              />
              {shiftEnd && (
                <p className="text-xs text-muted-foreground mt-1 text-start">
                  {convertTo12Hour(shiftEnd)}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label>{t("common.graceMinutes")}</Label>
            <Input
              type="number"
              value={shiftGrace}
              onChange={(e) => setShiftGrace(e.target.value)}
              min={0}
              className="[&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden [&::-moz-appearance]:textfield"
            />
          </div>
          <Button type="submit" className="w-full">
            {isEditing ? t("common.update") : t("common.create")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
