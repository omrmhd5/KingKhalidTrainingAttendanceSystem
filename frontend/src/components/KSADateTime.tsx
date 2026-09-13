import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function KSADateTime() {
  const { t, i18n } = useTranslation();
  const [ksaDateTime, setKsaDateTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = i18n.language?.startsWith("en") ? "en-US" : "ar-SA";

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

      const dayName = now.toLocaleDateString(locale, {
        weekday: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      const monthName = now.toLocaleDateString(locale, {
        month: "long",
        timeZone: "Asia/Riyadh",
        calendar: "gregory",
      });

      const day = get("day");
      const year = get("year");
      let hours = get("hour");
      const minutes = String(get("minute")).padStart(2, "0");
      const seconds = String(get("second")).padStart(2, "0");
      const ampm = hours >= 12 ? t("pm") : t("am");
      hours = hours % 12;
      hours = hours ? hours : 12;

      const time = `${dayName}، ${day} ${monthName} ${year} - ${hours}:${minutes}:${seconds} ${ampm}`;
      setKsaDateTime(time);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [i18n.language, t]);

  return (
    <div className="text-sm font-medium text-foreground text-center">
      {ksaDateTime}
    </div>
  );
}
