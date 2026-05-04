import { useState, useEffect } from "react";

export default function KSADateTime() {
  const [ksaDateTime, setKsaDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ksaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
      );

      // Get Arabic day and month names
      const dayName = ksaTime.toLocaleDateString("ar-SA", {
        weekday: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      const monthName = ksaTime.toLocaleDateString("ar-SA", {
        month: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      // Get English numbers and 12-hour format
      const day = ksaTime.getDate();
      const year = ksaTime.getFullYear();
      let hours = ksaTime.getHours();
      const minutes = String(ksaTime.getMinutes()).padStart(2, "0");
      const seconds = String(ksaTime.getSeconds()).padStart(2, "0");
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
