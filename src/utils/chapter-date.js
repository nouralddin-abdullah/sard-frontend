import { toUtcIso } from "./date.js";

/**
 * When a chapter came out, as a UTC ISO string (or null): its publishedAt, the first time it was published, kept if it
 * is unpublished and published again (backend #39). A draft published days after it was written came out then, not
 * when it was created, which is its createdAt. An API from before publishedAt sends only createdAt, the best date there
 * is then; a draft never published (publishedAt null, in the author's list) is dated by it too.
 */
export const chapterDate = (chapter) => toUtcIso(chapter?.publishedAt ?? chapter?.createdAt);

/**
 * What chapterDate is for a list that has drafts too (the author's): "نُشر" when the chapter has come out, even if it
 * is a draft again now, and "أُنشئ" for a draft never published, dated when it was created. Null when it can't be
 * told: from an API without publishedAt, or for a published chapter without one (only code from before it could
 * publish one), whose creation date isn't when it came out.
 */
export const chapterDateLabel = (chapter) => {
  if (!chapter || chapter.publishedAt === undefined) return null;
  if (chapter.publishedAt) return "نُشر";
  return (chapter.status ?? "").toLowerCase() === "published" ? null : "أُنشئ";
};
