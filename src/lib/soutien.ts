"use client";

import { Capacitor } from "@capacitor/core";
import { getSupabase } from "./supabase";

/**
 * « Soutien en un clic » : achats intégrés Apple / Google (consommables).
 * Apple et Google imposent leurs achats intégrés pour tout paiement fait
 * DANS l'app ; le don via le site reste disponible à côté.
 *
 * Les identifiants doivent être créés à l'identique dans App Store Connect
 * (type « Consommable ») et dans la Play Console (« Produit intégré »).
 * Tant qu'ils n'existent pas côté store, le bloc reste simplement masqué.
 */
export const OFFRES_SOUTIEN = [
  { id: "soutien_499", libelle: "Un coup de pouce" },
  { id: "soutien_999", libelle: "Un beau soutien" },
  { id: "soutien_1999", libelle: "Un grand soutien" },
  { id: "soutien_4999", libelle: "Un pilier de RHEMA" },
] as const;

export type OffreSoutien = { id: string; libelle: string; prix: string; montant: number; devise: string };

/** Le binaire installé contient-il le module d'achats intégrés ? */
export function soutienDispo(): boolean {
  try {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable("NativePurchases");
  } catch {
    return false;
  }
}

async function plugin() {
  return import("@capgo/native-purchases");
}

/** Prix réels (dans la devise de l'utilisateur) tels que fournis par le store. */
export async function chargerOffresSoutien(): Promise<OffreSoutien[]> {
  if (!soutienDispo()) return [];
  try {
    const { NativePurchases, PURCHASE_TYPE } = await plugin();
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return [];
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: OFFRES_SOUTIEN.map((o) => o.id),
      productType: PURCHASE_TYPE.INAPP,
    });
    return OFFRES_SOUTIEN.flatMap((o) => {
      const p = products.find((x) => x.identifier === o.id);
      return p ? [{ id: o.id, libelle: o.libelle, prix: p.priceString, montant: p.price, devise: p.currencyCode }] : [];
    });
  } catch {
    return [];
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Lance l'achat (feuille de paiement Apple / Google). Renvoie « ok »,
 * « annule » si la personne a fermé la feuille, ou lève une erreur.
 */
export async function soutenir(offre: OffreSoutien, userId?: string | null): Promise<"ok" | "annule"> {
  const { NativePurchases, PURCHASE_TYPE } = await plugin();
  let transactionId = "";
  try {
    const t = await NativePurchases.purchaseProduct({
      productIdentifier: offre.id,
      productType: PURCHASE_TYPE.INAPP,
      isConsumable: true, // Android : peut être racheté autant de fois que voulu
      ...(userId && UUID_RE.test(userId) ? { appAccountToken: userId } : {}),
    });
    transactionId = t.transactionId ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel|annul|user.?cancel|1001|code.?1\b/i.test(msg)) return "annule";
    throw e;
  }
  // Trace (facultative) pour l'admin : qui soutient, combien. Sans effet si la
  // table n'existe pas encore.
  try {
    await getSupabase()
      ?.from("soutiens")
      .insert({
        user_id: userId ?? null,
        produit: offre.id,
        montant: offre.montant,
        devise: offre.devise,
        plateforme: Capacitor.getPlatform(),
        transaction_id: transactionId || null,
      });
  } catch {
    /* best-effort */
  }
  return "ok";
}
