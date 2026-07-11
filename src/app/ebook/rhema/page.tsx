import type { Metadata } from "next";
import { EbookReader } from "@/components/home/EbookReader";

const PDF = "/ebooks/rhema-premieres-meditations-jb.pdf";

export const metadata: Metadata = {
  title: "RHEMA, tes premières méditations offertes",
  description: "Ton cadeau offert: les premières méditations de RHEMA, par Jack Brunet.",
  robots: { index: false, follow: false },
};

export default function EbookRhemaPage() {
  return (
    <section className="dark-ctx bg-topo-dark min-h-screen pt-28 pb-16 sm:pt-32">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Ton cadeau est prêt</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            RHEMA, tes <span className="text-gradient">premières méditations</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Un avant-goût offert du livre: des révélations bibliques à méditer, une par jour.
            Lis-le en ligne ci-dessous, ou télécharge-le pour le garder.
          </p>
        </div>

        <EbookReader pdf={PDF} filename="rhema-premieres-meditations.pdf" />

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-cream/45">
          Ce lien t'est réservé. Merci de ne pas le partager publiquement, Pasteur Jack Brunet
        </p>
      </div>
    </section>
  );
}
