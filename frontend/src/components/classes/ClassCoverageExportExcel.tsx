import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

interface ClassItem {
  _id: string;
  name: string;
  teacherName: string;
}

interface ClassCoverageExportExcelProps {
  sentClasses: ClassItem[];
  missingClasses: ClassItem[];
  date: string;
}

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

export function ClassCoverageExportExcel({
  sentClasses,
  missingClasses,
  date,
}: ClassCoverageExportExcelProps) {
  const generateExcel = async () => {
    const displayDate = getGregorianDateArabic(date || new Date());
    const total = sentClasses.length + missingClasses.length;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("تغطية التقارير");

    worksheet.columns = [
      { width: 3 },
      { width: 8 },
      { width: 30 },
      { width: 30 },
    ];

    const COLS = 3;

    // ── Title row ────────────────────────────────────────────────────────
    const titleRow = worksheet.addRow(["", "بيان تغطية تقارير الفصول", "", ""]);
    titleRow.height = 40;
    worksheet.mergeCells(1, 2, 1, 2 + COLS - 1);
    const titleCell = worksheet.getCell("B1");
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FF1E3A8A");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FF1E3A8A");

    // ── Date subtitle ─────────────────────────────────────────────────────
    const subRow = worksheet.addRow(["", `التاريخ: ${displayDate}`, "", ""]);
    subRow.height = 24;
    worksheet.mergeCells(2, 2, 2, 2 + COLS - 1);
    const subCell = worksheet.getCell("B2");
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Summary row ───────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;
    const summaryRow = worksheet.addRow([
      "",
      `الإجمالي: ${total}   |   أرسلوا: ${sentClasses.length}   |   لم يرسلوا: ${missingClasses.length}`,
      "",
      "",
    ]);
    summaryRow.height = 28;
    worksheet.mergeCells(
      worksheet.rowCount,
      2,
      worksheet.rowCount,
      2 + COLS - 1,
    );
    const summaryCell = summaryRow.getCell(2);
    summaryCell.font = { bold: true, size: 12, color: { argb: "FF1E3A8A" } };
    summaryCell.fill = solid("FFDBEAFE");
    summaryCell.alignment = { horizontal: "center", vertical: "middle" };
    summaryCell.border = thinBorder("FF93C5FD");
    worksheet.addRow([]).height = 8;

    // ════════════════════════════════════
    //  SENT CLASSES SECTION
    // ════════════════════════════════════
    const sentTitleRow = worksheet.addRow([
      "",
      `✓ الفصول التي أرسلت التقارير (${sentClasses.length})`,
      "",
      "",
    ]);
    sentTitleRow.height = 28;
    worksheet.mergeCells(
      worksheet.rowCount,
      2,
      worksheet.rowCount,
      2 + COLS - 1,
    );
    const sentTitleCell = sentTitleRow.getCell(2);
    sentTitleCell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
    sentTitleCell.fill = solid("FF15803D");
    sentTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    sentTitleCell.border = thinBorder("FF15803D");

    // Sent headers
    const sentHeaderRow = worksheet.addRow([
      "",
      "#",
      "اسم الفصل",
      "المعلم المسؤول",
    ]);
    sentHeaderRow.height = 28;
    sentHeaderRow.eachCell((cell, col) => {
      if (col >= 2) {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FF166534");
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = thinBorder("FF14532D");
      }
    });

    // Sent data
    if (sentClasses.length === 0) {
      const emptyRow = worksheet.addRow(["", "—", "لا توجد فصول", ""]);
      emptyRow.height = 24;
      worksheet.mergeCells(worksheet.rowCount, 3, worksheet.rowCount, 4);
      emptyRow.eachCell((cell, col) => {
        if (col >= 2) {
          cell.font = { size: 11, color: { argb: "FF6B7280" } };
          cell.fill = solid("FFF9FAFB");
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = thinBorder();
        }
      });
    } else {
      sentClasses.forEach((cls, i) => {
        const isEven = i % 2 === 0;
        const dataRow = worksheet.addRow([
          "",
          i + 1,
          cls.name,
          cls.teacherName || "—",
        ]);
        dataRow.height = 26;
        dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col >= 2) {
            cell.font = { size: 12 };
            cell.fill = solid(isEven ? "FFF0FDF4" : "FFFFFFFF");
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            cell.border = thinBorder("FF86EFAC");
          }
        });
      });
    }

    worksheet.addRow([]).height = 12;

    // ════════════════════════════════════
    //  MISSING CLASSES SECTION
    // ════════════════════════════════════
    const missingTitleRow = worksheet.addRow([
      "",
      `✗ الفصول التي لم ترسل التقارير (${missingClasses.length})`,
      "",
      "",
    ]);
    missingTitleRow.height = 28;
    worksheet.mergeCells(
      worksheet.rowCount,
      2,
      worksheet.rowCount,
      2 + COLS - 1,
    );
    const missingTitleCell = missingTitleRow.getCell(2);
    missingTitleCell.font = {
      bold: true,
      size: 13,
      color: { argb: "FFFFFFFF" },
    };
    missingTitleCell.fill = solid("FFB91C1C");
    missingTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    missingTitleCell.border = thinBorder("FFB91C1C");

    // Missing headers
    const missingHeaderRow = worksheet.addRow([
      "",
      "#",
      "اسم الفصل",
      "المعلم المسؤول",
    ]);
    missingHeaderRow.height = 28;
    missingHeaderRow.eachCell((cell, col) => {
      if (col >= 2) {
        cell.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
        cell.fill = solid("FF991B1B");
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = thinBorder("FF7F1D1D");
      }
    });

    // Missing data
    if (missingClasses.length === 0) {
      const emptyRow = worksheet.addRow(["", "—", "جميع الفصول أرسلت", ""]);
      emptyRow.height = 24;
      worksheet.mergeCells(worksheet.rowCount, 3, worksheet.rowCount, 4);
      emptyRow.eachCell((cell, col) => {
        if (col >= 2) {
          cell.font = { size: 11, color: { argb: "FF6B7280" } };
          cell.fill = solid("FFF9FAFB");
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.border = thinBorder();
        }
      });
    } else {
      missingClasses.forEach((cls, i) => {
        const isEven = i % 2 === 0;
        const dataRow = worksheet.addRow([
          "",
          i + 1,
          cls.name,
          cls.teacherName || "—",
        ]);
        dataRow.height = 26;
        dataRow.eachCell({ includeEmpty: true }, (cell, col) => {
          if (col >= 2) {
            cell.font = { size: 12 };
            cell.fill = solid(isEven ? "FFFFF1F2" : "FFFFFFFF");
            cell.alignment = {
              horizontal: "center",
              vertical: "middle",
              wrapText: true,
            };
            cell.border = thinBorder("FFFCA5A5");
          }
        });
      });
    }

    // ── Save ─────────────────────────────────────────────────────────────
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `بيان_تغطية_الفصول_${getTodayDateKSA()}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={generateExcel}
      size="sm"
      variant="default"
      className="bg-green-700 hover:bg-green-800 text-white gap-2">
      <FileSpreadsheet className="h-4 w-4" />
      تحميل Excel
    </Button>
  );
}
