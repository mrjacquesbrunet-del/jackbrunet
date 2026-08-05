"use client";

import { useEffect, useRef, useState } from "react";
import {
  canRecordVoice,
  startRecording,
  uploadVoice,
  VOICE_MAX_SECONDS,
  type VoiceRecording,
} from "@/lib/voice";

/* Icônes en trait (charte — pas d'emoji). */
function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.7} aria-hidden>
      <path
        d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function StopIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="2" />
    </svg>
  );
}
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
    </svg>
  );
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Bouton micro pour envoyer une NOTE VOCALE au lieu d'un texte (mur de
 * prière et groupes). Enregistre (2 min max), montre le temps qui défile,
 * envoie dans le bucket « voices » puis appelle onSend(url).
 */
export function VoiceRecorderButton({
  userId,
  onSend,
  tone = "light",
}: {
  userId: string;
  /** Reçoit l'URL publique de la note vocale une fois envoyée. */
  onSend: (audioUrl: string) => Promise<void> | void;
  tone?: "light" | "dark";
}) {
  const [supported, setSupported] = useState(false);
  const [state, setState] = useState<"idle" | "recording" | "preview" | "sending">("idle");
  const [seconds, setSeconds] = useState(0);
  const [err, setErr] = useState("");
  // Enregistrement terminé, en attente d'envoi (pré-écoute possible).
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const recRef = useRef<VoiceRecording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    (async () => {
      if (!canRecordVoice()) return;
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          // La permission micro n'existe qu'à partir de la version NATIVE 1.8
          // (Info.plist / AndroidManifest). Sur une app 1.7, un accès micro
          // ferait crasher iOS → on masque le bouton tant que l'app n'est pas
          // à jour côté store.
          const { App } = await import("@capacitor/app");
          const info = await App.getInfo();
          const [maj = 0, min = 0] = String(info.version)
            .split(".")
            .map((x) => parseInt(x, 10) || 0);
          if (maj < 1 || (maj === 1 && min < 8)) return;
        }
        setSupported(true);
      } catch {
        setSupported(true);
      }
    })();
  }, []);
  useEffect(
    () => () => {
      recRef.current?.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    },
    [],
  );

  if (!supported) return null;

  async function begin() {
    setErr("");
    try {
      recRef.current = await startRecording();
    } catch {
      setErr("Micro refusé. Autorise-le dans les réglages du téléphone.");
      setTimeout(() => setErr(""), 3500);
      return;
    }
    setSeconds(0);
    setState("recording");
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= VOICE_MAX_SECONDS) void finish();
        return s + 1;
      });
    }, 1000);
  }

  /** Stop (carré) : termine l'enregistrement et passe en PRÉ-ÉCOUTE — la note
   * n'est envoyée que quand on touche « Envoyer ». */
  async function finish() {
    if (timerRef.current) clearInterval(timerRef.current);
    const rec = recRef.current;
    recRef.current = null;
    if (!rec) {
      setState("idle");
      return;
    }
    const blob = await rec.stop();
    if (!blob || blob.size < 1000) {
      setErr("Enregistrement trop court.");
      setTimeout(() => setErr(""), 2500);
      setState("idle");
      return;
    }
    setPending({ blob, url: URL.createObjectURL(blob) });
    setState("preview");
  }

  /** Envoi effectif dans la conversation. */
  async function sendPending() {
    if (!pending) return;
    setState("sending");
    setErr("");
    const url = await uploadVoice(userId, pending.blob);
    if (url) {
      try {
        await onSend(url);
        URL.revokeObjectURL(pending.url);
        setPending(null);
        setState("idle");
        return;
      } catch {
        /* l'insertion a échoué → on garde la note pour réessayer */
      }
    }
    setErr("Échec de l'envoi. Vérifie ta connexion et réessaie.");
    setState("preview");
  }

  function cancel() {
    if (timerRef.current) clearInterval(timerRef.current);
    recRef.current?.cancel();
    recRef.current = null;
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
    setErr("");
    setState("idle");
  }

  const dark = tone === "dark";

  // Pré-écoute + envoi : la note est prête, on peut l'écouter puis l'envoyer.
  if (state === "preview" || (state === "sending" && pending)) {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 rounded-2xl px-2.5 py-2 ${
          dark ? "bg-white/10" : "bg-night-900/[0.06]"
        }`}
      >
        {pending ? <VoiceNotePlayer src={pending.url} tone={tone} /> : null}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={state === "sending"}
            className={`text-xs font-semibold underline-offset-2 hover:underline disabled:opacity-50 ${
              dark ? "text-cream/60" : "text-night-900/50"
            }`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={sendPending}
            disabled={state === "sending"}
            className="flex min-h-[36px] items-center gap-1.5 rounded-full bg-dawn-400 px-4 py-1.5 text-xs font-bold text-night-950 shadow-sm active:scale-95 disabled:opacity-60"
          >
            {state === "sending" ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Envoi…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M3 11l18-8-8 18-2.5-7.5z" />
                </svg>
                Envoyer
              </>
            )}
          </button>
        </div>
        <p className={`w-full text-[11px] ${dark ? "text-cream/45" : "text-night-900/40"}`}>
          Message éphémère : ta note reste écoutable 7 jours.
        </p>
        {err ? (
          <p className={`w-full text-xs ${dark ? "text-cream/60" : "text-night-900/50"}`}>{err}</p>
        ) : null}
      </div>
    );
  }

  if (state === "recording") {
    return (
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
          dark ? "bg-white/10" : "bg-night-900/[0.06]"
        }`}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <span className={`text-xs font-bold tabular-nums ${dark ? "text-cream" : "text-night-900/80"}`}>
          {fmt(seconds)}
        </span>
        <button
          type="button"
          onClick={cancel}
          className={`text-xs font-semibold underline-offset-2 hover:underline ${
            dark ? "text-cream/60" : "text-night-900/50"
          }`}
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={finish}
          aria-label="Terminer et envoyer"
          className="grid h-9 w-9 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-sm active:scale-95"
        >
          <StopIcon className="h-[18px] w-[18px]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={state === "idle" ? begin : undefined}
        disabled={state === "sending"}
        aria-label="Envoyer une note vocale"
        title="Note vocale"
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors active:scale-95 disabled:opacity-50 ${
          dark
            ? "bg-white/10 text-cream/80 hover:bg-white/15"
            : "bg-night-900/[0.06] text-night-900/65 hover:bg-night-900/10"
        }`}
      >
        {state === "sending" ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <MicIcon className="h-5 w-5" />
        )}
      </button>
      {err ? (
        <p className={`ml-2 text-xs ${dark ? "text-cream/60" : "text-night-900/50"}`}>{err}</p>
      ) : null}
    </div>
  );
}

/**
 * Lecteur de note vocale (bulle audio) : bouton lecture/pause + barre de
 * progression + durée, dans la charte.
 */
export function VoiceNotePlayer({
  src,
  tone = "light",
}: {
  src: string;
  tone?: "light" | "dark";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = new Audio(src);
    audioRef.current = a;
    const onT = () => setTime(a.currentTime);
    const onM = () => setDur(Number.isFinite(a.duration) ? a.duration : 0);
    const onEnd = () => {
      setPlaying(false);
      setTime(0);
    };
    a.addEventListener("timeupdate", onT);
    a.addEventListener("loadedmetadata", onM);
    a.addEventListener("durationchange", onM);
    a.addEventListener("ended", onEnd);
    return () => {
      a.pause();
      a.removeEventListener("timeupdate", onT);
      a.removeEventListener("loadedmetadata", onM);
      a.removeEventListener("durationchange", onM);
      a.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [src]);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      void a.play().then(() => setPlaying(true)).catch(() => undefined);
    }
  }

  const dark = tone === "dark";
  const pct = dur > 0 ? Math.min(100, (time / dur) * 100) : 0;

  return (
    <div
      className={`flex w-full max-w-[240px] items-center gap-2.5 rounded-2xl px-3 py-2 ${
        dark ? "bg-white/10" : "bg-night-900/[0.05]"
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Écouter la note vocale"}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dawn-400 text-night-950 shadow-sm active:scale-95"
      >
        {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
      </button>
      <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-night-900/10"}`}>
        <div className="h-full rounded-full bg-dawn-400 transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <span className={`shrink-0 text-[11px] font-semibold tabular-nums ${dark ? "text-cream/60" : "text-night-900/50"}`}>
        {fmt(playing || time > 0 ? time : dur)}
      </span>
    </div>
  );
}
