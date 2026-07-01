"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

/** Enregistre une vue de page (anonyme) à chaque changement de route. */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) track("page", pathname);
  }, [pathname]);
  return null;
}
