import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";

const minutesToHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
};

const extractTime = (isoString: string | undefined): string => {
  if (!isoString) return "—";
  // Convert to KSA timezone and extract HH:MM:SS with AM/PM
  const date = new Date(isoString);
  const ksaTime = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );
  let hours = ksaTime.getHours();
  const minutes = String(ksaTime.getMinutes()).padStart(2, "0");
  const seconds = String(ksaTime.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "م" : "ص";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes}:${seconds} ${ampm}`;
};

interface AttendanceRecord {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  full_name?: string;
  shift_id?: { name: string };
  entry_time?: string;
  exit_time?: string;
  scheduled_hours?: number;
  missing_hours?: number;
  actual_hours?: number;
}

interface Absence {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  civil_id?: string;
  full_name?: string;
  shift_id?: { name: string };
}

interface Escape {
  trainee_id?: {
    military_id: string;
    civil_id: string;
    full_name: string;
  };
  military_id?: string;
  civil_id?: string;
  full_name?: string;
  shift_id?: { name: string };
}

interface ReportsExportPDFProps {
  data: AttendanceRecord[] | Absence[] | Escape[];
  type: "hours" | "absences" | "escapes";
}

export function ReportsExportPDF({ data, type }: ReportsExportPDFProps) {
  const generatePDF = () => {
    let title = "";
    let headerCells = "";

    if (type === "hours") {
      title = "بيان الساعات اليومية";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الحضور</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الخروج</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الساعات المجدولة</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الساعات المفقودة</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الساعات الفعلية</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الباركود</th>
      `;
    } else if (type === "absences") {
      title = "بيان الغيابات";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px;">السجل المدني</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الباركود</th>
      `;
    } else {
      title = "بيان الهروب";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px;">السجل المدني</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px;">الباركود</th>
      `;
    }

    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>التاريخ: ${new Date().toLocaleDateString("ar-SA")}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1E3A8A; color: white;">
              ${headerCells}
            </tr>
          </thead>
          <tbody>
    `;

    data.forEach((d: any) => {
      const canvas = document.createElement("canvas");
      const trainee = d.trainee_id || d;
      const militaryId = trainee?.military_id || d?.military_id || "—";

      let barcodeImage = "";
      try {
        JsBarcode(canvas, String(militaryId), {
          format: "CODE128",
          width: 2,
          height: 50,
          displayValue: true,
        });
        barcodeImage = canvas.toDataURL("image/png");
      } catch (err) {
        console.error("Error generating barcode:", err);
      }

      let rowCells = "";

      if (type === "hours") {
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName =
          d.shift_id?.name || d.trainee_assigned_shift_id?.name || "—";
        const entryTime = extractTime(d.entry_time);
        const exitTime = extractTime(d.exit_time);

        // Calculate hours from duration_minutes
        const scheduledMinutes = 4 * 60 + 45; // 4:45:00
        const actualMinutes = d.duration_minutes || 0;
        const missingMinutes = Math.max(0, scheduledMinutes - actualMinutes);

        const scheduledHours = minutesToHours(scheduledMinutes);
        const missingHours = minutesToHours(missingMinutes);
        const actualHours = minutesToHours(actualMinutes);

        rowCells = `
          <td style="border: 1px solid #ddd; padding: 10px;">${militaryId}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${fullName}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${shiftName}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${entryTime}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${exitTime}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${scheduledHours}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${missingHours}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${actualHours}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${barcodeImage ? `<img src="${barcodeImage}" style="height: 60px; width: auto;" />` : "—"}
          </td>
        `;
      } else if (type === "absences" || type === "escapes") {
        const civilId = trainee?.civil_id || d?.civil_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.shift_id?.name || "—";

        rowCells = `
          <td style="border: 1px solid #ddd; padding: 10px;">${militaryId}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${civilId}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${fullName}</td>
          <td style="border: 1px solid #ddd; padding: 10px;">${shiftName}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${barcodeImage ? `<img src="${barcodeImage}" style="height: 60px; width: auto;" />` : "—"}
          </td>
        `;
      }

      html += `
        <tr>
          ${rowCells}
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">إجمالي: ${data.length} ${
          type === "hours" ? "سجل" : type === "absences" ? "غياب" : "هروب"
        }</p>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `بيان_${type === "hours" ? "ساعات" : type === "absences" ? "غيابات" : "هروب"}_${
        new Date().toISOString().split("T")[0]
      }.pdf`,
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
