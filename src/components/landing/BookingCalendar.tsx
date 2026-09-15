import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, callFunction, callRpc, currentAccessToken } from "@/lib/public-api";
import { MIN_LEAD_MS, SLOT_MINUTES, TIME_SLOTS, formatSlot, slotStart, torontoZoneLabel } from "@/lib/booking-time";
import { cn } from "@/lib/utils";
import { useBookingSelection } from "@/components/landing/booking-selection";

/* ── Booking Panel ───────────────────────────────────────────── */

type BookingStatus = "idle" | "submitting" | "success";
type BookedRange = { starts_at: string; ends_at: string };

export const UPCOMING_CALLS_QUERY_KEY = "my-upcoming-calls";

export const BookingPanel = () => {
  return (
    <div className="flex flex-col flex-1">
      <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-4">
        // Book a time<span className="text-primary ml-0.5">*</span>
      </p>
      <CalendarPicker />
    </div>
  );
};

const CalendarPicker = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [booked, setBooked] = useState<BookedRange[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Signed-out: the time is shared with the contact form, whose "Confirm
  // Booking" button books it. Signed-in users have no form, so they always
  // confirm right here, even where a provider is present (home page).
  const sharedContext = useBookingSelection();
  const shared = user ? null : sharedContext;
  const [localTime, setLocalTime] = useState<string | null>(null);
  const selectedTime = shared
    ? shared.selection && selectedDate && shared.selection.day.toDateString() === selectedDate.toDateString()
      ? shared.selection.slot
      : null
    : localTime;
  const setSelectedTime = (slot: string | null) => {
    if (shared) shared.select(slot && selectedDate ? { day: selectedDate, slot } : null);
    else setLocalTime(slot);
  };

  const memberName = user
    ? [user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") ||
      user.user_metadata?.display_name ||
      user.email
    : null;

  // Real availability for the selected day. Only start/end times come back,
  // never who booked.
  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    setBooked(null);
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    callRpc<BookedRange[]>("booked_slots", {
      range_start: slotStart(selectedDate, "0:00").toISOString(),
      range_end: slotStart(next, "0:00").toISOString(),
    })
      .then((rows) => !cancelled && setBooked(rows))
      .catch((err) => {
        // Still bookable if this fails; book-call rejects clashes anyway.
        console.error("Could not load availability", err);
        if (!cancelled) setBooked([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate, refreshKey, shared?.availabilityVersion]);

  const slots = useMemo(() => {
    if (!selectedDate) return [];
    const earliest = Date.now() + MIN_LEAD_MS;
    return TIME_SLOTS.map((slot) => {
      const start = slotStart(selectedDate, slot).getTime();
      const end = start + SLOT_MINUTES * 60000;
      const clash = (booked ?? []).some((b) => new Date(b.starts_at).getTime() < end && new Date(b.ends_at).getTime() > start);
      return { slot, label: formatSlot(slot), unavailable: start < earliest || clash };
    });
  }, [selectedDate, booked]);

  const zone = selectedDate ? torontoZoneLabel(slotStart(selectedDate, "12:00")) : "ET";
  const whenLabel =
    selectedDate && selectedTime
      ? `${formatSlot(selectedTime)} ${zone} · ${selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
      : "";

  const confirm = async () => {
    if (!selectedDate || !selectedTime || !user) return;
    setStatus("submitting");
    try {
      const token = await currentAccessToken();
      await callFunction("book-call", { scheduled_at: slotStart(selectedDate, selectedTime).toISOString() }, token);
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: [UPCOMING_CALLS_QUERY_KEY] });
    } catch (err) {
      setStatus("idle");
      if (err instanceof ApiError && err.code === "slot_taken") {
        toast.error("Someone just booked that time. Pick another one.");
        setSelectedTime(null);
        setRefreshKey((k) => k + 1);
      } else if (err instanceof ApiError && err.code === "rate_limited") {
        toast.error("Too many bookings from this connection today. Email support@vortura.ai and we'll set it up.");
      } else if (err instanceof ApiError && err.fields?.scheduled_at) {
        toast.error(err.fields.scheduled_at);
        setSelectedTime(null);
      } else {
        toast.error("Could not book the call. Please try again.");
      }
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6 lg:py-0" role="status">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-blue">
          <Check className="w-5 h-5 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold mb-1.5 text-depth">You're on the calendar.</h3>
        <p className="text-sm text-muted-foreground mb-1">{whenLabel}</p>
        <p className="text-sm text-muted-foreground mb-5">
          We'll confirm the time by email{user?.email ? ` at ${user.email}` : ""}.
        </p>
        <Button
          variant="glass"
          size="sm"
          onClick={() => {
            setStatus("idle");
            setSelectedTime(null);
            setRefreshKey((k) => k + 1);
          }}
        >
          Book another call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3.5">
        Select a date & time ({zone})<span className="text-primary ml-0.5">*</span>
      </p>
      <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-white/[0.06] rounded-xl glass !bg-white/[0.10] overflow-hidden flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => {
            // Clicking the selected date again would clear it and empty the
            // time list; keep the current date instead.
            if (!d) return;
            setSelectedDate(d);
            setSelectedTime(null);
          }}
          disabled={{ before: today }}
          className="px-2 sm:px-4 pt-1 pb-3 flex-1 flex flex-col justify-center"
          classNames={{
            months: "flex flex-col space-y-2",
            month: "space-y-2",
            caption: "flex justify-center relative items-center pb-1",
            caption_label: "text-sm font-medium font-mono uppercase tracking-wider",
            nav: "space-x-1 flex items-center",
            nav_button: "h-11 w-11 sm:h-8 sm:w-8 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/[0.06] transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-10 sm:w-9 font-normal text-[0.8rem] font-mono",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 sm:h-9 sm:w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-10 w-10 sm:h-9 sm:w-9 p-0 font-normal inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] aria-selected:opacity-100",
            day_selected: "btn-hero-glass !border-0 text-white hover:text-white focus:text-white",
            day_today: "ring-1 ring-primary/40",
            day_outside: "text-muted-foreground opacity-30",
            day_disabled: "text-muted-foreground opacity-25",
            day_hidden: "invisible",
          }}
        />
        <div className="relative w-full sm:w-[140px] shrink-0 border-t sm:border-t-0 border-white/[0.06]">
          <div className="absolute inset-0 grid gap-0">
            <div className="px-2 pt-3 pb-2">
              <p className="text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
                  : "Select a date"}
              </p>
            </div>
            <ScrollArea className="h-full overflow-y-auto">
              {booked === null && selectedDate ? (
                <p className="flex items-center justify-center gap-1.5 py-6 text-[11px] font-mono uppercase tracking-widest text-muted-foreground" role="status">
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  Checking
                </p>
              ) : slots.every((s) => s.unavailable) && selectedDate ? (
                <p className="px-3 py-6 text-center text-[11px] text-muted-foreground">No times left this day. Try another date.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 px-2 pb-2">
                  {slots.map(({ slot, label, unavailable }) => {
                    const active = selectedTime === slot;
                    return (
                      <Button
                        key={slot}
                        onClick={() => setSelectedTime(slot)}
                        disabled={unavailable || status === "submitting"}
                        aria-pressed={active}
                        aria-label={unavailable ? `${label}, unavailable` : label}
                        variant={active ? "default" : "outline"}
                        className={cn(
                          "font-mono text-[11px] tracking-wide h-11 sm:h-7 px-2",
                          unavailable && "opacity-25 line-through",
                          !unavailable && !active && "border-primary/20 bg-primary/[0.06] hover:bg-primary/15 hover:border-primary/40 text-foreground/80 hover:text-foreground",
                          !unavailable && active && "btn-hero-glass !border-0 text-white",
                        )}
                      >
                        {label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Signed-in only. Signed-out visitors confirm with the contact form's
          "Confirm Booking" button, which already has their details. */}
      {!shared && user && selectedTime && (
        <div className="mt-3 rounded-xl border border-primary/25 bg-primary/[0.06] p-3.5">
          <p className="text-sm font-medium text-depth">{whenLabel}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Booking as {memberName}
            {user.email && memberName !== user.email ? ` (${user.email})` : ""}
          </p>
          <Button variant="hero" size="sm" className="mt-3 w-full" onClick={() => void confirm()} disabled={status === "submitting"}>
            {status === "submitting" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Booking…
              </>
            ) : (
              "Confirm booking"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
