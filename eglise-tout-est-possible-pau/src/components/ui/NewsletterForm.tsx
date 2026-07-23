"use client";

import { useState } from "react";
import { settings } from "@/lib/content";
import newsletter from "../../../content/newsletter.json";

// Formulaire d'inscription aux annonces.
// - Si une URL de formulaire (Brevo, Mailchimp…) est configurée dans le
//   CMS (Paramètres → Newsletter), l'e-mail y est envoyé directement :
//   la liste d'abonnés se construit là-bas, prête pour les envois.
// - Sinon, repli automatique : ouverture d'un e-mail pré-rempli vers
//   l'adresse de contact — aucune inscription n'est perdue.
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const formAction = (settings as { newsletter?: { formAction?: string } }).newsletter?.formAction ?? "";

  const mailtoFallback = (e: React.FormEvent) => {
    if (formAction) return; // le POST natif du formulaire s'en charge
    e.preventDefault();
    const subject = encodeURIComponent("Inscription aux annonces");
    const body = encodeURIComponent(
      `Bonjour,\n\nJe souhaite recevoir les annonces de l'église par e-mail.\nMon adresse : ${email}\n\nMerci !`,
    );
    window.location.href = `mailto:${settings.contactEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <form
      action={formAction || undefined}
      method={formAction ? "POST" : undefined}
      target={formAction ? "_blank" : undefined}
      onSubmit={mailtoFallback}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="email-annonces" className="sr-only">
          Adresse e-mail
        </label>
        <input
          id="email-annonces"
          name="EMAIL"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={newsletter.form.placeholder}
          className="w-full rounded-full border-2 border-night/15 bg-white px-6 py-4 text-base font-medium text-night outline-none transition-colors duration-300 placeholder:text-night/40 focus:border-leaf-deep"
        />
        <button type="submit" className="btn-primary shrink-0">
          {newsletter.form.button}
        </button>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-night/50">{newsletter.form.note}</p>
    </form>
  );
}
