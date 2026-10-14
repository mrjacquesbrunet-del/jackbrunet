"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  chargerCatalogue,
  uploadPodcast,
  deletePodcast,
  updatePodcast,
  formatDuration,
  loadAudioDuration,
  creerEmission,
  modifierEmission,
  supprimerEmission,
  deplacerEpisode,
  listerPopulaires,
  notifierNouvelEpisode,
  type AudioTrack,
  type Emission,
} from "@/lib/audio-library";
import { usePodcastPlayer, lirePositions, memoriserCatalogue, dernierEpisodeLance } from "@/lib/podcast-player";
import {
  usePodcastEtat,
  basculerFavori,
  ouvrirLecteurPodcast,
  ouvrirChoixListe,
  creerListe,
  renommerListe,
  supprimerListe,
  basculerDansListe,
} from "@/lib/podcast-etat";
import {
  episodesHorsLigne,
  telechargerEpisode,
  retirerEpisode,
  autoTelechargementActif,
  setAutoTelechargement,
  telechargerNouveautes,
} from "@/lib/podcast-offline";
import { appShareUrl } from "@/config/app-links";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import { PlayGlyph, PauseGlyph, HeadphonesGlyph } from "@/components/ui/DevoIcons";
import { localeApp } from "@/lib/i18n";
import { AuthorCard } from "@/components/plans/AuthorCard";
import { ficheAuteur } from "@/lib/podcast-auteurs";

const DUR_KEY = "jb.podcast.dur.v1";
/** Épisode « court » : moins de 10 minutes. */
const COURT = 600;
const EASE = [0.22, 1, 0.36, 1] as const;

function when(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(localeApp(), { day: "numeric", month: "long" });
}

const COEUR =
  "M12 20.3l-1.45-1.32C5.4 14.24 2 11.16 2 7.5 2 4.9 4.02 3 6.5 3c1.74 0 3.4 1 4.22 2.44h.56C12.1 4 13.76 3 15.5 3 17.98 3 20 4.9 20 7.5c0 3.66-3.4 6.74-8.55 11.49L12 20.3z";

type Onglet = "accueil" | "biblio" | "parcourir";

/** Rangée horizontale à faire glisser (titre + action à droite). */
function Rangee({ titre, action, children }: { titre: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-3 px-5">
        <h2 className="font-display text-[20px] font-bold text-cream">{titre}</h2>
        {action}
      </div>
      <div className="no-scrollbar mt-3 flex snap-x snap-mandatory scroll-px-5 gap-3.5 overflow-x-auto px-5 pb-1">{children}</div>
    </section>
  );
}

/**
 * PODCASTS, façon catalogue :
 *  - Accueil : grand carrousel à faire glisser, puis des rangées horizontales
 *    (reprendre, nouveaux épisodes, émissions, une rangée par émission) ;
 *  - Bibliothèque : favoris, téléchargés, en cours ;
 *  - Parcourir : recherche, catégories, toutes les émissions.
 * Une émission s'ouvre en page dédiée. Lancer un épisode ouvre le lecteur
 * plein écran (PodcastPlayerPlein).
 */
export function ListenScreen() {
  const { email } = useAuth();
  const admin = isAdminEmail(email);
  const pod = usePodcastPlayer();
  const { favoris, listes } = usePodcastEtat();

  const [emissions, setEmissions] = useState<Emission[] | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[] | null>(null);
  const [onglet, setOnglet] = useState<Onglet>("accueil");
  const [emissionOuverte, setEmissionOuverte] = useState<string | null>(null);
  const [biblio, setBiblio] = useState<"fav" | "listes" | "offline" | "encours">("fav");
  const [listeOuverte, setListeOuverte] = useState<string | null>(null);
  const [nomNouvelleListe, setNomNouvelleListe] = useState("");
  const [format, setFormat] = useState<"courts" | "longs" | null>(null);
  const [populaires, setPopulaires] = useState<Record<string, number>>({});
  const [autoDl, setAutoDl] = useState(false);
  /** Fiche de l'intervenant ouverte (nom cliquable). */
  const [fiche, setFiche] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState<string | null>(null);
  const [auteur, setAuteur] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [voirTousNouveaux, setVoirTousNouveaux] = useState(false);
  const [upload, setUpload] = useState<{ done: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [offline, setOffline] = useState<Set<string>>(new Set());
  const [dlProgress, setDlProgress] = useState<Record<string, number>>({});
  const [positions, setPositions] = useState<Record<string, number>>({});
  const [durations, setDurations] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem(DUR_KEY) || "{}") as Record<string, number>;
    } catch {
      return {};
    }
  });

  // Fond nuit jusqu'aux bords.
  useEffect(() => {
    const h = document.documentElement;
    h.classList.add("page-nuit");
    return () => h.classList.remove("page-nuit");
  }, []);

  const load = useCallback(
    () =>
      chargerCatalogue().then(({ emissions, episodes }) => {
        setEmissions(emissions);
        setTracks(episodes);
        memoriserCatalogue(episodes); // pour enchaîner l'épisode suivant de l'émission
      }),
    [],
  );
  useEffect(() => {
    load();
    listerPopulaires().then(setPopulaires);
    setAutoDl(autoTelechargementActif());
  }, [load]);

  // Positions d'écoute (reprise), relues pendant la lecture.
  useEffect(() => {
    setPositions(lirePositions());
    if (!pod.playing) return;
    const t = setInterval(() => setPositions(lirePositions()), 5000);
    return () => clearInterval(t);
  }, [pod.playing, pod.index]);

  // Durées manquantes (métadonnées seules, une à une).
  useEffect(() => {
    if (!tracks) return;
    let annule = false;
    (async () => {
      for (const t of tracks) {
        if (annule) return;
        if (durations[t.id] !== undefined) continue;
        const d = await loadAudioDuration(t.url);
        if (annule) return;
        setDurations((prev) => {
          const next = { ...prev, [t.id]: d };
          try {
            localStorage.setItem(DUR_KEY, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      }
    })();
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  useEffect(() => {
    if (!tracks) return;
    episodesHorsLigne(tracks).then(setOffline);
  }, [tracks]);

  // Liens profonds : /ecouter?e=<épisode> lance l'épisode ; ?emission=<id> ouvre l'émission.
  useEffect(() => {
    if (!tracks) return;
    const p = new URLSearchParams(window.location.search);
    const e = p.get("e");
    const em = p.get("emission");
    if (em) setEmissionOuverte(em);
    if (e) {
      const t = tracks.find((x) => x.id === e);
      if (t) lire(t, tracks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracks]);

  /* ————— Actions ————— */

  /** `suiteFile` : liste choisie (favoris, Mes listes…) jouée dans l'ordre ;
   * sinon, à la fin, on enchaîne l'épisode suivant de l'émission. */
  function lire(t: AudioTrack, liste?: AudioTrack[], suiteFile = false) {
    if (pod.current?.id === t.id) {
      ouvrirLecteurPodcast();
      if (!pod.playing) pod.toggle();
      return;
    }
    const file = liste && liste.some((x) => x.id === t.id) ? liste : tracks ?? [t];
    pod.playQueue(file, Math.max(0, file.findIndex((x) => x.id === t.id)), suiteFile);
    ouvrirLecteurPodcast();
  }
  function lireAleatoire(liste: AudioTrack[]) {
    if (!liste.length) return;
    const m = [...liste];
    for (let i = m.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [m[i], m[j]] = [m[j], m[i]];
    }
    pod.playQueue(m, 0, true);
    ouvrirLecteurPodcast();
  }

  async function toggleOffline(t: AudioTrack) {
    if (dlProgress[t.path] !== undefined) return;
    if (offline.has(t.path)) {
      if (!confirm(`Retirer « ${t.title} » des téléchargements ?`)) return;
      await retirerEpisode(t);
      setOffline((prev) => {
        const next = new Set(prev);
        next.delete(t.path);
        return next;
      });
      return;
    }
    setDlProgress((p) => ({ ...p, [t.path]: 0 }));
    const ok = await telechargerEpisode(t, (r, total) => setDlProgress((p) => ({ ...p, [t.path]: total ? r / total : 0 })));
    setDlProgress((p) => {
      const next = { ...p };
      delete next[t.path];
      return next;
    });
    if (ok) setOffline((prev) => new Set(prev).add(t.path));
  }

  async function share(t: AudioTrack) {
    const url = appShareUrl(`/ecouter?e=${t.id}`);
    try {
      const nav = navigator as Navigator & { share?: (d: object) => Promise<void> };
      if (nav.share) await nav.share({ title: t.title, text: `Écoute « ${t.title} »`, url });
      else await navigator.clipboard.writeText(url);
    } catch {
      /* annulé */
    }
  }

  // Admin
  async function onFiles(e: React.ChangeEvent<HTMLInputElement>, showId: string | null) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUpload({ done: 0, total: files.length });
    const crees: { id: string; title: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const ep = await uploadPodcast(files[i], showId);
      if (ep) crees.push(ep);
      setUpload({ done: i + 1, total: files.length });
    }
    setUpload(null);
    await load();
    // Prévenir les membres (cloche + push « Nouveaux épisodes »).
    if (crees.length) {
      const em = emissions?.find((e) => e.id === showId);
      await prevenir(crees[crees.length - 1].id, crees.length > 1 ? `${crees.length} nouveaux épisodes` : `« ${crees[0].title} »`, em?.title);
    }
  }
  async function prevenir(id: string, quoi: string, emissionTitre?: string) {
    const defaut = `${quoi} ${quoi.startsWith("«") ? "est" : "sont"} en ligne${emissionTitre ? ` dans « ${emissionTitre} »` : ""}. Bonne écoute !`;
    const message = prompt("Prévenir les membres ? Message de la notification (Annuler = ne pas prévenir) :", defaut);
    if (!message?.trim()) return;
    const n = await notifierNouvelEpisode(message.trim(), `/ecouter/?e=${id}`);
    alert(n === null ? "La notification n'est pas partie. As-tu exécuté le SQL migration-podcasts-plus.sql dans Supabase ?" : `Notification envoyée à ${n} membre${n > 1 ? "s" : ""}.`);
  }
  async function editTrack(t: AudioTrack) {
    const title = prompt("Titre de l'épisode :", t.title);
    if (title === null) return;
    const description = prompt("Description (facultative) :", t.description ?? "");
    await updatePodcast(t.id, { title: title.trim() || t.title, description: (description ?? "").trim() || null });
    load();
  }
  async function removeTrack(t: AudioTrack) {
    if (!confirm(`Supprimer « ${t.title} » ?`)) return;
    await deletePodcast(t.id, t.path);
    load();
  }
  async function nouvelleEmission() {
    const title = prompt("Nom de l'émission :");
    if (!title?.trim()) return;
    const author = prompt("Intervenant (ex. Josy W. Brunet) :") ?? "";
    const category = prompt("Catégorie (ex. Enseignements, Prière, Témoignages) :") ?? "";
    const description = prompt("Description courte :") ?? "";
    const ok = await creerEmission({
      title: title.trim(),
      author: author.trim() || null,
      category: category.trim() || null,
      description: description.trim() || null,
    });
    if (!ok) alert("La création n'a pas marché. As-tu bien exécuté le SQL des émissions dans Supabase ?");
    load();
  }
  async function editerEmission(e: Emission) {
    const title = prompt("Nom de l'émission :", e.title);
    if (title === null) return;
    const author = prompt("Intervenant :", e.author ?? "") ?? e.author ?? "";
    const category = prompt("Catégorie :", e.category ?? "") ?? e.category ?? "";
    const description = prompt("Description :", e.description ?? "") ?? e.description ?? "";
    await modifierEmission(e.id, {
      title: title.trim() || e.title,
      author: author.trim() || null,
      category: category.trim() || null,
      description: description.trim() || null,
    });
    load();
  }
  async function editerFiche(e: Emission) {
    const lien = (label: string) => e.author_links?.find((l) => l.label === label)?.url ?? "";
    const role = prompt("Rôle de l'intervenant (ex. Pasteure, autrice) :", e.author_role ?? "");
    if (role === null) return;
    const bio = prompt("Courte présentation :", e.author_bio ?? "") ?? e.author_bio ?? "";
    const instagram = prompt("Lien Instagram (laisser vide si aucun) :", e.author_instagram ?? "") ?? "";
    const youtube = prompt("Lien YouTube :", lien("YouTube")) ?? "";
    const boutique = prompt("Lien Boutique (livres, produits) :", lien("Boutique")) ?? "";
    const site = prompt("Site web :", lien("Site web")) ?? "";
    const liens = [
      { label: "YouTube", url: youtube.trim() },
      { label: "Boutique", url: boutique.trim() },
      { label: "Site web", url: site.trim() },
    ].filter((l) => l.url);
    const ok = await modifierEmission(e.id, {
      author_role: role.trim() || null,
      author_bio: bio.trim() || null,
      author_instagram: instagram.trim() || null,
      author_links: liens,
    });
    if (!ok) alert("La fiche n'a pas été enregistrée. As-tu exécuté le SQL migration-podcast-auteurs.sql dans Supabase ?");
    load();
  }
  async function changerPochette(e: Emission, f: File | undefined) {
    if (!f) return;
    await modifierEmission(e.id, {}, f);
    load();
  }
  async function effacerEmission(e: Emission) {
    if (!confirm(`Supprimer l'émission « ${e.title} » ? Ses épisodes restent en ligne.`)) return;
    await supprimerEmission(e.id);
    setEmissionOuverte(null);
    load();
  }

  /* ————— Données dérivées ————— */

  const parEmission = useMemo(() => {
    const m = new Map<string, AudioTrack[]>();
    for (const t of tracks ?? []) {
      const k = t.show_id ?? "";
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return m;
  }, [tracks]);
  const enCours = (tracks ?? []).filter((t) => (positions[t.id] ?? 0) > 5);
  const nouveaux = (tracks ?? []).slice(0, 10);
  const plusEcoutes = (tracks ?? [])
    .filter((t) => (populaires[t.id] ?? 0) > 0)
    .sort((a, b) => (populaires[b.id] ?? 0) - (populaires[a.id] ?? 0))
    .slice(0, 10);
  const courts = (tracks ?? []).filter((t) => (durations[t.id] ?? 0) > 0 && durations[t.id] < COURT);
  const longs = (tracks ?? []).filter((t) => (durations[t.id] ?? 0) >= COURT);
  const minutes = (t: AudioTrack) => (durations[t.id] ? `${Math.max(1, Math.round(durations[t.id] / 60))} min` : null);
  const categories = Array.from(new Set((emissions ?? []).map((e) => e.category).filter(Boolean))) as string[];
  // Intervenants (avec la pochette de leur première émission et le nombre d'épisodes).
  const intervenants = Array.from(new Set((emissions ?? []).map((e) => e.author).filter(Boolean))) .map((nom) => {
    const ems = (emissions ?? []).filter((e) => e.author === nom);
    return { nom: nom as string, image: ems[0]?.cover ?? null, episodes: ems.reduce((n, e) => n + (parEmission.get(e.id)?.length ?? 0), 0) };
  });
  const sansAccent = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = sansAccent(recherche.trim());

  const fraction = (t: AudioTrack) => {
    const p = positions[t.id];
    const d = durations[t.id];
    return !p || p < 0 || !d ? 0 : Math.min(1, p / d);
  };
  const meta = (t: AudioTrack) => [when(t.created_at), formatDuration(durations[t.id])].filter(Boolean).join(" · ");

  const pochette = (src: string | null | undefined, className = "") =>
    src ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className={`h-full w-full object-cover ${className}`} />
    ) : (
      <div className={`grid h-full w-full place-items-center bg-gradient-to-br from-spirit-500 to-night-900 ${className}`}>
        <HeadphonesGlyph className="h-1/3 w-1/3 text-dawn-400" />
      </div>
    );

  const emission = emissionOuverte ? emissions?.find((e) => e.id === emissionOuverte) ?? null : null;

  /* ————— Briques d'affichage ————— */

  const carteEpisode = (t: AudioTrack, liste: AudioTrack[], sousTitre?: string | null) => {
    const isCur = pod.current?.id === t.id;
    const part = fraction(t);
    return (
      <button key={t.id} type="button" onClick={() => lire(t, liste)} className="w-[38vw] max-w-[168px] shrink-0 snap-start text-left">
        <span className="relative block aspect-square overflow-hidden rounded-2xl shadow-[0_14px_30px_-14px_rgba(0,0,0,.9)]">
          {pochette(t.cover)}
          <span className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-[0_0_16px_rgba(202,240,0,.45)]">
            {isCur && pod.playing ? (
              <span className="eq !h-4" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : (
              <PlayGlyph className="ml-0.5 h-4 w-4" />
            )}
          </span>
          {part > 0 ? (
            <span className="absolute inset-x-0 bottom-0 h-1 bg-black/40">
              <span className="block h-full bg-dawn-400" style={{ width: `${part * 100}%` }} />
            </span>
          ) : null}
        </span>
        <span className={`mt-2 line-clamp-2 block font-display text-[14.5px] font-bold leading-snug ${isCur ? "text-dawn-400" : "text-cream"}`}>{t.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-cream/50">{sousTitre ?? t.showTitle}</span>
      </button>
    );
  };

  // « Les plus écoutés » : grand numéro à gauche de la pochette.
  const carteClassement = (t: AudioTrack, rang: number, liste: AudioTrack[]) => (
    <button key={t.id} type="button" onClick={() => lire(t, liste)} className="w-[50vw] max-w-[220px] shrink-0 snap-start text-left">
      <span className="flex items-end">
        <span
          aria-hidden
          className="-mr-3 shrink-0 font-display text-[88px] font-black leading-[0.74] text-night-950"
          style={{ WebkitTextStroke: "2px rgba(202,240,0,.85)" }}
        >
          {rang}
        </span>
        <span className="relative block aspect-square min-w-0 flex-1 overflow-hidden rounded-2xl shadow-[0_14px_30px_-14px_rgba(0,0,0,.9)]">{pochette(t.cover)}</span>
      </span>
      <span className="block pl-9">
        <span className={`mt-2 line-clamp-2 block font-display text-[14px] font-bold leading-snug ${pod.current?.id === t.id ? "text-dawn-400" : "text-cream"}`}>{t.title}</span>
        <span className="mt-0.5 block truncate text-[11.5px] text-cream/50">
          {populaires[t.id]} écoute{(populaires[t.id] ?? 0) > 1 ? "s" : ""}
        </span>
      </span>
    </button>
  );

  const carteEmission = (e: Emission, large = false) => {
    const n = parEmission.get(e.id)?.length ?? 0;
    return (
      <button
        key={e.id}
        type="button"
        onClick={() => setEmissionOuverte(e.id)}
        className={`${large ? "w-full" : "w-[38vw] max-w-[168px] shrink-0 snap-start"} text-left`}
      >
        <span className="block aspect-square overflow-hidden rounded-2xl shadow-[0_14px_30px_-14px_rgba(0,0,0,.9)]">{pochette(e.cover)}</span>
        <span className="mt-2 line-clamp-2 block font-display text-[14.5px] font-bold leading-snug text-cream">{e.title}</span>
        <span className="mt-0.5 block truncate text-[12px] text-cream/50">
          {[e.author, n ? `${n} épisode${n > 1 ? "s" : ""}` : null].filter(Boolean).join(" · ")}
        </span>
      </button>
    );
  };

  const ligneEpisode = (t: AudioTrack, liste: AudioTrack[], opts: { suiteFile?: boolean; retirer?: () => void } = {}) => {
    const isCur = pod.current?.id === t.id;
    const fav = favoris.has(t.id);
    const ecoute = positions[t.id] === -1;
    const part = fraction(t);
    return (
      <li key={t.id} className="flex items-center gap-3 border-b border-white/[0.07] py-3 last:border-b-0">
        <button
          type="button"
          onClick={() => lire(t, liste, opts.suiteFile)}
          aria-label={isCur && pod.playing ? "Pause" : "Lire"}
          className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl active:scale-95"
        >
          {pochette(t.cover, isCur ? "opacity-40" : "opacity-85")}
          <span className={`absolute inset-0 grid place-items-center ${isCur ? "text-dawn-400" : "bg-night-950/25 text-cream"}`}>
            {isCur && pod.playing ? (
              <span className="eq !h-5" aria-hidden>
                <i />
                <i />
                <i />
                <i />
              </span>
            ) : (
              <PlayGlyph className="h-5 w-5" />
            )}
          </span>
        </button>
        <button type="button" onClick={() => lire(t, liste, opts.suiteFile)} className="min-w-0 flex-1 text-left">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-cream/45">
            {t.numero ? <span className="shrink-0 whitespace-nowrap text-dawn-400/80">Ép. {t.numero}</span> : null}
            <span className="truncate">{emission ? meta(t) : [t.author, meta(t)].filter(Boolean).join(" · ")}</span>
            {offline.has(t.path) ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2.4} aria-label="Hors ligne">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </p>
          <p className={`mt-0.5 line-clamp-2 font-display text-[15.5px] font-bold leading-snug ${isCur ? "text-dawn-400" : "text-cream"}`}>{t.title}</p>
          {ecoute ? (
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-dawn-400/80">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.6} aria-hidden>
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Écouté
            </p>
          ) : part > 0 ? (
            <div className="mt-1.5 h-[3px] w-full max-w-[160px] overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-dawn-400" style={{ width: `${part * 100}%` }} />
            </div>
          ) : null}
        </button>
        {opts.retirer ? (
          <button
            type="button"
            onClick={opts.retirer}
            aria-label="Retirer de la liste"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-cream/45 active:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
              <path d="M5 12h14" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => basculerFavori(t.id)}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${fav ? "text-dawn-400" : "text-cream/45 active:bg-white/10"}`}
        >
          <svg viewBox="0 0 24 24" className={`h-5 w-5 stroke-current ${fav ? "fill-current" : "fill-none"}`} strokeWidth={1.8} aria-hidden>
            <path d={COEUR} strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setMenu(t.id)}
          aria-label="Plus d'options"
          className="-ml-1 grid h-10 w-8 shrink-0 place-items-center rounded-full text-cream/50 active:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>
      </li>
    );
  };

  const vide = (titre: string, texte: string) => (
    <div className="mx-5 mt-6 rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-dawn-400/10 text-dawn-400">
        <HeadphonesGlyph className="h-6 w-6" />
      </span>
      <p className="mt-3 font-display text-lg font-bold text-cream">{titre}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm leading-relaxed text-cream/60">{texte}</p>
    </div>
  );

  /* ————— Pages ————— */


  const pageEmission = (e: Emission) => {
    const eps = parEmission.get(e.id) ?? [];
    return (
      <motion.div key={`em-${e.id}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
        <div className="relative overflow-hidden px-5 pb-6 pt-2">
          {e.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.cover} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl" />
          ) : null}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-night-950" />
          <div className="relative">
            <button type="button" onClick={() => setEmissionOuverte(null)} className="flex items-center gap-1.5 text-[13px] font-semibold text-cream/70">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Retour
            </button>
            <div className="mx-auto mt-4 aspect-square w-[56vw] max-w-[240px] overflow-hidden rounded-[26px] shadow-[0_0_0_1px_rgba(202,240,0,.2),0_30px_60px_-20px_rgba(0,0,0,.9)]">
              {pochette(e.cover)}
            </div>
            <div className="mt-5 text-center">
              {e.category ? <p className="text-[10.5px] font-black uppercase tracking-[0.22em] text-dawn-400">{e.category}</p> : null}
              <h1 className="mt-1.5 font-display text-[26px] font-extrabold leading-tight text-cream">{e.title}</h1>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-cream/55">
                {e.author ? (
                  <>
                    <button type="button" onClick={() => setFiche(e.author)} className="inline-flex items-center gap-0.5 text-dawn-400 underline-offset-4 active:underline">
                      {e.author}
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    </button>
                    <span aria-hidden>·</span>
                  </>
                ) : null}
                <span>{`${eps.length} épisode${eps.length > 1 ? "s" : ""}`}</span>
              </p>
              {e.description ? <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-cream/65">{e.description}</p> : null}
            </div>
            <div className="mx-auto mt-5 flex max-w-sm items-center gap-3">
              <button
                type="button"
                disabled={!eps.length}
                onClick={() => eps[0] && lire(eps[0], eps)}
                className="inline-flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-full bg-dawn-400 font-display text-[17px] font-extrabold text-night-950 shadow-[0_0_30px_-6px_rgba(202,240,0,.55)] active:scale-[0.98] disabled:opacity-50"
              >
                <PlayGlyph className="h-5 w-5" /> Écouter
              </button>
              <button
                type="button"
                onClick={() => lireAleatoire(eps)}
                aria-label="Lecture aléatoire"
                className="grid h-[52px] w-[52px] place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/85 active:bg-white/[0.12]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                  <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {admin ? (
          <div className="mx-5 mb-4 flex flex-wrap gap-2 rounded-3xl border border-dashed border-dawn-400/40 bg-white/[0.03] p-4">
            <input ref={fileRef} type="file" accept="audio/*" multiple onChange={(ev) => onFiles(ev, e.id)} className="hidden" />
            <input ref={coverRef} type="file" accept="image/*" onChange={(ev) => changerPochette(e, ev.target.files?.[0])} className="hidden" />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!!upload}
              className="rounded-full bg-dawn-400 px-4 py-2 text-[13px] font-extrabold text-night-950 disabled:opacity-50"
            >
              {upload ? `Envoi… ${upload.done}/${upload.total}` : "Ajouter des épisodes"}
            </button>
            <button type="button" onClick={() => coverRef.current?.click()} className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-cream/80">
              Changer la pochette
            </button>
            <button type="button" onClick={() => editerEmission(e)} className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-cream/80">
              Modifier
            </button>
            <button type="button" onClick={() => editerFiche(e)} className="rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-cream/80">
              Fiche de l&apos;intervenant
            </button>
            <button type="button" onClick={() => effacerEmission(e)} className="rounded-full border border-red-400/30 px-4 py-2 text-[13px] font-semibold text-red-400">
              Supprimer
            </button>
          </div>
        ) : null}

        <ul className="px-5">{eps.map((t) => ligneEpisode(t, eps))}</ul>
        {!eps.length ? vide("Aucun épisode pour l'instant", "Les premiers épisodes de cette émission arrivent bientôt.") : null}
      </motion.div>
    );
  };

  const boutonTelecharger = (t: AudioTrack) => {
    const prog = dlProgress[t.path];
    const isOff = offline.has(t.path);
    return (
      <button
        type="button"
        onClick={() => toggleOffline(t)}
        aria-label={isOff ? "Retirer le téléchargement" : prog !== undefined ? "Téléchargement…" : "Télécharger"}
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border ${isOff || prog !== undefined ? "border-dawn-400/70 text-dawn-400" : "border-white/45 text-cream/85"} active:bg-white/10`}
      >
        {prog !== undefined ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 -rotate-90" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity={0.2} strokeWidth={2.4} />
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeDasharray={56.5} strokeDashoffset={56.5 * (1 - prog)} />
          </svg>
        ) : isOff ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} aria-hidden>
            <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    );
  };

  const pageAccueil = () => {
    // Bannière : d'abord TOI (reprendre l'épisode commencé, sinon le nouvel
    // épisode), puis les émissions, complétées par les derniers épisodes.
    type Diapo = {
      cle: string;
      surtitre: string;
      titre: string;
      auteur?: string | null;
      texte: string | null;
      image: string | null | undefined;
      lancer: () => void;
      bouton?: string;
      part?: number;
    };
    const diapos: Diapo[] = [];
    const idDernier = dernierEpisodeLance();
    const reprise = enCours.find((t) => t.id === idDernier) ?? enCours[0];
    if (reprise) {
      const reste = durations[reprise.id] ? Math.max(1, Math.round((durations[reprise.id] - (positions[reprise.id] ?? 0)) / 60)) : null;
      diapos.push({
        cle: `r${reprise.id}`,
        surtitre: "Reprendre l'écoute",
        titre: reprise.title,
        auteur: reprise.author,
        texte: reste ? `Il te reste ${reste} min${reprise.numero ? ` · Épisode ${reprise.numero}` : ""}` : reprise.showTitle ?? null,
        image: reprise.cover,
        lancer: () => lire(reprise, enCours),
        bouton: "Reprendre",
        part: fraction(reprise),
      });
    }
    if (nouveaux[0] && nouveaux[0].id !== reprise?.id) {
      const t = nouveaux[0];
      diapos.push({ cle: `n${t.id}`, surtitre: "Nouvel épisode", titre: t.title, auteur: t.author, texte: t.description, image: t.cover, lancer: () => lire(t, tracks ?? nouveaux) });
    }
    for (const e of emissions ?? []) {
      const eps = parEmission.get(e.id) ?? [];
      if (!eps.length) continue;
      diapos.push({ cle: `e${e.id}`, surtitre: "À l'écoute", titre: e.title, auteur: e.author, texte: e.description, image: e.cover, lancer: () => lire(eps[0], eps) });
    }
    for (const t of nouveaux) {
      if (diapos.length >= 4) break;
      if (t === nouveaux[0] || t.id === reprise?.id) continue;
      diapos.push({
        cle: `t${t.id}`,
        surtitre: t.showTitle ?? "Épisode",
        titre: t.title,
        auteur: t.author,
        texte: t.description,
        image: t.cover,
        lancer: () => lire(t, nouveaux),
      });
    }
    const listeNouveaux = voirTousNouveaux ? tracks ?? [] : nouveaux.slice(0, 5);
    return (
      <motion.div key="accueil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        {/* Bannière à faire glisser */}
        {diapos.length ? (
          <div className="relative mx-5 mt-2">
            <div
              className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[26px]"
              onScroll={(ev) => {
                const el = ev.currentTarget;
                setHeroIdx(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
              }}
            >
              {diapos.map((d) => (
                <div key={d.cle} className="relative h-[248px] w-full shrink-0 snap-center overflow-hidden rounded-[26px] border border-white/10">
                  {/* Pochette carrée calée à droite : le visage reste visible */}
                  <div className="absolute inset-y-0 right-0 w-[64%]">{pochette(d.image, "object-[center_25%]")}</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-night-950 from-[36%] via-night-950/60 via-[58%] to-night-950/0" />
                  <div className="relative flex h-full max-w-[72%] flex-col justify-center p-5">
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-cream/70">{d.surtitre}</p>
                    <p className="mt-1.5 line-clamp-2 font-display text-[27px] font-bold leading-[1.05] text-cream">{d.titre}</p>
                    {d.auteur ? (
                      <button
                        type="button"
                        onClick={() => setFiche(d.auteur ?? null)}
                        className="mt-1 inline-flex max-w-full items-center gap-0.5 text-left text-[13px] font-semibold text-dawn-400 underline-offset-4 active:underline"
                      >
                        <span className="truncate">avec {d.auteur}</span>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                      </button>
                    ) : null}
                    {d.texte ? <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-cream/70">{d.texte}</p> : null}
                    {d.part ? (
                      <span className="mt-2.5 block h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-white/15">
                        <span className="block h-full rounded-full bg-dawn-400" style={{ width: `${d.part * 100}%` }} />
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={d.lancer}
                      className="mt-4 inline-flex w-fit items-center gap-2.5 whitespace-nowrap rounded-full bg-dawn-400 py-1.5 pl-1.5 pr-4 text-[14px] font-bold text-night-950 shadow-[0_0_24px_-6px_rgba(202,240,0,.6)] active:scale-[0.98]"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-night-950 text-dawn-400">
                        <PlayGlyph className="ml-0.5 h-4 w-4" />
                      </span>
                      {d.bouton ?? "Écouter maintenant"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {diapos.length > 1 ? (
              <div className="pointer-events-none absolute bottom-4 right-5 flex gap-1.5">
                {diapos.map((d, i) => (
                  <span key={d.cle} className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-4 bg-dawn-400" : "w-1.5 bg-white/40"}`} />
                ))}
              </div>
            ) : null}
          </div>
        ) : tracks ? (
          vide("Les audios arrivent bientôt", "De nouveaux enseignements sont en préparation.")
        ) : (
          <div className="mx-5 mt-2 h-[236px] animate-pulse rounded-[26px] bg-white/[0.05]" />
        )}

        {/* Reprendre l'écoute */}
        {enCours.length ? (
          <Rangee
            titre="Reprendre l'écoute"
            action={
              <button
                type="button"
                onClick={() => {
                  setBiblio("encours");
                  setOnglet("biblio");
                }}
                className="flex items-center gap-0.5 text-[13.5px] font-semibold text-cream/60"
              >
                Voir tout
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            }
          >
            {enCours.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => lire(t, enCours)}
                className="w-[44vw] max-w-[200px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] text-left"
              >
                <span className="relative block aspect-[4/3] overflow-hidden">
                  {pochette(t.cover)}
                  <span className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-night-950/90" />
                  <span className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-night-950/35 text-cream backdrop-blur-sm">
                    {pod.current?.id === t.id && pod.playing ? <PauseGlyph className="h-4 w-4" /> : <PlayGlyph className="ml-0.5 h-4 w-4" />}
                  </span>
                  <span className="absolute inset-x-3 bottom-2.5 line-clamp-2 font-display text-[16px] font-bold leading-tight text-cream">{t.title}</span>
                </span>
                <span className="block px-3 pb-3 pt-2.5">
                  <span className="block truncate text-[12.5px] text-cream/65">{[t.numero ? `Épisode ${t.numero}` : t.showTitle, t.author].filter(Boolean).join(" · ")}</span>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full rounded-full bg-dawn-400" style={{ width: `${fraction(t) * 100}%` }} />
                  </span>
                </span>
              </button>
            ))}
          </Rangee>
        ) : null}

        {/* Nouveaux épisodes */}
        {nouveaux.length ? (
          <section className="mt-8 px-5">
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-[20px] font-bold text-cream">Nouveaux épisodes</h2>
              {(tracks?.length ?? 0) > 5 ? (
                <button type="button" onClick={() => setVoirTousNouveaux((v) => !v)} className="flex items-center gap-0.5 text-[13.5px] font-semibold text-cream/60">
                  {voirTousNouveaux ? "Moins" : "Voir tout"}
                  <svg viewBox="0 0 24 24" className={`h-4 w-4 fill-none stroke-current transition-transform ${voirTousNouveaux ? "-rotate-90" : ""}`} strokeWidth={2.2} aria-hidden>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : null}
            </div>
            <ul className="mt-3 space-y-3">
              {listeNouveaux.map((t) => {
                const isCur = pod.current?.id === t.id;
                return (
                  <li key={t.id} className="flex items-center gap-3.5">
                    <button type="button" onClick={() => lire(t, tracks ?? nouveaux)} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
                      <span className="relative aspect-[4/3] w-[29%] max-w-[120px] shrink-0 overflow-hidden rounded-xl">
                        {pochette(t.cover)}
                        {isCur ? (
                          <span className="absolute inset-0 grid place-items-center bg-night-950/55 text-dawn-400">
                            {pod.playing ? (
                              <span className="eq !h-5" aria-hidden>
                                <i />
                                <i />
                                <i />
                                <i />
                              </span>
                            ) : (
                              <PlayGlyph className="h-5 w-5" />
                            )}
                          </span>
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className={`line-clamp-2 block text-[15.5px] font-semibold leading-snug ${isCur ? "text-dawn-400" : "text-cream"}`}>{t.title}</span>
                        <span className="mt-1 block truncate text-[13px] text-cream/55">
                          {[t.numero ? `Épisode ${t.numero}` : t.showTitle, durations[t.id] ? `${Math.max(1, Math.round(durations[t.id] / 60))} min` : null].filter(Boolean).join(" · ")}
                        </span>
                        <span className="mt-0.5 block truncate text-[12.5px] text-dawn-400/80">{t.author ?? t.showTitle}
                        </span>
                      </span>
                    </button>
                    {boutonTelecharger(t)}
                    <button type="button" onClick={() => setMenu(t.id)} aria-label="Plus d'options" className="-ml-1 grid h-10 w-7 shrink-0 place-items-center text-cream/60">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
                        <circle cx="12" cy="5" r="1.8" />
                        <circle cx="12" cy="12" r="1.8" />
                        <circle cx="12" cy="19" r="1.8" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {/* Les plus écoutés */}
        {plusEcoutes.length >= 2 ? (
          <Rangee titre="Les plus écoutés">{plusEcoutes.map((t, i) => carteClassement(t, i + 1, plusEcoutes))}</Rangee>
        ) : null}

        {/* Courts : moins de 10 minutes */}
        {courts.length ? (
          <Rangee
            titre="Courts · moins de 10 min"
            action={
              <button
                type="button"
                onClick={() => {
                  setFormat("courts");
                  setOnglet("parcourir");
                }}
                className="flex items-center gap-0.5 text-[13.5px] font-semibold text-cream/60"
              >
                Voir tout
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            }
          >
            {courts.slice(0, 12).map((t) => carteEpisode(t, courts, [minutes(t), t.author].filter(Boolean).join(" · ")))}
          </Rangee>
        ) : null}

        {emissions && emissions.length > 1 ? (
          <Rangee
            titre="Les émissions"
            action={
              <button type="button" onClick={() => setOnglet("parcourir")} className="flex items-center gap-0.5 text-[13.5px] font-semibold text-cream/60">
                Voir tout
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            }
          >
            {emissions.map((e) => carteEmission(e))}
          </Rangee>
        ) : null}
      </motion.div>
    );
  };

  const pageBiblio = () => {
    const parId = new Map((tracks ?? []).map((t) => [t.id, t]));
    const listeChoisie = biblio === "listes" && listeOuverte ? listes.find((l) => l.id === listeOuverte) ?? null : null;
    const liste =
      biblio === "fav"
        ? (tracks ?? []).filter((t) => favoris.has(t.id))
        : biblio === "offline"
          ? (tracks ?? []).filter((t) => offline.has(t.path))
          : biblio === "listes"
            ? (listeChoisie?.ids.map((id) => parId.get(id)).filter(Boolean) as AudioTrack[]) ?? []
            : enCours;
    return (
      <motion.div key="biblio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <div className="mx-5 mt-2 flex gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          {(
            [
              ["fav", "Favoris"],
              ["listes", "Listes"],
              ["offline", "Téléchargés"],
              ["encours", "En cours"],
            ] as const
          ).map(([k, lbl]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setBiblio(k);
                setListeOuverte(null);
              }}
              className={`relative flex-1 rounded-full px-1 py-2.5 text-[12.5px] font-bold ${biblio === k ? "text-night-950" : "text-cream/60"}`}
            >
              {biblio === k ? (
                <motion.span layoutId="biblio-podcast" className="absolute inset-0 rounded-full bg-dawn-400" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              ) : null}
              <span className="relative">{lbl}</span>
            </button>
          ))}
        </div>
        {/* Téléchargement automatique (Wi-Fi) */}
        {biblio === "offline" ? (
          <div className="mx-5 mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-dawn-400/10 text-dawn-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.5 5.5 0 0 1 7 0" strokeLinecap="round" />
                <circle cx="12" cy="19" r="1.3" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-cream">Télécharger les nouveaux épisodes</p>
              <p className="text-[12px] leading-snug text-cream/55">Automatiquement, en Wi-Fi seulement : les 3 derniers que tu n&apos;as pas écoutés.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoDl}
              aria-label="Télécharger les nouveaux épisodes automatiquement"
              onClick={() => {
                const on = !autoDl;
                setAutoDl(on);
                setAutoTelechargement(on);
                if (on && tracks) void telechargerNouveautes().then(() => episodesHorsLigne(tracks).then(setOffline));
              }}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${autoDl ? "bg-dawn-400" : "bg-white/15"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${autoDl ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        ) : null}

        {/* Mes listes */}
        {biblio === "listes" && !listeChoisie ? (
          <div className="mx-5 mt-4">
            {listes.length ? (
              <ul className="divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-white/[0.03]">
                {listes.map((l) => {
                  const premier = l.ids.map((id) => parId.get(id)).find(Boolean);
                  return (
                    <li key={l.id}>
                      <button type="button" onClick={() => setListeOuverte(l.id)} className="flex w-full items-center gap-3.5 px-3.5 py-3 text-left active:bg-white/[0.05]">
                        <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">{pochette(premier?.cover)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[16px] font-bold text-cream">{l.nom}</span>
                          <span className="block text-[12.5px] text-cream/50">
                            {l.ids.length} épisode{l.ids.length > 1 ? "s" : ""}
                          </span>
                        </span>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current text-cream/40" strokeWidth={2.2} aria-hidden>
                          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center text-[13.5px] leading-relaxed text-cream/60">
                Range tes épisodes dans tes propres listes : une pour tes trajets, une pour prier le soir… Dans le menu « … » d&apos;un épisode, choisis
                « Ajouter à une liste ».
              </p>
            )}
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!nomNouvelleListe.trim()) return;
                creerListe(nomNouvelleListe);
                setNomNouvelleListe("");
              }}
            >
              <input
                value={nomNouvelleListe}
                onChange={(e) => setNomNouvelleListe(e.target.value)}
                placeholder="Nouvelle liste…"
                maxLength={40}
                aria-label="Nom de la nouvelle liste"
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.05] px-4 py-3 text-[14.5px] text-cream outline-none placeholder:text-cream/40 focus:border-dawn-400/60"
              />
              <button type="submit" disabled={!nomNouvelleListe.trim()} className="shrink-0 rounded-full bg-dawn-400 px-5 py-3 text-[14px] font-extrabold text-night-950 disabled:opacity-40">
                Créer
              </button>
            </form>
          </div>
        ) : null}

        {listeChoisie ? (
          <div className="mx-5 mt-4">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setListeOuverte(null)} className="mr-auto flex items-center gap-1.5 text-[13px] font-semibold text-cream/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Mes listes
              </button>
              <button
                type="button"
                onClick={() => {
                  const nom = prompt("Nom de la liste :", listeChoisie.nom);
                  if (nom !== null) renommerListe(listeChoisie.id, nom);
                }}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-cream/80"
              >
                Renommer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Supprimer la liste « ${listeChoisie.nom} » ? Les épisodes restent dans l'app.`)) return;
                  supprimerListe(listeChoisie.id);
                  setListeOuverte(null);
                }}
                className="rounded-full border border-red-400/30 px-3.5 py-1.5 text-[12.5px] font-semibold text-red-400"
              >
                Supprimer
              </button>
            </div>
            <h2 className="mt-3 line-clamp-2 font-display text-[26px] font-extrabold leading-tight text-cream">{listeChoisie.nom}</h2>
          </div>
        ) : null}

        {biblio === "listes" && !listeChoisie ? null : liste.length ? (
          <>
            <div className="mx-5 mt-4 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-cream/50">
                {liste.length} épisode{liste.length > 1 ? "s" : ""}
              </p>
              <button
                type="button"
                onClick={() => liste[0] && lire(liste[0], liste, true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-4 py-2 text-[13px] font-extrabold text-night-950"
              >
                <PlayGlyph className="h-4 w-4" /> Tout écouter
              </button>
            </div>
            <ul className="mt-2 px-5">
              {liste.map((t) =>
                ligneEpisode(t, liste, {
                  suiteFile: biblio !== "encours",
                  retirer: listeChoisie ? () => basculerDansListe(listeChoisie.id, t.id) : undefined,
                }),
              )}
            </ul>
          </>
        ) : listeChoisie ? (
          vide("Liste vide", "Dans le menu « … » d'un épisode, choisis « Ajouter à une liste ».")
        ) : biblio === "fav" ? (
          vide("Aucun favori pour l'instant", "Touche le cœur sur un épisode pour le retrouver ici.")
        ) : biblio === "offline" ? (
          vide("Aucun épisode téléchargé", "Dans le menu « … » d'un épisode, choisis Télécharger : il s'écoute ensuite sans connexion.")
        ) : (
          vide("Rien en cours", "Les épisodes que tu commences apparaissent ici pour reprendre là où tu t'es arrêté.")
        )}
      </motion.div>
    );
  };

  const pageParcourir = () => {
    const emFiltrees = (emissions ?? []).filter(
      (e) =>
        (!categorie || e.category === categorie) &&
        (!auteur || e.author === auteur) &&
        (!q || sansAccent(`${e.title} ${e.author ?? ""} ${e.description ?? ""}`).includes(q)),
    );
    const parFormat = format === "courts" ? courts : format === "longs" ? longs : tracks ?? [];
    const epTrouves =
      q || auteur || format
        ? parFormat.filter(
            (t) =>
              (!auteur || t.author === auteur) &&
              (!q || sansAccent(`${t.title} ${t.description ?? ""} ${t.showTitle ?? ""} ${t.author ?? ""}`).includes(q)),
          )
        : [];
    return (
      <motion.div key="parcourir" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <label className="mx-5 mt-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 focus-within:border-dawn-400/60">
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 fill-none stroke-current text-dawn-400" strokeWidth={2} aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher une émission, un épisode…"
            aria-label="Rechercher"
            className="min-w-0 flex-1 appearance-none bg-transparent py-3.5 text-[15px] text-cream outline-none placeholder:text-cream/40 [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        {/* Par intervenant */}
        {intervenants.length > 1 ? (
          <>
            <h2 className="mt-5 px-5 font-display text-[18px] font-bold text-cream">Par intervenant</h2>
            <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto px-5">
              {intervenants.map((a) => {
                const actif = auteur === a.nom;
                return (
                  <button key={a.nom} type="button" onClick={() => setAuteur(actif ? null : a.nom)} className="w-[76px] shrink-0 text-center">
                    <span className={`mx-auto block h-[68px] w-[68px] overflow-hidden rounded-full ring-2 ${actif ? "ring-dawn-400" : "ring-white/10"}`}>
                      {pochette(a.image)}
                    </span>
                    <span className={`mt-1.5 line-clamp-2 block text-[12px] font-semibold leading-tight ${actif ? "text-dawn-400" : "text-cream/80"}`}>{a.nom}</span>
                    <span className="block text-[10.5px] text-cream/40">{a.episodes} ép.</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {/* Durée : courts (moins de 10 min) / longs */}
        {courts.length || longs.length ? (
          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto px-5">
            {(
              [
                ["courts", "Courts · moins de 10 min", courts.length],
                ["longs", "Longs · 10 min et plus", longs.length],
              ] as const
            )
              .filter(([, , n]) => n > 0)
              .map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFormat(format === k ? null : k)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold ${
                    format === k ? "bg-dawn-400 text-night-950" : "border border-white/12 bg-white/[0.05] text-cream/75"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} aria-hidden>
                    <circle cx="12" cy="13" r="8" />
                    <path d="M12 9v4l2.5 2M10 2h4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {lbl}
                </button>
              ))}
          </div>
        ) : null}

        {categories.length ? (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-5">
            {[null, ...categories].map((c) => (
              <button
                key={c ?? "tous"}
                type="button"
                onClick={() => setCategorie(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold ${
                  categorie === c ? "bg-dawn-400 text-night-950" : "border border-white/12 bg-white/[0.05] text-cream/75"
                }`}
              >
                {c ?? "Tous"}
              </button>
            ))}
          </div>
        ) : null}

        {admin ? (
          <div className="mx-5 mt-4">
            <button
              type="button"
              onClick={nouvelleEmission}
              className="w-full rounded-2xl border border-dashed border-dawn-400/45 bg-white/[0.03] py-3.5 text-[14px] font-bold text-dawn-400"
            >
              + Nouvelle émission (admin)
            </button>
          </div>
        ) : null}

        {!format ? (
          <>
            <div className="mt-6 flex items-end justify-between gap-3 px-5">
              <h2 className="font-display text-[20px] font-bold text-cream">
                {auteur ? `Les émissions de ${auteur}` : q ? "Émissions" : "Toutes les émissions"}
              </h2>
              {auteur ? (
                <button type="button" onClick={() => setFiche(auteur)} className="shrink-0 rounded-full border border-dawn-400/50 px-3.5 py-1.5 text-[12.5px] font-bold text-dawn-400">
                  Sa fiche
                </button>
              ) : null}
            </div>
            {emFiltrees.length ? (
              <div className="mt-3 grid grid-cols-2 gap-x-3.5 gap-y-5 px-5">{emFiltrees.map((e) => carteEmission(e, true))}</div>
            ) : (
              <p className="px-5 py-4 text-sm text-cream/55">Aucune émission ne correspond.</p>
            )}
          </>
        ) : null}

        {q || auteur || format ? (
          <>
            <h2 className="mt-7 px-5 font-display text-[20px] font-bold text-cream">
              {format === "courts" && !q ? "Épisodes courts" : format === "longs" && !q ? "Épisodes longs" : auteur && !q ? `Tous les épisodes de ${auteur}` : "Épisodes"}
            </h2>
            {epTrouves.length ? (
              <ul className="mt-1 px-5">{epTrouves.map((t) => ligneEpisode(t, epTrouves))}</ul>
            ) : (
              <p className="px-5 py-4 text-sm text-cream/55">{q ? `Aucun épisode ne correspond à « ${recherche.trim()} ».` : "Aucun épisode pour l'instant."}</p>
            )}
          </>
        ) : null}
      </motion.div>
    );
  };

  const menuTrack = menu ? tracks?.find((t) => t.id === menu) ?? null : null;

  return (
    <div className="keep-dark relative min-h-[100svh] bg-night-950 pb-36 text-cream">
      {/* Halo lime discret en haut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-80"
        style={{ background: "radial-gradient(70% 60% at 50% 0%, rgba(202,240,0,.10), transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-2xl pt-[calc(env(safe-area-inset-top)+4.75rem)] sm:pt-28">
        {/* Onglets : pastilles avec icône */}
        {!emission ? (
          <nav className="grid grid-cols-3 gap-1.5 px-4 pb-4">
            {(
              [
                ["accueil", "Podcast"],
                ["biblio", "Favoris"],
                ["parcourir", "Découvrir"],
              ] as const
            ).map(([k, lbl]) => {
              const actif = onglet === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setOnglet(k)}
                  className={`relative flex items-center justify-center gap-2 rounded-full py-3 text-[15px] font-semibold transition-colors ${actif ? "text-cream" : "text-cream/55"}`}
                >
                  {actif ? <motion.span layoutId="onglet-ecouter" className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.07]" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
                  <span className={`relative ${actif ? "text-dawn-400" : ""}`}>
                    {k === "accueil" ? (
                      <HeadphonesGlyph className="h-5 w-5" />
                    ) : k === "biblio" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                        <path d={COEUR} strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M15.5 8.5l-2 5-5 2 2-5z" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className="relative">{lbl}</span>
                  {actif ? <span className="absolute -bottom-2 left-1/2 h-[3px] w-8 -translate-x-1/2 rounded-full bg-dawn-400" /> : null}
                </button>
              );
            })}
          </nav>
        ) : null}

        {/* Sans AnimatePresence « wait » : elle restait bloquée sur l'ancienne
            page après l'animation de la pastille (onglet vide). Fondu d'entrée seul. */}
        {emission ? pageEmission(emission) : onglet === "accueil" ? pageAccueil() : onglet === "biblio" ? pageBiblio() : pageParcourir()}

        {!emission && onglet === "accueil" ? (
          <div className="mt-10 flex justify-center px-5">
            <Link
              href="/videos"
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 text-[14px] font-semibold text-cream/80"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                <path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM17 10l5-3v10l-5-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Voir aussi les vidéos
            </Link>
          </div>
        ) : null}
      </div>

      {/* Fiche de l'intervenant (Instagram, YouTube, boutique…) */}
      {fiche
        ? (() => {
            // L'émission de cet intervenant dont la fiche est la plus complète.
            const ems = (emissions ?? []).filter((e) => e.author === fiche);
            const e = ems.find((x) => x.author_bio || x.author_instagram || x.author_links?.length) ?? ems[0];
            const { info, photo } = ficheAuteur(fiche, e);
            return <AuthorCard open onClose={() => setFiche(null)} author={info} photo={photo} z="z-[125]" />;
          })()
        : null}

      {/* Menu d'un épisode */}
      <AnimatePresence>
        {menuTrack ? (
          <motion.div
            key="menu"
            className="fixed inset-0 z-[120] flex items-end justify-center"
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" aria-label="Fermer" onClick={() => setMenu(null)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="dark-ctx relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-[28px] border border-white/10 bg-night-900 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 text-cream"
            >
              <div className="mx-auto h-1 w-10 rounded-full bg-white/20" />
              <div className="mt-4 flex items-center gap-3.5">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">{pochette(menuTrack.cover)}</div>
                <div className="min-w-0">
                  <p className="line-clamp-2 font-display text-[17px] font-bold leading-snug">{menuTrack.title}</p>
                  <p className="mt-0.5 truncate text-[12px] font-semibold text-cream/50">{[menuTrack.showTitle, meta(menuTrack)].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              {menuTrack.description ? (
                <p className="mt-3 max-h-40 overflow-y-auto text-[14px] leading-relaxed text-cream/65">{menuTrack.description}</p>
              ) : null}
              <div className="mt-4 divide-y divide-white/[0.07] rounded-2xl border border-white/10 bg-white/[0.03]">
                {(() => {
                  const t = menuTrack;
                  const prog = dlProgress[t.path];
                  const ligne = "flex w-full items-center gap-3 px-4 py-3.5 text-left text-[15px] font-semibold active:bg-white/[0.05]";
                  return (
                    <>
                      <button
                        type="button"
                        className={ligne}
                        onClick={() => {
                          setMenu(null);
                          lire(t);
                        }}
                      >
                        <PlayGlyph className="h-5 w-5 text-dawn-400" />
                        {(positions[t.id] ?? 0) > 5 ? "Reprendre l'écoute" : "Écouter"}
                      </button>
                      <button type="button" className={ligne} onClick={() => toggleOffline(t)}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {prog !== undefined
                          ? `Téléchargement… ${Math.round(prog * 100)} %`
                          : offline.has(t.path)
                            ? "Retirer du hors-ligne"
                            : "Télécharger (écoute hors-ligne)"}
                      </button>
                      <button
                        type="button"
                        className={ligne}
                        onClick={() => {
                          setMenu(null);
                          ouvrirChoixListe({ id: t.id, titre: t.title });
                        }}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                          <path d="M4 6h11M4 11h11M4 16h7M17 13v8M13 17h8" strokeLinecap="round" />
                        </svg>
                        Ajouter à une liste
                      </button>
                      <button type="button" className={ligne} onClick={() => share(t)}>
                        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v13M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Partager
                      </button>
                      {t.author ? (
                        <button
                          type="button"
                          className={ligne}
                          onClick={() => {
                            setMenu(null);
                            setFiche(t.author ?? null);
                          }}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-dawn-400" strokeWidth={1.9} aria-hidden>
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21a8 8 0 0 1 16 0" strokeLinecap="round" />
                          </svg>
                          À propos de {t.author}
                        </button>
                      ) : null}
                      {t.show_id && !emission ? (
                        <button
                          type="button"
                          className={ligne}
                          onClick={() => {
                            setMenu(null);
                            setEmissionOuverte(t.show_id!);
                          }}
                        >
                          <HeadphonesGlyph className="h-5 w-5 text-dawn-400" />
                          Voir l&apos;émission
                        </button>
                      ) : null}
                      {admin ? (
                        <>
                          <button
                            type="button"
                            className={ligne}
                            onClick={() => {
                              setMenu(null);
                              editTrack(t);
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-cream/60" strokeWidth={1.9} aria-hidden>
                              <path d="M16.5 4.5l3 3L8 19l-4 1 1-4L16.5 4.5z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Modifier (admin)
                          </button>
                          <button
                            type="button"
                            className={ligne}
                            onClick={() => {
                              setMenu(null);
                              void prevenir(t.id, `« ${t.title} »`, t.showTitle);
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current text-cream/60" strokeWidth={1.9} aria-hidden>
                              <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Prévenir les membres (admin)
                          </button>
                          {emissions && emissions.length > 1 ? (
                            <label className={`${ligne} cursor-pointer`}>
                              <HeadphonesGlyph className="h-5 w-5 text-cream/60" />
                              <span className="shrink-0">Émission :</span>
                              <select
                                value={t.show_id ?? ""}
                                onChange={async (ev) => {
                                  await deplacerEpisode(t.id, ev.target.value);
                                  setMenu(null);
                                  load();
                                }}
                                className="min-w-0 flex-1 rounded-lg border border-white/15 bg-night-950 px-2 py-1.5 text-[14px] text-cream"
                              >
                                {emissions.map((e) => (
                                  <option key={e.id} value={e.id}>
                                    {e.title}
                                  </option>
                                ))}
                              </select>
                            </label>
                          ) : null}
                          <button
                            type="button"
                            className={`${ligne} text-red-400`}
                            onClick={() => {
                              setMenu(null);
                              removeTrack(t);
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.9} aria-hidden>
                              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Supprimer (admin)
                          </button>
                        </>
                      ) : null}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
