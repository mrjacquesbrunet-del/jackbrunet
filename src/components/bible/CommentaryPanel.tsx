"use client";

import type { ReactNode } from "react";

export type Word = { mot: string; translit?: string; sens?: string };
export type Commentary = {
  mots?: Word[];
  epoque?: string;
  passage?: string;
  culture?: string;
  interpretation?: string;
  commentaire?: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-spirit-600">
        {label}
      </p>
      <p className="mt-0.5 text-sm leading-relaxed text-night-900/80">{children}</p>
    </div>
  );
}

export function CommentaryPanel({
  state,
  data,
}: {
  state: "idle" | "loading" | "loaded" | "none";
  data?: Commentary;
}) {
  if (state === "loading") {
    return (
      <div className="mt-2 rounded-2xl border border-night-900/10 bg-white p-4 text-sm text-night-900/50 shadow-sm">
        Chargement du commentaire…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mt-2 rounded-2xl border border-night-900/10 bg-white p-4 text-sm text-night-900/55 shadow-sm">
        Commentaire bientôt disponible pour ce verset.
      </div>
    );
  }
  return (
    <div className="mt-2 space-y-3 rounded-2xl border border-dawn-400/40 bg-white p-4 text-night-900 shadow-sm sm:p-5">
      {data.mots && data.mots.length > 0? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-spirit-600">
            Mots d'origine
          </p>
          <ul className="mt-1 space-y-1">
            {data.mots.map((m, idx) => (
              <li key={idx} className="text-sm text-night-900/85">
                <span className="font-display text-base font-bold">{m.mot}</span>
                {m.translit? (
                  <span className="italic text-night-900/55"> ({m.translit})</span>
                ): null}
                {m.sens? <span>, {m.sens}</span>: null}
              </li>
            ))}
          </ul>
        </div>
      ): null}
      <Field label="Contexte de l'époque">{data.epoque}</Field>
      <Field label="Contexte du passage">{data.passage}</Field>
      <Field label="Éclairage culturel">{data.culture}</Field>
      <Field label="Interprétation">{data.interpretation}</Field>
      <Field label="Commentaire">{data.commentaire}</Field>
    </div>
  );
}
