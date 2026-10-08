"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Couleurs de la barre du haut (fondu nuit ou crème). */
export const FOND_BARRE = { clair: "rgb(243, 243, 237)", sombre: "rgb(12, 12, 11)" };
export const EVT_BARRE = "jb:barre";

const opaque = (c: string) => {
  const m = c.match(/rgba?\(([^)]+)\)/);
  if (!m) return false;
  const a = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)[3];
  return a === undefined || a >= 0.5;
};

function composantes(c: string): number[] {
  return (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}
function ecartFond(a: string, b: string): number {
  const x = composantes(a);
  const y = composantes(b);
  return x.length === 3 && y.length === 3 ? Math.max(...x.map((v, i) => Math.abs(v - y[i]))) : 0;
}

/**
 * Couleur réellement visible à une hauteur donnée : premier fond opaque et
 * large sous le point, sinon un fond fixe plein écran (pages sombres), sinon
 * le fond de la page. Une photo compte comme nuit.
 */
function couleurA(y: number): string {
  const x = Math.round(window.innerWidth / 2);
  const large = window.innerWidth * 0.7;
  for (let n = document.elementFromPoint(x, y) as HTMLElement | null; n && n !== document.documentElement; n = n.parentElement) {
    const r = n.getBoundingClientRect();
    if ((n.tagName === "IMG" || n.tagName === "VIDEO") && r.width >= large * 0.7) return FOND_BARRE.sombre;
    if (r.width < large) continue;
    const cs = getComputedStyle(n);
    if (cs.backgroundImage.includes("url(")) return FOND_BARRE.sombre;
    if (n !== document.body && opaque(cs.backgroundColor)) return cs.backgroundColor;
  }
  // Fond fixe plein écran posé derrière la page (Soutien, Groupe, Carnet…).
  for (const el of Array.from(document.querySelectorAll<HTMLElement>(".fixed.inset-0"))) {
    const cs = getComputedStyle(el);
    if (cs.pointerEvents === "none" && opaque(cs.backgroundColor) && el.getBoundingClientRect().height >= window.innerHeight * 0.9) {
      return cs.backgroundColor;
    }
  }
  return getComputedStyle(document.body).backgroundColor;
}

/**
 * Plus jamais de bande noire ou blanche au bord de l'écran : le fond derrière
 * la page (visible au rebond du défilement, ou sous une page courte) prend la
 * couleur du haut de la page quand on est en haut, et celle du bas quand on
 * est en bas. En haut, si la barre du haut est là, on prend sa couleur.
 */
export function FondDebordement() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    let attente = 0;
    const appliquer = () => {
      attente = 0;
      const nav = document.querySelector(".bottom-nav");
      const basEcran = nav ? nav.getBoundingClientRect().top : window.innerHeight;
      const main = document.querySelector("main");

      // 1) La marge sous la page (réservée à la barre d'onglets) : si elle est
      //    à nu, on la peint de la couleur du bas de la page, pour éviter la
      //    bande crème sous une page sombre (ou l'inverse).
      if (main) {
        main.style.backgroundColor = "";
        const sous = document.elementFromPoint(Math.round(window.innerWidth / 2), Math.max(0, basEcran - 3));
        if (sous === main || sous === document.body || sous === html) {
          const dernier = main.lastElementChild as HTMLElement | null;
          const r = dernier?.getBoundingClientRect();
          if (r && r.bottom > 0 && r.bottom < basEcran) {
            const c = couleurA(Math.max(0, Math.round(r.bottom) - 3));
            if (ecartFond(c, getComputedStyle(document.body).backgroundColor) > 30) main.style.backgroundColor = c;
          }
        }
      }

      // 2) Le fond derrière la page (visible au rebond sur les anciens
      //    téléphones) : couleur du haut quand on est en haut, du bas sinon.
      // Jeux en plein écran (Chemin, quiz…) : fond nuit, comme leur décor.
      if (document.querySelector(".qm")) {
        html.style.backgroundColor = FOND_BARRE.sombre;
        return;
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const enHaut = max < 80 || window.scrollY < max / 2;
      let c: string;
      if (enHaut) {
        const barre = html.dataset.barre as "clair" | "sombre" | undefined;
        c = barre ? FOND_BARRE[barre] : couleurA(2);
      } else {
        c = couleurA(Math.max(0, basEcran - 3));
      }
      html.style.backgroundColor = c;
    };
    const planifier = () => {
      if (!attente) attente = requestAnimationFrame(appliquer);
    };
    const minuteurs = [0, 350, 1200, 2500].map((d) => setTimeout(planifier, d));
    window.addEventListener("scroll", planifier, { passive: true });
    window.addEventListener("resize", planifier);
    window.addEventListener(EVT_BARRE, planifier);
    return () => {
      const main = document.querySelector("main");
      if (main) main.style.backgroundColor = "";
      minuteurs.forEach(clearTimeout);
      if (attente) cancelAnimationFrame(attente);
      window.removeEventListener("scroll", planifier);
      window.removeEventListener("resize", planifier);
      window.removeEventListener(EVT_BARRE, planifier);
    };
  }, [pathname]);

  return null;
}
