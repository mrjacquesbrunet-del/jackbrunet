import type { Metadata } from "next";
import { GroupsView } from "@/components/community/GroupsView";

export const metadata: Metadata = {
  title: "Groupes de prière",
  description:
    "Crée des groupes de prière privés (cellule, église, famille) et partagez vos sujets entre membres choisis.",
};

export default function GroupesPage() {
  return <GroupsView />;
}
