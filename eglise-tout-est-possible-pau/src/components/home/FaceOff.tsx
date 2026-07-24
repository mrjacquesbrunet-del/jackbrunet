"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { home } from "@/lib/content";

// « Face à face » façon landonorris.com (ON TRACK / OFF TRACK) :
// deux portes d'entrée — la vision et l'histoire — et, en dessous,
// deux images qui se rapprochent et grossissent au fil du scroll
// jusqu'à se retrouver face à face.
// Les photos se gèrent dans le CMS (Accueil → Vision & histoire).

type Side = {
  title: string;
  accent: string;
  text: string;
  href: string;
  image?: string;
};

function SidePanel({ side, align }: { side: Side; align: "left" | "right" }) {
  return (
    <div className={align === "right" ? "sm:text-right" : ""}>
      <Link href={side.href} className="group inline-block">
        <h3 className="relative inline-block display-2">
          {side.title}
          <span
            aria-hidden
            className={`script pointer-events-none absolute -bottom-4 text-[0.9em] lowercase text-pulse drop-shadow-[0_0_18px_rgba(48,255,18,0.35)] transition-transform duration-500 ease-smooth group-hover:scale-110 ${
              align === "left" ? "-left-3 -rotate-6" : "-right-3 rotate-6"
            }`}
          >
            {side.accent}
          </span>
        </h3>
      </Link>
      <p
        className={`mt-8 max-w-sm leading-relaxed text-night/70 ${
          align === "right" ? "sm:ml-auto" : ""
        }`}
      >
        {side.text}
      </p>
      <Link
        href={side.href}
        aria-label={`${side.accent} ${side.title}`}
        className="group mt-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-pulse text-night transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-[0_0_36px_rgba(48,255,18,0.5)] active:translate-y-1"
        style={{ boxShadow: "0 5px 0 #16a509" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2 transition-transform duration-300 group-hover:translate-x-0.5"
          aria-hidden
        >
          <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
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

  // Les deux images partent des bords et se rejoignent au centre
  const xLeft = useTransform(scrollYProgress, [0.05, 0.6], ["-34%", "0%"]);
  const xRight = useTransform(scrollYProgress, [0.05, 0.6], ["34%", "0%"]);
  const scale = useTransform(scrollYProgress, [0.05, 0.6], [0.8, 1]);
  const gap = useTransform(scrollYProgress, [0.05, 0.6], ["3rem", "0rem"]);

  return (
    <section className="overflow-hidden bg-cream pt-24 text-night sm:pt-32">
      <div className="wrap">
        <Reveal>
          <div className="grid gap-16 sm:grid-cols-2 sm:gap-10">
            <SidePanel side={duo.left} align="left" />
            <SidePanel side={duo.right} align="right" />
          </div>
        </Reveal>
      </div>

      {/* Face à face — piloté par le scroll */}
      <motion.div
        ref={ref}
        className="mt-20 flex items-end justify-center sm:mt-24"
        style={reduce ? undefined : { gap }}
      >
        <motion.div
          className="relative aspect-[3/4] w-1/2 max-w-xl overflow-hidden"
          style={reduce ? undefined : { x: xLeft, scale, transformOrigin: "bottom right" }}
        >
          <Link href={duo.left.href} aria-label={duo.left.title} className="absolute inset-0 z-10" />
          <FaceImage src={duo.left.image || undefined} alt={duo.left.title} />
        </motion.div>
        <motion.div
          className="relative aspect-[3/4] w-1/2 max-w-xl overflow-hidden"
          style={reduce ? undefined : { x: xRight, scale, transformOrigin: "bottom left" }}
        >
          <Link href={duo.right.href} aria-label={duo.right.title} className="absolute inset-0 z-10" />
          <FaceImage src={duo.right.image || undefined} alt={duo.right.title} flip />
        </motion.div>
      </motion.div>
    </section>
  );
}
