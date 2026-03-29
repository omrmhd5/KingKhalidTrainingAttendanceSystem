import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface QuickClearModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function QuickClearModal({
  open,
  onOpenChange,
  onConfirm,
}: QuickClearModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            <DialogTitle className="text-right">تأكيد</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-right">
          <p className="text-sm leading-relaxed">
            هل أنت متأكد من أن جميع الطلاب{" "}
            <span className="font-semibold">حاضرون</span> وبدون أي
            <span className="font-semibold"> مشاكل أو مخالفات</span>؟
          </p>
          <p className="text-xs text-muted-foreground">
            سيتم تعليم جميع الطلاب كحاضرين وإزالة أية مخالفات مسجلة.
          </p>
        </div>

        <DialogFooter className="pt-4 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700">
            نعم، الجميع حاضرون
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
