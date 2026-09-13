import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface Shift {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

interface ChangeShiftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filteredCount: number;
  shiftBreakdown: Record<string, { name: string; count: number }>;
  shifts: Shift[];
  targetShiftId: string;
  onTargetShiftChange: (shiftId: string) => void;
  isLoading: boolean;
  onConfirm: () => void;
}

export function ChangeShiftModal({
  open,
  onOpenChange,
  filteredCount,
  shiftBreakdown,
  shifts,
  targetShiftId,
  onTargetShiftChange,
  isLoading,
  onConfirm,
}: ChangeShiftModalProps) {
  const { t, i18n } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={i18n.dir()} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-start">{t("bulk.changeShift")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground mb-3 text-start">
              {t("bulk.distribution", { count: filteredCount })}
            </p>
            <div className="space-y-2">
              {Object.values(shiftBreakdown).map(
                (s: { name: string; count: number }) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-semibold">
                      {t("bulk.shiftLabel", { name: s.name })}
                    </span>
                    <span>{t("bulk.traineesInShift", { count: s.count })}</span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-start block">{t("bulk.changeAllTo")}</Label>
            <Select value={targetShiftId} onValueChange={onTargetShiftChange}>
              <SelectTrigger>
                <SelectValue placeholder={t("bulk.selectShift")} />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    {t("bulk.shiftLabel", { name: shift.name })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse gap-2">
          <Button onClick={onConfirm} disabled={!targetShiftId || isLoading}>
            {isLoading ? t("common.updating") : t("common.confirmChange")}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onTargetShiftChange("");
            }}>
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
