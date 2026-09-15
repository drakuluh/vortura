/**
 * Call slots are defined on the Toronto wall clock (Eastern Time), whatever
 * time zone the visitor is in. The old helper pinned the offset to -05:00,
 * which put every summer booking an hour off; this resolves the real offset
 * (EST or EDT) for each date. book-call validates against the same rules.
 */
export const BOOKING_TZ = "America/Toronto";
export const SLOT_MINUTES = 30;
const FIRST_HOUR = 9;
const LAST_HOUR = 20; // last slot starts 8:30 PM
export const MIN_LEAD_MS = 60 * 60 * 1000;

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = FIRST_HOUR; h <= LAST_HOUR; h++) slots.push(`${h}:00`, `${h}:30`);
  return slots;
})();

export function formatSlot(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

/** Minutes the Toronto clock is ahead of UTC at an instant (e.g. -240 in summer). */
function torontoOffsetMinutes(at: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: BOOKING_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return Math.round((asUtc - at.getTime()) / 60000);
}

/** The instant a slot starts: `day`'s calendar date at `slot` in Toronto. */
export function slotStart(day: Date, slot: string): Date {
  const [h, m] = slot.split(":").map(Number);
  const wall = Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
  let offset = torontoOffsetMinutes(new Date(wall));
  let instant = wall - offset * 60000;
  // Near a DST switch the first guess can land on the other side of it.
  const corrected = torontoOffsetMinutes(new Date(instant));
  if (corrected !== offset) {
    offset = corrected;
    instant = wall - offset * 60000;
  }
  return new Date(instant);
}

/** "EDT" or "EST" for a date. */
export function torontoZoneLabel(at: Date): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: BOOKING_TZ, timeZoneName: "short" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? "ET"
  );
}

export function formatBookingInstant(iso: string): { date: string; time: string } {
  const at = new Date(iso);
  return {
    date: new Intl.DateTimeFormat("en-US", { timeZone: BOOKING_TZ, weekday: "short", month: "short", day: "numeric" }).format(at),
    time: new Intl.DateTimeFormat("en-US", { timeZone: BOOKING_TZ, hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(at),
  };
}
