import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Canonical domain. Set SITE at build time for production; the fallback is a
// reserved ".example" address so a build made without it can never be mistaken
// for a live site.
const site = process.env.SITE ?? "https://nooks.example";

export default defineConfig({
  site,
  // Static hosting serves /catalog/ from catalog/index.html. Keeping the slash
  // on every URL gives one canonical form instead of a redirect plus a duplicate.
  trailingSlash: "always",
  integrations: [
    sitemap({
      // Utility pages that are noindex belong out of the sitemap too.
      filter: (page) => !new URL(page).pathname.startsWith("/cart/"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
