import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ScanBarcode,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

type ScanMode = "IN" | "OUT";

interface BarcodeScannerProps {
  onScan: (barcode: string) => Promise<void>;
  isScanning: boolean;
}

interface ScanResult {
  name: string;
  rank?: string;
  status: "success" | "error";
  message: string;
}

export default function BarcodeScanner({
  onScan,
  isScanning,
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>("IN");
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [result]);

  const clearResult = useCallback(() => {
    setTimeout(() => setResult(null), 4000);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isScanning) return;

    try {
      // Call parent's scan handler
      await onScan(barcode.trim());
      setResult({
        name: "تم المعالجة",
        status: "success",
        message: "تم تسجيل المسح بنجاح",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "فشل المسح";
      setResult({
        name: "",
        status: "error",
        message: errorMessage,
      });
    }

    clearResult();
    setBarcode("");
  };

  return (
    <div className="mb-8 w-full">
      {/* Mode Toggle Buttons */}
      <div className="mb-6 flex justify-center gap-4">
        <Button
          size="lg"
          variant={mode === "IN" ? "default" : "outline"}
          onClick={() => setMode("IN")}
          className={`h-14 w-36 text-base font-bold ${
            mode === "IN"
              ? "bg-success hover:bg-success/90 text-success-foreground"
              : "border-success/40 text-success"
          }`}>
          <ArrowDownToLine className="ml-2 h-5 w-5" />
          الدخول
        </Button>
        <Button
          size="lg"
          variant={mode === "OUT" ? "default" : "outline"}
          onClick={() => setMode("OUT")}
          className={`h-14 w-36 text-base font-bold ${
            mode === "OUT"
              ? "bg-warning hover:bg-warning/90 text-warning-foreground"
              : "border-warning/40 text-warning"
          }`}>
          <ArrowUpFromLine className="ml-2 h-5 w-5" />
          الخروج
        </Button>
      </div>

      {/* Scanner Card */}
      <Card className="border border-border bg-card shadow-lg">
        <CardContent className="p-8">
          <div className="mb-6 flex items-center justify-center gap-3">
            <ScanBarcode className="h-8 w-8 text-primary animate-scan-pulse" />
            <h2 className="text-2xl font-bold text-foreground">
              مسح الرمز الشريطي
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="امسح أو أدخل الرمز الشريطي..."
              className="h-16 text-center text-2xl font-mono bg-background border-border text-foreground placeholder:text-muted-foreground/40"
              autoFocus
              autoComplete="off"
              disabled={isScanning}
            />
            <Button
              type="submit"
              size="lg"
              disabled={isScanning || !barcode.trim()}
              className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90">
              تأكيد
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div
          className={`mt-4 animate-slide-in rounded-lg border-2 p-6 text-center ${
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
            <p className="text-xl font-bold text-foreground">{result.name}</p>
          )}
          <p
            className={`mt-1 text-lg font-medium ${result.status === "success" ? "text-success" : "text-destructive"}`}>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
