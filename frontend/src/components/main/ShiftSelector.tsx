import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { shiftApi } from "@/lib/shiftApi";
import { Clock } from "lucide-react";

interface ShiftAPIResponse {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

export interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes: number;
}

interface ShiftSelectorProps {
  onShiftSelect: (shift: Shift | null) => void;
}

// Helper function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time: string): string => {
  const [hours, minutes] = time.split(":");
  let h = parseInt(hours);
  const period = h >= 12 ? "م" : "ص";
  h = h % 12 || 12;
  return `${h}:${minutes} ${period}`;
};

export default function ShiftSelector({ onShiftSelect }: ShiftSelectorProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch shifts on mount
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const data = await shiftApi.getAllShifts();
        // Map _id to id for consistency
        const mappedShifts = (data as ShiftAPIResponse[]).map((shift) => ({
          ...shift,
          id: shift._id,
        }));
        setShifts(mappedShifts || []);
      } catch (error) {
        console.error("Failed to fetch shifts:", error);
        setShifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  const handleShiftChange = (shiftId: string) => {
    const shift =
      shiftId === "all" ? null : shifts.find((s) => s.id === shiftId) || null;
    setSelectedShift(shift);
    onShiftSelect(shift);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        فلتر النوبة
      </label>
      <Card className="border border-border bg-card p-3 transition-colors">
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
          <Select
            value={selectedShift?.id || "all"}
            onValueChange={handleShiftChange}>
            <SelectTrigger dir="rtl" className="flex-1 text-sm border-border">
              <SelectValue placeholder={loading ? "جاري..." : "اختر الشفت"} />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all" className="text-sm">
                الكل
              </SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id} className="text-sm">
                  {shift.name} ({formatTime12Hour(shift.start_time)} -{" "}
                  {formatTime12Hour(shift.end_time)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}
