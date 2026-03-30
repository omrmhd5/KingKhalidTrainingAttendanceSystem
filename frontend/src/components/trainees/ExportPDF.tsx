import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";

interface Rank {
  _id: string;
  name: string;
}

interface Specialization {
  _id: string;
  name: string;
}

interface Shift {
  _id: string;
  name: string;
}

interface Trainee {
  _id: string;
  civil_id: string;
  military_id: string;
  full_name: string;
  rank_id: Rank | string;
  specialty_id: Specialization | string;
  shift_id: Shift | string;
}

interface TraineesExportPDFProps {
  data: Trainee[];
}

export function TraineesExportPDF({ data }: TraineesExportPDFProps) {
  const generatePDF = () => {
    // Create HTML table with barcodes
    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>بيان المتدربين</h2>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1E3A8A; color: white;">
              <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
              <th style="border: 1px solid #ddd; padding: 10px;">السجل المدني</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الرتبة</th>
              <th style="border: 1px solid #ddd; padding: 10px;">التخصص</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الشفت</th>
              <th style="border: 1px solid #ddd; padding: 10px;">الباركود</th>
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((t: any) => {
      // Create canvas barcode for this trainee
      const canvas = document.createElement("canvas");
      try {
        JsBarcode(canvas, String(t.military_id), {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
        });
        const barcodeImage = canvas.toDataURL("image/png");

        const shiftName = (t.shift_id as Shift)?.name || "—";
        const specialtyName = (t.specialty_id as Specialization)?.name || "—";
        const rankName = (t.rank_id as Rank)?.name || "—";

        html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.military_id}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.civil_id}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.full_name}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${rankName}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${specialtyName}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${shiftName}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
              <img src="${barcodeImage}" style="height: 60px; width: auto;" />
            </td>
          </tr>
        `;
      } catch (err) {
        console.error("Error generating barcode:", err);
        const shiftName = (t.shift_id as Shift)?.name || "—";
        const specialtyName = (t.specialty_id as Specialization)?.name || "—";
        const rankName = (t.rank_id as Rank)?.name || "—";

        html += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.military_id}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.civil_id}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${t.full_name}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${rankName}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${specialtyName}</td>
            <td style="border: 1px solid #ddd; padding: 10px;">${shiftName}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">—</td>
          </tr>
        `;
      }
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">إجمالي: ${data.length} متدرب</p>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `بيان_متدربين_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
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
      className="bg-green-600 hover:bg-green-700 text-white">
      <FileDown className="ml-2 h-4 w-4" />
      تحميل PDF
    </Button>
  );
}
