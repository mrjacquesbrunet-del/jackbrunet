"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FONDS_STORY, ajouterALaUne, creerAlaUne, listAlaUne, retirerDeLaUne, supprimerAlaUne, type AlaUne, type Story } from "@/lib/stories";
import { RenduStory } from "@/components/stories/RenduStory";
import { imageLegere } from "@/lib/image-legere";

const DUREE = 5000;

/** Feuille « Mettre à la une » : choisir une story à la une existante ou en créer une. */
export function ChoixALaUne({ me, story, fermer }: { me: string; story: Story; fermer: (ajoute: boolean) => void }) {
  const [liste, setListe] = useState<AlaUne[] | null>(null);
  const [titre, setTitre] = useState("");
  const [envoi, setEnvoi] = useState(false);
  useEffect(() => {
    listAlaUne(me).then(setListe);
  }, [me]);

  async function ajouter(id: string | null) {
    if (envoi) return;
    setEnvoi(true);
    const cible = id ?? (await creerAlaUne(me, titre));
    const ok = cible ? await ajouterALaUne(me, cible, story) : false;
    setEnvoi(false);
    if (ok) fermer(true);
    else alert("Impossible pour l'instant. Réessaie dans un moment.");
  }

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" onPointerDown={stop} onPointerUp={stop}>
      <button type="button" aria-label="Fermer" onClick={() => fermer(false)} className="absolute inset-0 bg-black/55" />
      <div className="keep-dark relative max-h-[70%] overflow-y-auto rounded-t-3xl bg-night-900 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 text-cream">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <p className="font-display text-lg font-bold">Mettre à la une</p>
        <p className="mt-0.5 text-sm text-cream/55">Elle restera sur ton profil, même après 24 h.</p>
        {liste === null ? (
          <p className="py-4 text-sm text-cream/50">Chargement…</p>
        ) : liste.length ? (
          <div className="no-scrollbar -mx-1 mt-4 flex gap-3 overflow-x-auto px-1 pb-1">
            {liste.map((a) => (
              <button key={a.id} type="button" disabled={envoi} onClick={() => void ajouter(a.id)} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5">
                <Couverture alaune={a} taille={60} />
                <span className="w-full truncate text-center text-[11px] font-semibold text-cream/80">{a.titre}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex items-center gap-2">
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value.slice(0, 30))}
            placeholder="Nouvelle : Témoignages, Culte, Mission…"
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.07] px-4 py-2.5 text-sm text-cream outline-none placeholder:text-cream/40"
          />
          <button
            type="button"
            disabled={envoi || !titre.trim()}
            onClick={() => void ajouter(null)}
            className="shrink-0 rounded-full bg-dawn-400 px-4 py-2.5 text-sm font-bold text-night-950 disabled:opacity-40"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
}

/** Rond d'une story à la une : la première image, sinon son fond coloré. */
function Couverture({ alaune, taille }: { alaune: AlaUne; taille: number }) {
  const premier = alaune.items[0];
  return (
    <span className="rounded-full p-[2.5px] ring-1 ring-white/25" style={{ width: taille + 5, height: taille + 5 }}>
      <span className="block h-full w-full overflow-hidden rounded-full bg-night-800">
        {premier?.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img {...imageLegere(premier.image_url, 160, { carre: true })} alt="" className="h-full w-full object-cover" />
        ) : (
          <span
            className="grid h-full w-full place-items-center font-display text-lg font-extrabold text-white"
            style={{ background: FONDS_STORY[premier?.fond ?? ""] ?? FONDS_STORY.nuit }}
          >
            {alaune.titre.slice(0, 1).toUpperCase()}
          </span>
        )}
      </span>
    </span>
  );
}

/** Rangée des stories à la une d'un profil (rien si aucune). */
export function StoriesALaUne({ userId, mine = false, sombre = true }: { userId: string; mine?: boolean; sombre?: boolean }) {
  const [liste, setListe] = useState<AlaUne[]>([]);
  const [ouverte, setOuverte] = useState<number | null>(null);
  const recharger = useCallback(() => {
    listAlaUne(userId).then((l) => setListe(l.filter((a) => a.items.length || mine)));
  }, [userId, mine]);
  useEffect(() => {
    recharger();
  }, [recharger]);
  if (!liste.length) return null;
  return (
    <>
      <div className="no-scrollbar -mx-1 mt-4 flex gap-4 overflow-x-auto px-1 pb-1">
        {liste.map((a, k) => (
          <button key={a.id} type="button" onClick={() => a.items.length && setOuverte(k)} className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1.5">
            <Couverture alaune={a} taille={58} />
            <span className={`w-full truncate text-center text-[11px] font-semibold ${sombre ? "text-cream/80" : "text-night-900/75"}`}>{a.titre}</span>
          </button>
        ))}
      </div>
      {ouverte !== null && liste[ouverte] ? (
        <LecteurALaUne
          alaune={liste[ouverte]}
          mine={mine}
          fermer={() => {
            setOuverte(null);
            recharger();
          }}
        />
      ) : null}
    </>
  );
}

/** Lecteur plein écran d'une story à la une (comme une story, sans limite de 24 h). */
function LecteurALaUne({ alaune, mine, fermer }: { alaune: AlaUne; mine: boolean; fermer: () => void }) {
  const [items, setItems] = useState(alaune.items);
  const [i, setI] = useState(0);
  const [progres, setProgres] = useState(0);
  const [pause, setPause] = useState(false);
  const debut = useRef(0);
  const ecoule = useRef(0);
  const item = items[i];

  const suivant = useCallback(() => {
    ecoule.current = 0;
    setProgres(0);
    setI((x) => {
      if (x + 1 < items.length) return x + 1;
      fermer();
      return x;
    });
  }, [items.length, fermer]);
  const precedent = () => {
    ecoule.current = 0;
    setProgres(0);
    setI((x) => Math.max(0, x - 1));
  };

  useEffect(() => {
    if (pause || !item) return;
    debut.current = performance.now() - ecoule.current;
    let raf = 0;
    const tick = (t: number) => {
      ecoule.current = t - debut.current;
      const p = ecoule.current / DUREE;
      if (p >= 1) return suivant();
      setProgres(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pause, item, suivant]);

  if (!item) return null;
  const stop = (e: React.SyntheticEvent) => e.stopPropagation();
  return (
    <div
      className="fixed inset-0 z-[160] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label={alaune.titre}
      onPointerDown={() => setPause(true)}
      onPointerUp={() => setPause(false)}
      onPointerCancel={() => setPause(false)}
    >
      <RenduStory image_url={item.image_url} caption={item.caption} fond={item.fond} />
      <div className="absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/70 to-transparent pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex gap-1 px-3">
          {items.map((it, k) => (
            <span key={it.id} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <span className="block h-full rounded-full bg-white" style={{ width: k < i ? "100%" : k === i ? `${progres * 100}%` : "0%" }} />
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-2 px-3" onPointerDown={stop} onPointerUp={stop}>
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">{alaune.titre}</p>
          {mine ? (
            <>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Retirer cette story de « " + alaune.titre + " » ?")) return;
                  await retirerDeLaUne(item.id);
                  const reste = items.filter((x) => x.id !== item.id);
                  if (!reste.length) fermer();
                  else {
                    setItems(reste);
                    setI((x) => Math.min(x, reste.length - 1));
                  }
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/80"
              >
                Retirer
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Supprimer « " + alaune.titre + " » de ton profil ?")) return;
                  await supprimerAlaUne(alaune.id);
                  fermer();
                }}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-300"
              >
                Supprimer
              </button>
            </>
          ) : null}
          <button type="button" onClick={fermer} aria-label="Fermer" className="grid h-9 w-9 place-items-center rounded-full text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
      <button type="button" aria-label="Précédente" onClick={precedent} className="absolute bottom-0 left-0 top-24 w-1/3" />
      <button type="button" aria-label="Suivante" onClick={suivant} className="absolute bottom-0 right-0 top-24 w-2/3" />
    </div>
  );
}
