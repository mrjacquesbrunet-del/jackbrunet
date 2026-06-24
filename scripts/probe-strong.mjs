/**
 * Sonde v3 : cherche un DICTIONNAIRE STRONG EN FRANÇAIS librement réutilisable
 * (dépôts GitHub), via l'API de recherche. Journalise les candidats.
 */
const TOKEN = process.env.GH_TOKEN;
const H = {
  "User-Agent": "jackbrunet-probe",
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function api(url) {
  try {
    const r = await fetch(url, { headers: H });
    return { status: r.status, data: await r.json() };
  } catch (e) {
    return { error: String(e) };
  }
}
async function raw(url) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "jackbrunet-probe" } });
    const t = await r.text();
    return { status: r.status, raw: t.slice(0, 240), len: t.length };
  } catch (e) {
    return { error: String(e) };
  }
}
const head = (t) => console.log("\n==== " + t + " ====");

(async () => {
  head("Recherche de dépôts (repositories)");
  const queries = [
    "strong français bible",
    "dictionnaire strong",
    "strongs french dictionary",
    "concordance strong français",
    "lexique grec hébreu strong français",
  ];
  for (const q of queries) {
    const r = await api(`https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&per_page=6`);
    console.log(`\n# "${q}" (status ${r.status}, total ${r.data?.total_count ?? "?"})`);
    for (const it of r.data?.items ?? []) {
      console.log(`   ★${it.stargazers_count}  ${it.full_name}  | ${it.description || ""}`.slice(0, 160));
    }
  }

  head("Recherche de fichiers (code) — dictionnaires JSON FR");
  const codeQ = [
    "strong français définition extension:json",
    "strongFr language:json",
    "dictionnaire strong filename:strong",
  ];
  for (const q of codeQ) {
    const r = await api(`https://api.github.com/search/code?q=${encodeURIComponent(q)}&per_page=6`);
    console.log(`\n# code "${q}" (status ${r.status}, total ${r.data?.total_count ?? "?"})`);
    for (const it of r.data?.items ?? []) {
      console.log(`   ${it.repository?.full_name}  :: ${it.path}`);
    }
  }

  head("Tests directs de candidats connus (raw)");
  const candidates = [
    "https://raw.githubusercontent.com/bnjbvr/strong-bible/master/strongs-fr.json",
    "https://raw.githubusercontent.com/macarthurjd/strongs/master/strongs-french.json",
    "https://raw.githubusercontent.com/Saukha/Strong-Dictionary/master/strongDictionary.json",
    "https://raw.githubusercontent.com/gpiffault/strong-bible/master/strong.json",
  ];
  for (const u of candidates) {
    const r = await raw(u);
    console.log(`   ${r.status || r.error} len=${r.len ?? 0} | ${u}`);
    if (r.status === 200) console.log("       ", (r.raw || "").replace(/\s+/g, " "));
  }
})();
