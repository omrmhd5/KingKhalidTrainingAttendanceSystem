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
  const [selectedViolation, setSelectedViolation] = useState<
    1 | 2 | 3 | 4 | null
  >(null);
  const [description, setDescription] = useState("");

  const violations = [
    { id: 1, label: "النوم في الفصل" },
    { id: 2, label: "استخدام الجوال في الفصل" },
    { id: 3, label: "عدم احترام المسؤول" },
    { id: 4, label: "مخالفة الأنظمة والتعليمات" },
  ];

  const handleConfirm = () => {
    if (!selectedViolation) return;
    onConfirm(selectedViolation, description);
    setSelectedViolation(null);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right">تسجيل مخالفة</DialogTitle>
          <p className="text-sm text-muted-foreground text-right">
            {studentName}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Violation Type Selection */}
          <div className="space-y-3">
            <Label className="text-right block">نوع المخالفة:</Label>
            <RadioGroup
              value={selectedViolation?.toString() || ""}
              onValueChange={(val) =>
                setSelectedViolation(parseInt(val) as 1 | 2 | 3 | 4)
              }
              dir="rtl">
              {violations.map((violation) => (
                <div
                  key={violation.id}
                  className="flex items-center gap-2 pr-2">
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

          {/* Description Field */}
          <div className="space-y-2 py-4">
            <Label htmlFor="description" className="text-right block">
              ملاحظات اضافية (اختياري):
            </Label>
            <Textarea
              id="description"
              placeholder="أضِف أي تفاصيل إضافية حول المخالفة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
              dir="rtl"
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
            إلغاء
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedViolation}
            className="bg-red-600 hover:bg-red-700">
            تسجيل المخالفة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
