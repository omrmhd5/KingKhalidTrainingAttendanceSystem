import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get today's date in KSA timezone (Asia/Riyadh) formatted as yyyy-MM-dd
 * Always returns Gregorian calendar format regardless of browser locale
 */
export function getTodayDateKSA(): string {
  const now = new Date();
  const ksaDate = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );

  const year = ksaDate.getFullYear();
  const month = String(ksaDate.getMonth() + 1).padStart(2, "0");
  const day = String(ksaDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Convert a date string (yyyy-MM-dd) to KSA timezone for API calls
 * Ensures consistent date handling across different browser locales
 */
export function convertToKSADate(dateString: string): string {
  // Parse the date in local browser timezone
  const [year, month, day] = dateString.split("-");
  const localDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
  );

  // Convert to KSA timezone
  const ksaDate = new Date(
    localDate.toLocaleString("en-US", { timeZone: "Asia/Riyadh" }),
  );

  const ksaYear = ksaDate.getFullYear();
  const ksaMonth = String(ksaDate.getMonth() + 1).padStart(2, "0");
  const ksaDay = String(ksaDate.getDate()).padStart(2, "0");

  return `${ksaYear}-${ksaMonth}-${ksaDay}`;
}
