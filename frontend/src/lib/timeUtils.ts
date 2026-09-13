import i18n from "@/i18n";

/**
 * Format time to 12-hour format with KSA timezone
 * @param dateTimeString - ISO date string or Date object
 * @returns Formatted time string (e.g., "3:45:30 PM")
 */
export const formatTime12HourKSA = (dateTimeString: string | Date): string => {
  try {
    const date = new Date(dateTimeString);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)?.value ?? "0");
    const hours = get("hour");
    const minutes = get("minute");
    const seconds = get("second");

    const period = hours >= 12 ? i18n.t("pm") : i18n.t("am");
    const h = hours % 12 || 12;

    const pad = (num: number) => String(num).padStart(2, "0");
    return `${h}:${pad(minutes)}:${pad(seconds)} ${period}`;
  } catch {
    return String(dateTimeString);
  }
};

/**
 * Convert minutes to time string format (HH:MM)
 * @param minutes - Total minutes
 * @returns Formatted time string (e.g., "4:45")
 */
export const minutesToTimeString = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};
