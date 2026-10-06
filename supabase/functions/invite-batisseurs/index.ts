// ============================================================
//  Edge Function : envoie par e-mail l'invitation au Zoom des
//  Bâtisseurs (membres qui soutiennent l'app).
//
//  Appelée depuis l'espace admin de l'app, juste après la
//  fonction SQL inviter_batisseurs() (qui crée l'invitation et
//  les notifications). Seul l'admin peut la déclencher : on
//  vérifie l'e-mail du compte qui appelle (jeton de session).
//
//  La clé Brevo N'EST PAS dans le code : secret Supabase
//  BREVO_API_KEY (déjà utilisé par notify-dm). SUPABASE_URL et
//  SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement.
//
//  Déploiement : comme notify-dm (voir supabase/EMAIL-ALERTS.md),
//  nom « invite-batisseurs », option « Verify JWT » ACTIVÉE.
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMINS = ["mr.jacquesbrunet@gmail.com", "contact@jackbrunet.com"];
// Expéditeur affiché. DOIT être un expéditeur vérifié dans Brevo.
const FROM_EMAIL = "contact@jackbrunet.com";
const FROM_NAME = "Pasteur Jack Brunet";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function esc(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });
}

function dateFr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const jour = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Paris" });
  const heure = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).replace(":", " h ");
  return `${jour} à ${heure} (heure de Paris)`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // 1) Seul l'admin peut envoyer.
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: caller } = await supabase.auth.getUser(jwt);
    const callerEmail = caller?.user?.email?.toLowerCase() ?? "";
    if (!ADMINS.includes(callerEmail)) return json({ error: "Réservé à l'administrateur" }, 403);

    const { invitation_id } = await req.json().catch(() => ({}));
    const { data: inv } = await supabase
      .from("zoom_invitations")
      .select("id,date_zoom,lien,message")
      .eq("id", invitation_id)
      .maybeSingle();
    if (!inv) return json({ error: "Invitation introuvable" }, 404);

    // 2) Les Bâtisseurs et leur e-mail.
    const { data: profs } = await supabase
      .from("profiles")
      .select("id,pseudo")
      .gt("batisseur_jusqu_au", new Date().toISOString());
    const dest: { email: string; name: string }[] = [];
    for (const p of profs ?? []) {
      const { data: u } = await supabase.auth.admin.getUserById(p.id as string);
      const email = u?.user?.email;
      if (email) dest.push({ email, name: (p.pseudo as string) || "Bâtisseur" });
    }
    if (!dest.length) return json({ envoyes: 0 });

    const apiKey = Deno.env.get("BREVO_API_KEY");
    if (!apiKey) return json({ error: "BREVO_API_KEY manquant" }, 500);

    // 3) Un e-mail par personne (chacun ne voit que son adresse).
    const quand = dateFr(inv.date_zoom as string | null);
    const lien = String(inv.lien);
    const mot = inv.message ? `<p style="font-size:15px;color:#333">${esc(String(inv.message))}</p>` : "";
    const html =
      `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1C1E13">` +
      `<p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#5C6B00;font-weight:bold">Espace Bâtisseurs</p>` +
      `<h1 style="font-size:24px;margin:4px 0 12px">Ton invitation au Zoom avec Pasteur Jack</h1>` +
      `<p style="font-size:15px">Merci d'être Bâtisseur de RHEMA. Je serai heureux de te retrouver en direct${quand ? ` le <strong>${esc(quand)}</strong>` : ""}.</p>` +
      mot +
      `<p style="margin:24px 0"><a href="${esc(lien)}" style="background:#CAF000;color:#0A0B07;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:14px;display:inline-block">Rejoindre le Zoom</a></p>` +
      `<p style="font-size:13px;color:#777">Ou copie ce lien : ${esc(lien)}</p>` +
      `<p style="font-size:15px">Que Dieu te bénisse,<br>Pasteur Jack Brunet</p></div>`;

    let envoyes = 0;
    for (let i = 0; i < dest.length; i += 500) {
      const lot = dest.slice(i, i + 500);
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          subject: "Ton invitation au Zoom des Bâtisseurs",
          htmlContent: html,
          messageVersions: lot.map((d) => ({ to: [d] })),
        }),
      });
      if (!res.ok) return json({ error: `Brevo : ${await res.text()}`, envoyes }, 502);
      envoyes += lot.length;
    }
    return json({ envoyes });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
