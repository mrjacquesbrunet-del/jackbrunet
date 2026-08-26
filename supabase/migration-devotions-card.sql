-- Ajoute la colonne « card » à la table des dévotionnels.
-- Elle stocke le nom du fichier image de la carte (bucket public « medias »),
-- ex. « rhema-01-noir.png ». L'app affiche cette image à la place de la carte
-- générée. Idempotent : peut être relancé sans risque.

alter table public.devotions
  add column if not exists card text;
