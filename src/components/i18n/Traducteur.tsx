"use client";

import { useEffect } from "react";
import { chargerDictionnaire, getLangue, traduireTexte } from "@/lib/i18n";
import { chargerContenu, prechargerContenus } from "@/lib/contenu-i18n";

/**
 * Traduit l'interface à l'affichage (anglais, portugais) : chaque texte
 * français présent dans le dictionnaire est remplacé par sa traduction, au
 * fur et à mesure que React affiche les écrans. Ne touche pas aux zones
 * marquées translate="no" ou .notranslate (Bible, textes des membres…),
 * ni aux champs de saisie.
 */
const ATTRIBUTS = ["placeholder", "title", "aria-label", "alt"];
const IGNORES = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "svg"]);

export function Traducteur() {
  useEffect(() => {
    const langue = getLangue();
    document.documentElement.lang = langue === "pt" ? "pt-BR" : langue;
    const fin = () => document.documentElement.classList.remove("i18n-attente");
    if (langue === "fr") {
      fin();
      return;
    }
    // Filet de sécurité : jamais d'écran masqué plus de 2,5 s.
    const filet = setTimeout(fin, 2500);
    let obs: MutationObserver | null = null;
    // Dernière valeur posée par nous sur chaque nœud (évite les boucles).
    const posees = new WeakMap<Node, string>();

    const exclu = (el: Element | null): boolean => {
      for (let e = el; e; e = e.parentElement) {
        if (IGNORES.has(e.tagName) || e.getAttribute("translate") === "no" || e.classList.contains("notranslate") || (e as HTMLElement).isContentEditable) return true;
      }
      return false;
    };

    const texteNoeud = (n: Text) => {
      const v = n.nodeValue;
      if (!v || !/[A-Za-zÀ-ÿ]/.test(v) || posees.get(n) === v) return;
      if (exclu(n.parentElement)) return;
      const tr = traduireTexte(v);
      if (tr === null) return;
      // Garde les espaces autour (mise en page des phrases coupées par des balises)
      const debut = v.match(/^\s*/)![0];
      const finEsp = v.match(/\s*$/)![0];
      const nouveau = debut + tr + finEsp;
      posees.set(n, nouveau);
      if (nouveau !== v) n.nodeValue = nouveau;
    };

    const attributs = (el: Element) => {
      for (const a of ATTRIBUTS) {
        const v = el.getAttribute(a);
        if (!v) continue;
        const cle = `@${a}`;
        if ((el as unknown as Record<string, string>)[cle] === v) continue;
        const tr = traduireTexte(v);
        if (tr !== null && tr !== v) {
          (el as unknown as Record<string, string>)[cle] = tr;
          el.setAttribute(a, tr);
        }
      }
    };

    const parcourir = (racine: Node) => {
      if (racine.nodeType === Node.TEXT_NODE) return texteNoeud(racine as Text);
      if (racine.nodeType !== Node.ELEMENT_NODE) return;
      const el = racine as Element;
      if (exclu(el)) return;
      attributs(el);
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: (n) =>
          n.nodeType === Node.ELEMENT_NODE &&
          (IGNORES.has((n as Element).tagName) || (n as Element).getAttribute("translate") === "no" || (n as Element).classList.contains("notranslate"))
            ? NodeFilter.FILTER_REJECT
            : NodeFilter.FILTER_ACCEPT,
      });
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) texteNoeud(n as Text);
        else attributs(n as Element);
      }
    };

    const titre = () => {
      const tr = traduireTexte(document.title.split(" | ")[0]);
      if (tr) document.title = document.title.replace(document.title.split(" | ")[0], tr);
    };

    // Boîtes de dialogue du navigateur (confirm / alert / prompt)
    const conf = window.confirm.bind(window);
    const alrt = window.alert.bind(window);
    const prmt = window.prompt.bind(window);
    window.confirm = (m?: string) => conf(m ? traduireTexte(m) ?? m : m);
    window.alert = (m?: string) => alrt(m ? traduireTexte(m) ?? m : m);
    window.prompt = (m?: string, d?: string) => prmt(m ? traduireTexte(m) ?? m : m, d);

    let actif = true;
    // Contenus traduits : la méditation du jour avant d'afficher l'écran,
    // la formation et les études en arrière-plan.
    const meditations = chargerContenu(langue, "devotions");
    prechargerContenus(langue);
    Promise.all([chargerDictionnaire(langue), meditations]).then(([ok]) => {
      if (!actif) return;
      if (ok) {
        parcourir(document.body);
        titre();
        obs = new MutationObserver((muts) => {
          for (const m of muts) {
            if (m.type === "characterData") texteNoeud(m.target as Text);
            else if (m.type === "attributes") attributs(m.target as Element);
            else m.addedNodes.forEach(parcourir);
          }
        });
        obs.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTS });
        new MutationObserver(titre).observe(document.querySelector("title") ?? document.head, { childList: true, subtree: true, characterData: true });
      }
      clearTimeout(filet);
      fin();
    });

    return () => {
      actif = false;
      obs?.disconnect();
      clearTimeout(filet);
      window.confirm = conf;
      window.alert = alrt;
      window.prompt = prmt;
    };
  }, []);

  return null;
}
