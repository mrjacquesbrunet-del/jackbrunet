"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; z: number; vy: number; vz: number };

const COUNT = 90;
const DEPTH = 900; // profondeur de champ (z)
const FOCAL = 520; // distance focale de projection

// Champ de particules 3D — poussières lumineuses projetées en
// perspective, avec parallaxe caméra suivant la souris. Canvas natif,
// aucun runtime WebGL : léger et compatible avec la vidéo du hero.
export function Particles3D({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let running = true;

    // Caméra : légère dérive vers la position de la souris (parallaxe).
    let camX = 0;
    let camY = 0;
    let targetX = 0;
    let targetY = 0;

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particles: Particle[] = Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * width * 1.4,
      y: (Math.random() - 0.5) * height * 1.4,
      z: Math.random() * DEPTH,
      vy: -(6 + Math.random() * 14),
      vz: (Math.random() - 0.5) * 10,
    }));

    const onMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 60;
      targetY = (e.clientY / window.innerHeight - 0.5) * 40;
    };

    let last = performance.now();
    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      camX += (targetX - camX) * 0.04;
      camY += (targetY - camY) * 0.04;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.y += p.vy * dt;
        p.z += p.vz * dt;

        // Recyclage : une particule sortie réapparaît en bas.
        if (p.y < -height * 0.8) {
          p.y = height * 0.8;
          p.x = (Math.random() - 0.5) * width * 1.4;
          p.z = Math.random() * DEPTH;
        }
        if (p.z < 0) p.z = DEPTH;
        if (p.z > DEPTH) p.z = 0;

        // Projection perspective + parallaxe caméra (les proches bougent plus).
        const scale = FOCAL / (FOCAL + p.z);
        const sx = width / 2 + (p.x - camX * (1.6 - scale)) * scale;
        const sy = height / 2 + (p.y - camY * (1.6 - scale)) * scale;
        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

        const radius = 2.4 * scale;
        const alpha = 0.14 + 0.5 * scale * scale;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        // Les particules proches tirent vers le vert lumineux de la charte.
        ctx.fillStyle =
          scale > 0.72
            ? `rgba(48, 255, 18, ${alpha * 0.8})`
            : `rgba(252, 254, 233, ${alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={`pointer-events-none ${className}`} aria-hidden />;
}
