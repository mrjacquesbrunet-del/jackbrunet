"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Title3D } from "@/components/ui/Title3D";
import { home } from "@/lib/content";

// « Face à face » façon landonorris.com (ON TRACK / OFF TRACK) :
// deux colonnes en vis-à-vis (titres 3D, textes tournés vers le centre,
// boutons carrés à flèche courbée côte à côte au milieu), puis deux
// images qui se rapprochent en perspective au fil du scroll.
// Photos et textes gérés dans le CMS (Accueil → Vision & histoire).

type Side = {
  title: string;
  accent: string;
  text: string;
  href: string;
  image?: string;
};

function CurvedArrow({ mirror }: { mirror?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-5 w-5 fill-none stroke-current stroke-2 sm:h-6 sm:w-6 ${
        mirror ? "-scale-x-100" : ""
      }`}
      aria-hidden
    >
      <path d="M4 17v-4a5 5 0 0 1 5-5h10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SidePanel({ side, align }: { side: Side; align: "left" | "right" }) {
  const toCenter = align === "left" ? "text-right" : "text-left";
  const stick = align === "left" ? "items-end" : "items-start";

  return (
    <div className={`flex flex-col ${stick} ${toCenter}`}>
      <Link href={side.href} className="group inline-block">
        <Title3D>
          <h3 className="display-2 !text-[clamp(1.35rem,5.4vw,4rem)]">
            <span className="block text-pulse drop-shadow-[0_0_18px_rgba(48,255,18,0.3)]">
              {side.accent}
            </span>
            <span className="block">{side.title}</span>
          </h3>
        </Title3D>
      </Link>
      <p className="mt-6 max-w-[16rem] text-sm leading-relaxed text-night/70 sm:mt-8 sm:max-w-sm sm:text-base">
        {side.text}
      </p>
      <Link
        href={side.href}
        aria-label={`${side.accent} ${side.title}`}
        className="mt-7 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-pulse text-night transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-[0_0_32px_rgba(48,255,18,0.5)] active:translate-y-0.5 sm:h-14 sm:w-14 sm:rounded-2xl"
      >
        <CurvedArrow mirror={align === "left"} />
      </Link>
    </div>
  );
}

function FaceImage({ src, alt, flip }: { src?: string; alt: string; flip?: boolean }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="50vw"
        className={`object-cover ${flip ? "object-left" : "object-right"}`}
      />
    );
  }
  // Placeholder élégant en attendant les photos (CMS)
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: flip
          ? "radial-gradient(130% 120% at 100% 30%, rgba(163,205,134,0.5) 0%, rgba(34,35,32,0.92) 55%, #121212 100%), #191A17"
          : "radial-gradient(130% 120% at 0% 30%, rgba(48,255,18,0.28) 0%, rgba(34,35,32,0.92) 55%, #121212 100%), #191A17",
      }}
    />
  );
}

export function FaceOff() {
  const duo = home.duo;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Les deux images partent des bords, tournées l'une vers l'autre
  // (perspective 3D), puis se rejoignent bien droites au centre.
  const xLeft = useTransform(scrollYProgress, [0.05, 0.6], ["-38%", "0%"]);
  const xRight = useTransform(scrollYProgress, [0.05, 0.6], ["38%", "0%"]);
  const rotLeft = useTransform(scrollYProgress, [0.05, 0.6], [16, 0]);
  const rotRight = useTransform(scrollYProgress, [0.05, 0.6], [-16, 0]);
  const scale = useTransform(scrollYProgress, [0.05, 0.6], [0.82, 1]);
  const gap = useTransform(scrollYProgress, [0.05, 0.6], ["2.5rem", "0rem"]);

  return (
    <section className="overflow-hidden bg-cream pt-24 text-night sm:pt-32">
      <div className="wrap">
        <Reveal>
          {/* Face à face des textes : 2 colonnes, même sur mobile */}
          <div className="grid grid-cols-2 gap-5 sm:gap-10">
            <SidePanel side={duo.left} align="left" />
            <SidePanel side={duo.right} align="right" />
          </div>
        </Reveal>
      </div>

      {/* Le texte s'arrête juste au-dessus des photos */}
      <motion.div
        ref={ref}
        className="mt-10 flex items-end justify-center sm:mt-12"
        style={reduce ? undefined : { gap, perspective: 1200 }}
      >
        <motion.div
          className="relative aspect-[3/4] w-1/2 max-w-xl overflow-hidden"
          style={
            reduce
              ? undefined
              : { x: xLeft, scale, rotateY: rotLeft, transformOrigin: "bottom right" }
          }
        >
          <Link href={duo.left.href} aria-label={duo.left.title} className="absolute inset-0 z-10" />
          <FaceImage src={duo.left.image || undefined} alt={duo.left.title} />
        </motion.div>
        <motion.div
          className="relative aspect-[3/4] w-1/2 max-w-xl overflow-hidden"
          style={
            reduce
              ? undefined
              : { x: xRight, scale, rotateY: rotRight, transformOrigin: "bottom left" }
          }
        >
          <Link href={duo.right.href} aria-label={duo.right.title} className="absolute inset-0 z-10" />
          <FaceImage src={duo.right.image || undefined} alt={duo.right.title} flip />
        </motion.div>
      </motion.div>
    </section>
  );
}
