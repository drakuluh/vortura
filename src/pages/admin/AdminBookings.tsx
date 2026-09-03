import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Phone,
  Clock,
  Calendar as CalendarIcon,
  User,
  Mail,
  MapPin,
  FileText,
  Check,
  X,
  Trash2,
  ExternalLink,
  PhoneIncoming,
  Video,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type BookingStatus = "confirmed" | "pending" | "completed" | "cancelled" | "no_show";
type BookingType = "discovery" | "strategy" | "onboarding" | "support" | "other";
type BookingSource = "retell_ai" | "manual" | "website";

interface Booking {
  id: string;
  caller_name: string;
  caller_phone: string;
  caller_email: string;
  booking_type: BookingType;
  scheduled_at: string;
  duration_minutes: number;
  status: BookingStatus;
  notes: string;
  source: BookingSource;
  retell_call_id: string | null;
  created_at: string;
}

const statusMeta: Record<BookingStatus, { label: string; className: string; dot: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "text-primary border-primary/30 bg-primary/10",
    dot: "bg-primary",
  },
  pending: {
    label: "Pending",
    className: "text-amber-300 border-amber-400/30 bg-amber-400/10",
    dot: "bg-amber-400",
  },
  completed: {
    label: "Completed",
    className: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    dot: "bg-emerald-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-muted-foreground border-white/10 bg-white/[0.04]",
    dot: "bg-muted-foreground",
  },
  no_show: {
    label: "No show",
    className: "text-destructive border-destructive/40 bg-destructive/10",
    dot: "bg-destructive",
  },
};

const typeMeta: Record<BookingType, { label: string; icon: typeof Phone }> = {
  discovery: { label: "Discovery Call", icon: PhoneIncoming },
  strategy: { label: "Strategy Session", icon: Video },
  onboarding: { label: "Onboarding", icon: User },
  support: { label: "Support Call", icon: Phone },
  other: { label: "Other", icon: CalendarIcon },
};

const sourceMeta: Record<BookingSource, string> = {
  retell_ai: "AI Agent",
  manual: "Manual",
  website: "Website",
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatRelativeDate = (iso: string) => {
  const now = new Date();
  const d = new Date(iso);
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 0) return "Earlier today";
    if (absDays === 1) return "Yesterday";
    return `${absDays} days ago`;
  }
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return `In ${days} days`;
  return formatDate(iso);
};

const isUpcoming = (iso: string) => new Date(iso).getTime() > Date.now();

const mapBooking = (raw: any): Booking => ({
  id: String(raw.id ?? crypto.randomUUID()),
  caller_name: raw.caller_name ?? "",
  caller_phone: raw.caller_phone ?? "",
  caller_email: raw.caller_email ?? "",
  booking_type: raw.booking_type ?? "discovery",
  scheduled_at: raw.scheduled_at ?? new Date().toISOString(),
  duration_minutes: raw.duration_minutes ?? 30,
  status: raw.status ?? "pending",
  notes: raw.notes ?? "",
  source: raw.source ?? "manual",
  retell_call_id: raw.retell_call_id ?? null,
  created_at: raw.created_at ?? new Date().toISOString(),
});

const emptyForm = {
  caller_name: "",
  caller_phone: "",
  caller_email: "",
  booking_type: "discovery" as BookingType,
  scheduled_date: "",
  scheduled_time: "",
  duration_minutes: 30,
  notes: "",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | BookingStatus>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | BookingType>("all");
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Booking | null>(null);
  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      setBookings((data ?? []).map(mapBooking));
    } catch {
      // Table may not exist yet — that's expected
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const stats = useMemo(() => {
    const now = Date.now();
    const upcoming = bookings.filter(
      (b) => new Date(b.scheduled_at).getTime() > now && b.status !== "cancelled",
    );
    const today = upcoming.filter((b) => {
      const d = new Date(b.scheduled_at);
      const n = new Date();
      return (
        d.getFullYear() === n.getFullYear() &&
        d.getMonth() === n.getMonth() &&
        d.getDate() === n.getDate()
      );
    });
    const pending = bookings.filter((b) => b.status === "pending").length;
    const completed = bookings.filter((b) => b.status === "completed").length;
    return {
      upcoming: upcoming.length,
      today: today.length,
      pending,
      completed,
    };
  }, [bookings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...bookings];

    if (statusFilter === "upcoming") {
      list = list.filter((b) => isUpcoming(b.scheduled_at) && b.status !== "cancelled");
    } else if (statusFilter !== "all") {
      list = list.filter((b) => b.status === statusFilter);
    }

    if (typeFilter !== "all") {
      list = list.filter((b) => b.booking_type === typeFilter);
    }

    if (q) {
      list = list.filter(
        (b) =>
          `${b.caller_name} ${b.caller_email} ${b.caller_phone} ${b.notes}`
            .toLowerCase()
            .includes(q),
      );
    }

    list.sort((a, b) => {
      const aUp = isUpcoming(a.scheduled_at);
      const bUp = isUpcoming(b.scheduled_at);
      if (aUp && !bUp) return -1;
      if (!aUp && bUp) return 1;
      if (aUp && bUp)
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
    });

    return list;
  }, [bookings, search, statusFilter, typeFilter]);

  const calendarDays = useMemo(() => {
    const { year, month } = calMonth;
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const cells: { day: number; inMonth: boolean; date: Date }[] = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      cells.push({ day: d, inMonth: false, date: new Date(year, month - 1, d) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, inMonth: true, date: new Date(year, month, d) });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({ day: d, inMonth: false, date: new Date(year, month + 1, d) });
      }
    }
    return cells;
  }, [calMonth]);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const d = new Date(b.scheduled_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const calMonthLabel = new Date(calMonth.year, calMonth.month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () =>
    setCalMonth((p) => {
      const d = new Date(p.year, p.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const nextMonth = () =>
    setCalMonth((p) => {
      const d = new Date(p.year, p.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => {
    const now = new Date();
    setCalMonth({ year: now.getFullYear(), month: now.getMonth() });
  };

  const handleCreate = async () => {
    if (!form.caller_name.trim() || !form.scheduled_date || !form.scheduled_time) {
      toast.error("Name, date, and time are required.");
      return;
    }
    setSaving(true);
    try {
      const scheduled_at = new Date(
        `${form.scheduled_date}T${form.scheduled_time}`,
      ).toISOString();
      const payload = {
        caller_name: form.caller_name.trim(),
        caller_phone: form.caller_phone.trim(),
        caller_email: form.caller_email.trim(),
        booking_type: form.booking_type,
        scheduled_at,
        duration_minutes: form.duration_minutes,
        status: "confirmed" as BookingStatus,
        notes: form.notes.trim(),
        source: "manual" as BookingSource,
      };
      const { data, error } = await supabase
        .from("bookings")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      setBookings((prev) => [...prev, mapBooking(data)]);
      toast.success("Booking created.");
      setCreating(false);
      setForm(emptyForm);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create booking. Make sure the bookings table exists in Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b)),
      );
      if (activeBooking?.id === id) setActiveBooking({ ...activeBooking, status });
      toast.success(`Booking marked as ${statusMeta[status].label.toLowerCase()}.`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to update.");
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast.success("Booking deleted.");
      if (activeBooking?.id === id) setActiveBooking(null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete.");
    }
  };

  return (
    <AdminPage
      eyebrow="Schedule"
      title="Bookings"
      description="View and manage scheduled calls. AI-booked calls from RetellAI appear here automatically."
      actions={
        <Button variant="hero" size="sm" onClick={() => setCreating(true)}>
          <Plus className="w-3.5 h-3.5" />
          New Booking
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Upcoming
          </p>
          <p className="text-xl font-bold">{stats.upcoming}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Today
          </p>
          <p className="text-xl font-bold">{stats.today}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Pending
          </p>
          <p className="text-xl font-bold">{stats.pending}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Completed
          </p>
          <p className="text-xl font-bold">{stats.completed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-5">
        <button
          type="button"
          onClick={() => setTab("list")}
          className={cn(
            "md:col-span-2 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
            tab === "list"
              ? "glass border-primary/30 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06]",
          )}
        >
          <List className="w-3.5 h-3.5" />
          List
        </button>
        <button
          type="button"
          onClick={() => setTab("calendar")}
          className={cn(
            "md:col-span-2 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
            tab === "calendar"
              ? "glass border-primary/30 text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-white/[0.06]",
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          Calendar
        </button>
      </div>

      {tab === "calendar" ? (
        <div className="glass rounded-2xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold tracking-tight min-w-[140px] text-center">
                {calMonthLabel}
              </h3>
              <button
                type="button"
                onClick={nextMonth}
                className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={goToday}
              className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              Today
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div
                key={d}
                className="py-2 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, i) => {
              const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
              const dayBookings = bookingsByDate.get(key) ?? [];
              const now = new Date();
              const isToday =
                cell.inMonth &&
                cell.date.getFullYear() === now.getFullYear() &&
                cell.date.getMonth() === now.getMonth() &&
                cell.date.getDate() === now.getDate();

              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[90px] md:min-h-[110px] border-b border-r border-white/[0.04] p-1.5 md:p-2 transition-colors",
                    !cell.inMonth && "bg-white/[0.01]",
                    cell.inMonth && "hover:bg-white/[0.03]",
                    i % 7 === 0 && "border-l-0",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-[12px] font-medium w-6 h-6 flex items-center justify-center rounded-full",
                        !cell.inMonth && "text-muted-foreground/40",
                        cell.inMonth && "text-foreground/80",
                        isToday && "bg-primary text-white font-bold",
                      )}
                    >
                      {cell.day}
                    </span>
                    {dayBookings.length > 0 && cell.inMonth && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {dayBookings.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => {
                      const st = statusMeta[b.status];
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => setActiveBooking(b)}
                          className={cn(
                            "w-full text-left rounded px-1.5 py-0.5 text-[11px] truncate transition-colors",
                            "hover:ring-1 hover:ring-primary/40",
                            b.status === "cancelled"
                              ? "bg-white/[0.03] text-muted-foreground line-through"
                              : b.status === "completed"
                                ? "bg-emerald-400/10 text-emerald-300"
                                : b.status === "pending"
                                  ? "bg-amber-400/10 text-amber-300"
                                  : "bg-primary/10 text-primary",
                          )}
                        >
                          <span className="font-medium">{formatTime(b.scheduled_at)}</span>
                          <span className="hidden md:inline text-[10px] ml-1 opacity-70">
                            {b.caller_name ? ` ${b.caller_name.split(" ")[0]}` : ""}
                          </span>
                        </button>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <p className="text-[10px] text-muted-foreground px-1.5">
                        +{dayBookings.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      <>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All bookings</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="discovery">Discovery Call</SelectItem>
            <SelectItem value="strategy">Strategy Session</SelectItem>
            <SelectItem value="onboarding">Onboarding</SelectItem>
            <SelectItem value="support">Support Call</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            Loading bookings...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-dashed border-white/15 p-10 md:p-14 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4">
            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold tracking-tight mb-1.5">
            {bookings.length === 0 ? "No bookings yet" : "No bookings match your filters"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
            {bookings.length === 0
              ? "Bookings from your AI call agent will appear here automatically. You can also add them manually."
              : "Try adjusting your search or filters."}
          </p>
          {bookings.length === 0 && (
            <Button variant="hero" size="sm" onClick={() => setCreating(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add first booking
            </Button>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          {(() => {
            const gridCols =
              "lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_6rem_6rem_5rem]";
            return (
              <>
                <div
                  className={cn(
                    "hidden lg:grid gap-4 px-5 py-3 border-b border-white/[0.06] font-mono text-[11px] uppercase tracking-widest text-muted-foreground",
                    gridCols,
                  )}
                >
                  <span>Caller</span>
                  <span>Date & Time</span>
                  <span>Type</span>
                  <span>Source</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                <ul className="divide-y divide-white/[0.05]">
                  {filtered.map((b) => {
                    const st = statusMeta[b.status];
                    const tp = typeMeta[b.booking_type];
                    const TypeIcon = tp.icon;
                    const upcoming = isUpcoming(b.scheduled_at);
                    return (
                      <li key={b.id} className="odd:bg-white/[0.02]">
                        <button
                          type="button"
                          onClick={() => setActiveBooking(b)}
                          className={cn(
                            "w-full text-left grid grid-cols-1 gap-2 lg:gap-4 px-4 lg:px-5 py-3.5 items-center transition-colors hover:bg-white/[0.04] focus:outline-none focus-visible:bg-white/[0.05]",
                            gridCols,
                          )}
                        >
                          {/* Caller */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground shrink-0">
                              <User className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium truncate">
                                {b.caller_name || "Unknown caller"}
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {b.caller_phone || b.caller_email || "No contact info"}
                              </p>
                            </div>
                          </div>

                          {/* Date & Time */}
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium">
                              {formatDate(b.scheduled_at)}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(b.scheduled_at)} · {b.duration_minutes}min
                              {upcoming && (
                                <span className="ml-1 text-primary">
                                  · {formatRelativeDate(b.scheduled_at)}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Type */}
                          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                            <TypeIcon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{tp.label}</span>
                          </div>

                          {/* Source */}
                          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                            {sourceMeta[b.source]}
                          </p>

                          {/* Status */}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest w-fit whitespace-nowrap",
                              st.className,
                            )}
                          >
                            <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                            {st.label}
                          </span>

                          {/* Actions */}
                          <div
                            className="flex items-center gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {b.status === "confirmed" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Mark completed"
                                onClick={() => updateStatus(b.id, "completed")}
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-red-500/10 group"
                              title="Delete booking"
                              onClick={() => setConfirmDelete(b)}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400" />
                            </Button>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            );
          })()}
        </div>
      )}

      </>
      )}

      {/* Detail dialog */}
      <Dialog
        open={!!activeBooking}
        onOpenChange={(open) => {
          if (!open) setActiveBooking(null);
        }}
      >
        <DialogContent hideClose className="max-w-2xl border-2 border-white/15 bg-card text-foreground">
          {activeBooking && (() => {
            const st = statusMeta[activeBooking.status];
            const tp = typeMeta[activeBooking.booking_type];
            const TypeIcon = tp.icon;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        {activeBooking.caller_name || "Unknown caller"}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-[11px] uppercase tracking-widest whitespace-nowrap shrink-0",
                            st.className,
                          )}
                        >
                          <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                          {st.label}
                        </span>
                      </DialogTitle>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
                        {tp.label} · {formatDate(activeBooking.scheduled_at)} · {sourceMeta[activeBooking.source]}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Label>Date</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {formatDate(activeBooking.scheduled_at)}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <Label>Time</Label>
                      <p className="text-sm mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        {formatTime(activeBooking.scheduled_at)} · {activeBooking.duration_minutes}min
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3">
                      <Label>Phone</Label>
                      {activeBooking.caller_phone ? (
                        <a
                          href={`tel:${activeBooking.caller_phone}`}
                          className="block text-sm mt-1 hover:text-primary transition-colors truncate"
                        >
                          {activeBooking.caller_phone}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">Not provided</p>
                      )}
                    </div>
                    <div className="glass rounded-xl p-3">
                      <Label>Email</Label>
                      {activeBooking.caller_email ? (
                        <a
                          href={`mailto:${activeBooking.caller_email}`}
                          className="block text-sm mt-1 hover:text-primary transition-colors truncate"
                        >
                          {activeBooking.caller_email}
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">Not provided</p>
                      )}
                    </div>
                  </div>

                  {activeBooking.retell_call_id && (
                    <div className="glass rounded-xl p-3">
                      <Label>RetellAI Call</Label>
                      <p className="text-sm mt-1 flex items-center gap-2 text-primary">
                        <PhoneIncoming className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-[12px] truncate">
                          {activeBooking.retell_call_id}
                        </span>
                      </p>
                    </div>
                  )}

                  {activeBooking.notes && (
                    <div className="glass rounded-xl p-3">
                      <Label>Notes</Label>
                      <p className="text-sm mt-1 leading-relaxed">{activeBooking.notes}</p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex-wrap gap-2">
                  {activeBooking.status === "pending" && (
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => updateStatus(activeBooking.id, "confirmed")}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Confirm
                    </Button>
                  )}
                  {activeBooking.status === "confirmed" && (
                    <Button
                      variant="hero"
                      size="sm"
                      onClick={() => updateStatus(activeBooking.id, "completed")}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark completed
                    </Button>
                  )}
                  {(activeBooking.status === "confirmed" || activeBooking.status === "pending") && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-white/10 hover:text-white"
                        onClick={() => updateStatus(activeBooking.id, "no_show")}
                      >
                        No show
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-white/10 hover:text-white"
                        onClick={() => updateStatus(activeBooking.id, "cancelled")}
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setActiveBooking(null)}
                    className="hover:bg-white/10 hover:text-white"
                  >
                    Close
                  </Button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent hideClose className="sm:max-w-lg border-2 border-white/15 bg-card text-foreground">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Caller name *</Label>
              <Input
                value={form.caller_name}
                onChange={(e) => setForm({ ...form, caller_name: e.target.value })}
                placeholder="John Smith"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.caller_phone}
                  onChange={(e) => setForm({ ...form, caller_phone: e.target.value })}
                  placeholder="416-555-0000"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={form.caller_email}
                  onChange={(e) => setForm({ ...form, caller_email: e.target.value })}
                  placeholder="john@example.com"
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Booking type</Label>
              <Select
                value={form.booking_type}
                onValueChange={(v) =>
                  setForm({ ...form, booking_type: v as BookingType })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discovery">Discovery Call</SelectItem>
                  <SelectItem value="strategy">Strategy Session</SelectItem>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="support">Support Call</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={form.scheduled_date}
                  onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={form.scheduled_time}
                  onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Select
                value={String(form.duration_minutes)}
                onValueChange={(v) =>
                  setForm({ ...form, duration_minutes: parseInt(v) })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any details about the call..."
                rows={3}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreating(false)}
              disabled={saving}
              className="hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button variant="hero" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating..." : "Create Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="border-2 border-white/15 bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `The booking for "${confirmDelete.caller_name}" on ${formatDate(confirmDelete.scheduled_at)} will be permanently removed.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) deleteBooking(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminPage>
  );
}
