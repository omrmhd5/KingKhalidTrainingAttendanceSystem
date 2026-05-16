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
 * Pass through a date string (yyyy-MM-dd) from an HTML date input.
 * HTML <input type="date"> always returns yyyy-MM-dd in the Gregorian calendar
 * per spec (when lang="en" is set), so no conversion is needed.
 */
export function convertToKSADate(dateString: string): string {
  return dateString;
}

/**
 * Format a date as Arabic text in Gregorian calendar (never Hijri).
 * Forces gregorian calendar even on systems with Hijri calendar set.
 * E.g., "17 مايو 2026" instead of Hijri equivalent
 */
export function getGregorianDateArabic(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString("ar-SA", { calendar: "gregory" });
}
