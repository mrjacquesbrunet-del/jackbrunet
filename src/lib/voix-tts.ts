"use client";

import { Capacitor } from "@capacitor/core";

/**
 * « Voix du téléphone » : lecture à voix haute verset par verset.
 *  - Dans l'app (module natif présent) : tout le reste du chapitre est mis en
 *    file d'un coup côté natif → la lecture continue écran verrouillé, en
 *    voiture, sans dépendre du JavaScript ; chaque fin de verset fait avancer
 *    le surlignage quand l'écran est allumé.
 *  - Sinon (site, ou app pas encore mise à jour sur le store) : synthèse
 *    vocale du navigateur, comme avant (s'arrête écran verrouillé).
 */

type TTS = typeof import("@capacitor-community/text-to-speech").TextToSpeech;

let natif: Promise<TTS | null> | null = null;
function moteurNatif(): Promise<TTS | null> {
  if (!natif) {
    natif = (async () => {
      try {
        if (!Capacitor.isNativePlatform() || !Capacitor.isPluginAvailable("TextToSpeech")) return null;
        return (await import("@capacitor-community/text-to-speech")).TextToSpeech;
      } catch {
        return null;
      }
    })();
  }
  return natif;
}

export type OptionsVoix = {
  versets: string[];
  depart: number;
  /** Langue BCP-47 (fr-FR, en-US, pt-BR…). */
  lang: string;
  /** Vitesse (1 = normale). */
  vitesse: number;
  /** Voix du navigateur choisie (repli web). */
  voixWeb?: SpeechSynthesisVoice | null;
  /** Rejouer le chapitre en boucle ? (lu à chaque fin) */
  boucle?: () => boolean;
  surVerset: (i: number) => void;
  surFin: () => void;
};

export type SessionVoix = { arreter(): void; pause(): void; reprendre(): void };

export function lireVersets(o: OptionsVoix): SessionVoix {
  let gen = 0; // chaque arrêt / pause invalide les rappels en cours
  let i = o.depart;
  let tts: TTS | null = null;
  let web = false;

  /* ————— Navigateur ————— */
  const parlerWeb = (k: number) => {
    const g = gen;
    const synth = window.speechSynthesis;
    if (k >= o.versets.length) {
      if (o.boucle?.()) return parlerWeb(0);
      o.surFin();
      return;
    }
    i = k;
    o.surVerset(k);
    const u = new SpeechSynthesisUtterance(o.versets[k]);
    u.lang = o.lang;
    if (o.voixWeb) u.voice = o.voixWeb;
    u.rate = 0.96 * o.vitesse;
    u.pitch = 1;
    u.onend = () => {
      // La reprise après pause ne rejoue pas onend ; on avance seulement
      // quand la lecture s'est terminée normalement.
      if (g !== gen || synth.speaking || synth.pending) return;
      parlerWeb(k + 1);
    };
    synth.speak(u);
  };

  /* ————— Natif : tout le reste du chapitre en file ————— */
  const parlerNatif = (depart: number) => {
    if (!tts) return;
    const g = gen;
    const fin = o.versets.length;
    if (depart >= fin) {
      o.surFin();
      return;
    }
    i = depart;
    o.surVerset(depart);
    for (let k = depart; k < fin; k++) {
      tts
        .speak({
          text: o.versets[k],
          lang: o.lang,
          rate: o.vitesse,
          category: "playback",
          queueStrategy: k === depart ? 0 : 1, // 0 = remplace, 1 = à la suite
        })
        .then(() => {
          if (g !== gen) return;
          if (k + 1 < fin) {
            i = k + 1;
            o.surVerset(k + 1);
          } else if (o.boucle?.()) {
            parlerNatif(0);
          } else {
            o.surFin();
          }
        })
        .catch(() => {
          // Langue non prise en charge par la voix native : repli navigateur.
          if (g !== gen || k !== depart) return;
          gen++;
          tts = null;
          web = true;
          parlerWeb(depart);
        });
    }
  };

  void moteurNatif().then((m) => {
    if (gen !== 0) return; // arrêtée avant même de démarrer
    if (m) {
      tts = m;
      parlerNatif(o.depart);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      web = true;
      window.speechSynthesis.cancel();
      parlerWeb(o.depart);
    }
  });

  return {
    arreter() {
      gen++;
      if (tts) void tts.stop().catch(() => undefined);
      if (web) window.speechSynthesis.cancel();
    },
    pause() {
      if (tts) {
        gen++;
        void tts.stop().catch(() => undefined);
      } else if (web) window.speechSynthesis.pause();
    },
    reprendre() {
      if (tts) {
        gen++;
        parlerNatif(i); // reprend au début du verset en cours
      } else if (web) window.speechSynthesis.resume();
    },
  };
}
