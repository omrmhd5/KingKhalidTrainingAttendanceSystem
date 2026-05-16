import { Button } from "@/components/ui/button";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

type ScanMode = "IN" | "OUT";

interface MainStatsBarProps {
  entryCount: number;
  exitCount: number;
  violationsCount: number;
  absencesCount: number;
  mode: ScanMode;
  onModeChange: (mode: ScanMode) => void;
  isScanning: boolean;
}

export default function MainStatsBar({
  entryCount,
  exitCount,
  violationsCount,
  absencesCount,
  mode,
  onModeChange,
  isScanning,
}: MainStatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-6 w-2/3 mx-auto" dir="rtl">
      {/* Column 1 (right in RTL): Entry count / Exit count */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-blue-400 bg-blue-100 p-2 text-center min-h-[56px]">
          <span className="text-xs font-medium text-blue-700">
            إجمالي تسجيل الدخول
          </span>
          <span className="text-2xl font-black text-blue-800">
            {entryCount}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-green-400 bg-green-100 p-2 text-center min-h-[56px]">
          <span className="text-xs font-medium text-green-700">
            إجمالي تسجيل الخروج
          </span>
          <span className="text-2xl font-black text-green-800">
            {exitCount}
          </span>
        </div>
      </div>

      {/* Column 2 (middle): IN / OUT buttons */}
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          onClick={() => onModeChange("IN")}
          disabled={isScanning}
          className={`h-full min-h-[56px] text-base font-bold gap-2 py-1 ${
            mode === "IN"
              ? "bg-blue-500 hover:bg-blue-600 text-white border-2 border-blue-700"
              : "bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300"
          }`}>
          <ArrowDownToLine className="h-4 w-4" />
          دخول
        </Button>
        <Button
          type="button"
          onClick={() => onModeChange("OUT")}
          disabled={isScanning}
          className={`h-full min-h-[56px] text-base font-bold gap-2 py-1 ${
            mode === "OUT"
              ? "bg-green-500 hover:bg-green-600 text-white border-2 border-green-700"
              : "bg-white hover:bg-green-50 text-green-600 border-2 border-green-300"
          }`}>
          <ArrowUpFromLine className="h-4 w-4" />
          خروج
        </Button>
      </div>

      {/* Column 3 (left in RTL): Violations count / Absences count */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-red-400 bg-red-100 p-2 text-center min-h-[56px]">
          <span className="text-xs font-medium text-red-700">
            إجمالي المخالفين
          </span>
          <span className="text-2xl font-black text-red-800">
            {violationsCount}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-yellow-500 bg-yellow-100 p-2 text-center min-h-[56px]">
          <span className="text-xs font-medium text-yellow-700">
            عدد الغياب
          </span>
          <span className="text-2xl font-black text-yellow-800">
            {absencesCount}
          </span>
        </div>
      </div>
    </div>
  );
}
