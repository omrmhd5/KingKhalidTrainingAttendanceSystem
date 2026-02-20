import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const convertTo12HourArabic = (time24: string): string => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;
  return `${String(hours12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${period}`;
};

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">
            {isEditing ? "تعديل شفت" : "شفت جديد"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
          dir="rtl">
          <div>
            <Label>الاسم</Label>
            <Input
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              required
              className="text-right"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>وقت البداية</Label>
              <Input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                required
                className="flex justify-end"
              />
              {shiftStart && (
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {convertTo12HourArabic(shiftStart)}
                </p>
              )}
            </div>
            <div>
              <Label>وقت النهاية</Label>
              <Input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                required
                className="flex justify-end"
              />
              {shiftEnd && (
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {convertTo12HourArabic(shiftEnd)}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label>دقائق السماح</Label>
            <Input
              type="number"
              value={shiftGrace}
              onChange={(e) => setShiftGrace(e.target.value)}
              min={0}
              className="text-right [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden [&::-moz-appearance]:textfield"
            />
          </div>
          <Button type="submit" className="w-full">
            {isEditing ? "تحديث" : "انشاء"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
