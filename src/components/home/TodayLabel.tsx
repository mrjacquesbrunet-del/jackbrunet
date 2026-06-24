"use client";

import { useEffect, useState } from "react";

/** Affiche la date du jour (recalculée dans le navigateur, donc juste à minuit). */
export function TodayLabel({ initial }: { initial: string }) {
  const [label, setLabel] = useState(initial);
  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    );
  }, []);
  return (
    <p className="mt-3 text-sm font-semibold capitalize text-spirit-600">{label}</p>
  );
}
