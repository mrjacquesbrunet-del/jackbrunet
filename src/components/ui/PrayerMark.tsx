import { asset } from "@/lib/asset";

/** Icône « mains en prière » officielle (fournie par Pasteur Jack, charte lime,
 * fond transparent). Utilisée comme symbole de prière dans l'app et le site. */
export function PrayerMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset("/icons/priere.png")}
      alt=""
      aria-hidden="true"
      className={`inline-block object-contain ${className?? "h-5 w-5"}`}
    />
  );
}
