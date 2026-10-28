// ============================================================
//  Edge Function : « Publier partout » du Studio Jack.
//
//  Publie un même message (texte + image ou vidéo) sur les réseaux
//  connectés dans Postiz (Facebook, Instagram, TikTok, YouTube…),
//  tout de suite ou à une date programmée. Réservée à l'admin.
//
//  Actions (POST JSON) :
//    { action: "chaines" }  → réseaux connectés dans Postiz
//    { action: "publier", texte, titre?, chaines: [id], date?, media?: { chemin, type } }
//      media.chemin = fichier déposé par le Studio dans le bucket privé
//      « studio-medias » ; il est transmis à Postiz puis effacé.
//
//  Secrets Supabase : POSTIZ_API_KEY (à ajouter, clé de Postiz →
//  Settings → Public API). SUPABASE_URL, SUPABASE_ANON_KEY et
//  SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.
//  Déploiement : nom « publier-partout », option « Verify JWT » ACTIVÉE.
// ============================================================
import { createClient } from "npm:@supabase/supabase-js@2";

const POSTIZ = "https://api.postiz.com/public/v1";
const BUCKET = "studio-medias";
const MAX_TEXTE = 5000;
const LIEN_MINUTES = 60;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "content-type": "application/json" } });

class Refus extends Error {
  constructor(message: string, readonly status = 400) { super(message); }
}

async function postiz(cle: string, chemin: string, body?: unknown) {
  const r = await fetch(POSTIZ + chemin, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: cle, ...(body === undefined ? {} : { "content-type": "application/json" }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const texte = await r.text();
  if (!r.ok) {
    console.error("Postiz", chemin, r.status, texte.slice(0, 500));
    if (r.status === 401) throw new Refus("La clé Postiz est refusée : vérifie POSTIZ_API_KEY.", 502);
    if (r.status === 429) throw new Refus("Postiz limite le nombre d'envois par heure : réessaie un peu plus tard.", 429);
    throw new Refus(`Postiz a refusé la demande (${r.status}).`, 502);
  }
  return texte ? JSON.parse(texte) : null;
}

type Chaine = { id: string; identifier: string; name: string; picture?: string; disabled?: boolean };

/* Réglages propres à chaque réseau, et ce qu'il exige comme média. */
function reglages(c: Chaine, video: boolean, aMedia: boolean, titre: string) {
  const t = c.identifier;
  if (t.startsWith("instagram")) {
    if (!aMedia) throw new Refus(`${c.name} (Instagram) demande une image ou une vidéo.`);
    return { __type: t, post_type: "post" };
  }
  if (t === "tiktok") {
    if (!aMedia) throw new Refus(`${c.name} (TikTok) demande une vidéo ou une photo.`);
    const commun = { __type: t, content_posting_method: "DIRECT_POST", privacy_level: "PUBLIC_TO_EVERYONE", comment: true,
      brand_content_toggle: false, brand_organic_toggle: false };
    return video ? { ...commun, duet: false, stitch: false } : { ...commun, autoAddMusic: "no", title: titre.slice(0, 90) };
  }
  if (t === "youtube") {
    if (!video) throw new Refus(`${c.name} (YouTube) demande une vidéo.`);
    if (titre.length < 2) throw new Refus("YouTube demande un titre (2 caractères minimum).");
    return { __type: t, title: titre.slice(0, 100), type: "public", selfDeclaredMadeForKids: "no" };
  }
  return { __type: t };
}

async function publier(cle: string, admin: ReturnType<typeof createClient>, b: Record<string, unknown>) {
  const texte = String(b.texte ?? "").trim().slice(0, MAX_TEXTE);
  const titre = String(b.titre ?? "").trim();
  const ids = Array.isArray(b.chaines) ? b.chaines.map(String) : [];
  const media = b.media as { chemin?: string; type?: string } | undefined;
  const chemin = media?.chemin ? String(media.chemin) : "";
  const video = String(media?.type ?? "").startsWith("video/");
  if (!texte && !chemin) throw new Refus("Écris un texte ou ajoute une image ou une vidéo.");
  if (!ids.length) throw new Refus("Choisis au moins un réseau.");
  if (chemin && (chemin.includes("..") || !chemin.startsWith("publier/"))) throw new Refus("Fichier invalide.");

  const date = b.date ? new Date(String(b.date)) : new Date();
  if (Number.isNaN(date.getTime())) throw new Refus("Date invalide.");
  const programme = date.getTime() > Date.now() + 60_000;

  const toutes: Chaine[] = await postiz(cle, "/integrations");
  const choisies = ids.map((id) => toutes.find((c) => c.id === id));
  if (choisies.some((c) => !c || c.disabled)) throw new Refus("Un des réseaux choisis n'est plus connecté dans Postiz.");
  // Vérifie tout avant d'envoyer quoi que ce soit : rien ne part si un réseau ne peut pas recevoir ce message.
  const settings = (choisies as Chaine[]).map((c) => reglages(c, video, !!chemin, titre));

  let image: { id: string; path: string }[] = [];
  try {
    if (chemin) {
      const { data: lien, error } = await admin.storage.from(BUCKET).createSignedUrl(chemin, LIEN_MINUTES * 60);
      if (error || !lien) throw new Refus("Fichier introuvable : dépose-le à nouveau.");
      const m = await postiz(cle, "/upload-from-url", { url: lien.signedUrl });
      image = [{ id: m.id, path: m.path }];
    }
    const r = await postiz(cle, "/posts", {
      type: programme ? "schedule" : "now",
      date: date.toISOString(),
      shortLink: false,
      tags: [],
      posts: (choisies as Chaine[]).map((c, i) => ({ integration: { id: c.id }, value: [{ content: texte, image }], settings: settings[i] })),
    });
    return { ok: true, programme, date: date.toISOString(), reseaux: (choisies as Chaine[]).map((c) => c.identifier), postiz: r };
  } finally {
    if (chemin) await admin.storage.from(BUCKET).remove([chemin]);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const moi = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("authorization") ?? "" } },
    });
    const { data: estAdmin } = await moi.rpc("is_admin");
    if (estAdmin !== true) return json({ error: "Réservé à l'administrateur" }, 403);

    const cle = Deno.env.get("POSTIZ_API_KEY");
    if (!cle) return json({ error: "Postiz n'est pas encore branché : ajoute le secret POSTIZ_API_KEY dans Supabase." }, 503);

    const b = await req.json().catch(() => ({}));
    if (b.action === "chaines") {
      const toutes: Chaine[] = await postiz(cle, "/integrations");
      return json({ chaines: toutes.map(({ id, identifier, name, picture, disabled }) => ({ id, identifier, name, picture, disabled: !!disabled })) });
    }
    if (b.action === "publier") {
      const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      return json(await publier(cle, admin, b));
    }
    return json({ error: "Action inconnue" }, 400);
  } catch (e) {
    if (e instanceof Refus) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: "Publication impossible pour le moment." }, 500);
  }
});
