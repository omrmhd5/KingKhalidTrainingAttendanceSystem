import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";

interface EntryRecord {
  id: string;
  militaryId: string;
  civilId: string;
  name: string;
  arrivalTime: string;
  shift: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  actualShift: string;
  actualShiftStartTime?: string;
  actualShiftEndTime?: string;
}

interface Shift {
  _id?: string;
  id?: string;
  name: string;
  start_time: string;
  end_time: string;
  grace_minutes?: number;
  trainees_count?: number;
}

interface AttendanceStatsDisplayProps {
  entries: EntryRecord[];
  shifts: Shift[];
  currentShift?: Shift | null;
}

const formatShiftTime = (startTime: string, endTime: string): string => {
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    let h = parseInt(hours);
    const isAM = h < 12;
    h = h % 12 || 12;
    const period = isAM ? "ص" : "م";
    return `${h}:${minutes} ${period}`;
  };

  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

const getShiftColor = (
  shift: string,
): { bg: string; border: string; text: string } => {
  switch (shift) {
    case "A":
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
      };
    case "B":
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
      };
    case "C":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
      };
    default:
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-700",
      };
  }
};

export default function AttendanceStatsDisplay({
  entries,
  shifts,
  currentShift,
}: AttendanceStatsDisplayProps) {
  // Get entries with data
  const entriesWithData = entries.filter((e) => e.militaryId);

  // Calculate total trainees in system
  const totalTraineesInSystem = shifts.reduce(
    (sum, shift) => sum + (shift.trainees_count || 0),
    0,
  );

  // Get shift breakdown by actual shift attended (shift_id)
  const shiftBreakdown: Record<string, number> = {};
  entriesWithData.forEach((entry) => {
    const shiftName = entry.actualShift || "غير محدد";
    shiftBreakdown[shiftName] = (shiftBreakdown[shiftName] || 0) + 1;
  });

  // Sort shifts
  const sortedShifts = Object.entries(shiftBreakdown).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <Card className="border border-border bg-card p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground flex-1">
          إحصائيات الحضور
        </h3>
        {currentShift ? (
          (() => {
            const colors = getShiftColor(currentShift.name);
            return (
              <Badge
                variant="outline"
                className={`ml-auto ${colors.bg} ${colors.text} border ${colors.border}`}>
                الشفت الحالي: {currentShift.name}
              </Badge>
            );
          })()
        ) : (
          <Badge
            variant="outline"
            className="ml-auto bg-gray-50 text-gray-700 border-gray-200">
            لا يوجد شفت نشط
          </Badge>
        )}
      </div>

      <div className="grid gap-3">
        {/* Total Attendance */}
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-foreground font-medium">
              الحضور الكلي
            </span>
          </div>
          <Badge className="bg-blue-500/20 text-blue-700">
            {entriesWithData.length} من {totalTraineesInSystem}
          </Badge>
        </div>

        {/* Shift Breakdown */}
        {sortedShifts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              توزيع حسب الشفت
            </p>
            {sortedShifts.map(([shift, count]) => {
              const colors = getShiftColor(shift);
              // Get actual shift times from first entry with this actual shift
              const shiftEntry = entriesWithData.find(
                (e) => e.actualShift === shift,
              );
              const shiftTimes =
                shiftEntry &&
                shiftEntry.actualShiftStartTime &&
                shiftEntry.actualShiftEndTime
                  ? formatShiftTime(
                      shiftEntry.actualShiftStartTime,
                      shiftEntry.actualShiftEndTime,
                    )
                  : "";
              // Get assigned count from shift data
              const shiftData = shifts.find((s) => s.name === shift);
              const assignedCount = shiftData?.trainees_count || 0;

              // Count people who attended this shift from a different assigned shift
              const fromDifferentShifts = entriesWithData.filter(
                (e) => e.actualShift === shift && e.shift !== shift,
              ).length;

              const totalCount = assignedCount + fromDifferentShifts;
              return (
                <div
                  key={shift}
                  className={`flex items-center justify-between p-2 ${colors.bg} rounded border ${colors.border}`}>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {shift}
                    </span>
                    {shiftTimes && (
                      <span className={`text-xs ${colors.text} opacity-75`}>
                        {shiftTimes}
                      </span>
                    )}
                  </div>
                  <Badge
                    className={`${colors.bg} ${colors.text} border ${colors.border}`}>
                    {count} / {totalCount}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
