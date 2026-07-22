import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { Title3D } from "@/components/ui/Title3D";
import { withScript } from "@/lib/script";
import { home, videos, settings } from "@/lib/content";
import { t } from "@/i18n";

// « La série en cours » : le dernier message en très grand,
// les précédents en rappel.
export function LatestMessage() {
  const { latestMessage } = home;
  const [latest, ...rest] = videos;
  const previous = rest.slice(0, 2);

  return (
    <section className="grain relative overflow-hidden bg-night py-24 text-cream sm:py-32">
      <div className="glow-leaf absolute -top-40 right-0 h-[36rem] w-[36rem]" aria-hidden />
      <div className="wrap relative">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="kicker">{latestMessage.kicker}</p>
              <Title3D>
                <h2 className="display-2 mt-4 max-w-3xl">{withScript(latestMessage.title)}</h2>
              </Title3D>
            </div>
            <Link href="/messages" className="btn-ghost-dark">
              {latestMessage.cta}
            </Link>
          </div>
        </Reveal>

        {latest ? (
          <div className="mt-14 grid gap-8 lg:grid-cols-[2fr_1fr]">
            <Reveal>
              <LiteYouTube videoId={latest.id} title={latest.title} />
              <h3 className="mt-5 wordmark text-2xl leading-tight sm:text-3xl">
                {latest.title}
              </h3>
            </Reveal>
            <div className="flex flex-col gap-8">
              {previous.map((video, i) => (
                <Reveal key={video.id} delay={0.1 + i * 0.08}>
                  <LiteYouTube videoId={video.id} title={video.title} />
                  <h3 className="mt-3 font-bold leading-snug">{video.title}</h3>
                </Reveal>
              ))}
            </div>
          </div>
        ) : (
          <Reveal delay={0.1}>
            <div className="mt-14 flex flex-col items-start gap-6 rounded-3xl bg-night-soft p-10 sm:p-14">
              <p className="text-xl font-bold">{latestMessage.text}</p>
              <a
                href={settings.youtube.channelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t("common.watchOnYoutube")}
              </a>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
