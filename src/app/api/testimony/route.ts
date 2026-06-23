import { NextResponse } from "next/server";

/**
 * Réception d'un témoignage + coordonnées (base contacts).
 * Réutilisable par la future application mobile.
 */

export async function POST(request: Request) {
  let payload: {
    name?: string;
    email?: string;
    phone?: string;
    testimony?: string;
    consent?: boolean;
  };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = (payload.name ?? "Anonyme").trim().slice(0, 80);
  const email = (payload.email ?? "").trim().toLowerCase().slice(0, 160);
  const phone = (payload.phone ?? "").trim().slice(0, 40);
  const text = (payload.testimony ?? "").trim();
  const consent = Boolean(payload.consent);

  if (text.length < 3) {
    return NextResponse.json(
      { error: "Merci d'écrire ton témoignage." },
      { status: 422 },
    );
  }

  // TODO: persister (base contacts) + modération + réponse.
  console.info(
    `[temoignage] de="${name}" email="${email}" tel="${phone}" partage=${consent} longueur=${text.length}`,
  );

  return NextResponse.json(
    { ok: true, message: "Témoignage reçu. Merci !" },
    { status: 201 },
  );
}
