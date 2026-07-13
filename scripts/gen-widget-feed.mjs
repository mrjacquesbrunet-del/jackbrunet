// Génère public/widget/feed.json : le verset + la punchline du jour pour ~400
// jours à venir, lus par les widgets d'écran d'accueil (iOS + Android).
// Même sélection déterministe que l'app (index = jour de l'année % nb de dévos).
import fs from "node:fs";
import path from "node:path";

const raw = JSON.parse(fs.readFileSync("content/devotions.json", "utf8"));
const items = raw.items || raw;

function dayOfYear(y, m, d) {
  const start = new Date(y, 0, 0);
  const cur = new Date(y, m, d);
  return Math.floor((cur.getTime() - start.getTime()) / 86_400_000);
}
function ymd(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const now = new Date();
const days = [];
for (let k = 0; k < 400; k++) {
  const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + k);
  const y = dt.getFullYear(), m = dt.getMonth(), d = dt.getDate();
  const it = items[dayOfYear(y, m, d) % items.length];
  days.push({
    date: ymd(y, m, d),
    verseText: it.verseText ?? "",
    verseReference: it.verseReference ?? "",
    punchline: it.punchline ?? "",
  });
}

const dir = "public/widget";
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "feed.json"),
  JSON.stringify({ generatedAt: days[0].date, days }),
);
console.log("widget feed généré:", days.length, "jours, à partir de", days[0].date);
