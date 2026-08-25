import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/LegalPage";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions générales d'utilisation — Mada Customer Software" },
      {
        name: "description",
        content:
          "Règles d'accès et d'usage de Mada Customer Software : compte, obligations, disponibilité, responsabilité et résiliation.",
      },
      { property: "og:title", content: "Conditions générales d'utilisation — Mada" },
      {
        property: "og:description",
        content: "Les CGU du service Mada Customer Software.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/cgu" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cgu" }],
  }),
  component: () => <LegalPage docKey="terms" />,
});
