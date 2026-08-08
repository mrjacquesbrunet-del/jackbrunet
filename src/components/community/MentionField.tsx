"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/community/Avatar";
import { searchProfiles, type Profile } from "@/lib/community";

/**
 * Champ de saisie (input ou textarea) avec auto-complétion des mentions:
 * en tapant « @ » suivi de lettres, une liste de membres s'affiche ;
 * on en choisit un pour insérer « @pseudo ».
 */
export function MentionField({
  value,
  onChange,
  onEnter,
  placeholder,
  rows,
  autoGrow,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  placeholder?: string;
  rows?: number;
  /** La zone de texte grandit automatiquement avec le contenu (jusqu'à une limite). */
  autoGrow?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  // Agrandit la zone de texte pour épouser le contenu (mode autoGrow).
  function autosize() {
    const el = ref.current;
    if (!el || !autoGrow) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }
  useEffect(() => {
    autosize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, autoGrow]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [results, setResults] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Détecte le « @token » en cours de frappe (juste avant le curseur).
  function detectMention(text: string, caret: number) {
    const before = text.slice(0, caret);
    const m = before.match(/(?:^|\s)@([\p{L}\p{N}_.-]{1,30})$/u);
    return m? m[1]: null;
  }

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!open || query.length < 1) {
      setResults([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setResults(await searchProfiles(query, 6));
    }, 200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query, open]);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const text = e.target.value;
    onChange(text);
    const caret = e.target.selectionStart?? text.length;
    const token = detectMention(text, caret);
    if (token!== null) {
      setQuery(token);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  function pick(p: Profile) {
    const el = ref.current;
    const caret = el?.selectionStart?? value.length;
    const before = value.slice(0, caret).replace(/@([\p{L}\p{N}_.-]{1,30})$/u, `@${p.pseudo} `);
    const after = value.slice(caret);
    const next = before + after;
    onChange(next);
    setOpen(false);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = before.length;
      try {
        el?.setSelectionRange(pos, pos);
      } catch {
        /* input simple */
      }
    });
  }

  const common = {
    ref,
    value,
    placeholder,
    onChange: handleChange,
    className: className?? "field w-full",
    onBlur: () => setTimeout(() => setOpen(false), 150),
  };

  return (
    <div className="relative flex-1">
      {rows? (
        <textarea
          {...common}
          rows={rows}
          onInput={autosize}
          onKeyDown={(e) => {
            // Entrée = envoyer, Maj+Entrée = nouvelle ligne (seulement si onEnter existe)
            if (e.key === "Enter" &&!e.shiftKey &&!open && onEnter) {
              e.preventDefault();
              onEnter();
            }
          }}
          className={`${common.className} ${autoGrow? "resize-none overflow-y-auto": "resize-y"}`}
          style={autoGrow? { maxHeight: 220 }: undefined}
        />
      ): (
        <input
          {...common}
          onKeyDown={(e) => {
            if (e.key === "Enter" &&!open && onEnter) onEnter();
          }}
        />
      )}

      {open && results.length > 0? (
        <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-2xl border border-night-900/10 bg-white shadow-xl">
          <ul className="max-h-60 overflow-y-auto">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(p);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-night-900/[0.04]"
                >
                  <Avatar pseudo={p.pseudo} url={p.avatar_url} size={28} />
                  <span className="text-sm font-semibold text-night-900/85">@{p.pseudo}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ): null}
    </div>
  );
}
