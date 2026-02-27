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
  trainee_id?: Trainee;
}

interface ExportPDFProps {
  data: DisciplinaryRequest[];
}

export function ExportPDF({ data }: ExportPDFProps) {
  const generatePDF = () => {
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>بيان الطلبات التأديبية</h2>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #3B82F6; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px;">تاريخ الطلب</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 10px;">السجل المدني</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((d: DisciplinaryRequest) => {
      const createdDate = new Date(d.createdAt).toLocaleDateString("ar-SA");
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${createdDate}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${d.trainee_id?.full_name || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${d.trainee_id?.civil_id || "—"}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${d.trainee_id?.military_id || "—"}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">إجمالي: ${data.length} طلب</p>
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
