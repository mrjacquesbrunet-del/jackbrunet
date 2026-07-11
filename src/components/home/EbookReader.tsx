"use client";

import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { siteConfig } from "@/config/site";
import { isNativeApp } from "@/lib/notifications";
import { openExternal } from "@/lib/external";
import { saveOrShareFile } from "@/lib/share";

/**
 * Boutons + aperçu d'un ebook PDF, adaptés à la plateforme.
 * - Web: aperçu en ligne (<object>) + télécharger + plein écran.
 * - App native: la WebView (surtout Android) ne sait pas afficher un PDF en
 *   ligne, et `<a download>` ne marche pas. On ouvre donc le PDF dans le
 *   navigateur du téléphone (qui l'affiche) et on l'enregistre via la feuille
 *   native (« Enregistrer dans Fichiers »).
 */
export function EbookReader({ pdf, filename }: { pdf: string; filename: string }) {
  const [native, setNative] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setNative(isNativeApp()), []);

  const localUrl = asset(pdf); // fichier embarqué dans l'app / le site
  const publicUrl = `${siteConfig.url}${pdf}`; // URL publique (navigateur système)

  async function save() {
    setBusy(true);
    try {
      await saveOrShareFile(localUrl, filename, "Ton ebook offert, Pasteur Jack");
    } finally {
      setBusy(false);
    }
  }

  if (native) {
    return (
      <div>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => openExternal(publicUrl)} className="btn-primary">
            Ouvrir l'ebook
          </button>
          <button type="button" onClick={save} disabled={busy} className="btn-ghost disabled:opacity-50">
            {busy? "Un instant…": "Enregistrer le PDF"}
          </button>
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white p-8 text-center text-night-900 shadow-card">
          <p className="font-display text-lg font-bold">Ton ebook est prêt</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-night-900/65">
            « Ouvrir l'ebook » l'affiche en grand dans ton navigateur.
            « Enregistrer le PDF » le sauvegarde sur ton téléphone (Fichiers), pour le garder
            hors connexion.
          </p>
        </div>
      </div>
    );
  }

  // Web
  return (
    <div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <a href={localUrl} download className="btn-primary">
          Télécharger le PDF
        </a>
        <a href={localUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          Ouvrir en plein écran
        </a>
      </div>
      <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-card">
        <object data={`${localUrl}#view=FitH`} type="application/pdf" className="h-[80vh] w-full">
          <div className="p-8 text-center text-night-900">
            <p className="font-display text-lg font-bold">Aperçu indisponible sur cet appareil</p>
            <p className="mt-2 text-sm text-night-900/65">
              Utilise le bouton « Télécharger le PDF » ci-dessus pour ouvrir l'ebook.
            </p>
          </div>
        </object>
      </div>
    </div>
  );
}
