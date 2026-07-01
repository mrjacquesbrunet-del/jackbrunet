import type { Metadata } from "next";
import { asset } from "@/lib/asset";

const AUDIO = "/audio/soaking-jack-brunet.mp3";

export const metadata: Metadata = {
  title: "Soaking offert — un temps de présence",
  description: "Ton cadeau offert: un temps de soaking pour méditer et te reposer en Dieu, par Jack Brunet.",
  robots: { index: false, follow: false },
};

export default function SoakingPage() {
  const audio = asset(AUDIO);
  return (
    <section className="dark-ctx bg-topo-dark min-h-screen pt-28 pb-16 sm:pt-32">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Ton cadeau est prêt</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Ton <span className="text-gradient">soaking</span> offert
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Un temps de présence pour méditer, prier et te reposer en Dieu. Mets ton casque,
            ferme les yeux, et laisse-toi porter. Écoute-le ici, ou télécharge-le pour le garder.
          </p>
        </div>

        {/* Lecteur audio */}
        <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-night-900/60 p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-dawn-400/15 text-dawn-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6">
                <path
                  d="M4 14v-2a8 8 0 0 1 16 0v2M4 14v3a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 1zM20 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-display text-lg font-bold">Soaking — Jack Brunet</p>
              <p className="text-sm text-cream/60">Temps de présence guidé</p>
            </div>
          </div>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio controls preload="metadata" src={audio} className="mt-5 w-full">
            Ton navigateur ne peut pas lire l'audio.
          </audio>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={audio} download className="btn-primary">
              Télécharger l'audio
            </a>
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-cream/45">
          Ce lien t'est réservé. Merci de ne pas le partager publiquement — Pasteur Jack Brunet
        </p>
      </div>
    </section>
  );
}
