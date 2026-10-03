"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBook, getIndex } from "@/lib/bible-client";
import type { Naviguer } from "@/lib/bible-nav";
import {
  CREDIT_LEXIQUE,
  getEmplois,
  getIndexLexique,
  getMot,
  nomLangue,
  prononcer,
  voixDisponible,
  type Emploi,
  type EntreeIndex,
  type Mot,
} from "@/lib/lexique";

/**
 * ÉTUDE DE MOT — la fiche d'un mot grec ou hébreu du lexique :
 *   - le mot, sa translittération, sa prononciation (synthèse vocale) ;
 *   - Sens : l'essentiel (sens numérotés) ou approfondi (définition complète) ;
 *   - Mots liés : de quoi il dérive, ce qui en dérive ;
 *   - Concordance : ses emplois dans la Segond, filtrables par traduction,
 *     le mot français souligné dans chaque verset.
 * Les mots liés s'ouvrent dans la même feuille (bouton retour).
 */

const COULEUR = {
  g: { fond: "from-[#2F5FA8] to-[#4B7BD0]", texte: "text-[#9CC0FF]" },
  h: { fond: "from-[#A8473F] to-[#D46A55]", texte: "text-[#FFB4A6]" },
};
const coul = (code: string) => (code.startsWith("G") ? COULEUR.g : COULEUR.h);
const PAGE = 30;

export function MotLexique({
  code: codeInitial,
  onClose,
  onNavigate,
  zIndex = "z-[140]",
}: {
  code: string;
  onClose: () => void;
  /** Dans la Bible : aperçu du passage. Ailleurs : ouverture de la Bible. */
  onNavigate?: Naviguer;
  zIndex?: string;
}) {
  const router = useRouter();
  const [pile, setPile] = useState<string[]>([codeInitial]);
  const code = pile[pile.length - 1];
  const [mot, setMot] = useState<Mot | null | undefined>(undefined);
  const [index, setIndex] = useState<Map<string, EntreeIndex> | null>(null);
  const [vue, setVue] = useState<"essentiel" | "approfondi">("essentiel");
  const [voix, setVoix] = useState(false);
  const corpsRef = useRef<HTMLDivElement>(null);
  const sensRef = useRef<HTMLDivElement>(null);
  const liesRef = useRef<HTMLDivElement>(null);
  const concRef = useRef<HTMLDivElement>(null);
  const [tousLies, setTousLies] = useState(false);

  useEffect(() => {
    let actif = true;
    setMot(undefined);
    setVue("essentiel");
    setTousLies(false);
    getMot(code)
      .then((m) => actif && setMot(m))
      .catch(() => actif && setMot(null));
    corpsRef.current?.scrollTo({ top: 0 });
    return () => {
      actif = false;
    };
  }, [code]);

  useEffect(() => {
    getIndexLexique()
      .then((i) => setIndex(new Map(i.map((e) => [e[0], e]))))
      .catch(() => {});
  }, []);

  // Les voix de synthèse se chargent après coup sur certains appareils.
  const langue = index?.get(code)?.[5] ?? (code.startsWith("G") ? "g" : "h");
  useEffect(() => {
    const maj = () => setVoix(voixDisponible(langue));
    maj();
    try {
      window.speechSynthesis?.addEventListener?.("voiceschanged", maj);
      return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", maj);
    } catch {
      return undefined;
    }
  }, [langue]);

  const lier = (c: string) => setPile((p) => [...p, c]);
  const lire: Naviguer = (l, c, v, v2) => {
    if (onNavigate) onNavigate(l, c, v, v2);
    else router.push(`/bible?livre=${l}&chap=${c}${v ? `&v=${v}` : ""}`);
  };
  const aller = (r: React.RefObject<HTMLDivElement | null>) =>
    r.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const lies = useMemo(() => {
    if (!mot) return [];
    return [
      ...(mot.de ?? []).map((c) => ({ c, rel: "dérivé de" })),
      ...(mot.derives ?? []).map((c) => ({ c, rel: "mot dérivé" })),
    ].filter((x) => index?.has(x.c) ?? true);
  }, [mot, index]);

  const c = coul(code);
  const hebreu = !code.startsWith("G");

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-end justify-center`} role="dialog" aria-modal="true">
      <button type="button" aria-label="Fermer" onClick={onClose} className="absolute inset-0 bg-night-950/70 backdrop-blur-[2px]" />
      <div className="dark-ctx relative flex h-[calc(100%-env(safe-area-inset-top)-1.25rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream shadow-card">
        {/* En-tête */}
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-2">
          <span className="mx-auto mb-2 block h-1 w-10 rounded-full bg-white/20" />
          <div className="flex items-center gap-2">
            {pile.length > 1 ? (
              <button
                type="button"
                onClick={() => setPile((p) => p.slice(0, -1))}
                aria-label="Mot précédent"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-extrabold leading-tight">Étude de mot</p>
              <p className="text-[12px] font-semibold text-cream/50">
                {nomLangue(langue)} · {code}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div ref={corpsRef} className="min-h-0 flex-1 overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          {mot === undefined ? (
            <p className="py-16 text-center text-sm text-cream/50">Chargement…</p>
          ) : mot === null ? (
            <p className="px-6 py-16 text-center text-sm text-cream/55">Ce mot n&apos;a pas pu être chargé. Vérifie ta connexion et réessaie.</p>
          ) : (
            <>
              {/* Le mot */}
              <div className={`relative overflow-hidden bg-gradient-to-br ${c.fond} px-5 pb-5 pt-4`}>
                <p className="text-[12px] font-black tracking-[0.14em] text-white/70">{code}</p>
                <div className="mt-1 flex items-end gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-serif text-[44px] leading-[1.1] text-white" dir={hebreu ? "rtl" : undefined} lang={hebreu ? "he" : "grc"} style={hebreu ? { textAlign: "left" } : undefined}>
                      {mot.mot}
                    </p>
                    <p className="mt-1 font-display text-[24px] font-extrabold leading-tight text-white">{mot.fr}</p>
                    <p className="mt-1 text-[14px] text-white/75">
                      {mot.translit}
                      {mot.pron ? ` · ${mot.pron}` : ""}
                    </p>
                  </div>
                  {voix ? (
                    <button
                      type="button"
                      onClick={() => prononcer(mot.mot, langue)}
                      aria-label="Écouter la prononciation"
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/20 text-white backdrop-blur active:scale-95"
                    >
                      <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-current">
                        <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Onglets : sauts vers les sections */}
              <div className="sticky top-0 z-10 flex gap-2 border-b border-white/10 bg-night-900/95 px-4 py-2.5 backdrop-blur">
                {(
                  [
                    ["Sens", sensRef],
                    ["Mots liés", liesRef],
                    ["Concordance", concRef],
                  ] as const
                ).map(([label, r]) => (
                  <button key={label} type="button" onClick={() => aller(r)} className="rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[13px] font-bold text-cream/85">
                    {label}
                  </button>
                ))}
              </div>

              {/* Sens */}
              <section ref={sensRef} className="scroll-mt-14 px-5 pt-5">
                <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-1">
                  {(
                    [
                      ["essentiel", "Essentiel"],
                      ["approfondi", "Approfondi"],
                    ] as const
                  ).map(([k, label]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setVue(k)}
                      className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${vue === k ? "bg-night-950 text-cream" : "text-cream/55"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Sens</p>
                {!mot.sens.length ? (
                  <p className="mt-2 text-[15px] leading-relaxed text-cream/70">
                    La définition française de ce mot est en préparation.
                  </p>
                ) : vue === "essentiel" || !mot.detail ? (
                  <ol className="mt-2 space-y-2">
                    {mot.sens.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-[16px] leading-relaxed text-cream/90">
                        {mot.sens.length > 1 ? <span className="w-5 shrink-0 text-right font-bold text-cream/45">{i + 1}.</span> : null}
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {mot.detail.split("\n").map((l, i) => {
                      const retrait = Math.min(3, (l.match(/^\s*\(?\d+[a-z0-9]*\)/)?.[0].replace(/[^a-z0-9]/g, "").length ?? 1) - 1);
                      return (
                        <p key={i} className="text-[15px] leading-relaxed text-cream/85" style={{ paddingLeft: `${retrait * 0.9}rem` }}>
                          {l}
                        </p>
                      );
                    })}
                  </div>
                )}
                {vue === "approfondi" && mot.sens.length && !mot.detail ? (
                  <p className="mt-3 text-[13px] text-cream/45">Pas de développement supplémentaire pour ce mot.</p>
                ) : null}
                {mot.trad.length ? (
                  <p className="mt-4 text-[14px] leading-relaxed text-cream/60">
                    <span className="font-bold text-cream/75">Dans la Segond : </span>
                    {mot.trad.map(([m, n]) => `${m} (${n})`).join(", ")}
                  </p>
                ) : null}
              </section>

              {/* Mots liés */}
              <section ref={liesRef} className="scroll-mt-14 px-5 pt-7">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Mots liés</p>
                {lies.length ? (
                  <>
                    <div className="mt-2 space-y-2">
                      {(tousLies ? lies : lies.slice(0, 4)).map(({ c: lc, rel }) => {
                        const e = index?.get(lc);
                        return (
                          <button
                            key={lc + rel}
                            type="button"
                            onClick={() => lier(lc)}
                            className="flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-left active:bg-white/10"
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-[12px] text-cream/50">
                                {rel} · {lc}
                              </span>
                              <span className="block truncate font-display text-[16px] font-extrabold">{e?.[3] ?? "…"}</span>
                            </span>
                            <span className="shrink-0 font-serif text-[22px] text-cream/85" dir={lc.startsWith("H") ? "rtl" : undefined}>
                              {e?.[1] ?? ""}
                            </span>
                            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-cream/40" strokeWidth={2.2}>
                              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                    {lies.length > 4 && !tousLies ? (
                      <button type="button" onClick={() => setTousLies(true)} className="mt-3 text-[14px] font-bold text-dawn-300">
                        Voir tous les mots liés ({lies.length})
                      </button>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-1.5 text-sm text-cream/55">Pas de mot apparenté répertorié.</p>
                )}
              </section>

              {/* Concordance */}
              <section ref={concRef} className="scroll-mt-14 px-5 pt-7">
                <Concordance code={code} mot={mot} onLire={lire} />
              </section>

              <p className="mt-8 px-5 text-[10px] leading-relaxed text-cream/35">{CREDIT_LEXIQUE}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Concordance({ code, mot, onLire }: { code: string; mot: Mot; onLire: Naviguer }) {
  const [emplois, setEmplois] = useState<Emploi[] | null>(null);
  const [filtre, setFiltre] = useState(-2);
  const [nb, setNb] = useState(4);
  const [textes, setTextes] = useState<Record<string, string>>({});
  const [noms, setNoms] = useState<Record<number, string>>({});

  useEffect(() => {
    let actif = true;
    setEmplois(null);
    setFiltre(-2);
    setNb(4);
    getEmplois(code)
      .then((e) => actif && setEmplois(e))
      .catch(() => actif && setEmplois([]));
    return () => {
      actif = false;
    };
  }, [code]);

  useEffect(() => {
    getIndex()
      .then((i) => setNoms(Object.fromEntries(i.map((b) => [b.id, b.name]))))
      .catch(() => {});
  }, []);

  const liste = useMemo(() => (emplois ?? []).filter((e) => filtre === -2 || e[3] === filtre), [emplois, filtre]);
  const visibles = liste.slice(0, nb);

  // Texte des versets affichés, livre par livre.
  useEffect(() => {
    let actif = true;
    const livres = [...new Set(visibles.map((e) => e[0]))];
    for (const b of livres) {
      getBook(b)
        .then((book) => {
          if (!actif) return;
          setTextes((t) => {
            const n = { ...t };
            for (const e of visibles) if (e[0] === b) n[`${e[0]}:${e[1]}:${e[2]}`] = book.chapters[e[1] - 1]?.[e[2] - 1] ?? "";
            return n;
          });
        })
        .catch(() => {});
    }
    return () => {
      actif = false;
    };
  }, [visibles.length, filtre, emplois]); // eslint-disable-line react-hooks/exhaustive-deps

  const compte = (i: number) => (emplois ?? []).filter((e) => e[3] === i).length;

  return (
    <>
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-dawn-400">Concordance</p>
      {!emplois ? (
        <p className="mt-2 text-sm text-cream/50">Chargement…</p>
      ) : (
        <>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[34px] font-extrabold leading-none">{emplois.length}</span>
            <span className="text-[15px] text-cream/65">emploi{emplois.length > 1 ? "s" : ""} dans la Segond</span>
          </p>
          {mot.trad.length > 1 ? (
            <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
              {[[-2, `Tous · ${emplois.length}`] as const, ...mot.trad.slice(0, 6).map(([m], i) => [i, `${m} · ${compte(i)}`] as const)]
                .filter(([i]) => i === -2 || compte(i as number) > 0)
                .map(([i, label]) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFiltre(i as number);
                      setNb(4);
                    }}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold ${
                      filtre === i ? "bg-dawn-400 text-night-950" : "bg-white/[0.07] text-cream/80"
                    }`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          ) : null}
          <ul className="mt-2 divide-y divide-white/10">
            {visibles.map((e) => {
              const k = `${e[0]}:${e[1]}:${e[2]}`;
              return (
                <li key={k}>
                  <button type="button" onClick={() => onLire(e[0], e[1], e[2])} className="block w-full py-3.5 text-left">
                    <span className="block font-display text-[16px] font-extrabold">
                      {noms[e[0]] ?? ""} {e[1]}:{e[2]}
                    </span>
                    <span className="mt-1 block font-serif text-[16px] leading-relaxed text-cream/80">
                      <Souligne texte={textes[k]} plages={e.slice(4)} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {liste.length > nb ? (
            <button
              type="button"
              onClick={() => setNb((n) => (n < PAGE ? PAGE : n + PAGE))}
              className="mt-2 inline-flex items-center gap-1.5 text-[14px] font-bold text-dawn-300"
            >
              {nb < PAGE ? "Voir toute la concordance" : `Voir plus (${liste.length - nb} restants)`}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}
        </>
      )}
    </>
  );
}

/** Le verset, avec le ou les mots traduisant le mot étudié soulignés. */
function Souligne({ texte, plages }: { texte?: string; plages: number[] }) {
  if (texte === undefined) return <span className="text-cream/40">…</span>;
  const morceaux: React.ReactNode[] = [];
  let pos = 0;
  for (let i = 0; i + 1 < plages.length; i += 2) {
    const [s, f] = [plages[i], plages[i + 1]];
    if (s < pos || f > texte.length) continue;
    morceaux.push(texte.slice(pos, s));
    morceaux.push(
      <span key={i} className="font-semibold text-dawn-300 underline decoration-dawn-400/70 decoration-2 underline-offset-4">
        {texte.slice(s, f)}
      </span>,
    );
    pos = f;
  }
  morceaux.push(texte.slice(pos));
  return <>{morceaux}</>;
}
