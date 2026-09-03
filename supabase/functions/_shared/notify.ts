// Internal helper imported by other edge functions. Sends a notification
// to support_email and slack_webhook configured in workspace_settings.
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export interface NotifyOptions {
  subject: string;
  body: string;
  /**
   * Optional event category — used to look up a per-event Slack channel
   * override from workspace_settings (slack_channel_<category>).
   * Falls back to slack_channel_default, then to the webhook/connector's
   * built-in default channel.
   */
  category?:
    | "clients"
    | "messages"
    | "change_requests"
    | "invoices"
    | "payments";
  /**
   * Optional Slack Block Kit payload. When present, Slack renders the rich
   * blocks instead of the plain text body. `body` / `subject` are still used
   * as the email body and as Slack's notification fallback text.
   */
  blocks?: Array<Record<string, unknown>>;
}

export async function notifyTeam(opts: NotifyOptions): Promise<void> {
  const { data: settings } = await supabase
    .from("workspace_settings")
    .select("support_email, slack_webhook, slack_channel_default, slack_channel_clients, slack_channel_messages, slack_channel_change_requests, slack_channel_invoices, slack_channel_payments")
    .limit(1)
    .maybeSingle();

  // Resolve target channel: per-category override → default → none
  const categoryKey = opts.category ? `slack_channel_${opts.category}` : null;
  const channel: string | null =
    (categoryKey && (settings as any)?.[categoryKey]) ||
    (settings as any)?.slack_channel_default ||
    null;
  const normalizedChannel = channel
    ? (channel.startsWith("#") || channel.startsWith("@") ? channel : `#${channel}`)
    : null;

  const slackKey = Deno.env.get("SLACK_API_KEY");
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");

  // Prefer the Slack connector when available (supports per-channel routing).
  // Fall back to the configured incoming webhook (channel locked to webhook).
  if (slackKey && lovableKey) {
    try {
      const payload: Record<string, unknown> = {
        channel: normalizedChannel ?? "#general",
        text: opts.subject, // notification fallback
        username: "Vortura Notifier",
        icon_url: "https://sckvyofhssgjlsefjoik.supabase.co/storage/v1/object/public/public-assets/vortura-icon.jpg",
      };
      if (opts.blocks?.length) payload.blocks = opts.blocks;
      else payload.text = `*${opts.subject}*\n${opts.body}`;
      await fetch("https://connector-gateway.lovable.dev/slack/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": slackKey,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Slack connector notify failed:", e);
    }
  } else if (settings?.slack_webhook) {
    try {
      const payload: Record<string, unknown> = { text: `*${opts.subject}*\n${opts.body}` };
      if (opts.blocks?.length) payload.blocks = opts.blocks;
      // Webhook channel override only works if the webhook was created with
      // a channel selector; Slack ignores it otherwise (and that's fine).
      if (normalizedChannel) payload.channel = normalizedChannel;
      await fetch(settings.slack_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Slack notify failed:", e);
    }
  }

  // Email via Lovable email gateway (best-effort; falls through if not configured)
  if (settings?.support_email && lovableKey) {
    try {
      await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          to: settings.support_email,
          subject: opts.subject,
          html: `<p>${opts.body.replace(/\n/g, "<br>")}</p>`,
          purpose: "transactional",
        }),
      });
    } catch (e) {
      console.error("Email notify failed (email infra may not be set up):", e);
    }
  }

  console.log(`[notify-team] ${opts.subject}: ${opts.body}`);
}