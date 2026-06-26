"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/components/community/useAuth";
import { createGroup, listMyGroups, type Group } from "@/lib/community";

export function GroupsView() {
  const { ready, userId } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setGroups(await listMyGroups());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ready && userId) load();
    else if (ready) setLoading(false);
  }, [ready, userId, load]);

  async function create() {
    if (!name.trim() || !userId) return;
    setCreating(true);
    await createGroup(name.trim(), desc.trim(), userId);
    setName("");
    setDesc("");
    await load();
    setCreating(false);
  }

  if (!isSupabaseConfigured) {
    return <section className="container-x py-16 pt-32 text-center text-night-900/60">Bientôt disponible.</section>;
  }
  if (!ready || loading) {
    return <p className="container-x py-16 pt-32 text-night-900/50">Chargement…</p>;
  }
  if (!userId) {
    return (
      <section className="container-x py-16 pt-32 text-center text-night-900/70">
        Connecte-toi pour créer et rejoindre des groupes.{" "}
        <Link href="/communaute" className="font-semibold text-spirit-600 hover:underline">
          Aller au mur de prière
        </Link>
      </section>
    );
  }

  return (
    <section className="container-x py-10 pt-28">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
        Mes <span className="text-gradient">groupes</span> de prière
      </h1>
      <p className="mt-2 max-w-xl text-night-900/65">
        Crée un groupe privé (ta cellule, ton église, ta famille) et partagez vos sujets de prière
        entre vous, à l'abri des regards.
      </p>

      {/* Créer */}
      <div className="glass-strong mt-6 max-w-xl p-5">
        <p className="font-display font-bold">Créer un groupe</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom du groupe (ex. Cellule du mardi)"
          className="field mt-3 w-full"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          placeholder="Description (facultatif)"
          className="field mt-3 w-full resize-y"
        />
        <button
          type="button"
          onClick={create}
          disabled={creating || !name.trim()}
          className="btn-primary mt-3 disabled:opacity-40"
        >
          {creating ? "Création…" : "Créer le groupe"}
        </button>
      </div>

      {/* Liste */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.length === 0 ? (
          <p className="text-night-900/55">Aucun groupe pour l'instant. Crée le premier ! 🙏</p>
        ) : (
          groups.map((g) => (
            <Link
              key={g.id}
              href={`/groupe?g=${g.id}`}
              className="glass block p-5 transition-shadow hover:shadow-lg"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-dawn-400 to-spirit-500 font-display text-lg font-extrabold text-night-950">
                {g.name.slice(0, 1).toUpperCase()}
              </span>
              <p className="mt-3 font-display text-lg font-bold leading-tight">{g.name}</p>
              {g.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-night-900/60">{g.description}</p>
              ) : null}
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
