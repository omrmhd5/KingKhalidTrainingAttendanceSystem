import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ScanBarcode,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

type ScanMode = "IN" | "OUT";
interface ScanResult {
  name: string;
  rank?: string;
  status: "success" | "error";
  message: string;
}
interface Trainee {
  id: string;
  full_name: string;
  rank: string;
  group_id: string;
}
interface Shift {
  start_time: string;
  end_time: string;
  grace_minutes: number;
}
interface Schedule {
  shift_id: string;
  shifts: Shift;
}

// Mock trainees database
const mockTrainees: Record<string, Trainee> = {
  BAR001: { id: "1", full_name: "أحمد محمد", rank: "جندي", group_id: "1" },
  BAR002: { id: "2", full_name: "فاطمة علي", rank: "عريف", group_id: "1" },
};

const mockSchedules: Record<string, Schedule> = {
  "1": {
    shift_id: "1",
    shifts: {
      start_time: "08:00",
      end_time: "16:00",
      grace_minutes: 10,
    },
  },
};

export default function KioskPage() {
  const [mode, setMode] = useState<ScanMode>("IN");
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  const clearResult = useCallback(() => {
    setTimeout(() => setResult(null), 4000);
  }, []);

  const handleScan = async () => {
    if (!barcode.trim() || scanning) return;
    setScanning(true);
    setResult(null);

    try {
      // Mock: Find trainee by barcode
      const trainee = mockTrainees[barcode.trim()];

      if (!trainee) {
        setResult({
          name: "مجهول",
          status: "error",
          message: "لم يتم العثور على المتدرب",
        });
        clearResult();
        setBarcode("");
        setScanning(false);
        return;
      }

      const today = format(new Date(), "yyyy-MM-dd");

      // Mock: Find today's scheduled shift for the trainee's group
      const schedule = mockSchedules[trainee.group_id];

      if (!schedule) {
        setResult({
          name: trainee.full_name,
          rank: trainee.rank ?? undefined,
          status: "error",
          message: "لا توجد نوبة محددة اليوم",
        });
        clearResult();
        setBarcode("");
        setScanning(false);
        return;
      }

      const shift = schedule.shifts;
      const now = new Date();

      if (mode === "IN") {
        // Calculate lateness
        const shiftStart = new Date(`${today}T${shift.start_time}`);
        const graceEnd = new Date(
          shiftStart.getTime() + (shift.grace_minutes ?? 0) * 60000,
        );
        const isLate = now > graceEnd;
        const lateMinutes = isLate
          ? Math.floor((now.getTime() - shiftStart.getTime()) / 60000)
          : 0;

        setResult({
          name: trainee.full_name,
          rank: trainee.rank ?? undefined,
          status: "success",
          message: isLate
            ? `تم تسجيل الدخول — متأخر (${lateMinutes} دقيقة)`
            : "تم تسجيل الدخول — في الوقت المحدد",
        });
      } else {
        // Check-out - mock success
        setResult({
          name: trainee.full_name,
          rank: trainee.rank ?? undefined,
          status: "success",
          message: "تم تسجيل الخروج — مكتمل",
        });
      }

      clearResult();
      setBarcode("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل المسح";
      setResult({ name: "", status: "error", message: errorMessage });
      clearResult();
      setBarcode("");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-kiosk-bg p-8 -m-6">
      {/* Mode Toggle */}
      <div className="mb-8 flex gap-4">
        <Button
          size="lg"
          variant={mode === "IN" ? "default" : "outline"}
          onClick={() => setMode("IN")}
          className={`h-16 w-40 text-lg font-bold ${mode === "IN" ? "bg-success hover:bg-success/90 text-success-foreground" : "border-success/40 text-success"}`}>
          <ArrowDownToLine className="ml-2 h-5 w-5" />
          الدخول
        </Button>
        <Button
          size="lg"
          variant={mode === "OUT" ? "default" : "outline"}
          onClick={() => setMode("OUT")}
          className={`h-16 w-40 text-lg font-bold ${mode === "OUT" ? "bg-warning hover:bg-warning/90 text-warning-foreground" : "border-warning/40 text-warning"}`}>
          <ArrowUpFromLine className="ml-2 h-5 w-5" />
          الخروج
        </Button>
      </div>

      {/* Scanner */}
      <Card className="w-full max-w-lg border-2 border-sidebar-border bg-kiosk-card shadow-2xl">
        <CardContent className="p-8">
          <div className="mb-6 flex items-center justify-center gap-3">
            <ScanBarcode className="h-8 w-8 text-accent animate-scan-pulse" />
            <h2 className="text-2xl font-bold text-accent">
              مسح الرمز الشريطي
            </h2>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleScan();
            }}>
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="امسح أو أدخل الرمز الشريطي..."
              className="h-16 text-center text-2xl font-mono bg-kiosk-bg border-sidebar-border text-accent placeholder:text-muted-foreground/40"
              autoFocus
              autoComplete="off"
            />
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div
          className={`mt-8 w-full max-w-lg animate-slide-in rounded-lg border-2 p-6 text-center ${
            result.status === "success"
              ? "border-success bg-success/10"
              : "border-destructive bg-destructive/10"
          }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            {result.status === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-success" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          {result.name && (
            <p className="text-xl font-bold text-accent">{result.name}</p>
          )}
          {result.rank && (
            <p className="text-sm text-muted-foreground">{result.rank}</p>
          )}
          <p
            className={`mt-1 text-lg font-medium ${result.status === "success" ? "text-success" : "text-destructive"}`}>
            {result.message}
          </p>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground/50">
        {format(new Date(), "EEEE, MMMM d, yyyy — HH:mm")}
      </p>
    </div>
  );
}
