import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title: "Conditions générales de vente — Mada Customer Software" },
      {
        name: "description",
        content:
          "Abonnement Mada Pro à 10 €/mois : prix, paiement Stripe, reconduction, résiliation, facturation et réclamations.",
      },
      { property: "og:title", content: "Conditions générales de vente — Mada" },
      {
        property: "og:description",
        content: "Conditions d'abonnement aux offres payantes de Mada Customer Software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cgv" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cgv" }],
  }),
  component: () => <LegalPage docKey="sales" />,
});
