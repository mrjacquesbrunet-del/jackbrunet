// ============================================================
//  Edge Function : alerte e-mail quand le Pasteur reçoit un
//  message privé (onglet Messages).
//
//  Déclenchée par un « Database Webhook » Supabase sur INSERT
//  dans public.messages. Elle n'envoie un e-mail QUE si le
//  destinataire est l'adresse du Pasteur (ALERT_TO) — les autres
//  membres ne reçoivent rien.
//
//  La clé Brevo N'EST PAS dans le code : elle est lue depuis un
//  secret Supabase (BREVO_API_KEY). SUPABASE_URL et
//  SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement.
//
//  Déploiement : voir supabase/EMAIL-ALERTS.md
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALERT_TO = "contact@jackbrunet.com";
const ALERT_NAME = "Jack Brunet";
// Expéditeur affiché de l'e-mail. DOIT être un expéditeur vérifié dans Brevo.
const FROM_EMAIL = "contact@jackbrunet.com";
const FROM_NAME = "App Jack Brunet";

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]!));
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json().catch(() => null);
    const rec = payload?.record;
    if (!rec || (payload.table && payload.table !== "messages")) {
      return new Response("ignored", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // On n'alerte que le Pasteur : vérifie l'e-mail du destinataire.
    const { data: recipient } = await supabase.auth.admin.getUserById(rec.recipient_id);
    const recipientEmail = recipient?.user?.email?.toLowerCase() ?? "";
    if (recipientEmail !== ALERT_TO.toLowerCase()) {
      return new Response("not the pastor — skip", { status: 200 });
    }

    // Pseudo de l'expéditeur (facultatif).
    const { data: prof } = await supabase
      .from("profiles").select("pseudo").eq("id", rec.sender_id).maybeSingle();
    const senderName = (prof?.pseudo as string) || "Un membre";
    const body = esc(String(rec.body ?? "").slice(0, 800));

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) return new Response("BREVO_API_KEY manquant", { status: 500 });

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: ALERT_TO, name: ALERT_NAME }],
        subject: `Nouveau message de ${senderName}`,
        htmlContent:
          `<p><strong>${esc(senderName)}</strong> t'a envoyé un message dans l'app :</p>` +
          `<blockquote style="border-left:3px solid #CAF000;margin:0;padding:8px 14px;color:#333">${body}</blockquote>` +
          `<p style="color:#888;font-size:13px">Réponds directement dans l'app, onglet Messages.</p>`,
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(`Erreur Brevo: ${t}`, { status: 502 });
    }
    return new Response("envoyé", { status: 200 });
  } catch (e) {
    return new Response(`Erreur: ${e}`, { status: 500 });
  }
});
