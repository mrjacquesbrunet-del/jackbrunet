// ============================================================
//  Edge Function : « Voir la traduction » des textes écrits par
//  les membres (sujets de prière, commentaires, messages, bio).
//
//  Traduit avec Claude vers la langue de l'app (fr, en, pt) et
//  garde chaque traduction dans public.traductions : un même texte
//  n'est traduit qu'une fois, quel que soit le nombre de lecteurs.
//  Réservée aux membres connectés (jeton de session vérifié).
//
//  Secrets Supabase : ANTHROPIC_API_KEY (à ajouter), SUPABASE_URL
//  et SUPABASE_SERVICE_ROLE_KEY (fournis automatiquement).
//  Déploiement : nom « traduire », option « Verify JWT » ACTIVÉE.
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";
import Anthropic from "npm:@anthropic-ai/sdk";

const LANGUES: Record<string, string> = { fr: "French", en: "English", pt: "Brazilian Portuguese" };
const MAX = 3000; // caractères

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

async function empreinte(s: string): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(h), (b) => b.toString(16).padStart(2, "0")).join("");
}

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["langue_source", "traduction"],
  properties: {
    langue_source: { type: "string", enum: ["fr", "en", "pt", "autre"] },
    traduction: { type: "string" },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Membres connectés uniquement.
    const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: u } = await supabase.auth.getUser(jwt);
    if (!u?.user) return json({ error: "Connexion requise" }, 401);

    const { texte, langue } = await req.json().catch(() => ({}));
    const cible = String(langue ?? "");
    const t = String(texte ?? "").trim().slice(0, MAX);
    if (!t || !LANGUES[cible]) return json({ error: "Requête invalide" }, 400);

    const cle = await empreinte(`${cible}|${t}`);
    const { data: deja } = await supabase.from("traductions").select("traduction,source").eq("cle", cle).maybeSingle();
    if (deja) return json({ traduction: deja.traduction, source: deja.source });

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
    const r = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      system:
        `You translate short texts written by members of RHEMA, a Christian prayer and Bible app ` +
        `(prayer requests, comments, private messages, profile bios) into ${LANGUES[cible]}. ` +
        `Keep the meaning, warmth and tone, emojis, line breaks and @mentions exactly. ` +
        `Bible references: use the book names usual in ${LANGUES[cible]} Bibles (e.g. Jean 3:16 → John 3:16 → João 3:16). ` +
        `Never add, explain or answer anything: only translate. If the text is already in ${LANGUES[cible]}, return it unchanged.`,
      messages: [{ role: "user", content: t }],
      output_config: { format: { type: "json_schema", schema: SCHEMA } },
    });
    if (r.stop_reason !== "end_turn") return json({ error: "Traduction indisponible" }, 502);
    const brut = r.content.find((b) => b.type === "text");
    const x = brut && brut.type === "text" ? JSON.parse(brut.text) : null;
    if (!x?.traduction) return json({ error: "Traduction indisponible" }, 502);

    await supabase.from("traductions").upsert({ cle, langue: cible, source: x.langue_source, traduction: x.traduction });
    return json({ traduction: x.traduction, source: x.langue_source });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
