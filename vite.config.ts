import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

// Standalone Vite config (previously wrapped by @lovable.dev/vite-tanstack-config).
// Mirrors that preset's plugin set and defaults for local dev/build, minus the
// Lovable-sandbox-only plugins (hmr-gate, dev-server-bridge, assets-proxy,
// build-error-diagnostics, dev HMR error overlays) which never activated outside
// Lovable's own sandbox anyway.
export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      server: { entry: "server" },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    command === "build" ? nitro({ preset: "vercel" }) : undefined,
    viteReact(),
  ],
  css: {
    transformer: "lightningcss",
  },
  resolve: {
    alias: { "@": "/src" },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react/jsx-dev-runtime"],
    ignoreOutdatedRequests: true,
  },
  server: {
    host: "::",
    port: 8080,
  },
}));
