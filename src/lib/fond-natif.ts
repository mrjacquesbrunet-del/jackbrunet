"use client";

import { Capacitor } from "@capacitor/core";

/**
 * Fonds musicaux (musique soaking, ambiance sous la Bible) joués par le
 * TÉLÉPHONE (module natif) : ils continuent écran verrouillé et gardent leur
 * réglage de volume. Dans le navigateur (site, ou app pas encore mise à jour
 * sur le store), les modules appelants gardent leur lecture web habituelle.
 */

type NA = typeof import("@capgo/native-audio").NativeAudio;

export function fondNatifDispo(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("NativeAudio");
  } catch {
    return false;
  }
}

let moteur: Promise<NA | null> | null = null;
function natif(): Promise<NA | null> {
  if (!moteur) {
    moteur = (async () => {
      if (!fondNatifDispo()) return null;
      const { NativeAudio } = await import("@capgo/native-audio");
      // Lecture en arrière-plan, mélangée à la voix (podcast, Bible), sans
      // prendre les commandes de l'écran verrouillé.
      await NativeAudio.configure({ background: true, backgroundPlayback: true, focus: false, ignoreSilent: true, showNotification: false }).catch(
        () => undefined,
      );
      return NativeAudio;
    })().catch(() => null);
  }
  return moteur;
}

const borne = (v: number) => Math.min(1, Math.max(0.05, v));

export class FondNatif {
  private etat: "vide" | "pret" | "joue" | "pause" = "vide";
  /** Les commandes s'exécutent l'une après l'autre (jouer / pause rapprochés). */
  private file: Promise<unknown> = Promise.resolve();

  constructor(
    private readonly id: string,
    private readonly url: () => string | null,
  ) {}

  private enchainer<T>(f: () => Promise<T>): Promise<T> {
    const p = this.file.then(f, f);
    this.file = p.catch(() => undefined);
    return p;
  }

  /** Lance (ou reprend) la boucle au volume donné ; false si impossible. */
  jouer(volume: number): Promise<boolean> {
    return this.enchainer(async () => {
      const n = await natif();
      if (!n) return false;
      if (this.etat === "vide") {
        const u = this.url();
        if (!u) return false;
        try {
          await n.preload({ assetId: this.id, assetPath: u, isUrl: true, volume: borne(volume) });
          this.etat = "pret";
        } catch {
          return false;
        }
      }
      await n.setVolume({ assetId: this.id, volume: borne(volume) }).catch(() => undefined);
      if (this.etat === "pause") await n.resume({ assetId: this.id }).catch(() => undefined);
      else if (this.etat === "pret") await n.loop({ assetId: this.id }).catch(() => undefined);
      this.etat = "joue";
      return true;
    });
  }

  pause(): Promise<void> {
    return this.enchainer(async () => {
      if (this.etat !== "joue") return;
      const n = await natif();
      await n?.pause({ assetId: this.id }).catch(() => undefined);
      this.etat = "pause";
    });
  }

  arreter(): Promise<void> {
    return this.enchainer(async () => {
      if (this.etat !== "joue" && this.etat !== "pause") return;
      const n = await natif();
      await n?.stop({ assetId: this.id }).catch(() => undefined);
      this.etat = "pret";
    });
  }

  volume(v: number): Promise<void> {
    return this.enchainer(async () => {
      if (this.etat === "vide") return;
      const n = await natif();
      await n?.setVolume({ assetId: this.id, volume: borne(v) }).catch(() => undefined);
    });
  }

  /** Nouveau fichier (ex. instrumental remplacé par l'admin). */
  recharger(): Promise<void> {
    return this.enchainer(async () => {
      if (this.etat === "vide") return;
      const n = await natif();
      await n?.unload({ assetId: this.id }).catch(() => undefined);
      this.etat = "vide";
    });
  }
}
