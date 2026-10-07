// ============================================================
//  Edge Function : traduction À LA DEMANDE des commentaires mot à
//  mot (grec/hébreu) et du lexique, en anglais ou en portugais.
//
//  L'app envoie seulement une RÉFÉRENCE (verset ou code Strong) :
//  le texte français est lu sur le site lui-même, donc seul notre
//  propre contenu peut être traduit. Chaque traduction est gardée
//  dans public.traductions : un verset ou un mot n'est traduit
//  qu'une fois, pour tout le monde.
//
//  Modèle : OpenAI gpt-4o-mini (très économique).
//  Secrets Supabase : OPENAI_API_KEY (à ajouter), SUPABASE_URL et
//  SUPABASE_SERVICE_ROLE_KEY (fournis), SITE_URL (facultatif,
//  défaut https://jackbrunet.com).
//  Déploiement : nom « traduire-etude », option « Verify JWT » activée
//  (l'app appelle avec la clé publique, connexion non requise).
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const LANGUES: Record<string, string> = { en: "American English", pt: "Brazilian Portuguese" };
const EXEMPLE: Record<string, string> = { en: "Jean 3:16 → John 3:16", pt: "Jean 3:16 → João 3:16" };
const SITE = (Deno.env.get("SITE_URL") || "https://jackbrunet.com").replace(/\/$/, "");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

/** Champs laissés tels quels (mots grecs/hébreux, translittérations, codes). */
const INTACTS = new Set(["mot", "translit", "pron", "nature", "strong", "trad", "de", "derives", "nb"]);

/** Même structure, mêmes clés, mêmes longueurs de listes ? */
function memeForme(a: unknown, b: unknown): boolean {
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => memeForme(x, b[i]));
  if (a && typeof a === "object") {
    if (!b || typeof b !== "object" || Array.isArray(b)) return false;
    return Object.keys(a).every((k) => k in (b as object) && memeForme((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return typeof a === typeof b;
}

/** Recopie les champs intacts de l'original dans la traduction. */
function restaurer(fr: unknown, tr: unknown): unknown {
  if (Array.isArray(fr) && Array.isArray(tr)) return fr.map((x, i) => restaurer(x, tr[i]));
  if (fr && typeof fr === "object" && tr && typeof tr === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(fr)) o[k] = INTACTS.has(k) ? v : restaurer(v, (tr as Record<string, unknown>)[k]);
    return o;
  }
  return tr ?? fr;
}

async function lireFr(type: string, ref: string): Promise<unknown | null> {
  if (type === "commentaire") {
    const [livre, chap, verset] = ref.split("/");
    const r = await fetch(`${SITE}/commentary/${livre}/${chap}.json`);
    if (!r.ok) return null;
    return ((await r.json()) as Record<string, unknown>)[verset] ?? null;
  }
  const r = await fetch(`${SITE}/lexique/mots/${ref.slice(0, 3)}.json`);
  if (!r.ok) return null;
  return ((await r.json()) as Record<string, unknown>)[ref] ?? null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const { type, ref, langue } = await req.json().catch(() => ({}));
    const cible = String(langue ?? "");
    const r = String(ref ?? "");
    const valide =
      LANGUES[cible] &&
      ((type === "commentaire" && /^\d{1,2}\/\d{1,3}\/\d{1,3}$/.test(r)) ||
        (type === "lexique" && /^[GH]\d{4}[A-Za-z]?$/.test(r)));
    if (!valide) return json({ error: "Requête invalide" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const cle = `etude:${type}:${r}:${cible}`;
    const { data: deja } = await supabase.from("traductions").select("traduction").eq("cle", cle).maybeSingle();
    if (deja) return json({ traduction: JSON.parse(deja.traduction) });

    const fr = await lireFr(type, r);
    if (!fr) return json({ error: "Introuvable" }, 404);

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              `You translate French Bible-study content (word studies of Greek and Hebrew words, lexicon entries, ` +
              `historical and cultural commentary) for RHEMA, an evangelical Christian Bible app, into ${LANGUES[cible]}. ` +
              `Return the SAME JSON object: same keys, same structure, same number of items in every list. ` +
              `Translate every French text value faithfully and naturally, with an accurate theological vocabulary. ` +
              `Never translate or change the Greek or Hebrew words, transliterations, Strong codes or the values of the keys ` +
              `mot, translit, pron, nature, strong, trad, de, derives, nb. ` +
              `Bible references: book names as usual in ${LANGUES[cible]} Bibles, chapter and verse numbers unchanged (${EXEMPLE[cible]}). ` +
              `Do not add, explain or omit anything.`,
          },
          { role: "user", content: JSON.stringify(fr) },
        ],
      }),
    });
    if (!res.ok) return json({ error: "Traduction indisponible" }, 502);
    const sortie = await res.json();
    let tr: unknown = null;
    try {
      tr = JSON.parse(sortie.choices?.[0]?.message?.content ?? "null");
    } catch {
      tr = null;
    }
    if (!tr || !memeForme(fr, tr)) return json({ error: "Traduction incomplète" }, 502);
    const traduction = restaurer(fr, tr);

    await supabase
      .from("traductions")
      .upsert({ cle, langue: cible, source: `${type}:${r}`, traduction: JSON.stringify(traduction) });
    return json({ traduction });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
