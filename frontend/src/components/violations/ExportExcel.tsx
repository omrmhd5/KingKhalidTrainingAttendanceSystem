import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

interface Trainee {
  full_name?: string;
  civil_id?: string;
  military_id?: string;
}

interface Violation {
  _id: string;
  description?: string;
  createdAt: string;
  trainee_id?: Trainee;
}

interface ExportExcelProps {
  data: Violation[];
}

const COLS = 5;

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
    const worksheet = workbook.addWorksheet("المخالفات");

    // Column widths
    worksheet.columns = [
      { width: 3 },
      { width: 18 },
      { width: 28 },
      { width: 18 },
      { width: 18 },
      { width: 30 },
    ];

    // ── Row 1: Title ──────────────────────────────────────────────────────
    const titleRow = worksheet.addRow([
      "",
      "بيان المخالفات",
      ...Array(COLS - 1).fill(""),
    ]);
    titleRow.height = 40;
    worksheet.mergeCells(1, 2, 1, 2 + COLS - 1);
    const titleCell = worksheet.getCell("B1");
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FFDC2626");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FFDC2626");

    // ── Row 2: Date subtitle ──────────────────────────────────────────────
    const date = getGregorianDateArabic(new Date());
    const subRow = worksheet.addRow([
      "",
      `التاريخ: ${date}`,
      ...Array(COLS - 1).fill(""),
    ]);
    subRow.height = 24;
    worksheet.mergeCells(2, 2, 2, 2 + COLS - 1);
    const subCell = worksheet.getCell("B2");
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Row 3: Spacer ─────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;

    // ── Row 4: Column headers ─────────────────────────────────────────────
    const headers = [
      "",
      "تاريخ التسجيل",
      "وصف المخالفة",
      "الاسم",
      "السجل المدني",
      "الرقم العسكري",
    ];
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber >= 2) {
        cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FFDC2626");
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder("FFB91C1C");
      }
    });

    // ── Data rows ─────────────────────────────────────────────────────────
    data.forEach((v: Violation, i: number) => {
      const isEven = i % 2 === 0;
      const createdDate = getGregorianDateArabic(v.createdAt);
      const rowValues = [
        "",
        createdDate,
        v.description || "—",
        v.trainee_id?.full_name || "—",
        v.trainee_id?.civil_id || "—",
        v.trainee_id?.military_id || "—",
      ];
      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 40;

      const fgArgb = isEven ? "FFFFE5E5" : "FFFFFFFF";
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
    });

    // ── Total row ─────────────────────────────────────────────────────────
    const totalRow = worksheet.addRow([
      "",
      `الإجمالي: ${data.length} مخالفة`,
      ...Array(COLS - 1).fill(""),
    ]);
    totalRow.height = 26;
    const totalRowIdx = worksheet.rowCount;
    worksheet.mergeCells(totalRowIdx, 2, totalRowIdx, 2 + COLS - 1);
    const totalCell = totalRow.getCell(2);
    totalCell.font = { bold: true, size: 13, color: { argb: "FFF5F5F5" } };
    totalCell.fill = solid("FFDC2626");
    totalCell.alignment = { horizontal: "center", vertical: "middle" };
    totalCell.border = thinBorder("FFB91C1C");

    // ── Save ──────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `بيان_مخالفات_${getTodayDateKSA()}.xlsx`;
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
