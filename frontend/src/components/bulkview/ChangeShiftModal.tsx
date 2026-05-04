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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right">تغيير الشفت</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm text-muted-foreground mb-3 text-right">
              توزيع الشفتات للمتدربين المحددين ({filteredCount} متدربين):
            </p>
            <div className="space-y-2">
              {Object.values(shiftBreakdown).map(
                (s: { name: string; count: number }) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span className="font-semibold">شفت: {s.name}</span>
                    <span> {s.count} متدربين </span>
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-right block">تغيير الكل إلى</Label>
            <Select value={targetShiftId} onValueChange={onTargetShiftChange}>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="اختر الشفت" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {shifts.map((shift) => (
                  <SelectItem key={shift._id} value={shift._id}>
                    شفت: {shift.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="flex flex-row-reverse gap-2">
          <Button onClick={onConfirm} disabled={!targetShiftId || isLoading}>
            {isLoading ? "جاري التحديث..." : "تأكيد التغيير"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onTargetShiftChange("");
            }}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
