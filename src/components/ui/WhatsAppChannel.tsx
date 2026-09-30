const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029VbBxxbY1SWt72z0avP1F";

/**
 * Carte « Rejoins ma chaîne WhatsApp » — la carte seule (WhatsAppCard) se
 * glisse dans n'importe quelle page (accueil, profil…) ; WhatsAppChannel
 * garde le wrapper pleine page des emplacements historiques.
 */
export function WhatsAppCard() {
  return (
    <a
      href={WHATSAPP_CHANNEL}
      target="_blank"
      rel="noopener noreferrer"
      className="keep-dark dark-ctx group relative block overflow-hidden rounded-3xl border border-[#25D366]/25 bg-night-900 p-5 text-cream shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
    >
      {/* Halos verts */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[#25D366]/25 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-[#25D366]/10 blur-3xl"
      />

      <div className="relative flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_0_24px_rgba(37,211,102,0.45)]">
          <WhatsAppIcon className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#25D366]">
            Chaîne WhatsApp
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold leading-tight">
            Reste connecté, chaque jour
          </p>
          <p className="mt-1 text-sm leading-relaxed text-cream/70">
            Paroles, encouragements et actus de Jack, directement sur WhatsApp.
          </p>
        </div>
      </div>

      <span className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3 font-display text-sm font-extrabold text-white transition-colors group-hover:bg-[#2ee275]">
        Rejoindre la chaîne
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

/** Emplacement pleine page (bas des pages du site). */
export function WhatsAppChannel() {
  return (
    <div className="container-x py-8">
      <div className="mx-auto max-w-2xl">
        <WhatsAppCard />
      </div>
    </div>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0.104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.582 0 11.94-5.359 11.943-11.893a11.821 11.821 0 00-3.416-8.452z" />
    </svg>
  );
}
