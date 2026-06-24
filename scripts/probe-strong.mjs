/**
 * Sonde : repère les meilleures sources LIBRES pour un mode « Strong » en
 * français — une Bible Segond taguée Strong (clic sur le mot → numéro) et un
 * dictionnaire Strong (définitions). N'écrit rien : journalise seulement ce
 * qui est disponible, pour décider de la source avant de construire le fetch.
 *
 * Lancé dans GitHub Actions (accès internet), pas dans le sandbox.
 */

async function get(url, { json = true, max = 1500 } = {}) {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "jackbrunet-probe" } });
    const status = r.status;
    const text = await r.text();
    if (json) {
      try {
        return { status, data: JSON.parse(text) };
      } catch {
        return { status, raw: text.slice(0, max), parseError: true };
      }
    }
    return { status, raw: text.slice(0, max) };
  } catch (e) {
    return { error: String(e) };
  }
}

function head(title) {
  console.log("\n========================================");
  console.log("== " + title);
  console.log("========================================");
}

(async () => {
  // 1) bolls.life — liste des traductions, on cherche le français + tags Strong
  head("bolls.life — langues / traductions");
  const langs = await get("https://bolls.life/static/bolls/app/views/languages.json");
  if (langs.data) {
    const fr = langs.data.find(
      (l) => (l.language || "").toLowerCase().includes("franç") ||
             (l.language || "").toLowerCase().includes("french"),
    );
    if (fr) {
      console.log("Traductions françaises bolls :");
      for (const t of fr.translations) {
        console.log(`  ${t.short_name}  | ${t.full_name}`);
      }
    } else {
      console.log("Aucune entrée 'français' trouvée. Langues:", langs.data.map((l) => l.language).join(", "));
    }
  } else {
    console.log("Échec langues:", langs.status, langs.error || langs.raw?.slice(0, 200));
  }

  // 2) bolls.life — un chapitre d'une candidate FR : cherche des balises <S>####</S>
  head("bolls.life — test balises Strong (Jean 3) sur quelques codes FR");
  for (const code of ["LSG", "OST", "MDM", "FMAR", "DBY", "LSGS", "FreLSG"]) {
    const r = await get(`https://bolls.life/get-text/${code}/43/3/`);
    if (r.data && Array.isArray(r.data)) {
      const v16 = r.data.find((v) => v.verse === 16);
      const hasStrong = v16 && /<S>\d+<\/S>/.test(v16.text || "");
      console.log(`  ${code}: ${r.data.length} versets | Strong=${hasStrong ? "OUI" : "non"} | ex: ${(v16?.text || "").slice(0, 90)}`);
    } else {
      console.log(`  ${code}: indisponible (${r.status || r.error})`);
    }
  }

  // 3) bolls.life — dictionnaires disponibles (cherche un Strong FR)
  head("bolls.life — dictionnaires");
  const dicts = await get("https://bolls.life/static/bolls/app/views/dictionaries.json");
  if (dicts.data) {
    for (const d of dicts.data) {
      console.log(`  ${d.short_name || d.slug || "?"} | ${d.full_name || d.name || ""} | ${d.language || ""}`);
    }
  } else {
    console.log("Échec dictionnaires:", dicts.status, dicts.error || dicts.raw?.slice(0, 200));
  }

  // 4) OpenScriptures — dictionnaire Strong (anglais, domaine public, fiable)
  head("OpenScriptures — dictionnaires Strong (anglais, secours fiable)");
  for (const url of [
    "https://raw.githubusercontent.com/openscriptures/strongs/master/greek/strongs-greek-dictionary.json",
    "https://raw.githubusercontent.com/openscriptures/strongs/master/hebrew/strongs-hebrew-dictionary.json",
  ]) {
    const r = await get(url);
    if (r.data) {
      const keys = Object.keys(r.data);
      console.log(`  OK ${url.split("/").pop()} : ${keys.length} entrées | ex ${keys[0]} =`, JSON.stringify(r.data[keys[0]]).slice(0, 160));
    } else {
      console.log(`  Échec ${url} : ${r.status || r.error}`);
    }
  }
})();
