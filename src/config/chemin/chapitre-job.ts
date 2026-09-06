import type { CheminChapitre } from "@/lib/chemin";

/** Chapitre 23 — Job (Job 1-2, 38-42). 8 étapes. */
export const CHAPITRE_JOB: CheminChapitre = {
  id: 23,
  nom: "Job",
  livre: "Job 1-42",
  accent: "#78716C",
  decor: "/img/chemin/decor-23.jpg",
  sentier: [{ x: 55.1, y: 94 }, { x: 57.1, y: 84.3 }, { x: 51.4, y: 74.6 }, { x: 49.5, y: 64.9 }, { x: 52.6, y: 55 }, { x: 54, y: 45.3 }, { x: 50.8, y: 35.6 }, { x: 60.1, y: 26 }],
  fallback: ["#33302c", "#4a4640", "#1a1816"],
  carte: {
    id: "job",
    nom: "Job",
    titre: "L'homme qui n'a pas maudit",
    rarete: "legendaire",
    image: "/img/chemin/cartes/job.jpg",
  },
  etapes: [
    {
      recit:
        "Il y avait dans le pays d'Uts un homme qui s'appelait Job. Cet homme était intègre et droit ; il craignait Dieu et se détournait du mal. Il eut sept fils et trois filles, sept mille brebis, trois mille chameaux, et un très grand nombre de serviteurs. Cet homme était le plus considérable de tous les fils de l'Orient.",
      ref: "Job 1:1-5",
      exercices: [
        { type: "qcm", q: "Comment Job est-il décrit dès la première phrase ?", choix: ["Intègre et droit, craignant Dieu", "Riche mais dur", "Savant et voyageur", "Roi de son pays"], bonne: 0 },
        { type: "qcm", q: "Dans quel pays vivait-il ?", choix: ["Le pays d'Uts", "Le pays de Madian", "Le pays d'Édom", "Le pays de Basan"], bonne: 0, niveau: "expert" },
        { type: "qcm", q: "Combien d'enfants avait-il ?", choix: ["Sept fils et trois filles", "Douze fils", "Deux fils et deux filles", "Un fils unique"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "En un seul jour, quatre messagers vinrent l'un après l'autre : les bœufs et les ânesses enlevés, les brebis consumées, les chameaux emmenés, et enfin ses dix enfants écrasés sous la maison où ils festoyaient. Job se leva, déchira son manteau, se rasa la tête, et se jeta par terre en se prosternant.",
      ref: "Job 1:13-20",
      exercices: [
        { type: "qcm", q: "Combien de messagers viennent, et en combien de temps ?", choix: ["Quatre, le même jour, l'un après l'autre", "Un seul, au bout d'un an", "Deux, en deux semaines", "Sept, en sept jours"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Quelle est la dernière et la pire nouvelle ?", choix: ["La mort de ses dix enfants", "La perte des chameaux", "L'incendie de sa maison", "La fuite de ses serviteurs"], bonne: 0 },
        { type: "vf", q: "Job réagit par la colère et le blasphème.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Job dit : « Je suis sorti nu du sein de ma mère, et nu je retournerai dans le sein de la terre. L'Éternel a donné, et l'Éternel a ôté ; que le nom de l'Éternel soit béni ! » En tout cela, Job ne pécha point et n'attribua rien d'injuste à Dieu.",
      ref: "Job 1:21-22",
      exercices: [
        { type: "verset", ref: "Job 1:21", texte: "L'Éternel a donné et l'Éternel a ôté que le nom de l'Éternel soit béni" },
        { type: "qui", indices: ["Je perds tout en un seul jour.", "Je m'assieds dans la cendre et je gratte mes plaies.", "Trois amis viennent me consoler et m'accusent.", "Dieu me répond du milieu d'une tempête."], reponse: "Job", leurres: ["Jérémie", "Élie", "Osée"] },
        { type: "qcm", q: "Que dit le texte de Job après ce malheur ?", choix: ["Il ne pécha point et n'attribua rien d'injuste à Dieu", "Il maudit le jour de Dieu", "Il quitta le pays", "Il exigea réparation"], bonne: 0, niveau: "moyen" },
      ],
    },
    {
      recit:
        "Job fut frappé d'un ulcère malin depuis la plante des pieds jusqu'au sommet de la tête. Il prit un tesson pour se gratter et s'assit sur la cendre. Sa femme lui dit : « Maudis Dieu, et meurs ! » Il lui répondit : « Quoi ! nous recevons de Dieu le bien, et nous ne recevrions pas aussi le mal ! »",
      ref: "Job 2:7-10",
      exercices: [
        { type: "qcm", q: "Que conseille sa femme à Job ?", choix: ["De maudire Dieu et de mourir", "De partir se soigner", "De consulter un médecin", "De prier davantage"], bonne: 0 },
        { type: "qcm", q: "Que répond Job ?", choix: ["« Nous recevons de Dieu le bien : ne recevrions-nous pas aussi le mal ? »", "« Tu as raison »", "« Laisse-moi seul »", "« Dieu m'a oublié »"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "Job prit un ___ pour se gratter et s'assit sur la cendre.", reponse: "tesson", leurres: ["bâton", "linge", "couteau"], niveau: "expert" },
      ],
    },
    {
      recit:
        "Trois amis de Job — Éliphaz, Bildad et Tsophar — apprirent son malheur et vinrent le plaindre. Ils s'assirent à terre auprès de lui pendant sept jours et sept nuits, sans lui dire une parole, car ils voyaient que sa douleur était grande. Puis ils parlèrent, et tous soutinrent que Job devait avoir péché.",
      ref: "Job 2:11-13",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que font d'abord les trois amis de Job ?", choix: ["Ils restent sept jours en silence auprès de lui", "Ils le corrigent aussitôt", "Ils prient à voix haute", "Ils lui apportent des remèdes"], bonne: 0 },
        { type: "qcm", q: "Quelle est leur thèse quand ils prennent la parole ?", choix: ["Si Job souffre, c'est qu'il a péché", "Dieu est injuste", "Il faut fuir le pays", "La souffrance n'existe pas"], bonne: 0, niveau: "moyen" },
        { type: "qcm", q: "Comment s'appellent les trois amis ?", choix: ["Éliphaz, Bildad et Tsophar", "Élihu, Éliab et Éléazar", "Nathan, Gad et Ahija", "Ananias, Azarias et Misaël"], bonne: 0, niveau: "expert" },
      ],
    },
    {
      recit:
        "L'Éternel répondit à Job du milieu de la tempête : « Où étais-tu quand je fondais la terre ? Dis-le, si tu as de l'intelligence. Qui en a fixé les dimensions ? Le sais-tu ? Qui a fermé la mer avec des portes ? As-tu commandé au matin depuis que tu existes ? »",
      ref: "Job 38:1-12",
      exercices: [
        { type: "qcm", q: "D'où Dieu répond-il à Job ?", choix: ["Du milieu de la tempête", "D'un buisson", "Par un songe", "Par la bouche d'un ami"], bonne: 0 },
        { type: "qcm", q: "Que Dieu répond-il exactement aux questions de Job ?", choix: ["Il ne s'explique pas : il l'interroge à son tour sur la création", "Il donne toutes les raisons", "Il accuse les amis", "Il garde le silence"], bonne: 0, niveau: "moyen" },
        { type: "trou", texte: "« Où étais-tu quand je fondais la ___ ? »", reponse: "terre", leurres: ["mer", "loi", "ville"], niveau: "moyen" },
      ],
    },
    {
      recit:
        "Job répondit à l'Éternel : « Je sais que tu peux tout, et que rien ne s'oppose à tes pensées. Mon oreille avait entendu parler de toi ; mais maintenant mon œil t'a vu. C'est pourquoi je me condamne et je me repens sur la poussière et sur la cendre. »",
      ref: "Job 42:1-6",
      exercices: [
        { type: "verset", ref: "Job 42:5", texte: "Mon oreille avait entendu parler de toi mais maintenant mon œil t'a vu", niveau: "moyen" },
        { type: "qcm", q: "Qu'est-ce qui change pour Job à la fin ?", choix: ["Il passe d'entendre parler de Dieu à le voir", "Il obtient toutes ses explications", "Il gagne son procès", "Il retrouve d'abord ses enfants"], bonne: 0 },
        { type: "vf", q: "Dieu donne à Job la liste des raisons de sa souffrance.", vrai: false, niveau: "moyen" },
      ],
    },
    {
      recit:
        "L'Éternel dit aux amis : « Ma colère est enflammée contre vous, car vous n'avez pas parlé de moi avec droiture comme l'a fait mon serviteur Job. » Job pria pour ses amis, et l'Éternel rétablit Job dans son premier état : il lui donna le double de tout ce qu'il avait possédé, et il eut encore sept fils et trois filles.",
      ref: "Job 42:7-17",
      coffre: true,
      exercices: [
        { type: "qcm", q: "Que doit faire Job pour ses amis ?", choix: ["Prier pour eux", "Les chasser", "Les juger", "Leur rendre leurs biens"], bonne: 0 },
        { type: "qcm", q: "Que reçoit Job à la fin ?", choix: ["Le double de ce qu'il avait", "Exactement ce qu'il avait", "Rien de matériel", "La moitié"], bonne: 0, niveau: "moyen" },
        { type: "ordre", consigne: "Remets le livre de Job dans l'ordre :", items: ["Job perd tout en un seul jour", "Sa femme lui dit de maudire Dieu", "Les trois amis l'accusent", "Dieu répond du milieu de la tempête"] },
      ],
    },
  ],
};
