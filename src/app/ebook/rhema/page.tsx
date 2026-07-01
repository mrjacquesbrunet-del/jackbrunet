import type { Metadata } from "next";
import { asset } from "@/lib/asset";

const PDF = "/ebooks/rhema-premieres-meditations-jb.pdf";

export const metadata: Metadata = {
  title: "RHEMA — tes premières méditations offertes",
  description: "Ton cadeau offert: les premières méditations de RHEMA, par Jack Brunet.",
  robots: { index: false, follow: false },
};

export default function EbookRhemaPage() {
  const pdf = asset(PDF);
  return (
    <section className="dark-ctx bg-topo-dark min-h-screen pt-28 pb-16 sm:pt-32">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Ton cadeau est prêt</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            RHEMA — tes <span className="text-gradient">premières méditations</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Un avant-goût offert du livre: des révélations bibliques à méditer, une par jour.
            Lis-le en ligne ci-dessous, ou télécharge-le pour le garder.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={pdf} download className="btn-primary">
              Télécharger le PDF
            </a>
            <a href={pdf} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              Ouvrir en plein écran
            </a>
          </div>
        </div>

        {/* Lecture en ligne */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-card">
          <object data={`${pdf}#view=FitH`} type="application/pdf" className="h-[80vh] w-full">
            <div className="p-8 text-center text-night-900">
              <p className="font-display text-lg font-bold">Aperçu indisponible sur cet appareil</p>
              <p className="mt-2 text-sm text-night-900/65">
                Utilise le bouton « Télécharger le PDF » ci-dessus pour ouvrir l'ebook.
              </p>
            </div>
          </object>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-cream/45">
          Ce lien t'est réservé. Merci de ne pas le partager publiquement — Pasteur Jack Brunet
        </p>
      </div>
    </section>
  );
}
