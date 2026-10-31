import type { Notification } from "./community";

/** Libellé d'une notification seule. */
export function libelleNotif(n: Notification): string {
  const who = n.actor?.pseudo ?? "Quelqu'un";
  switch (n.type) {
    case "pray":
      return `${who} prie pour ton sujet`;
    case "pray_digest":
      return `${n.body ?? "Plusieurs"} personnes ont prié pour toi aujourd'hui`;
    case "follow_up":
      return "Comment évolue ton sujet ? Viens donner des nouvelles";
    case "heart":
      return `${who} a aimé ton sujet`;
    case "comment":
      return `${who} t'a encouragé(e)`;
    case "follow":
      return `${who} s'est abonné(e) à toi`;
    case "mention":
      return `${who} t'a mentionné(e)`;
    case "message":
      return `${who} t'a envoyé un message`;
    case "reply":
      return `${who} a répondu à ton commentaire`;
    case "group_comment":
      return `${who} a commenté ta publication`;
    case "group_reaction":
      return `${who} a réagi à ta publication`;
    case "comment_reaction":
      return `${who} a réagi ${n.body ?? ""} à ton commentaire`;
    case "group_post":
      return `${who} a publié dans ${n.body ? `« ${n.body} »` : "ton groupe"}`;
    case "group_message":
      return `${who} a écrit dans ${n.body ? `« ${n.body} »` : "ton groupe"}`;
    case "group_join":
      return `${who} a rejoint ${n.body ? `« ${n.body} »` : "ton groupe"}`;
    case "podcast":
      return n.body ?? "Nouvel épisode de podcast";
    case "admin":
      return n.body ? `${n.body}` : "Message de Pasteur Jack";
    case "challenge":
      return n.body ?? `${who} te défie en direct !`;
    case "friend_score":
      return n.body ?? `${who} a joué au Défi du jour !`;
    case "duo_invite":
    case "duo_accept":
    case "duo_read":
    case "duo_note":
      return `${who} ${n.body ?? "— plan à deux"}`;
    default:
      return n.body ?? "Nouvelle notification";
  }
}

/** Fin de phrase au pluriel (« Marie et 3 autres … »), par type regroupable. */
const PLURIEL: Partial<Record<string, (n: Notification) => string>> = {
  pray: () => "prient pour ton sujet",
  heart: () => "ont aimé ton sujet",
  comment: () => "t'ont encouragé(e)",
  follow: () => "se sont abonnés à toi",
  reply: () => "ont répondu à ton commentaire",
  group_comment: () => "ont commenté ta publication",
  group_reaction: () => "ont réagi à ta publication",
  comment_reaction: () => "ont réagi à ton commentaire",
  group_message: (n) => `ont écrit dans ${n.body ? `« ${n.body} »` : "ton groupe"}`,
  group_join: (n) => `ont rejoint ${n.body ? `« ${n.body} »` : "ton groupe"}`,
};

/** Une ligne de la liste : une notification, ou plusieurs regroupées. */
export type NotifGroupee = {
  /** La plus récente du groupe (lien, date, avatar principal). */
  tete: Notification;
  /** Personnes distinctes (la plus récente d'abord). */
  acteurs: NonNullable<Notification["actor"]>[];
  nombre: number;
  lu: boolean;
};

/** Fenêtre de regroupement : comme Instagram, sur la même journée environ. */
const FENETRE_MS = 24 * 3600_000;

/**
 * Regroupe les notifications du même genre sur le même contenu (« Marie et
 * 4 autres prient pour ton sujet »), et les messages d'une même personne
 * (« Paul t'a envoyé 3 messages »). La liste reste triée du plus récent.
 */
export function grouperNotifications(liste: Notification[]): NotifGroupee[] {
  const sortie: NotifGroupee[] = [];
  const index = new Map<string, NotifGroupee>();
  for (const n of liste) {
    let cle: string | null = null;
    if (n.type === "message" && n.actor_id) cle = `message:${n.actor_id}`;
    else if (PLURIEL[n.type]) cle = `${n.type}:${n.prayer_id ?? ""}:${n.link ?? ""}:${n.type === "group_join" || n.type === "group_message" ? n.body ?? "" : ""}`;
    const g = cle ? index.get(cle) : undefined;
    if (g && new Date(g.tete.created_at).getTime() - new Date(n.created_at).getTime() < FENETRE_MS) {
      g.nombre += 1;
      if (!n.read) g.lu = false;
      if (n.actor && !g.acteurs.some((a) => a.id === n.actor!.id)) g.acteurs.push(n.actor);
      continue;
    }
    const nouveau: NotifGroupee = { tete: n, acteurs: n.actor ? [n.actor] : [], nombre: 1, lu: n.read };
    sortie.push(nouveau);
    if (cle) index.set(cle, nouveau);
  }
  return sortie;
}

/** Libellé d'une ligne (seule ou regroupée). */
export function libelleGroupe(g: NotifGroupee): string {
  const n = g.tete;
  if (g.nombre === 1) return libelleNotif(n);
  if (n.type === "message") return `${n.actor?.pseudo ?? "Quelqu'un"} t'a envoyé ${g.nombre} messages`;
  const autres = g.acteurs.length - 1;
  const fin = PLURIEL[n.type];
  // Même personne plusieurs fois (ex. 3 réactions) : libellé simple.
  if (autres < 1 || !fin) return libelleNotif(n);
  const premier = g.acteurs[0]?.pseudo ?? "Quelqu'un";
  if (autres === 1) return `${premier} et ${g.acteurs[1]?.pseudo ?? "1 autre personne"} ${fin(n)}`;
  return `${premier} et ${autres} autres personnes ${fin(n)}`;
}
