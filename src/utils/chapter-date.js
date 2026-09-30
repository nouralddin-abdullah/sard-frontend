import { toUtcIso } from "./date.js";

/**
 * When a chapter came out, as a UTC ISO string (or null): its publishedAt, the first time it was published, kept if it
 * is unpublished and published again (backend #39). A draft published days after it was written came out then, not
 * when it was written, which is its createdAt. An API from before publishedAt sends only createdAt, the best date there
 * is then; so does a draft never published (publishedAt null, in the author's list), dated when it was written.
 */
export const chapterDate = (chapter) => toUtcIso(chapter?.publishedAt ?? chapter?.createdAt);
