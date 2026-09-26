import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Fonts are self-hosted (main.jsx). The first screen's text uses the Arabic subsets of Noto Sans Arabic 800 (headings)
// and Tajawal 400 (body); preloading them lets the page paint in the right font instead of reflowing when they arrive.
const PRELOADED_FONTS = /(?:^|\/)(noto-sans-arabic-arabic-800|tajawal-arabic-400)-normal-[\w-]+\.woff2$/;

const preloadFonts = () => ({
  name: "sard-preload-fonts",
  transformIndexHtml: {
    order: "post",
    handler(html, ctx) {
      if (!ctx.bundle) return html; // dev server: nothing is hashed yet
      const tags = Object.keys(ctx.bundle)
        .filter((file) => PRELOADED_FONTS.test(file))
        .map((file) => ({
          tag: "link",
          attrs: { rel: "preload", as: "font", type: "font/woff2", href: `/${file}`, crossorigin: "" },
          injectTo: "head",
        }));
      return { html, tags };
    },
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadFonts()],
});
