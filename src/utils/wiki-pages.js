// Which novel-wiki entries are worth a search result: a real name (not a "_section_" placeholder row or a lone ".")
// and at least WIKI_MIN_LETTERS letters or digits of the entry's own text (short description, description, role,
// article titles and bodies, attribute names and values). Thinner entries keep their page but get noindex.
// The API decides with the same rule (Domain/Seo/WikiPages.cs) and sends the answer as `isIndexable`; this copy is used
// when a response doesn't carry it (an API from before that field), so keep the two in step.
// Shared by the web app and the SEO worker (cloudflare-worker/seo-worker.js), so it must not touch the DOM.

export const WIKI_MIN_LETTERS = 150;

const SECTION_PLACEHOLDER = "_section_";
const LETTERS = /[\p{L}\p{Nd}]/gu;
const NAMED_ENTITIES = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export const countLetters = (text) => (text == null ? 0 : String(text).match(LETTERS)?.length ?? 0);

export const hasRealWikiName = (name) =>
  typeof name === "string" && !name.trimStart().startsWith(SECTION_PLACEHOLDER) && countLetters(name) > 0;

/** Editor HTML -> plain text (tags become spaces, character references are decoded, unknown ones dropped). */
export const wikiHtmlToText = (html) =>
  String(html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (_, ref) => {
      if (ref[0] === "#") {
        const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
      }
      return NAMED_ENTITIES[ref.toLowerCase()] ?? "";
    });

const valueLetters = (value) => {
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + valueLetters(item), 0);
  if (value && typeof value === "object") {
    return Object.entries(value).reduce((sum, [key, item]) => sum + countLetters(key) + valueLetters(item), 0);
  }
  return typeof value === "string" || typeof value === "number" ? countLetters(value) : 0;
};

/** Letters and digits of an entry's own text (a full entity from GET /api/novels/:id/entities/:entityId). */
export const wikiEntityLetters = (entity) =>
  countLetters(entity?.shortDescription) +
  countLetters(entity?.description) +
  countLetters(entity?.role) +
  valueLetters(entity?.attributes ?? {}) +
  (entity?.articles ?? []).reduce(
    (sum, article) => sum + countLetters(article?.title) + countLetters(wikiHtmlToText(article?.content)),
    0
  );

/** The API's verdict when it sent one, otherwise the same rule worked out here. */
export const isIndexableWikiEntity = (entity) =>
  typeof entity?.isIndexable === "boolean"
    ? entity.isIndexable
    : hasRealWikiName(entity?.name) && wikiEntityLetters(entity) >= WIKI_MIN_LETTERS;

/**
 * Whether an entry from the wiki's list (GET /api/novels/:id/entities) is worth indexing: the API's verdict when sent.
 * An older API's list carries no descriptions, so there a real short description (40+ letters) or an article stands in.
 * A wiki's list page is worth indexing when one of its entries is.
 */
export const isIndexableWikiListEntry = (entry) =>
  typeof entry?.isIndexable === "boolean"
    ? entry.isIndexable
    : hasRealWikiName(entry?.name) && (countLetters(entry?.shortDescription) >= 40 || entry?.articlesCount > 0);
