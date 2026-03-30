import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { traineeApi } from "@/lib/traineeApi";

interface Rank {
  _id: string;
  name: string;
}

interface Specialization {
  _id: string;
  name: string;
}

interface Shift {
  _id: string;
  name: string;
}

interface ImportRow {
  rowNumber: number;
  militaryId: string;
  civilId: string;
  fullName: string;
  rankName: string;
  specialtyName: string;
  shiftName: string;
  rankId?: string;
  specialtyId?: string;
  shiftId?: string;
  error?: string;
  isValid?: boolean;
}

interface TraineeBulkImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportSuccess: () => void;
  ranks: Rank[];
  specializations: Specialization[];
  shifts: Shift[];
}

type ColumnMapping = {
  militaryId: number | null;
  civilId: number | null;
  fullName: number | null;
  rank: number | null;
  specialty: number | null;
  shift: number | null;
};

export function TraineeBulkImportModal({
  open,
  onOpenChange,
  onImportSuccess,
  ranks,
  specializations,
  shifts,
}: TraineeBulkImportModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<
    "upload" | "mapping" | "preview" | "importing"
  >("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<any[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    militaryId: 0,
    civilId: 1,
    fullName: 2,
    rank: 3,
    specialty: 4,
    shift: 5,
  });
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResult, setImportResult] = useState({
    success: 0,
    failed: 0,
    errors: [] as string[],
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const workbook = XLSX.read(event.target?.result, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 0 });

        setFile(uploadedFile);
        setRawData(data);
        setStep("mapping");
      };
      reader.readAsBinaryString(uploadedFile);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل قراءة ملف Excel",
        variant: "destructive",
      });
    }
  };

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    const colIndex = value === "skip" ? null : parseInt(value);
    setColumnMapping({ ...columnMapping, [field]: colIndex });
  };

  const getColumns = () => {
    if (rawData.length === 0) return [];
    const firstRow = rawData[0];
    return Object.keys(firstRow).map((_, idx) => ({
      index: idx,
      label: `العمود ${String.fromCharCode(65 + idx)}`,
    }));
  };

  const validateAndPreview = () => {
    if (columnMapping.militaryId === null || columnMapping.fullName === null) {
      toast({
        title: "خطأ",
        description: "يجب تحديد رقم عسكري واسم كحد أدنى",
        variant: "destructive",
      });
      return;
    }

    const rows: ImportRow[] = rawData.map((row: any, idx: number) => {
      const columns = Object.values(row);
      const militaryId =
        columns[columnMapping.militaryId!]?.toString().trim() || "";
      const civilId =
        columnMapping.civilId !== null
          ? columns[columnMapping.civilId]?.toString().trim() || ""
          : "";
      const fullName =
        columns[columnMapping.fullName!]?.toString().trim() || "";
      const rankName =
        columnMapping.rank !== null
          ? columns[columnMapping.rank]?.toString().trim() || ""
          : "";
      const specialtyName =
        columnMapping.specialty !== null
          ? columns[columnMapping.specialty]?.toString().trim() || ""
          : "";
      const shiftName =
        columnMapping.shift !== null
          ? columns[columnMapping.shift]?.toString().trim() || ""
          : "";

      let errors: string[] = [];

      // Validate required fields
      if (!militaryId) errors.push("رقم عسكري مفقود");
      if (!fullName) errors.push("اسم مفقود");

      // Lookup IDs with case-insensitive matching
      let rankId: string | undefined;
      let specialtyId: string | undefined;
      let shiftId: string | undefined;

      if (rankName) {
        const rankMatch = ranks.find(
          (r) => r.name.trim().toLowerCase() === rankName.toLowerCase(),
        );
        if (rankMatch) {
          rankId = rankMatch._id;
        } else {
          errors.push(`رتبة غير موجودة: "${rankName}"`);
        }
      } else {
        errors.push("الرتبة مفقودة");
      }

      if (specialtyName) {
        const specMatch = specializations.find(
          (s) => s.name.trim().toLowerCase() === specialtyName.toLowerCase(),
        );
        if (specMatch) {
          specialtyId = specMatch._id;
        } else {
          errors.push(`تخصص غير موجود: "${specialtyName}"`);
        }
      } else {
        errors.push("التخصص مفقود");
      }

      if (shiftName) {
        const shiftMatch = shifts.find(
          (s) => s.name.trim().toLowerCase() === shiftName.toLowerCase(),
        );
        if (shiftMatch) {
          shiftId = shiftMatch._id;
        } else {
          errors.push(`شفت غير موجود: "${shiftName}"`);
        }
      } else {
        errors.push("الشفت مفقود");
      }

      return {
        rowNumber: idx + 2,
        militaryId,
        civilId,
        fullName,
        rankName,
        specialtyName,
        shiftName,
        rankId,
        specialtyId,
        shiftId,
        error: errors.join(" | "),
        isValid: errors.length === 0,
      };
    });

    setImportRows(rows);
    setStep("preview");
  };

  const performImport = async () => {
    setStep("importing");
    setImporting(true);
    setProgress(0);

    const validRows = importRows.filter((r) => r.isValid);
    const payload = validRows.map((r) => ({
      military_id: r.militaryId,
      civil_id: r.civilId,
      full_name: r.fullName,
      rank_id: r.rankId || undefined,
      specialty_id: r.specialtyId || undefined,
      shift_id: r.shiftId || undefined,
    }));

    try {
      const result = await traineeApi.bulkImportTrainees(payload);
      setImportResult({
        success: result.success || validRows.length,
        failed: result.failed || 0,
        errors: result.errors || [],
      });
      setProgress(100);

      if (result.success > 0) {
        toast({
          title: "نجح",
          description: `تم استيراد ${result.success} متدرب بنجاح`,
        });
        onImportSuccess();
      }

      if (result.failed > 0) {
        toast({
          title: "تحذير",
          description: `فشل استيراد ${result.failed} متدرب`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل الاستيراد",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const resetModal = () => {
    setStep("upload");
    setFile(null);
    setRawData([]);
    setColumnMapping({
      militaryId: 0,
      civilId: 1,
      fullName: 2,
      rank: 3,
      specialty: 4,
      shift: 5,
    });
    setImportRows([]);
    setProgress(0);
    setImportResult({ success: 0, failed: 0, errors: [] });
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetModal();
    }
    onOpenChange(open);
  };

  const columns = getColumns();
  const validCount = importRows.filter((r) => r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>استيراد متدربين من Excel</DialogTitle>
          <DialogDescription>
            قم بتحميل ملف Excel واختر أعمدة البيانات
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="excel-upload"
              />
              <Label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="font-medium">اختر ملف Excel</span>
                <span className="text-sm text-muted-foreground">
                  أو اسحب الملف هنا
                </span>
              </Label>
            </div>
            {file && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  تم اختيار الملف: {file.name}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* STEP 2: MAPPING */}
        {step === "mapping" && (
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>حدد أعمدة البيانات من الملف</AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>الرقم العسكري *</Label>
                <Select
                  value={columnMapping.militaryId?.toString() ?? ""}
                  onValueChange={(val) =>
                    handleMappingChange("militaryId", val)
                  }>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>السجل المدني</Label>
                <Select
                  value={columnMapping.civilId?.toString() ?? "skip"}
                  onValueChange={(val) => handleMappingChange("civilId", val)}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">— تجاهل —</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الاسم *</Label>
                <Select
                  value={columnMapping.fullName?.toString() ?? ""}
                  onValueChange={(val) => handleMappingChange("fullName", val)}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الرتبة</Label>
                <Select
                  value={columnMapping.rank?.toString() ?? "skip"}
                  onValueChange={(val) => handleMappingChange("rank", val)}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">— تجاهل —</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>التخصص</Label>
                <Select
                  value={columnMapping.specialty?.toString() ?? "skip"}
                  onValueChange={(val) =>
                    handleMappingChange("specialty", val)
                  }>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">— تجاهل —</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>الشفت</Label>
                <Select
                  value={columnMapping.shift?.toString() ?? "skip"}
                  onValueChange={(val) => handleMappingChange("shift", val)}>
                  <SelectTrigger dir="rtl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">— تجاهل —</SelectItem>
                    {columns.map((col) => (
                      <SelectItem key={col.index} value={col.index.toString()}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("upload")}>
                رجوع
              </Button>
              <Button onClick={validateAndPreview}>معاينة</Button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW */}
        {step === "preview" && (
          <div className="space-y-4">
            <Alert
              variant={
                validCount === importRows.length ? "default" : "destructive"
              }>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {validCount} من {importRows.length} صف بدون أخطاء
              </AlertDescription>
            </Alert>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرقم</TableHead>
                    <TableHead className="text-right">رقم عسكري</TableHead>
                    <TableHead className="text-right">اسم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importRows.slice(0, 10).map((row) => (
                    <TableRow
                      key={row.rowNumber}
                      className={row.isValid ? "" : "bg-red-50"}>
                      <TableCell>{row.rowNumber}</TableCell>
                      <TableCell>{row.militaryId}</TableCell>
                      <TableCell>{row.fullName}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600 text-xs">
                            {row.error}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep("mapping")}>
                رجوع
              </Button>
              <Button
                onClick={performImport}
                disabled={validCount === 0 || importing}>
                استيراد {validCount}
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4: IMPORTING */}
        {step === "importing" && (
          <div className="space-y-4">
            <Progress value={progress} />
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>جاري الاستيراد... {progress}%</AlertDescription>
            </Alert>

            {progress === 100 && (
              <>
                <Alert
                  variant={
                    importResult.failed === 0 ? "default" : "destructive"
                  }>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    تم استيراد {importResult.success} متدرب
                    {importResult.failed > 0 && ` وفشل ${importResult.failed}`}
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => {
                    resetModal();
                    onOpenChange(false);
                  }}>
                  إغلاق
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
