import { NextResponse } from "next/server";

/**
 * Inscription newsletter / captation email.
 *
 * Endpoint volontairement neutre: le site web ET la future application mobile
 * appelleront ce même point d'entrée. Brancher ici Mailchimp / Brevo / Resend
 * ou une base de données sans rien changer côté client.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: { email?: string; source?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = (payload.email?? "").trim().toLowerCase();
  const source = (payload.source?? "inconnu").slice(0, 64);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 422 });
  }

  // TODO: persister (DB) + intégration emailing + envoi du cadeau gratuit.
  console.info(`[newsletter] nouvelle inscription, source="${source}" email="${email}"`);

  return NextResponse.json(
    { ok: true, message: "Inscription enregistrée." },
    { status: 201 },
  );
}
