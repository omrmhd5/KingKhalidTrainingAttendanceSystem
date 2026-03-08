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
}

interface AttendanceStatsDisplayProps {
  entries: EntryRecord[];
}

const TOTAL_TRAINEES = 100;

export default function AttendanceStatsDisplay({
  entries,
}: AttendanceStatsDisplayProps) {
  // Get entries with data
  const entriesWithData = entries.filter((e) => e.militaryId);

  // Get shift breakdown
  const shiftBreakdown: Record<string, number> = {};
  entriesWithData.forEach((entry) => {
    const shiftName = entry.shift || "غير محدد";
    shiftBreakdown[shiftName] = (shiftBreakdown[shiftName] || 0) + 1;
  });

  // Sort shifts
  const sortedShifts = Object.entries(shiftBreakdown).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  return (
    <Card className="border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          إحصائيات الحضور
        </h3>
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
            {entriesWithData.length} من {TOTAL_TRAINEES}
          </Badge>
        </div>

        {/* Shift Breakdown */}
        {sortedShifts.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground">
              توزيع حسب النوبة
            </p>
            {sortedShifts.map(([shift, count]) => (
              <div
                key={shift}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                <span className="text-sm text-foreground">{shift}</span>
                <Badge className="bg-gray-400/20 text-gray-700">
                  {count} / {TOTAL_TRAINEES}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
