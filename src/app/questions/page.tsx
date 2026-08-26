"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import faq from "../../../content/questions-faq.json";
import { getSupabase } from "../../lib/supabase";
import { DEFAULT_AUTHOR } from "../../config/author";
import {
  askQuestion,
  answerQuestion,
  hideQuestion,
  currentIsAdmin,
  listCommunityQuestions,
  type CommunityQuestion,
} from "../../lib/faq-questions";

type Item = { id: number; category: string; q: string; a: string; verse: string };
const ITEMS = (faq as { items: Item[] }).items;
const CATEGORIES = Array.from(new Set(ITEMS.map((i) => i.category)));

/** Première question d'une catégorie (pour la vedette / le top). */
function firstOf(cat: string, skip: Set<number>): Item | undefined {
  return ITEMS.find((i) => i.category === cat && !skip.has(i.id));
}

/** Sélection « En vedette » : questions fortes, existentielles. */
const FEATURED_CATS = [
  "Souffrance & doute",
  "Le sens de la vie",
  "Dieu & la foi",
  "Jésus",
  "Le salut",
  "Preuves & histoire",
];
/** « Les 10 questions qu'on se pose le plus » : un représentant par thème. */
const TOP_CATS = [
  "Dieu & la foi",
  "Jésus",
  "Le salut",
  "La Bible",
  "Le Saint-Esprit & les dons",
  "Souffrance & doute",
  "La vie chrétienne",
  "Questions difficiles",
  "Le sens de la vie",
  "Preuves & histoire",
];

/** Rend un paragraphe avec **gras** simple. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((para, pi) => (
        <p key={pi} className={pi === 0 ? "" : "mt-3"}>
          {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, ci) =>
            chunk.startsWith("**") && chunk.endsWith("**") ? (
              <strong key={ci} className="font-bold text-night-900">
                {chunk.slice(2, -2)}
              </strong>
            ) : (
              <span key={ci}>{chunk}</span>
            ),
          )}
        </p>
      ))}
    </>
  );
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const STOP = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "a", "à", "au", "aux", "en",
  "que", "qui", "quoi", "est", "il", "elle", "on", "je", "tu", "ce", "se", "sa", "son", "mon",
  "ma", "mes", "pour", "par", "pas", "ne", "si", "y", "dans", "sur", "avec", "comment", "pourquoi",
  "quand", "quel", "quelle", "vraiment", "ça", "cest", "n", "l", "d", "s", "t",
]);
function tokens(q: string): string[] {
  return norm(q)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}
function score(item: Item, toks: string[]): number {
  const q = norm(item.q);
  const a = norm(item.a);
  let s = 0;
  for (const t of toks) {
    if (q.includes(t)) s += 5;
    if (a.includes(t)) s += 1;
  }
  return s;
}

/** Réponse affichée dans la fiche plein écran (FAQ ou question communautaire). */
type Detail = {
  q: string;
  category?: string | null;
  a: string;
  verse?: string | null;
  who?: "jack" | "member";
  name?: string | null;
};

/* ---------- Icônes (trait, charte) ---------- */
const Ico = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </>
  ),
  check: <path d="M5 12l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />,
  book: (
    <path
      d="M4 5.5A2 2 0 0 1 6 4h6v15H6a2 2 0 0 0-2 2zM20 5.5A2 2 0 0 0 18 4h-6v15h6a2 2 0 0 1 2 2z"
      strokeLinejoin="round"
    />
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />,
  plus: <path d="M12 5v14M5 12h14" strokeLinecap="round" />,
  close: <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />,
  spark: (
    <path
      d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8z"
      strokeLinejoin="round"
    />
  ),
};
function Svg({ children, className = "h-5 w-5", sw = 1.9 }: { children: React.ReactNode; className?: string; sw?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={sw}>
      {children}
    </svg>
  );
}

/* ---------- Profil d'auteur de l'app (Pasteur Jack) ---------- */
/** Photos candidates de Jack (bucket Supabase « audiovf »), comme les
 * dévotionnels et les plans : c'est le profil d'auteur de l'application. */
const JACK_PHOTOS = (() => {
  const sb = getSupabase();
  if (!sb) return [] as string[];
  return ["auteurjack.jpg", "auteurjack.png", "pasteur-jack.jpg"].map(
    (n) => sb.storage.from("audiovf").getPublicUrl(n).data.publicUrl,
  );
})();

/** Avatar rond de Jack, avec repli en cascade puis monogramme. */
function JackAvatar({ size = 36 }: { size?: number }) {
  const [i, setI] = useState(0);
  const [broken, setBroken] = useState(false);
  const src = broken ? undefined : JACK_PHOTOS[i];
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => (i + 1 >= JACK_PHOTOS.length ? setBroken(true) : setI((n) => n + 1))}
      className="shrink-0 rounded-full bg-spirit-500 object-cover object-top ring-2 ring-dawn-400/60"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-spirit-500 font-display font-extrabold text-cream ring-2 ring-dawn-400/60"
      style={{ width: size, height: size }}
    >
      J
    </span>
  );
}

/** Signature « Pasteur Jack Brunet · Pasteur & fondateur » (profil auteur app). */
function JackByline({ avatar = 40 }: { avatar?: number }) {
  return (
    <>
      <JackAvatar size={avatar} />
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-sm font-bold text-night-900">
          {DEFAULT_AUTHOR.name}
          <span className="inline-grid h-3.5 w-3.5 place-items-center rounded-full bg-dawn-400 text-night-900">
            <Svg className="h-2.5 w-2.5" sw={3}>{Ico.check}</Svg>
          </span>
        </p>
        <p className="truncate text-xs text-night-900/50">{DEFAULT_AUTHOR.role}</p>
      </div>
    </>
  );
}

export default function QuestionsPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);

  /* Composer « pose ta question » */
  const [askOpen, setAskOpen] = useState(false);
  const [askBody, setAskBody] = useState("");
  const [askName, setAskName] = useState("");
  const [askCat, setAskCat] = useState<string>("");
  const [askState, setAskState] = useState<"idle" | "sending" | "sent">("idle");
  const [askErr, setAskErr] = useState("");

  /* Communauté */
  const [community, setCommunity] = useState<CommunityQuestion[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const toks = tokens(query);
  const isSearch = query.trim().length >= 2;
  const mode: "search" | "category" | "home" = isSearch ? "search" : cat ? "category" : "home";

  useEffect(() => {
    let alive = true;
    (async () => {
      const [list, admin] = await Promise.all([listCommunityQuestions(), currentIsAdmin()]);
      if (!alive) return;
      setCommunity(list);
      setIsAdmin(admin);
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshCommunity() {
    setCommunity(await listCommunityQuestions());
  }

  const results = useMemo(() => {
    let list = ITEMS.filter((i) => !cat || i.category === cat);
    if (isSearch) {
      list = list
        .map((i) => ({ i, s: score(i, toks) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.i);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, cat]);

  const best = isSearch ? results[0] : null;
  const rest = isSearch ? results.slice(1) : results;

  const { featured, top10 } = useMemo(() => {
    const used = new Set<number>();
    const feat: Item[] = [];
    for (const c of FEATURED_CATS) {
      const it = firstOf(c, used);
      if (it) {
        feat.push(it);
        used.add(it.id);
      }
    }
    const top: Item[] = [];
    for (const c of TOP_CATS) {
      const it = firstOf(c, used);
      if (it) {
        top.push(it);
        used.add(it.id);
      }
    }
    return { featured: feat, top10: top.slice(0, 10) };
  }, []);

  const unanswered = community.filter((q) => !q.answer);
  const answered = community.filter((q) => q.answer);

  async function submitQuestion() {
    setAskErr("");
    setAskState("sending");
    const res = await askQuestion(askBody, askName, askCat || null);
    if (!res.ok) {
      setAskErr(res.error || "Impossible d'envoyer.");
      setAskState("idle");
      return;
    }
    setAskState("sent");
    setAskBody("");
    await refreshCommunity();
  }

  function openFaq(i: Item) {
    setDetail({ q: i.q, category: i.category, a: i.a, verse: i.verse, who: "jack" });
  }

  return (
    <main className="pb-20">
      <style dangerouslySetInnerHTML={{ __html: FX }} />

      {/* ---------- Entête cinématique ---------- */}
      <section className="qa-hero relative overflow-hidden px-4 pb-7 pt-[calc(5rem+env(safe-area-inset-top))] text-cream">
        <div className="qa-orb qa-orb-1" />
        <div className="qa-orb qa-orb-2" />
        <div className="qa-orb qa-orb-3" />
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
        <div className="relative mx-auto max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-dawn-300">
            Questions & réponses
          </p>
          <h1 className="qa-title mt-2 font-display text-[2.6rem] font-extrabold leading-[1.02] sm:text-5xl">
            Pose ta question
          </h1>
          <p className="mt-3 max-w-xl text-[15px] text-cream/70">
            Cherche par mot ou par thème, découvre les questions qu&apos;on se pose le plus, ou
            envoie la tienne — <span className="text-dawn-200">avec amour et vérité</span>.
          </p>

          {/* Barre de recherche */}
          <div className="qa-search mt-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 backdrop-blur-md">
            <span className="shrink-0 text-dawn-300">
              <Svg>{Ico.search}</Svg>
            </span>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(null);
              }}
              placeholder="Rechercher une question ou un thème…"
              className="w-full bg-transparent text-cream placeholder:text-cream/50 focus:outline-none"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Effacer" className="shrink-0 text-cream/50">
                <Svg>{Ico.close}</Svg>
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="container-x mt-5">
        <div className="mx-auto max-w-2xl">
          {/* ---------- Thèmes ---------- */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setCat(null)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                cat === null ? "bg-night-900 text-cream" : "bg-night-900/[0.06] text-night-900/70"
              }`}
            >
              Tout
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(cat === c ? null : c)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  cat === c ? "bg-night-900 text-cream" : "bg-night-900/[0.06] text-night-900/70"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* ================= MODE RECHERCHE ================= */}
          {mode === "search" ? (
            <>
              {best ? (
                <button
                  type="button"
                  onClick={() => openFaq(best)}
                  className="qa-in mt-6 block w-full overflow-hidden rounded-3xl border-2 border-dawn-400/50 bg-white text-left shadow-card"
                >
                  <div className="flex items-center gap-2 bg-dawn-400/15 px-5 py-2.5">
                    <span className="text-dawn-600">
                      <Svg className="h-4 w-4" sw={2}>{Ico.spark}</Svg>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wide text-dawn-600">
                      La réponse la plus proche
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-display text-xl font-bold text-night-900">{best.q}</p>
                    <span className="text-xs font-semibold uppercase tracking-wide text-night-900/45">
                      {best.category}
                    </span>
                    <div className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-night-900/70">
                      <RichText text={best.a} />
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-dawn-600">
                      Lire la réponse <Svg className="h-4 w-4" sw={2}>{Ico.arrow}</Svg>
                    </span>
                  </div>
                </button>
              ) : null}

              <p className="mt-6 text-sm font-semibold text-night-900/50">
                {results.length === 0
                  ? ""
                  : rest.length > 0
                    ? "Autres réponses qui pourraient t'aider"
                    : "C'est la réponse la plus proche."}
              </p>

              <div className="mt-3 space-y-3">
                {results.length === 0 ? (
                  <div className="rounded-2xl bg-night-900/[0.03] px-4 py-8 text-center text-night-900/60">
                    <p className="font-semibold text-night-900/80">Aucune réponse ne correspond exactement.</p>
                    <p className="mt-1 text-sm">
                      Essaie d&apos;autres mots — ou envoie ta question plus bas, Pasteur Jack y répondra.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setAskBody(query);
                        setQuery("");
                        setAskOpen(true);
                        setTimeout(() => document.getElementById("poser")?.scrollIntoView({ behavior: "smooth" }), 60);
                      }}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-900"
                    >
                      <Svg className="h-4 w-4" sw={2.2}>{Ico.plus}</Svg> Poser cette question
                    </button>
                  </div>
                ) : (
                  rest.map((i, idx) => <Accordion key={i.id} item={i} open={open === i.id} onToggle={() => setOpen(open === i.id ? null : i.id)} delay={idx} />)
                )}
              </div>
            </>
          ) : null}

          {/* ================= MODE CATÉGORIE ================= */}
          {mode === "category" ? (
            <div className="mt-6 space-y-3">
              <p className="text-sm font-semibold text-night-900/50">
                {results.length} question{results.length > 1 ? "s" : ""} · {cat}
              </p>
              {results.map((i, idx) => (
                <Accordion key={i.id} item={i} open={open === i.id} onToggle={() => setOpen(open === i.id ? null : i.id)} delay={idx} />
              ))}
            </div>
          ) : null}

          {/* ================= MODE ACCUEIL ================= */}
          {mode === "home" ? (
            <>
              {/* --- En vedette (carrousel) --- */}
              <div className="mt-7 flex items-end justify-between">
                <h2 className="font-display text-xl font-extrabold text-night-900">En vedette</h2>
                <span className="text-xs font-semibold text-night-900/45">Glisse pour en voir plus →</span>
              </div>
              <div className="qa-rail -mx-4 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
                {featured.map((i) => (
                  <article
                    key={i.id}
                    onClick={() => openFaq(i)}
                    className="qa-card relative w-[86%] max-w-sm shrink-0 cursor-pointer snap-center overflow-hidden rounded-3xl bg-white p-5 shadow-card"
                  >
                    <span className="pointer-events-none absolute -right-2 bottom-4 select-none font-display text-[7.5rem] font-black leading-none text-dawn-400/10">
                      Q
                    </span>
                    <span className="inline-flex rounded-full bg-dawn-400/20 px-2.5 py-1 text-[11px] font-bold text-dawn-600">
                      {i.category}
                    </span>
                    <p className="relative mt-4 font-display text-[1.65rem] font-extrabold leading-[1.12] text-night-900">
                      {i.q}
                    </p>
                    <div className="relative mt-5 flex items-center gap-3 border-t border-night-900/10 pt-4">
                      <JackByline avatar={36} />
                      <span className="ml-auto shrink-0 text-dawn-600">
                        <Svg className="h-5 w-5" sw={2.2}>{Ico.arrow}</Svg>
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* --- Pose ta question --- */}
              <section id="poser" className="mt-7 overflow-hidden rounded-3xl border border-night-900/10 bg-night-900 text-cream">
                <div className="p-5">
                  <h2 className="font-display text-xl font-extrabold">Tu as une question&nbsp;?</h2>
                  <p className="mt-1 text-sm text-cream/65">
                    Écris-la — elle rejoint le mur des questions et Pasteur Jack y répond. Aucune
                    question n&apos;est jugée.
                  </p>

                  {askState === "sent" ? (
                    <div className="mt-4 rounded-2xl bg-dawn-400/15 p-4 text-cream">
                      <p className="flex items-center gap-2 font-bold text-dawn-200">
                        <Svg className="h-5 w-5" sw={2.2}>{Ico.check}</Svg> Ta question est envoyée&nbsp;!
                      </p>
                      <p className="mt-1 text-sm text-cream/70">
                        Tu la retrouves plus bas dans « en attente de réponse ».
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setAskState("idle");
                          setAskOpen(true);
                        }}
                        className="mt-3 text-sm font-bold text-dawn-300 underline underline-offset-2"
                      >
                        Poser une autre question
                      </button>
                    </div>
                  ) : !askOpen ? (
                    <button
                      type="button"
                      onClick={() => setAskOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 font-bold text-night-900"
                    >
                      <Svg className="h-5 w-5" sw={2.4}>{Ico.plus}</Svg> Poser ta question
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <textarea
                        value={askBody}
                        onChange={(e) => setAskBody(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="Ex. Comment savoir si Dieu me parle vraiment ?"
                        className="w-full resize-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/45 focus:border-dawn-400/60 focus:outline-none"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                          value={askName}
                          onChange={(e) => setAskName(e.target.value)}
                          maxLength={40}
                          placeholder="Ton prénom (facultatif)"
                          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-cream placeholder:text-cream/45 focus:border-dawn-400/60 focus:outline-none"
                        />
                        <select
                          value={askCat}
                          onChange={(e) => setAskCat(e.target.value)}
                          className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-cream focus:border-dawn-400/60 focus:outline-none sm:w-56"
                        >
                          <option value="" className="text-night-900">Thème (facultatif)</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c} className="text-night-900">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      {askErr ? <p className="text-sm font-semibold text-dawn-200">{askErr}</p> : null}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={askState === "sending" || askBody.trim().length < 5}
                          onClick={submitQuestion}
                          className="inline-flex items-center gap-2 rounded-full bg-dawn-400 px-5 py-2.5 font-bold text-night-900 disabled:opacity-50"
                        >
                          {askState === "sending" ? "Envoi…" : "Envoyer ma question"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAskOpen(false)}
                          className="text-sm font-semibold text-cream/60"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* --- Questions de la communauté --- */}
              {community.length > 0 ? (
                <section className="mt-8">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-extrabold text-night-900">
                      Questions de la communauté
                    </h2>
                    {unanswered.length > 0 ? (
                      <span className="rounded-full bg-night-900/[0.06] px-2.5 py-0.5 text-xs font-bold text-night-900/60">
                        {unanswered.length} en attente
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 space-y-3">
                    {community.map((q) => (
                      <CommunityCard
                        key={q.id}
                        q={q}
                        isAdmin={isAdmin}
                        onOpen={() =>
                          q.answer
                            ? setDetail({
                                q: q.body,
                                category: q.category,
                                a: q.answer,
                                verse: q.answer_verse,
                                who: "jack",
                                name: q.author_name,
                              })
                            : undefined
                        }
                        onChanged={refreshCommunity}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {/* --- Top 10 --- */}
              <section className="mt-8">
                <h2 className="font-display text-xl font-extrabold text-night-900">
                  Les 10 questions qu&apos;on se pose le plus
                </h2>
                <div className="mt-3 overflow-hidden rounded-3xl border border-night-900/10 bg-white shadow-sm">
                  {top10.map((i, idx) => (
                    <button
                      key={i.id}
                      type="button"
                      onClick={() => openFaq(i)}
                      className="flex w-full items-center gap-4 border-b border-night-900/[0.07] px-5 py-4 text-left last:border-b-0 active:bg-night-900/[0.03]"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dawn-400/20 font-display text-sm font-black text-dawn-600">
                        {idx + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[15px] font-bold leading-snug text-night-900">
                          {i.q}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-night-900/40">
                          {i.category}
                        </span>
                      </span>
                      <span className="shrink-0 text-night-900/30">
                        <Svg className="h-5 w-5" sw={2}>{Ico.arrow}</Svg>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* --- Aller plus loin --- */}
              <div className="mt-8 rounded-2xl border border-night-900/10 bg-night-900/[0.03] p-5 text-center">
                <p className="font-display text-lg font-bold text-night-900">
                  Envie d&apos;aller plus loin&nbsp;?
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Link href="/bible" className="btn-primary text-sm">Ouvrir la Bible</Link>
                  <Link href="/devotionnel" className="btn-ghost text-sm">Ma méditation du jour</Link>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* ---------- Fiche réponse (plein écran) ---------- */}
      {detail ? <DetailSheet detail={detail} onClose={() => setDetail(null)} /> : null}
    </main>
  );
}

/* ---------- Accordéon (recherche / catégorie) ---------- */
function Accordion({ item, open, onToggle, delay }: { item: Item; open: boolean; onToggle: () => void; delay: number }) {
  return (
    <div
      className="qa-in overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-sm"
      style={{ animationDelay: `${Math.min(delay, 8) * 40}ms` }}
    >
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold text-night-900">{item.q}</span>
          <span className="text-xs font-semibold uppercase tracking-wide text-night-900/45">{item.category}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-night-900/40 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div className="border-t border-night-900/10 px-5 py-4 text-[15px] leading-relaxed text-night-900/75">
          <RichText text={item.a} />
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-3 py-1 text-xs font-bold text-dawn-600">
            {item.verse}
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Carte question communautaire ---------- */
function CommunityCard({
  q,
  isAdmin,
  onOpen,
  onChanged,
}: {
  q: CommunityQuestion;
  isAdmin: boolean;
  onOpen: () => void;
  onChanged: () => void;
}) {
  const [ans, setAns] = useState("");
  const [verse, setVerse] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const who = (q.author_name || "").trim() || "Un membre";
  const answered = !!q.answer;

  async function save() {
    setSaving(true);
    const ok = await answerQuestion(q.id, ans, verse);
    setSaving(false);
    if (ok) {
      setEditing(false);
      onChanged();
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        disabled={!answered}
        className={`block w-full px-5 py-4 text-left ${answered ? "active:bg-night-900/[0.03]" : "cursor-default"}`}
      >
        <p className="font-display text-[15px] font-bold leading-snug text-night-900">{q.body}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-night-900/50">{who}</span>
          {q.category ? (
            <span className="rounded-full bg-night-900/[0.06] px-2 py-0.5 font-semibold text-night-900/55">
              {q.category}
            </span>
          ) : null}
          {answered ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-dawn-400/20 px-2.5 py-0.5 font-bold text-dawn-600">
              <Svg className="h-3 w-3" sw={3}>{Ico.check}</Svg> Répondu
            </span>
          ) : (
            <span className="ml-auto rounded-full bg-night-900/[0.05] px-2.5 py-0.5 font-semibold text-night-900/45">
              En attente d&apos;une réponse
            </span>
          )}
        </div>
      </button>

      {/* Espace admin : répondre / masquer */}
      {isAdmin && !answered ? (
        <div className="border-t border-night-900/10 bg-night-900/[0.02] px-5 py-4">
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={ans}
                onChange={(e) => setAns(e.target.value)}
                rows={4}
                placeholder="Réponse pastorale (le **gras** est possible)…"
                className="w-full resize-none rounded-xl border border-night-900/15 bg-white px-3 py-2 text-sm text-night-900 focus:border-dawn-400 focus:outline-none"
              />
              <input
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                placeholder="Verset (ex. Jean 3.16) — facultatif"
                className="w-full rounded-xl border border-night-900/15 bg-white px-3 py-2 text-sm text-night-900 focus:border-dawn-400 focus:outline-none"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={saving || ans.trim().length < 2}
                  onClick={save}
                  className="rounded-full bg-dawn-400 px-4 py-2 text-sm font-bold text-night-900 disabled:opacity-50"
                >
                  {saving ? "Publication…" : "Publier la réponse"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="text-sm font-semibold text-night-900/50">
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setEditing(true)} className="text-sm font-bold text-dawn-600">
                Répondre
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (await hideQuestion(q.id)) onChanged();
                }}
                className="text-sm font-semibold text-night-900/40"
              >
                Masquer
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Fiche réponse plein écran ---------- */
function DetailSheet({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-night-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="qa-sheet relative flex max-h-[88vh] w-full max-w-xl flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-card sm:rounded-[1.75rem]">
        <div className="flex items-start gap-3 border-b border-night-900/10 px-5 py-4">
          <div className="min-w-0 flex-1">
            {detail.category ? (
              <span className="inline-flex rounded-full bg-dawn-400/20 px-2.5 py-0.5 text-[11px] font-bold text-dawn-600">
                {detail.category}
              </span>
            ) : null}
            <h3 className="mt-2 font-display text-2xl font-extrabold leading-tight text-night-900">{detail.q}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="shrink-0 rounded-full bg-night-900/[0.06] p-2 text-night-900/60">
            <Svg className="h-5 w-5" sw={2}>{Ico.close}</Svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5">
          <div className="text-[15px] leading-relaxed text-night-900/80">
            <RichText text={detail.a} />
          </div>
          {detail.verse ? (
            <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-dawn-400/15 px-3.5 py-1.5 text-sm font-bold text-dawn-600">
              <Svg className="h-4 w-4" sw={2}>{Ico.book}</Svg> {detail.verse}
            </p>
          ) : null}

          <div className="mt-6 flex items-center gap-3 border-t border-night-900/10 pt-5">
            <JackByline avatar={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

const FX = `
.qa-hero{background:linear-gradient(165deg,rgb(var(--n-900)) 0%,rgb(var(--n-700)) 48%,rgb(var(--n-950)) 100%);}
.qa-title{background:linear-gradient(90deg,#F3F3ED,#CAF000,#F3F3ED);background-size:200% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:qa-grad 6s linear infinite;}
@keyframes qa-grad{to{background-position:200% center}}
.qa-orb{position:absolute;border-radius:9999px;filter:blur(46px);pointer-events:none;}
.qa-orb-1{width:230px;height:230px;background:#CAF000;opacity:.22;top:-70px;right:-40px;animation:qa-float1 9s ease-in-out infinite;}
.qa-orb-2{width:190px;height:190px;background:#CAF000;opacity:.12;bottom:-60px;left:-30px;animation:qa-float2 11s ease-in-out infinite;}
.qa-orb-3{width:150px;height:150px;background:#E4FB6E;opacity:.14;top:20px;left:44%;animation:qa-float1 13s ease-in-out infinite;}
@keyframes qa-float1{0%,100%{transform:translateY(0)}50%{transform:translateY(22px)}}
@keyframes qa-float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-24px)}}
.qa-search:focus-within{border-color:rgba(202,240,0,.55);box-shadow:0 0 0 3px rgba(202,240,0,.16)}
.qa-rail{scrollbar-width:none}
.qa-rail::-webkit-scrollbar{display:none}
.qa-card{transition:transform .25s ease, box-shadow .25s ease}
.qa-card:active{transform:scale(.985)}
@keyframes qa-in{0%{transform:translateY(12px);opacity:0}100%{transform:translateY(0);opacity:1}}
.qa-in{animation:qa-in .45s ease-out both}
@keyframes qa-sheet{0%{transform:translateY(24px);opacity:.4}100%{transform:translateY(0);opacity:1}}
.qa-sheet{animation:qa-sheet .28s ease-out both}
`;
