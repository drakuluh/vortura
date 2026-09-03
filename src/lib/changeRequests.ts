import type { Database } from "@/integrations/supabase/types";

type ChangeStatus = Database["public"]["Enums"]["change_status"];
type Priority = Database["public"]["Enums"]["priority_level"];

type Tone = "primary" | "secondary" | "success" | "warn" | "danger" | "muted";

export const changeStatusTone = (s: ChangeStatus): Tone => {
  switch (s) {
    case "new": return "primary";
    case "in_review": return "warn";
    case "shipped": return "success";
    default: return "muted";
  }
};

export const changeStatusLabel = (s: ChangeStatus): string => {
  switch (s) {
    case "new": return "New";
    case "in_review": return "In Review";
    case "shipped": return "Shipped";
    default: return s;
  }
};

export const priorityTone = (p: Priority): Tone => {
  switch (p) {
    case "low": return "success";
    case "med": return "warn";
    case "high": return "danger";
    default: return "muted";
  }
};

export const STATUS_ORDER: ChangeStatus[] = ["new", "in_review", "shipped"];