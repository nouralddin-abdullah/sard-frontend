// Chapter paragraphs as the API stores them (backend: ParagraphText.Split): each is the inside of one <p> block,
// some still opened with the editor's <p class="…">, older ones bare text or inline HTML.

/** One saved paragraph as its own <p> block for the editor. */
export const paragraphToEditorHtml = (content = "") => {
  const html = content.trim();
  if (/^<p[\s>]/i.test(html)) {
    return /<\/p>$/i.test(html) ? html : `${html}</p>`;
  }
  return `<p>${html}</p>`;
};

/**
 * A saved chapter's paragraphs as the editor's HTML, one <p> each. Bare paragraphs joined with blank lines instead
 * read as ONE paragraph: saving then merged the whole chapter, and the server deleted every paragraph's comments.
 */
export const paragraphsToEditorHtml = (paragraphs) =>
  [...paragraphs]
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((p) => paragraphToEditorHtml(p.content))
    .join("");
