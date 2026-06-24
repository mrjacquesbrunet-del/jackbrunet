/**
 * Sonde v2 : confirme si une Segond française est taguée Strong, repère le
 * format des balises, et teste des sources de dictionnaire Strong (FR puis EN).
 * Lancé dans GitHub Actions (accès internet).
 */

async function get(url, { json = false, max = 600 } = {}) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "jackbrunet-probe" } });
    const text = await r.text();
    if (json) {
      try { return { status: r.status, data: JSON.parse(text) }; }
      catch { return { status: r.status, raw: text.slice(0, max), parseError: true }; }
    }
    return { status: r.status, raw: text.slice(0, max) };
  } catch (e) { return { error: String(e) }; }
}
const head = (t) => console.log("\n==== " + t + " ====");

(async () => {
  // 1) Texte brut de Jean 3 pour les candidates FR + KJV (réf. format <S>)
  head("get-text brut — cherche balises Strong");
  for (const code of ["FRLSG", "FRDBY", "NBS", "KJV", "YLT", "TR", "SBLG"]) {
    const r = await get(`https://bolls.life/get-text/${code}/43/3/`, { json: true });
    if (Array.isArray(r.data)) {
      const v16 = r.data.find((v) => v.verse === 16);
      console.log(`\n[${code}] ${r.data.length} versets — Jean 3:16 :`);
      console.log("   ", (v16?.text || "(vide)").slice(0, 300));
    } else {
      console.log(`\n[${code}] indispo status=${r.status} ${r.error || ""} ${(r.raw||"").slice(0,80)}`);
    }
  }

  // 2) Toutes les traductions dont le nom évoque Strong / interlinéaire
  head("traductions bolls évoquant Strong");
  const langs = await get("https://bolls.life/static/bolls/app/views/languages.json", { json: true });
  if (Array.isArray(langs.data)) {
    for (const l of langs.data) {
      for (const t of l.translations || []) {
        const s = `${t.short_name} ${t.full_name}`.toLowerCase();
        if (s.includes("strong") || s.includes("interlin") || t.short_name === "WLC" || t.short_name === "TR")
          console.log(`   [${l.language}] ${t.short_name} | ${t.full_name}`);
      }
    }
  }

  // 3) Dictionnaire Strong — teste plusieurs sources (FR d'abord)
  head("dictionnaires Strong — tests d'URL");
  const urls = [
    // OpenScriptures (variantes de chemin)
    "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.js",
    "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/StrongHebrewG.xml",
    // Mirrors JSON répandus
    "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/README.md",
    // Candidats FR
    "https://raw.githubusercontent.com/bvdbos/bible-strongs/master/strongs-greek.json",
    "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.json",
    "https://raw.githubusercontent.com/king-things/strongs-greek/master/strongs-greek-dictionary.json",
  ];
  for (const u of urls) {
    const r = await get(u);
    console.log(`   ${r.status || r.error} | len=${(r.raw||"").length} | ${u}`);
    if (r.status === 200) console.log("       début:", (r.raw||"").replace(/\s+/g," ").slice(0, 160));
  }

  // 4) bolls — définition d'un Strong via l'API dictionary (format de réponse)
  head("bolls dictionary-definition (Thayer G26)");
  for (const path of [
    "https://bolls.life/dictionary-definition/BdbThayer/G26/",
    "https://bolls.life/get-dictionary/BdbThayer/G26/",
  ]) {
    const r = await get(path);
    console.log(`   ${r.status || r.error} | ${path}`);
    if (r.status === 200) console.log("       ", (r.raw||"").replace(/\s+/g," ").slice(0, 220));
  }
})();
