// Block Kit templates for team notifications. Each builder returns the
// payload pieces notifyTeam needs: subject (used for email + plain-text
// fallback header), text (Slack fallback for notifications/old clients),
// and blocks (rich Slack rendering).
//
// Keep these pure & string-only — callers fetch the data, builders format it.

type Block = Record<string, unknown>;

export interface BuiltMessage {
  subject: string;
  text: string;
  blocks: Block[];
}

const DIVIDER: Block = { type: "divider" };

function header(text: string): Block {
  return { type: "header", text: { type: "plain_text", text, emoji: true } };
}

function fieldsGrid(pairs: Array<[string, string]>): Block {
  return {
    type: "section",
    fields: pairs.map(([label, value]) => ({
      type: "mrkdwn",
      text: `*${label}*\n${value || "—"}`,
    })),
  };
}

function context(text: string): Block {
  return {
    type: "context",
    elements: [{ type: "mrkdwn", text: `_${text}_` }],
  };
}

function paragraph(text: string): Block {
  return { type: "section", text: { type: "mrkdwn", text } };
}

function linkButton(label: string, url: string, style?: "primary" | "danger"): Block {
  const btn: Record<string, unknown> = {
    type: "button",
    text: { type: "plain_text", text: label, emoji: true },
    url,
  };
  if (style) btn.style = style;
  return { type: "actions", elements: [btn] };
}

function nowFooter(extra?: string): Block {
  const ts = new Date().toUTCString();
  return context(extra ? `${extra} · ${ts}` : ts);
}

// Small monospaced footer line that surfaces the client's internal UUID
// on every customer-related Slack message. Useful for cross-referencing
// the record in the admin DB.
function clientIdFooter(clientId?: string | null): Block | null {
  if (!clientId) return null;
  return context(`Client ID: \`${clientId}\``);
}

function clip(s: string | null | undefined, max = 240): string {
  if (!s) return "—";
  const trimmed = s.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function money(cents: number, currency = "usd"): string {
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency.toUpperCase()}`;
}

// ---------- Change requests ----------

export function changeRequestTemplate(args: {
  title: string;
  priority: string;
  client_name: string;
  client_id?: string | null;
  description?: string | null;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `✏️ New change request: ${args.title}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.client_name} (${args.priority})`,
    blocks: [
      header("✏️ New change request"),
      fieldsGrid([
        ["Client", args.client_name],
        ["Priority", args.priority.toUpperCase()],
      ]),
      paragraph(`*Title*\n${args.title}`),
      ...(args.description ? [paragraph(`*Details*\n${clip(args.description)}`)] : []),
      ...(args.view_url ? [linkButton("View change request", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

export function changeRequestCommentTemplate(args: {
  client_name: string;
  client_id?: string | null;
  request_title: string;
  body: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `💬 New comment on change request: ${args.request_title}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.client_name}`,
    blocks: [
      header(`💬 New comment from ${args.client_name}`),
      paragraph(`*Change request*\n${args.request_title}`),
      paragraph(`> ${clip(args.body).replace(/\n/g, "\n> ")}`),
      ...(args.view_url ? [linkButton("Open change request", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

// ---------- Clients ----------

export function newClientTemplate(args: {
  name: string;
  client_id?: string | null;
  plan?: string | null;
  contact_name?: string | null;
  email?: string | null;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `🎉 New client: ${args.name}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.plan ?? "—"}`,
    blocks: [
      header("🎉 New client onboarded"),
      fieldsGrid([
        ["Name", args.name],
        ["Plan", args.plan ?? "—"],
        ["Contact", args.contact_name ?? "—"],
        ["Email", args.email ?? "—"],
      ]),
      ...(args.view_url ? [linkButton("View client", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter("Welcome aboard 👋"),
    ],
  };
}

// ---------- Messages / Threads ----------

export function newMessageTemplate(args: {
  client_name: string;
  client_id?: string | null;
  thread_subject: string;
  body: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `💬 New message from ${args.client_name}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject}: ${clip(args.body, 100)}`,
    blocks: [
      header(`💬 New message from ${args.client_name}`),
      paragraph(`*Thread*\n${args.thread_subject}`),
      paragraph(`> ${clip(args.body).replace(/\n/g, "\n> ")}`),
      ...(args.view_url ? [linkButton("Open conversation", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

export function newThreadTemplate(args: {
  client_name: string;
  client_id?: string | null;
  subject: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `🧵 New thread from ${args.client_name}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject}: ${args.subject}`,
    blocks: [
      header(`🧵 New thread from ${args.client_name}`),
      paragraph(`*Subject*\n${args.subject}`),
      ...(args.view_url ? [linkButton("Open conversation", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

// ---------- Invoices ----------

export function overdueInvoiceTemplate(args: {
  number: string;
  client_name: string;
  client_id?: string | null;
  amount_cents: number;
  currency: string;
  due_at: string;
  hosted_url?: string | null;
  view_url?: string | null;
}): BuiltMessage {
  const days = Math.max(0, Math.floor((Date.now() - new Date(args.due_at).getTime()) / 86_400_000));
  const subject = `⚠️ Overdue invoice ${args.number}`;
  const idFooter = clientIdFooter(args.client_id);
  const blocks: Block[] = [
    header(`⚠️ Overdue invoice ${args.number}`),
    fieldsGrid([
      ["Client", args.client_name],
      ["Amount", `\`${money(args.amount_cents, args.currency)}\``],
      ["Due date", args.due_at],
      ["Days overdue", `${days}`],
    ]),
  ];
  const buttonElements: Array<Record<string, unknown>> = [];
  if (args.view_url) {
    buttonElements.push({
      type: "button",
      style: "primary",
      text: { type: "plain_text", text: "View invoice", emoji: true },
      url: args.view_url,
    });
  }
  if (args.hosted_url) {
    buttonElements.push({
      type: "button",
      style: "danger",
      text: { type: "plain_text", text: "Open Stripe invoice", emoji: true },
      url: args.hosted_url,
    });
  }
  if (buttonElements.length) {
    blocks.push({
      type: "actions",
      elements: buttonElements,
    });
  }
  blocks.push(DIVIDER);
  if (idFooter) blocks.push(idFooter);
  blocks.push(nowFooter("Marked overdue"));
  return {
    subject,
    text: `${subject} — ${args.client_name} ${money(args.amount_cents, args.currency)} (${days}d late)`,
    blocks,
  };
}

export function customInvoicePaidTemplate(args: {
  number: string;
  client_name: string;
  client_id?: string | null;
  client_email?: string | null;
  amount_cents: number;
  currency?: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `💸 Invoice paid: ${args.number}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.client_name} ${money(args.amount_cents, args.currency ?? "usd")}`,
    blocks: [
      header("💸 Custom invoice paid"),
      fieldsGrid([
        ["Invoice", args.number],
        ["Client", args.client_name],
        ["Amount", `\`${money(args.amount_cents, args.currency ?? "usd")}\``],
        ["Email", args.client_email ?? "—"],
      ]),
      ...(args.view_url ? [linkButton("View invoice", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter("Paid via Stripe"),
    ],
  };
}

// ---------- Payments ----------

export function newSubscriptionTemplate(args: {
  plan: string;
  customer: string;
  client_id?: string | null;
  email?: string | null;
  status: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `🎉 New subscription: ${args.plan}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.customer}`,
    blocks: [
      header("🎉 New subscription"),
      fieldsGrid([
        ["Plan", args.plan],
        ["Customer", args.customer],
        ["Email", args.email ?? "—"],
        ["Status", args.status],
      ]),
      ...(args.view_url ? [linkButton("View subscription", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter("💰 Recurring revenue secured"),
    ],
  };
}

export function subscriptionCanceledTemplate(args: {
  plan: string;
  customer: string;
  client_id?: string | null;
  email?: string | null;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `❌ Subscription canceled: ${args.plan}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.customer}`,
    blocks: [
      header("❌ Subscription canceled"),
      fieldsGrid([
        ["Plan", args.plan],
        ["Customer", args.customer],
        ["Email", args.email ?? "—"],
      ]),
      paragraph("_Package marked inactive._"),
      ...(args.view_url ? [linkButton("View subscription", args.view_url)] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

export function paymentFailedTemplate(args: {
  plan: string;
  customer: string;
  client_id?: string | null;
  email?: string | null;
  amount_cents: number;
  currency?: string;
  attempt: number;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `⚠️ Payment failed: ${args.customer}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${money(args.amount_cents, args.currency ?? "usd")} (attempt ${args.attempt})`,
    blocks: [
      header("⚠️ Payment failed"),
      fieldsGrid([
        ["Customer", args.customer],
        ["Plan", args.plan],
        ["Amount", `\`${money(args.amount_cents, args.currency ?? "usd")}\``],
        ["Attempt", `${args.attempt}`],
      ]),
      paragraph("_Stripe is automatically retrying and emailing the customer._"),
      ...(args.view_url ? [linkButton("View customer", args.view_url, "danger")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}

export function newPurchaseTemplate(args: {
  product: string;
  customer: string;
  client_id?: string | null;
  email?: string | null;
  amount_cents: number;
  currency?: string;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `💰 New purchase: ${args.product}`;
  const idFooter = clientIdFooter(args.client_id);
  return {
    subject,
    text: `${subject} — ${args.customer} ${money(args.amount_cents, args.currency ?? "usd")}`,
    blocks: [
      header("💰 New purchase"),
      fieldsGrid([
        ["Product", args.product],
        ["Customer", args.customer],
        ["Email", args.email ?? "—"],
        ["Amount", `\`${money(args.amount_cents, args.currency ?? "usd")}\``],
      ]),
      ...(args.view_url ? [linkButton("View purchase", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter("One-time payment"),
    ],
  };
}

// ---------- Package updates ----------

export function packageUpdateTemplate(args: {
  package_name: string;
  client_name: string;
  client_id?: string | null;
  title: string;
  body?: string | null;
  status_change?: string | null;
  progress_change?: number | null;
  attachment_count?: number;
  view_url?: string | null;
}): BuiltMessage {
  const subject = `📦 Package update: ${args.title}`;
  const idFooter = clientIdFooter(args.client_id);
  const meta: Array<[string, string]> = [
    ["Package", args.package_name],
    ["Client", args.client_name],
  ];
  if (args.status_change) meta.push(["Status →", args.status_change.replace("_", " ")]);
  if (args.progress_change != null) meta.push(["Progress →", `${args.progress_change}%`]);
  if (args.attachment_count && args.attachment_count > 0) {
    meta.push(["Attachments", `${args.attachment_count}`]);
  }
  return {
    subject,
    text: `${subject} — ${args.client_name} / ${args.package_name}`,
    blocks: [
      header(`📦 ${args.title}`),
      fieldsGrid(meta),
      ...(args.body ? [paragraph(`> ${clip(args.body).replace(/\n/g, "\n> ")}`)] : []),
      ...(args.view_url ? [linkButton("View package", args.view_url, "primary")] : []),
      DIVIDER,
      ...(idFooter ? [idFooter] : []),
      nowFooter(),
    ],
  };
}
