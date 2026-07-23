import Link from "next/link";
import { Media } from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Reveal";
import agenda from "../../../content/agenda.json";

// Cartes agenda — style référence : visuel 16:9, titre centré en
// capitales, date grise, lieu surligné, « par … ».
export function AgendaCards({
  limit,
  tone = "light",
}: {
  limit?: number;
  tone?: "light" | "dark";
}) {
  const items = limit ? agenda.items.slice(0, limit) : agenda.items;
  const dark = tone === "dark";

  return (
    <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((event, i) => (
        <Reveal key={event.title + event.date} delay={(i % 3) * 0.07}>
          <Link href={event.link || "/agenda"} className="group block text-center">
            <div className="overflow-hidden rounded-2xl">
              <div className="transition-transform duration-700 ease-smooth group-hover:scale-105">
                <Media
                  src={event.image || undefined}
                  alt=""
                  ratio="aspect-video"
                  variant={i % 2 === 0 ? "night" : "leaf"}
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="!rounded-none"
                />
              </div>
            </div>
            <h3
              className={`wordmark mt-6 text-2xl leading-tight transition-colors duration-300 ${
                dark ? "group-hover:text-pulse" : "group-hover:text-leaf-deep"
              }`}
            >
              {event.title}
            </h3>
            <p
              className={`mt-2 text-sm font-semibold uppercase tracking-[0.08em] ${
                dark ? "text-cream/45" : "text-night/45"
              }`}
            >
              {event.date}
            </p>
            <p className="mt-3">
              <span
                className={`inline-block px-2.5 py-1 text-sm font-bold ${
                  dark ? "bg-cream/15" : "bg-night/10"
                }`}
              >
                {event.location}
              </span>
            </p>
            <p className="mt-2 text-sm font-bold">par {event.by}</p>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
