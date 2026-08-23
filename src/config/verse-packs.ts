/**
 * Parcours de versets proposés dans le jeu de mémorisation, classés par
 * niveau : on commence par les fondations (versets courts et essentiels),
 * puis les thèmes clés de la vie chrétienne. Un parcours se débloque quand
 * le joueur atteint son niveau (XP gagnés au jeu). Textes : Louis Segond,
 * récupérés depuis la Bible embarquée au moment de l'ajout.
 */

export type VersePack = {
  level: number;
  title: string;
  subtitle: string;
  refs: string[];
};

export const VERSE_PACKS: VersePack[] = [
  {
    level: 1,
    title: "Les fondations",
    subtitle: "Les versets essentiels, courts et puissants, pour commencer.",
    refs: ["Jean 3:16", "Philippiens 4:13", "Psaumes 23:1", "1 Jean 4:8", "Josué 1:9"],
  },
  {
    level: 2,
    title: "Ton identité en Christ",
    subtitle: "Qui tu es aux yeux de Dieu — des vérités à ancrer profondément.",
    refs: ["2 Corinthiens 5:17", "Galates 2:20", "1 Pierre 2:9", "Éphésiens 2:10", "Romains 8:1"],
  },
  {
    level: 3,
    title: "Prière & confiance",
    subtitle: "Déposer ses soucis, chercher Dieu d'abord, lui faire confiance.",
    refs: ["Philippiens 4:6-7", "Proverbes 3:5-6", "Matthieu 6:33", "Jérémie 29:11", "Psaumes 37:4-5"],
  },
  {
    level: 4,
    title: "Partager sa foi",
    subtitle: "Les versets de l'évangélisation, pour annoncer Jésus autour de toi.",
    refs: ["Matthieu 28:19-20", "Romains 1:16", "Actes 1:8", "Marc 16:15", "1 Pierre 3:15"],
  },
  {
    level: 5,
    title: "Tenir ferme",
    subtitle: "La force, la persévérance et la foi dans les saisons difficiles.",
    refs: ["Ésaïe 40:31", "Romains 8:28", "Jacques 1:2-4", "2 Timothée 1:7", "Hébreux 11:1"],
  },
];
