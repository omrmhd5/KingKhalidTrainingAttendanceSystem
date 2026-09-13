import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir={i18n.dir()}>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-green-600" />
            <DialogTitle className="text-start">{t("common.confirm")}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-start">
          <p className="text-sm leading-relaxed">
            {t("teacher.allPresentQuestion", {
              present: t("teacher.presentCount"),
              issues: t("teacher.issuesOrViolations"),
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("teacher.allPresentHint")}
          </p>
        </div>

        <DialogFooter className="pt-4 gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700">
            {t("teacher.allPresentConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
