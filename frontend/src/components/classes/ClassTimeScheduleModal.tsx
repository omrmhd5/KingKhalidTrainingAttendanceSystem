import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClassTimeScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
  isEditing?: boolean;
  className: string;
  setClassName: (name: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

export function ClassTimeScheduleModal({
  open,
  onOpenChange,
  onSubmit,
  isEditing = false,
  className,
  setClassName,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
}: ClassTimeScheduleModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">
            {isEditing ? "تحديث جدول الفصل" : "إضافة جدول فصل"}
          </DialogTitle>
          <DialogDescription className="text-right">
            {isEditing ? "قم بتحديث بيانات الجدول" : "أضف جدول جديد للفصل"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="className" className="text-right block">
              اسم الفصل
            </Label>
            <Input
              id="className"
              placeholder="مثال: الفصل أ"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              dir="rtl"
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-right block">
              وقت البداية
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="flex-row-reverse"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-right block">
              وقت النهاية
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="flex-row-reverse"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 flex-row-reverse">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onSubmit}>{isEditing ? "تحديث" : "إضافة"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
