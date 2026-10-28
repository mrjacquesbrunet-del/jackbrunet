-- Studio Jack : gains partenaires (vidéos faites pour une autre marque, 480 € la vidéo).
-- Relevé initial depuis les légendes Instagram. L'analyse du lundi ajoute ensuite les nouvelles vidéos.
-- Peut être relancé : remplace le document par ce relevé.
insert into public.studio_docs (coll, id, data, updated_at)
values ('suivi', 'partenaires', '{
  "tarif": 480,
  "videos": [
    {
      "id": "DSX0eN3jE-R",
      "date": "2025-12-17",
      "marque": "Hello Bible",
      "lien": "https://www.instagram.com/p/DSX0eN3jE-R/"
    },
    {
      "id": "DYfURcViugH",
      "date": "2026-05-18",
      "marque": "Holy Diner",
      "lien": "https://www.instagram.com/p/DYfURcViugH/"
    },
    {
      "id": "DY49b2ns1JF",
      "date": "2026-05-28",
      "marque": "Hello Bible",
      "lien": "https://www.instagram.com/p/DY49b2ns1JF/"
    },
    {
      "id": "DaDne4Bi1yv",
      "date": "2026-06-26",
      "marque": "Hello Bible",
      "lien": "https://www.instagram.com/p/DaDne4Bi1yv/"
    },
    {
      "id": "DbGirAniMIb",
      "date": "2026-07-22",
      "marque": "Hello Bible",
      "lien": "https://www.instagram.com/p/DbGirAniMIb/"
    },
    {
      "id": "DeZwJoPCWBG",
      "date": "2026-10-12",
      "marque": "Hello Bible",
      "lien": "https://www.instagram.com/p/DeZwJoPCWBG/"
    }
  ],
  "source": "légendes des vidéos Instagram (archive d''octobre 2025 à octobre 2026)"
}'::jsonb || jsonb_build_object('majLe', now()), now())
on conflict (coll, id) do update set data = excluded.data, updated_at = now();
