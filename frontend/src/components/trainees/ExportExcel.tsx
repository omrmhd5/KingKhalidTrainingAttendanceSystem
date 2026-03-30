import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";

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

interface Trainee {
  _id: string;
  civil_id: string;
  military_id: string;
  full_name: string;
  rank_id: Rank | string;
  specialty_id: Specialization | string;
  shift_id: Shift | string;
}

interface TraineesExportExcelProps {
  data: Trainee[];
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

export function TraineesExportExcel({ data }: TraineesExportExcelProps) {
  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("المتدربون");

    // Column widths
    worksheet.columns = [
      { width: 3 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 18 },
    ];

    // ── Row 1: Title ──────────────────────────────────────────────────────
    const titleRow = worksheet.addRow(Array(COLS + 1).fill(""));
    titleRow.height = 40;
    worksheet.mergeCells(1, 2, 1, 2 + COLS - 1);
    const titleCell = worksheet.getCell("B1");
    titleCell.value = "بيان المتدربين";
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FF3B82F6");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FF3B82F6");

    // ── Row 2: Date subtitle ──────────────────────────────────────────────
    const date = new Date().toLocaleDateString("ar-SA");
    const subRow = worksheet.addRow(Array(COLS + 1).fill(""));
    subRow.height = 24;
    worksheet.mergeCells(2, 2, 2, 2 + COLS - 1);
    const subCell = worksheet.getCell("B2");
    subCell.value = `التاريخ: ${date}`;
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Row 3: Spacer ─────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;

    // ── Row 4: Column headers ─────────────────────────────────────────────
    const headers = [
      "",
      "الباركود",
      "الشفت",
      "التخصص",
      "الرتبة",
      "الاسم",
      "السجل المدني",
      "الرقم العسكري",
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2) {
        cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FF3B82F6");
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder("FF1E40AF");
      }
    });

    // ── Data rows ─────────────────────────────────────────────────────────
    data.forEach((t: Trainee, i: number) => {
      const isEven = i % 2 === 0;
      const rankName = (t.rank_id as Rank)?.name || "—";
      const specialtyName = (t.specialty_id as Specialization)?.name || "—";
      const shiftName = (t.shift_id as Shift)?.name || "—";

      const rowValues = [
        "",
        "—", // Barcode placeholder
        shiftName,
        specialtyName,
        rankName,
        t.full_name,
        t.civil_id,
        t.military_id,
      ];

      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 60;

      const fgArgb = isEven ? "FFDBEAFE" : "FFFFFFFF";
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber >= 2) {
          cell.font = { size: 13 };
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
        JsBarcode(canvas, String(t.military_id), {
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
      } catch (err) {
        console.error("Barcode generation failed:", err);
      }
    });

    // ── Total row ─────────────────────────────────────────────────────────
    const totalRow = worksheet.addRow(Array(COLS + 1).fill(""));
    totalRow.height = 26;
    const totalRowIdx = worksheet.rowCount;
    worksheet.mergeCells(totalRowIdx, 2, totalRowIdx, 2 + COLS - 1);
    const totalCell = totalRow.getCell(2);
    totalCell.value = `الإجمالي: ${data.length} متدرب`;
    totalCell.font = { bold: true, size: 13, color: { argb: "FFF5F5F5" } };
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
    a.download = `بيان_متدربين_${new Date().toISOString().split("T")[0]}.xlsx`;
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
