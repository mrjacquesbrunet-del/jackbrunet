"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/Section";

type Status = "idle" | "loading" | "success" | "error";

// Déploiement statique de démonstration : pas de backend, succès optimiste.
const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === "true";

export function PrayerSpace() {
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (request.trim().length < 3) {
      setStatus("error");
      setMessage("Écris ta requête avant d'envoyer.");
      return;
    }
    setStatus("loading");
    if (STATIC_DEMO) {
      setTimeout(() => {
        setStatus("success");
        setMessage("Ta requête a été reçue. Nous prions pour toi. 🙏");
        setName("");
        setRequest("");
      }, 600);
      return;
    }
    try {
      const res = await fetch("/api/prayer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, request, isPrivate }),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setMessage("Ta requête a été reçue. Nous prions pour toi. 🙏");
      setName("");
      setRequest("");
    } catch {
      setStatus("error");
      setMessage("Une erreur est survenue. Réessaie dans un instant.");
    }
  }

  return (
    <section
      id="priere"
      className="relative scroll-mt-24 overflow-hidden border-y border-white/10 bg-night-900/50 py-20 sm:py-28"
    >
      <div className="blob left-1/4 top-1/4 h-80 w-80 bg-spirit-600/20" />
      <div className="container-x relative grid gap-12 lg:grid-cols-2 lg:items-center">
        <Reveal from="left">
          <SectionHeader
            eyebrow="🙏 Espace prière"
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
              "Tu peux rester totalement anonyme",
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
            {status === "success" ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-dawn-500/20 text-3xl">
                  🙏
                </span>
                <h3 className="font-display text-2xl font-bold">Reçu, du fond du cœur</h3>
                <p className="max-w-sm text-cream/70">{message}</p>
                <button
                  onClick={() => setStatus("idle")}
                  className="btn-ghost mt-2"
                >
                  Déposer une autre requête
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
                <div>
                  <label htmlFor="prayer-name" className="mb-1.5 block text-sm font-medium text-cream/80">
                    Ton prénom <span className="text-cream/40">(optionnel)</span>
                  </label>
                  <input
                    id="prayer-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anonyme"
                    className="w-full rounded-2xl border border-white/15 bg-night-900/80 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none focus:ring-2 focus:ring-dawn-400/30"
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
                    className="w-full resize-none rounded-2xl border border-white/15 bg-night-900/80 px-4 py-3 text-sm text-cream placeholder:text-cream/40 focus:border-dawn-400/60 focus:outline-none focus:ring-2 focus:ring-dawn-400/30"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-cream/70">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-night-900 accent-dawn-500"
                  />
                  Garder ma requête privée (équipe de prière uniquement)
                </label>
                {status === "error" ? (
                  <p className="text-xs text-dawn-300">{message}</p>
                ) : null}
                <button type="submit" className="btn-primary" disabled={status === "loading"}>
                  {status === "loading" ? "Envoi…" : "Confier ma prière"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
