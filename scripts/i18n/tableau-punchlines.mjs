/**
 * Tableau des punchlines FR / EN / PT pour générer les affiches traduites.
 * Sortie : i18n/punchlines-en-pt.csv (Excel : séparateur « ; », UTF-8).
 * Nom de l'affiche traduite = nom de la carte française + -en / -pt.
 */
import fs from "node:fs";

const fr = JSON.parse(fs.readFileSync("content/devotions.json", "utf8")).items;
const lire = (l) => {
  const f = `public/i18n/contenu/${l}/devotions.json`;
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).items : [];
};
const en = lire("en");
const pt = lire("pt");
const carte = (c, l) => (c ? c.replace(/(\.[a-z0-9]+)$/i, `-${l}$1`) : "");
const cell = (s) => `"${String(s ?? "").replace(/\*/g, "").replace(/"/g, '""')}"`;
const traduit = (t, d) => (t && t !== d ? t : "");

const lignes = [["N°", "Carte française", "Punchline FR", "Punchline EN", "Fichier affiche EN", "Punchline PT", "Fichier affiche PT"]];
fr.forEach((d, i) => {
  lignes.push([
    i + 1,
    d.card ?? "",
    d.punchline,
    traduit(en[i]?.punchline, d.punchline),
    carte(d.card, "en"),
    traduit(pt[i]?.punchline, d.punchline),
    carte(d.card, "pt"),
  ]);
});
fs.mkdirSync("i18n", { recursive: true });
fs.writeFileSync("i18n/punchlines-en-pt.csv", "﻿" + lignes.map((l) => l.map(cell).join(";")).join("\r\n") + "\r\n");
const faits = lignes.slice(1).filter((l) => l[3] && l[5]).length;
console.log(`${fr.length} punchlines, ${faits} traduites en anglais et en portugais → i18n/punchlines-en-pt.csv`);
