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
  const [isInShiftTime, setIsInShiftTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

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

  // Update current KSA time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        timeZone: "Asia/Riyadh",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setCurrentTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check if current KSA time is within shift
  useEffect(() => {
    if (!selectedShift || !currentTime) {
      setIsInShiftTime(false);
      return;
    }

    // Handle shifts that cross midnight (e.g., 21:00 to 03:00)
    let isInTime = false;
    if (selectedShift.start_time <= selectedShift.end_time) {
      // Normal shift (doesn't cross midnight)
      isInTime =
        currentTime >= selectedShift.start_time &&
        currentTime <= selectedShift.end_time;
    } else {
      // Overnight shift (crosses midnight)
      isInTime =
        currentTime >= selectedShift.start_time ||
        currentTime <= selectedShift.end_time;
    }

    setIsInShiftTime(isInTime);
  }, [selectedShift, currentTime]);

  const handleShiftChange = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId) || null;
    setSelectedShift(shift);
    onShiftSelect(shift);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">
        اختر الشفت
      </label>
      <Card
        className={`border p-3 transition-colors ${
          isInShiftTime
            ? "border-success bg-success/5"
            : selectedShift
              ? "border-destructive bg-destructive/5"
              : "border-border bg-card"
        }`}>
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-primary flex-shrink-0" />
          <Select
            value={selectedShift?.id || ""}
            onValueChange={handleShiftChange}>
            <SelectTrigger
              dir="rtl"
              className={`flex-1 text-sm ${
                isInShiftTime
                  ? "border-success focus:ring-success"
                  : selectedShift
                    ? "border-destructive focus:ring-destructive"
                    : "border-border"
              }`}>
              <SelectValue placeholder={loading ? "جاري..." : "اختر الشفت"} />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id} className="text-sm">
                  {shift.name} ({formatTime12Hour(shift.start_time)} -{" "}
                  {formatTime12Hour(shift.end_time)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedShift && (
          <div className="mt-2 text-xs flex items-center gap-2 px-1">
            <span className="text-foreground font-medium">
              الوقت: {formatTime12Hour(currentTime)}
            </span>
            {isInShiftTime ? (
              <span className="text-success font-medium text-xs">✓ نشطة</span>
            ) : (
              <span className="text-destructive font-medium text-xs">
                ✗ خارج وقت الشفت
              </span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
