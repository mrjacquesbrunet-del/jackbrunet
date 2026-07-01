import { NextResponse } from "next/server";

/**
 * Dépôt d'une requête de prière + récupération des coordonnées (base contacts).
 * Réutilisable par la future application mobile.
 */

export async function POST(request: Request) {
  let payload: { name?: string; email?: string; phone?: string; request?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = (payload.name?? "Anonyme").trim().slice(0, 80);
  const email = (payload.email?? "").trim().toLowerCase().slice(0, 160);
  const phone = (payload.phone?? "").trim().slice(0, 40);
  const text = (payload.request?? "").trim();

  if (text.length < 3) {
    return NextResponse.json(
      { error: "Merci d'écrire ta requête de prière." },
      { status: 422 },
    );
  }

  // TODO: persister (base contacts) + notification à l'équipe de prière + réponse.
  console.info(
    `[priere] de="${name}" email="${email}" tel="${phone}" longueur=${text.length}`,
  );

  return NextResponse.json(
    { ok: true, message: "Ta requête a été reçue. Nous prions pour toi." },
    { status: 201 },
  );
}
