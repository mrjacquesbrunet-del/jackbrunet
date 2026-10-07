"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { bibleHref } from "@/lib/bible-ref";
import { FicheSheet, Medaillon, getFiches, type FichesData } from "@/components/bible/FichesChapitre";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";
import { getGenealogie, type ArbreDef, type Genealogie, type LigneeDef, type Personne } from "@/lib/genealogie";
import { getIndex } from "@/lib/bible-client";

/**
 * ARBRES GÉNÉALOGIQUES — page cachée de l'Étude biblique (section Explorer).
 *
 * - Accueil : recherche d'une personne, arbres prédéfinis, généalogies de Jésus.
 * - Arbre : dessin de haut en bas (parents → enfants), défilement libre, zoom.
 * - Vue centrée (?id=…) : grands-parents, parents, frères et sœurs, enfants
 *   et petits-enfants d'une personne. C'est la cible du bouton « Voir dans
 *   l'arbre » des fiches.
 * Tout est relié : un tap sur une personne montre ses liens, sa fiche, et
 * permet de recentrer l'arbre sur elle.
 */

type Vue = { mode: "accueil" } | { mode: "arbre"; id: string } | { mode: "lignee"; id: string } | { mode: "centre"; id: string };

const NW = 100; // largeur d'une case
const GAP = 6; // écart entre deux cases
const RH = 178; // hauteur d'une génération
const PAD = 24;

const court = (n: string) => n.replace(/\s*\(.*\)$/, "");

function versUrl(v: Vue) {
  if (v.mode === "arbre") return `?arbre=${v.id}`;
  if (v.mode === "lignee") return `?lignee=${v.id}`;
  if (v.mode === "centre") return `?id=${v.id}`;
  return window.location.pathname;
}

/** Les personnes autour de quelqu'un : 2 générations au-dessus, 2 en dessous. */
function entourage(G: Genealogie, id: string): { racine: string; noeuds: Set<string> } {
  const P = G.personnes;
  const p1 = P[id]?.p?.[0];
  const p2 = p1 ? P[p1]?.p?.[0] : undefined;
  const racine = p2 ?? p1 ?? id;
  const S = new Set<string>([racine]);
  for (const e of P[racine]?.e ?? []) S.add(e);
  if (p1) for (const e of P[p1]?.e ?? []) S.add(e);
  S.add(id);
  for (const e of P[id]?.e ?? []) {
    S.add(e);
    for (const pe of P[e]?.e ?? []) S.add(pe);
  }
  return { racine, noeuds: S };
}

type Boite = { id: string; x: number; y: number; niveau: number; enfants: Boite[]; w: number };

/** Mise en page « arbre bien rangé » : chaque parent centré sur ses enfants. */
function disposer(G: Genealogie, racine: string, S: Set<string>) {
  const P = G.personnes;
  const place = new Set<string>();
  // Un enfant se range sous son père s'il est dans l'arbre, sinon sous sa mère.
  const parentDe = (e: string) => (P[e]?.p ?? []).find((p) => S.has(p));
  function mesurer(id: string, niveau: number): Boite {
    place.add(id);
    const enfants = (P[id]?.e ?? [])
      .filter((e) => S.has(e) && !place.has(e) && parentDe(e) === id)
      .map((e) => mesurer(e, niveau + 1));
    const total = enfants.reduce((s, b) => s + b.w, 0) + GAP * Math.max(0, enfants.length - 1);
    return { id, x: 0, y: niveau * RH, niveau, enfants, w: Math.max(NW, total) };
  }
  const arbre = mesurer(racine, 0);
  function placer(b: Boite, x0: number) {
    if (!b.enfants.length) {
      b.x = x0 + b.w / 2;
      return;
    }
    const total = b.enfants.reduce((s, c) => s + c.w, 0) + GAP * (b.enfants.length - 1);
    let x = x0 + (b.w - total) / 2;
    for (const c of b.enfants) {
      placer(c, x);
      x += c.w + GAP;
    }
    b.x = (b.enfants[0].x + b.enfants[b.enfants.length - 1].x) / 2;
  }
  placer(arbre, PAD);
  const toutes: Boite[] = [];
  const parcourir = (b: Boite) => {
    toutes.push(b);
    b.enfants.forEach(parcourir);
  };
  parcourir(arbre);
  const niveaux = Math.max(...toutes.map((b) => b.niveau)) + 1;
  return { arbre, toutes, largeur: arbre.w + PAD * 2, hauteur: niveaux * RH + PAD };
}

function Avatar({ p, fiches, size = 56 }: { p: Personne; fiches: FichesData | null; size?: number }) {
  const f = p.f ? fiches?.fiches[p.f] : undefined;
  if (f && p.f) {
    return (
      <span className="block" style={{ width: size, height: size }}>
        <Medaillon id={p.f} fiche={f} size="h-full w-full" />
      </span>
    );
  }
  const grad = p.s === "f" ? "linear-gradient(150deg,#7a4a63,#4d2c3e)" : "linear-gradient(150deg,#5b5a45,#38372a)";
  return (
    <span
      className="grid place-items-center rounded-full border border-white/15 font-display font-extrabold text-cream/85 shadow-card"
      style={{ width: size, height: size, background: grad, fontSize: size * 0.38 }}
    >
      {court(p.n).replace(/^(La |Le |Les |Ses )/, "").charAt(0).toUpperCase()}
    </span>
  );
}

function Anneaux({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 fill-none stroke-current`} strokeWidth={2}>
      <circle cx="9" cy="12" r="5" />
      <circle cx="15" cy="12" r="5" />
    </svg>
  );
}

function Retour({ onClick, label }: { onClick?: () => void; label: string }) {
  const icone = (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2}>
      <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const cls = "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-cream/80";
  return onClick ? (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {icone}
    </button>
  ) : (
    <Link href="/ecole" aria-label={label} className={cls}>
      {icone}
    </Link>
  );
}

export function ArbresGenealogiques() {
  const router = useRouter();
  const [G, setG] = useState<Genealogie | null>(null);
  const [fiches, setFiches] = useState<FichesData | null>(null);
  const [bookNames, setBookNames] = useState<Record<number, string>>({});
  const [pile, setPile] = useState<Vue[]>([{ mode: "accueil" }]);
  const [sel, setSel] = useState<string | null>(null);
  const [fiche, setFiche] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const vue = pile[pile.length - 1];

  useEffect(() => {
    getGenealogie().then(setG);
    getFiches().then(setFiches);
    getIndex()
      .then((b: { id: number; name: string }[]) => setBookNames(Object.fromEntries(b.map((x) => [x.id, x.name]))))
      .catch(() => {});
    const u = new URLSearchParams(window.location.search);
    const v: Vue | null = u.get("id")
      ? { mode: "centre", id: u.get("id")! }
      : u.get("arbre")
        ? { mode: "arbre", id: u.get("arbre")! }
        : u.get("lignee")
          ? { mode: "lignee", id: u.get("lignee")! }
          : null;
    if (v) setPile([{ mode: "accueil" }, v]);
  }, []);

  // L'URL suit la vue : en revenant de la Bible ou d'une fiche, on la retrouve.
  useEffect(() => {
    window.history.replaceState(null, "", versUrl(vue));
    setSel(null);
  }, [vue]);

  const aller = (v: Vue) => setPile((p) => [...p, v]);
  const centrer = (id: string) => {
    setFiche(null);
    if (vue.mode === "centre" && vue.id === id) return setSel(id);
    aller({ mode: "centre", id });
  };
  const retour = () => setPile((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const lire = (ref: string) => {
    const h = bibleHref(ref);
    if (h) router.push(h);
  };

  const def = useMemo(() => {
    if (!G || vue.mode === "accueil") return null;
    if (vue.mode === "centre") return null;
    return G.arbres.find((a) => a.id === vue.id) ?? null;
  }, [G, vue]);

  // Personnes trouvées par la recherche (seulement celles qui ont une famille).
  const trouves = useMemo(() => {
    if (!G || q.trim().length < 2) return [];
    const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const t = norm(q.trim());
    return Object.entries(G.personnes)
      .filter(([, p]) => norm(p.n).includes(t))
      .sort(([, a], [, b]) => (norm(a.n).startsWith(t) ? 0 : 1) - (norm(b.n).startsWith(t) ? 0 : 1) || a.n.localeCompare(b.n))
      .slice(0, 12);
  }, [G, q]);

  const titre =
    vue.mode === "accueil"
      ? "Arbres généalogiques"
      : vue.mode === "centre"
        ? court(G?.personnes[vue.id]?.n ?? "")
        : (def?.titre ?? "");

  return (
    <div className="dark-ctx fixed inset-0 z-[70] flex flex-col bg-night-950 text-cream">
      <PlansDarkBg />
      <header className="shrink-0 border-b border-white/[0.06] px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Retour onClick={pile.length > 1 ? retour : undefined} label={pile.length > 1 ? "Retour" : "Retour à l'Étude biblique"} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-dawn-300">
              {vue.mode === "accueil" ? "Étude biblique" : vue.mode === "centre" ? "Sa famille" : "Arbre généalogique"}
            </p>
            <h1 className="truncate font-display text-xl font-extrabold leading-tight">{titre}</h1>
          </div>
        </div>
      </header>

      {!G ? <p className="py-12 text-center text-sm text-cream/50">Chargement…</p> : null}

      {G && vue.mode === "accueil" ? (
        <Accueil G={G} fiches={fiches} q={q} setQ={setQ} trouves={trouves} onCentrer={centrer} onOuvrir={aller} />
      ) : null}

      {G && (vue.mode === "arbre" || vue.mode === "centre") ? (
        <Dessin
          key={`${vue.mode}-${vue.id}`}
          G={G}
          fiches={fiches}
          def={vue.mode === "arbre" ? (def as ArbreDef | null) : null}
          centre={vue.mode === "centre" ? vue.id : null}
          sel={sel}
          onSel={setSel}
          onLire={lire}
          onOuvrir={aller}
        />
      ) : null}

      {G && vue.mode === "lignee" && def?.type === "lignee" ? (
        <Lignee def={def as LigneeDef} G={G} fiches={fiches} onSel={setSel} onLire={lire} />
      ) : null}

      {/* La personne choisie : ses liens, sa fiche, recentrer */}
      {G && sel && G.personnes[sel] ? (
        <Panneau
          G={G}
          id={sel}
          fiches={fiches}
          estCentre={vue.mode === "centre" && vue.id === sel}
          onFermer={() => setSel(null)}
          onCentrer={centrer}
          onFiche={setFiche}
          onLire={lire}
        />
      ) : null}

      {fiche && fiches ? (
        <FicheSheet
          id={fiche}
          data={fiches}
          bookId={-1}
          chapter={-1}
          bookNames={bookNames}
          zIndex="z-[130]"
          onClose={() => setFiche(null)}
          onNavigate={(l, c, v) => router.push(`/bible?livre=${l}&chap=${c}${v ? `&v=${v}` : ""}`)}
          onArbre={centrer}
        />
      ) : null}
    </div>
  );
}

function Accueil({
  G,
  fiches,
  q,
  setQ,
  trouves,
  onCentrer,
  onOuvrir,
}: {
  G: Genealogie;
  fiches: FichesData | null;
  q: string;
  setQ: (s: string) => void;
  trouves: [string, Personne][];
  onCentrer: (id: string) => void;
  onOuvrir: (v: Vue) => void;
}) {
  const arbres = G.arbres.filter((a): a is ArbreDef => a.type !== "lignee");
  const lignees = G.arbres.filter((a): a is LigneeDef => a.type === "lignee");
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="mx-auto max-w-lg">
        <label className="mt-4 flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-3.5 py-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current text-cream/45" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Chercher une personne : Ruth, Lévi, Hérode…"
            className="min-w-0 flex-1 bg-transparent text-[15px] text-cream placeholder:text-cream/35 focus:outline-none"
          />
        </label>
        {trouves.length ? (
          <div className="mt-2 overflow-hidden rounded-2xl border border-white/10 bg-night-900">
            {trouves.map(([id, p]) => (
              <button key={id} type="button" onClick={() => onCentrer(id)} className="flex w-full items-center gap-3 border-b border-white/[0.06] px-3 py-2 text-left last:border-0 active:bg-white/10">
                <Avatar p={p} fiches={fiches} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{p.n}</span>
                  <span className="block truncate text-[11px] text-cream/45">
                    {p.p?.length ? `${p.s === "f" ? "Fille" : p.s === "h" ? "Fils" : "Enfant"} de ${p.p.map((x) => court(G.personnes[x]?.n ?? "")).join(" et ")}` : p.e?.length ? `${p.e.length} enfant${p.e.length > 1 ? "s" : ""} connu${p.e.length > 1 ? "s" : ""}` : "Famille"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : q.trim().length >= 2 ? (
          <p className="mt-2 px-1 text-[12px] text-cream/45">Personne de ce nom dans les arbres (seules les familles connues par la Bible y figurent).</p>
        ) : null}

        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Les grandes familles</p>
        <div className="mt-2 grid gap-2">
          {arbres.map((a) => {
            const visages = a.noeuds.filter((id) => G.personnes[id]?.f && fiches?.fiches[G.personnes[id].f!]).slice(0, 4);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onOuvrir({ mode: "arbre", id: a.id })}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left active:bg-white/10"
              >
                <span className="flex shrink-0">
                  {visages.map((id, i) => (
                    <span key={id} className="-ml-3 rounded-full ring-2 ring-night-950 first:ml-0" style={{ zIndex: 10 - i }}>
                      <Avatar p={G.personnes[id]} fiches={fiches} size={36} />
                    </span>
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[16px] font-extrabold leading-tight">{a.titre}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[12px] leading-snug text-cream/55">{a.desc}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-cream/45">Les généalogies de Jésus</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {lignees.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => onOuvrir({ mode: "lignee", id: l.id })}
              className="rounded-2xl border border-dawn-400/30 bg-dawn-400/[0.07] p-3 text-left active:bg-white/10"
            >
              <span className="block font-display text-[16px] font-extrabold leading-tight text-dawn-300">{l.titre}</span>
              <span className="mt-1 line-clamp-3 block text-[12px] leading-snug text-cream/60">{l.desc}</span>
              <span className="mt-1.5 block text-[11px] font-bold text-cream/40">{l.ref.split(":")[0]}</span>
            </button>
          ))}
        </div>
        <p className="mt-8 text-center text-[11px] leading-relaxed text-cream/35">
          Chaque lien vient du texte biblique (référence indiquée) ; les rares liens tirés de l&apos;histoire sont signalés.
        </p>
      </div>
    </div>
  );
}

function Dessin({
  G,
  fiches,
  def,
  centre,
  sel,
  onSel,
  onLire,
  onOuvrir,
}: {
  G: Genealogie;
  fiches: FichesData | null;
  def: ArbreDef | null;
  centre: string | null;
  sel: string | null;
  onSel: (id: string) => void;
  onLire: (ref: string) => void;
  onOuvrir: (v: Vue) => void;
}) {
  const P = G.personnes;
  const boxRef = useRef<HTMLDivElement>(null);
  const [forme, setForme] = useState<"arbre" | "liste">("arbre");
  const [zoom, setZoom] = useState(1);
  // Point du dessin à garder sous les doigts (ou au centre) pendant un zoom.
  const ancre = useRef<{ cx: number; cy: number; fx: number; fy: number; z?: number } | null>(null);
  const pince = useRef<{ d: number; z: number } | null>(null);

  const plan = useMemo(() => {
    const { racine, noeuds } = def ? { racine: def.racine, noeuds: new Set(def.noeuds) } : entourage(G, centre!);
    return { ...disposer(G, racine, noeuds), racine, noeuds };
  }, [G, def, centre]);
  const adoptifs = useMemo(() => new Set(G.adoptifs), [G]);
  const parId = useMemo(() => new Map(plan.toutes.map((b) => [b.id, b])), [plan]);
  const voirAussi = centre ? G.arbres.filter((a): a is ArbreDef => a.type !== "lignee" && a.noeuds.includes(centre)) : [];

  useEffect(() => {
    try {
      if (sessionStorage.getItem("jb.arbres.forme") === "liste") setForme("liste");
    } catch {
      /* stockage indisponible */
    }
  }, []);
  const changerForme = (f: "arbre" | "liste") => {
    setForme(f);
    try {
      sessionStorage.setItem("jb.arbres.forme", f);
    } catch {
      /* stockage indisponible */
    }
  };

  // Ouverture : vue d'ensemble (l'arbre tient en largeur autant que possible),
  // centrée sur la personne choisie ou sur la racine.
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box || forme !== "arbre") return;
    const ajuste = (box.clientWidth - 8) / plan.largeur;
    const z = Math.min(1, Math.max(centre ? 0.72 : 0.5, ajuste));
    const cible = parId.get(centre ?? plan.racine);
    if (!cible) return setZoom(z);
    const a = {
      cx: cible.x,
      cy: centre ? cible.y + PAD + 40 : 0,
      fx: box.clientWidth / 2,
      fy: centre ? box.clientHeight / 3 : 0,
      z,
    };
    if (z !== zoom) {
      ancre.current = a;
      setZoom(z);
    } else {
      box.scrollLeft = a.cx * z - a.fx;
      box.scrollTop = a.cy * z - a.fy;
    }
  }, [plan, forme]); // eslint-disable-line react-hooks/exhaustive-deps

  // Après chaque zoom : on replace le point d'ancrage.
  useLayoutEffect(() => {
    const box = boxRef.current;
    const a = ancre.current;
    // Le zoom d'ouverture n'est pas encore appliqué : on attend le rendu suivant.
    if (!box || !a || (a.z !== undefined && a.z !== zoom)) return;
    box.scrollLeft = a.cx * zoom - a.fx;
    box.scrollTop = a.cy * zoom - a.fy;
    if (!pince.current) ancre.current = null;
  }, [zoom]);

  const zoomer = (facteur: number) => {
    const box = boxRef.current;
    if (!box) return;
    const fx = box.clientWidth / 2;
    const fy = box.clientHeight / 2;
    ancre.current = { cx: (box.scrollLeft + fx) / zoom, cy: (box.scrollTop + fy) / zoom, fx, fy };
    setZoom((z) => Math.min(1.4, Math.max(0.4, z * facteur)));
  };

  // Zoom à deux doigts (le défilement à un doigt reste natif).
  const ecart = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const onTouchStart = (e: React.TouchEvent) => {
    const box = boxRef.current;
    if (e.touches.length !== 2 || !box) return;
    const r = box.getBoundingClientRect();
    const fx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - r.left;
    const fy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - r.top;
    pince.current = { d: ecart(e.touches), z: zoom };
    ancre.current = { cx: (box.scrollLeft + fx) / zoom, cy: (box.scrollTop + fy) / zoom, fx, fy };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const p = pince.current;
    if (e.touches.length !== 2 || !p) return;
    setZoom(Math.min(1.4, Math.max(0.4, (p.z * ecart(e.touches)) / p.d)));
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      pince.current = null;
      ancre.current = null;
    }
  };

  // « de Léa » quand les enfants d'un même père ont plusieurs mères.
  const parents = useMemo(() => {
    const m = new Map<string, Boite>();
    for (const b of plan.toutes) for (const c of b.enfants) m.set(c.id, b);
    return m;
  }, [plan]);
  const mereDe = (id: string) => {
    const parent = parents.get(id);
    if (!parent) return null;
    const mereDeEnfant = (e: string) => P[e]?.p?.find((x) => x !== parent.id && P[x]?.s === "f");
    const meres = new Set(parent.enfants.map((c) => mereDeEnfant(c.id)).filter(Boolean));
    if (meres.size < 2) return null;
    const m = mereDeEnfant(id);
    return m ? court(P[m].n).replace(/^(La|Le|Les) /, (x) => x.toLowerCase()) : null;
  };
  const conjoints = (id: string) => (P[id].c ?? []).map((c) => court(P[c]?.n ?? "")).filter(Boolean);

  const traits: { d: string; pointille: boolean }[] = [];
  for (const b of plan.toutes) {
    if (!b.enfants.length) continue;
    const yBas = b.y + PAD + 126;
    const yMil = b.y + RH - 8;
    traits.push({ d: `M${b.x} ${yBas}V${yMil}`, pointille: false });
    if (b.enfants.length > 1) traits.push({ d: `M${b.enfants[0].x} ${yMil}H${b.enfants[b.enfants.length - 1].x}`, pointille: false });
    for (const c of b.enfants) traits.push({ d: `M${c.x} ${yMil}V${c.y + PAD - 4}`, pointille: adoptifs.has(`${b.id}>${c.id}`) });
  }

  const bouton = "grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-night-900/90 text-cream/85 shadow-card backdrop-blur";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pt-3">
        <div className="mx-auto max-w-lg">
          {def ? (
            <p className="text-[12.5px] leading-snug text-cream/60">
              {def.desc}{" "}
              <button type="button" onClick={() => onLire(def.ref)} className="font-bold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2">
                {def.ref.split(":")[0]}
              </button>
            </p>
          ) : voirAussi.length ? (
            <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
              <span className="shrink-0 self-center text-[11px] font-bold text-cream/45">Voir aussi</span>
              {voirAussi.map((a) => (
                <button key={a.id} type="button" onClick={() => onOuvrir({ mode: "arbre", id: a.id })} className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-bold text-cream/80">
                  {a.titre}
                </button>
              ))}
            </div>
          ) : null}
          {def?.note ? <p className="mt-1.5 text-[11.5px] leading-snug text-cream/45">{def.note}</p> : null}
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-0.5">
              {(
                [
                  ["arbre", "Arbre"],
                  ["liste", "Liste"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => changerForme(k)}
                  className={`rounded-full px-3.5 py-1 text-[12px] font-bold ${forme === k ? "bg-dawn-400 text-night-950" : "text-cream/60"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[11px] text-cream/40">{forme === "arbre" ? "Pince pour zoomer · touche une personne" : "Touche une personne"}</span>
          </div>
        </div>
      </div>

      {forme === "arbre" ? (
        <>
          <div
            ref={boxRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="relative mt-2 min-h-0 flex-1 overflow-auto overscroll-contain"
            style={{ touchAction: "pan-x pan-y" }}
          >
            <div style={{ width: plan.largeur * zoom, height: (plan.hauteur + 140) * zoom }}>
              <div className="relative origin-top-left" style={{ width: plan.largeur, height: plan.hauteur, transform: `scale(${zoom})` }}>
                <svg className="pointer-events-none absolute inset-0" width={plan.largeur} height={plan.hauteur}>
                  {traits.map((t, i) => (
                    <path key={i} d={t.d} fill="none" stroke="rgba(244,240,230,.3)" strokeWidth={1.6} strokeDasharray={t.pointille ? "4 4" : undefined} />
                  ))}
                </svg>
                {plan.toutes.map((b) => {
                  const p = P[b.id];
                  const conj = conjoints(b.id);
                  const mere = mereDe(b.id);
                  const actif = sel === b.id || centre === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => onSel(b.id)}
                      className="absolute flex flex-col items-center text-center"
                      style={{ left: b.x - NW / 2, top: b.y + PAD, width: NW }}
                    >
                      <span className={`rounded-full ${actif ? "ring-[3px] ring-dawn-400 ring-offset-2 ring-offset-night-950" : ""}`}>
                        <Avatar p={p} fiches={fiches} />
                      </span>
                      <span className={`mt-1.5 line-clamp-2 px-0.5 text-[12px] font-bold leading-tight ${actif ? "text-dawn-300" : "text-cream/90"}`}>{court(p.n)}</span>
                      {mere ? <span className="mt-0.5 text-[10px] font-semibold text-cream/45">de {mere}</span> : null}
                      {conj.length ? (
                        <span className="mt-0.5 flex max-w-full items-center gap-0.5 truncate text-[10px] font-semibold text-dawn-300/70">
                          <Anneaux />
                          <span className="truncate">{conj.length > 2 ? `${conj.slice(0, 2).join(", ")} +${conj.length - 2}` : conj.join(", ")}</span>
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+1rem)] right-4 flex flex-col gap-2">
            <button type="button" aria-label="Zoomer" onClick={() => zoomer(1.25)} className={`pointer-events-auto ${bouton}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M5 12h14M12 5v14" strokeLinecap="round" />
              </svg>
            </button>
            <button type="button" aria-label="Dézoomer" onClick={() => zoomer(0.8)} className={`pointer-events-auto ${bouton}`}>
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.4}>
                <path d="M5 12h14" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
          <div className="mx-auto max-w-lg">
            <Branche
              id={plan.racine}
              plan={plan.arbre}
              G={G}
              fiches={fiches}
              sel={sel}
              centre={centre}
              adoptifs={adoptifs}
              mereDe={mereDe}
              conjoints={conjoints}
              onSel={onSel}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Vue « liste » : l'arbre déroulé de haut en bas. On ne décale vers la
 * droite que lorsqu'une famille a plusieurs enfants ; une lignée de père en
 * fils reste alignée, reliée par un trait. */
function Branche({
  plan,
  G,
  fiches,
  sel,
  centre,
  adoptifs,
  mereDe,
  conjoints,
  onSel,
}: {
  id: string;
  plan: Boite;
  G: Genealogie;
  fiches: FichesData | null;
  sel: string | null;
  centre: string | null;
  adoptifs: Set<string>;
  mereDe: (id: string) => string | null;
  conjoints: (id: string) => string[];
  onSel: (id: string) => void;
}) {
  const p = G.personnes[plan.id];
  const actif = sel === plan.id || centre === plan.id;
  const mere = mereDe(plan.id);
  const conj = conjoints(plan.id);
  const props = { G, fiches, sel, centre, adoptifs, mereDe, conjoints, onSel };
  return (
    <div>
      <button type="button" onClick={() => onSel(plan.id)} className="flex w-full items-center gap-3 py-1.5 text-left">
        <span className={`rounded-full ${actif ? "ring-2 ring-dawn-400 ring-offset-2 ring-offset-night-950" : ""}`}>
          <Avatar p={p} fiches={fiches} size={38} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-[15px] font-bold leading-tight ${actif ? "text-dawn-300" : "text-cream"}`}>{court(p.n)}</span>
          {mere || conj.length ? (
            <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-semibold text-cream/45">
              {mere ? <span>de {mere}</span> : null}
              {mere && conj.length ? <span>·</span> : null}
              {conj.length ? (
                <span className="flex min-w-0 items-center gap-1 text-dawn-300/70">
                  <Anneaux />
                  <span className="truncate">{conj.join(", ")}</span>
                </span>
              ) : null}
            </span>
          ) : null}
        </span>
      </button>
      {plan.enfants.length === 1 ? (
        <div className="ml-[18px] border-l-2 border-white/15 pl-0">
          <div className={`-ml-[2px] h-2 border-l-2 ${adoptifs.has(`${plan.id}>${plan.enfants[0].id}`) ? "border-dashed border-white/30" : "border-transparent"}`} />
          <div className="-ml-[20px]">
            <Branche id={plan.enfants[0].id} plan={plan.enfants[0]} {...props} />
          </div>
        </div>
      ) : plan.enfants.length > 1 ? (
        <div className="ml-[18px] border-l-2 border-white/15 pl-3">
          {plan.enfants.map((c) => (
            <div key={c.id} className="relative">
              <span className={`absolute -left-3 top-[25px] w-3 border-t-2 ${adoptifs.has(`${plan.id}>${c.id}`) ? "border-dashed border-white/30" : "border-white/15"}`} />
              <Branche id={c.id} plan={c} {...props} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Lignee({
  def,
  G,
  fiches,
  onSel,
  onLire,
}: {
  def: LigneeDef;
  G: Genealogie;
  fiches: FichesData | null;
  onSel: (id: string) => void;
  onLire: (ref: string) => void;
}) {
  let rang = 0;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="mx-auto max-w-lg">
        <p className="mt-3 text-[13px] leading-snug text-cream/65">
          {def.desc}{" "}
          <button type="button" onClick={() => onLire(def.ref)} className="font-bold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2">
            {def.ref.split(":")[0]}
          </button>
        </p>
        {def.note ? <p className="mt-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[12px] leading-snug text-cream/55">{def.note}</p> : null}
        {def.sections.map((s) => (
          <section key={s.titre} className="pt-5">
            <p className="mb-2 inline-flex rounded-full bg-dawn-400 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-night-950">{s.titre}</p>
            <ol className="relative ml-[18px] border-l-2 border-dawn-400/30">
              {s.noms.map((it, i) => {
                rang += 1;
                const p = it.id ? G.personnes[it.id] : undefined;
                // Même personne connue sous une autre forme (Esrom = Hetsron) ;
                // on ignore les simples variantes (Aminadab / Amminadab).
                const simple = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/(.)\1+/g, "$1");
                const autreNom = p && simple(court(p.n)) !== simple(it.n) && !court(p.n).startsWith(it.n) ? court(p.n) : null;
                return (
                  <li key={i} className="relative -ml-[19px] flex items-center gap-3 py-1.5">
                    <button
                      type="button"
                      disabled={!p}
                      onClick={() => it.id && onSel(it.id)}
                      className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl py-0.5 pr-2 text-left disabled:cursor-default"
                    >
                      {p ? (
                        <span className="rounded-full ring-4 ring-night-950">
                          <Avatar p={p} fiches={fiches} size={36} />
                        </span>
                      ) : (
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-night-900 text-[11px] font-black text-cream/40 ring-4 ring-night-950">
                          {rang}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className={`block text-[15px] font-bold leading-tight ${p ? "text-cream" : "text-cream/70"}`}>{it.n}</span>
                        {autreNom || it.avec ? (
                          <span className="block text-[11px] font-semibold text-cream/45">
                            {autreNom ? `aussi appelé ${autreNom}` : ""}
                            {autreNom && it.avec ? " · " : ""}
                            {it.avec ?? ""}
                          </span>
                        ) : null}
                      </span>
                    </button>
                    {it.avecId && G.personnes[it.avecId] ? (
                      <button type="button" onClick={() => onSel(it.avecId!)} className="shrink-0 rounded-full ring-2 ring-dawn-400/50" aria-label={court(G.personnes[it.avecId].n)}>
                        <Avatar p={G.personnes[it.avecId]} fiches={fiches} size={30} />
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}

function Panneau({
  G,
  id,
  fiches,
  estCentre,
  onFermer,
  onCentrer,
  onFiche,
  onLire,
}: {
  G: Genealogie;
  id: string;
  fiches: FichesData | null;
  estCentre: boolean;
  onFermer: () => void;
  onCentrer: (id: string) => void;
  onFiche: (id: string) => void;
  onLire: (ref: string) => void;
}) {
  const P = G.personnes;
  const p = P[id];
  const enfant = p.s === "f" ? "Fille" : p.s === "h" ? "Fils" : "Enfant";
  const lignes: [string, string[]][] = [];
  if (p.p?.length) lignes.push([`${enfant} de`, p.p]);
  if (p.c?.length) lignes.push([p.s === "f" ? "Épouse de" : "Époux de", p.c]);
  if (p.e?.length) lignes.push([p.s === "f" ? "Mère de" : p.s === "h" ? "Père de" : "Parent de", p.e]);
  const aFiche = p.f && fiches?.fiches[p.f];

  return (
    <div className="fixed inset-x-0 bottom-0 z-[95] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/12 bg-night-900/95 p-4 shadow-card backdrop-blur-md">
        <div className="flex items-start gap-3">
          <Avatar p={p} fiches={fiches} size={48} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-extrabold leading-tight">{p.n}</p>
            {p.r ? (
              <button type="button" onClick={() => onLire(p.r!)} className="mt-0.5 text-[12px] font-bold text-dawn-300 underline decoration-dawn-300/40 underline-offset-2">
                {p.r.replace(":", ".")}
              </button>
            ) : null}
          </div>
          <button type="button" onClick={onFermer} aria-label="Fermer" className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-cream/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="mt-2.5 max-h-[28vh] space-y-1.5 overflow-y-auto">
          {lignes.map(([label, ids]) => (
            <p key={label} className="text-[13px] leading-snug text-cream/70">
              <span className="font-bold text-cream/45">{label} </span>
              {ids.map((x, i) => (
                <span key={x}>
                  {i ? (i === ids.length - 1 ? " et " : ", ") : ""}
                  <button type="button" onClick={() => onCentrer(x)} className="font-bold text-cream underline decoration-white/25 underline-offset-2">
                    {court(P[x]?.n ?? x)}
                  </button>
                </span>
              ))}
            </p>
          ))}
          {p.o ? <p className="text-[12px] leading-snug text-cream/50">{p.o}</p> : null}
        </div>
        <div className="mt-3 flex gap-2">
          {aFiche ? (
            <button type="button" onClick={() => onFiche(p.f!)} className="flex-1 rounded-full bg-dawn-400 py-2.5 font-display text-sm font-bold text-night-950">
              Voir la fiche
            </button>
          ) : null}
          {!estCentre ? (
            <button type="button" onClick={() => onCentrer(id)} className="flex-1 rounded-full border border-white/20 py-2.5 text-sm font-bold text-cream/90">
              Centrer sur {p.s === "f" ? "elle" : "lui"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
