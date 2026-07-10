"use client";

import { Markable } from "@/components/ui/Markable";

export type Word = { mot: string; translit?: string; sens?: string };
export type Commentary = {
  mots?: Word[];
  epoque?: string;
  passage?: string;
  culture?: string;
  interpretation?: string;
  commentaire?: string;
};

/** Un champ de commentaire, rendu « actionnable » (surligner / copier / partager
 * / enregistrer / noter) comme le reste des textes, si un id est fourni. */
function Field({
  label,
  text,
  id,
  reference,
}: {
  label: string;
  text?: string;
  id?: string;
  reference?: string;
}) {
  if (!text) return null;
  const body = <p className="mt-0.5 text-sm leading-relaxed text-night-900/80">{text}</p>;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-spirit-600">
        {label}
      </p>
      {id? (
        <Markable id={id} text={text} reference={reference} kind="commentaire">
          {body}
        </Markable>
      ): (
        body
      )}
    </div>
  );
}

export function CommentaryPanel({
  state,
  data,
  idBase,
  reference,
}: {
  state: "idle" | "loading" | "loaded" | "none";
  data?: Commentary;
  /** Base d'identifiant pour rendre le commentaire actionnable (surligner…). */
  idBase?: string;
  reference?: string;
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
      <Field label="Contexte de l'époque" text={data.epoque} id={idBase? `${idBase}:epoque`: undefined} reference={reference} />
      <Field label="Contexte du passage" text={data.passage} id={idBase? `${idBase}:passage`: undefined} reference={reference} />
      <Field label="Éclairage culturel" text={data.culture} id={idBase? `${idBase}:culture`: undefined} reference={reference} />
      <Field label="Interprétation" text={data.interpretation} id={idBase? `${idBase}:interpretation`: undefined} reference={reference} />
      <Field label="Commentaire" text={data.commentaire} id={idBase? `${idBase}:commentaire`: undefined} reference={reference} />
    </div>
  );
}
