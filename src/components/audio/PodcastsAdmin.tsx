"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { isAdminEmail } from "@/lib/community";
import {
  chargerCatalogue,
  notesEmissions,
  PUBLICS,
  creerEmission,
  modifierEmission,
  supprimerEmission,
  reordonnerEmissions,
  envoyerPhotoIntervenant,
  estEmissionDeSecours,
  intervenantsDe,
  joindreNoms,
  uploadPodcast,
  updatePodcast,
  deletePodcast,
  deplacerEpisode,
  notifierNouvelEpisode,
  type AudioTrack,
  type Emission,
  type Intervenant,
  type NoteStats,
} from "@/lib/audio-library";

/**
 * Console d'administration des podcasts (/admin/podcasts) : les émissions
 * (pochette, titre, intervenant, catégorie, description, fiche de
 * l'intervenant, ordre d'affichage) et leurs épisodes (envoi groupé,
 * titres, descriptions, déplacement, suppression, notification).
 * Remplace les fenêtres de saisie successives de la page Écouter.
 */

type Vue = { type: "liste" } | { type: "emission"; id: string } | { type: "nouvelle" };
type Demande = { titre: string; texte: string; bouton: string; danger?: boolean; action: () => Promise<void> | void };

const champ =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2.5 text-[15px] text-cream placeholder:text-cream/35 focus:border-dawn-400/70 focus:outline-none";
const etiquette = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-cream/50";
const carte = "rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5";
const btnPrincipal =
  "inline-flex items-center justify-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 text-sm font-extrabold text-night-950 transition-opacity disabled:opacity-40";
const btnSecondaire =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-cream/85 hover:bg-white/[0.06] disabled:opacity-40";

function dateCourte(iso?: string) {
  return iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";
}

const Icone = {
  retour: <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  haut: <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />,
  bas: <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />,
  image: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M20.5 16l-5-5-8 8.5" strokeLinejoin="round" />
    </>
  ),
  envoi: <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />,
  crayon: <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" strokeLinejoin="round" />,
  poubelle: <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />,
  cloche: <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" strokeLinejoin="round" />,
  micro: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" strokeLinecap="round" />
    </>
  ),
};
const Svg = ({ d, className = "h-4 w-4" }: { d: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.9} aria-hidden>
    {d}
  </svg>
);

export function PodcastsAdmin() {
  const { ready, email } = useAuth();
  const admin = isAdminEmail(email);
  const [emissions, setEmissions] = useState<Emission[] | null>(null);
  const [episodes, setEpisodes] = useState<AudioTrack[]>([]);
  const [vue, setVue] = useState<Vue>({ type: "liste" });
  const [message, setMessage] = useState("");
  const [demande, setDemande] = useState<Demande | null>(null);
  const [notes, setNotes] = useState<Record<string, NoteStats>>({});

  const charger = useCallback(async () => {
    const [c, n] = await Promise.all([chargerCatalogue(), notesEmissions()]);
    setEmissions(c.emissions);
    setEpisodes(c.episodes);
    setNotes(n);
  }, []);

  useEffect(() => {
    if (ready && admin) void charger();
  }, [ready, admin, charger]);

  // Lien direct depuis la page Écouter : /admin/podcasts?e=<émission>
  useEffect(() => {
    try {
      const id = new URLSearchParams(window.location.search).get("e");
      if (id) setVue(id === "nouvelle" ? { type: "nouvelle" } : { type: "emission", id });
    } catch {
      /* ignore */
    }
  }, []);

  const informer = useCallback((m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 2600);
  }, []);

  const categories = useMemo(
    () => [...new Set((emissions ?? []).map((e) => e.category).filter((c): c is string => !!c))],
    [emissions],
  );
  const parEmission = useMemo(() => {
    const m = new Map<string, AudioTrack[]>();
    for (const t of episodes) {
      const k = t.show_id ?? "";
      m.set(k, [...(m.get(k) ?? []), t]);
    }
    return m;
  }, [episodes]);

  if (!ready) return <section className="container-x py-24 text-center text-cream/50">Chargement…</section>;
  if (!admin) {
    return (
      <section className="container-x py-24 text-center">
        <p className="font-display text-2xl font-extrabold">Page introuvable</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Retour à l'accueil
        </Link>
      </section>
    );
  }

  const emissionOuverte = vue.type === "emission" ? emissions?.find((e) => e.id === vue.id) : undefined;

  return (
    <div className="keep-dark min-h-[100svh] bg-night-950 text-cream">
      <section className="sous-barre-app container-x max-w-3xl pb-28 pt-24 sm:pt-28">
        {vue.type === "liste" ? (
          <ListeEmissions
            emissions={emissions}
            notes={notes}
            parEmission={parEmission}
            total={episodes.length}
            onOuvrir={(id) => setVue({ type: "emission", id })}
            onNouvelle={() => setVue({ type: "nouvelle" })}
            onReordonner={async (ids) => {
              setEmissions((prev) => (prev ? ids.map((id) => prev.find((e) => e.id === id)!).filter(Boolean) : prev));
              const ok = await reordonnerEmissions(ids);
              informer(ok ? "Ordre enregistré" : "L'ordre n'a pas pu être enregistré");
            }}
          />
        ) : (
          <>
            <button type="button" onClick={() => setVue({ type: "liste" })} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cream/60 hover:text-cream">
              <Svg d={Icone.retour} /> Toutes les émissions
            </button>
            {vue.type === "nouvelle" ? (
              <FicheEmission
                categories={categories}
                informer={informer}
                onEnregistre={async (id) => {
                  await charger();
                  if (id) setVue({ type: "emission", id });
                }}
              />
            ) : emissionOuverte ? (
              <>
                <FicheEmission key={emissionOuverte.id} emission={emissionOuverte} categories={categories} informer={informer} onEnregistre={charger} />
                <Episodes
                  emission={emissionOuverte}
                  emissions={emissions ?? []}
                  episodes={parEmission.get(emissionOuverte.id) ?? []}
                  informer={informer}
                  demander={setDemande}
                  recharger={charger}
                />
                {!estEmissionDeSecours(emissionOuverte.id) ? (
                  <div className={`${carte} mt-5 border-red-400/20`}>
                    <p className="font-bold">Supprimer l'émission</p>
                    <p className="mt-1 text-sm text-cream/55">Ses épisodes restent en ligne : range-les d'abord dans une autre émission si besoin.</p>
                    <button
                      type="button"
                      onClick={() =>
                        setDemande({
                          titre: `Supprimer « ${emissionOuverte.title} » ?`,
                          texte: "L'émission disparaît de l'app. Cette action est définitive.",
                          bouton: "Supprimer l'émission",
                          danger: true,
                          action: async () => {
                            const ok = await supprimerEmission(emissionOuverte.id);
                            informer(ok ? "Émission supprimée" : "La suppression n'a pas marché");
                            setVue({ type: "liste" });
                            await charger();
                          },
                        })
                      }
                      className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-400/40 px-4 py-2 text-sm font-semibold text-red-300"
                    >
                      <Svg d={Icone.poubelle} /> Supprimer
                    </button>
                  </div>
                ) : null}
              </>
            ) : emissions === null ? (
              <p className="text-cream/50">Chargement…</p>
            ) : (
              <p className="text-cream/60">Cette émission n'existe plus.</p>
            )}
          </>
        )}
      </section>

      {message ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[120] flex justify-center px-4">
          <span className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-night-950 shadow-2xl">{message}</span>
        </div>
      ) : null}

      {demande ? <Confirmation demande={demande} fermer={() => setDemande(null)} /> : null}
    </div>
  );
}

/* ————————————————— Liste des émissions ————————————————— */

function ListeEmissions({
  emissions,
  notes,
  parEmission,
  total,
  onOuvrir,
  onNouvelle,
  onReordonner,
}: {
  emissions: Emission[] | null;
  notes: Record<string, NoteStats>;
  parEmission: Map<string, AudioTrack[]>;
  total: number;
  onOuvrir: (id: string) => void;
  onNouvelle: () => void;
  onReordonner: (ids: string[]) => void;
}) {
  const deplacer = (i: number, sens: -1 | 1) => {
    if (!emissions) return;
    const ids = emissions.map((e) => e.id);
    const j = i + sens;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    onReordonner(ids);
  };
  return (
    <>
      <Link href="/admin" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cream/60 hover:text-cream">
        <Svg d={Icone.retour} /> Espace admin
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-dawn-400">Administration</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Podcasts</h1>
          <p className="mt-1 text-sm text-cream/55">
            {emissions ? `${emissions.length} émission${emissions.length > 1 ? "s" : ""} · ${total} épisode${total > 1 ? "s" : ""}` : "Chargement…"}
          </p>
        </div>
        <button type="button" onClick={onNouvelle} className={btnPrincipal}>
          <Svg d={Icone.plus} /> Nouvelle émission
        </button>
      </div>

      <ul className="mt-6 space-y-3">
        {(emissions ?? []).map((e, i) => {
          const eps = parEmission.get(e.id) ?? [];
          const dernier = eps[0]?.created_at;
          return (
            <li key={e.id} className={`${carte} flex items-center gap-4 p-4`}>
              <button type="button" onClick={() => onOuvrir(e.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                <Pochette url={e.cover} taille={72} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-lg font-extrabold">{e.title}</span>
                  <span className="block truncate text-sm text-cream/60">
                    {[e.author, e.category].filter(Boolean).join(" · ") || "Sans intervenant"}
                  </span>
                  <span className="mt-1 block text-xs text-cream/45">
                    {eps.length} épisode{eps.length > 1 ? "s" : ""}
                    {dernier ? ` · dernier le ${dateCourte(dernier)}` : ""}
                    {notes[e.id]?.cnt ? ` · ${notes[e.id].avg.toFixed(1).replace(".", ",")} sur 5 (${notes[e.id].cnt} note${notes[e.id].cnt > 1 ? "s" : ""})` : ""}
                  </span>
                  {e.publics?.length ? (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {e.publics.map((p) => (
                        <span key={p} className="rounded-full border border-dawn-400/35 px-2 py-0.5 text-[10.5px] font-bold text-dawn-300">
                          {PUBLICS.find(([k]) => k === p)?.[1] ?? p}
                        </span>
                      ))}
                    </span>
                  ) : null}
                </span>
              </button>
              <span className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-cream/70 disabled:opacity-25">
                  <Svg d={Icone.haut} />
                </button>
                <button
                  type="button"
                  onClick={() => deplacer(i, 1)}
                  disabled={i === (emissions?.length ?? 1) - 1}
                  aria-label="Descendre"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-cream/70 disabled:opacity-25"
                >
                  <Svg d={Icone.bas} />
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      {emissions && emissions.length > 1 ? <p className="mt-3 text-xs text-cream/40">Les flèches règlent l'ordre d'affichage dans l'app.</p> : null}
    </>
  );
}

function Pochette({ url, taille }: { url?: string | null; taille: number }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="shrink-0 rounded-2xl object-cover" style={{ width: taille, height: taille }} />
  ) : (
    <span className="grid shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-cream/30" style={{ width: taille, height: taille }}>
      <Svg d={Icone.micro} className="h-7 w-7" />
    </span>
  );
}

/* ————————————————— Infos de l'émission ————————————————— */

function FicheEmission({
  emission,
  categories,
  informer,
  onEnregistre,
}: {
  emission?: Emission;
  categories: string[];
  informer: (m: string) => void;
  onEnregistre: (id?: string | null) => void | Promise<void>;
}) {
  const [titre, setTitre] = useState(emission?.title ?? "");
  const [intervenants, setIntervenants] = useState<Brouillon[]>(() => {
    const l = intervenantsDe(emission).map((i, k) => versBrouillon(i, k));
    return l.length ? l : [versBrouillon({ nom: emission ? "" : "Pasteur Jack Brunet" }, 0, true)];
  });
  const [touche, setTouche] = useState(false);
  const [categorie, setCategorie] = useState(emission?.category ?? "");
  const [publics, setPublics] = useState<string[]>(emission?.publics ?? []);
  const publicsModifies = [...publics].sort().join() !== [...(emission?.publics ?? [])].sort().join();
  const [description, setDescription] = useState(emission?.description ?? "");
  const [pochette, setPochette] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(emission?.cover ?? null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const secours = emission ? estEmissionDeSecours(emission.id) : false;

  const modifie =
    !emission ||
    touche ||
    pochette !== null ||
    titre !== emission.title ||
    categorie !== (emission.category ?? "") ||
    publicsModifies ||
    description !== (emission.description ?? "");
  const majIntervenant = (cle: string, patch: Partial<Brouillon>) => {
    setTouche(true);
    setIntervenants((l) => l.map((i) => (i.cle === cle ? { ...i, ...patch } : i)));
  };

  async function enregistrer() {
    if (!titre.trim()) return informer("Donne un titre à l'émission");
    setBusy(true);
    // Photos choisies : envoyées d'abord, puis la liste propre (sans les vides).
    const liste: Intervenant[] = [];
    for (const i of intervenants) {
      if (!i.nom.trim()) continue;
      const photo = i.fichier ? (await envoyerPhotoIntervenant(i.fichier)) ?? i.photo : i.photo;
      liste.push({
        nom: i.nom.trim(),
        role: i.role?.trim() || null,
        bio: i.bio?.trim() || null,
        photo: photo || null,
        instagram: i.instagram?.trim() || null,
        liens: [
          { label: "YouTube", url: i.youtube.trim() },
          { label: "TikTok", url: i.tiktok.trim() },
          { label: "Facebook", url: i.facebook.trim() },
          { label: "Boutique", url: i.boutique.trim() },
          { label: "Site web", url: i.site.trim() },
        ].filter((l) => l.url),
      });
    }
    const premier = liste[0];
    const base = {
      title: titre.trim(),
      author: joindreNoms(liste.map((i) => i.nom)) || null,
      category: categorie.trim() || null,
      description: description.trim() || null,
    };
    // Fiche du premier intervenant aussi dans les anciens champs (anciennes versions de l'app).
    const fiche = {
      author_role: premier?.role ?? null,
      author_bio: premier?.bio ?? null,
      author_photo: premier?.photo ?? null,
      author_instagram: premier?.instagram ?? null,
      author_links: premier?.liens ?? [],
    };
    let ok: boolean;
    let id: string | null = emission?.id ?? null;
    let sansListe = false;
    if (emission) {
      ok = await modifierEmission(emission.id, { ...base, ...fiche, intervenants: liste }, pochette);
      if (!ok) {
        sansListe = true;
        ok = await modifierEmission(emission.id, { ...base, ...fiche }, pochette);
      }
    } else {
      id = await creerEmission({ ...base, ...fiche, intervenants: liste }, pochette);
      if (!id) {
        sansListe = true;
        id = await creerEmission(base, pochette);
      }
      ok = !!id;
    }
    let publicsOk = true;
    if (ok && id && publicsModifies) publicsOk = await modifierEmission(id, { publics });
    setBusy(false);
    if (!ok) return informer(emission ? "Enregistrement impossible" : "Création impossible : as-tu exécuté le SQL des émissions ?");
    if (!publicsOk) informer("Enregistré, sauf le public visé : exécute le SQL des publics et des notes");
    if (publicsOk) informer(
      sansListe && liste.length > 1
        ? "Enregistré, mais un seul intervenant : exécute le SQL des intervenants multiples"
        : emission
          ? "Émission enregistrée"
          : "Émission créée",
    );
    setPochette(null);
    setTouche(false);
    setIntervenants(liste.length ? liste.map((i, k) => versBrouillon(i, k)) : intervenants);
    await onEnregistre(id);
  }

  return (
    <div className={carte}>
      <h2 className="font-display text-xl font-extrabold">{emission ? "L'émission" : "Nouvelle émission"}</h2>
      {secours ? (
        <p className="mt-2 rounded-2xl bg-dawn-400/10 p-3 text-sm text-dawn-300">
          Cette émission par défaut ne se modifie pas : exécute d'abord le SQL des émissions dans Supabase.
        </p>
      ) : null}
      <div className="mt-4 flex flex-col gap-5 sm:flex-row">
        <div className="shrink-0">
          <span className={etiquette}>Pochette</span>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="group relative block h-40 w-40 overflow-hidden rounded-3xl border border-dashed border-white/20 bg-white/[0.04]"
          >
            {apercu ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apercu} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="grid h-full place-items-center text-cream/40">
                <Svg d={Icone.image} className="h-8 w-8" />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1.5 text-center text-xs font-bold text-cream opacity-90">
              {apercu ? "Changer" : "Ajouter une image"}
            </span>
          </button>
          <p className="mt-1.5 w-40 text-[11px] leading-snug text-cream/40">Image carrée, 1400 × 1400 conseillé. Compressée automatiquement.</p>
          <input
            ref={ref}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setPochette(f);
              setApercu(URL.createObjectURL(f));
            }}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <label className="block">
            <span className={etiquette}>Titre</span>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={80} placeholder="Ex. RHEMA du jour" className={champ} />
          </label>
          <div>
            <label className="block">
              <span className={etiquette}>Catégorie</span>
              <input value={categorie} onChange={(e) => setCategorie(e.target.value)} list="categories-podcast" maxLength={40} placeholder="Ex. Enseignements" className={champ} />
              <datalist id="categories-podcast">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
          </div>
          <div>
            <span className={etiquette}>Pour qui ?</span>
            <div className="flex flex-wrap gap-2">
              {PUBLICS.map(([k, l]) => {
                const actif = publics.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => setPublics((p) => (actif ? p.filter((x) => x !== k) : [...p, k]))}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                      actif ? "bg-dawn-400 text-night-950" : "border border-white/15 text-cream/75"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <span className="mt-1 block text-[11px] text-cream/40">Plusieurs choix possibles. Sert de filtre « Pour qui » dans l'app.</span>
          </div>
          <label className="block">
            <span className={etiquette}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={600}
              rows={4}
              placeholder="En deux ou trois phrases : de quoi parle l'émission, pour qui, à quel rythme."
              className={`${champ} resize-y`}
            />
            <span className="mt-1 block text-right text-[11px] text-cream/35">{description.length}/600</span>
          </label>
        </div>
      </div>
      <div className="mt-6 border-t border-white/[0.08] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-extrabold">Intervenants</p>
            <p className="text-sm text-cream/55">Chacun a sa fiche (photo, rôle, présentation, liens), ouverte au toucher de son nom.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTouche(true);
              setIntervenants((l) => [...l, versBrouillon({ nom: "" }, Date.now(), true)]);
            }}
            className={btnSecondaire}
          >
            <Svg d={Icone.plus} /> Ajouter un intervenant
          </button>
        </div>
        <ul className="mt-4 space-y-3">
          {intervenants.map((i, k) => (
            <CarteIntervenant
              key={i.cle}
              i={i}
              premier={k === 0}
              dernier={k === intervenants.length - 1}
              maj={(patch) => majIntervenant(i.cle, patch)}
              deplacer={(sens) => {
                setTouche(true);
                setIntervenants((l) => {
                  const n = [...l];
                  const j = k + sens;
                  if (j < 0 || j >= n.length) return l;
                  [n[k], n[j]] = [n[j], n[k]];
                  return n;
                });
              }}
              retirer={() => {
                setTouche(true);
                setIntervenants((l) => l.filter((x) => x.cle !== i.cle));
              }}
            />
          ))}
        </ul>
        {!intervenants.length ? <p className="mt-3 text-sm text-cream/45">Aucun intervenant : l'émission s'affichera sans nom.</p> : null}
      </div>

      <div className="mt-5 flex justify-end">
        <button type="button" onClick={enregistrer} disabled={busy || !modifie || secours} className={btnPrincipal}>
          {busy ? "Enregistrement…" : emission ? "Enregistrer" : "Créer l'émission"}
        </button>
      </div>
    </div>
  );
}

/* ————————————————— Intervenants ————————————————— */

type Brouillon = Intervenant & {
  cle: string;
  youtube: string;
  tiktok: string;
  facebook: string;
  boutique: string;
  site: string;
  fichier?: File;
  apercu?: string | null;
  ouvert: boolean;
};

function versBrouillon(i: Intervenant, k: number, ouvert = false): Brouillon {
  const lien = (label: string) => i.liens?.find((l) => l.label === label)?.url ?? "";
  return {
    ...i,
    cle: `${k}-${i.nom}-${Math.random().toString(36).slice(2, 6)}`,
    youtube: lien("YouTube"),
    tiktok: lien("TikTok"),
    facebook: lien("Facebook"),
    boutique: lien("Boutique"),
    site: lien("Site web"),
    apercu: i.photo ?? null,
    ouvert,
  };
}

function CarteIntervenant({
  i,
  premier,
  dernier,
  maj,
  deplacer,
  retirer,
}: {
  i: Brouillon;
  premier: boolean;
  dernier: boolean;
  maj: (patch: Partial<Brouillon>) => void;
  deplacer: (sens: -1 | 1) => void;
  retirer: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <li className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => ref.current?.click()} aria-label="Photo" className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-dashed border-white/20 bg-white/[0.04]">
          {i.apercu ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={i.apercu} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-cream/40">
              <Svg d={Icone.image} />
            </span>
          )}
        </button>
        <input
          value={i.nom}
          onChange={(e) => maj({ nom: e.target.value })}
          maxLength={60}
          placeholder="Nom de l'intervenant"
          className={`${champ} min-w-0 flex-1`}
        />
        <span className="flex shrink-0 items-center">
          <button type="button" onClick={() => deplacer(-1)} disabled={premier} aria-label="Monter" className="grid h-9 w-8 place-items-center text-cream/60 disabled:opacity-20">
            <Svg d={Icone.haut} />
          </button>
          <button type="button" onClick={() => deplacer(1)} disabled={dernier} aria-label="Descendre" className="grid h-9 w-8 place-items-center text-cream/60 disabled:opacity-20">
            <Svg d={Icone.bas} />
          </button>
          <button type="button" onClick={() => maj({ ouvert: !i.ouvert })} aria-label={i.ouvert ? "Replier la fiche" : "Ouvrir la fiche"} className="ml-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-cream/80">
            Fiche
          </button>
          <button type="button" onClick={retirer} aria-label="Retirer l'intervenant" className="grid h-9 w-9 place-items-center text-red-300/80">
            <Svg d={Icone.poubelle} />
          </button>
        </span>
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) maj({ fichier: f, apercu: URL.createObjectURL(f) });
          }}
        />
      </div>
      {i.ouvert ? (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className={etiquette}>Rôle</span>
            <input value={i.role ?? ""} onChange={(e) => maj({ role: e.target.value })} maxLength={60} placeholder="Ex. Pasteure, auteur, invité" className={champ} />
          </label>
          <label className="block">
            <span className={etiquette}>Présentation</span>
            <textarea value={i.bio ?? ""} onChange={(e) => maj({ bio: e.target.value })} rows={3} maxLength={500} className={`${champ} resize-y`} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["Instagram", "instagram"],
                ["YouTube", "youtube"],
                ["TikTok", "tiktok"],
                ["Facebook", "facebook"],
                ["Boutique", "boutique"],
                ["Site web", "site"],
              ] as const
            ).map(([l, k]) => (
              <label key={k} className="block">
                <span className={etiquette}>{l}</span>
                <input
                  value={(i[k] as string | null | undefined) ?? ""}
                  onChange={(e) => maj({ [k]: e.target.value } as Partial<Brouillon>)}
                  type="url"
                  inputMode="url"
                  placeholder="https://…"
                  className={champ}
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-cream/40">Photo : touche le rond à gauche du nom. Sans photo, la pochette est utilisée s'il n'y a qu'un intervenant.</p>
        </div>
      ) : null}
    </li>
  );
}

/* ————————————————— Épisodes ————————————————— */

function Episodes({
  emission,
  emissions,
  episodes,
  informer,
  demander,
  recharger,
}: {
  emission: Emission;
  emissions: Emission[];
  episodes: AudioTrack[];
  informer: (m: string) => void;
  demander: (d: Demande) => void;
  recharger: () => Promise<void>;
}) {
  const [recherche, setRecherche] = useState("");
  const [envoi, setEnvoi] = useState<{ fait: number; total: number } | null>(null);
  const [edition, setEdition] = useState<string | null>(null);
  const [choisis, setChoisis] = useState<Set<string>>(new Set());
  const [annonce, setAnnonce] = useState<{ id: string; texte: string } | null>(null);
  const [survol, setSurvol] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const autres = emissions.filter((e) => e.id !== emission.id && !estEmissionDeSecours(e.id));

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return [...episodes]
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
      .filter((t) => !q || t.title.toLowerCase().includes(q) || (t.description ?? "").toLowerCase().includes(q));
  }, [episodes, recherche]);

  async function envoyer(fichiers: File[]) {
    const audios = fichiers.filter((f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|aac|ogg)$/i.test(f.name));
    if (!audios.length) return informer("Choisis des fichiers audio");
    // Ordre des noms (« 001 - … ») : le dernier envoyé apparaît en premier.
    audios.sort((a, b) => a.name.localeCompare(b.name, "fr", { numeric: true }));
    setEnvoi({ fait: 0, total: audios.length });
    const crees: { id: string; title: string }[] = [];
    for (let i = 0; i < audios.length; i++) {
      const ep = await uploadPodcast(audios[i], emission.id);
      if (ep) crees.push(ep);
      setEnvoi({ fait: i + 1, total: audios.length });
    }
    setEnvoi(null);
    await recharger();
    const rates = audios.length - crees.length;
    informer(`${crees.length} épisode${crees.length > 1 ? "s" : ""} ajouté${crees.length > 1 ? "s" : ""}${rates ? ` · ${rates} en échec` : ""}`);
    if (crees.length) {
      const quoi = crees.length > 1 ? `${crees.length} nouveaux épisodes sont en ligne` : `« ${crees[0].title} » est en ligne`;
      setAnnonce({ id: crees[crees.length - 1].id, texte: `${quoi} dans « ${emission.title} ». Bonne écoute !` });
    }
  }

  async function prevenir() {
    if (!annonce?.texte.trim()) return;
    const n = await notifierNouvelEpisode(annonce.texte.trim(), `/ecouter/?e=${annonce.id}`);
    informer(n === null ? "Notification non envoyée (SQL migration-podcasts-plus.sql ?)" : `Notification envoyée à ${n} membre${n > 1 ? "s" : ""}`);
    setAnnonce(null);
  }

  const basculer = (id: string) =>
    setChoisis((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  async function deplacerChoisis(vers: string) {
    const cible = emissions.find((e) => e.id === vers);
    const ids = [...choisis];
    const res = await Promise.all(ids.map((id) => deplacerEpisode(id, vers)));
    setChoisis(new Set());
    informer(`${res.filter(Boolean).length} épisode${ids.length > 1 ? "s" : ""} déplacé${ids.length > 1 ? "s" : ""} vers « ${cible?.title ?? ""} »`);
    await recharger();
  }

  return (
    <div className={`${carte} mt-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-extrabold">
          Épisodes <span className="text-cream/45">({episodes.length})</span>
        </h2>
        <button type="button" onClick={() => ref.current?.click()} disabled={!!envoi} className={btnPrincipal}>
          <Svg d={Icone.envoi} /> Ajouter des épisodes
        </button>
        <input
          ref={ref}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const f = Array.from(e.target.files ?? []);
            e.target.value = "";
            void envoyer(f);
          }}
        />
      </div>

      {/* Zone de dépôt (ordinateur) + progression */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSurvol(true);
        }}
        onDragLeave={() => setSurvol(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSurvol(false);
          void envoyer(Array.from(e.dataTransfer.files));
        }}
        className={`mt-4 rounded-2xl border border-dashed p-4 text-center text-sm transition-colors ${
          survol ? "border-dawn-400 bg-dawn-400/10 text-dawn-300" : "border-white/15 text-cream/50"
        }`}
      >
        {envoi ? (
          <div>
            <p className="font-semibold text-cream">
              Envoi {envoi.fait}/{envoi.total}… garde cette page ouverte
            </p>
            <div className="mx-auto mt-2 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
              <span className="block h-full rounded-full bg-dawn-400 transition-all" style={{ width: `${(envoi.fait / envoi.total) * 100}%` }} />
            </div>
          </div>
        ) : (
          <>
            Glisse tes MP3 ici, ou touche « Ajouter des épisodes ». Le titre vient du nom du fichier, l'audio est compressé automatiquement.
          </>
        )}
      </div>

      {annonce ? (
        <div className="mt-4 rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.07] p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-dawn-300">
            <Svg d={Icone.cloche} /> Prévenir les membres ?
          </p>
          <textarea value={annonce.texte} onChange={(e) => setAnnonce({ ...annonce, texte: e.target.value })} rows={2} className={`${champ} mt-2`} />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => setAnnonce(null)} className={btnSecondaire}>
              Plus tard
            </button>
            <button type="button" onClick={prevenir} className={btnPrincipal}>
              Envoyer la notification
            </button>
          </div>
        </div>
      ) : null}

      {episodes.length > 5 ? (
        <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un épisode…" className={`${champ} mt-4`} />
      ) : null}

      {/* Actions groupées */}
      {choisis.size ? (
        <div className="sticky top-20 z-10 mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-cream p-3 text-night-950 shadow-2xl">
          <span className="mr-auto text-sm font-bold">
            {choisis.size} sélectionné{choisis.size > 1 ? "s" : ""}
          </span>
          {autres.length ? (
            <select
              defaultValue=""
              onChange={(e) => e.target.value && void deplacerChoisis(e.target.value)}
              className="rounded-full border border-night-900/20 bg-white px-3 py-2 text-sm font-semibold"
            >
              <option value="">Déplacer vers…</option>
              {autres.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            onClick={() =>
              demander({
                titre: `Supprimer ${choisis.size} épisode${choisis.size > 1 ? "s" : ""} ?`,
                texte: "Les fichiers audio sont supprimés définitivement.",
                bouton: "Supprimer",
                danger: true,
                action: async () => {
                  const ids = new Set(choisis);
                  await Promise.all(episodes.filter((t) => ids.has(t.id)).map((t) => deletePodcast(t.id, t.path)));
                  setChoisis(new Set());
                  informer("Épisodes supprimés");
                  await recharger();
                },
              })
            }
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white"
          >
            Supprimer
          </button>
          <button type="button" onClick={() => setChoisis(new Set())} className="rounded-full px-3 py-2 text-sm font-semibold text-night-900/60">
            Annuler
          </button>
        </div>
      ) : null}

      <ul className="mt-4 divide-y divide-white/[0.06]">
        {liste.map((t) => (
          <li key={t.id} className="py-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={choisis.has(t.id)}
                onChange={() => basculer(t.id)}
                aria-label={`Sélectionner ${t.title}`}
                className="mt-1.5 h-4 w-4 shrink-0 accent-[#CAF000]"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug">
                  {t.numero ? <span className="mr-1.5 text-cream/40">#{t.numero}</span> : null}
                  {t.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-cream/45">
                  {dateCourte(t.created_at)}
                  {t.description ? ` · ${t.description}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => setEdition(edition === t.id ? null : t.id)} aria-label="Modifier" className="grid h-9 w-9 place-items-center rounded-full text-cream/70 hover:bg-white/[0.06]">
                  <Svg d={Icone.crayon} />
                </button>
                <button
                  type="button"
                  onClick={() => setAnnonce({ id: t.id, texte: `« ${t.title} » est en ligne dans « ${emission.title} ». Bonne écoute !` })}
                  aria-label="Prévenir les membres"
                  className="grid h-9 w-9 place-items-center rounded-full text-cream/70 hover:bg-white/[0.06]"
                >
                  <Svg d={Icone.cloche} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    demander({
                      titre: `Supprimer « ${t.title} » ?`,
                      texte: "Le fichier audio est supprimé définitivement.",
                      bouton: "Supprimer",
                      danger: true,
                      action: async () => {
                        await deletePodcast(t.id, t.path);
                        informer("Épisode supprimé");
                        await recharger();
                      },
                    })
                  }
                  aria-label="Supprimer"
                  className="grid h-9 w-9 place-items-center rounded-full text-red-300/80 hover:bg-white/[0.06]"
                >
                  <Svg d={Icone.poubelle} />
                </button>
              </div>
            </div>
            {edition === t.id ? (
              <EditionEpisode
                episode={t}
                autres={autres}
                fermer={() => setEdition(null)}
                informer={informer}
                recharger={recharger}
              />
            ) : null}
          </li>
        ))}
      </ul>
      {!liste.length ? <p className="py-6 text-center text-sm text-cream/45">{recherche ? "Aucun épisode trouvé." : "Aucun épisode pour l'instant."}</p> : null}
    </div>
  );
}

function EditionEpisode({
  episode,
  autres,
  fermer,
  informer,
  recharger,
}: {
  episode: AudioTrack;
  autres: Emission[];
  fermer: () => void;
  informer: (m: string) => void;
  recharger: () => Promise<void>;
}) {
  const [titre, setTitre] = useState(episode.title);
  const [description, setDescription] = useState(episode.description ?? "");
  const [vers, setVers] = useState("");
  const [busy, setBusy] = useState(false);

  async function enregistrer() {
    if (!titre.trim()) return informer("Le titre ne peut pas être vide");
    setBusy(true);
    let ok = await updatePodcast(episode.id, { title: titre.trim(), description: description.trim() || null });
    if (ok && vers) ok = await deplacerEpisode(episode.id, vers);
    informer(ok ? "Épisode enregistré" : "Enregistrement impossible");
    setBusy(false);
    if (ok) fermer();
    await recharger();
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-white/[0.04] p-4">
      <label className="block">
        <span className={etiquette}>Titre</span>
        <input value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={120} className={champ} />
      </label>
      <label className="block">
        <span className={etiquette}>Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={1000} className={`${champ} resize-y`} />
      </label>
      {autres.length ? (
        <label className="block">
          <span className={etiquette}>Émission</span>
          <select value={vers} onChange={(e) => setVers(e.target.value)} className={champ}>
            <option value="">Garder dans cette émission</option>
            {autres.map((e) => (
              <option key={e.id} value={e.id}>
                Déplacer vers « {e.title} »
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={fermer} className={btnSecondaire}>
          Annuler
        </button>
        <button type="button" onClick={enregistrer} disabled={busy} className={btnPrincipal}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

/* ————————————————— Confirmation ————————————————— */

function Confirmation({ demande, fermer }: { demande: Demande; fermer: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={demande.titre}>
      <button type="button" aria-label="Fermer" onClick={fermer} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm rounded-t-[2rem] border border-white/10 bg-night-900 p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-cream sm:rounded-[2rem] sm:pb-6">
        <p className="font-display text-lg font-extrabold">{demande.titre}</p>
        <p className="mt-1.5 text-sm text-cream/60">{demande.texte}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={fermer} className={`${btnSecondaire} flex-1`}>
            Annuler
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await demande.action();
              setBusy(false);
              fermer();
            }}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-extrabold disabled:opacity-50 ${demande.danger ? "bg-red-600 text-white" : "bg-dawn-400 text-night-950"}`}
          >
            {busy ? "…" : demande.bouton}
          </button>
        </div>
      </div>
    </div>
  );
}
