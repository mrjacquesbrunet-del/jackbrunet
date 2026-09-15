"use client";

import { useState } from "react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { EbookReader } from "@/components/home/EbookReader";
import { PlansDarkBg } from "@/components/plans/PlansDarkBg";

/**
 * Page de destination « cadeau RHEMA » (liens ManyChat / réseaux sociaux) :
 * la personne entre son email (liste Brevo « rhema », automatisation d'envoi
 * du PDF), puis le téléchargement se débloque immédiatement sur la page —
 * double livraison : à l'écran tout de suite, et par email pour la garder.
 */

const PDF = "/ebooks/rhema-premieres-meditations-jb.pdf";

export function CadeauRhema() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <section className="dark-ctx bg-topo-dark min-h-screen pt-28 pb-16 sm:pt-32">
      <PlansDarkBg />
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">Ton cadeau t&apos;attend</span>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            Les 7 premières <span className="text-gradient">révélations RHEMA</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cream/75">
            Un extrait offert du livre RHEMA de Jack Brunet : des révélations bibliques
            qui réveillent la foi, à méditer une par une. Entre ton email et reçois
            ton ebook immédiatement.
          </p>
        </div>

        {!unlocked ? (
          <div className="mx-auto mt-10 max-w-xl">
            <div className="glass rounded-3xl px-6 py-7 sm:px-8">
              <p className="text-center font-display text-lg font-bold">
                Où veux-tu recevoir ton ebook ?
              </p>
              <div className="mt-5">
                <NewsletterForm
                  source="cadeau-rhema"
                  layout="stacked"
                  size="lg"
                  cta="Recevoir mes 7 révélations"
                  note="Gratuit. Tu le reçois aussi par email. Désinscription en un clic."
                  onSuccess={() => setUnlocked(true)}
                />
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-cream/45">
              En t&apos;inscrivant, tu recevras aussi les pensées et nouveautés de Jack Brunet.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-3xl">
            <p className="text-center font-display text-xl font-bold text-dawn-300">
              C&apos;est fait ! Ton ebook est débloqué — il arrive aussi dans ta boîte mail.
            </p>
            <EbookReader pdf={PDF} filename="rhema-7-premieres-revelations.pdf" />
            <p className="mx-auto mt-6 max-w-xl text-center text-xs text-cream/45">
              Ce cadeau t&apos;est réservé. Merci de ne pas le partager publiquement, Pasteur Jack Brunet
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
