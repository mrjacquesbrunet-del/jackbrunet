"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { localeApp } from "@/lib/i18n";
import {
  addPlanComment,
  deletePlanComment,
  listPlanComments,
  planCommentCounts,
  type PlanComment,
} from "@/lib/plan-comments";

const Bulle = ({ className = "h-[18px] w-[18px]" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.9} aria-hidden>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 21 12z" strokeLinejoin="round" />
    <path d="M8.5 10.5h7M8.5 13.5h4.5" strokeLinecap="round" />
  </svg>
);

/**
 * Avis et commentaires d'un plan : une bulle (avec le nombre de
 * commentaires) à côté des étoiles ; un toucher ouvre la feuille où l'on lit
 * les avis et où l'on écrit le sien.
 */
export function PlanCommentaires({ slug, title }: { slug: string; title: string }) {
  const { userId, profile, isAdmin, isModerator } = useAuth();
  const [ouvert, setOuvert] = useState(false);
  const [nb, setNb] = useState<number | null>(null);
  const [liste, setListe] = useState<PlanComment[] | null>(null);
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    planCommentCounts().then((m) => setNb(m[slug] ?? 0));
  }, [slug]);

  useEffect(() => {
    if (!ouvert) return;
    setListe(null);
    listPlanComments(slug).then((l) => {
      setListe(l);
      setNb(l.length);
    });
  }, [ouvert, slug]);

  async function publier() {
    if (!userId || !texte.trim() || envoi) return;
    setEnvoi(true);
    setErreur(false);
    const c = await addPlanComment(slug, userId, texte);
    setEnvoi(false);
    if (!c) {
      setErreur(true);
      return;
    }
    setTexte("");
    setListe((cur) => [{ ...c, author: profile ?? undefined }, ...(cur ?? [])]);
    setNb((n) => (n ?? 0) + 1);
  }

  async function supprimer(id: string) {
    if (!(await deletePlanComment(id))) return;
    setListe((cur) => (cur ?? []).filter((x) => x.id !== id));
    setNb((n) => Math.max(0, (n ?? 1) - 1));
  }

  const date = (iso: string) =>
    new Date(iso).toLocaleDateString(localeApp(), { day: "numeric", month: "short", year: "numeric" });

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label="Avis et commentaires"
        className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur active:bg-white/25"
      >
        <Bulle />
        {nb ? nb : "Avis"}
      </button>

      {ouvert ? (
        <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="dialog" aria-modal="true">
          <button type="button" aria-label="Fermer" onClick={() => setOuvert(false)} className="absolute inset-0 bg-night-950/55" />
          <div className="relative mx-auto flex max-h-[88vh] w-full max-w-2xl flex-col rounded-t-3xl bg-[#F3F3ED] text-night-900 shadow-2xl">
            {/* En-tête */}
            <div className="flex items-start gap-3 border-b border-night-900/10 px-5 pb-3 pt-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                <Bulle className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-extrabold leading-tight">Avis et commentaires</p>
                <p className="truncate text-xs text-night-900/55">
                  {title} · {nb ?? 0} {nb === 1 ? "commentaire" : "commentaires"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-night-900/15 bg-white"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Écrire un avis */}
            <div className="border-b border-night-900/10 px-5 py-3">
              {userId ? (
                <div>
                  <textarea
                    value={texte}
                    onChange={(e) => setTexte(e.target.value.slice(0, 1000))}
                    rows={3}
                    placeholder="Qu'est-ce que ce plan t'a apporté ? Partage ton avis pour encourager les autres…"
                    className="w-full resize-none rounded-2xl border border-night-900/15 bg-white p-3 text-[15px] leading-relaxed outline-none focus:border-dawn-400"
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-night-900/40">{texte.length}/1000</span>
                    <button
                      type="button"
                      onClick={publier}
                      disabled={!texte.trim() || envoi}
                      className="rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950 disabled:opacity-40"
                    >
                      {envoi ? "Envoi…" : "Publier"}
                    </button>
                  </div>
                  {erreur ? (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">L&apos;envoi n&apos;a pas marché. Réessaie dans un instant.</p>
                  ) : null}
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3.5">
                  <p className="text-sm text-night-900/70">Connecte-toi pour laisser un avis.</p>
                  <Link href="/profil" className="shrink-0 rounded-full bg-dawn-400 px-4 py-2 font-display text-sm font-bold text-night-950">
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            {/* Les avis */}
            <div className="flex-1 overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3">
              {liste === null ? (
                <p className="py-6 text-center text-sm text-night-900/45">Chargement…</p>
              ) : liste.length === 0 ? (
                <p className="py-8 text-center text-sm text-night-900/55">
                  Aucun commentaire pour l&apos;instant. Sois le premier à partager ce que ce plan t&apos;apporte.
                </p>
              ) : (
                <ul className="space-y-3">
                  {liste.map((c) => {
                    const peutSupprimer = c.user_id === userId || isAdmin || isModerator;
                    return (
                      <li key={c.id} className="rounded-2xl bg-white p-3.5">
                        <div className="flex items-center gap-2.5">
                          {c.author ? (
                            <Link href={`/membre?u=${c.user_id}`} className="shrink-0">
                              <Avatar pseudo={c.author.pseudo} url={c.author.avatar_url} size={34} />
                            </Link>
                          ) : (
                            <Avatar pseudo="?" size={34} />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-sm font-bold">{c.author?.pseudo ?? "Membre"}</p>
                            <p className="text-[11px] text-night-900/45">{date(c.created_at)}</p>
                          </div>
                          {peutSupprimer ? (
                            <button
                              type="button"
                              onClick={() => supprimer(c.id)}
                              aria-label="Supprimer le commentaire"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-night-900/35 active:bg-night-900/5"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
                                <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-night-900/85">{c.body}</p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
