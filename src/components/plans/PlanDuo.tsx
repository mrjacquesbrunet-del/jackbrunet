"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { listFollowing, type Profile } from "@/lib/community";
import {
  addDuoNote,
  deleteDuoNote,
  endDuo,
  inviteDuo,
  listDuoNotes,
  respondDuo,
  type DuoNote,
  type PlanDuo,
} from "@/lib/plan-duo";

/**
 * PLAN À DEUX — la carte sous la barre de progression :
 *  - pas de duo : « Faire ce plan à deux » → feuille de choix d'un ami ;
 *  - invitation reçue : accepter / refuser ;
 *  - invitation envoyée : en attente ;
 *  - duo actif : les deux avatars, la progression de chacun, et un départ
 *    discret. Les notes privées par jour vivent dans <DuoNotes/>.
 */

function DeuxGlyphe({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-none stroke-current`} strokeWidth={1.9}>
      <circle cx="8.5" cy="8" r="3.2" />
      <path d="M2.8 19.5a5.7 5.7 0 0 1 11.4 0" strokeLinecap="round" />
      <circle cx="16.8" cy="9" r="2.6" />
      <path d="M15 14.6a4.9 4.9 0 0 1 6.2 4.9" strokeLinecap="round" />
    </svg>
  );
}

export function PlanDuoCard({
  slug,
  title,
  total,
  userId,
  myAvatar,
  myDone,
  duo,
  partnerDone,
  onDuoChange,
}: {
  slug: string;
  title: string;
  total: number;
  userId: string | null;
  myAvatar?: string | null;
  myDone: number;
  duo: PlanDuo | null;
  partnerDone: number;
  onDuoChange: (d: PlanDuo | null) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [friends, setFriends] = useState<Profile[] | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pickerOpen && userId && friends === null) {
      listFollowing(userId).then(setFriends);
    }
  }, [pickerOpen, userId, friends]);

  const filtered = useMemo(() => {
    const list = friends ?? [];
    const q = query.trim().toLowerCase();
    return q ? list.filter((f) => (f.pseudo ?? "").toLowerCase().includes(q)) : list;
  }, [friends, query]);

  if (!userId) return null;

  async function invite(friendId: string) {
    if (busy || !userId) return;
    setBusy(true);
    const d = await inviteDuo(slug, title, userId, friendId);
    setBusy(false);
    if (d) {
      const partner = (friends ?? []).find((f) => f.id === friendId);
      onDuoChange({ ...d, partner });
      setPickerOpen(false);
    }
  }

  const partnerName = duo?.partner?.pseudo ?? "ton binôme";

  return (
    <div className="mx-auto mt-4 max-w-2xl">
      {/* ——— Pas de duo : l'invitation ——— */}
      {!duo ? (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.07]"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-dawn-400/15 text-dawn-300">
            <DeuxGlyphe />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-[15px] font-bold text-cream">Faire ce plan à deux</span>
            <span className="block text-xs text-cream/55">
              Invite un ami : progression partagée et notes privées entre vous.
            </span>
          </span>
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-cream/40" strokeWidth={2}>
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : duo.status === "pending" && duo.invitee_id === userId ? (
        /* ——— Invitation reçue ——— */
        <div className="rounded-3xl border border-dawn-400/40 bg-dawn-400/[0.08] p-4">
          <div className="flex items-center gap-3">
            <Avatar url={duo.partner?.avatar_url ?? null} pseudo={duo.partner?.pseudo ?? ""} size={44} />
            <p className="min-w-0 flex-1 text-sm leading-snug text-cream">
              <span className="font-bold">{partnerName}</span> t&apos;invite à faire ce plan à deux :
              progression partagée et notes privées entre vous.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const ok = await respondDuo(duo.id, true);
                setBusy(false);
                if (ok) onDuoChange({ ...duo, status: "active" });
              }}
              className="flex-1 rounded-full bg-dawn-400 py-2.5 font-display text-sm font-bold text-night-950 disabled:opacity-50"
            >
              Accepter
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await respondDuo(duo.id, false);
                setBusy(false);
                onDuoChange(null);
              }}
              className="flex-1 rounded-full border border-white/20 py-2.5 font-display text-sm font-bold text-cream/70 disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        </div>
      ) : duo.status === "pending" ? (
        /* ——— Invitation envoyée ——— */
        <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <Avatar url={duo.partner?.avatar_url ?? null} pseudo={duo.partner?.pseudo ?? ""} size={40} />
          <p className="min-w-0 flex-1 text-sm text-cream/75">
            Invitation envoyée à <span className="font-bold text-cream">{partnerName}</span> — en attente de sa réponse.
          </p>
          <button
            type="button"
            onClick={async () => {
              await endDuo(duo.id);
              onDuoChange(null);
            }}
            className="shrink-0 text-xs font-bold text-cream/45 underline underline-offset-2"
          >
            Annuler
          </button>
        </div>
      ) : (
        /* ——— Duo actif ——— */
        <div className="rounded-3xl border border-dawn-400/30 bg-white/[0.04] p-4">
          <div className="flex items-center gap-3">
            <span className="flex -space-x-2.5">
              <span className="relative z-10 rounded-full ring-2 ring-night-950">
                <Avatar url={myAvatar ?? null} pseudo="Moi" size={38} />
              </span>
              <span className="rounded-full ring-2 ring-night-950">
                <Avatar url={duo.partner?.avatar_url ?? null} pseudo={duo.partner?.pseudo ?? ""} size={38} />
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-bold text-cream">
                À deux avec {partnerName}
              </p>
              <p className="text-xs text-cream/55">
                Toi : {myDone}/{total} · {partnerName} : {partnerDone}/{total}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                if (!confirm("Mettre fin au plan à deux ?")) return;
                await endDuo(duo.id);
                onDuoChange(null);
              }}
              aria-label="Mettre fin au duo"
              className="shrink-0 text-xs font-bold text-cream/40 underline underline-offset-2"
            >
              Quitter
            </button>
          </div>
          {/* La barre du binôme */}
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cream/10">
            <div
              className="h-full rounded-full bg-spirit-400 transition-all"
              style={{ width: `${total ? Math.round((partnerDone / total) * 100) : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ——— Feuille : choisir l'ami ——— */}
      {pickerOpen ? (
        <div className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center">
          <button type="button" aria-label="Fermer" onClick={() => setPickerOpen(false)} className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" />
          <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-night-900 text-cream sm:rounded-3xl">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-display text-base font-extrabold">Faire ce plan à deux</p>
              <p className="mt-0.5 text-xs text-cream/55">
                Choisis un ami : il recevra une invitation, et vous verrez chacun la progression de l&apos;autre.
              </p>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un ami…"
                className="mt-3 w-full rounded-full border border-white/15 bg-night-950/50 px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
              />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {friends === null ? (
                <p className="px-2 py-4 text-sm text-cream/55">Chargement…</p>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-4 text-sm text-cream/55">
                  {friends.length === 0
                    ? "Tu ne suis encore personne. Va dans Communauté pour trouver des amis."
                    : "Personne ne correspond à cette recherche."}
                </p>
              ) : (
                filtered.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
                    <Avatar url={f.avatar_url ?? null} pseudo={f.pseudo ?? ""} size={40} />
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-cream">{f.pseudo}</span>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => invite(f.id)}
                      className="shrink-0 rounded-full bg-dawn-400 px-4 py-1.5 font-display text-xs font-bold text-night-950 disabled:opacity-50"
                    >
                      Inviter
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Les notes privées du binôme pour UN jour du plan. */
export function DuoNotes({
  duo,
  day,
  userId,
  notes,
  onAdd,
  onDelete,
}: {
  duo: PlanDuo;
  day: number;
  userId: string;
  notes: DuoNote[];
  onAdd: (n: DuoNote) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const dayNotes = notes.filter((n) => n.day === day);

  async function send() {
    if (!draft.trim() || busy) return;
    setBusy(true);
    const n = await addDuoNote(duo.id, userId, day, draft);
    setBusy(false);
    if (n) {
      onAdd({ ...n, author: undefined });
      setDraft("");
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-spirit-500/30 bg-spirit-500/[0.07] p-3.5">
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cream/55">
        <DeuxGlyphe className="h-4 w-4" />
        Entre vous deux
        <span className="font-semibold normal-case tracking-normal text-cream/35">· visible seulement par ton binôme</span>
      </p>
      {dayNotes.length ? (
        <div className="mt-2.5 space-y-2">
          {dayNotes.map((n) => {
            const mine = n.author_id === userId;
            return (
              <div key={n.id} className="flex items-start gap-2">
                <Avatar
                  url={n.author?.avatar_url ?? (mine ? null : duo.partner?.avatar_url ?? null)}
                  pseudo={mine ? "Moi" : n.author?.pseudo ?? duo.partner?.pseudo ?? ""}
                  size={26}
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-white/[0.06] px-3 py-2">
                  <p className="text-[11px] font-bold text-cream/60">
                    {mine ? "Toi" : n.author?.pseudo ?? duo.partner?.pseudo ?? "Binôme"}
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-cream/90">{n.body}</p>
                </div>
                {mine ? (
                  <button
                    type="button"
                    aria-label="Supprimer la note"
                    onClick={async () => {
                      await deleteDuoNote(n.id);
                      onDelete(n.id);
                    }}
                    className="mt-1 shrink-0 text-cream/30 hover:text-red-400"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8}>
                      <path d="M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-cream/45">
          Laisse une note sur ce jour : ce que tu retiens, une question, une prière…
        </p>
      )}
      <div className="mt-2.5 flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="Écrire à ton binôme…"
          className="flex-1 rounded-full border border-white/15 bg-night-950/50 px-3.5 py-2 text-sm text-cream placeholder:text-cream/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || busy}
          aria-label="Envoyer"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2}>
            <path d="M4 12l16-7-4.5 7L20 19zM4 12h11" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
