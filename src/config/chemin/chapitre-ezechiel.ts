import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 25 — Ézéchiel (Ézéchiel 2, 3, 34, 36, 37, 47). 8 étapes. */
export const CHAPITRE_EZECHIEL: CheminChapitre = {
  id: 25,
  nom: "Ézéchiel",
  livre: "Ézéchiel 2-47",
  accent: "#E879F9",
  decor: "/img/chemin/decor-25.jpg",
  sentier: [{ x: 47.3, y: 94 }, { x: 48.1, y: 84.3 }, { x: 56.7, y: 74.6 }, { x: 53.1, y: 64.9 }, { x: 49, y: 55 }, { x: 59.9, y: 45.3 }, { x: 48.4, y: 35.6 }, { x: 44.1, y: 26 }],
  fallback: ["#43104a", "#5f186b", "#1c0722"],
  carte: {
    id: "ezechiel",
    nom: "Ézéchiel",
    titre: "Le prophète des ossements",
    rarete: "legendaire",
    image: "/img/chemin/cartes/ezechiel.jpg",
  },
  etapes: [
    {
      recit:
        "Ézéchiel était parmi les exilés, près du fleuve du Kebar, quand les cieux s'ouvrirent et qu'il eut des visions divines. Une voix lui dit : « Fils de l'homme, tiens-toi sur tes pieds, et je te parlerai. Je t'envoie vers les enfants d'Israël, vers ces nations rebelles. Tu leur diras : Ainsi parle le Seigneur, l'Éternel. »",
      ref: "Ézéchiel 2:1-5",
      exercices: [
        { type: "qcm", q: "Où se trouve Ézéchiel quand Dieu l'appelle ?", choix: ["En exil, près du fleuve du Kebar", "Dans le temple de Jérusalem", "Au désert du Sinaï", "À Ninive"], bonne: 0 },
        { type: "qcm", q: "Comment Dieu l'appelle-t-il tout au long du livre ?", choix: ["« Fils de l'homme »", "« Mon serviteur »", "« Prophète des nations »", "« Bien-aimé »"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Ézéchiel prophétise depuis Jérusalem, avant l'exil.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Une main était étendue vers moi, tenant un livre en rouleau. « Fils de l'homme, mange ce que tu trouves, mange ce rouleau, et va parler à la maison d'Israël. » J'ouvris la bouche et il me fit manger ce rouleau. Il fut dans ma bouche doux comme du miel.",
      ref: "Ézéchiel 3:1-4",
      exercices: [
        { type: "qcm", q: "Que doit faire Ézéchiel du rouleau ?", choix: ["Le manger", "Le brûler", "Le cacher", "Le recopier"], bonne: 0 },
        { type: "qcm", q: "Quel goût a-t-il dans sa bouche ?", choix: ["Doux comme du miel", "Amer comme du fiel", "Salé", "Sans goût"], bonne: 0, niveau: "moyen" },
        { type: "qui", indices: ["Dieu m'appelle « fils de l'homme ».", "Je mange un rouleau doux comme du miel.", "Je suis établi sentinelle de mon peuple.", "Je prophétise sur une vallée d'ossements desséchés."], reponse: "Ézéchiel", leurres: ["Jérémie", "Daniel", "Ésaïe"] },
      ],
    },
    {
      recit:
        "« Fils de l'homme, je t'établis comme sentinelle sur la maison d'Israël. Tu écouteras la parole qui sortira de ma bouche et tu les avertiras de ma part. Si tu avertis le méchant et qu'il ne se détourne pas, il mourra dans son iniquité, mais toi, tu sauveras ton âme. »",
      ref: "Ézéchiel 3:16-21",
      exercices: [
        { type: "qcm", q: "Quel rôle Dieu confie-t-il à Ézéchiel ?", choix: ["Sentinelle sur la maison d'Israël", "Juge du peuple", "Roi en exil", "Scribe du temple"], bonne: 0 },
        { type: "qcm", q: "Que doit faire une sentinelle ?", choix: ["Écouter la parole et avertir le peuple", "Garder les portes de la ville", "Compter les exilés", "Conduire les sacrifices"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La sentinelle est responsable si elle n'avertit pas.", vrai: true, niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Malheur aux pasteurs d'Israël qui se paissaient eux-mêmes ! Vous n'avez pas fortifié celles qui étaient faibles, guéri celle qui était malade, ramené celle qui était égarée. Voici, j'aurai soin moi-même de mes brebis : je chercherai celle qui était perdue et je ramènerai celle qui était égarée. »",
      ref: "Ézéchiel 34:1-16",
      exercices: [
        { type: "qcm", q: "Que reproche Dieu aux pasteurs d'Israël ?", choix: ["Ils se paissaient eux-mêmes au lieu du troupeau", "Ils travaillaient trop", "Ils avaient trop de brebis", "Ils quittaient la ville"], bonne: 0 },
        { type: "qcm", q: "Que promet Dieu de faire lui-même ?", choix: ["Chercher la brebis perdue et ramener l'égarée", "Vendre le troupeau", "Choisir de nouveaux pasteurs seulement", "Fermer les pâturages"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "Jésus reprendra cette image en se disant le bon berger.", vrai: true, ref: "Jean 10:11", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Je vous donnerai un cœur nouveau, et je mettrai en vous un esprit nouveau ; j'ôterai de votre corps le cœur de pierre, et je vous donnerai un cœur de chair. Je mettrai mon esprit en vous, et je ferai que vous suiviez mes ordonnances. »",
      ref: "Ézéchiel 36:26-27",
      coffre: true,
      exercices: [
        { type: "verset", ref: "Ézéchiel 36:26", texte: "Je vous donnerai un cœur nouveau et je mettrai en vous un esprit nouveau" },
        { type: "trou", texte: "« J'ôterai de votre corps le cœur de pierre, et je vous donnerai un cœur de ___. »", reponse: "chair", leurres: ["feu", "lumière", "sagesse"], niveau: "moyen" },
        { type: "qcm", q: "Qui opère ce changement ?", choix: ["Dieu lui-même, par son esprit", "Le peuple par ses efforts", "Les prêtres du temple", "Le roi de Babylone"], bonne: 0 },
      ],
    },
    {
      recit:
        "La main de l'Éternel me transporta au milieu d'une vallée remplie d'ossements. Ils étaient en très grand nombre, et ils étaient complètement secs. Il me dit : « Fils de l'homme, ces os pourront-ils revivre ? » Je répondis : « Seigneur Éternel, tu le sais. »",
      ref: "Ézéchiel 37:1-3",
      exercices: [
        { type: "qcm", q: "Que voit Ézéchiel dans la vallée ?", choix: ["Des ossements très nombreux et complètement secs", "Une armée en marche", "Un temple en ruine", "Un fleuve à sec"], bonne: 0 },
        { type: "qcm", q: "Que répond Ézéchiel à la question de Dieu ?", choix: ["« Seigneur Éternel, tu le sais »", "« Non, c'est impossible »", "« Oui, certainement »", "Il se tait"], bonne: 0, niveau: "moyen" },
        { type: "vf", q: "La vallée d'ossements représente la maison d'Israël sans espérance.", vrai: true, ref: "Ézéchiel 37:11", niveau: "moyen" },
      ],
    },
    {
      recit:
        "« Prophétise sur ces os et dis-leur : Ossements desséchés, écoutez la parole de l'Éternel ! » Je prophétisai : il se fit un bruit, un mouvement, et les os se rapprochèrent les uns des autres. Des nerfs et de la chair montèrent sur eux. Puis le souffle entra en eux : ils reprirent vie et se tinrent sur leurs pieds, une armée nombreuse.",
      ref: "Ézéchiel 37:4-10",
      exercices: [
        { type: "ordre", consigne: "Remets la vision de la vallée dans l'ordre :", items: ["Un bruit et un mouvement : les os se rapprochent", "Des nerfs et de la chair montent sur eux", "Le souffle entre en eux", "Ils se tiennent debout, une armée nombreuse"] },
        { type: "qcm", q: "Qu'est-ce qui fait revivre les corps une fois reformés ?", choix: ["Le souffle qui entre en eux", "Le soleil du matin", "La pluie", "La parole du roi"], bonne: 0 },
        { type: "qcm", q: "Que deviennent les ossements à la fin ?", choix: ["Une armée nombreuse debout", "Un tas de poussière", "Un mur de pierres", "Un troupeau"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Il me ramena vers la porte de la maison, et voici, de l'eau sortait sous le seuil du temple. Il mesura mille coudées : l'eau montait aux chevilles ; mille encore : aux genoux ; mille encore : aux reins ; mille encore : c'était un torrent que je ne pouvais traverser. Partout où le torrent arrivera, tout ce qui vivra dans l'eau vivra.",
      ref: "Ézéchiel 47:1-12",
      coffre: true,
      exercices: [
        { type: "qcm", q: "D'où sort le fleuve de la vision ?", choix: ["De dessous le seuil du temple", "D'une source dans le désert", "De la mer", "Du rocher d'Horeb"], bonne: 0 },
        { type: "ordre", consigne: "Remets la montée de l'eau dans l'ordre :", items: ["Jusqu'aux chevilles", "Jusqu'aux genoux", "Jusqu'aux reins", "Un torrent qu'on ne peut traverser"] },
        { type: "qcm", q: "Que produit ce fleuve partout où il arrive ?", choix: ["La vie : tout ce qui y vivra vivra", "La sécheresse", "Le silence", "Des ruines"], bonne: 0, niveau: "moyen" },
      ],
    },
  ],
};
