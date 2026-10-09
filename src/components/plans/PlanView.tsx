"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { asset, mediaUrl } from "@/lib/asset";
import { usePlanProgress } from "@/lib/plan-progress";
import { Celebration } from "@/components/ui/Celebration";
import { PlanRating } from "@/components/plans/PlanRating";
import { PlanJour, dureeJour } from "@/components/plans/PlanJour";
import { AuthorCard } from "@/components/plans/AuthorCard";
import { appShareUrl } from "@/config/app-links";
import { DEFAULT_AUTHOR, type AuthorInfo } from "@/config/author";
import { useAuth } from "@/components/community/useAuth";
import { getSupabase } from "@/lib/supabase";
import { getProfile, isPlanSaved, togglePlanSave } from "@/lib/community";
import { PlanDuoCard } from "@/components/plans/PlanDuo";
import {
  getDuoForPlan,
  listDuoChecks,
  listDuoNotes,
  setDuoCheck,
  syncDuoChecks,
  type DuoNote,
  type PlanDuo,
} from "@/lib/plan-duo";
import type { ThemePlan } from "@/lib/types";
import type { AudioTrack } from "@/lib/audio-library";
import { useContenu } from "@/lib/contenu-i18n";
import { lienFranceSeulement, offresFrance, useLangue } from "@/lib/i18n";
import { useAudiosTraduits } from "@/lib/audio-i18n";

/** Photo de l'auteur (bucket public « audiovf »), repli monogramme. */
const AVATARS = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["auteurjack.jpg", "auteurjack.png", "pasteur-jack.jpg"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl
  );
})();

function PlanAuthor({ name, photoSrc }: { name: string; photoSrc?: string }) {
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState(false);
  const src = photoSrc ?? AVATARS[i];
  return src && !broken ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      onError={() => {
        if (photoSrc || i + 1 >= AVATARS.length) setBroken(true);
        else setI((n) => n + 1);
      }}
      className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-dawn-400/70"
    />
  ) : (
    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-spirit-500 font-display text-sm font-extrabold text-cream ring-2 ring-dawn-400/70">
      {name.replace(/^Pasteur\s+/i, "").slice(0, 1)}
    </span>
  );
}

const CheckRond = ({ className = "h-7 w-7" }: { className?: string }) => (
  <span className={`grid shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 ${className}`}>
    <svg viewBox="0 0 24 24" className="h-[55%] w-[55%] fill-none stroke-current" strokeWidth={3}>
      <path d="M5 12l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

/**
 * Fiche d'un plan de lecture, sur le modèle de la formation : l'affiche du
 * plan, le bouton Commencer / Reprendre, la présentation, puis « Mon
 * parcours » avec tous les jours. Chaque jour s'ouvre en plein écran
 * (PlanJour) ; on peut lire dans l'ordre, rattraper un jour ou prendre de
 * l'avance : les jours terminés sont cochés.
 */
export function PlanView({
  plan: planFr,
  audioMap = {},
}: {
  plan: ThemePlan;
  audioMap?: Record<string, string>;
}) {
  // Plan dans la langue de l'app (anglais, portugais) dès que sa traduction
  // est chargée ; la narration audio n'existe qu'en français.
  const plansTr = useContenu<{ items: ThemePlan[] }>("plans");
  // La couverture vient toujours du plan français (elle peut être ajoutée
  // après la traduction).
  const planTr = plansTr?.items?.find((p) => p.slug === planFr.slug);
  const plan = planTr ? { ...planTr, cover: planFr.cover ?? planTr.cover } : planFr;
  // Narration des jours : française, ou traduite quand elle est enregistrée
  // (audio/<langue>/plan-<slug>-<jour>.mp3).
  const langue = useLangue();
  const audiosTr = useAudiosTraduits(
    langue === "fr" ? [] : planFr.days.map((d) => `plan-${planFr.slug}-${d.day}.mp3`),
  );
  if (langue !== "fr") {
    audioMap = Object.fromEntries(
      planFr.days.flatMap((d, k) => (audiosTr?.[k] ? [[String(d.day), audiosTr[k] as string]] : [])),
    );
  }
  const progress = usePlanProgress(plan.slug);
  const { userId } = useAuth();
  const total = plan.days.length;
  const doneCount = plan.days.filter((d) => progress.isDone(d.day)).length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;
  const complete = total > 0 && doneCount >= total;
  const author = plan.author ?? DEFAULT_AUTHOR.name;
  const isDefaultAuthor = author === DEFAULT_AUTHOR.name;
  const minutesParJour = useMemo(
    () => (total ? Math.round(plan.days.reduce((n, d) => n + dureeJour(d), 0) / total) : 0),
    [plan.days, total],
  );

  // Fiche auteur : les champs du plan surchargent l'auteur par défaut (Jack).
  // Un plan signé par quelqu'un d'autre n'hérite ni de la bio, ni de
  // l'Instagram, ni des ressources, ni de la photo de Jack.
  const authorInfo: AuthorInfo = isDefaultAuthor
    ? {
        name: author,
        role: plan.authorRole ?? DEFAULT_AUTHOR.role,
        bio: plan.authorBio ?? DEFAULT_AUTHOR.bio,
        instagram: plan.authorInstagram ?? DEFAULT_AUTHOR.instagram,
        resources: (plan.authorResources?.length ? plan.authorResources : DEFAULT_AUTHOR.resources).filter(
          (r) => offresFrance(langue) || !lienFranceSeulement(r.url),
        ),
      }
    : {
        name: author,
        role: plan.authorRole,
        bio: plan.authorBio,
        instagram: plan.authorInstagram,
        resources: (plan.authorResources ?? []).filter((r) => offresFrance(langue) || !lienFranceSeulement(r.url)),
      };
  const authorPhotoSrc = plan.authorPhoto
    ? asset(plan.authorPhoto)
    : isDefaultAuthor
      ? AVATARS[0]
      : undefined;

  // Jour à reprendre = premier jour pas encore terminé.
  const currentDay = plan.days.find((d) => !progress.isDone(d.day))?.day ?? total + 1;

  const [jourOuvert, setJourOuvert] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [lienCopie, setLienCopie] = useState(false);
  // ——— Plan à deux ———
  const [duo, setDuo] = useState<PlanDuo | null>(null);
  const [partnerDays, setPartnerDays] = useState<number[]>([]);
  const [duoNotes, setDuoNotes] = useState<DuoNote[]>([]);
  const [myAvatar, setMyAvatar] = useState<string | null>(null);

  // Lien direct vers un jour : /plans/<slug>?jour=3
  useEffect(() => {
    const j = Number(new URLSearchParams(window.location.search).get("jour"));
    if (j >= 1 && j <= total) setJourOuvert(j);
  }, [total]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [jourOuvert]);

  useEffect(() => {
    if (!userId) {
      setDuo(null);
      return;
    }
    getProfile(userId).then((p) => setMyAvatar(p?.avatar_url ?? null));
    getDuoForPlan(plan.slug, userId).then(setDuo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.slug, userId]);

  useEffect(() => {
    if (!duo || duo.status !== "active" || !userId) {
      setPartnerDays([]);
      setDuoNotes([]);
      return;
    }
    const partnerId = duo.inviter_id === userId ? duo.invitee_id : duo.inviter_id;
    // Ma progression locale est poussée dans le duo (le binôme la voit),
    // puis on lit la sienne et les notes partagées.
    syncDuoChecks(duo.id, userId, progress.done).then(async () => {
      const checks = await listDuoChecks(duo.id);
      setPartnerDays(checks[partnerId] ?? []);
    });
    listDuoNotes(duo.id).then(setDuoNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duo?.id, duo?.status, userId]);

  function toggleDayDuo(day: number, wasDone: boolean) {
    progress.toggleDay(day);
    if (duo?.status === "active" && userId) {
      void setDuoCheck(duo.id, userId, day, !wasDone);
    }
  }
  const [celebrate, setCelebrate] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);

  useEffect(() => {
    if (userId) isPlanSaved(plan.slug, userId).then(setSaved);
    else setSaved(false);
  }, [plan.slug, userId]);

  useEffect(() => {
    if (percent !== 100) return;
    try {
      const key = "jb.plan.celebrated.v1";
      const seen = JSON.parse(localStorage.getItem(key) || "[]") as string[];
      if (!seen.includes(plan.slug)) {
        setJourOuvert(null);
        setCelebrate(true);
        localStorage.setItem(key, JSON.stringify([...seen, plan.slug]));
      }
    } catch {
      /* stockage indisponible */
    }
  }, [percent, plan.slug]);

  async function toggleSave() {
    if (!userId) return;
    const next = !saved;
    setSaved(next);
    await togglePlanSave(plan.slug, userId, next);
  }

  async function share() {
    // Lien intelligent : ouvre l'app sur ce plan, sinon renvoie au store.
    const url = appShareUrl(`/plans/${plan.slug}`);
    const data = { title: plan.title, text: `Découvre le plan de lecture « ${plan.title} » sur RHEMA`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        setLienCopie(true);
        window.setTimeout(() => setLienCopie(false), 2200);
      }
    } catch {
      /* partage annulé */
    }
  }

  /* ——— Un jour ouvert : lecture en plein écran ——— */
  const jour = jourOuvert ? plan.days.find((d) => d.day === jourOuvert) : undefined;
  if (jour) {
    const fichier = audioMap[String(jour.day)];
    const piste: AudioTrack | null = fichier
      ? {
          id: `plan:${plan.slug}:${jour.day}`,
          title: `${plan.title} · Jour ${jour.day}`,
          description: jour.title,
          url: mediaUrl(fichier),
          path: fichier,
        }
      : null;
    const fait = progress.isDone(jour.day);
    return (
      <PlanJour
        key={jour.day}
        plan={plan}
        jour={jour}
        fait={fait}
        piste={piste}
        duo={duo}
        userId={userId}
        duoNotes={duoNotes}
        onDuoNotes={setDuoNotes}
        onFermer={() => setJourOuvert(null)}
        onAller={setJourOuvert}
        onTerminer={() => {
          if (!fait) toggleDayDuo(jour.day, false);
          if (jour.day < total) setJourOuvert(jour.day + 1);
          else setJourOuvert(null);
        }}
        onAnnuler={() => {
          if (fait) toggleDayDuo(jour.day, true);
        }}
      />
    );
  }

  /* ——— Fiche du plan + Mon parcours ——— */
  return (
    <div className="min-h-screen pb-32 text-night-900">
      <AuthorCard open={authorOpen} onClose={() => setAuthorOpen(false)} author={authorInfo} photo={authorPhotoSrc} />
      <Celebration
        open={celebrate}
        emoji=""
        title="Plan terminé !"
        message={`Bravo, tu as terminé « ${plan.title} » ! Que cette Parole continue de porter du fruit dans ta vie.`}
        onClose={() => setCelebrate(false)}
      />

      <header className="container-x mx-auto max-w-2xl pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center justify-between">
          <Link
            href="/plans"
            aria-label="Tous les plans"
            className="inline-grid h-10 w-10 place-items-center rounded-full border border-night-900/15 bg-white text-night-900"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2}>
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="flex gap-2">
            {userId ? (
              <button
                type="button"
                onClick={toggleSave}
                aria-label="Enregistrer le plan"
                aria-pressed={saved}
                className={`inline-grid h-10 w-10 place-items-center rounded-full border ${
                  saved ? "border-dawn-400 bg-dawn-400 text-night-950" : "border-night-900/15 bg-white text-night-900"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
                  <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : null}
            <button
              type="button"
              onClick={share}
              aria-label="Partager le plan"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-night-900/15 bg-white px-4 text-sm font-bold text-night-900"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={1.9}>
                <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Partager
            </button>
          </div>
        </div>

        {/* L'affiche du plan */}
        <div className="relative mt-4 overflow-hidden rounded-3xl bg-night-950">
          {plan.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset(plan.cover)} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-night-700 via-night-900 to-night-950" />
          )}
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-night-950/95 via-night-950/55 to-night-950/15" />
          {doneCount > 0 ? (
            <div className="absolute right-4 top-4 grid h-20 w-20 place-items-center">
              <svg viewBox="0 0 80 80" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="40" cy="40" r="34" fill="rgba(12,12,11,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="34" fill="none" stroke="#CAF000" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(percent / 100) * 213.6} 213.6`}
                />
              </svg>
              <p className="relative text-center font-display text-sm font-extrabold leading-none text-white">
                {percent}%
                <span className="block text-[9px] font-bold text-white/60">terminé</span>
              </p>
            </div>
          ) : null}
          <div className="relative p-5 pt-28">
            <span className="inline-block rounded-full bg-dawn-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-night-950">
              Plan de lecture
            </span>
            <h1 className="mt-2.5 font-display text-[1.7rem] font-extrabold leading-tight text-white">{plan.title}</h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/80">{plan.subtitle}</p>
            <div className="mt-3.5 flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[`${total} jours`, `≈ ${minutesParJour} min par jour`].map((m) => (
                  <span key={m} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                    {m}
                  </span>
                ))}
              </div>
              <PlanRating slug={plan.slug} />
            </div>
          </div>
        </div>

        {/* Commencer / reprendre */}
        {!complete ? (
          <button
            type="button"
            onClick={() => setJourOuvert(currentDay)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-dawn-400 py-3.5 font-display text-base font-bold text-night-950 shadow-[0_12px_30px_-12px_rgba(140,170,0,0.6)]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current stroke-none">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
            {doneCount === 0 ? "Commencer le plan" : `Reprendre au jour ${currentDay}`}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCelebrate(true)}
            className="mt-5 w-full rounded-full bg-night-900 py-3.5 font-display text-base font-bold text-cream"
          >
            Plan terminé, bravo !
          </button>
        )}
        <button
          type="button"
          onClick={share}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-night-900/80 py-3 font-display text-[15px] font-bold text-night-900"
        >
          {lienCopie ? "Lien copié, tu peux le coller où tu veux" : "Inviter quelqu'un à lire avec moi"}
        </button>

        {/* À propos */}
        <div className="mt-5 rounded-3xl border border-night-900/10 bg-white p-5">
          <h2 className="font-display text-base font-extrabold">À propos de ce plan</h2>
          {plan.summary ? <p className="mt-2 text-sm leading-relaxed text-night-900/70">{plan.summary}</p> : null}
          <button
            type="button"
            onClick={() => setAuthorOpen(true)}
            aria-label="Voir la fiche de l'auteur"
            className="mt-4 flex w-full items-center gap-3 border-t border-night-900/10 pt-4 text-left"
          >
            <PlanAuthor name={author} photoSrc={authorPhotoSrc} />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold">{author}</span>
              {authorInfo.role ? <span className="block text-xs text-night-900/55">{authorInfo.role}</span> : null}
            </span>
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-none stroke-night-900/35" strokeWidth={2}>
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Un mot pour toi */}
        <div className="mt-3 rounded-3xl border-l-4 border-dawn-400 bg-white p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5F7A00]">Comment ça marche</p>
          <p className="mt-1.5 text-sm leading-relaxed text-night-900/75">
            Chaque jour : un passage de la Bible, une méditation, une question, une prière. Tu peux tout lire ou
            l&apos;écouter. Avance à ton rythme : tu peux rattraper un jour manqué ou prendre de l&apos;avance.
          </p>
        </div>

        {/* Plan à deux */}
        <div className="dark-ctx mt-3 rounded-3xl bg-night-950 p-1.5 text-cream [&>div]:mt-0">
          <PlanDuoCard
            slug={plan.slug}
            title={plan.title}
            total={total}
            userId={userId}
            myAvatar={myAvatar}
            myDone={doneCount}
            duo={duo}
            partnerDone={partnerDays.length}
            onDuoChange={setDuo}
          />
        </div>
      </header>

      {/* Mon parcours */}
      <main className="container-x mx-auto mt-7 max-w-2xl">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-extrabold">Mon parcours</h2>
          <span className="text-sm font-bold text-night-900/50">{percent} %</span>
        </div>
        <p className="mt-0.5 text-sm text-night-900/55">
          {doneCount}/{total} jours
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-night-900/10">
          <div className="h-full rounded-full bg-dawn-400 transition-all" style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-4 space-y-2.5">
          {plan.days.map((d) => {
            const fait = progress.isDone(d.day);
            const courant = d.day === currentDay;
            const luParBinome = duo?.status === "active" && partnerDays.includes(d.day);
            return (
              <button
                key={d.day}
                type="button"
                onClick={() => setJourOuvert(d.day)}
                className={`flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                  courant
                    ? "border-dawn-400 bg-dawn-50 shadow-[0_10px_26px_-14px_rgba(140,170,0,0.5)]"
                    : "border-night-900/10 bg-white"
                }`}
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                    courant ? "bg-dawn-400 text-night-950" : "bg-night-900/[0.06] text-night-900"
                  }`}
                >
                  {d.day}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[15px] font-extrabold leading-tight">{d.title}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-night-900/50">
                    {d.lecture ? <span translate="no">{d.lecture}</span> : null}
                    {d.lecture ? <span aria-hidden>·</span> : null}
                    <span>{dureeJour(d)} min</span>
                    {luParBinome ? (
                      <span className="font-bold text-spirit-600">· Lu par {duo?.partner?.pseudo ?? "ton binôme"}</span>
                    ) : null}
                  </span>
                </span>
                {fait ? (
                  <CheckRond />
                ) : courant ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current stroke-none">
                      <path d="M8 5.5v13l11-6.5z" />
                    </svg>
                  </span>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-night-900/30" strokeWidth={2}>
                    <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {complete ? (
          <div className="mt-8 rounded-3xl bg-dawn-400/20 p-6 text-center">
            <p className="font-display text-xl font-extrabold">Plan terminé</p>
            <p className="mt-1 text-sm text-night-900/70">Bravo ! Continue avec un autre plan pour t&apos;enraciner encore plus.</p>
            <Link href="/plans" className="mt-4 inline-flex rounded-full bg-dawn-400 px-5 py-2.5 font-display text-sm font-bold text-night-950">
              Voir les autres plans
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}
