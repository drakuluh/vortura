// One-shot test: posts a TEMPLATED message to each configured Slack channel
// via the connector. Returns per-channel results so we can verify routing
// and visually inspect the new Block Kit templates.
import {
  newClientTemplate,
  newMessageTemplate,
  changeRequestTemplate,
  overdueInvoiceTemplate,
  newPurchaseTemplate,
} from "../_shared/slack-templates.ts";
import { adminUrl } from "../_shared/site.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SLACK_API_KEY = Deno.env.get("SLACK_API_KEY");
  if (!LOVABLE_API_KEY || !SLACK_API_KEY) {
    return new Response(JSON.stringify({ error: "Missing Slack/Lovable keys" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const samples = [
    {
      category: "clients", channel: "#sales",
      tpl: newClientTemplate({
        name: "Northwind Studios",
        client_id: "demo-client-id",
        plan: "Growth",
        contact_name: "Jamie Chen",
        email: "jamie@northwind.example",
        view_url: adminUrl("/admin/clients", { id: "demo-client-id" }),
      }),
    },
    {
      category: "messages", channel: "#client-chat",
      tpl: newMessageTemplate({
        client_name: "Acme Robotics",
        client_id: "demo-client-id",
        thread_subject: "Onboarding questions",
        body: "Hey team — quick question about the lead enrichment workflow. Can it pull from our internal CRM via webhook?",
        view_url: adminUrl("/admin/messages", { thread: "demo-thread-id" }),
      }),
    },
    {
      category: "change_requests", channel: "#change-requests",
      tpl: changeRequestTemplate({
        title: "Add Spanish to chatbot",
        priority: "med",
        client_name: "Northwind Studios",
        client_id: "demo-client-id",
        description: "We're expanding to LATAM next quarter — please add Spanish (es-MX) to the chatbot's supported languages.",
        view_url: adminUrl("/admin/change-requests", { id: "demo-cr-id" }),
      }),
    },
    {
      category: "invoices", channel: "#billing",
      tpl: overdueInvoiceTemplate({
        number: "INV-00042",
        client_name: "Acme Robotics",
        client_id: "demo-client-id",
        amount_cents: 249900,
        currency: "usd",
        due_at: "2026-04-15",
        hosted_url: "https://invoice.stripe.com/example",
        view_url: adminUrl("/admin/invoices", { id: "demo-invoice-id" }),
      }),
    },
    {
      category: "payments", channel: "#revenue",
      tpl: newPurchaseTemplate({
        product: "Voice AI Agent — One-time setup",
        customer: "Northwind Studios",
        client_id: "demo-client-id",
        email: "jamie@northwind.example",
        amount_cents: 499900,
        currency: "usd",
        view_url: adminUrl("/admin/clients", { id: "demo-client-id" }),
      }),
    },
    {
      category: "default", channel: "#general",
      tpl: changeRequestTemplate({
        title: "Default-channel template preview",
        priority: "low",
        client_name: "Vortura Internal",
        client_id: "demo-client-id",
        description: "This is what notifications without a category-specific channel look like.",
        view_url: adminUrl("/admin/change-requests", { id: "demo-default-id" }),
      }),
    },
  ];

  const results: Array<{ category: string; channel: string; ok: boolean; error?: string; posted_to?: string }> = [];
  for (const c of samples) {
    try {
      const r = await fetch("https://connector-gateway.lovable.dev/slack/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": SLACK_API_KEY,
        },
        body: JSON.stringify({
          channel: c.channel,
          text: c.tpl.text,
          blocks: c.tpl.blocks,
          username: "Vortura Notifier",
          icon_url: "https://sckvyofhssgjlsefjoik.supabase.co/storage/v1/object/public/public-assets/vortura-icon.jpg",
        }),
      });
      const data = await r.json();
      results.push({
        category: c.category,
        channel: c.channel,
        ok: !!data.ok,
        error: data.ok ? undefined : data.error,
        posted_to: data.channel,
      });
    } catch (e) {
      results.push({ category: c.category, channel: c.channel, ok: false, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});