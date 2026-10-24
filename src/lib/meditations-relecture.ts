"use client";

import { useEffect, useMemo, useState } from "react";
import { getDevotions } from "@/lib/content";
import { fetchPublishedDevotions } from "@/lib/devotions";
import { useContenu } from "@/lib/contenu-i18n";
import type { Devotion } from "@/lib/types";
import type { Snippet } from "@/lib/toolkit";

function normPunch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Les méditations, comme dans « Mon temps avec Jésus » : celles publiées
 * (Supabase) sinon celles du build, traduites dans la langue de l'app.
 * Sert à RELIRE une méditation enregistrée (carnet, favoris).
 */
export function useMeditations(): Devotion[] {
  const [remote, setRemote] = useState<Devotion[] | null>(null);
  useEffect(() => {
    let vivant = true;
    fetchPublishedDevotions()
      .then((d) => {
        if (vivant && d && d.length) setRemote(d);
      })
      .catch(() => undefined);
    return () => {
      vivant = false;
    };
  }, []);
  const devTr = useContenu<{ items: Devotion[] }>("devotions");
  return useMemo(() => {
    const integres = getDevotions();
    const base = remote ?? integres;
    if (!devTr?.items) return base;
    const trad = new Map<string, Devotion>();
    integres.forEach((d, k) => {
      const t = devTr.items[k];
      if (t && d.punchline) trad.set(normPunch(d.punchline), t);
    });
    return base.map((d) => {
      const t = trad.get(normPunch(d.punchline || ""));
      return t ? { ...d, ...t, questions: t.questions?.length ? t.questions : d.questions } : d;
    });
  }, [remote, devTr]);
}

/**
 * Méditation d'où vient un enregistrement (bouton « Mettre en favori » qui
 * garde le verset, ou un paragraphe enregistré). On la retrouve par sa
 * référence et son texte (fiable même si la liste a bougé ou sur un autre
 * appareil), puis par sa position dans la liste en dernier recours.
 */
export function meditationDe(snip: Snippet, liste: Devotion[]): Devotion | null {
  if (snip.kind !== "méditation" || !snip.id.startsWith("dev:")) return null;
  const memeRef = liste.filter((d) => snip.reference && d.verseReference === snip.reference);
  const parTexte = (d: Devotion) => d.verseText === snip.text || d.meditation.includes(snip.text);
  const trouvee = memeRef.find(parTexte) ?? memeRef[0] ?? liste.find(parTexte);
  if (trouvee) return trouvee;
  const idx = Number(snip.id.split(":")[1]);
  return Number.isInteger(idx) ? liste[idx] ?? null : null;
}
