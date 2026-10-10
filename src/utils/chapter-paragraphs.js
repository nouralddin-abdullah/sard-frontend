// Chapter format v1 (backend #74): a chapter is a list of paragraphs, each with a kind (contentType) and content.
//
// | contentType | content                                   | editor HTML (what a save sends)                          |
// |-------------|-------------------------------------------|----------------------------------------------------------|
// | text        | inline HTML (strong, em, u, s, br)        | <p>…</p>                                                 |
// | center      | inline HTML                               | <p data-kind="center">…</p>                              |
// | quote       | inline HTML                               | <p data-kind="quote">…</p>                               |
// | break       | "* * *" (ignored)                         | <hr>                                                     |
// | image       | the picture's https address (NOT HTML);   | <p data-kind="image"><img src="…">caption</p>            |
// |             | its caption is plain text in `caption`    |                                                          |
//
// An unknown kind (one a newer app may add) is shown as text. The app's editor leads; the web follows it.

export const PARAGRAPH_KINDS = ["text", "center", "quote", "break", "image"];

/** A paragraph's kind, `text` for a missing or unknown one. */
export const paragraphKind = (paragraph) => {
  const kind = typeof paragraph?.contentType === "string" ? paragraph.contentType.toLowerCase() : "text";
  return PARAGRAPH_KINDS.includes(kind) ? kind : "text";
};

const escapeText = (text) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeAttribute = (text) => escapeText(text).replace(/"/g, "&quot;");

/** A picture address the site may load: absolute http(s) only, as the API keeps them. */
export const safeImageSrc = (url) => {
  const value = typeof url === "string" ? url.trim() : "";
  return /^https?:\/\/[^\s]+$/i.test(value) ? value : null;
};

// Paragraphs stored before format v1 may still be opened with the editor's <p class="…">: their inline content.
const legacyInline = (content) => {
  const html = String(content ?? "").trim();
  if (/^<p[\s>]/i.test(html)) {
    return html.replace(/^<p[^>]*>/i, "").replace(/<\/p>$/i, "");
  }
  return html;
};

/** One saved paragraph as the editor's HTML block. */
export const paragraphToEditorHtml = (paragraph) => {
  // Older callers passed the content string alone: a text paragraph.
  const p = typeof paragraph === "string" ? { content: paragraph, contentType: "text" } : paragraph ?? {};
  switch (paragraphKind(p)) {
    case "break":
      return "<hr>";
    case "image": {
      const src = safeImageSrc(p.content);
      if (!src) return "";
      const caption = p.caption ? escapeText(p.caption) : "";
      return `<p data-kind="image"><img src="${escapeAttribute(src)}">${caption}</p>`;
    }
    case "center":
      return `<p data-kind="center">${legacyInline(p.content)}</p>`;
    case "quote":
      return `<p data-kind="quote">${legacyInline(p.content)}</p>`;
    default:
      return `<p>${legacyInline(p.content)}</p>`;
  }
};

/**
 * A saved chapter's paragraphs as the editor's HTML, one block each, kinds and pictures kept. Bare paragraphs joined with
 * blank lines instead read as ONE paragraph: saving then merged the whole chapter and the server deleted every
 * paragraph's comments. Loading pictures as their address text (as the web did) turned them into text on save.
 */
export const paragraphsToEditorHtml = (paragraphs) =>
  [...(paragraphs ?? [])]
    .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
    .map(paragraphToEditorHtml)
    .join("");

/**
 * A paragraph as plain text for a preview (the comment panel's quote of the paragraph): its words; a picture's caption,
 * or «صورة» without one; nothing for a scene break.
 */
export const paragraphPreviewText = (paragraph, htmlToText) => {
  switch (paragraphKind(paragraph)) {
    case "break":
      return "";
    case "image":
      return paragraph.caption?.trim() || "صورة";
    default:
      return htmlToText(paragraph.content ?? "").trim();
  }
};
