"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, initials } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { progressionDon, type ObjectifDon } from "@/lib/soutien";
import { useEngagement } from "@/lib/engagement";
import { useLangue } from "@/lib/i18n";
import { FlameGlyph } from "@/components/ui/DevoIcons";

const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} €`;

/**
 * MENU PROFIL (en haut à gauche, sur les pages principales de l'app).
 * Une petite pastille ronde — ma photo, ou ma première lettre — ouvre un
 * panneau latéral : mon espace (carnet, plans, favoris…), la carte « missions »
 * qui mène au soutien, puis À propos, Soutenir et Paramètres.
 *
 * - `ProfilBouton` : la pastille seule (aussi posée dans l'en-tête de la Bible) ;
 * - `ProfilMenu` : le panneau, monté une fois dans AppShell, ouvert par
 *   l'évènement `jb:menu-profil` ;
 * - `BarreHaut` : la barre fixe des pages principales (pastille + titre).
 */

const EVT = "jb:menu-profil";
/** Vue à ouvrir en arrivant sur /profil (« espace » ou « reglages »). */
export const CLE_VUE_PROFIL = "jb.profil.vue";
export const EVT_VUE_PROFIL = "jb:profil-vue";

/** Photo de la carte « missions » (enfants soutenus par le ministère). */
const PHOTO_MISSION = "/mission/enfants.webp";

/**
 * Pages qui ont la barre du haut (bouton profil + titre). Les autres ont
 * déjà leur propre en-tête (retour, Bible, profil, jeux…).
 */
const PAGES_BARRE: Record<string, string> = {
  "/devotionnel": "",
  "/communaute": "Prière",
  "/plans": "Plans",
  "/ecole": "Étude",
  "/carnet": "Carnet",
  "/favoris": "Favoris",
  "/exclusivites": "Exclusivités",
  "/messages": "Messages",
  "/exaucees": "Exaucées",
  "/groupes": "Groupes",
  "/ecouter": "Écouter",
  "/videos": "Vidéos",
};
/**
 * Teinte de ce qui est sous un point : on remonte jusqu'au premier fond
 * opaque. Une image de fond (héros photo) compte comme sombre.
 * Renvoie true si clair, false si sombre, null si indéterminé.
 */
function teinteSous(el: HTMLElement | null, x: number, y: number): boolean | null {
  const large = window.innerWidth * 0.7;
  for (let n: HTMLElement | null = el; n && n !== document.documentElement; n = n.parentElement) {
    const r = n.getBoundingClientRect();
    // Une grande image (héros photo) sous le point : sombre.
    for (const img of Array.from(n.querySelectorAll<HTMLElement>(":scope > img, :scope > picture > img, :scope > video"))) {
      const ri = img.getBoundingClientRect();
      if (ri.width >= large * 0.7 && x >= ri.left && x <= ri.right && y >= ri.top && y <= ri.bottom) return false;
    }
    if (n.tagName === "IMG" && r.width >= large * 0.7) return false;
    // On ne tient compte que des fonds larges (sections, pages), pas des
    // boutons ni des petites cartes.
    if (r.width < large) continue;
    const cs = getComputedStyle(n);
    if (cs.backgroundImage.includes("url(")) return false;
    const m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) continue;
    const [rr, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    if (a < 0.5) continue;
    return 0.2126 * rr + 0.7152 * g + 0.0722 * b > 150;
  }
  return null;
}

/** Pages à fond clair : la barre prend alors un fondu crème. */
const PAGES_CLAIRES = new Set(["/carnet", "/favoris", "/messages"]);

export function ouvrirMenuProfil() {
  window.dispatchEvent(new Event(EVT));
}

export function ProfilBouton({ taille = 36, className = "" }: { taille?: number; className?: string }) {
  const { ready, userId, profile } = useAuth();
  if (!ready) return null;
  const nom = profile?.pseudo ?? "";
  return (
    // Anneau néon lime (dégradé + halo qui « respire »), fine bague sombre,
    // puis la photo ou l'initiale : la pastille paraît sertie dans la page.
    <button
      type="button"
      data-profil-menu-btn
      onClick={ouvrirMenuProfil}
      aria-label="Ouvrir le menu"
      style={{
        width: taille,
        height: taille,
        WebkitTapHighlightColor: "transparent",
        background: "conic-gradient(from 210deg, #CAF000, #8FB300, #E9FF7A, #CAF000)",
      }}
      className={`profil-neon relative shrink-0 rounded-full p-[2px] transition-transform active:scale-95 ${className}`}
    >
      <span className="block h-full w-full rounded-full bg-night-950 p-[2px]">
        <span
          className="grid h-full w-full place-items-center overflow-hidden rounded-full text-dawn-400"
          style={{ background: "radial-gradient(circle at 30% 25%, #2a2d12, #0c0c0b 70%)" }}
        >
          {!userId ? (
            // Pas connecté : silhouette en trait.
            <svg viewBox="0 0 24 24" className="h-[62%] w-[62%] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
              <path d={I.personne} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span
              translate="no"
              className="font-display font-extrabold leading-none [text-shadow:0_0_8px_rgba(202,240,0,.55)]"
              style={{ fontSize: Math.round(taille * 0.42) }}
            >
              {(nom.trim()[0] ?? "?").toUpperCase()}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

/**
 * La barre du haut, toujours visible : le contenu défile dessous et s'efface
 * dans un fondu (nuit, ou crème sur les pages claires). À gauche le bouton
 * profil et le titre ; sur l'accueil, la date, « Bonjour, Prénom » et la
 * flamme de la série avec Jésus.
 */
export function BarreHaut() {
  const pathname = (usePathname() ?? "").replace(/\/$/, "") || "/";
  const titre = PAGES_BARRE[pathname];
  const { profile } = useAuth();
  const eng = useEngagement();
  const langue = useLangue();
  const [heure, setHeure] = useState<number | null>(null);
  useEffect(() => setHeure(new Date().getHours()), [pathname]);
  // Le fondu prend la teinte de ce qui défile dessous (pages claires ou
  // sombres, héros photo…) : on regarde la couleur juste sous la barre.
  const [clair, setClair] = useState(PAGES_CLAIRES.has(pathname));
  useEffect(() => {
    if (titre === undefined) return;
    setClair(PAGES_CLAIRES.has(pathname));
    let attente = 0;
    const mesurer = () => {
      attente = 0;
      const y = Math.round((barreRef.current?.getBoundingClientRect().bottom ?? 60) + 14);
      // Trois points (gauche, centre, droite) : la majorité l'emporte.
      const votes = [0.15, 0.5, 0.85]
        .map((f) => {
          const x = Math.round(window.innerWidth * f);
          return teinteSous(document.elementFromPoint(x, y) as HTMLElement | null, x, y);
        })
        .filter((v): v is boolean => v !== null);
      if (votes.length) setClair(votes.filter(Boolean).length * 2 > votes.length);
    };
    const planifier = () => {
      if (!attente) attente = requestAnimationFrame(mesurer);
    };
    const t1 = setTimeout(mesurer, 400);
    const t2 = setTimeout(mesurer, 1500);
    window.addEventListener("scroll", planifier, { passive: true });
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (attente) cancelAnimationFrame(attente);
      window.removeEventListener("scroll", planifier);
    };
  }, [pathname, titre]);
  const barreRef = useRef<HTMLDivElement>(null);
  if (titre === undefined) return null;

  const accueil = pathname === "/devotionnel";
  const prenom = (profile?.pseudo ?? "").trim().split(/\s+/)[0] ?? "";
  const date = new Date()
    .toLocaleDateString(langue === "en" ? "en-US" : langue === "pt" ? "pt-BR" : "fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .toUpperCase();
  const salut = heure !== null && heure >= 18 ? "Bonsoir" : "Bonjour";

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-40">
      {/* Fondu : opaque en haut, transparent en bas, avec un léger flou */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[calc(env(safe-area-inset-top)+5.25rem)] backdrop-blur-md"
        style={{
          background: clair
            ? "linear-gradient(to bottom, rgba(243,243,237,.97) 0%, rgba(243,243,237,.88) 55%, rgba(243,243,237,0) 100%)"
            : "linear-gradient(to bottom, rgb(var(--n-950) / .96) 0%, rgb(var(--n-950) / .8) 55%, rgb(var(--n-950) / 0) 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, #000 62%, transparent)",
          maskImage: "linear-gradient(to bottom, #000 62%, transparent)",
        }}
      />
      <div
        ref={barreRef}
        className="pointer-events-auto relative mx-auto flex h-[calc(env(safe-area-inset-top)+3.75rem)] max-w-lg items-center gap-3 px-4 pt-[env(safe-area-inset-top)]"
      >
        <ProfilBouton />
        {accueil ? (
          <div className="min-w-0 flex-1 leading-tight">
            <p className={`truncate text-[10.5px] font-black tracking-[0.2em] ${clair ? "text-spirit-700" : "text-dawn-400"}`}>{date}</p>
            <p className={`truncate font-display text-[18px] font-extrabold ${clair ? "text-night-900" : "text-cream"}`}>
              {prenom ? (salut === "Bonsoir" ? `Bonsoir, ${prenom}` : `Bonjour, ${prenom}`) : salut}
            </p>
          </div>
        ) : (
          <p className={`min-w-0 flex-1 truncate font-display text-[21px] font-extrabold ${clair ? "text-night-900" : "text-cream"}`}>
            {titre}
          </p>
        )}
        {accueil && eng.ready ? (
          // Flamme de la série : lime une fois la méditation du jour faite.
          <button
            type="button"
            onClick={() => document.getElementById("serie")?.scrollIntoView({ behavior: "smooth", block: "center" })}
            aria-label={`Série de ${eng.streak} jours avec Jésus`}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[14px] font-extrabold backdrop-blur ${
              eng.isCompletedToday
                ? "border-dawn-400/60 bg-night-950/80 text-dawn-400 shadow-[0_0_14px_rgba(202,240,0,.3)]"
                : clair
                  ? "border-night-900/15 bg-white/70 text-night-900/75"
                  : "border-white/15 bg-night-950/50 text-cream/80"
            }`}
          >
            <span className={`h-4 w-4 ${eng.isCompletedToday ? "text-dawn-400" : clair ? "text-night-900/40" : "text-cream/50"}`}>
              <FlameGlyph />
            </span>
            {eng.streak}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Icone({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] shrink-0 fill-none stroke-current" strokeWidth={1.7} aria-hidden>
      <path d={d} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const I = {
  carnet: "M5 4h11l3 3v13H5zM15 4v4h4M8.5 12h7M8.5 15.5h5",
  plans: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  priere: "M12 3.4c-.6 1.1-1.3 2-2.4 3.1L6.3 9.8c-.6.6-.9 1.5-.7 2.3l.8 4A1.8 1.8 0 0 0 8.2 19.5H12ZM12 3.4c.6 1.1 1.3 2 2.4 3.1L17.7 9.8c.6.6.9 1.5.7 2.3l-.8 4A1.8 1.8 0 0 1 15.8 19.5H12Z",
  messages: "M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5",
  formation: "M2 9.5l10-5 10 5-10 5-10-5M5.8 12.4v3.8c0 1.4 2.8 2.8 6.2 2.8s6.2-1.4 6.2-2.8v-3.8M22 9.5v5",
  personne: "M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8h.01M11 12h1v4h1",
  coeur: "M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z",
  reglages:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.07-.4.1-.8.1-1.2z",
  fermer: "M6 6l12 12M18 6L6 18",
  chevron: "M9 6l6 6-6 6",
};

type Ligne = { label: string; icone: string; href?: string; vue?: "espace" | "reglages" };

const MON_ESPACE: Ligne[] = [
  { label: "Mon carnet", icone: I.carnet, href: "/carnet" },
  { label: "Mes plans", icone: I.plans, href: "/plans" },
  { label: "Ma liste de prière", icone: I.priere, vue: "espace" },
  { label: "Messages", icone: I.messages, href: "/messages" },
  { label: "Ma formation", icone: I.formation, href: "/ecole" },
];

const RHEMA: Ligne[] = [
  { label: "À propos", icone: I.info, href: "/a-propos" },
  { label: "Soutenir RHEMA", icone: I.coeur, href: "/don" },
  { label: "Paramètres", icone: I.reglages, vue: "reglages" },
];

export function ProfilMenu() {
  const [ouvert, setOuvert] = useState(false);
  const { userId, profile } = useAuth();
  const [objectif, setObjectif] = useState<ObjectifDon | null>(null);
  const pctObjectif = objectif ? Math.min(100, Math.round((objectif.collecte / objectif.objectif) * 100)) : 0;

  // L'objectif est rechargé à chaque ouverture (il avance à chaque don).
  useEffect(() => {
    if (ouvert) progressionDon().then(setObjectif);
  }, [ouvert]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const ouvrir = () => setOuvert(true);
    window.addEventListener(EVT, ouvrir);
    return () => window.removeEventListener(EVT, ouvrir);
  }, []);

  // Changement de page : le menu se referme.
  useEffect(() => setOuvert(false), [pathname]);

  // Retour Android / Échap : referme le panneau.
  useEffect(() => {
    if (!ouvert) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = prev;
    };
  }, [ouvert]);

  const allerProfil = (vue?: "espace" | "reglages") => {
    try {
      if (vue) sessionStorage.setItem(CLE_VUE_PROFIL, vue);
      else sessionStorage.removeItem(CLE_VUE_PROFIL);
    } catch {
      /* stockage indisponible */
    }
    setOuvert(false);
    if (pathname?.startsWith("/profil")) window.dispatchEvent(new Event(EVT_VUE_PROFIL));
    else router.push("/profil/");
  };

  const ligne = (l: Ligne) => {
    const contenu = (
      <>
        <span className="text-dawn-400">
          <Icone d={l.icone} />
        </span>
        <span className="flex-1 text-[15px] font-semibold text-cream">{l.label}</span>
        <span className="text-cream/30">
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} aria-hidden>
            <path d={I.chevron} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </>
    );
    const cls = "flex w-full items-center gap-3.5 px-1 py-3 text-left active:opacity-70";
    return l.href ? (
      <Link key={l.label} href={l.href} onClick={() => setOuvert(false)} className={cls}>
        {contenu}
      </Link>
    ) : (
      <button key={l.label} type="button" onClick={() => allerProfil(l.vue)} className={cls}>
        {contenu}
      </button>
    );
  };

  const nom = profile?.pseudo ?? "";

  return (
    <AnimatePresence>
      {ouvert ? (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.button
            type="button"
            aria-label="Fermer"
            onClick={() => setOuvert(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.aside
            data-profil-menu-panneau
            className="keep-dark absolute inset-y-0 left-0 flex w-[86%] max-w-[360px] flex-col overflow-y-auto rounded-r-[28px] border-r border-white/10 bg-night-950 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top)+1rem)] text-cream shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, i) => {
              if (i.offset.x < -70 || i.velocity.x < -400) setOuvert(false);
            }}
          >
            {/* Halo lime discret */}
            <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-dawn-400/10 blur-3xl" />

            {/* En-tête : moi */}
            <div className="relative flex items-start gap-3 px-5">
              <button type="button" onClick={() => allerProfil()} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-night-900 text-xl font-bold text-dawn-400 ring-2 ring-dawn-400/70">
                  {!userId ? (
                    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                      <path d={I.personne} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span translate="no" className="font-display">{initials(nom)}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span translate={userId ? "no" : undefined} className="block truncate font-display text-xl font-extrabold leading-tight">
                    {userId ? nom || "RHEMA" : "Bienvenue"}
                  </span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] font-semibold text-dawn-400">
                    {userId ? "Voir mon profil" : "Se connecter"}
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                      <path d={I.chevron} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-cream/80"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2} aria-hidden>
                  <path d={I.fermer} strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Mon espace */}
            <div className="relative mt-6 px-5">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cream/40">Mon espace</p>
              <div className="mt-1 divide-y divide-white/[0.06]">{MON_ESPACE.map(ligne)}</div>
            </div>

            {/* Carte missions → soutien */}
            <div className="relative mt-5 px-4">
              <Link
                href="/don"
                onClick={() => setOuvert(false)}
                className="group block overflow-hidden rounded-3xl border border-dawn-400/30 bg-night-900"
              >
                <div className="relative h-48 overflow-hidden">
                  {/* Photo « fondue » dans la charte : un peu désaturée et assombrie,
                      teinte olive, dégradé vers la carte et titre posé dessus. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(PHOTO_MISSION)}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: "center 30%", filter: "saturate(0.78) contrast(1.08) brightness(0.82)" }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 90% at 85% 0%, rgba(202,240,0,0.16), transparent 55%), linear-gradient(to top, rgb(var(--n-900)) 2%, rgb(var(--n-900) / 0.72) 34%, rgb(var(--n-900) / 0.08) 70%, rgb(var(--n-900) / 0.25))",
                    }}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-night-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-dawn-400 backdrop-blur">
                    Mission
                  </span>
                  <p className="absolute inset-x-4 bottom-2.5 font-display text-[24px] font-extrabold leading-tight text-cream [text-shadow:0_2px_12px_rgba(0,0,0,.55)]">
                    Soutiens la <span className="text-dawn-400">mission</span>
                  </p>
                </div>
                <div className="px-4 pb-4 pt-1.5">
                  <p className="text-[13.5px] leading-relaxed text-cream/70">
                    Donner accès gratuitement à la Parole de Dieu dans toutes les nations, et aider les
                    pays les plus pauvres à travers des missions humanitaires et d&apos;évangélisation.
                  </p>
                  {/* Objectif : la même barre que sur la page Soutien */}
                  {objectif ? (
                    <div className="mt-3">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-cream/45">{objectif.titre}</p>
                        <p className="text-[12px] font-extrabold text-dawn-400">{`${pctObjectif} %`}</p>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#8FB300] to-dawn-400"
                          style={{ width: `${Math.max(pctObjectif, objectif.collecte > 0 ? 3 : 0)}%` }}
                        />
                      </div>
                      <p className="mt-1.5 text-[12px] font-semibold text-cream/60">
                        {`${euros(objectif.collecte)} sur ${euros(objectif.objectif)}`}
                      </p>
                    </div>
                  ) : null}
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-dawn-400 px-4 py-2 text-[13px] font-extrabold text-night-950 transition-transform group-active:scale-95">
                    Je soutiens la mission
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2.4} aria-hidden>
                      <path d={I.chevron} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>

            {/* RHEMA */}
            <div className="relative mt-5 px-5">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cream/40">RHEMA</p>
              <div className="mt-1 divide-y divide-white/[0.06]">{RHEMA.map(ligne)}</div>
            </div>

            <div className="relative mt-auto flex items-center gap-2.5 px-5 pt-6 text-cream/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset("/img/logo-rhema.webp")} alt="" className="h-6 w-6 rounded-md object-contain opacity-70" />
              <span className="text-[12px] font-semibold">RHEMA · Ton temps avec Jésus</span>
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
