"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { asset } from "@/lib/asset";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";
import {
  listPublicGroups,
  listMyGroups,
  createGroup,
  joinByCode,
  type Group,
} from "@/lib/groups";
import { getActiveAnnouncement, type Announcement } from "@/lib/announcements";
import { openExternal } from "@/lib/external";

const HEADER_BG = "#14160E";
const fieldDark =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-cream placeholder:text-cream/40 outline-none focus:border-dawn-400/60";

function accentOf(g: Group) {
  return ACCENTS[g.accent] ?? ACCENTS.lime;
}

/** Carte « Découvrir » (image/gradient + titre incrusté, défile à droite). */
function DiscoverCard({ g }: { g: Group }) {
  const c = accentOf(g);
  return (
    <Link
      href={`/groupe?g=${g.id}`}
      className="relative flex h-48 w-40 shrink-0 snap-start overflow-hidden rounded-3xl"
      style={g.image ? undefined : { backgroundImage: `linear-gradient(150deg, ${c.from}, ${c.to})` }}
    >
      {g.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset(g.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <span className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-black/35 px-2 py-0.5 text-[11px] font-bold text-white">
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth={2}>
          <path d="M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6" strokeLinecap="round" />
        </svg>
        {g.member_count ?? 0}
      </span>
      {/* Bandeau olive: « GROUPE » en lime + nom en crème */}
      <div
        className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8"
        style={{ background: "linear-gradient(180deg, transparent, #1F2216 55%)" }}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-dawn-400">Groupe</span>
        <p className="font-display text-base font-extrabold leading-tight text-cream">{g.name}</p>
      </div>
    </Link>
  );
}

function MyGroupCard({ g }: { g: Group }) {
  const c = accentOf(g);
  return (
    <Link
      href={`/groupe?g=${g.id}`}
      className="relative flex h-28 w-56 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl p-4 text-white"
      style={g.image ? undefined : { backgroundImage: `linear-gradient(150deg, ${c.from}, ${c.to})` }}
    >
      {g.image ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={asset(g.image)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
        </>
      ) : null}
      <p className="relative font-display text-lg font-extrabold leading-tight">{g.name}</p>
      <p className="relative truncate text-xs text-white/80">{g.member_count ?? 0} membres</p>
    </Link>
  );
}

const PASTOR_EMAIL = "contact@jackbrunet.com";

/** Écrire au Pasteur (ouvre l'app e-mail) + actualités / prochain live. */
function ContactBox() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  useEffect(() => {
    getActiveAnnouncement().then(setAnn);
  }, []);

  const mailto = `mailto:${PASTOR_EMAIL}?subject=${encodeURIComponent("Message pour le Pasteur Jack")}`;

  return (
    <>
      {/* Écrire au Pasteur Jack (ouvre la boîte mail) */}
      <section className="mt-8 rounded-3xl bg-night-900 p-5 text-cream">
        <p className="font-display text-xl font-extrabold">Un message pour le Pasteur Jack ?</p>
        <p className="mt-1 text-sm text-cream/70">
          Écris-lui directement : ça ouvre ton application e-mail, ton message part à {PASTOR_EMAIL}.
        </p>
        <a
          href={mailto}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-3 text-sm font-bold text-night-950"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
            <path d="M4 6h16v12H4zM4 7l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Envoyer un message au Pasteur Jack
        </a>
      </section>

      {/* Mes annonces d'actualité (prochain live…) */}
      <section className="mt-4">
        <h2 className="font-display text-xl font-extrabold text-night-900">Actualités</h2>
        {ann ? (
          <AnnouncementCard ann={ann} />
        ) : (
          <p className="mt-2 text-sm text-night-900/55">Aucune annonce pour le moment.</p>
        )}
      </section>
    </>
  );
}

/** Carte d'annonce (ex. « Prochain live » + date). Cliquable si un lien existe. */
function AnnouncementCard({ ann }: { ann: Announcement }) {
  const inner = (
    <div className="mt-3 flex items-center gap-4 rounded-3xl border border-dawn-400/40 bg-gradient-to-br from-spirit-700 to-night-900 p-5 text-cream">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={1.8}>
          <path d="M8 5v14l11-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-extrabold leading-tight">{ann.title}</p>
        {ann.body ? <p className="mt-0.5 text-sm text-cream/80">{ann.body}</p> : null}
      </div>
      {ann.link ? <span className="shrink-0 text-2xl text-dawn-300">→</span> : null}
    </div>
  );

  if (!ann.link) return inner;
  if (ann.link.startsWith("/")) {
    return (
      <Link href={ann.link} className="block transition-transform active:scale-[0.99]">
        {inner}
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => openExternal(ann.link!)}
      className="block w-full text-left transition-transform active:scale-[0.99]"
    >
      {inner}
    </button>
  );
}

export function GroupsDirectory() {
  const { ready, userId } = useAuth();
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState<Group[] | null>(null);
  const [reco, setReco] = useState<Group[] | null>(null);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", verse_text: "", verse_reference: "", accent: "lime" as AccentKey, is_public: true, open_join: true });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");
  const [showCode, setShowCode] = useState(false);

  async function loadReco() {
    setReco(await listPublicGroups(query).then((gs) => gs.sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0))));
  }

  useEffect(() => {
    if (!ready) return;
    loadReco();
    if (userId) listMyGroups(userId).then(setMine);
    else setMine([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, userId]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(loadReco, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg("Donne un nom à ton groupe.");
      return;
    }
    setBusy(true);
    setMsg("");
    const g = await createGroup(form);
    setBusy(false);
    if (g) window.location.href = `/groupe?g=${g.id}`;
    else setMsg("Création impossible (vérifie la migration SQL groups, et sois connecté).");
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setCodeMsg("…");
    const gid = await joinByCode(code);
    if (gid) window.location.href = `/groupe?g=${gid}`;
    else setCodeMsg("Code invalide.");
  }

  return (
    // Fond olive (couleur du bas de l'en-tête) pour que les arrondis du corps
    // crème ne laissent pas apparaître de liseré clair sur les côtés.
    <div className="min-h-screen bg-[#26301A]">
      {/* En-tête sombre */}
      <div className="text-cream" style={{ background: `linear-gradient(160deg, ${HEADER_BG}, #26301A)` }}>
        <div className="container-x pb-6 pt-[calc(5rem+env(safe-area-inset-top))]">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-4xl font-extrabold text-dawn-400">Groupes</h1>
                <p className="mt-1 text-sm text-cream/70">S&apos;encourager, prier ensemble et grandir dans la foi.</p>
              </div>
              <button
                type="button"
                onClick={() => setCreating((c) => !c)}
                aria-label="Créer un groupe"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-dawn-400 text-2xl font-bold text-night-950 shadow-glow"
              >
                +
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="relative flex-1">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-cream/40" strokeWidth={1.8}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un groupe (nom, thème…)"
                  className="w-full rounded-full border border-white/12 bg-white/[0.06] py-3 pl-11 pr-4 text-cream placeholder:text-cream/40 outline-none focus:border-dawn-400/60"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCode((s) => !s)}
                aria-label="Rejoindre par code"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/12 bg-white/[0.06] text-cream/70"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
                  <path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h8M16 17h4" strokeLinecap="round" />
                  <circle cx="16" cy="7" r="2" /><circle cx="8" cy="12" r="2" /><circle cx="14" cy="17" r="2" />
                </svg>
              </button>
            </div>

            {showCode ? (
              <form onSubmit={submitCode} className="mt-2 flex items-center gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code d'invitation" className="w-44 rounded-full border border-white/12 bg-white/[0.06] px-4 py-2 uppercase tracking-widest text-cream placeholder:text-cream/40 outline-none" />
                <button type="submit" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Rejoindre</button>
                {codeMsg ? <span className="text-xs text-cream/55">{codeMsg}</span> : null}
              </form>
            ) : null}

            {creating ? (
              <form onSubmit={submitCreate} className="mt-3 space-y-2.5 rounded-2xl border border-dawn-400/25 bg-white/[0.05] p-4">
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du groupe" className={fieldDark} />
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Texte d'explication (facultatif)" rows={2} className={fieldDark} />
                <div className="grid gap-2.5 sm:grid-cols-[1fr_auto]">
                  <input value={form.verse_text} onChange={(e) => setForm((f) => ({ ...f, verse_text: e.target.value }))} placeholder="Verset (optionnel)" className={fieldDark} />
                  <input value={form.verse_reference} onChange={(e) => setForm((f) => ({ ...f, verse_reference: e.target.value }))} placeholder="Réf." className={`${fieldDark} sm:w-28`} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                    <button key={k} type="button" onClick={() => setForm((f) => ({ ...f, accent: k }))} aria-label={ACCENTS[k].label}
                      className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[#1a1d12] ${form.accent === k ? "ring-cream" : "ring-transparent"}`}
                      style={{ backgroundImage: `linear-gradient(135deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }} />
                  ))}
                </div>
                <label className="flex items-center gap-2 text-sm text-cream/70">
                  <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} />
                  Visible dans le répertoire
                </label>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cream/45">Adhésion</p>
                  <div className="mt-1.5 flex gap-2">
                    {[
                      { v: true, label: "Ouverte", hint: "on rejoint sans validation" },
                      { v: false, label: "Sur validation", hint: "tu acceptes les demandes" },
                    ].map((o) => (
                      <button
                        key={String(o.v)}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, open_join: o.v }))}
                        className={`flex-1 rounded-2xl border px-3 py-2 text-left transition-colors ${
                          form.open_join === o.v ? "border-dawn-400 bg-dawn-400/15 text-cream" : "border-white/15 text-cream/60"
                        }`}
                      >
                        <span className="block text-sm font-bold">{o.label}</span>
                        <span className="text-[11px] text-cream/50">{o.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={busy} className="btn-primary text-sm">{busy ? "…" : "Créer"}</button>
                  <button type="button" onClick={() => setCreating(false)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Annuler</button>
                </div>
                {msg ? <p className="text-sm font-semibold text-dawn-300">{msg}</p> : null}
              </form>
            ) : null}
          </div>
        </div>
      </div>

      {/* Corps clair */}
      <div className="container-x -mt-3 min-h-screen rounded-t-[2rem] bg-cream pb-28 pt-6">
        <div className="mx-auto max-w-2xl">
          {/* Découvrir des groupes (carrousel image + titre) */}
          <section>
            <h2 className="font-display text-xl font-extrabold text-night-900">
              {query ? "Résultats" : "Découvrir des groupes"}
            </h2>
            <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
              {reco === null ? (
                <p className="text-sm text-night-900/50">Chargement…</p>
              ) : reco.length === 0 ? (
                <p className="text-sm text-night-900/55">{query ? "Aucun groupe trouvé." : "Aucun groupe pour l'instant."}</p>
              ) : (
                reco.map((g) => <DiscoverCard key={g.id} g={g} />)
              )}
            </div>
          </section>

          {/* Mes groupes */}
          {userId && mine && mine.length > 0 ? (
            <section className="mt-7">
              <h2 className="font-display text-xl font-extrabold text-night-900">Mes groupes</h2>
              <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
                {mine.map((g) => <MyGroupCard key={g.id} g={g} />)}
              </div>
            </section>
          ) : null}

          {!userId ? (
            <div className="mt-6 rounded-2xl bg-white p-5 text-center">
              <p className="text-night-900/60">Connecte-toi pour créer ou rejoindre un groupe.</p>
              <Link href="/communaute" className="btn-primary mt-4 inline-flex">Se connecter</Link>
            </div>
          ) : null}

          {/* Écrire au pasteur + actualités (prochain live) */}
          <ContactBox />
        </div>
      </div>
    </div>
  );
}
