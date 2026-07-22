import Image from "next/image";

type Props = {
  src?: string;
  alt: string;
  ratio?: string;
  className?: string;
  variant?: "leaf" | "night" | "portrait";
  sizes?: string;
};

// Bloc média : affiche la photo si elle existe (CMS), sinon un visuel
// abstrait élégant — dégradés organiques dans la charte, jamais de
// cadre gris "image manquante".
export function Media({
  src,
  alt,
  ratio = "aspect-[4/3]",
  className = "",
  variant = "leaf",
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-3xl ${ratio} ${className}`}>
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  const backgrounds: Record<NonNullable<Props["variant"]>, string> = {
    leaf: "radial-gradient(120% 120% at 20% 10%, rgba(163,205,134,0.55) 0%, rgba(163,205,134,0.12) 45%, rgba(18,18,18,0.9) 100%), #191A17",
    night:
      "radial-gradient(120% 140% at 80% 0%, rgba(163,205,134,0.35) 0%, rgba(18,18,18,0.6) 55%, #121212 100%), #121212",
    portrait:
      "radial-gradient(140% 100% at 50% 0%, rgba(163,205,134,0.45) 0%, rgba(34,35,32,0.9) 60%, #121212 100%), #191A17",
  };

  return (
    <div
      role="img"
      aria-label={alt}
      className={`grain relative overflow-hidden rounded-3xl ${ratio} ${className}`}
      style={{ background: backgrounds[variant] }}
    >
      <div className="absolute inset-0 glow-leaf" aria-hidden />
    </div>
  );
}
