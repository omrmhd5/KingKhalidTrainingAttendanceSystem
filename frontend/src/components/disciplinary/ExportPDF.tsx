import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";

interface Trainee {
  full_name?: string;
  civil_id?: string;
  military_id?: string;
}

interface DisciplinaryRequest {
  _id: string;
  createdAt: string;
  reason?: string;
  trainee_id?: Trainee;
}

interface ExportPDFProps {
  data: DisciplinaryRequest[];
}

export function ExportPDF({ data }: ExportPDFProps) {
  const generatePDF = () => {
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h1 style="text-align: center; margin-bottom: 5px; color: #1E3A8A;">بيان الطلبات التأديبية</h1>
        <p style="text-align: center; color: #6B7280; margin-bottom: 20px;">التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background-color: #3B82F6; color: white; font-weight: bold;">
              <th style="border: 1px solid #2563EB; padding: 12px; text-align: center;">الرقم العسكري</th>
              <th style="border: 1px solid #2563EB; padding: 12px; text-align: center;">السجل المدني</th>
              <th style="border: 1px solid #2563EB; padding: 12px; text-align: center;">سبب الاستدعاء</th>
              <th style="border: 1px solid #2563EB; padding: 12px; text-align: center;">الاسم</th>
              <th style="border: 1px solid #2563EB; padding: 12px; text-align: center;">تاريخ الطلب</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((d: DisciplinaryRequest, index: number) => {
      const createdDate = new Date(d.createdAt).toLocaleDateString("ar-SA");
      const bgColor = index % 2 === 0 ? "#FFFFFF" : "#F3F4F6";
      html += `
        <tr style="background-color: ${bgColor};">
          <td style="border: 1px solid #E5E7EB; padding: 10px; text-align: center;">${d.trainee_id?.military_id || "—"}</td>
          <td style="border: 1px solid #E5E7EB; padding: 10px; text-align: center;">${d.trainee_id?.civil_id || "—"}</td>
          <td style="border: 1px solid #E5E7EB; padding: 10px; text-align: center;">${d.reason || "—"}</td>
          <td style="border: 1px solid #E5E7EB; padding: 10px; text-align: center;">${d.trainee_id?.full_name || "—"}</td>
          <td style="border: 1px solid #E5E7EB; padding: 10px; text-align: center;">${createdDate}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div style="margin-top: 20px; text-align: center; padding: 10px; background-color: #3B82F6; color: white; border-radius: 4px; font-weight: bold;">
          الإجمالي: ${data.length} طلب
        </div>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `بيان_طلبات_تأديبية_${new Date().toISOString().split("T")[0]}.pdf`,
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
      className="bg-blue-600 hover:bg-blue-700 text-white">
      <FileDown className="ml-2 h-4 w-4" />
      تحميل PDF
    </Button>
  );
}
