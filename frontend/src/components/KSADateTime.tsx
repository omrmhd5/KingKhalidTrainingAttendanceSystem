import { useState, useEffect } from "react";

export default function KSADateTime() {
  const [ksaDateTime, setKsaDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Use Intl.DateTimeFormat.formatToParts for reliable KSA timezone extraction (no locale-string parsing)
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Riyadh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(now);
      const get = (type: string) =>
        parseInt(parts.find((p) => p.type === type)?.value ?? "0");

      // Get Arabic day and month names
      const dayName = now.toLocaleDateString("ar-SA", {
        weekday: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      const monthName = now.toLocaleDateString("ar-SA", {
        month: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      // Get English numbers and 12-hour format
      const day = get("day");
      const year = get("year");
      let hours = get("hour");
      const minutes = String(get("minute")).padStart(2, "0");
      const seconds = String(get("second")).padStart(2, "0");
      const ampm = hours >= 12 ? "م" : "ص";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hours should be 12

      const time = `${dayName}، ${day} ${monthName} ${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
      setKsaDateTime(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm font-medium text-foreground text-center">
      {ksaDateTime}
    </div>
  );
}
