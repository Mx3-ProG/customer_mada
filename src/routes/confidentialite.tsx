import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — Mada Customer Software" },
      {
        name: "description",
        content:
          "Données collectées, finalités, durées de conservation, sous-traitants et exercice de vos droits RGPD sur Mada Customer Software.",
      },
      { property: "og:title", content: "Politique de confidentialité — Mada Customer Software" },
      {
        property: "og:description",
        content: "Traitement des données personnelles et droits RGPD sur Mada Customer Software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/confidentialite" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/confidentialite" }],
  }),
  component: () => <LegalPage docKey="privacy" />,
});
