/** Formatting helpers. Fixed locale and UTC, so the server render and the browser always agree. */

const DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  hour12: false,
});

/** "20 November 2026" from an ISO date or instant. */
export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

/** "19 January 2027, 15:33 UTC" */
export function formatInstant(iso: string): string {
  return `${DATE_TIME.format(new Date(iso)).replace(" at ", ", ")} UTC`;
}

/** "61.8 MB". Decimal units, as Finder shows them. */
export function formatBytes(bytes: number): string {
  if (bytes < 1000) return `${bytes} B`;
  const units = ["kB", "MB", "GB"];
  let value = bytes / 1000;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${value >= 100 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`;
}

/** "1:05" for the player. */
export function formatClock(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** "1 minute 5 seconds" for assistive technology. */
export function spokenClock(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  const parts: string[] = [];
  if (minutes) parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
  if (rest || !minutes) parts.push(`${rest} second${rest === 1 ? "" : "s"}`);
  return parts.join(" ");
}

/** ISO 8601 duration for structured data: 60 → "PT1M". */
export function isoDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `PT${minutes ? `${minutes}M` : ""}${rest || !minutes ? `${rest}S` : ""}`;
}
