import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales — Mada Customer Software" },
      {
        name: "description",
        content:
          "Éditeur, directeur de publication, hébergeur et propriété intellectuelle du service Mada Customer Software.",
      },
      { property: "og:title", content: "Mentions légales — Mada Customer Software" },
      {
        property: "og:description",
        content: "Informations légales de l'éditeur de Mada Customer Software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/mentions-legales" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/mentions-legales" }],
  }),
  component: () => <LegalPage docKey="legal" />,
});
