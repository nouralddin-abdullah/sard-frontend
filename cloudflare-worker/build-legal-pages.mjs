// Makes the legal pages' HTML for the SEO worker from the published texts (src/content/legal/*.ar.md). It uses micromark
// with its GFM extension, the Markdown parser the web app renders the same files with (react-markdown), so crawlers get
// the same headings, lists, tables and links as readers. wrangler runs this before each bundle ([build] in wrangler.toml)
// and the worker imports the result, dist/legal-pages.js (not committed). Rendering here keeps the worker's CPU time per
// request low: micromark needs tens of milliseconds for the privacy policy. Needs the repo root's node_modules.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { LEGAL_PAGES, legalDisplayText, sitePath } from "../src/utils/legal-pages.js";

const OUT_DIR = new URL("./dist/", import.meta.url);
const OUT = new URL("legal-pages.js", OUT_DIR);

const escapeAttribute = (text) =>
  text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const pages = {};
for (const page of LEGAL_PAGES) {
  const text = await readFile(new URL(`../src/content/legal/${page.file}`, import.meta.url), "utf8");
  const html = micromark(legalDisplayText(text), { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  // As in the app, links to the site are paths: https://www.sardnovels.com/terms -> /terms.
  pages[page.key] = html.replace(/ href="([^"]*)"/g, (attribute, href) => {
    const path = sitePath(href.replace(/&amp;/g, "&"));
    return path ? ` href="${escapeAttribute(path)}"` : attribute;
  });
}

const source = `// Made by build-legal-pages.mjs from src/content/legal. Don't edit.\nexport default ${JSON.stringify(pages, null, 2)};\n`;
await mkdir(OUT_DIR, { recursive: true });
// Written only when it changed: wrangler dev would otherwise see a new file and build again.
const previous = await readFile(OUT, "utf8").catch(() => null);
if (previous !== source) {
  await writeFile(OUT, source);
}
console.log(`Legal pages: ${LEGAL_PAGES.map((page) => `${page.path} (${pages[page.key].length} characters of HTML)`).join(", ")}`);
