import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

interface ClassItem {
  _id: string;
  name: string;
  teacherName: string;
}

interface ClassCoverageExportPDFProps {
  sentClasses: ClassItem[];
  missingClasses: ClassItem[];
  date: string;
}

export function ClassCoverageExportPDF({
  sentClasses,
  missingClasses,
  date,
}: ClassCoverageExportPDFProps) {
  const generatePDF = () => {
    const displayDate = getGregorianDateArabic(date || new Date());
    const total = sentClasses.length + missingClasses.length;

    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 10px;">
        <h2 style="text-align: center; color: #1E3A8A; margin-bottom: 4px;">بيان تغطية تقارير الفصول</h2>
        <p style="text-align: center; color: #555; margin-bottom: 16px;">التاريخ: ${displayDate}</p>

        <!-- Summary bar -->
        <div style="display: flex; justify-content: center; gap: 30px; margin-bottom: 20px;">
          <div style="text-align: center; background: #DBEAFE; border: 1px solid #93C5FD; border-radius: 8px; padding: 8px 20px;">
            <div style="font-size: 22px; font-weight: bold; color: #1D4ED8;">${total}</div>
            <div style="font-size: 12px; color: #555;">إجمالي الفصول</div>
          </div>
          <div style="text-align: center; background: #DCFCE7; border: 1px solid #86EFAC; border-radius: 8px; padding: 8px 20px;">
            <div style="font-size: 22px; font-weight: bold; color: #15803D;">${sentClasses.length}</div>
            <div style="font-size: 12px; color: #555;">أرسلوا التقارير</div>
          </div>
          <div style="text-align: center; background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 8px 20px;">
            <div style="font-size: 22px; font-weight: bold; color: #B91C1C;">${missingClasses.length}</div>
            <div style="font-size: 12px; color: #555;">لم يرسلوا</div>
          </div>
        </div>
    `;

    // Sent classes table
    if (sentClasses.length > 0) {
      html += `
        <h3 style="color: #15803D; margin-bottom: 8px;">✓ الفصول التي أرسلت التقارير (${sentClasses.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #15803D; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">#</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">اسم الفصل</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المعلم المسؤول</th>
            </tr>
          </thead>
          <tbody>
      `;
      sentClasses.forEach((cls, i) => {
        const bg = i % 2 === 0 ? "#F0FDF4" : "#FFFFFF";
        html += `
          <tr style="background-color: ${bg};">
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${i + 1}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cls.name}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cls.teacherName || "—"}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
    }

    // Missing classes table
    if (missingClasses.length > 0) {
      html += `
        <h3 style="color: #B91C1C; margin-bottom: 8px;">✗ الفصول التي لم ترسل التقارير (${missingClasses.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background-color: #B91C1C; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">#</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">اسم الفصل</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المعلم المسؤول</th>
            </tr>
          </thead>
          <tbody>
      `;
      missingClasses.forEach((cls, i) => {
        const bg = i % 2 === 0 ? "#FFF1F2" : "#FFFFFF";
        html += `
          <tr style="background-color: ${bg};">
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${i + 1}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cls.name}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${cls.teacherName || "—"}</td>
          </tr>
        `;
      });
      html += `</tbody></table>`;
    }

    html += `</div>`;

    const options = {
      margin: 10,
      filename: `بيان_تغطية_الفصول_${getTodayDateKSA()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait" as const },
    };

    (html2pdf() as any).set(options).from(html).save();
  };

  return (
    <Button
      onClick={generatePDF}
      size="sm"
      variant="default"
      className="bg-red-700 hover:bg-red-800 text-white gap-2">
      <FileDown className="h-4 w-4" />
      تحميل PDF
    </Button>
  );
}
