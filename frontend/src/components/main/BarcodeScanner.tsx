import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScanBarcode, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScanMode = "IN" | "OUT";

interface BarcodeScannerProps {
  onScan: (barcode: string, mode: ScanMode) => Promise<void>;
  isScanning: boolean;
}

export default function BarcodeScanner({
  onScan,
  isScanning,
}: BarcodeScannerProps) {
  const [mode, setMode] = useState<ScanMode>("IN");
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim() || isScanning) return;

    // Clear previous messages
    setError("");
    setSuccess("");

    try {
      await onScan(barcode.trim(), mode);

      // Show success message (inline only, no toast popup)
      const successMsg =
        mode === "IN" ? "تم تسجيل الدخول بنجاح" : "تم تسجيل الخروج بنجاح";
      setSuccess(successMsg);
    } catch (err: any) {
      // Extract error message
      const errorMessage =
        err.response?.data?.message || err.message || "حدث خطأ ما";

      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Scan error:", err);
    }

    setBarcode("");
    inputRef.current?.focus();
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

            {/* Error Message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded p-2 text-center">
                {success}
              </div>
            )}

            <Button
              type="submit"
              disabled={isScanning || !barcode.trim()}
              className="w-full h-9 text-xs font-bold bg-primary hover:bg-primary/90">
              تأكيد
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
