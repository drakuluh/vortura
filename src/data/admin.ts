import {
  Building2,
  CreditCard,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Wand2,
  type LucideIcon,
} from "lucide-react";

/* ------------------------------ Nav ------------------------------ */

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export const adminNav: AdminNavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/clients", label: "Clients", icon: Building2, badge: 18 },
  { to: "/admin/packages", label: "Packages", icon: Package, badge: 7 },
  { to: "/admin/invoices", label: "Invoices", icon: CreditCard, badge: 3 },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare, badge: 4 },
  { to: "/admin/change-requests", label: "Change requests", icon: Wand2, badge: 5 },
  { to: "/admin/admins", label: "Team", icon: ShieldCheck },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

/* --------------------------- Overview KPIs --------------------------- */

export interface AdminKpi {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  accent: "primary" | "secondary";
  spark: number[];
}

export const adminKpis: AdminKpi[] = [
  {
    id: "mrr",
    label: "MRR",
    value: "$84,200",
    delta: "+12.4%",
    trend: "up",
    accent: "primary",
    spark: [42, 48, 52, 55, 60, 64, 68, 72, 75, 78, 81, 84],
  },
  {
    id: "active-clients",
    label: "Active clients",
    value: "18",
    delta: "+3 this mo",
    trend: "up",
    accent: "secondary",
    spark: [8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18],
  },
  {
    id: "avg-response",
    label: "Avg response",
    value: "1h 12m",
    delta: "−18m",
    trend: "down",
    accent: "secondary",
    spark: [180, 165, 150, 144, 132, 120, 110, 96, 88, 80, 75, 72],
  },
];

/* --------------------------- Clients --------------------------- */

export type ClientStatus = "active" | "onboarding" | "paused" | "churned";

export interface AdminClient {
  id: string;
  name: string;
  contact: string;
  email: string;
  plan: "Starter" | "Growth" | "Scale" | "Enterprise";
  status: ClientStatus;
  mrr: number;
  packages: number;
  joined: string;
  health: "healthy" | "watch" | "at_risk";
}

export const adminClients: AdminClient[] = [
  { id: "c1", name: "Vortura Labs", contact: "Alexandre Roux", email: "alex@vortura.io", plan: "Growth", status: "active", mrr: 6500, packages: 3, joined: "Mar 2025", health: "healthy" },
  { id: "c2", name: "Northwind & Co", contact: "Sasha Lim", email: "sasha@northwind.co", plan: "Scale", status: "active", mrr: 12400, packages: 5, joined: "Jan 2025", health: "healthy" },
  { id: "c3", name: "Lumen Health", contact: "Priya Shah", email: "priya@lumenhealth.com", plan: "Growth", status: "onboarding", mrr: 6500, packages: 1, joined: "Apr 2026", health: "watch" },
  { id: "c4", name: "Halcyon Studios", contact: "Marco Bianchi", email: "marco@halcyon.studio", plan: "Starter", status: "active", mrr: 2400, packages: 1, joined: "Dec 2024", health: "healthy" },
  { id: "c5", name: "Atlas Freight", contact: "Jordan Reeves", email: "j.reeves@atlasfreight.io", plan: "Scale", status: "active", mrr: 14800, packages: 4, joined: "Nov 2024", health: "watch" },
  { id: "c6", name: "Bramble Coffee", contact: "Naomi Park", email: "naomi@bramble.coffee", plan: "Starter", status: "paused", mrr: 0, packages: 2, joined: "Aug 2024", health: "at_risk" },
  { id: "c7", name: "Polaris Capital", contact: "Henry Cole", email: "h.cole@polariscap.com", plan: "Enterprise", status: "active", mrr: 24000, packages: 6, joined: "Jun 2024", health: "healthy" },
  { id: "c8", name: "Verdant Eats", contact: "Linh Nguyen", email: "linh@verdant.eats", plan: "Growth", status: "active", mrr: 6500, packages: 2, joined: "Feb 2025", health: "watch" },
];

/* --------------------------- Packages --------------------------- */

export type PackageStatus = "active" | "in_progress" | "review" | "paused";

export interface AdminPackage {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: PackageStatus;
  progress: number;
  engineer: string;
  due: string;
  accent: "primary" | "secondary";
}

export const adminPackages: AdminPackage[] = [
  { id: "p1", name: "Inbound Lead Concierge", client: "Vortura Labs", clientId: "c1", status: "active", progress: 100, engineer: "Mira K.", due: "Live", accent: "primary" },
  { id: "p2", name: "Voice AI — Booking Agent", client: "Vortura Labs", clientId: "c1", status: "in_progress", progress: 64, engineer: "Daniel R.", due: "May 02", accent: "secondary" },
  { id: "p3", name: "Revenue Ops Sync", client: "Northwind & Co", clientId: "c2", status: "review", progress: 88, engineer: "Mira K.", due: "Apr 28", accent: "primary" },
  { id: "p4", name: "Inbox Triage Agent", client: "Lumen Health", clientId: "c3", status: "in_progress", progress: 22, engineer: "Sven O.", due: "May 14", accent: "secondary" },
  { id: "p5", name: "AR Automation", client: "Atlas Freight", clientId: "c5", status: "active", progress: 100, engineer: "Daniel R.", due: "Live", accent: "primary" },
  { id: "p6", name: "Quote-to-Cash Agent", client: "Polaris Capital", clientId: "c7", status: "in_progress", progress: 47, engineer: "Mira K.", due: "May 09", accent: "secondary" },
  { id: "p7", name: "CRM Hygiene Sweep", client: "Verdant Eats", clientId: "c8", status: "paused", progress: 35, engineer: "Sven O.", due: "On hold", accent: "primary" },
];

/* --------------------------- Invoices --------------------------- */

export type InvoiceStatus = "paid" | "due" | "overdue" | "draft";

export interface AdminInvoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  issued: string;
  due: string;
  status: InvoiceStatus;
}

export const adminInvoices: AdminInvoice[] = [
  { id: "i1", number: "INV-2026-041", client: "Polaris Capital", amount: 24000, issued: "Apr 01, 2026", due: "Apr 15, 2026", status: "paid" },
  { id: "i2", number: "INV-2026-042", client: "Atlas Freight", amount: 14800, issued: "Apr 03, 2026", due: "Apr 17, 2026", status: "paid" },
  { id: "i3", number: "INV-2026-043", client: "Northwind & Co", amount: 12400, issued: "Apr 05, 2026", due: "Apr 19, 2026", status: "due" },
  { id: "i4", number: "INV-2026-044", client: "Vortura Labs", amount: 6500, issued: "Apr 07, 2026", due: "Apr 21, 2026", status: "due" },
  { id: "i5", number: "INV-2026-038", client: "Verdant Eats", amount: 6500, issued: "Mar 24, 2026", due: "Apr 07, 2026", status: "overdue" },
  { id: "i6", number: "INV-2026-045", client: "Lumen Health", amount: 6500, issued: "Apr 10, 2026", due: "Apr 24, 2026", status: "draft" },
  { id: "i7", number: "INV-2026-046", client: "Halcyon Studios", amount: 2400, issued: "Apr 12, 2026", due: "Apr 26, 2026", status: "due" },
];

/* --------------------------- Messages --------------------------- */

export interface AdminThread {
  id: string;
  client: string;
  subject: string;
  preview: string;
  unread: number;
  lastAt: string;
  assigned: string;
}

export const adminThreads: AdminThread[] = [
  { id: "t1", client: "Vortura Labs", subject: "Booking agent edge case", preview: "When a caller asks for Spanish, the agent...", unread: 2, lastAt: "12m ago", assigned: "Mira K." },
  { id: "t2", client: "Northwind & Co", subject: "Revenue Ops Sync — review notes", preview: "Two field mappings still feel off — see screenshots…", unread: 1, lastAt: "1h ago", assigned: "Daniel R." },
  { id: "t3", client: "Lumen Health", subject: "Onboarding kickoff", preview: "Confirming the call for Friday at 10am ET.", unread: 0, lastAt: "3h ago", assigned: "Sven O." },
  { id: "t4", client: "Atlas Freight", subject: "AR Automation — exception report", preview: "We saw a spike in unmatched payments...", unread: 1, lastAt: "Yesterday", assigned: "Daniel R." },
  { id: "t5", client: "Polaris Capital", subject: "Quote-to-cash demo", preview: "Loved the demo. Two questions about audit trail.", unread: 0, lastAt: "2d ago", assigned: "Mira K." },
];

/* --------------------------- Change requests --------------------------- */

export type ChangeStatus = "new" | "in_review" | "shipped";

export interface AdminChangeRequest {
  id: string;
  client: string;
  package: string;
  title: string;
  status: ChangeStatus;
  priority: "low" | "med" | "high";
  submitted: string;
  owner: string;
}

export const adminChangeRequests: AdminChangeRequest[] = [
  { id: "cr1", client: "Vortura Labs", package: "Voice AI — Booking Agent", title: "Add Spanish handoff path", status: "in_review", priority: "high", submitted: "Apr 22", owner: "Mira K." },
  { id: "cr2", client: "Northwind & Co", package: "Revenue Ops Sync", title: "Map renewal_date → CRM field", status: "in_review", priority: "med", submitted: "Apr 21", owner: "Daniel R." },
  { id: "cr3", client: "Polaris Capital", package: "Quote-to-Cash Agent", title: "Custom audit trail export (CSV)", status: "new", priority: "med", submitted: "Apr 23", owner: "—" },
  { id: "cr4", client: "Atlas Freight", package: "AR Automation", title: "Tighten payment match threshold", status: "shipped", priority: "high", submitted: "Apr 18", owner: "Daniel R." },
  { id: "cr5", client: "Verdant Eats", package: "CRM Hygiene Sweep", title: "Pause weekly dedupe job", status: "shipped", priority: "low", submitted: "Apr 16", owner: "Sven O." },
];

/* --------------------------- Admins --------------------------- */

export type AdminRole = "owner" | "admin" | "support";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastActive: string;
  invited?: boolean;
}

export const adminUsers: AdminUser[] = [
  { id: "a1", name: "You", email: "you@yourcompany.com", role: "owner", lastActive: "now" },
  { id: "a2", name: "Mira Kapoor", email: "mira@yourcompany.com", role: "admin", lastActive: "12m ago" },
  { id: "a3", name: "Daniel Reyes", email: "daniel@yourcompany.com", role: "admin", lastActive: "1h ago" },
  { id: "a4", name: "Sven Olafsson", email: "sven@yourcompany.com", role: "support", lastActive: "Yesterday" },
  { id: "a5", name: "alex.new@yourcompany.com", email: "alex.new@yourcompany.com", role: "admin", lastActive: "—", invited: true },
];

/* --------------------------- Activity feed --------------------------- */

export interface AdminActivity {
  id: string;
  icon: LucideIcon;
  text: string;
  time: string;
  accent: "primary" | "secondary";
}

export const adminActivity: AdminActivity[] = [
  { id: "ac1", icon: Inbox, text: "New change request from Vortura Labs", time: "12m ago", accent: "secondary" },
  { id: "ac2", icon: CreditCard, text: "Polaris Capital paid INV-2026-041 ($24,000)", time: "1h ago", accent: "primary" },
  { id: "ac3", icon: Users, text: "Lumen Health completed onboarding step 2", time: "3h ago", accent: "secondary" },
  { id: "ac4", icon: Package, text: "AR Automation shipped to Atlas Freight", time: "Yesterday", accent: "primary" },
  { id: "ac5", icon: Wand2, text: "Change request shipped for Northwind & Co", time: "Yesterday", accent: "secondary" },
];
