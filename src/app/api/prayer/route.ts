import { NextResponse } from "next/server";

/**
 * Dépôt d'une requête de prière.
 *
 * Réutilisable par la future application mobile (espace prière + notifications).
 */

export async function POST(request: Request) {
  let payload: { name?: string; request?: string; isPrivate?: boolean };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const name = (payload.name ?? "Anonyme").trim().slice(0, 80);
  const text = (payload.request ?? "").trim();
  const isPrivate = Boolean(payload.isPrivate);

  if (text.length < 3) {
    return NextResponse.json(
      { error: "Merci d'écrire ta requête de prière." },
      { status: 422 },
    );
  }

  // TODO: persister + modération + notification à l'équipe de prière.
  console.info(
    `[priere] requête reçue — de="${name}" privée=${isPrivate} longueur=${text.length}`,
  );

  return NextResponse.json(
    { ok: true, message: "Ta requête a été reçue. Nous prions pour toi." },
    { status: 201 },
  );
}
