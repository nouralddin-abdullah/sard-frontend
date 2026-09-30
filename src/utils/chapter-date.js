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
 * is a draft again now, and "أُنشئ" for a draft never published, dated when it was created. Null from an API without
 * publishedAt, which can't tell the two apart.
 */
export const chapterDateLabel = (chapter) => {
  if (!chapter || chapter.publishedAt === undefined) return null;
  return chapter.publishedAt ? "نُشر" : "أُنشئ";
};
