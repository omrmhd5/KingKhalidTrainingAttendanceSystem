import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ScanBarcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ScanMode = "IN" | "OUT";

interface ScanInputProps {
  onScan: (barcode: string, mode: ScanMode) => Promise<void>;
  isScanning: boolean;
  mode: ScanMode;
}

export default function ScanInput({
  onScan,
  isScanning,
  mode,
}: ScanInputProps) {
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

    setError("");
    setSuccess("");

    try {
      await onScan(barcode.trim(), mode);
      setSuccess(
        mode === "IN" ? "تم تسجيل الدخول بنجاح" : "تم تسجيل الخروج بنجاح",
      );
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "حدث خطأ ما";
      setError(errorMessage);
      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive",
      });
    }

    setBarcode("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <div className="w-2/3 mx-auto">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="relative">
          <ScanBarcode className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="امسح الباركود هنا..."
            className="h-12 border-2 border-gray-700 bg-background pr-10 text-center text-lg font-mono text-foreground"
            autoFocus
            autoComplete="off"
            disabled={isScanning}
            dir="rtl"
          />
        </div>
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded border border-green-200 bg-green-50 p-2 text-center text-sm text-green-600">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
