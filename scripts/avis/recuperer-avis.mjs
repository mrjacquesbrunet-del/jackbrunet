/**
 * Récupère les avis publics de l'app sur l'App Store (flux RSS d'Apple) et
 * Google Play (google-play-scraper), pour choisir ceux affichés dans
 * l'accueil de l'app. Écrit content/avis-stores.json.
 */
import fs from "node:fs";

const APPLE_ID = "6784931618";
const PLAY_ID = "com.jackbrunet.app";
const PAYS = ["fr", "be", "ch", "ca", "us", "br", "pt", "mg", "ci", "sn", "cm", "re", "gb"];

const avis = [];
for (const pays of PAYS) {
  for (let page = 1; page <= 10; page++) {
    const r = await fetch(`https://itunes.apple.com/${pays}/rss/customerreviews/page=${page}/id=${APPLE_ID}/sortby=mostrecent/json`).catch(() => null);
    if (!r || !r.ok) break;
    const j = await r.json().catch(() => null);
    const e = j?.feed?.entry;
    const liste = Array.isArray(e) ? e : e ? [e] : [];
    const vrais = liste.filter((x) => x["im:rating"]);
    if (!vrais.length) break;
    for (const x of vrais)
      avis.push({
        source: "App Store",
        pays,
        note: Number(x["im:rating"].label),
        titre: x.title?.label ?? "",
        texte: x.content?.label ?? "",
        auteur: x.author?.name?.label ?? "",
        date: x.updated?.label ?? "",
      });
  }
}
console.log("App Store :", avis.length);

try {
  const gplay = (await import("google-play-scraper")).default;
  for (const [lang, country] of [["fr", "fr"], ["en", "us"], ["pt", "br"]]) {
    const r = await gplay.reviews({ appId: PLAY_ID, lang, country, sort: gplay.sort.HELPFULNESS, num: 300 });
    for (const x of r.data ?? r)
      avis.push({ source: "Google Play", pays: country, note: x.score, titre: x.title ?? "", texte: x.text ?? "", auteur: x.userName ?? "", date: x.date ?? "" });
  }
} catch (e) {
  console.log("Google Play :", String(e).slice(0, 200));
}

const vus = new Set();
const uniques = avis.filter((a) => {
  const k = `${a.source}|${a.auteur}|${a.texte.slice(0, 60)}`;
  if (vus.has(k)) return false;
  vus.add(k);
  return true;
});
fs.writeFileSync("content/avis-stores.json", JSON.stringify(uniques, null, 1));
console.log("Total :", uniques.length, "· 5 étoiles :", uniques.filter((a) => a.note === 5).length);
