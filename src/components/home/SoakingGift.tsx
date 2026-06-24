"use client";

import { useState } from "react";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { asset } from "@/lib/asset";

/**
 * Cadeau de captation : la musique soaking offerte en téléchargement après
 * inscription (l'email est capté dans Brevo via NewsletterForm).
 */
export function SoakingGift() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="dark-ctx bg-topo-dark relative overflow-hidden rounded-4xl p-8 text-center sm:p-12">
      <div className="blob -right-16 -top-12 h-52 w-52 bg-dawn-400/20" />
      <div className="blob -left-12 bottom-0 h-44 w-44 bg-spirit-500/20" />
      <div className="relative mx-auto max-w-xl">
        <span className="text-4xl">🎁</span>
        <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
          La musique <span className="text-gradient">soaking</span> offerte
        </h3>
        <p className="mt-3 text-cream/70">
          Reçois gratuitement la musique « Soaking » de Jack Brunet pour tes temps de
          prière et de méditation. Laisse ton email, elle est à toi.
        </p>

        <div className="mt-7">
          {unlocked ? (
            <div className="space-y-3">
              <a
                href={asset("/music/soaking-1.m4a")}
                download="Soaking - Jack Brunet.m4a"
                className="btn-primary"
              >
                ⬇ Télécharger la musique
              </a>
              <p className="text-xs text-cream/55">
                Merci ! Le téléchargement est débloqué. Vérifie aussi ta boîte mail.
              </p>
            </div>
          ) : (
            <NewsletterForm
              source="cadeau-soaking"
              cta="Recevoir la musique"
              variant="primary"
              note="Gratuit. Tu reçois aussi la pensée du jour. Désinscription en un clic."
              onSuccess={() => setUnlocked(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
