"use client";

import { Capacitor } from "@capacitor/core";
import { getSupabase } from "./supabase";

/**
 * « Bâtisseurs » : partenaires mensuels par ABONNEMENT Apple / Google
 * (renouvellement automatique, résiliable à tout moment par la personne).
 * Apple et Google imposent leurs achats intégrés pour tout paiement fait
 * DANS l'app ; le don via le site reste disponible à côté.
 *
 * Identifiants à créer à l'identique :
 *  - App Store Connect : abonnements auto-renouvelables (groupe « Bâtisseurs »),
 *    durée 1 mois ;
 *  - Play Console : un abonnement par identifiant, avec un forfait de base
 *    « mensuel » (renouvellement mensuel).
 * Tant qu'ils n'existent pas côté store, les blocs restent simplement masqués.
 */
export const OFFRES_SOUTIEN = [
  { id: "batisseur_299", libelle: "Bâtisseur" },
  { id: "batisseur_999", libelle: "Bâtisseur fidèle" },
  { id: "batisseur_1999", libelle: "Grand bâtisseur" },
  { id: "batisseur_4999", libelle: "Pilier de RHEMA" },
] as const;

/** Identifiant du forfait de base des abonnements dans la Play Console. */
const FORFAIT_ANDROID = "mensuel";
const IDS = new Set<string>(OFFRES_SOUTIEN.map((o) => o.id));

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
      productType: PURCHASE_TYPE.SUBS,
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
 * Lance l'abonnement (feuille de paiement Apple / Google). Renvoie « ok »,
 * « annule » si la personne a fermé la feuille, ou lève une erreur.
 */
export async function soutenir(offre: OffreSoutien, userId?: string | null): Promise<"ok" | "annule"> {
  const { NativePurchases, PURCHASE_TYPE } = await plugin();
  let transactionId = "";
  try {
    const t = await NativePurchases.purchaseProduct({
      productIdentifier: offre.id,
      productType: PURCHASE_TYPE.SUBS,
      planIdentifier: FORFAIT_ANDROID, // Android uniquement (ignoré sur iOS)
      ...(userId && UUID_RE.test(userId) ? { appAccountToken: userId } : {}),
    });
    transactionId = t.transactionId ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel|annul|user.?cancel|1001|code.?1\b/i.test(msg)) return "annule";
    throw e;
  }
  // Trace pour l'admin ; un trigger Supabase fait de la personne une
  // Bâtisseuse / un Bâtisseur pour le mois. Sans effet si la table n'existe pas.
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

/**
 * Abonnement Bâtisseur actif sur ce téléphone ? Renvoie sa date de fin
 * connue (iOS), une échéance d'un mois (Android, qui ne la fournit pas),
 * ou null s'il n'y en a pas.
 */
export async function abonnementActif(): Promise<{ produit: string; jusquAu: string } | null> {
  if (!soutienDispo()) return null;
  try {
    const { NativePurchases, PURCHASE_TYPE } = await plugin();
    const { purchases } = await NativePurchases.getPurchases({
      productType: PURCHASE_TYPE.SUBS,
      onlyCurrentEntitlements: true,
    });
    const ios = Capacitor.getPlatform() === "ios";
    for (const p of purchases) {
      if (!IDS.has(p.productIdentifier)) continue;
      if (ios) {
        const fin = p.expirationDate ? new Date(p.expirationDate) : null;
        if ((p.isActive || (fin && fin.getTime() > Date.now())) && !p.revocationDate) {
          return { produit: p.productIdentifier, jusquAu: (fin ?? new Date(Date.now() + 31 * 864e5)).toISOString() };
        }
      } else if (String(p.purchaseState ?? "1") === "1") {
        return { produit: p.productIdentifier, jusquAu: new Date(Date.now() + 31 * 864e5).toISOString() };
      }
    }
  } catch {
    /* store indisponible */
  }
  return null;
}

/**
 * Si l'abonnement est actif, prolonge le statut Bâtisseur côté Supabase
 * (badge, invitations au Zoom). À l'ouverture de l'app et après un achat.
 */
export async function synchroniserBatisseur(userId?: string | null): Promise<boolean> {
  if (!userId) return false;
  const actif = await abonnementActif();
  if (!actif) return false;
  try {
    const { error } = await getSupabase()!.rpc("synchroniser_batisseur", { p_jusqu_au: actif.jusquAu });
    return !error;
  } catch {
    return false;
  }
}

/** Restaure les achats (obligatoire chez Apple), puis resynchronise. */
export async function restaurerAbonnement(userId?: string | null): Promise<boolean> {
  try {
    const { NativePurchases } = await plugin();
    await NativePurchases.restorePurchases();
  } catch {
    /* ignore */
  }
  return synchroniserBatisseur(userId);
}

/** Ouvre la page Apple / Google pour gérer ou résilier l'abonnement. */
export async function gererAbonnement(): Promise<void> {
  try {
    const { NativePurchases } = await plugin();
    await NativePurchases.manageSubscriptions();
  } catch {
    /* ignore */
  }
}

/** Le profil est-il Bâtisseur en ce moment (abonnement en cours) ? */
export function estBatisseurActif(p?: { batisseur_jusqu_au?: string | null } | null): boolean {
  const fin = p?.batisseur_jusqu_au;
  return !!fin && new Date(fin).getTime() > Date.now();
}

/**
 * « Don libre » : dons ponctuels par achat intégré CONSOMMABLE (on peut
 * donner autant de fois qu'on veut). Apple et Google n'acceptent que des
 * prix fixés à l'avance : un produit par montant, à créer à l'identique :
 *  - App Store Connect : achats intégrés « Consommable » ;
 *  - Play Console : produits intégrés (in-app), gérés comme consommables.
 * Le montant en euros est lu dans l'identifiant (don_libre_20 → 20 €), pour
 * que l'objectif reste juste quelle que soit la devise du téléphone.
 */
export const DONS_LIBRES = [5, 10, 20, 50, 100, 200].map((eur) => ({ id: `don_libre_${eur}`, eur }));

export type OffreDon = { id: string; eur: number; prix: string; montant: number; devise: string };

export async function chargerDonsLibres(): Promise<OffreDon[]> {
  if (!soutienDispo()) return [];
  try {
    const { NativePurchases, PURCHASE_TYPE } = await plugin();
    const { isBillingSupported } = await NativePurchases.isBillingSupported();
    if (!isBillingSupported) return [];
    const { products } = await NativePurchases.getProducts({
      productIdentifiers: DONS_LIBRES.map((d) => d.id),
      productType: PURCHASE_TYPE.INAPP,
    });
    return DONS_LIBRES.flatMap((d) => {
      const p = products.find((x) => x.identifier === d.id);
      return p ? [{ id: d.id, eur: d.eur, prix: p.priceString, montant: p.price, devise: p.currencyCode }] : [];
    });
  } catch {
    return [];
  }
}

/** Lance un don libre (feuille Apple / Google). « ok », « annule » ou erreur. */
export async function donner(offre: OffreDon, userId?: string | null): Promise<"ok" | "annule"> {
  const { NativePurchases, PURCHASE_TYPE } = await plugin();
  let transactionId = "";
  try {
    const t = await NativePurchases.purchaseProduct({
      productIdentifier: offre.id,
      productType: PURCHASE_TYPE.INAPP,
      isConsumable: true, // Android : le même montant peut être redonné
      ...(userId && UUID_RE.test(userId) ? { appAccountToken: userId } : {}),
    });
    transactionId = t.transactionId ?? "";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/cancel|annul|user.?cancel|1001|code.?1\b/i.test(msg)) return "annule";
    throw e;
  }
  // Compté dans l'objectif (voir supabase/migration-don-libre.sql).
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

export type ObjectifDon = { titre: string; objectif: number; collecte: number; dons: number; mensuel: boolean };

/** Objectif du don libre et montant déjà reçu (mois en cours si objectif mensuel). */
export async function progressionDon(): Promise<ObjectifDon | null> {
  try {
    const { data, error } = await getSupabase()!.rpc("progression_don");
    const r = (Array.isArray(data) ? data[0] : data) as
      | { titre: string; objectif: number; collecte: number; dons: number; periode: string }
      | null;
    if (error || !r || !Number(r.objectif)) return null;
    return {
      titre: r.titre,
      objectif: Number(r.objectif),
      collecte: Number(r.collecte) || 0,
      dons: Number(r.dons) || 0,
      mensuel: r.periode === "mensuel",
    };
  } catch {
    return null;
  }
}
