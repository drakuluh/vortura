import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { formatSlot, slotStart, torontoZoneLabel } from "@/lib/booking-time";

/**
 * For signed-out visitors the contact form and the booking calendar are one
 * booking: the calendar picks the time, the form collects who's booking and
 * its "Confirm Booking" button submits both. This context carries the chosen
 * time from the calendar to the form (they're separate, lazily loaded panels).
 *
 * Signed-in visitors have no form, so the calendar confirms on its own when
 * there's no provider above it.
 */
export type BookingSelection = { day: Date; slot: string };

type Ctx = {
  selection: BookingSelection | null;
  select: (s: BookingSelection | null) => void;
  /** Bumped when availability should be reloaded (e.g. a slot was just taken). */
  availabilityVersion: number;
  refreshAvailability: () => void;
};

const BookingSelectionContext = createContext<Ctx | null>(null);

export const BookingSelectionProvider = ({ children }: { children: ReactNode }) => {
  const [selection, select] = useState<BookingSelection | null>(null);
  const [availabilityVersion, setVersion] = useState(0);
  const refreshAvailability = useCallback(() => setVersion((v) => v + 1), []);
  const value = useMemo(
    () => ({ selection, select, availabilityVersion, refreshAvailability }),
    [selection, availabilityVersion, refreshAvailability],
  );
  return <BookingSelectionContext.Provider value={value}>{children}</BookingSelectionContext.Provider>;
};

/** null when there's no provider (signed-in contact page). */
export const useBookingSelection = () => useContext(BookingSelectionContext);

/** "11:00 AM EDT · Wednesday, September 16" */
export function describeSelection({ day, slot }: BookingSelection): string {
  const zone = torontoZoneLabel(slotStart(day, slot));
  return `${formatSlot(slot)} ${zone} · ${day.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`;
}
