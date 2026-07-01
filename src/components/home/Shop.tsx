import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { SectionHeader } from "@/components/ui/Section";
import { getProducts } from "@/lib/content";
import { asset } from "@/lib/asset";

export function Shop() {
  const book = getProducts()[0];
  const cover = asset(book?.image);

  return (
    <section
      id="boutique"
      className="bg-topo-light relative scroll-mt-24 overflow-hidden border-y border-spirit-700/10 py-20 sm:py-28"
    >
      {/* Halos décoratifs (effet lumière) */}
      <div className="blob -left-24 top-0 h-72 w-72 bg-dawn-400/25" />
      <div className="blob -right-20 bottom-0 h-80 w-80 bg-spirit-700/10" />

      <div className="container-x relative">
        <Reveal>
          <SectionHeader
            eyebrow="Le livre"
            title={
              <>
                RHEMA — <span className="text-gradient">365 révélations</span>
              </>
            }
            description="L'aboutissement de ces dernières années, à méditer chaque jour."
          />
        </Reveal>

        {/* Livre en vedette */}
        <Reveal delay={0.1}>
          <div className="mt-12 grid items-center gap-8 rounded-4xl border border-night-900/10 bg-white/70 p-6 backdrop-blur-xl sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
            {/* Couverture */}
            <div className="relative mx-auto w-full max-w-xs">
              <div className="absolute -inset-3 rounded-3xl bg-dawn-400/20 blur-2xl" />
              {cover? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt={book?.title?? "RHEMA"}
                  className="relative w-full rounded-2xl shadow-card"
                />
              ): null}
              <span className="absolute left-4 top-4 rounded-full bg-night-950/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dawn-300 backdrop-blur">
                Bientôt disponible
              </span>
            </div>

            {/* Texte + inscription */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-dawn-400 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-night-950 shadow-glow">
                Grande annonce · à paraître
              </span>
              <h3 className="mt-4 font-display text-3xl font-extrabold leading-[1.05] sm:text-4xl">
                Un grand projet,{" "}
                <span className="text-gradient">bientôt entre tes mains</span>
              </h3>
              <p className="mt-4 text-night-900/75">
                RHEMA, c'est l'aboutissement de tout ce que je construis depuis des
                années. On y retrouve l'essence de mes Shorts — ceux qui te parlent
                tant — rassemblés et approfondis en 365 révélations bibliques, une
                pour chaque jour de l'année.
              </p>
              <p className="mt-3 text-night-900/75">
                Le but est simple: t'amener, jour après jour, dans une véritable
                méditation de la Parole, jusqu'à ce qu'elle prenne racine dans ta vie.
              </p>

              <ul className="mt-6 flex flex-wrap gap-2.5">
                {["365 révélations", "Une méditation par jour", "Né de mes Shorts"].map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-night-900/15 bg-white/60 px-4 py-1.5 text-sm font-semibold text-spirit-700"
                  >
                    {chip}
                  </li>
                ))}
              </ul>

              <div className="mt-7 rounded-2xl border border-night-900/10 bg-cream/70 p-5">
                <p className="font-display text-lg font-bold">Le livre arrive bientôt.</p>
                <p className="mt-1 text-sm text-night-900/65">
                  Inscris-toi pour être prévenu(e) en priorité le jour de sa sortie.
                </p>
                <div className="mt-4">
                  <NewsletterForm source="boutique" cta="Me prévenir de la sortie" note="" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Cadeau exclusif: les 7 premières méditations en ebook */}
        <Reveal delay={0.15}>
          <div className="dark-ctx mt-8 grid items-center gap-6 rounded-4xl border border-dawn-500/40 bg-night-900 p-7 text-cream sm:p-9 lg:grid-cols-[1fr_auto] lg:gap-10">
            <div>
              <span className="eyebrow">Cadeau gratuit</span>
              <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight">
                Reçois les <span className="text-gradient">7 premières méditations</span> en ebook
              </h3>
              <p className="mt-2 max-w-xl text-cream/70">
                Goûte à RHEMA dès maintenant: je t'offre les 7 premières méditations
                du livre, en format ebook. Laisse ton email, je te les envoie tout de suite.
              </p>
            </div>
            <div className="w-full lg:w-80">
              <NewsletterForm
                source="cadeau-rhema"
                layout="stacked"
                cta="Recevoir les méditations RHEMA"
                note="Gratuit. Désinscription en un clic."
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
