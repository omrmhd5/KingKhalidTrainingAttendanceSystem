import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import JsBarcode from "jsbarcode";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

interface ExportExcelProps {
  data: any[];
}

const COLS = 7;

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

export function ExportExcel({ data }: ExportExcelProps) {
  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("المتدربين");

    // Column widths
    worksheet.columns = [
      { width: 3 }, // Empty A
      { width: 3 }, // Empty B
      { width: 3 }, // Empty C
      { width: 3 }, // Empty D
      { width: 3 }, // Empty E
      { width: 24 }, // F - Barcode
      { width: 18 }, // G - Shift
      { width: 18 }, // H - Specialty
      { width: 18 }, // I - Rank
      { width: 28 }, // J - Name
      { width: 18 }, // K - Civil ID
      { width: 18 }, // L - Military ID
    ];

    // ── Row 1: Title ──────────────────────────────────────────────────────
    const titleRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      "بيان المتدربين",
      ...Array(COLS - 1).fill(""),
    ]);
    titleRow.height = 40;
    worksheet.mergeCells(1, 6, 1, 6 + COLS - 1);
    const titleCell = worksheet.getCell("F1");
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FF1E3A8A");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FF1E3A8A");

    // ── Row 2: Date subtitle ──────────────────────────────────────────────
    const date = getGregorianDateArabic(new Date());
    const subRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      `التاريخ: ${date}`,
      ...Array(COLS - 1).fill(""),
    ]);
    subRow.height = 24;
    worksheet.mergeCells(2, 6, 2, 6 + COLS - 1);
    const subCell = worksheet.getCell("F2");
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Row 3: Spacer ─────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;

    // ── Row 4: Column headers ─────────────────────────────────────────────
    const headers = [
      "",
      "",
      "",
      "",
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
      // Only style columns F-L (colNumber 6-12)
      if (colNumber >= 6) {
        cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FF1E3A8A");
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder("FF0F172A");
      }
    });

    // ── Data rows ─────────────────────────────────────────────────────────
    data.forEach((t: any, i: number) => {
      const isEven = i % 2 === 0;
      const rowValues = [
        "", // Empty A
        "", // Empty B
        "", // Empty C
        "", // Empty D
        "", // Empty E
        "", // barcode cell (image floats here)
        t.shift_id?.name || "—",
        t.specialty_id?.name || "—",
        t.rank_id?.name || "—",
        t.full_name || "—",
        t.civil_id || "—",
        t.military_id || "—",
      ];
      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 60;

      const fgArgb = isEven ? "FFE0E7FF" : "FFFFFFFF";
      dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Only style columns F-L (colNumber 6-12)
        if (colNumber >= 6) {
          cell.font = { size: 13 };
          cell.fill = solid(fgArgb);
          cell.alignment = { horizontal: "center", vertical: "middle" };
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
          tl: { col: 5, row: 4 + i } as any,
          ext: { width: 170, height: 52 },
        });
      } catch (err) {
        console.error("Barcode generation failed:", err);
      }
    });

    // ── Total row ─────────────────────────────────────────────────────────
    const totalRow = worksheet.addRow([
      "",
      "",
      "",
      "",
      "",
      `الإجمالي: ${data.length} متدرب`,
      ...Array(COLS - 1).fill(""),
    ]);
    totalRow.height = 26;
    const totalRowIdx = worksheet.rowCount;
    worksheet.mergeCells(totalRowIdx, 6, totalRowIdx, 6 + COLS - 1);
    const totalCell = totalRow.getCell(6);
    totalCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    totalCell.fill = solid("FF1E3A8A");
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
    totalCell.border = thinBorder("FF0F172A");

    // ── Save ──────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `بيان_متدربين_${getTodayDateKSA()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={generateExcel}
      size="sm"
      variant="default"
      className="bg-blue-600 hover:bg-blue-700 text-white">
      <FileSpreadsheet className="ml-2 h-4 w-4" />
      تحميل Excel
    </Button>
  );
}
