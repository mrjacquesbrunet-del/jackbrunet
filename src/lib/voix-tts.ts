"use client";

import { Capacitor } from "@capacitor/core";

/**
 * « Voix du téléphone » : lecture à voix haute verset par verset.
 *  - Dans l'app (module natif présent) : le chapitre ET les chapitres suivants
 *    du livre sont mis en file côté natif → la lecture continue écran
 *    verrouillé, en voiture, sans dépendre du JavaScript ; chaque fin de
 *    verset fait avancer le surlignage (et le chapitre affiché) quand
 *    l'écran est allumé.
 *  - Sinon (site, ou app pas encore mise à jour sur le store) : synthèse
 *    vocale du navigateur, qui enchaîne aussi les chapitres (écran allumé).
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

/** Chapitre suivant à enchaîner. */
export type ChapitreSuivant = { chapitre: number; versets: string[] };

export type OptionsVoix = {
  versets: string[];
  depart: number;
  /** Langue BCP-47 (fr-FR, en-US, pt-BR…). */
  lang: string;
  /** Vitesse (1 = normale). */
  vitesse: number;
  /** Voix du navigateur choisie (repli web). */
  voixWeb?: SpeechSynthesisVoice | null;
  /** Rejouer le chapitre en boucle ? (lu à chaque fin ; pas d'enchaînement alors) */
  boucle?: () => boolean;
  /** Chapitres suivants à lire à la suite (chargés en arrière-plan). */
  suite?: () => Promise<ChapitreSuivant[]>;
  /** La lecture passe au chapitre suivant (afficher ce chapitre). */
  surChapitre?: (chapitre: number) => void;
  /** Verset lu (index dans le chapitre affiché). */
  surVerset: (i: number) => void;
  surFin: () => void;
};

export type SessionVoix = { arreter(): void; pause(): void; reprendre(): void };

/** Un énoncé de la file : un verset, ou l'annonce « Chapitre N » (verset -1). */
type Element = { texte: string; chapitre: number | null; verset: number };

function annonce(lang: string, n: number): string {
  if (lang.startsWith("en")) return `Chapter ${n}.`;
  if (lang.startsWith("pt")) return `Capítulo ${n}.`;
  return `Chapitre ${n}.`;
}

export function lireVersets(o: OptionsVoix): SessionVoix {
  let gen = 0; // chaque arrêt / pause invalide les rappels en cours
  let tts: TTS | null = null;
  let web = false;
  let enPause = false;

  // File à plat : le chapitre courant (chapitre null) puis les suivants.
  const elements: Element[] = o.versets.map((texte, verset) => ({ texte, chapitre: null, verset }));
  let pos = o.depart; // élément en cours de lecture
  let chapitreCourant: number | null = null;

  const boucle = () => !!o.boucle?.();

  /** Signale l'élément k à l'écran (changement de chapitre, verset). */
  const signaler = (k: number) => {
    const e = elements[k];
    if (!e) return;
    if (e.chapitre !== chapitreCourant && e.chapitre !== null) {
      chapitreCourant = e.chapitre;
      o.surChapitre?.(e.chapitre);
    }
    if (e.verset >= 0) o.surVerset(e.verset);
  };

  const finDeFile = () => {
    if (boucle()) {
      demarrer(0);
      return;
    }
    o.surFin();
  };

  /* ————— Navigateur ————— */
  const parlerWeb = (k: number) => {
    const g = gen;
    const synth = window.speechSynthesis;
    if (k >= elements.length) return finDeFile();
    pos = k;
    signaler(k);
    const u = new SpeechSynthesisUtterance(elements[k].texte);
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

  /* ————— Natif : toute la file d'un coup ————— */
  const enfiler = (depuis: number, jusqua: number, g: number, premier: boolean) => {
    if (!tts) return;
    for (let k = depuis; k < jusqua; k++) {
      const e = elements[k];
      tts
        .speak({
          text: e.texte,
          lang: o.lang,
          rate: o.vitesse,
          category: "playback",
          queueStrategy: premier && k === depuis ? 0 : 1, // 0 = remplace, 1 = à la suite
        })
        .then(() => {
          if (g !== gen) return;
          if (k + 1 < elements.length) {
            pos = k + 1;
            signaler(k + 1);
          } else {
            finDeFile();
          }
        })
        .catch(() => {
          // Langue non prise en charge par la voix native : repli navigateur.
          if (g !== gen || k !== depuis || !premier) return;
          gen++;
          tts = null;
          web = true;
          parlerWeb(depuis);
        });
    }
  };

  const demarrer = (k: number) => {
    gen++;
    enPause = false;
    if (k >= elements.length) return finDeFile();
    pos = k;
    if (tts) {
      signaler(k);
      enfiler(k, elements.length, gen, true);
    } else if (web) {
      window.speechSynthesis.cancel();
      parlerWeb(k);
    }
  };

  // Chapitres suivants : ajoutés à la file dès qu'ils sont chargés.
  if (o.suite && !o.boucle?.()) {
    void o
      .suite()
      .then((chapitres) => {
        const debut = elements.length;
        for (const c of chapitres) {
          if (!c.versets.length) continue;
          elements.push({ texte: annonce(o.lang, c.chapitre), chapitre: c.chapitre, verset: -1 });
          c.versets.forEach((texte, verset) => elements.push({ texte, chapitre: c.chapitre, verset }));
        }
        // Déjà en lecture native : on complète la file sans l'interrompre.
        if (tts && !enPause && elements.length > debut) enfiler(debut, elements.length, gen, false);
      })
      .catch(() => undefined);
  }

  void moteurNatif().then((m) => {
    if (gen !== 0) return; // arrêtée avant même de démarrer
    if (m) tts = m;
    else if (typeof window !== "undefined" && "speechSynthesis" in window) web = true;
    else return;
    demarrer(o.depart);
  });

  return {
    arreter() {
      gen++;
      if (tts) void tts.stop().catch(() => undefined);
      if (web) window.speechSynthesis.cancel();
    },
    pause() {
      enPause = true;
      if (tts) {
        gen++;
        void tts.stop().catch(() => undefined);
      } else if (web) window.speechSynthesis.pause();
    },
    reprendre() {
      if (tts) demarrer(pos); // reprend au début du verset en cours
      else if (web) {
        enPause = false;
        window.speechSynthesis.resume();
      }
    },
  };
}
