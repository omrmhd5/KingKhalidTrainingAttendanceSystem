import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";
import { formatTime12HourKSA, minutesToTimeString } from "@/lib/timeUtils";
import { getGregorianDateArabic, getTodayDateKSA } from "@/lib/utils";

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
  type: "hours" | "absences" | "escapes" | "lates";
}

export function ReportsExportPDF({ data, type }: ReportsExportPDFProps) {
  const generatePDF = () => {
    let title = "";
    let headerCells = "";

    if (type === "hours") {
      title = "بيان الساعات اليومية";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الحضور</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الخروج</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الساعات المجدولة</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الساعات المفقودة</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الساعات الفعلية</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الباركود</th>
      `;
    } else if (type === "absences") {
      title = "بيان الغيابات";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">السجل المدني</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الباركود</th>
      `;
    } else if (type === "lates") {
      title = "بيان التأخيرات";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">السجل المدني</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">وقت الدخول</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الباركود</th>
      `;
    } else {
      title = "بيان عدم تسجيل خروج";
      headerCells = `
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الرقم العسكري</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">السجل المدني</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الاسم</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الشفت</th>
        <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">الباركود</th>
      `;
    }

    let html = `
      <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
        <h2>${title}</h2>
        <p>التاريخ: ${getGregorianDateArabic(new Date())}</p>
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
        const shiftName = d.trainee_assigned_shift_id?.name || "—";
        const entryTime = d.entry_time
          ? formatTime12HourKSA(d.entry_time)
          : "—";
        const exitTime = d.exit_time ? formatTime12HourKSA(d.exit_time) : "—";

        // Calculate hours from duration_minutes
        const scheduledMinutes = 4 * 60 + 45; // 4:45:00
        const actualMinutes = d.duration_minutes || 0;
        const missingMinutes = Math.max(0, scheduledMinutes - actualMinutes);

        const scheduledHours = minutesToTimeString(scheduledMinutes);
        const missingHours = minutesToTimeString(missingMinutes);
        const actualHours = minutesToTimeString(actualMinutes);

        rowCells = `
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${militaryId}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${fullName}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${shiftName}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${entryTime}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${exitTime}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${scheduledHours}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${missingHours}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${actualHours}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${barcodeImage ? `<img src="${barcodeImage}" style="height: 60px; width: auto;" />` : "—"}
          </td>
        `;
      } else if (type === "absences" || type === "escapes") {
        const civilId = trainee?.civil_id || d?.civil_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.shift_id?.name || "—";

        rowCells = `
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${militaryId}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${civilId}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${fullName}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${shiftName}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${barcodeImage ? `<img src="${barcodeImage}" style="height: 60px; width: auto;" />` : "—"}
          </td>
        `;
      } else if (type === "lates") {
        const civilId = trainee?.civil_id || d?.civil_id || "—";
        const fullName = trainee?.full_name || d?.full_name || "—";
        const shiftName = d.shift_id?.name || "—";
        const entryTime = d.entry_time
          ? formatTime12HourKSA(d.entry_time)
          : "—";

        rowCells = `
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${militaryId}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${civilId}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${fullName}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${shiftName}</td>
          <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${entryTime}</td>
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
          type === "hours"
            ? "سجل"
            : type === "absences"
              ? "غياب"
              : type === "lates"
                ? "تأخير"
                : "عدم تسجيل خروج"
        }</p>
      </div>
    `;

    const options = {
      margin: 10,
      filename: `بيان_${type === "hours" ? "ساعات" : type === "absences" ? "غيابات" : type === "lates" ? "تأخيرات" : "عدم_تسجيل_خروج"}_${getTodayDateKSA()}.pdf`,
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
