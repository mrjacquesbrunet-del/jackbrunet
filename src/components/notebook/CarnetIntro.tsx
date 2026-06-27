"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import {
  PenGlyph,
  HandsGlyph,
  BookGlyph,
  NoteGlyph,
  CheckGlyph,
  HighlighterGlyph,
  BookmarkGlyph,
} from "@/components/ui/DevoIcons";

const STEPS = [
  {
    n: "1",
    title: "Écris librement",
    text: "Un sujet de prière, une parole reçue de Dieu, une réflexion… Dépose ce que l'Esprit met sur ton cœur.",
  },
  {
    n: "2",
    title: "Classe & retrouve",
    text: "Chaque note est rangée (Prière · Parole reçue · Note) et te suit sur tous tes appareils quand tu es connecté.",
  },
  {
    n: "3",
    title: "Vois les réponses",
    text: "Marque tes prières « exaucées » et garde une trace vivante de la fidélité de Dieu dans ta vie.",
  },
];

const FEATURES = [
  { Icon: HandsGlyph, title: "Tes prières", text: "Note pour qui et quoi tu pries." },
  { Icon: BookGlyph, title: "Paroles reçues", text: "Garde les paroles que Dieu te donne." },
  { Icon: NoteGlyph, title: "Tes réflexions", text: "Tes pensées, au fil de tes méditations." },
  { Icon: CheckGlyph, title: "Prières exaucées", text: "Célèbre ce que Dieu a accompli." },
  { Icon: HighlighterGlyph, title: "Versets surlignés", text: "Tes versets marqués s'y retrouvent." },
  { Icon: BookmarkGlyph, title: "Plans de lecture", text: "Avance dans tes parcours, à ton rythme." },
];

export function CarnetIntro() {
  return (
    <>
      {/* Comment ça marche */}
      <section className="container-x pt-4">
        <Reveal from="up" className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Ton journal spirituel</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">
            Un espace à toi pour <span className="text-gradient">marcher avec Dieu</span>
          </h2>
          <p className="mt-3 text-night-900/65">
            Le carnet, c'est ton lieu intime : tu y écris, tu pries, et tu reviens voir comment
            Dieu répond. En trois pas.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} from="up" delay={i * 0.1}>
              <div className="glass h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-night-900 font-display text-xl font-extrabold text-dawn-400">
                  {s.n}
                </span>
                <p className="mt-4 font-display text-lg font-bold">{s.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-night-900/65">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tout ton parcours */}
      <section className="container-x pt-12">
        <Reveal from="up" className="text-center">
          <h3 className="font-display text-2xl font-extrabold sm:text-3xl">
            Tout ton <span className="text-gradient">parcours</span>, au même endroit
          </h3>
        </Reveal>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} from="up" delay={(i % 3) * 0.08}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-3xl border border-night-900/10 bg-white p-6"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-dawn-400/10 transition-transform duration-500 group-hover:scale-150" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-night-900 text-dawn-400">
                  <f.Icon className="h-6 w-6" />
                </span>
                <p className="relative mt-4 font-display text-lg font-bold">{f.title}</p>
                <p className="relative mt-1.5 text-sm leading-relaxed text-night-900/65">{f.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Transition vers l'outil */}
      <section className="container-x pt-12">
        <Reveal from="up" className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-spirit-600">
            <PenGlyph className="h-4 w-4" /> À toi d'écrire
          </span>
          <p className="mt-1 font-display text-xl font-bold">Commence ton carnet ci-dessous</p>
        </Reveal>
      </section>
    </>
  );
}
