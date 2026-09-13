import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";

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
  itemType,
}: ConfirmDeleteModalProps) {
  const { t, i18n } = useTranslation();
  const typeLabel = itemType || t("common.item");
  const item = itemName ? `${typeLabel} "${itemName}"` : typeLabel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={i18n.dir()} className="max-w-sm">
        <DialogHeader className="text-start">
          <DialogTitle className="text-start">{t("common.confirmDelete")}</DialogTitle>
          <DialogDescription className="text-start">
            {t("common.confirmDeleteDesc", { item })}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}>
            {t("common.delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
