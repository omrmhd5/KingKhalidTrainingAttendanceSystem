import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      // Find trainee by barcode
      const { data: trainee, error: traineeErr } = await supabase
        .from("trainees")
        .select("id, full_name, rank, group_id")
        .eq("barcode_value", barcode.trim())
        .maybeSingle();

      if (traineeErr || !trainee) {
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

      // Find today's scheduled shift for the trainee's group
      const { data: schedule } = await supabase
        .from("group_schedules")
        .select("shift_id, shifts(start_time, end_time, grace_minutes)")
        .eq("group_id", trainee.group_id!)
        .eq("day_date", today)
        .maybeSingle();

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

      const shift = (schedule as any).shifts;
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

        // Calculate scheduled minutes
        const shiftEnd = new Date(`${today}T${shift.end_time}`);
        const scheduledMinutes = Math.floor(
          (shiftEnd.getTime() - shiftStart.getTime()) / 60000,
        );

        const { error: insertErr } = await supabase
          .from("attendance_sessions")
          .upsert(
            {
              trainee_id: trainee.id,
              day_date: today,
              shift_id: schedule.shift_id,
              check_in_at: now.toISOString(),
              late_minutes: lateMinutes,
              scheduled_minutes: scheduledMinutes,
              status: isLate ? "late" : "present",
            },
            { onConflict: "trainee_id,day_date,shift_id" },
          );

        if (insertErr) throw insertErr;

        setResult({
          name: trainee.full_name,
          rank: trainee.rank ?? undefined,
          status: "success",
          message: isLate
            ? `تم تسجيل الدخول — متأخر (${lateMinutes} دقيقة)`
            : "تم تسجيل الدخول — في الوقت المحدد",
        });
      } else {
        // Check-out
        const { data: session } = await supabase
          .from("attendance_sessions")
          .select("*")
          .eq("trainee_id", trainee.id)
          .eq("day_date", today)
          .eq("shift_id", schedule.shift_id)
          .maybeSingle();

        if (!session || !session.check_in_at) {
          setResult({
            name: trainee.full_name,
            rank: trainee.rank ?? undefined,
            status: "error",
            message: "لم يتم العثور على تسجيل دخول لاليوم",
          });
          clearResult();
          setBarcode("");
          setScanning(false);
          return;
        }

        const checkIn = new Date(session.check_in_at);
        const actualMinutes = Math.floor(
          (now.getTime() - checkIn.getTime()) / 60000,
        );
        const lostMinutes = Math.max(
          0,
          session.scheduled_minutes - actualMinutes,
        );

        const shiftEnd = new Date(`${today}T${shift.end_time}`);
        const earlyLeave =
          now < shiftEnd
            ? Math.floor((shiftEnd.getTime() - now.getTime()) / 60000)
            : 0;

        await supabase
          .from("attendance_sessions")
          .update({
            check_out_at: now.toISOString(),
            actual_minutes: actualMinutes,
            lost_minutes: lostMinutes,
            early_leave_minutes: earlyLeave,
          })
          .eq("id", session.id);

        setResult({
          name: trainee.full_name,
          rank: trainee.rank ?? undefined,
          status: "success",
          message:
            earlyLeave > 0
              ? `تم تسجيل الخروج — مبكر (${earlyLeave} دقيقة)`
              : "تم تسجيل الخروج — مكتمل",
        });
      }
    } catch (err: any) {
      setResult({
        name: "",
        status: "error",
        message: err.message ?? "فشل المسح",
      });
    }

    clearResult();
    setBarcode("");
    setScanning(false);
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
