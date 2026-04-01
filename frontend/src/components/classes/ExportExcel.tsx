import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import ExcelJS from "exceljs";
import { Trainee } from "@/lib/traineeApi";

interface ExportExcelProps {
  data: Array<{
    studentId: string;
    student: Trainee;
    className: string;
    teacherName: string;
    date: string;
  }>;
  title: string;
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

export function ExportExcel({ data, title }: ExportExcelProps) {
  const generateExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("الطلاب");

    // Column widths
    worksheet.columns = [
      { width: 28 }, // Name
      { width: 18 }, // Military ID
      { width: 18 }, // Civil ID
    ];

    // ── Row 1: Title ──────────────────────────────────────────────────────
    const titleRow = worksheet.addRow([title, "", ""]);
    titleRow.height = 40;
    worksheet.mergeCells(1, 1, 1, 3);
    const titleCell = worksheet.getCell("A1");
    titleCell.font = { bold: true, size: 18, color: { argb: "FFFFFFFF" } };
    titleCell.fill = solid("FF1E3A8A");
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.border = thinBorder("FF1E3A8A");

    // ── Row 2: Date subtitle ──────────────────────────────────────────────
    const date = new Date().toLocaleDateString("ar-SA");
    const subRow = worksheet.addRow([`التاريخ: ${date}`, "", ""]);
    subRow.height = 24;
    worksheet.mergeCells(2, 1, 2, 3);
    const subCell = worksheet.getCell("A2");
    subCell.font = { size: 12, italic: true, color: { argb: "FF6B7280" } };
    subCell.fill = solid("FFF9FAFB");
    subCell.alignment = { horizontal: "center", vertical: "middle" };
    subCell.border = thinBorder("FFE5E7EB");

    // ── Row 3: Spacer ─────────────────────────────────────────────────────
    worksheet.addRow([]).height = 6;

    // ── Row 4: Column headers ─────────────────────────────────────────────
    const headers = ["الاسم", "الرقم العسكري", "السجل المدني"];
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
      cell.fill = solid("FF1E3A8A");
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder("FF0F172A");
    });

    // ── Data rows ─────────────────────────────────────────────────────────
    data.forEach((item: any, i: number) => {
      const isEven = i % 2 === 0;
      const rowValues = [
        item.student.full_name || "—",
        item.student.military_id || "—",
        item.student.civil_id || "—",
      ];
      const dataRow = worksheet.addRow(rowValues);
      dataRow.height = 25;

      const fgArgb = isEven ? "FFE0E7FF" : "FFFFFFFF";
      dataRow.eachCell((cell) => {
        cell.font = { size: 13 };
        cell.fill = solid(fgArgb);
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = thinBorder();
      });
    });

    // ── Total row ─────────────────────────────────────────────────────────
    const totalRow = worksheet.addRow([
      `الإجمالي: ${data.length} طالب`,
      "",
      "",
    ]);
    totalRow.height = 26;
    worksheet.mergeCells(worksheet.rowCount, 1, worksheet.rowCount, 3);
    const totalCell = totalRow.getCell(1);
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
    a.download = `${title}_${new Date().toISOString().split("T")[0]}.xlsx`;
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
