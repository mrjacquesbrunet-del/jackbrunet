import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { LiteYouTube } from "@/components/ui/LiteYouTube";
import { messagesPage, videos, settings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Messages — prédications en vidéo",
  description:
    "Regarde les derniers messages de l'Église Tout est possible Pau : des prédications simples et concrètes pour ta vie de tous les jours.",
  alternates: { canonical: "/messages" },
};

export default function MessagesPage() {
  return (
    <>
      <PageHero hero={messagesPage.hero} />

      <Section tone="light">
        <div className="wrap">
          {videos.length > 0 ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video, i) => (
                <Reveal key={video.id} delay={(i % 3) * 0.07}>
                  <article>
                    <LiteYouTube videoId={video.id} title={video.title} />
                    <h2 className="mt-5 text-lg font-extrabold leading-snug tracking-tight">
                      {video.title}
                    </h2>
                    {video.publishedAt && (
                      <p className="mt-2 text-sm text-night/50">
                        {new Date(video.publishedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="rounded-3xl border border-night/10 p-12 text-center sm:p-20">
                <h2 className="display-3">{messagesPage.empty.title}</h2>
                <p className="lead mx-auto mt-5 max-w-xl text-night/70">
                  {messagesPage.empty.text}
                </p>
                <a
                  href={settings.youtube.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-dark mt-9"
                >
                  {messagesPage.empty.cta}
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </Section>
    </>
  );
}
