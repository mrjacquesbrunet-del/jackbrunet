"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/community/useAuth";
import { ACCENTS, type AccentKey } from "@/lib/profile-accent";
import { listPublicGroups, listMyGroups, createGroup, joinByCode, type Group } from "@/lib/groups";

type Tab = "reco" | "mine";
const BG = "#14160E";
const fieldDark =
  "w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-2.5 text-cream placeholder:text-cream/40 outline-none focus:border-dawn-400/60";

function GroupAvatar({ name, accent, size = 52 }: { name: string; accent: AccentKey; size?: number }) {
  const c = ACCENTS[accent] ?? ACCENTS.lime;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold text-white"
      style={{ width: size, height: size, backgroundImage: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
    >
      {(name.trim()[0] ?? "G").toUpperCase()}
    </span>
  );
}

function GroupRow({ g }: { g: Group }) {
  return (
    <Link
      href={`/groupe?g=${g.id}`}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-colors hover:bg-white/[0.07]"
    >
      <GroupAvatar name={g.name} accent={g.accent} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-bold text-cream">{g.name}</p>
        <p className="truncate text-xs text-cream/55">
          {g.member_count ?? 0} membre{(g.member_count ?? 0) > 1 ? "s" : ""}
          {g.verse_reference ? ` · ${g.verse_reference}` : ""}
        </p>
      </div>
      <span className="shrink-0 text-cream/30">→</span>
    </Link>
  );
}

export function GroupsDirectory() {
  const { ready, userId } = useAuth();
  const [tab, setTab] = useState<Tab>("reco");
  const [query, setQuery] = useState("");
  const [reco, setReco] = useState<Group[] | null>(null);
  const [mine, setMine] = useState<Group[] | null>(null);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", verse_text: "", verse_reference: "", accent: "lime" as AccentKey, is_public: true });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState("");

  async function loadReco() {
    setReco(await listPublicGroups(query).then((gs) => gs.sort((a, b) => (b.member_count ?? 0) - (a.member_count ?? 0))));
  }
  async function loadMine() {
    if (userId) setMine(await listMyGroups(userId));
    else setMine([]);
  }

  useEffect(() => {
    if (!ready) return;
    loadReco();
    loadMine();
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

  const wrap = (inner: React.ReactNode) => (
    <section className="relative text-cream" style={{ background: BG, minHeight: "100vh" }}>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10" style={{ background: BG }} />
      {inner}
    </section>
  );

  if (!ready) return wrap(<p className="py-24 text-center text-cream/50">Chargement…</p>);

  if (!userId) {
    return wrap(
      <div className="container-x pb-28 pt-24 text-center">
        <h1 className="font-display text-3xl font-extrabold">Groupes</h1>
        <p className="mt-2 text-cream/60">Connecte-toi pour créer ou rejoindre un groupe.</p>
        <Link href="/communaute" className="btn-primary mt-6 inline-flex">Se connecter</Link>
      </div>,
    );
  }

  return wrap(
    <div className="container-x pb-28 pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Groupes</h1>
          <button type="button" onClick={() => setCreating((c) => !c)} className="btn-primary text-sm">+ Créer</button>
        </div>
        <p className="mt-1 text-sm text-cream/60">Partage plans, percées et sujets de prière, en groupe fermé.</p>

        {creating ? (
          <form onSubmit={submitCreate} className="mt-4 space-y-3 rounded-2xl border border-dawn-400/25 bg-white/[0.04] p-4">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nom du groupe" className={fieldDark} />
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Petit texte d'explication (facultatif)" rows={2} className={fieldDark} />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input value={form.verse_text} onChange={(e) => setForm((f) => ({ ...f, verse_text: e.target.value }))} placeholder="Verset du groupe (optionnel)" className={fieldDark} />
              <input value={form.verse_reference} onChange={(e) => setForm((f) => ({ ...f, verse_reference: e.target.value }))} placeholder="Réf." className={`${fieldDark} sm:w-32`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-cream/55">Couleur</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(Object.keys(ACCENTS) as AccentKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, accent: k }))}
                    aria-label={ACCENTS[k].label}
                    className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-[#14160E] ${form.accent === k ? "ring-cream" : "ring-transparent"}`}
                    style={{ backgroundImage: `linear-gradient(135deg, ${ACCENTS[k].from}, ${ACCENTS[k].to})` }}
                  />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-cream/70">
              <input type="checkbox" checked={form.is_public} onChange={(e) => setForm((f) => ({ ...f, is_public: e.target.checked }))} />
              Visible dans le répertoire (sinon accessible par lien ou invitation)
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="submit" disabled={busy} className="btn-primary text-sm">{busy ? "Création…" : "Créer le groupe"}</button>
              <button type="button" onClick={() => setCreating(false)} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Annuler</button>
            </div>
            {msg ? <p className="text-sm font-semibold text-dawn-300">{msg}</p> : null}
          </form>
        ) : null}

        <div className="mt-5 flex gap-2">
          {[
            { k: "reco" as Tab, label: "Recommandations" },
            { k: "mine" as Tab, label: "Mes groupes" },
          ].map((t) => (
            <button
              key={t.k}
              type="button"
              onClick={() => setTab(t.k)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                tab === t.k ? "bg-dawn-400 text-night-950" : "bg-white/10 text-cream/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "reco" ? (
          <>
            <div className="relative mt-4">
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un groupe…" className={`${fieldDark} pl-10`} />
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 fill-none stroke-cream/40" strokeWidth={1.8}>
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
            </div>

            <form onSubmit={submitCode} className="mt-3 flex items-center gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Code d'invitation" className={`${fieldDark} w-44 uppercase tracking-widest`} />
              <button type="submit" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cream">Rejoindre</button>
              {codeMsg ? <span className="text-xs text-cream/55">{codeMsg}</span> : null}
            </form>

            <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-cream/45">
              {query ? "Résultats" : "Groupes recommandés"}
            </p>
            <div className="mt-2 space-y-2.5">
              {reco === null ? (
                <p className="text-sm text-cream/50">Chargement…</p>
              ) : reco.length === 0 ? (
                <p className="text-sm text-cream/55">{query ? "Aucun groupe trouvé." : "Aucun groupe public pour l'instant. Crée le premier !"}</p>
              ) : (
                reco.map((g) => <GroupRow key={g.id} g={g} />)
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 space-y-2.5">
            {mine === null ? (
              <p className="text-sm text-cream/50">Chargement…</p>
            ) : mine.length === 0 ? (
              <p className="text-sm text-cream/55">Tu n'es dans aucun groupe. Rejoins-en un ou crée le tien.</p>
            ) : (
              mine.map((g) => <GroupRow key={g.id} g={g} />)
            )}
          </div>
        )}
      </div>
    </div>,
  );
}
