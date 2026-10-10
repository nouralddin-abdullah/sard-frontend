import DOMPurify from "dompurify";

// Stored text that the site shows as HTML (chapter paragraphs, wiki articles) is written by members, so it is cleaned
// in the browser before it is rendered or parsed, whatever the server stored.

// A chapter paragraph shows the editor's inline formatting and pictures only, as the API's chapter format keeps them
// (backend #74). Any other tag is dropped and its text kept; the only attributes left are a picture's src and alt.
const PARAGRAPH = {
  ALLOWED_TAGS: ["strong", "b", "em", "i", "u", "s", "br", "img"],
  ALLOWED_ATTR: ["src", "alt"],
  ALLOWED_URI_REGEXP: /^https?:\/\//i,
};

/** A chapter paragraph's stored HTML, safe to render. */
export const safeParagraphHtml = (html) => {
  const fragment = DOMPurify.sanitize(html ?? "", { ...PARAGRAPH, RETURN_DOM_FRAGMENT: true });
  // A picture whose source wasn't a web address has nothing left to show.
  fragment.querySelectorAll("img:not([src])").forEach((img) => img.remove());
  const holder = document.createElement("template");
  holder.content.appendChild(fragment);
  return holder.innerHTML;
};

/** A wiki article's stored HTML, safe to render: its formatting stays, while scripts, event handlers and unsafe links go. */
export const safeArticleHtml = (html) => DOMPurify.sanitize(html ?? "", { USE_PROFILES: { html: true } });

/**
 * Stored HTML as an inert document: nothing in it runs or loads (unlike an element's innerHTML, where a picture still
 * loads and fires its handlers), so its text and elements can be read safely.
 */
export const parseHtml = (html) => new DOMParser().parseFromString(html ?? "", "text/html").body;

/**
 * The plain text of stored HTML, as a reader would see it, read without running or loading anything in it: the text
 * of elements that show none (a script, a style) is left out.
 */
export const htmlToText = (html) => {
  const body = parseHtml(html);
  body.querySelectorAll("script, style, noscript, template, iframe, object, embed, svg, math").forEach((el) => el.remove());
  return body.textContent ?? "";
};
