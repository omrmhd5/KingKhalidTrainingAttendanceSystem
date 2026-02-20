import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName?: string;
  itemType?: string;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  itemName = "",
  itemType = "العنصر",
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader className="text-right">
          <DialogTitle className="text-right">تأكيد الحذف</DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من حذف {itemType}
            {itemName && ` "${itemName}"`}؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}>
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
