import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";
import { formatTime12HourKSA, minutesToTimeString } from "@/lib/timeUtils";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

interface AttendanceRecord {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  full_name?: string;
  shift_id?: { name: string };
  entry_time?: string;
  exit_time?: string;
  scheduled_hours?: number;
  missing_hours?: number;
  actual_hours?: number;
}

interface Absence {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  civil_id?: string;
  full_name?: string;
  shift_id?: { name: string };
}

interface Escape {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  civil_id?: string;
  full_name?: string;
  shift_id?: { name: string };
}

interface ReportsExportExcelProps {
  data: AttendanceRecord[] | Absence[] | Escape[];
  type: "hours" | "absences" | "escapes" | "lates";
}

const COLS = 8;

const solid = (argb: string) => ({
  type: "pattern" as const,
  pattern: "solid" as const,
  fgColor: { argb },
});

const thinBorder = (argb = "FFD0D0D0") => ({
  top: { style: "thin" as const, color: { argb } },
  bottom: { style: "thin" as const, color: { argb } },
  left: { style: "thin" as const, color: { argb } },
  right: { style: "thin" as const, color: { argb } },
});

export function ReportsExportExcel({ data, type }: ReportsExportExcelProps) {
  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    let title = "";
    let headers: string[] = [];

    if (type === "hours") {
      title = "بيان الساعات اليومية";
      headers = [
        "",
        "الباركود",
        "الساعات الفعلية",
        "الساعات المفقودة",
        "الساعات المجدولة",
        "الخروج",
        "الحضور",
        "الشفت",
        "الاسم",
        "الرقم العسكري",
      ];
    } else if (type === "absences") {
      title = "بيان الغيابات";
      headers = [
        "",
        "الباركود",
        "الشفت",
        "الاسم",
        "السجل المدني",
        "الرقم العسكري",
      ];
    } else if (type === "lates") {
      title = "بيان التأخيرات";
      headers = [
        "",
        "الباركود",
        "وقت الحضور",
        "الشفت",
        "الاسم",
        "السجل المدني",
        "الرقم العسكري",
      ];
    } else {
      title = "بيان الهروب";
      headers = [
        "",
        "الباركود",
        "الشفت",
        "الاسم",
        "السجل المدني",
        "الرقم العسكري",
      ];
    }

    const worksheet = workbook.addWorksheet(title);

    // Column widths
    const colCount = headers.length;
    worksheet.columns = Array(colCount)
      .fill(0)
      .map((_, i) => ({ width: i === 0 ? 3 : 18 }));

    // ── Row 1: Title ──────────────────────────────────────────────────────
    const titleRow = worksheet.addRow(headers.map(() => ""));
    titleRow.height = 40;
    worksheet.mergeCells(1, 2, 1, colCount);
    const titleCell = worksheet.getCell(1, 2);
    titleCell.value = title;
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FF3B82F6");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FF3B82F6");

    // ── Row 2: Date subtitle ──────────────────────────────────────────────
    const date = getGregorianDateArabic(new Date());
    const subRow = worksheet.addRow(headers.map(() => ""));
    subRow.height = 24;
    worksheet.mergeCells(2, 2, 2, colCount);
    const subCell = worksheet.getCell(2, 2);
    subCell.value = `التاريخ: ${date}`;
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Row 3: Spacer ─────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;

    // ── Row 4: Column headers ─────────────────────────────────────────────
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2) {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FF3B82F6");
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder("FF1E40AF");
      }
    });

    // ── Data rows ─────────────────────────────────────────────────────────
    data.forEach((d: any, i: number) => {
      const isEven = i % 2 === 0;
      let rowValues: any[] = [];
      let militaryId = "";

      if (type === "hours") {
        const trainee = d.trainee_id || d;
        militaryId = trainee?.military_id || d?.military_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.trainee_assigned_shift_id?.name || "—";
        const entryTime = d.entry_time
          ? formatTime12HourKSA(d.entry_time)
          : "—";
        const exitTime = d.exit_time ? formatTime12HourKSA(d.exit_time) : "—";

        // Calculate hours from duration_minutes
        const scheduledMinutes = 4 * 60 + 45; // 4:45:00
        const actualMinutes = d.duration_minutes || 0;
        const missingMinutes = Math.max(0, scheduledMinutes - actualMinutes);

        const scheduledHours = minutesToTimeString(scheduledMinutes);
        const missingHours = minutesToTimeString(missingMinutes);
        const actualHours = minutesToTimeString(actualMinutes);

        rowValues = [
          "",
          "—", // Barcode placeholder
          actualHours,
          missingHours,
          scheduledHours,
          exitTime,
          entryTime,
          shiftName,
          fullName,
          militaryId,
        ];
      } else if (type === "absences" || type === "escapes") {
        const trainee = d.trainee_id || d;
        militaryId = trainee?.military_id || d?.military_id || "—";
        const civilId = trainee?.civil_id || d?.civil_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.shift_id?.name || "—";

        rowValues = [
          "",
          "—", // Barcode placeholder
          shiftName,
          fullName,
          civilId,
          militaryId,
        ];
      } else if (type === "lates") {
        const trainee = d.trainee_id || d;
        militaryId = trainee?.military_id || d?.military_id || "—";
        const civilId = trainee?.civil_id || d?.civil_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.shift_id?.name || "—";
        const entryTime = d.entry_time
          ? formatTime12HourKSA(d.entry_time)
          : "—";

        rowValues = [
          "",
          "—", // Barcode placeholder
          entryTime,
          shiftName,
          fullName,
          civilId,
          militaryId,
        ];
      }

      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 60;

      const fgArgb = isEven ? "FFDBEAFE" : "FFFFFFFF";
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber >= 2) {
          cell.font = { size: 12 };
          cell.fill = solid(fgArgb);
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = thinBorder();
        }
      });

      // Generate barcode image and embed in the barcode column
      const canvas = document.createElement("canvas");
      try {
        if (militaryId !== "—") {
          JsBarcode(canvas, String(militaryId), {
            format: "CODE128",
            width: 2,
            height: 45,
            displayValue: true,
            fontSize: 12,
            margin: 4,
          });
          const base64 = canvas.toDataURL("image/png").split(",")[1];
          const imageId = workbook.addImage({ base64, extension: "png" });

          // 0-based row index: 3 header rows (title/subtitle/spacer) + 1 header row = 4, then +i
          worksheet.addImage(imageId, {
            tl: { col: 1, row: 4 + i } as any,
            ext: { width: 140, height: 52 },
          });
        }
      } catch (err) {
        console.error("Barcode generation failed:", err);
      }
    });

    // ── Total row ─────────────────────────────────────────────────────────
    const totalRow = worksheet.addRow(headers.map(() => ""));
    totalRow.height = 26;
    const totalRowIdx = worksheet.rowCount;
    worksheet.mergeCells(totalRowIdx, 2, totalRowIdx, colCount);
    const totalCell = totalRow.getCell(2);
    totalCell.value = `الإجمالي: ${data.length} ${
      type === "hours"
        ? "سجل"
        : type === "absences"
          ? "غياب"
          : type === "lates"
            ? "تأخير"
            : "هروب"
    }`;
    totalCell.font = { bold: true, size: 12, color: { argb: "FFF5F5F5" } };
    totalCell.fill = solid("FF3B82F6");
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
    totalCell.border = thinBorder("FF1E40AF");

    // ── Save ──────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `بيان_${type === "hours" ? "ساعات" : type === "absences" ? "غيابات" : type === "lates" ? "تأخيرات" : "هروب"}_${getTodayDateKSA()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={generateExcel}
      size="sm"
      variant="default"
      className="bg-purple-600 hover:bg-purple-700 text-white">
      <FileSpreadsheet className="ml-2 h-4 w-4" />
      تحميل Excel
    </Button>
  );
}
