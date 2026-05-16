import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Trainee } from "@/lib/traineeApi";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

const violationTypes: Record<number | string, string> = {
  1: "النوم في الفصل",
  2: "استخدام الجوال في الفصل",
  3: "عدم احترام المسؤول",
  4: "مخالفة الأنظمة والتعليمات",
};

interface ExportPDFProps {
  data: Array<{
    studentId: string;
    student: any;
    className: string;
    teacherName: string;
    date: string;
    violationType?: string;
    violationDescription?: string;
  }>;
  title: string;
}

export function ExportPDF({ data, title }: ExportPDFProps) {
  const generatePDF = () => {
    // Check if there are violations in the data
    const hasViolations = data.some((item) => item.violationType);

    // Create HTML table
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>التاريخ: ${getGregorianDateArabic(new Date())}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1E3A8A; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">السجل المدني</th>
              ${hasViolations ? '<th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المخالفة</th>' : ""}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((item: any) => {
      const violationText = item.violationType
        ? `${violationTypes[item.violationType] || item.violationType}${item.violationDescription ? ` - ${item.violationDescription}` : ""}`
        : "";

      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.student.full_name}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.student.military_id}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.student.civil_id}</td>
          ${hasViolations ? `<td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${violationText}</td>` : ""}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">إجمالي: ${data.length} طالب</p>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `${title}_${getTodayDateKSA()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait" },
    };

    html2pdf().set(options).from(html).save();
  };

  return (
    <Button
      onClick={generatePDF}
      size="sm"
      variant="default"
      className="bg-green-600 hover:bg-green-700 text-white">
      <FileDown className="ml-2 h-4 w-4" />
      تحميل PDF
    </Button>
  );
}
