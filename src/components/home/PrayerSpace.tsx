"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";
import { BREVO_ENDPOINTS } from "@/config/brevo";
import { submitToBrevo } from "@/lib/brevo";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PrayerSpace() {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [request, setRequest] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (request.trim().length < 3) {
      setStatus("error");
      setMessage("Écris ta requête avant d'envoyer.");
      return;
    }
    if (name.trim().length < 2 || lastName.trim().length < 2) {
      setStatus("error");
      setMessage("Indique ton prénom et ton nom.");
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Entre une adresse email valide pour qu'on puisse te répondre.");
      return;
    }
    setStatus("loading");
    const done = () => {
      setStatus("success");
      setMessage("Ta requête a été reçue. Nous prions pour toi.");
      setName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRequest("");
    };
    const endpoint = BREVO_ENDPOINTS.priere;
    try {
      if (endpoint) {
        await submitToBrevo(endpoint, {
          EMAIL: email,
          PRENOM: name,
          NOM: lastName,
          TELEPHONE: phone,
          // Brevo limite ce champ texte à 200 caractères.
          MESSAGE: request.slice(0, 200),
        });
      } else {
        await new Promise((r) => setTimeout(r, 500));
      }
      done();
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue. Réessaie dans un instant.");
    }
  }

  return (
    <section
      id="priere"
      className="dark-ctx bg-topo-dark relative scroll-mt-24 overflow-hidden border-y border-white/10 py-20 sm:py-28"
    >
      <div className="blob left-1/4 top-1/4 h-80 w-80 bg-spirit-600/20" />
      <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal from="left">
          <SectionHeader
            eyebrow="Espace prière"
            title={
              <>
                Tu n'as pas à porter <span className="text-gradient">ça seul(e)</span>
              </>
            }
            description="Dépose ce qui pèse sur ton cœur. Notre équipe et notre communauté portent chaque requête dans la prière. Aucun fardeau n'est trop petit, ni trop lourd."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Chaque requête est lue et confiée à Dieu",
              "Nous prions personnellement pour toi et te répondons",
              "Une communauté qui intercède chaque jour",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-cream/75">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dawn-500/20 text-xs text-dawn-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <div className="glass-strong p-7 sm:p-8">
            {status === "success"? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <h3 className="font-display text-2xl font-bold">Reçu, du fond du cœur</h3>
                <p className="max-w-sm text-cream/70">{message}</p>
                <button onClick={() => setStatus("idle")} className="btn-ghost mt-2">
                  Déposer une autre requête
                </button>
              </div>
            ): (
              <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="prayer-name" className="mb-1.5 block text-sm font-medium text-cream/80">
                      Prénom
                    </label>
                    <input
                      id="prayer-name"
                      type="text"
                      autoComplete="given-name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Ton prénom"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="prayer-lastname" className="mb-1.5 block text-sm font-medium text-cream/80">
                      Nom
                    </label>
                    <input
                      id="prayer-lastname"
                      type="text"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (status === "error") setStatus("idle");
                      }}
                      placeholder="Ton nom"
                      className="field"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="prayer-phone" className="mb-1.5 block text-sm font-medium text-cream/80">
                    Téléphone <span className="text-cream/40">(optionnel)</span>
                  </label>
                  <input
                    id="prayer-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="prayer-email" className="mb-1.5 block text-sm font-medium text-cream/80">
                    Email
                  </label>
                  <input
                    id="prayer-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="ton@email.com"
                    className="field"
                  />
                </div>
                <div>
                  <label htmlFor="prayer-text" className="mb-1.5 block text-sm font-medium text-cream/80">
                    Ta requête de prière
                  </label>
                  <textarea
                    id="prayer-text"
                    value={request}
                    onChange={(e) => {
                      setRequest(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    rows={4}
                    placeholder="Partage ce qui est sur ton cœur…"
                    className="field-area"
                  />
                </div>
                {status === "error"? (
                  <p className="field-error">{message}</p>
                ): (
                  <p className="field-note">
                    Tes coordonnées restent confidentielles et nous servent uniquement à te répondre.
                  </p>
                )}
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading"? "Envoi…": "Confier ma prière"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
