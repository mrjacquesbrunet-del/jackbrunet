"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getIndex, getBook } from "@/lib/bible-client";
import { bibleHref } from "@/lib/bible-ref";

/**
 * Le passage biblique d'une étape, ouvert PAR-DESSUS la partie.
 *
 * Le Chemin sert à apprendre : quand on ne sait pas, on doit pouvoir aller
 * relire le texte sans perdre son étape en cours. D'où un panneau, et non un
 * lien qui ferait quitter le jeu (un lien vers le lecteur complet reste
 * proposé en bas pour qui veut lire plus large).
 */

type Passage = {
  titre: string;
  versets: { n: number; texte: string }[];
  /** Les versets cités par la référence — surlignés dans la liste. */
  de: number;
  a: number;
  /** La référence couvre plusieurs chapitres : on n'affiche que le premier. */
  suite: string | null;
};

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Découpe une référence en livre + chapitre + versets. Gère les formes
 * utilisées dans les chapitres du Chemin : « Exode 10 », « Genèse 42-43 »,
 * « Genèse 15:1-6 » et les références à cheval sur deux chapitres comme
 * « Genèse 1:31-2:3 ».
 */
function analyse(reference: string): { livre: string; chap: number; chapFin: number; de: number; a: number } | null {
  const m = reference
    .trim()
    .match(/^(.+?)\s+(\d+)(?:\s*:\s*(\d+))?(?:\s*[-–]\s*(\d+)(?:\s*:\s*(\d+))?)?$/);
  if (!m) return null;
  const chap = Number(m[2]);
  const versetDebut = m[3] ? Number(m[3]) : 0;
  const second = m[4] ? Number(m[4]) : 0;
  const versetFin = m[5] ? Number(m[5]) : 0;

  if (!versetDebut) {
    // « Genèse 42-43 » : sans verset de départ, le second nombre est un chapitre.
    return { livre: m[1], chap, chapFin: second || chap, de: 1, a: 0 };
  }
  if (versetFin) {
    // « Genèse 1:31-2:3 » : on ouvre le premier chapitre à partir du verset cité
    // et on renvoie à la suite. (0 = jusqu'à la fin du chapitre.)
    return { livre: m[1], chap, chapFin: second, de: versetDebut, a: 0 };
  }
  // « Genèse 15:1-6 » : le second nombre est un verset du même chapitre.
  return { livre: m[1], chap, chapFin: chap, de: versetDebut, a: second || versetDebut };
}

async function chargerPassage(reference: string): Promise<Passage | null> {
  const p = analyse(reference);
  if (!p) return null;
  const nom = normalise(p.livre);
  const index = await getIndex();
  const livre =
    index.find((b) => normalise(b.name) === nom) ||
    index.find((b) => normalise(b.name).startsWith(nom)) ||
    index.find((b) => nom.startsWith(normalise(b.name)));
  if (!livre) return null;

  const book = await getBook(livre.id);
  const chapitre = book.chapters[p.chap - 1];
  if (!chapitre) return null;

  const fin = p.a > 0 ? Math.min(p.a, chapitre.length) : chapitre.length;
  return {
    titre: `${book.name} ${p.chap}`,
    versets: chapitre.map((texte, i) => ({ n: i + 1, texte })),
    de: p.de,
    a: fin,
    suite: p.chapFin > p.chap ? `${book.name} ${p.chap + 1}-${p.chapFin}` : null,
  };
}

export function PassagePanel({
  reference,
  accent,
  onClose,
}: {
  reference: string;
  accent: string;
  onClose: () => void;
}) {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [etat, setEtat] = useState<"charge" | "pret" | "absent">("charge");
  const premierCite = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    let vivant = true;
    chargerPassage(reference)
      .then((p) => {
        if (!vivant) return;
        setPassage(p);
        setEtat(p ? "pret" : "absent");
      })
      .catch(() => vivant && setEtat("absent"));
    return () => {
      vivant = false;
    };
  }, [reference]);

  // On ouvre SUR les versets cités : « Genèse 1:24-31 » ne doit pas atterrir
  // au verset 1 et obliger à chercher.
  useEffect(() => {
    if (etat !== "pret") return;
    const t = setTimeout(() => {
      premierCite.current?.scrollIntoView({ block: "start", behavior: "auto" });
    }, 30);
    return () => clearTimeout(t);
  }, [etat]);

  const href = bibleHref(reference);

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/85 backdrop-blur-sm" />
      <div
        className="relative flex max-h-[88svh] w-full max-w-md flex-col rounded-t-3xl border border-white/10 bg-night-900 sm:max-h-[86svh] sm:rounded-3xl"
        style={{ animation: "qm-optin .3s ease-out" }}
      >
        {/* En-tête fixe : la référence reste visible pendant la lecture. */}
        <div className="shrink-0 border-b border-white/10 px-5 pb-3 pt-5">
          <p className="text-center font-game text-[11px] font-black uppercase tracking-[0.2em] text-white/45">Le passage</p>
          <p className="text-center font-game text-xl font-black" style={{ color: accent }}>
            {passage?.titre ?? reference}
          </p>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
        >
          {etat === "charge" ? <p className="py-8 text-center text-sm text-white/50">Ouverture du passage…</p> : null}

          {etat === "absent" ? (
            <p className="py-6 text-center text-sm leading-relaxed text-white/60">
              Le texte n&apos;a pas pu être ouvert ici.
              {href ? " Tu peux le lire dans la Bible." : null}
            </p>
          ) : null}

          {passage
            ? passage.versets.map((v) => {
                const cite = v.n >= passage.de && v.n <= passage.a;
                return (
                  <p
                    key={v.n}
                    ref={v.n === passage.de ? premierCite : undefined}
                    className={`mb-2 scroll-mt-3 text-[15px] leading-relaxed ${cite ? "text-white" : "text-white/40"}`}
                  >
                    <span className="mr-1.5 font-game text-[11px] font-black" style={{ color: cite ? accent : "rgba(243,243,237,.3)" }}>
                      {v.n}
                    </span>
                    {v.texte}
                  </p>
                );
              })
            : null}

          {passage?.suite ? (
            <p className="mt-3 rounded-xl bg-white/[0.05] px-3 py-2.5 text-[12px] font-semibold text-white/55">
              L&apos;histoire continue en {passage.suite} — ouvre la Bible pour lire la suite.
            </p>
          ) : null}
        </div>

        {/* Pied fixe : on revient à la question sans avoir perdu son étape. */}
        <div
          className="shrink-0 border-t border-white/10 px-5 pt-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
        >
          {href ? (
            <Link
              href={href}
              className="mb-2 block w-full rounded-full border border-white/15 bg-white/[0.06] py-2.5 text-center font-game text-[13px] font-black text-white/75"
            >
              OUVRIR DANS LA BIBLE
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-full py-3 font-game text-sm font-black text-[#08130a]"
            style={{ background: `linear-gradient(180deg,${accent},${accent}bb)` }}
          >
            REVENIR À LA QUESTION
          </button>
        </div>
      </div>
    </div>
  );
}
