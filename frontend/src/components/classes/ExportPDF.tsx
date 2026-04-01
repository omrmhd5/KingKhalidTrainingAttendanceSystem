import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import { Trainee } from "@/lib/traineeApi";

interface ExportPDFProps {
  data: Array<{
    studentId: string;
    student: Trainee;
    className: string;
    teacherName: string;
    date: string;
  }>;
  title: string;
}

export function ExportPDF({ data, title }: ExportPDFProps) {
  const generatePDF = () => {
    // Create HTML table
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1E3A8A; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
              <th style="border: 1px solid #ddd; padding: 10px;">السجل المدني</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((item: any) => {
      html += `
        <tr>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.student.full_name}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.student.military_id}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${item.student.civil_id}</td>
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
      filename: `${title}_${new Date().toISOString().split("T")[0]}.pdf`,
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
