import { Reveal } from "@/components/ui/Reveal";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

/** Grande section de captation email — élégante et immersive. */
export function NewsletterCTA() {
  return (
    <section id="newsletter" className="container-x scroll-mt-24 py-20 sm:py-28">
      <Reveal from="scale">
        <div className="dark-ctx relative overflow-hidden rounded-5xl border border-white/10 bg-gradient-to-br from-spirit-700 via-night-800 to-night-900 px-6 py-16 text-center sm:px-10 sm:py-20">
          <div className="blob left-1/4 top-0 h-72 w-72 bg-dawn-500/30 animate-pulse-glow" />
          <div className="blob right-1/4 bottom-0 h-72 w-72 bg-glow-500/20 animate-pulse-glow" />
          <div className="absolute inset-0 bg-grid opacity-30" />

          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow">Cadeau de bienvenue</span>
            <h2 className="mt-6 font-display text-3xl font-extrabold leading-tight text-balance sm:text-5xl">
              Commence ta journée
              <br />
              dans <span className="text-gradient">l'intimité</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-cream/75 sm:text-lg">
              Rejoins la communauté et reçois gratuitement « 7 jours pour retrouver
              ta paix », puis la pensée et le verset du jour, chaque matin.
            </p>

            <div className="mx-auto mt-8 max-w-lg">
              <NewsletterForm
                source="cta-newsletter"
                cta="Recevoir mon cadeau gratuit"
                note="Rejoins +50 000 abonnés. Désinscription en un clic, aucun spam."
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-cream/55">
              <span className="flex items-center gap-1.5">
                <span className="text-dawn-300">✓</span> 100 % gratuit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-dawn-300">✓</span> Un email par jour, maximum
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-dawn-300">✓</span> Pensé pour la future app
              </span>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
