"use client";

import { useEffect, useRef, useState } from "react";
import { MentionField } from "@/components/community/MentionField";
import { FONDS_CLAIRS, FONDS_STORY } from "@/lib/stories";
import { imageLegere } from "@/lib/image-legere";

/** Une story à l'écran : photo (+ légende) ou texte sur fond coloré. */
export function RenduStory({
  image_url,
  caption,
  fond,
  masquerLegende = false,
}: {
  image_url: string | null;
  caption?: string | null;
  fond?: string | null;
  masquerLegende?: boolean;
}) {
  if (!image_url) {
    const clair = FONDS_CLAIRS.has(fond ?? "");
    return (
      <div className="absolute inset-0 grid place-items-center px-8" style={{ background: FONDS_STORY[fond ?? ""] ?? FONDS_STORY.nuit }}>
        <p
          className={`max-w-md whitespace-pre-wrap text-center font-display font-extrabold leading-snug ${clair ? "text-night-950" : "text-white"} ${
            (caption?.length ?? 0) > 140 ? "text-[22px]" : (caption?.length ?? 0) > 60 ? "text-[27px]" : "text-[34px]"
          }`}
        >
          {caption}
        </p>
      </div>
    );
  }
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img {...imageLegere(image_url, 540)} alt="" className="absolute inset-0 h-full w-full object-contain" />
      {caption && !masquerLegende ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] bg-gradient-to-t from-black/60 to-transparent px-5 pb-3 pt-10">
          <p className="text-center text-[15px] font-semibold leading-relaxed text-white">{caption}</p>
        </div>
      ) : null}
    </>
  );
}

/** Éditeur de story texte : un mot du jour, un verset… sur un fond au choix. */
export function EditeurStoryTexte({
  envoi,
  onAnnuler,
  onPublier,
}: {
  envoi: boolean;
  onAnnuler: () => void;
  onPublier: (texte: string, fond: string) => void;
}) {
  const [texte, setTexte] = useState("");
  const [fond, setFond] = useState("aurore");
  const clair = FONDS_CLAIRS.has(fond);
  const zone = useRef<HTMLDivElement>(null);
  useEffect(() => {
    zone.current?.querySelector("textarea")?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-[150] flex flex-col" style={{ background: FONDS_STORY[fond] }}>
      <div className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onAnnuler} className={`rounded-full px-4 py-2 text-sm font-bold ${clair ? "text-night-950/80" : "text-white/90"}`}>
          Annuler
        </button>
        <button
          type="button"
          onClick={() => onPublier(texte, fond)}
          disabled={envoi || !texte.trim()}
          className="rounded-full bg-night-950 px-5 py-2.5 text-sm font-extrabold text-dawn-400 disabled:opacity-40"
        >
          {envoi ? "Envoi…" : "Publier"}
        </button>
      </div>
      <div ref={zone} className="flex min-h-0 flex-1 items-center px-6">
        <div className="w-full">
        <MentionField
          value={texte}
          onChange={(v) => setTexte(v.slice(0, 280))}
          placeholder="Un mot du jour, un verset… cite avec @"
          rows={3}
          autoGrow
          className={`w-full resize-none bg-transparent text-center font-display text-[28px] font-extrabold leading-snug outline-none ${
            clair ? "text-night-950 placeholder:text-night-950/40" : "text-white placeholder:text-white/50"
          }`}
        />
        </div>
      </div>
      <div className="flex justify-center gap-3 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3">
        {Object.entries(FONDS_STORY).map(([cle, css]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setFond(cle)}
            aria-label={`Fond ${cle}`}
            aria-pressed={fond === cle}
            className={`h-9 w-9 rounded-full ring-2 transition-transform ${fond === cle ? "scale-110 ring-white" : "ring-white/40"}`}
            style={{ background: css }}
          />
        ))}
      </div>
    </div>
  );
}
