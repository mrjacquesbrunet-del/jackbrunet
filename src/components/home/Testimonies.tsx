"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

export function Testimonies() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [testimony, setTestimony] = useState("");
  const [consent, setConsent] = useState(true);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (testimony.trim().length < 3) {
      setStatus("error");
      setMessage("Écris ton témoignage avant d'envoyer.");
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
      setMessage("Merci infiniment pour ton témoignage. Il nous encourage et nous te répondrons.");
      setName("");
      setEmail("");
      setPhone("");
      setTestimony("");
    };
    if (STATIC_DEMO) {
      setTimeout(done, 600);
      return;
    }
    try {
      const res = await fetch("/api/testimony", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, testimony, consent }),
      });
      if (!res.ok) throw new Error();
      done();
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue. Réessaie dans un instant.");
    }
  }

  return (
    <section id="temoignages" className="container-x scroll-mt-24 py-20 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal from="left">
          <SectionHeader
            eyebrow="Témoignages"
            title={
              <>
                Partage-nous ton <span className="text-gradient">témoignage</span>
              </>
            }
            description="Dieu a agi dans ta vie ? Raconte-nous : cela nous encourage à continuer. Nous te répondrons, et avec ta permission, nous pourrons le partager à la communauté pour encourager d'autres à persévérer."
          />
          <ul className="mt-8 space-y-3">
            {[
              "Chaque témoignage est lu avec attention",
              "Nous te répondons personnellement",
              "Partagé seulement avec ton accord",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-night-900/75">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-dawn-400/25 text-xs text-spirit-700">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal from="right" delay={0.1}>
          <div className="glass-strong p-7 sm:p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <h3 className="font-display text-2xl font-bold">Merci, gloire à Dieu !</h3>
                <p className="max-w-sm text-night-900/70">{message}</p>
                <button onClick={() => setStatus("idle")} className="btn-ghost mt-2">
                  Partager un autre témoignage
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="t-name" className="mb-1.5 block text-sm font-medium text-night-900/80">
                      Prénom
                    </label>
                    <input
                      id="t-name"
                      type="text"
                      autoComplete="given-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ton prénom"
                      className="field"
                    />
                  </div>
                  <div>
                    <label htmlFor="t-phone" className="mb-1.5 block text-sm font-medium text-night-900/80">
                      Téléphone <span className="text-night-900/40">(optionnel)</span>
                    </label>
                    <input
                      id="t-phone"
                      type="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      className="field"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="t-email" className="mb-1.5 block text-sm font-medium text-night-900/80">
                    Email
                  </label>
                  <input
                    id="t-email"
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
                  <label htmlFor="t-text" className="mb-1.5 block text-sm font-medium text-night-900/80">
                    Ton témoignage
                  </label>
                  <textarea
                    id="t-text"
                    value={testimony}
                    onChange={(e) => {
                      setTestimony(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    rows={4}
                    placeholder="Raconte-nous ce que Dieu a fait…"
                    className="field-area"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-night-900/70">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="h-4 w-4 rounded border-night-900/30 accent-dawn-500"
                  />
                  J'autorise le partage de mon témoignage pour encourager la communauté.
                </label>
                {status === "error" ? <p className="field-error">{message}</p> : null}
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? "Envoi…" : "Envoyer mon témoignage"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
