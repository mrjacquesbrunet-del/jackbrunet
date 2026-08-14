import type { Metadata } from "next";
import { PageHero } from "@/components/ui/PageHero";
import { ResetPasswordForm } from "@/components/community/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser mon mot de passe",
  description: "Choisis un nouveau mot de passe pour ton compte RHEMA.",
};

export default function ReinitialiserMotDePassePage() {
  return (
    <>
      <PageHero
        eyebrow="Compte"
        title={
          <>
            Nouveau <span className="text-gradient">mot de passe</span>
          </>
        }
        description="Choisis un nouveau mot de passe pour ton compte."
      />

      <section className="container-x py-12">
        <div className="mx-auto max-w-md">
          <ResetPasswordForm />
        </div>
      </section>
    </>
  );
}
