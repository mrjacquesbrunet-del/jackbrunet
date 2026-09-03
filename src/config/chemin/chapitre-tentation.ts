import type { CheminChapitre } from "@/lib/chemin";

/**
 * Chapitre 33 — La tentation au désert et le début du ministère
 * (Matthieu 4, Luc 4). 8 étapes.
 */
export const CHAPITRE_TENTATION: CheminChapitre = {
  id: 33,
  nom: "La tentation",
  livre: "Matthieu 4, Luc 4",
  accent: "#F59E0B",
  decor: "/img/chemin/decor-33.jpg",
  sentier: [{ x: 55.1, y: 94 }, { x: 52.9, y: 84.3 }, { x: 54.3, y: 74.6 }, { x: 46.9, y: 64.9 }, { x: 58.9, y: 55 }, { x: 39.9, y: 45.3 }, { x: 58, y: 35.6 }, { x: 55.9, y: 26 }],
  fallback: ["#4a3306", "#6b4a0c", "#221703"],
  carte: {
    id: "jesus",
    nom: "Jésus",
    titre: "L'homme de la Parole",
    rarete: "legendaire",
    image: "/img/chemin/cartes/jesus.jpg",
  },
  etapes: [
    {
      recit:
        "Alors Jésus fut emmené par l'Esprit dans le désert, pour être tenté par le diable. Après avoir jeûné quarante jours et quarante nuits, il eut faim. Le tentateur s'approcha et lui dit : « Si tu es Fils de Dieu, ordonne que ces pierres deviennent des pains. »",
      ref: "Matthieu 4:1-3",
      exercices: [
        { type: "qcm", q: "Combien de temps Jésus jeûne-t-il au désert ?", choix: ["Quarante jours et quarante nuits", "Sept jours", "Trois jours", "Un mois entier"], bonne: 0 },
        { type: "qcm", q: "Qui emmène Jésus au désert ?", choix: ["L'Esprit", "Jean-Baptiste", "Ses disciples", "Personne, il y va seul"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quelle est la première proposition du tentateur ?", choix: ["Changer les pierres en pains", "Se jeter du haut du temple", "Recevoir tous les royaumes", "Retourner en Galilée"], bonne: 0 },
      ],
    },
    {
      recit:
        "Jésus répondit : « Il est écrit : L'homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu. »",
      ref: "Matthieu 4:4",
      exercices: [
        { type: "verset", ref: "Matthieu 4:4", texte: "L'homme ne vivra pas de pain seulement mais de toute parole qui sort de la bouche de Dieu" },
        { type: "qcm", q: "Comment Jésus répond-il à chaque tentation ?", choix: ["Par un « Il est écrit » de l'Écriture", "Par un miracle", "Par le silence", "En appelant des anges"], bonne: 0 },
        { type: "vf", q: "Cette réponse cite le Deutéronome.", vrai: true, ref: "Deutéronome 8:3", niveau: "expert" },
      ],
    },
    {
      recit:
        "Le diable le transporta dans la ville sainte, le plaça sur le haut du temple et lui dit : « Si tu es Fils de Dieu, jette-toi en bas, car il est écrit : Il donnera des ordres à ses anges à ton sujet. » Jésus lui dit : « Il est aussi écrit : Tu ne tenteras point le Seigneur, ton Dieu. »",
      ref: "Matthieu 4:5-7",
      exercices: [
        { type: "qcm", q: "Qu'y a-t-il de particulier dans cette deuxième tentation ?", choix: ["Le tentateur cite lui-même l'Écriture", "Elle a lieu la nuit", "Elle est muette", "Elle vient d'un homme"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que répond Jésus ?", choix: ["« Tu ne tenteras point le Seigneur, ton Dieu »", "« Va-t'en, Satan »", "« Il est écrit : tu adoreras Dieu »", "Rien"], bonne: 0 },
        { type: "qcm", q: "Où se passe cette scène ?", choix: ["Sur le haut du temple, à Jérusalem", "Au sommet du Sinaï", "Au bord du lac", "Au désert de Judée"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Le diable le transporta sur une montagne très élevée, lui montra tous les royaumes du monde et leur gloire, et lui dit : « Je te donnerai toutes ces choses, si tu te prosternes et m'adores. » Jésus lui dit : « Retire-toi, Satan ! Car il est écrit : Tu adoreras le Seigneur, ton Dieu, et tu le serviras lui seul. » Alors le diable le laissa, et des anges vinrent le servir.",
      ref: "Matthieu 4:8-11",
      coffre: true,
      exercices: [
        { type: "ordre", consigne: "Remets les trois tentations dans l'ordre :", items: ["Les pierres changées en pains", "Se jeter du haut du temple", "Tous les royaumes du monde", "Le diable s'éloigne et les anges viennent servir"] },
        { type: "qcm", q: "Que demande le tentateur en échange des royaumes ?", choix: ["Que Jésus se prosterne devant lui", "Un signe", "Un serment écrit", "Trente sicles"], bonne: 0 },
        { type: "verset", ref: "Matthieu 4:10", texte: "Tu adoreras le Seigneur ton Dieu et tu le serviras lui seul", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Ayant appris que Jean avait été livré, Jésus se retira dans la Galilée et vint demeurer à Capernaüm, au bord de la mer. Depuis ce moment il commença à prêcher : « Repentez-vous, car le royaume des cieux est proche. »",
      ref: "Matthieu 4:12-17",
      exercices: [
        { type: "qcm", q: "Où Jésus s'établit-il pour commencer son ministère ?", choix: ["À Capernaüm, au bord du lac", "À Jérusalem", "À Nazareth", "À Béthanie"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quel est son premier message ?", choix: ["« Repentez-vous, car le royaume des cieux est proche »", "« Aimez vos ennemis »", "« Suivez-moi »", "« Le temple sera détruit »"], bonne: 0 },
        { type: "vf", q: "Jésus commence à prêcher après l'arrestation de Jean-Baptiste.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus vint à Nazareth, où il avait été élevé, et entra dans la synagogue le jour du sabbat. On lui remit le livre d'Ésaïe. Il lut : « L'Esprit du Seigneur est sur moi, parce qu'il m'a oint pour annoncer une bonne nouvelle aux pauvres. » Puis il roula le livre et dit : « Aujourd'hui cette parole de l'Écriture, que vous venez d'entendre, est accomplie. »",
      ref: "Luc 4:16-21",
      exercices: [
        { type: "qcm", q: "Quel livre Jésus lit-il à la synagogue de Nazareth ?", choix: ["Le livre d'Ésaïe", "La Genèse", "Les Psaumes", "Le Deutéronome"], bonne: 0 },
        { type: "trou", texte: "« ___ cette parole de l'Écriture est accomplie. »", reponse: "Aujourd'hui", leurres: ["Demain", "Bientôt", "Jadis"], niveau: "moyen" },
        { type: "qcm", q: "À qui la bonne nouvelle est-elle d'abord annoncée dans ce texte ?", choix: ["Aux pauvres", "Aux prêtres", "Aux rois", "Aux savants"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "D'abord ils s'étonnaient de ses paroles de grâce. Puis ils disaient : « N'est-ce pas le fils de Joseph ? » Jésus leur dit : « Aucun prophète n'est bien reçu dans sa patrie. » Ils se levèrent, le chassèrent de la ville et le menèrent au sommet de la montagne pour le précipiter en bas ; mais il passa au milieu d'eux et s'en alla.",
      ref: "Luc 4:22-30",
      exercices: [
        { type: "qcm", q: "Comment Nazareth réagit-elle finalement ?", choix: ["Elle veut le précipiter du haut de la montagne", "Elle le suit en foule", "Elle l'ignore", "Elle le fait roi"], bonne: 0 },
        { type: "qcm", q: "Quelle parole Jésus prononce-t-il là ?", choix: ["« Aucun prophète n'est bien reçu dans sa patrie »", "« Suivez-moi »", "« Heureux les pauvres »", "« Tout est accompli »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus a d'abord été acclamé à Nazareth avant d'être rejeté.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Jésus parcourait toute la Galilée, enseignant dans les synagogues, prêchant la bonne nouvelle du royaume et guérissant toute maladie parmi le peuple. Sa renommée se répandit dans toute la Syrie : on lui amenait tous ceux qui souffraient, et il les guérissait. De grandes foules le suivirent.",
      ref: "Matthieu 4:23-25",
      coffre: true,
      exercices: [
        { type: "qui", indices: ["Je jeûne quarante jours au désert.", "Je réponds trois fois : « Il est écrit ».", "Je lis Ésaïe dans la synagogue de mon village.", "Je dis : « Aujourd'hui cette parole est accomplie »."], reponse: "Jésus", leurres: ["Jean-Baptiste", "Élie", "Pierre"] },
        { type: "qcm", q: "Que fait Jésus en parcourant la Galilée ?", choix: ["Il enseigne, prêche le royaume et guérit", "Il lève une armée", "Il bâtit une synagogue", "Il reste caché"], bonne: 0 },
        { type: "vf", q: "Les foules viennent de bien au-delà de la Galilée.", vrai: true, niveau: "moyen" },
      ],
    },
  ],
};
