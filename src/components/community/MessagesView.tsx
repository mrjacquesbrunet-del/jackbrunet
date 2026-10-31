"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { Avatar } from "@/components/community/Avatar";
import { VerifiedBadge } from "@/components/community/VerifiedBadge";
import { VoiceRecorderButton, VoiceNotePlayer } from "@/components/community/VoiceNote";
import { voiceExpired } from "@/lib/voice";
import { presenceLabel, presenceDe } from "@/lib/presence";
import { getSupabase } from "@/lib/supabase";
import { getProfile, searchProfiles, type Profile } from "@/lib/community";
import {
  listConversations,
  listMessages,
  markMessagesRead,
  markConversationUnread,
  sendMessage,
  messageReactionsFor,
  setMessageReaction,
  envoyerPhotoMessage,
  modifierMessage,
  supprimerMessage,
  DELAI_MODIF_MS,
  type Conversation,
  type Message,
  type MessageReaction,
} from "@/lib/messages";
import { localeApp } from "@/lib/i18n";
import { openExternal } from "@/lib/external";
import { EnLigneMaintenant } from "@/components/community/EnLigneMaintenant";
import { BarreReactions, PucesReactions, gesteReaction, ICONES_BULLE, type ActionBulle } from "@/components/community/Reactions";
import { TirerPourRafraichir } from "@/components/ui/TirerPourRafraichir";
import { ActiverNotifications } from "@/components/app/ActiverNotifications";
import { urlLegere, repliImage } from "@/lib/image-legere";

/** Date discrète d'une conversation : heure si aujourd'hui, « hier », puis
 * « il y a X j », puis la date courte. */
function convoWhen(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "";
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString(localeApp(), { hour: "2-digit", minute: "2-digit" });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "hier";
  const days = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (days <= 7) return `il y a ${days} j`;
  return d.toLocaleDateString(localeApp(), { day: "numeric", month: "short" });
}

/** Étiquette de jour dans le fil : « Aujourd'hui », « Hier », « 12 août ». */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString(localeApp(), {
    day: "numeric",
    month: "long",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

export function MessagesView() {
  const { ready, userId } = useAuth();
  const params = useSearchParams();
  const partnerId = params.get("u");

  if (!isSupabaseConfigured) {
    return <section className="container-x py-24 text-center text-night-900/55">Messagerie bientôt disponible.</section>;
  }
  if (!ready) return <section className="container-x py-24 text-center text-night-900/50">Chargement…</section>;
  if (!userId) {
    return (
      <section className="container-x py-24 text-center text-night-900/60">
        Connecte-toi pour accéder à tes messages.{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Rejoindre
        </Link>
      </section>
    );
  }
  return partnerId? (
    <Conversation meId={userId} partnerId={partnerId} />
  ): (
    <Inbox />
  );
}

/* ---------- Recherche d'une personne à qui écrire ---------- */
function StartSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => setResults(await searchProfiles(q, 8)), 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q]);

  return (
    <div className="relative">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-night-900/40"
          strokeWidth={1.8}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une personne à qui écrire…"
          className="field w-full pl-10"
        />
      </div>
      {open && q.trim().length >= 2? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
            {results.length === 0? (
              <p className="px-4 py-4 text-sm text-night-900/45">Aucun membre trouvé.</p>
            ): (
              <ul className="max-h-80 overflow-y-auto">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/messages?u=${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-night-900/[0.04]"
                    >
                      <Avatar pseudo={p.pseudo} url={p.avatar_url} size={34} />
                      <span className="flex items-center gap-1 font-semibold text-night-900/85">
                        {p.pseudo}
                        {p.verified? <VerifiedBadge className="h-3.5 w-3.5" />: null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ): null}
    </div>
  );
}

/* ---------- Liste des conversations ---------- */
function Inbox() {
  const { userId } = useAuth();
  const [convos, setConvos] = useState<Conversation[] | null>(null);

  const charger = useCallback(async () => {
    // Tri garanti : la conversation au message le plus récent en premier.
    const cs = await listConversations();
    setConvos([...cs].sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime()));
  }, []);
  useEffect(() => {
    void charger();
  }, [charger]);

  /** Repasse la conversation en « non lu » (pour y revenir plus tard). */
  async function toUnread(c: Conversation) {
    if (!userId) return;
    setConvos((prev) =>
      prev? prev.map((x) => (x.partner_id === c.partner_id? {...x, unread: Math.max(1, x.unread) }: x)): prev,
    );
    await markConversationUnread(userId, c.partner_id);
  }

  /** Marque la conversation comme lue sans l'ouvrir. */
  async function toRead(c: Conversation) {
    if (!userId) return;
    setConvos((prev) =>
      prev? prev.map((x) => (x.partner_id === c.partner_id? {...x, unread: 0 }: x)): prev,
    );
    await markMessagesRead(userId, c.partner_id);
  }

  return (
    <section className="sous-barre-app container-x pb-16 pt-24 sm:pt-28">
      <TirerPourRafraichir onRefresh={charger} />
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold">Messages</h1>
        <p className="mt-1 text-sm text-night-900/55">Tes conversations privées avec la communauté.</p>

        {/* Loupe: chercher quelqu'un à qui écrire */}
        <div className="mt-4">
          <StartSearch />
        </div>
        <ActiverNotifications variante="bandeau" />
        <EnLigneMaintenant tone="light" className="mt-5" />

        {convos === null? (
          <p className="mt-8 text-night-900/50">Chargement…</p>
        ): convos.length === 0? (
          <div className="mt-8 rounded-3xl border border-night-900/10 bg-white p-6 text-center">
            <p className="font-semibold text-night-900/80">Aucune conversation pour l'instant.</p>
            <p className="mt-1 text-sm text-night-900/55">
              Ouvre le profil d'un membre et touche « Message » pour lui écrire.
            </p>
          </div>
        ): (
          <ul className="mt-6 space-y-2">
            {convos.map((c) => (
              <li
                key={c.partner_id}
                className="flex items-center gap-1 rounded-2xl border border-night-900/10 bg-white p-1.5 transition-colors hover:bg-night-900/[0.02]"
              >
                <Link
                  href={`/messages?u=${c.partner_id}`}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1.5"
                >
                  <Avatar pseudo={c.partner?.pseudo} url={c.partner?.avatar_url} size={44} streak={c.partner?.streak_days} badge={c.partner?.badge_tier} />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`flex items-center gap-1 text-night-900/85 ${
                        c.unread > 0? "font-bold": "font-semibold"
                      }`}
                    >
                      <span className="min-w-0 truncate">{c.partner?.pseudo?? "Membre"}</span>
                      {c.partner?.verified? <VerifiedBadge className="h-4 w-4 shrink-0" />: null}
                      <span className="ml-auto shrink-0 pl-2 text-[11px] font-medium text-night-900/40">
                        {convoWhen(c.last_at)}
                      </span>
                    </p>
                    <p
                      className={`truncate text-sm ${
                        c.unread > 0? "font-semibold text-night-900/80": "text-night-900/55"
                      }`}
                    >
                      {c.last_body || "Pièce jointe"}
                    </p>
                  </div>
                </Link>
                {c.unread > 0? (
                  <button
                    type="button"
                    onClick={() => toRead(c)}
                    aria-label="Marquer comme lu"
                    title="Marquer comme lu"
                    className="mr-1 grid h-9 min-w-[26px] shrink-0 place-items-center rounded-full bg-dawn-400 px-2 text-xs font-bold text-night-900 active:scale-95"
                  >
                    {c.unread}
                  </button>
                ): (
                  <button
                    type="button"
                    onClick={() => toUnread(c)}
                    aria-label="Remettre en non lu"
                    title="Remettre en non lu (pour y revenir plus tard)"
                    className="mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-night-900/35 transition-colors hover:bg-night-900/[0.06] hover:text-night-900/70 active:scale-95"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-none stroke-current" strokeWidth={1.7} aria-hidden>
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5zM4.5 7l7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="19" cy="6" r="4" className="fill-dawn-400 stroke-none" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Fil de discussion ---------- */
function Conversation({ meId, partnerId }: { meId: string; partnerId: string }) {
  const [partner, setPartner] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // Brouillon gardé si on quitte la conversation (par personne).
  const cleBrouillon = `jb.brouillon.dm.${partnerId}`;
  const [text, setTextBrut] = useState(() => {
    try {
      return localStorage.getItem(`jb.brouillon.dm.${partnerId}`) ?? "";
    } catch {
      return "";
    }
  });
  const setText = useCallback(
    (v: string) => {
      setTextBrut(v);
      try {
        if (v) localStorage.setItem(cleBrouillon, v);
        else localStorage.removeItem(cleBrouillon);
      } catch {
        /* stockage indisponible */
      }
    },
    [cleBrouillon],
  );
  const [busy, setBusy] = useState(false);
  const [enReponse, setEnReponse] = useState<Message | null>(null);
  const [enModif, setEnModif] = useState<Message | null>(null);
  const [photoPleinEcran, setPhotoPleinEcran] = useState<string | null>(null);
  const [envoiPhoto, setEnvoiPhoto] = useState(false);
  const [surligne, setSurligne] = useState<string | null>(null);
  const champRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  // Présence affichée seulement si son réglage « en ligne » me le permet.
  const [vuLe, setVuLe] = useState<string | null>(null);
  useEffect(() => {
    let vivant = true;
    const lire = () => void presenceDe(partnerId).then((v) => vivant && setVuLe(v));
    lire();
    const t = setInterval(lire, 60_000);
    return () => {
      vivant = false;
      clearInterval(t);
    };
  }, [partnerId]);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [pickerFor, setPickerForBrut] = useState<string | null>(null);
  // Bulle près du bas de l'écran : le menu s'ouvre au-dessus (sinon la barre
  // d'envoi le cache).
  const [menuEnHaut, setMenuEnHaut] = useState(false);
  const setPickerFor = useCallback((id: string | null) => {
    if (id) {
      const r = document.getElementById(`msg-${id}`)?.getBoundingClientRect();
      setMenuEnHaut(!!r && r.bottom > window.innerHeight - 300);
    }
    setPickerForBrut(id);
  }, []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingChanRef = useRef<ReturnType<NonNullable<ReturnType<typeof getSupabase>>["channel"]> | null>(null);
  const typingSentRef = useRef(0);
  const typingOffRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canal temps réel « X est en train d'écrire… » (partagé par les deux).
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const name = `dm-typing:${[meId, partnerId].sort().join(":")}`;
    const chan = sb.channel(name, { config: { broadcast: { self: false } } });
    chan.on("broadcast", { event: "typing" }, (msg) => {
      const from = (msg as { payload?: { from?: string } }).payload?.from;
      if (from !== partnerId) return;
      setPartnerTyping(true);
      if (typingOffRef.current) clearTimeout(typingOffRef.current);
      typingOffRef.current = setTimeout(() => setPartnerTyping(false), 3500);
    });
    chan.subscribe();
    typingChanRef.current = chan;
    return () => {
      if (typingOffRef.current) clearTimeout(typingOffRef.current);
      typingChanRef.current = null;
      void sb.removeChannel(chan);
    };
  }, [meId, partnerId]);

  /** Signale que je tape (throttlé à 1 envoi / 1,5 s). */
  const signalTyping = useCallback(() => {
    const now = Date.now();
    if (now - typingSentRef.current < 1500) return;
    typingSentRef.current = now;
    void typingChanRef.current?.send({ type: "broadcast", event: "typing", payload: { from: meId } });
  }, [meId]);

  const refresh = useCallback(async () => {
    const msgs = await listMessages(meId, partnerId);
    setMessages(msgs);
    setReactions(await messageReactionsFor(msgs.map((m) => m.id)));
    await markMessagesRead(meId, partnerId);
  }, [meId, partnerId]);

  // En direct : un message ou une réaction de la conversation arrive tout de
  // suite (le relevé périodique reste en secours, plus espacé).
  useEffect(() => {
    const sb = getSupabase();
    if (!sb) return;
    const chan = sb
      .channel(`dm-live:${[meId, partnerId].sort().join(":")}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${meId}` }, (p) => {
        // Nouveau message, modifié ou supprimé par l'autre.
        if (((p.new ?? p.old) as { sender_id?: string }).sender_id === partnerId) void refresh();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => void refresh())
      .subscribe();
    return () => {
      void sb.removeChannel(chan);
    };
  }, [meId, partnerId, refresh]);

  /** Ma réaction sur un message. */
  const maReaction = (id: string) => reactions.find((r) => r.message_id === id && r.user_id === meId)?.emoji ?? null;
  /** Pose / change / retire ma réaction (optimiste). */
  async function reagir(id: string, emoji: string) {
    const suivante = maReaction(id) === emoji ? null : emoji;
    setPickerFor(null);
    setReactions((prev) => {
      const reste = prev.filter((r) => !(r.message_id === id && r.user_id === meId));
      return suivante ? [...reste, { message_id: id, user_id: meId, emoji: suivante }] : reste;
    });
    await setMessageReaction(id, meId, suivante);
  }

  useEffect(() => {
    getProfile(partnerId).then(setPartner);
  }, [partnerId]);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000); // secours si le temps réel ne passe pas
    return () => clearInterval(t);
  }, [refresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send() {
    if (!text.trim()) return;
    setBusy(true);
    const body = text.trim();
    setText("");
    if (enModif) {
      const id = enModif.id;
      setEnModif(null);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, body, edited_at: new Date().toISOString() } : m)));
      if (!(await modifierMessage(id, body))) alert("Ce message ne peut plus être modifié (15 minutes maximum).");
    } else {
      const replyTo = enReponse?.id ?? null;
      setEnReponse(null);
      await sendMessage(meId, partnerId, body, null, { replyTo });
    }
    await refresh();
    setBusy(false);
  }

  /** Envoie un message vocal (déjà téléversé — expire après 7 jours). */
  async function sendVoice(audioUrl: string) {
    setBusy(true);
    const replyTo = enReponse?.id ?? null;
    setEnReponse(null);
    await sendMessage(meId, partnerId, "", audioUrl, { replyTo });
    await refresh();
    setBusy(false);
  }

  /** Envoie une photo choisie dans la galerie (ou prise à l'instant). */
  async function sendPhoto(file: File | undefined) {
    if (!file) return;
    setEnvoiPhoto(true);
    const url = await envoyerPhotoMessage(meId, file);
    const replyTo = enReponse?.id ?? null;
    setEnReponse(null);
    const ok = url ? await sendMessage(meId, partnerId, "", null, { imageUrl: url, replyTo }) : false;
    setEnvoiPhoto(false);
    if (!ok) alert("La photo n'a pas pu être envoyée. Réessaie dans un instant.");
    await refresh();
  }

  function repondreA(m: Message) {
    setEnModif(null);
    setEnReponse(m);
    champRef.current?.focus();
  }

  /** Actions de l'appui long : Répondre, Copier, Modifier, Supprimer. */
  function actionsDe(m: Message): ActionBulle[] {
    const mine = m.sender_id === meId;
    const a: ActionBulle[] = [{ label: "Répondre", icone: ICONES_BULLE.repondre, onClick: () => repondreA(m) }];
    if (m.body)
      a.push({
        label: "Copier",
        icone: ICONES_BULLE.copier,
        onClick: () => void navigator.clipboard?.writeText(m.body).catch(() => undefined),
      });
    if (mine && m.body && !m.audio_url && !m.image_url && Date.now() - new Date(m.created_at).getTime() < DELAI_MODIF_MS)
      a.push({
        label: "Modifier",
        icone: ICONES_BULLE.modifier,
        onClick: () => {
          setEnReponse(null);
          setEnModif(m);
          setText(m.body);
          champRef.current?.focus();
        },
      });
    if (mine)
      a.push({
        label: "Supprimer pour tous",
        icone: ICONES_BULLE.supprimer,
        danger: true,
        onClick: async () => {
          if (!confirm("Supprimer ce message pour tout le monde ?")) return;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, body: "", audio_url: null, image_url: null, deleted_at: new Date().toISOString() } : x)));
          if (!(await supprimerMessage(m.id))) alert("Suppression impossible pour l'instant.");
          await refresh();
        },
      });
    return a;
  }

  /** Toucher une citation : on remonte jusqu'au message d'origine. */
  function allerA(id: string) {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    setSurligne(id);
    setTimeout(() => setSurligne(null), 1600);
  }

  // « Vu » : id de mon dernier message lu par l'autre.
  const lastSeenId = [...messages].reverse().find((m) => m.sender_id === meId && m.read)?.id ?? null;

  return (
    <section className="sous-barre-app container-x pb-28 pt-24 sm:pt-28">
      <TirerPourRafraichir onRefresh={refresh} />
      <div className="mx-auto max-w-2xl">
        {/* En-tête conversation */}
        <div className="flex items-center gap-3">
          <Link href="/messages" aria-label="Retour" className="text-night-900/50 hover:text-night-900/80">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link href={`/membre?u=${partnerId}`} className="flex items-center gap-2.5">
            <span className="relative">
              <Avatar pseudo={partner?.pseudo} url={partner?.avatar_url} size={40} streak={partner?.streak_days} badge={partner?.badge_tier} />
              {presenceLabel(vuLe)?.online ? (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
              ) : null}
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1 font-display text-lg font-bold leading-tight">
                {partner?.pseudo?? "Membre"}
                {partner?.verified? <VerifiedBadge className="h-4 w-4" />: null}
              </span>
              {partnerTyping ? (
                <span className="text-xs font-semibold italic text-spirit-600">est en train d&apos;écrire…</span>
              ) : presenceLabel(vuLe) ? (
                <span className="text-xs text-night-900/50">{presenceLabel(vuLe)!.label}</span>
              ) : null}
            </span>
          </Link>
        </div>

        {/* Messages */}
        <div className="mt-5 space-y-2">
          {messages.length === 0? (
            <p className="py-8 text-center text-sm text-night-900/45">
              Écris le premier message à {partner?.pseudo?? "ce membre"}.
            </p>
          ): (
            messages.map((m, i) => {
              const mine = m.sender_id === meId;
              // Séparateur de jour quand la date change dans le fil.
              const newDay =
                i === 0 ||
                new Date(messages[i - 1].created_at).toDateString() !==
                  new Date(m.created_at).toDateString();
              return (
                <div key={m.id} id={`msg-${m.id}`} className={`flex scroll-mt-28 flex-col ${mine? "items-end": "items-start"}`}>
                  {newDay ? (
                    <p className="my-2 w-full self-center text-center text-[11px] font-semibold text-night-900/35">
                      {dayLabel(m.created_at)}
                    </p>
                  ) : null}
                  {m.story_image ? (
                    <div className={`mb-1 flex flex-col ${mine ? "items-end" : "items-start"}`}>
                      <span className="mb-1 px-1 text-[11px] font-semibold text-night-900/45">
                        {mine ? "Tu as répondu à sa story" : "A répondu à ta story"}
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={urlLegere(m.story_image, 96)}
                        onError={(e) => {
                          // Story supprimée : on retire l'image plutôt qu'une image cassée.
                          if (e.currentTarget.src.includes("/render/image/")) repliImage(m.story_image)?.(e);
                          else e.currentTarget.style.display = "none";
                        }}
                        alt="Story"
                        loading="lazy"
                        className="h-36 w-24 rounded-2xl border border-night-900/10 object-cover"
                      />
                    </div>
                  ) : null}
                  <div className={`relative flex w-full flex-col ${mine ? "items-end" : "items-start"}`}>
                  {pickerFor === m.id && !m.deleted_at ? (
                    <BarreReactions
                      mine={maReaction(m.id)}
                      onPick={(e) => void reagir(m.id, e)}
                      onClose={() => setPickerFor(null)}
                      className={`${menuEnHaut ? HAUT_BARRE[actionsDe(m).length] : "-top-12"} ${mine ? "right-0" : "left-0"}`}
                      actions={actionsDe(m)}
                      menuClassName={`${menuEnHaut ? "bottom-full mb-1" : "top-full mt-1"} ${mine ? "right-0" : "left-0"}`}
                    />
                  ) : null}
                  {m.deleted_at ? (
                    <div
                      className={`flex max-w-[80%] items-center gap-1.5 rounded-2xl border border-dashed border-night-900/15 px-4 py-2 text-[14px] italic text-night-900/45`}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M6 6l12 12" strokeLinecap="round" />
                      </svg>
                      {mine ? "Tu as supprimé ce message" : "Message supprimé"}
                    </div>
                  ) : (
                  <div
                    translate="no"
                    {...gesteReaction(
                      () => setPickerFor(m.id),
                      () => {
                        if (maReaction(m.id) !== "❤️") void reagir(m.id, "❤️");
                      },
                      () => repondreA(m),
                    )}
                    className={`max-w-[80%] select-none whitespace-pre-wrap rounded-2xl text-[15px] leading-snug transition-shadow ${
                      m.image_url && !m.body ? "p-1" : "px-4 py-2"
                    } ${
                      mine
? "bg-dawn-400 text-night-900"
: "border border-night-900/10 bg-white text-night-900/85"
                    } ${surligne === m.id ? "ring-2 ring-spirit-500" : ""}`}
                  >
                    {m.reply_to ? (
                      <Citation
                        cible={messages.find((x) => x.id === m.reply_to) ?? null}
                        meId={meId}
                        partenaire={partner?.pseudo ?? "Membre"}
                        mine={mine}
                        onClick={() => allerA(m.reply_to!)}
                      />
                    ) : null}
                    {m.image_url ? (
                      <button type="button" onClick={() => setPhotoPleinEcran(m.image_url!)} className="block" aria-label="Voir la photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={urlLegere(m.image_url, 480)}
                          onError={repliImage(m.image_url)}
                          alt="Photo"
                          loading="lazy"
                          className="max-h-72 w-60 max-w-full rounded-xl object-cover"
                        />
                      </button>
                    ) : null}
                    {m.audio_url ? (
                      voiceExpired(m.created_at) ? (
                        <span className="text-sm italic opacity-60">Note vocale expirée (les vocaux durent 7 jours)</span>
                      ) : (
                        <div className="min-w-[13rem]">
                          <VoiceNotePlayer src={m.audio_url} />
                        </div>
                      )
                    ) : null}
                    <TexteAvecLiens texte={m.body} mine={mine} />
                    {m.edited_at ? <span className="ml-1.5 text-[10px] font-semibold opacity-50">modifié</span> : null}
                  </div>
                  )}
                  <PucesReactions
                    emojis={reactions.filter((r) => r.message_id === m.id).map((r) => r.emoji)}
                    mine={maReaction(m.id)}
                    onPick={(e) => void reagir(m.id, e)}
                    className={`-mt-1.5 ${mine ? "mr-2" : "ml-2"}`}
                  />
                  </div>
                  {mine && m.id === lastSeenId ? (
                    <p className="mt-0.5 pr-1 text-[10px] font-semibold text-night-900/40">Vu</p>
                  ) : null}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Barre d'envoi */}
      {/* La classe global-audio-bar la cale sur le menu du bas, mais remet son
          rembourrage bas à 0 : on le redonne ici, sinon le champ touche le menu. */}
      <div
        className="global-audio-bar envoi-bas fixed inset-x-0 z-[50] border-t border-night-900/10 bg-white/95 p-3 backdrop-blur"
      >
        {enReponse || enModif ? (
          <div className="container-x mb-2 flex max-w-2xl items-center gap-2 px-0">
            <div className="min-w-0 flex-1 rounded-xl border-l-[3px] border-spirit-500 bg-night-900/[0.04] px-3 py-1.5">
              <p className="text-[11px] font-bold text-spirit-700">
                {enModif ? "Modifier le message" : enReponse!.sender_id === meId ? "Réponse à toi-même" : `Réponse à ${partner?.pseudo ?? "Membre"}`}
              </p>
              <p className="truncate text-[13px] text-night-900/60">{apercuMessage(enModif ?? enReponse!)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (enModif) setText("");
                setEnReponse(null);
                setEnModif(null);
              }}
              aria-label="Annuler"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-night-900/50 hover:bg-night-900/[0.06]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ) : null}
        <div className="container-x flex max-w-2xl items-center gap-2 px-0">
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            void sendPhoto(e.target.files?.[0]);
            e.target.value = "";
          }} />
          {!enModif ? (
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={envoiPhoto}
              aria-label="Envoyer une photo"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-night-900/55 transition-colors hover:bg-night-900/[0.06] disabled:opacity-40"
            >
              {envoiPhoto ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-night-900/20 border-t-night-900/60" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-none stroke-current" strokeWidth={1.8} aria-hidden>
                  <rect x="3.5" y="5" width="17" height="14" rx="3" />
                  <circle cx="9" cy="10" r="1.6" />
                  <path d="M4 17l4.5-4.5 3.5 3.5 2.5-2.5L20 18" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          ) : null}
          <input
            ref={champRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              signalTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            placeholder="Ton message…"
            className="field w-full"
            aria-label="Message"
          />
          {!enModif ? <VoiceRecorderButton userId={meId} onSend={sendVoice} /> : null}
          <button
            type="button"
            onClick={send}
            disabled={busy ||!text.trim()}
            className="btn-primary shrink-0 disabled:opacity-40"
          >
            {enModif ? "OK" : "Envoyer"}
          </button>
        </div>
      </div>

      {/* Photo en plein écran */}
      {photoPleinEcran ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo"
          className="fixed inset-0 z-[170] grid place-items-center bg-black/95 p-3"
          onClick={() => setPhotoPleinEcran(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoPleinEcran} alt="Photo" className="max-h-full max-w-full rounded-lg object-contain" />
          <button
            type="button"
            aria-label="Fermer"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </section>
  );
}

/** Barre d'émojis au-dessus du menu ouvert vers le haut (selon le nombre d'actions). */
const HAUT_BARRE: Record<number, string> = { 1: "-top-[102px]", 2: "-top-[142px]", 3: "-top-[182px]", 4: "-top-[222px]" };

/** Texte court d'un message (citation, bandeau « Réponse à… »). */
function apercuMessage(m: Message): string {
  if (m.deleted_at) return "Message supprimé";
  if (m.body) return m.body;
  if (m.image_url) return "Photo";
  if (m.audio_url) return "Message vocal";
  return "Message";
}

/** Citation du message auquel on répond, en haut de la bulle. */
function Citation({
  cible,
  meId,
  partenaire,
  mine,
  onClick,
}: {
  cible: Message | null;
  meId: string;
  partenaire: string;
  mine: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1.5 block w-full min-w-[9rem] rounded-xl border-l-[3px] px-2.5 py-1 text-left ${
        mine ? "border-night-900/40 bg-night-900/10" : "border-spirit-500 bg-night-900/[0.04]"
      }`}
    >
      <span className={`block text-[11px] font-bold ${mine ? "text-night-900/70" : "text-spirit-700"}`}>
        {!cible ? "Message" : cible.sender_id === meId ? "Toi" : partenaire}
      </span>
      <span className="line-clamp-2 block whitespace-normal text-[13px] opacity-75">
        {cible ? apercuMessage(cible) : "Message plus disponible"}
      </span>
    </button>
  );
}

/** Les liens (https://… ou jackbrunet.com/…) d'un message deviennent cliquables. */
const LIEN = /(https?:\/\/[^\s]+|(?:www\.)?jackbrunet\.com\/[^\s]*)/gi;
function TexteAvecLiens({ texte, mine }: { texte: string; mine: boolean }) {
  if (!texte) return null;
  const morceaux = texte.split(LIEN);
  return (
    <>
      {morceaux.map((t, i) =>
        i % 2 === 1 ? (
          <button
            key={i}
            type="button"
            onClick={() => void openExternal(/^https?:/i.test(t) ? t : `https://${t.replace(/^www\./i, "")}`)}
            className={`break-all text-left font-semibold underline underline-offset-2 ${mine ? "text-night-950" : "text-spirit-700"}`}
          >
            {t}
          </button>
        ) : (
          <span key={i}>{t}</span>
        ),
      )}
      {morceaux[1] ? <ApercuLien url={morceaux[1]} mine={mine} /> : null}
    </>
  );
}

/** Identifiant d'une vidéo YouTube (youtu.be, watch?v=, shorts, live). */
function idYouTube(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([\w-]{11})/i);
  return m ? m[1] : null;
}

/** Aperçu du premier lien d'un message : miniature YouTube, carte RHEMA, ou
 * le nom du site. (Aucune requête vers le site lui-même.) */
export function ApercuLien({ url, mine, sombre = false }: { url: string; mine?: boolean; sombre?: boolean }) {
  const complet = /^https?:/i.test(url) ? url : `https://${url.replace(/^www\./i, "")}`;
  let hote = "";
  let chemin = "";
  try {
    const u = new URL(complet);
    hote = u.hostname.replace(/^www\./, "");
    chemin = decodeURIComponent(u.pathname).replace(/\/+$/, "");
  } catch {
    return null;
  }
  const yt = idYouTube(complet);
  const rhema = /(^|\.)jackbrunet\.com$/i.test(hote);
  const RUBRIQUES: Record<string, string> = {
    bible: "Bible",
    plans: "Plans de lecture",
    ecouter: "Podcasts",
    communaute: "Mur de prière",
    meditation: "Méditation",
    devotion: "Rhema du jour",
    formations: "Formations",
    groupes: "Groupes",
    soutien: "Soutenir",
  };
  const rubrique = rhema ? RUBRIQUES[chemin.split("/")[1] ?? ""] ?? "RHEMA" : null;
  const cadre = sombre
    ? "border-white/10 bg-white/[0.06] text-cream"
    : mine
      ? "border-night-900/15 bg-white/60 text-night-900"
      : "border-night-900/10 bg-night-900/[0.03] text-night-900";
  return (
    <button
      type="button"
      onClick={() => void openExternal(complet)}
      className={`mt-2 block w-60 max-w-full overflow-hidden rounded-xl border text-left ${cadre}`}
    >
      {yt ? (
        <span className="relative block aspect-video w-full bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
                <path d="M8 5.5v13l10.5-6.5z" />
              </svg>
            </span>
          </span>
        </span>
      ) : null}
      <span className="flex items-center gap-2 px-3 py-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${rhema ? "bg-night-900 text-dawn-400" : sombre ? "bg-white/10" : "bg-night-900/[0.06]"}`}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.8} aria-hidden>
            {yt ? (
              <>
                <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
                <path d="M10 9.3v5.4l4.6-2.7z" strokeLinejoin="round" />
              </>
            ) : rhema ? (
              <path d="M5 4.5h9a5 5 0 0 1 0 10H9.5M9.5 14.5L15 20M5 4.5V20" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
              </>
            )}
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-bold">{yt ? "Vidéo YouTube" : rhema ? `RHEMA · ${rubrique}` : hote}</span>
          <span className="block truncate text-[11px] opacity-55">{yt ? "youtube.com" : rhema ? "jackbrunet.com" + (chemin || "") : "Ouvrir le lien"}</span>
        </span>
      </span>
    </button>
  );
}
