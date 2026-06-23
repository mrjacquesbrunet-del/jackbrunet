"use client";

import { useState, type FormEvent } from "react";
import { newsletterEndpointForSource } from "@/config/brevo";
import { submitToBrevo } from "@/lib/brevo";

type NewsletterFormProps = {
  /** Identifie d'où vient l'inscription (analytics / future app). */
  source: string;
  placeholder?: string;
  cta?: string;
  /** Mise en page compacte (inline) ou empilée. */
  layout?: "inline" | "stacked";
  /** Variante de couleur du bouton. */
  variant?: "primary" | "spirit";
  /** Taille du champ : normale (md) ou agrandie (lg). */
  size?: "md" | "lg";
  note?: string;
};

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulaire de captation email — réutilisé partout (pensée du jour, plan,
 * vidéos, dons, boutique, footer, pop-up). Une seule logique, un seul endpoint.
 */
export function NewsletterForm({
  source,
  placeholder = "Ton adresse email",
  cta = "Je m'inscris",
  layout = "inline",
  variant = "primary",
  size = "md",
  note = "Gratuit. Désinscription en un clic. Aucun spam.",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Entre une adresse email valide.");
      return;
    }
    setStatus("loading");
    const endpoint = newsletterEndpointForSource(source);
    try {
      if (endpoint) {
        await submitToBrevo(endpoint, { EMAIL: email });
      } else {
        // Adresse Brevo pas encore configurée : succès optimiste (rien envoyé).
        await new Promise((r) => setTimeout(r, 500));
      }
      setStatus("success");
      setMessage("C'est fait ! Vérifie ta boîte mail.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue. Réessaie dans un instant.");
    }
  }

  if (status === "success") {
    return (
      <div className="glass flex items-center gap-3 px-5 py-4 text-sm">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 font-bold text-night-950">
          ✓
        </span>
        <p>{message}</p>
      </div>
    );
  }

  const btnClass = variant === "spirit" ? "btn-spirit" : "btn-primary";
  // En taille "lg", on agrandit le champ (les utilitaires priment sur .field).
  const fieldSize = size === "lg" ? " px-6 py-4 text-base" : "";

  return (
    <form
      onSubmit={onSubmit}
      className={
        layout === "inline"
          ? "flex w-full flex-col gap-3 sm:flex-row"
          : "flex w-full flex-col gap-3"
      }
      noValidate
    >
      <label className="sr-only" htmlFor={`email-${source}`}>
        Adresse email
      </label>
      <input
        id={`email-${source}`}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        placeholder={placeholder}
        className={`field flex-1${fieldSize}`}
      />
      <button type="submit" className={btnClass} disabled={status === "loading"}>
        {status === "loading" ? "Un instant…" : cta}
      </button>
      {status === "error" ? (
        <p className="field-error sm:basis-full">{message}</p>
      ) : note ? (
        <p className="field-note sm:basis-full">{note}</p>
      ) : null}
    </form>
  );
}
