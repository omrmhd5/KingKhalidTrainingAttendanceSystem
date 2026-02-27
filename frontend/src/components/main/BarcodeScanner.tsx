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
    <div className="mb-4 w-full">
      <div className="mb-3 flex justify-center gap-2">
        <Button
          size="sm"
          variant={mode === "IN" ? "default" : "outline"}
          onClick={() => setMode("IN")}
          className={
            mode === "IN"
              ? "bg-success hover:bg-success/90 text-xs h-9"
              : "text-xs h-9"
          }>
          <ArrowDownToLine className="ml-2 h-3 w-3" />
          دخول
        </Button>
        <Button
          size="sm"
          variant={mode === "OUT" ? "default" : "outline"}
          onClick={() => setMode("OUT")}
          className={
            mode === "OUT"
              ? "bg-warning hover:bg-warning/90 text-xs h-9"
              : "text-xs h-9"
          }>
          <ArrowUpFromLine className="ml-2 h-3 w-3" />
          خروج
        </Button>
      </div>
      <Card className="border border-border bg-card">
        <CardContent className="p-3">
          <div className="mb-3 flex items-center justify-center gap-2">
            <ScanBarcode className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">مسح الرمز</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              ref={inputRef}
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="امسح الرمز..."
              className="h-11 text-center text-lg font-mono bg-background border-border text-foreground"
              autoFocus
              autoComplete="off"
              disabled={isScanning}
            />
            <Button
              type="submit"
              disabled={isScanning || !barcode.trim()}
              className="w-full h-9 text-xs font-bold bg-primary hover:bg-primary/90">
              تأكيد
            </Button>
          </form>
        </CardContent>
      </Card>
      {result && (
        <div
          className={`mt-2 rounded-lg border p-2 text-center text-xs ${
            result.status === "success"
              ? "border-success bg-success/10"
              : "border-destructive bg-destructive/10"
          }`}>
          <div className="flex items-center justify-center gap-1">
            {result.status === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            <span
              className={
                result.status === "success"
                  ? "text-success font-medium"
                  : "text-destructive font-medium"
              }>
              {result.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
