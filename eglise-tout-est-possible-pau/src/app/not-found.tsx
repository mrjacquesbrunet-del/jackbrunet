import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] items-center bg-night text-cream">
      <div className="wrap py-40 text-center">
        <p className="kicker">Erreur 404</p>
        <h1 className="display-2 mt-5 text-balance">
          Cette page n&apos;existe pas.
          <span className="block text-leaf">Mais tout reste possible.</span>
        </h1>
        <Link href="/" className="btn-primary mt-10">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
