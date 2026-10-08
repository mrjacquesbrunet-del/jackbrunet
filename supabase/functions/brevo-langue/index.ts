// ============================================================
//  Edge Function : classe chaque contact Brevo par LANGUE.
//
//  À chaque inscription (newsletter, e-book, compte de l'app…), l'app
//  envoie l'email + la langue de l'app (fr / en / pt). La fonction :
//   - pose l'attribut LANGUE (FR, EN ou PT) sur le contact Brevo ;
//   - s'il s'agit d'une inscription NEWSLETTER (accord donné), l'ajoute
//     à la liste de sa langue : « RHEMA · Français », « RHEMA · English »
//     ou « RHEMA · Português » (créées automatiquement si besoin).
//
//  Secret Supabase requis : BREVO_API_KEY (jamais dans l'app).
//  Déploiement : nom « brevo-langue », « Verify JWT » DÉCOCHÉ.
// ============================================================

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (d: unknown, status = 200) =>
  new Response(JSON.stringify(d), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const LISTES: Record<string, string> = {
  fr: "RHEMA · Français",
  en: "RHEMA · English",
  pt: "RHEMA · Português",
};

const CLE = Deno.env.get("BREVO_API_KEY") ?? "";

function brevo(chemin: string, init: RequestInit = {}) {
  return fetch(`https://api.brevo.com/v3${chemin}`, {
    ...init,
    headers: { "api-key": CLE, "Content-Type": "application/json", Accept: "application/json" },
  });
}

// Gardés en mémoire tant que la fonction reste chaude.
let attributPret = false;
const idsListes: Record<string, number> = {};

/** Crée l'attribut LANGUE s'il n'existe pas encore (sinon Brevo répond une erreur, ignorée). */
async function assurerAttribut() {
  if (attributPret) return;
  await brevo("/contacts/attributes/normal/LANGUE", { method: "POST", body: JSON.stringify({ type: "text" }) }).catch(
    () => undefined,
  );
  attributPret = true;
}

/** Id de la liste de la langue (cherchée par son nom, créée si absente). */
async function idListe(langue: string): Promise<number> {
  if (idsListes[langue]) return idsListes[langue];
  const nom = LISTES[langue];
  for (let offset = 0; offset < 1000; offset += 50) {
    const r = await brevo(`/contacts/lists?limit=50&offset=${offset}`);
    const d = await r.json().catch(() => ({}));
    const listes = (d?.lists ?? []) as { id: number; name: string }[];
    const trouvee = listes.find((l) => l.name === nom);
    if (trouvee) return (idsListes[langue] = trouvee.id);
    if (listes.length < 50) break;
  }
  // Pas trouvée : on la crée dans le premier dossier (ou un dossier « RHEMA »).
  const f = await brevo("/contacts/folders?limit=10&offset=0");
  const fd = await f.json().catch(() => ({}));
  let dossier = (fd?.folders?.[0]?.id as number | undefined) ?? 0;
  if (!dossier) {
    const nf = await brevo("/contacts/folders", { method: "POST", body: JSON.stringify({ name: "RHEMA" }) });
    dossier = ((await nf.json().catch(() => ({})))?.id as number) ?? 0;
  }
  const c = await brevo("/contacts/lists", { method: "POST", body: JSON.stringify({ name: nom, folderId: dossier }) });
  const cd = await c.json().catch(() => ({}));
  if (!c.ok || !cd?.id) throw new Error(`liste ${nom} : ${cd?.message ?? c.status}`);
  return (idsListes[langue] = cd.id as number);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return json({ ok: Boolean(CLE) });
  if (!CLE) return json({ erreur: "BREVO_API_KEY manquant" }, 500);

  let corps: { email?: unknown; langue?: unknown; prenom?: unknown; newsletter?: unknown } = {};
  try {
    corps = JSON.parse(await req.text());
  } catch {
    return json({ erreur: "requête invalide" }, 400);
  }
  const email = String(corps.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return json({ erreur: "email invalide" }, 400);
  const langue = corps.langue === "en" || corps.langue === "pt" ? corps.langue : "fr";
  const prenom = String(corps.prenom ?? "").trim().slice(0, 60);

  try {
    await assurerAttribut();
    const attributs: Record<string, string> = { LANGUE: langue.toUpperCase() };
    if (prenom) attributs.PRENOM = prenom;
    const contact: Record<string, unknown> = { email, attributes: attributs, updateEnabled: true };
    if (corps.newsletter === true) contact.listIds = [await idListe(langue)];
    let r = await brevo("/contacts", { method: "POST", body: JSON.stringify(contact) });
    if (!r.ok && attributs.PRENOM) {
      // Compte Brevo sans attribut PRENOM : on réessaie sans le prénom.
      delete attributs.PRENOM;
      r = await brevo("/contacts", { method: "POST", body: JSON.stringify(contact) });
    }
    if (!r.ok && r.status !== 204) {
      const d = await r.json().catch(() => ({}));
      return json({ erreur: d?.message ?? `Brevo ${r.status}` }, 502);
    }
    return json({ ok: true, langue });
  } catch (e) {
    return json({ erreur: (e as Error).message }, 502);
  }
});
