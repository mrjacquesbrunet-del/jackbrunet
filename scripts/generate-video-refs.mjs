/**
 * Relie les vidéos YouTube de Jack aux passages bibliques dont elles parlent.
 *
 * Pour chaque vidéo (content/videos.generated.json + shorts.generated.json +
 * videos.json) pas encore analysée :
 *   1. récupère la TRANSCRIPTION (sous-titres publics, y compris automatiques)
 *      via l'API player de YouTube — aucun compte requis ;
 *   2. y détecte les références bibliques françaises citées à l'oral
 *      (« Jean chapitre 15 », « Actes 2 verset 42 », « 1 Corinthiens 13 »…) ;
 *   3. garde le ou les passages PRINCIPAUX (les plus cités) et les versets
 *      explicitement mentionnés dans ces chapitres.
 *
 * Résultats :
 *   - content/video-refs.json  : cache par vidéo (jamais retraitée) ;
 *   - public/bible/videos.json : index embarqué { "livre-chap": [{id,t,v?}] }
 *     que le lecteur biblique affiche (bouton vidéo à côté du verset).
 *
 * Ne casse jamais le build : sans réseau, l'index est régénéré depuis le
 * cache ; toute erreur sur une vidéo est loggée puis ignorée.
 *
 * Usage : node scripts/generate-video-refs.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CACHE = new URL("../content/video-refs.json", import.meta.url);
const OUT = new URL("../public/bible/videos.json", import.meta.url);

// ————— Livres (mêmes ids 1–66 que le lecteur, variantes orales incluses) —————
// [motif de base, id, préfixe numérique requis (0 = aucun)]
const LIVRES = [
  ["genese", 1], ["exode", 2], ["levitique", 3], ["nombres", 4], ["deuteronome", 5],
  ["josue", 6], ["juges", 7], ["ruth", 8],
  ["samuel", 9, 1], ["rois", 11, 1], ["chroniques", 13, 1],
  ["esdras", 15], ["nehemie", 16], ["esther", 17], ["job", 18],
  ["psaumes?", 19], ["proverbes", 20], ["ecclesiaste", 21],
  ["cantique(?:s| des cantiques)?", 22],
  ["esaie", 23], ["isaie", 23], ["jeremie", 24], ["lamentations", 25], ["ezechiel", 26],
  ["daniel", 27], ["osee", 28], ["joel", 29], ["amos", 30], ["abdias", 31], ["jonas", 32],
  ["michee", 33], ["nahum", 34], ["habacuc", 35], ["sophonie", 36], ["aggee", 37],
  ["zacharie", 38], ["malachie", 39],
  ["matthieu", 40], ["marc", 41], ["luc", 42], ["jean", 43], ["actes", 44],
  ["romains", 45], ["corinthiens", 46, 1], ["galates", 48],
  ["ephesiens", 49], ["philippiens", 50], ["colossiens", 51],
  ["thessaloniciens", 52, 1], ["timothee", 54, 1],
  ["tite", 56], ["philemon", 57], ["hebreux", 58], ["jacques", 59],
  ["pierre", 60, 1], ["jude", 65], ["apocalypse", 66],
];
// Nombre de chapitres par livre (pour rejeter « Jean 42 »).
const CHAPITRES = [0,50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22];

const PREFIX_NUM = { "1": 0, "premiere": 0, "premier": 0, "2": 1, "deuxieme": 1, "seconde": 1, "3": 2, "troisieme": 2 };

function normalize(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
}

/** Détecte les références dans un texte normalisé → scores par chapitre. */
function extractRefs(text) {
  const scores = new Map(); // "livre-chap" -> { score, versets:Set }
  for (const [motif, id, numbered] of LIVRES) {
    const re = new RegExp(
      `(?:(1|2|3|premiere?|seconde|deuxieme|troisieme)\\s+)?` +
        `(?:epitre\\s+)?(?:de\\s+|d'|aux?\\s+|a\\s+)?(${motif})` +
        `\\s+(?:chapitre\\s+)?(\\d{1,3})` +
        `(?:\\s*(?:,|:|\\.|au verset\\s+|versets?\\s+|v\\.?\\s*)\\s*(\\d{1,3}))?`,
      "g",
    );
    for (const m of text.matchAll(re)) {
      let livre = id;
      const pref = m[1] ? PREFIX_NUM[m[1]] : undefined;
      if (numbered) {
        // Livre numéroté (« 1 Corinthiens ») : sans préfixe on ignore.
        if (pref === undefined) continue;
        livre = id + pref;
      } else if (pref !== undefined && id === 43) {
        // « 1 Jean / 2 Jean / 3 Jean » (épîtres) : ids 62-64.
        livre = 62 + pref;
      }
      const chap = Number(m[3]);
      if (!chap || chap > (CHAPITRES[livre] ?? 0)) continue;
      const key = `${livre}-${chap}`;
      const cur = scores.get(key) ?? { score: 0, versets: new Set() };
      // « chapitre » dit explicitement = signal fort.
      cur.score += /chapitre/.test(m[0]) ? 3 : 1;
      if (m[4]) {
        cur.versets.add(Number(m[4]));
        cur.score += 1;
      }
      scores.set(key, cur);
    }
  }
  return scores;
}

/** Choisit les passages PRINCIPAUX d'une transcription (max 2 chapitres). */
function mainRefs(text) {
  const scores = extractRefs(text);
  const ranked = [...scores.entries()].sort((a, b) => b[1].score - a[1].score);
  const top = ranked.filter(([, s], i) => (i === 0 ? s.score >= 2 : s.score >= 4)).slice(0, 2);
  return top.map(([key, s]) => ({
    key,
    versets: [...s.versets].filter((v) => v >= 1 && v <= 176).sort((a, b) => a - b).slice(0, 6),
  }));
}

// ————— Transcription YouTube : pistes lues dans la page watch elle-même —————
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function fetchTranscript(videoId) {
  const page = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=fr`, {
    headers: {
      "user-agent": UA,
      "accept-language": "fr-FR,fr;q=0.9",
      // Évite l'interstitiel de consentement européen.
      cookie: "CONSENT=YES+cb; SOCS=CAI",
    },
  });
  if (!page.ok) throw new Error(`watch ${page.status}`);
  const html = await page.text();
  const m = html.match(/"captionTracks":(\[.*?\])(?:,"|\])/);
  if (!m) {
    // La page a répondu mais sans aucune piste : absence réelle (ou vidéo
    // indisponible) — signalée comme telle pour être mise en cache.
    if (html.includes("ytInitialPlayerResponse")) throw new Error("aucune piste de sous-titres");
    throw new Error("page watch illisible");
  }
  let tracks;
  try {
    tracks = JSON.parse(m[1]);
  } catch {
    throw new Error("captionTracks illisible");
  }
  const track =
    tracks.find((t) => t.languageCode?.startsWith("fr") && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("fr")) ??
    tracks[0];
  if (!track?.baseUrl) throw new Error("aucune piste de sous-titres");
  const url = `${track.baseUrl.replace(/\\u0026/g, "&")}&fmt=json3`;
  const tr = await fetch(url, { headers: { "user-agent": UA } }).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(`timedtext ${r.status}`)),
  );
  return (tr.events ?? [])
    .map((e) => (e.segs ?? []).map((s) => s.utf8 ?? "").join(""))
    .join(" ");
}

function loadJson(url, fallback) {
  try {
    return JSON.parse(readFileSync(url, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  const videos = [];
  for (const f of ["videos.generated.json", "shorts.generated.json", "videos.json"]) {
    const url = new URL(`../content/${f}`, import.meta.url);
    if (!existsSync(url)) continue;
    for (const it of loadJson(url, { items: [] }).items ?? []) {
      if (it?.id && !videos.some((v) => v.id === it.id)) videos.push({ id: it.id, title: it.title ?? "" });
    }
  }

  const cache = loadJson(CACHE, {});
  // Migration : purge les anciennes entrées « vides » (analyses qui avaient
  // échoué à cause du blocage des sous-titres côté serveurs d'intégration).
  for (const [id, e] of Object.entries(cache)) {
    if (!e.tr && !e.d) delete cache[id];
  }
  let processed = 0;

  const mergeRefs = (entry, refs) => {
    entry.refs ??= [];
    for (const r of refs) {
      const cur = entry.refs.find((x) => x.k === r.key);
      if (cur) cur.v = [...new Set([...(cur.v ?? []), ...r.versets])].sort((a, b) => a - b);
      else entry.refs.push({ k: r.key, v: r.versets });
    }
  };

  // ——— Passe 1 : TITRES + DESCRIPTIONS via l'API officielle (clé existante,
  // jamais bloquée). Filet immédiat quand la référence est écrite.
  const KEY = process.env.YOUTUBE_API_KEY;
  if (KEY) {
    const todo = videos.filter((v) => !cache[v.id]?.d);
    for (let i = 0; i < todo.length; i += 50) {
      const batch = todo.slice(i, i + 50);
      try {
        const r = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.map((v) => v.id).join(",")}&key=${KEY}`,
        ).then((x) => (x.ok ? x.json() : Promise.reject(new Error(`videos.list ${x.status}`))));
        for (const item of r.items ?? []) {
          const refs = mainRefs(normalize(`${item.snippet?.title ?? ""}\n${item.snippet?.description ?? ""}`));
          const e = (cache[item.id] ??= { t: item.snippet?.title ?? "" });
          e.d = 1;
          mergeRefs(e, refs);
          if (refs.length) console.log(`[video-refs] desc ${item.id} → ${refs.map((x) => x.key).join(", ")}`);
          processed++;
        }
      } catch (e) {
        console.log(`[video-refs] descriptions : ${e.message}`);
        break;
      }
    }
  }

  // ——— Passe 2 : TRANSCRIPTIONS (le plus riche). YouTube ne sert pas les
  // sous-titres aux serveurs anonymes : on tente par petites tranches et on
  // ne met JAMAIS un échec en cache — le jour où une voie d'accès passe
  // (OAuth de la chaîne, autre réseau), tout se remplit tout seul.
  const pending = videos.filter((v) => !cache[v.id]?.tr).slice(0, 60);
  for (const v of pending) {
    try {
      const text = normalize(await fetchTranscript(v.id));
      const refs = mainRefs(text);
      const e = (cache[v.id] ??= { t: v.title });
      e.tr = 1;
      mergeRefs(e, refs);
      console.log(`[video-refs] transcription ${v.id} « ${v.title.slice(0, 45)} » → ${refs.map((r) => r.key).join(", ") || "aucun passage sûr"}`);
      processed++;
      await new Promise((r) => setTimeout(r, 800)); // douceur avec YouTube
    } catch (e) {
      console.log(`[video-refs] ${v.id} : ${e.message}`);
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  if (processed) writeFileSync(CACHE, JSON.stringify(cache, null, 1));

  // Index chapitre → vidéos (depuis le cache complet, même sans réseau).
  const index = {};
  for (const [id, entry] of Object.entries(cache)) {
    for (const r of entry.refs ?? []) {
      (index[r.k] ??= []).push({ id, t: entry.t, ...(r.v?.length ? { v: r.v } : {}) });
    }
  }
  writeFileSync(OUT, JSON.stringify(index));
  console.log(
    `[video-refs] ${processed} nouvelle(s) analyse(s) · index : ${Object.keys(index).length} chapitre(s) couvert(s), ${videos.length} vidéo(s) connue(s).`,
  );
}

main().catch((e) => {
  console.error("[video-refs] erreur non bloquante :", e.message);
});
