import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Politique de cookies — Mada Customer Software" },
      {
        name: "description",
        content:
          "Cookies nécessaires, mesure d'audience et cookies de paiement utilisés par Mada Customer Software, et comment gérer votre consentement.",
      },
      { property: "og:title", content: "Politique de cookies — Mada Customer Software" },
      {
        property: "og:description",
        content: "Finalités, durées et gestion des cookies sur Mada Customer Software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cookies" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => <LegalPage docKey="cookies" />,
});
