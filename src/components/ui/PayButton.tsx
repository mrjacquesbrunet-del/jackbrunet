import type { ReactNode } from "react";

/**
 * Bouton de paiement : rend un lien Stripe si `href` est défini, sinon un
 * bouton désactivé (lien pas encore configuré). Style passé via `className`.
 */
export function PayButton({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <button type="button" className={className} disabled aria-disabled="true">
        {children}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
