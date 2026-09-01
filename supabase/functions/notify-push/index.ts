// ============================================================
//  Edge Function : envoie une notification PUSH (OneSignal) à la
//  bonne personne dès qu'une ligne est ajoutée dans
//  public.notifications (message, commentaire, réaction, etc.).
//
//  Déclenchée par un « Database Webhook » sur INSERT dans
//  public.notifications. Cible l'utilisateur via son external_id
//  OneSignal (= son id Supabase), défini dans l'app par
//  linkOneSignalUser().
//
//  La clé REST OneSignal est un secret Supabase
//  (ONESIGNAL_REST_API_KEY) — jamais dans l'app.
//
//  Déploiement : voir supabase/EMAIL-ALERTS.md (section Push).
// ============================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// App ID OneSignal (public, déjà présent dans l'app).
const ONESIGNAL_APP_ID = "27d280f7-9f55-4c22-9798-2566a6f24ab3";

function messageFor(type: string, who: string, body: string): { title: string; text: string } {
  switch (type) {
    case "message":        return { title: "Nouveau message", text: `${who} t'a envoyé un message` };
    case "reply":          return { title: "Nouvelle réponse", text: `${who} a répondu à ton commentaire` };
    case "group_comment":  return { title: "Nouveau commentaire", text: `${who} a commenté ta publication` };
    case "group_reaction": return { title: "Nouvelle réaction", text: `${who} a réagi à ta publication` };
    case "comment":        return { title: "Nouveau commentaire", text: `${who} t'a encouragé(e)` };
    case "group_post":     return { title: body ? `Groupe « ${body} »` : "Ton groupe", text: `${who} a publié dans le groupe` };
    case "group_message":  return { title: body ? `Groupe « ${body} »` : "Ton groupe", text: `${who} a écrit dans la discussion` };
    case "group_join":     return { title: body ? `Groupe « ${body} »` : "Ton groupe", text: `${who} a rejoint le groupe` };
    case "pray":           return { title: "Prière", text: `${who} prie pour toi en ce moment` };
    case "pray_digest":    return { title: "Prière", text: `${body} personnes ont prié pour toi aujourd'hui` };
    case "follow_up":      return { title: "Ton sujet de prière", text: "Comment évolue ton sujet ? Viens donner des nouvelles." };
    case "heart":          return { title: "J'aime", text: `${who} a aimé ton sujet` };
    case "follow":         return { title: "Nouvel abonné", text: `${who} s'est abonné(e) à toi` };
    case "mention":        return { title: "Mention", text: `${who} t'a mentionné(e)` };
    case "admin":          return { title: "Pasteur Jack", text: body || "Nouveau message" };
    case "challenge":      return { title: "Défi en direct !", text: body || `${who} te défie en direct !` };
    case "friend_score":   return { title: "Tes amis jouent !", text: body || `${who} a joué au Défi du jour !` };
    default:               return { title: "Notification", text: body || "Tu as une nouvelle notification" };
  }
}

// Famille d'un type de notif (miroir de src/lib/notif-prefs.ts) — sert à
// respecter les préférences par type (profiles.notif_prefs).
function groupForType(type: string): string {
  if (type === "challenge" || type === "friend_score") return "games";
  if (type === "message") return "messages";
  if (type === "pray" || type === "pray_digest" || type === "follow_up") return "prays";
  if (type.startsWith("group_")) return "groups";
  if (type === "follow") return "follows";
  if (type === "admin") return "admin";
  return "comments";
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json().catch(() => null);
    const rec = payload?.record;
    if (!rec || (payload.table && payload.table !== "notifications")) {
      return new Response("ignored", { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Préférences du DESTINATAIRE : si la famille est désactivée, pas de push
    // (la cloche in-app, elle, reste alimentée par la table notifications).
    const { data: dest } = await supabase
      .from("profiles").select("notif_prefs").eq("id", rec.user_id).maybeSingle();
    const prefs = (dest?.notif_prefs ?? {}) as Record<string, boolean>;
    if (prefs[groupForType(String(rec.type))] === false) {
      return new Response("push désactivé par l'utilisateur", { status: 200 });
    }

    // Pseudo de l'acteur (celui qui a déclenché la notif).
    let who = "Quelqu'un";
    if (rec.actor_id) {
      const { data: prof } = await supabase
        .from("profiles").select("pseudo").eq("id", rec.actor_id).maybeSingle();
      if (prof?.pseudo) who = prof.pseudo as string;
    }

    const { title, text } = messageFor(String(rec.type), who, String(rec.body ?? ""));

    // Destination du clic (miroir de notifHref côté app) : on ouvre
    // directement le bon contenu au lieu de l'accueil.
    //  - lien explicite (priorité) ;
    //  - notif liée à un sujet de prière → /communaute?prayer=<id>
    //    (la carte s'ouvre sur les commentaires) ;
    //  - message privé → /messages ;
    //  - sinon le dévotionnel.
    let route = "/devotionnel/";
    if (typeof rec.link === "string" && rec.link.startsWith("/")) {
      route = rec.link;
    } else if (rec.prayer_id) {
      route = `/communaute/?prayer=${rec.prayer_id}`;
    } else if (rec.type === "message") {
      route = rec.actor_id ? `/messages/?u=${rec.actor_id}` : "/messages/";
    }

    const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
    if (!apiKey) return new Response("ONESIGNAL_REST_API_KEY manquant", { status: 500 });

    const res = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        // Nouvelles clés OneSignal (créées via « Add Key ») → `Key <clé>`.
        // (Les anciennes clés « Legacy » utilisaient `Basic <clé>`.)
        Authorization: `Key ${apiKey}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        target_channel: "push",
        include_aliases: { external_id: [rec.user_id] },
        headings: { en: title, fr: title },
        contents: { en: text, fr: text },
        data: { route },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(`Erreur OneSignal: ${t}`, { status: 502 });
    }
    return new Response("push envoyé", { status: 200 });
  } catch (e) {
    return new Response(`Erreur: ${e}`, { status: 500 });
  }
});
