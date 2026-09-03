import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 31 — La naissance de Jésus (Luc 1-2, Matthieu 1-2). 8 étapes. */
export const CHAPITRE_NAISSANCE: CheminChapitre = {
  id: 31,
  nom: "La naissance de Jésus",
  livre: "Luc 1-2",
  accent: "#FDE047",
  decor: "/img/chemin/decor-31.jpg",
  sentier: [{ x: 49.6, y: 94 }, { x: 64.5, y: 84.3 }, { x: 66.9, y: 74.6 }, { x: 45.1, y: 64.9 }, { x: 52.7, y: 55 }, { x: 45.3, y: 45.3 }, { x: 56.8, y: 35.6 }, { x: 53.8, y: 26 }],
  fallback: ["#3d3308", "#584b0f", "#1a1603"],
  carte: {
    id: "marie-mere",
    nom: "Marie",
    titre: "Qu'il me soit fait selon ta parole",
    rarete: "legendaire",
    image: "/img/chemin/cartes/marie-mere.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait un sacrificateur nommé Zacharie et sa femme Élisabeth ; ils étaient tous deux justes devant Dieu, mais ils n'avaient point d'enfants et étaient avancés en âge. Pendant qu'il offrait le parfum dans le temple, l'ange Gabriel lui apparut : « Ta prière a été exaucée. Élisabeth t'enfantera un fils, et tu lui donneras le nom de Jean. »",
      ref: "Luc 1:5-17",
      exercices: [
        { type: "qcm", q: "Quel enfant est annoncé à Zacharie ?", choix: ["Jean, celui qui préparera le chemin", "Jésus", "Siméon", "Jacques"], bonne: 0 },
        { type: "qcm", q: "Où l'ange lui apparaît-il ?", choix: ["Dans le temple, pendant l'offrande du parfum", "Dans sa maison", "Au bord du Jourdain", "Sur une montagne"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment s'appelle l'ange ?", choix: ["Gabriel", "Michel", "Raphaël", "Uriel"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Au sixième mois, l'ange Gabriel fut envoyé à Nazareth, auprès d'une vierge fiancée à un homme de la maison de David, nommé Joseph ; le nom de la vierge était Marie. « Je te salue, toi à qui une grâce a été faite ; le Seigneur est avec toi. Tu enfanteras un fils, et tu lui donneras le nom de Jésus. Il sera grand, et sera appelé Fils du Très-Haut. »",
      ref: "Luc 1:26-33",
      exercices: [
        { type: "qcm", q: "Dans quelle ville Marie reçoit-elle l'annonce ?", choix: ["Nazareth", "Bethléhem", "Jérusalem", "Capernaüm"], bonne: 0 },
        { type: "qcm", q: "Quel nom l'ange donne-t-il à l'enfant ?", choix: ["Jésus", "Emmanuel", "Jean", "Josué"], bonne: 0 },
        { type: "qcm", q: "De quelle maison est Joseph ?", choix: ["La maison de David", "La maison de Lévi", "La maison d'Aaron", "La maison de Benjamin"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Marie dit à l'ange : « Comment cela se fera-t-il, puisque je ne connais point d'homme ? » L'ange répondit : « Le Saint-Esprit viendra sur toi, et la puissance du Très-Haut te couvrira de son ombre. Rien n'est impossible à Dieu. » Marie dit : « Je suis la servante du Seigneur ; qu'il me soit fait selon ta parole ! »",
      ref: "Luc 1:34-38",
      exercices: [
        { type: "verset", ref: "Luc 1:38", texte: "Je suis la servante du Seigneur qu'il me soit fait selon ta parole" },
        { type: "qui", indices: ["Un ange me visite à Nazareth.", "Je demande comment cela se fera.", "Je réponds : « qu'il me soit fait selon ta parole ».", "Je dépose mon fils dans une crèche."], reponse: "Marie", leurres: ["Élisabeth", "Anne", "Marthe"] },
        { type: "trou", texte: "« Rien n'est ___ à Dieu. »", reponse: "impossible", leurres: ["caché", "difficile", "égal"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Marie alla chez Élisabeth. Dès qu'Élisabeth entendit sa salutation, l'enfant tressaillit dans son sein, et elle s'écria : « Tu es bénie entre les femmes ! » Alors Marie chanta : « Mon âme exalte le Seigneur, et mon esprit se réjouit en Dieu mon Sauveur. Il a renversé les puissants de leurs trônes et il a élevé les humbles. »",
      ref: "Luc 1:39-55",
      exercices: [
        { type: "qcm", q: "Que fait l'enfant d'Élisabeth quand Marie salue ?", choix: ["Il tressaille dans son sein", "Il naît aussitôt", "Il crie", "Rien de particulier"], bonne: 0 },
        { type: "qcm", q: "Que chante Marie ?", choix: ["« Mon âme exalte le Seigneur »", "« Saint, saint, saint »", "« Gloire à Dieu au plus haut des cieux »", "« Le salut vient de l'Éternel »"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Que dit son cantique des puissants et des humbles ?", choix: ["Il renverse les puissants et élève les humbles", "Il bénit les rois", "Il ignore les pauvres", "Il élève les savants"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "César Auguste ordonna un recensement de toute la terre. Joseph monta de Nazareth à Bethléhem, la ville de David, avec Marie sa fiancée, qui était enceinte. Pendant qu'ils étaient là, le temps où elle devait accoucher s'accomplit. Elle enfanta son fils premier-né, l'emmaillota et le coucha dans une crèche, parce qu'il n'y avait pas de place pour eux dans l'hôtellerie.",
      ref: "Luc 2:1-7",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Pourquoi Joseph et Marie vont-ils à Bethléhem ?", choix: ["Pour un recensement ordonné par César Auguste", "Pour fuir Hérode", "Pour une fête", "Pour un mariage"], bonne: 0 },
        { type: "qcm", q: "Où l'enfant est-il couché ?", choix: ["Dans une crèche, faute de place à l'hôtellerie", "Dans un berceau du palais", "Chez Élisabeth", "Dans le temple"], bonne: 0 },
        { type: "vf", q: "Michée avait annoncé des siècles plus tôt que le Messie naîtrait à Bethléhem.", vrai: true, ref: "Michée 5:2", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il y avait dans la même contrée des bergers qui passaient dans les champs les veilles de la nuit. Un ange leur apparut : « Ne craignez point, car je vous annonce une bonne nouvelle, qui sera pour tout le peuple : aujourd'hui, dans la ville de David, il vous est né un Sauveur, qui est le Christ, le Seigneur. » Et soudain une multitude de l'armée céleste louait Dieu.",
      ref: "Luc 2:8-14",
      exercices: [
        { type: "qcm", q: "À qui l'ange annonce-t-il d'abord la naissance ?", choix: ["À des bergers dans les champs", "Aux prêtres du temple", "Au roi Hérode", "Aux sages d'Orient"], bonne: 0 },
        { type: "verset", ref: "Luc 2:11", texte: "Il vous est né un Sauveur qui est le Christ le Seigneur", niveau: "moyen" },
        { type: "qcm", q: "Quel signe leur est donné ?", choix: ["Un enfant emmailloté et couché dans une crèche", "Une étoile", "Un feu dans le ciel", "Une colombe"], bonne: 0, ref: "Luc 2:12", niveau: "moyen" },
      ],
    },
    {
      recit:
        "Des mages venus d'Orient arrivèrent à Jérusalem : « Où est le roi des Juifs qui vient de naître ? Nous avons vu son étoile en Orient, et nous sommes venus pour l'adorer. » Hérode fut troublé. Les scribes répondirent : à Bethléhem, selon le prophète. Les mages entrèrent dans la maison, se prosternèrent et offrirent de l'or, de l'encens et de la myrrhe.",
      ref: "Matthieu 2:1-12",
      exercices: [
        { type: "qcm", q: "Quels présents les mages offrent-ils ?", choix: ["De l'or, de l'encens et de la myrrhe", "Du pain, du vin et de l'huile", "Des vêtements et des bijoux", "Des brebis"], bonne: 0 },
        { type: "qcm", q: "Comment les scribes savent-ils où naîtrait le Messie ?", choix: ["Par la prophétie de Michée", "Par une vision", "Par les mages eux-mêmes", "Par un songe d'Hérode"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La Bible précise que les mages étaient trois.", vrai: false, niveau: "expert" },
      ],
    },
    {
      recit:
        "Au temple, un homme juste nommé Siméon attendait la consolation d'Israël : il lui avait été révélé qu'il ne mourrait pas avant d'avoir vu le Christ. Il prit l'enfant dans ses bras et bénit Dieu : « Maintenant, Seigneur, tu laisses ton serviteur s'en aller en paix, car mes yeux ont vu ton salut, lumière pour éclairer les nations et gloire de ton peuple d'Israël. »",
      ref: "Luc 2:25-38",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Qu'avait-il été révélé à Siméon ?", choix: ["Qu'il ne mourrait pas avant d'avoir vu le Christ", "Qu'il serait prêtre", "Qu'il vivrait cent ans", "Qu'il verrait le temple rebâti"], bonne: 0 },
        { type: "qcm", q: "Qui d'autre reconnaît l'enfant au temple ?", choix: ["La prophétesse Anne", "Zacharie", "Nicodème", "Gamaliel"], bonne: 0, niveau: "expert" },
        { type: "ordre", consigne: "Remets la naissance dans l'ordre :", items: ["Gabriel annonce Jean à Zacharie", "Gabriel annonce Jésus à Marie", "La crèche et les bergers", "Les mages et Siméon au temple"] },
      ],
    },
  ],
};
