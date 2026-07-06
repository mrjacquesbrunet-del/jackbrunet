"use client";

import { useEffect, useState } from "react";
import {
  isNativeApp,
  readReminder,
  enableDailyReminder,
  disableDailyReminder,
} from "@/lib/notifications";
import { BellGlyph } from "@/components/ui/DevoIcons";

/**
 * Réglage du rappel quotidien « pensée du jour ».
 * Affiché uniquement dans l'application native (notifications locales).
 */
export function ReminderToggle() {
  const [native, setNative] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState("08:00");
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!isNativeApp()) return;
    setNative(true);
    const pref = readReminder();
    setEnabled(pref.enabled);
    setTime(
      `${String(pref.hour).padStart(2, "0")}:${String(pref.minute).padStart(2, "0")}`,
    );
  }, []);

  if (!native) return null;

  async function apply(nextEnabled: boolean, nextTime: string) {
    setBusy(true);
    setDenied(false);
    const [h, m] = nextTime.split(":").map((n) => parseInt(n, 10));
    if (nextEnabled) {
      const ok = await enableDailyReminder(h || 8, m || 0);
      if (!ok) {
        setDenied(true);
        setEnabled(false);
      } else {
        setEnabled(true);
      }
    } else {
      await disableDailyReminder();
      setEnabled(false);
    }
    setBusy(false);
  }

  return (
    <div className="glass p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-spirit-500/15 text-spirit-600">
          <BellGlyph className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold leading-tight">
            Rappel « pensée du jour »
          </p>
          <p className="mt-1 text-xs text-night-900/60">
            {enabled
? `Chaque jour à ${time}.`
: "Reçois un rappel chaque matin pour ton temps avec Dieu."}
          </p>
          {denied? (
            <p className="mt-1 text-xs font-semibold text-red-600">
              Notifications refusées, autorise-les dans les réglages du téléphone.
            </p>
          ): null}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <input
          type="time"
          value={time}
          disabled={busy}
          onChange={(e) => {
            setTime(e.target.value);
            if (enabled) apply(true, e.target.value);
          }}
          className="min-w-0 flex-1 rounded-xl border border-night-900/15 bg-white px-3 py-2.5 text-sm"
          aria-label="Heure du rappel"
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => apply(!enabled, time)}
          className={`${enabled? "btn-ghost": "btn-primary"} shrink-0`}
        >
          {busy? "…": enabled? "Désactiver": "Activer"}
        </button>
      </div>
    </div>
  );
}
