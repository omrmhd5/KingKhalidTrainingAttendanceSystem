import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
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

interface ExportPDFProps {
  data: Violation[];
}

export function ExportPDF({ data }: ExportPDFProps) {
  const generatePDF = () => {
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>بيان المخالفات</h2>
        <p>التاريخ: ${getGregorianDateArabic(new Date())}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #DC2626; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">السجل المدني</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">وصف المخالفة</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">تاريخ التسجيل</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((v: Violation) => {
      const createdDate = getGregorianDateArabic(v.createdAt);
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${v.trainee_id?.military_id || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${v.trainee_id?.civil_id || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${v.trainee_id?.full_name || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${v.description || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${createdDate}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">إجمالي: ${data.length} مخالفة</p>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `بيان_مخالفات_${getTodayDateKSA()}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape" },
    };

    html2pdf().set(options).from(html).save();
  };

  return (
    <Button
      onClick={generatePDF}
      size="sm"
      variant="default"
      className="bg-red-600 hover:bg-red-700 text-white">
      <FileDown className="ml-2 h-4 w-4" />
      تحميل PDF
    </Button>
  );
}
