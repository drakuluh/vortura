import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/* ── Booking helpers ─────────────────────────────────────────── */

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 21; h++) {
    slots.push(`${h}:00`);
    slots.push(`${h}:30`);
  }
  return slots;
}

function formatTime(slot: string): string {
  const [h, m] = slot.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function toEST(date: Date, timeSlot: string): Date {
  const [h, m] = timeSlot.split(":").map(Number);
  const estString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  return new Date(estString + "-05:00");
}

const TIME_SLOTS = generateTimeSlots();

/* ── Deterministic fake availability ─────────────────────────── */

function seededRandom(seed: number): number {
  let s = seed;
  s = ((s >>> 0) * 2654435761) >>> 0;
  s = ((s >>> 0) * 2246822519) >>> 0;
  s = ((s ^ (s >>> 13)) * 3266489917) >>> 0;
  return (s >>> 0) / 4294967296;
}

function isSlotTaken(date: Date, slotIndex: number, today: Date): boolean {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysOut = Math.floor((date.getTime() - todayStart.getTime()) / 86400000);
  if (daysOut > 10 || daysOut < 0) return false;

  let dayWeight: number;
  if (daysOut <= 1) dayWeight = 0.75;
  else if (daysOut <= 3) dayWeight = 0.65;
  else if (daysOut <= 6) dayWeight = 0.50;
  else dayWeight = 0.30;

  const [h] = TIME_SLOTS[slotIndex].split(":").map(Number);
  let timeWeight: number;
  if (h >= 10 && h < 14) timeWeight = 0.85;
  else if (h >= 9 && h < 10) timeWeight = 0.60;
  else if (h >= 14 && h < 17) timeWeight = 0.65;
  else timeWeight = 0.40;

  const threshold = dayWeight * timeWeight;
  const dateSeed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const seed = dateSeed * 100 + slotIndex;
  const roll = seededRandom(seed);

  if (slotIndex > 0) {
    const prevSeed = dateSeed * 100 + (slotIndex - 1);
    const prevRoll = seededRandom(prevSeed);
    const prevThreshold = dayWeight * ((() => {
      const [ph] = TIME_SLOTS[slotIndex - 1].split(":").map(Number);
      if (ph >= 10 && ph < 14) return 0.85;
      if (ph >= 9 && ph < 10) return 0.60;
      if (ph >= 14 && ph < 17) return 0.65;
      return 0.40;
    })());
    const prevTaken = prevRoll < prevThreshold;
    if (prevTaken) {
      return seededRandom(seed + 9999) < 0.70 || roll < threshold;
    }
  }

  return roll < threshold;
}

/* ── Booking Panel ───────────────────────────────────────────── */

type BookingStatus = "idle" | "submitting" | "success";

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
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<BookingStatus>("idle");

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    return TIME_SLOTS.map((slot, idx) => ({
      slot,
      label: formatTime(slot),
      taken: isSlotTaken(selectedDate, idx, today),
    }));
  }, [selectedDate, today]);

  const handleBook = async (time: string) => {
    if (!selectedDate) return;
    setSelectedTime(time);
    setStatus("submitting");
    try {
      const scheduledAt = toEST(selectedDate, time);
      const callerName = user
        ? ([user.user_metadata?.first_name, user.user_metadata?.last_name].filter(Boolean).join(" ") ||
           user.user_metadata?.display_name || user.email || "Guest")
        : "Guest";
      const { error } = await supabase.from("bookings").insert({
        caller_name: callerName,
        caller_email: user?.email ?? null,
        booking_type: "discovery",
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 30,
        status: "pending",
        source: "website",
      });
      if (error) throw error;
      setStatus("success");
      toast.success("Call booked! We'll confirm your time shortly.");
    } catch {
      setStatus("idle");
      toast.error("Could not book the call. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-6 lg:py-0">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center shadow-glow-blue">
          <Check className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-1.5 text-depth">You're on the calendar.</h3>
        <p className="text-sm text-muted-foreground mb-1">
          {formatTime(selectedTime!)} EST · {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <p className="text-sm text-muted-foreground mb-5">
          We'll confirm your time shortly.
        </p>
        <Button variant="glass" size="sm" onClick={() => {
          setStatus("idle"); setSelectedDate(today); setSelectedTime(null);
        }}>
          Book another call
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3.5">
        Select a date & time<span className="text-primary ml-0.5">*</span>
      </p>
      <div className="flex flex-col sm:flex-row sm:divide-x sm:divide-white/[0.06] rounded-xl glass !bg-white/[0.10] overflow-hidden flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
          disabled={{ before: today }}
          className="px-4 pt-1 pb-3 flex-1 flex flex-col justify-center"
          classNames={{
            months: "flex flex-col space-y-2",
            month: "space-y-2",
            caption: "flex justify-center relative items-center pb-1",
            caption_label: "text-sm font-medium font-mono uppercase tracking-wider",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/[0.06] transition-colors",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] font-mono",
            row: "flex w-full mt-2",
            cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] aria-selected:opacity-100",
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
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-1 px-2 pb-2">
                {availableSlots.map(({ slot, label, taken }) => {
                  const active = selectedTime === slot;
                  return (
                    <Button
                      key={slot}
                      onClick={() => handleBook(slot)}
                      disabled={taken || status === "submitting"}
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "font-mono text-[11px] tracking-wide h-7 px-2",
                        taken && "opacity-25 line-through",
                        !taken && !active && "border-primary/20 bg-primary/[0.06] hover:bg-primary/15 hover:border-primary/40 text-foreground/80 hover:text-foreground",
                        !taken && active && "btn-hero-glass !border-0 text-white"
                      )}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};
