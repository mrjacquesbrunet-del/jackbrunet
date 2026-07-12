"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth, initials } from "@/components/community/useAuth";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";
import { RichText } from "@/components/community/RichText";
import {
  listPublicGroups,
  listMyGroups,
  listMyGroupsFeed,
  createGroup,
  joinByCode,
  requestJoin,
  KIND_LABEL,
  type Group,
  type FeedPost,
} from "@/lib/groups";

const HEADER_BG = "#14160E";
const fieldDark =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-cream placeholder:text-cream/40 outline-none focus:border-dawn-400/60";

function timeAgo(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function GroupGlyph({ accent, className }: { accent: AccentKey; className?: string }) {
  const c = ACCENTS[accent] ?? ACCENTS.lime;
  return (
    <span
      className={`grid place-items-center rounded-full ${className ?? "h-10 w-10"}`}
      style={{ background: `${c.from}22`, color: c.from }}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={1.8}>
        <path d="M12 2v6M9 6c-3 1-5 3-5 6a8 8 0 0 0 16 0c0-3-2-5-5-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Carte « Mes groupes » (carrousel horizontal). */
function MyGroupCard({ g }: { g: Group }) {
  const c = ACCENTS[g.accent] ?? ACCENTS.lime;
  return (
    <Link
      href={`/groupe?g=${g.id}`}
      className="relative flex h-44 w-60 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-3xl p-4 text-white"
      style={{ backgroundImage: `linear-gradient(150deg, ${c.from}, ${c.to})` }}
    >
      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/30 px-2 py-1 text-xs font-bold">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth={2}>
          <path d="M17 20v-1a4 4 0 0 0-3-3.9M7 20v-1a4 4 0 0 1 3-3.9M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6" strokeLinecap="round" />
        </svg>
        {g.member_count ?? 0}
      </span>
      <GroupGlyph accent={g.accent} className="mb-2 h-9 w-9 !bg-white/20 !text-white" />
      <p className="font-display text-lg font-extrabold leading-tight">{g.name}</p>
      <p className="truncate text-xs text-white/80">
        {g.verse_reference || (g.description ? g.description.slice(0, 40) : "Groupe de prière")}
      </p>
    </Link>
  );
}

export function GroupsDirectory() {
  const { ready, userId } = useAuth();
  const [query, setQuery] = useState("");
  const [mine, setMine] = useState<Group[] | null>(null);
  const [reco, setReco] = useState<Group[] | null>(null);
  const [feed, setFeed] = useState<FeedPost[] | null>(null);
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", verse_text: "", verse_reference: "", accent: "lime" as AccentKey, is_public: true });
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
    if (userId) {
      listMyGroups(userId).then(setMine);
      listMyGroupsFeed(userId).then(setFeed);
    } else {
      setMine([]);
      setFeed([]);
    }
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

  // Groupes à découvrir = publics dont je ne suis pas déjà membre.
  const mineIds = new Set((mine ?? []).map((g) => g.id));
  const discover = (reco ?? []).filter((g) => !mineIds.has(g.id));

  return (
    <div className="min-h-screen bg-cream">
      {/* En-tête sombre */}
      <div className="text-cream" style={{ background: `linear-gradient(160deg, ${HEADER_BG}, #26301A)` }}>
        <div className="container-x pb-6 pt-[calc(5rem+env(safe-area-inset-top))]">
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="font-display text-4xl font-extrabold">
                  Grou<span className="text-dawn-400">pes</span>
                </h1>
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

            {/* Recherche + filtre (rejoindre par code) */}
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
      <div className="container-x -mt-3 rounded-t-[2rem] bg-cream pb-28 pt-6">
        <div className="mx-auto max-w-2xl">
          {!userId ? (
            <div className="py-16 text-center">
              <p className="text-night-900/60">Connecte-toi pour créer ou rejoindre un groupe.</p>
              <Link href="/communaute" className="btn-primary mt-4 inline-flex">Se connecter</Link>
            </div>
          ) : (
            <>
              {/* Mes groupes */}
              {mine && mine.length > 0 ? (
                <section>
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-night-900">
                      <GroupGlyph accent="lime" className="h-8 w-8" /> Mes groupes
                    </h2>
                  </div>
                  <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-1">
                    {mine.map((g) => <MyGroupCard key={g.id} g={g} />)}
                  </div>
                </section>
              ) : null}

              {/* Découvrir des groupes */}
              {discover.length > 0 ? (
                <section className="mt-6 rounded-3xl bg-dawn-100/40 p-4">
                  <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-night-900">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-night-900 text-dawn-400">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}><path d="M12 3v18M5 8c0-2 2-3 7-3M19 8c0-2-2-3-7-3" strokeLinecap="round"/></svg>
                    </span>
                    {query ? "Résultats" : "Découvrir des groupes"}
                  </h2>
                  <div className="mt-3 space-y-2.5">
                    {discover.slice(0, 8).map((g) => (
                      <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-white p-3">
                        <Link href={`/groupe?g=${g.id}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-xl font-display font-extrabold text-white"
                          style={{ backgroundImage: `linear-gradient(135deg, ${(ACCENTS[g.accent] ?? ACCENTS.lime).from}, ${(ACCENTS[g.accent] ?? ACCENTS.lime).to})` }}>
                          {(g.name.trim()[0] ?? "G").toUpperCase()}
                        </Link>
                        <Link href={`/groupe?g=${g.id}`} className="min-w-0 flex-1">
                          <p className="truncate font-display font-bold text-night-900">{g.name}</p>
                          <p className="truncate text-xs text-night-900/55">
                            {g.description ? g.description.slice(0, 40) : g.verse_reference || "Groupe de prière"}
                          </p>
                          <p className="mt-0.5 text-xs font-semibold text-night-900/45">{g.member_count ?? 0} membres</p>
                        </Link>
                        <button
                          type="button"
                          disabled={joined[g.id]}
                          onClick={async () => {
                            const ok = await requestJoin(g.id, userId);
                            if (ok) setJoined((j) => ({ ...j, [g.id]: true }));
                          }}
                          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                            joined[g.id] ? "border-night-900/15 text-night-900/40" : "border-spirit-600 text-spirit-700 hover:bg-spirit-500/10"
                          }`}
                        >
                          {joined[g.id] ? "Demandé" : "Rejoindre"}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {/* Sujets de prière (feed agrégé) */}
              <section className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-night-900">
                    <GroupGlyph accent="lime" className="h-8 w-8" /> Sujets de prière
                  </h2>
                  {mine && mine.length > 0 ? (
                    <Link href={`/groupe?g=${mine[0].id}`} className="text-sm font-semibold text-spirit-700">✎ Publier</Link>
                  ) : null}
                </div>

                <div className="mt-3 space-y-3">
                  {feed === null ? (
                    <p className="text-sm text-night-900/50">Chargement…</p>
                  ) : feed.length === 0 ? (
                    <p className="rounded-2xl bg-white p-4 text-sm text-night-900/55">
                      Aucun partage pour l&apos;instant. Rejoins un groupe et publie ton premier sujet 🙏
                    </p>
                  ) : (
                    feed.map((p) => (
                      <Link key={p.id} href={`/groupe?g=${p.group_id}`} className="block rounded-2xl bg-white p-4 shadow-[0_2px_16px_-8px_rgba(0,0,0,0.2)]">
                        <div className="flex items-center gap-3">
                          {p.author?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.author.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-spirit-600/15 text-sm font-bold text-spirit-700">{initials(p.author?.pseudo)}</span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-night-900">{p.author?.pseudo ?? "Membre"}</p>
                            <p className="truncate text-xs">
                              <span className="font-semibold text-spirit-700">{p.group_name}</span>
                              <span className="text-night-900/45"> · {timeAgo(p.created_at)}</span>
                            </p>
                          </div>
                        </div>
                        <RichText text={p.body} className="mt-3 text-[15px] leading-relaxed text-night-900/90" />
                        {p.kind !== "post" ? (
                          <span className="mt-2 inline-block rounded-full bg-spirit-500/12 px-2.5 py-0.5 text-xs font-bold text-spirit-700">{KIND_LABEL[p.kind]}</span>
                        ) : null}
                        <div className="mt-3 flex items-center gap-4 border-t border-night-900/10 pt-3 text-sm text-night-900/60">
                          <span>🙏 {p.reaction_count}</span>
                          <span>💬 {p.comment_count}</span>
                          <span className="ml-auto text-spirit-700">Ouvrir →</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
