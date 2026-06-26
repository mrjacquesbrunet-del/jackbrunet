import { initials } from "@/components/community/useAuth";

export function Avatar({
  pseudo,
  url,
  size = 40,
}: {
  pseudo?: string | null;
  url?: string | null;
  size?: number;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={pseudo ?? ""}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-dawn-400 to-spirit-500 font-bold text-night-950"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(pseudo)}
    </span>
  );
}
