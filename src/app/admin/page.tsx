import type { Metadata } from "next";
import { AdminSpace } from "@/components/community/AdminSpace";

export const metadata: Metadata = {
  title: "Espace admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminSpace />;
}
