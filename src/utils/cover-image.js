// Novel covers. The API stores every cover in one standard (backend: Application/Covers/NovelCovers.cs):
//   novel-covers/{novelId}/{coverId}/320.webp, 640.webp, 960.webp  (2:3, the largest is novel.coverImageUrl)
//   novel-covers/{novelId}/{coverId}/cover.jpg                      (480 px JPEG)
//   novel-covers/{novelId}/{coverId}/og.jpg                         (1200x630 share image)
// Smaller sizes are derived from the stored URL. Covers uploaded before the standard ("legacy") are single files of
// any shape; they are shown cropped to 2:3 until the admin backfill converts them.

/** Width / height of every cover. */
export const COVER_ASPECT = 2 / 3;
export const COVER_ASPECT_CSS = "2 / 3";

/** Widths the API makes (only those up to the source's width exist). */
export const COVER_WIDTHS = [320, 640, 960];

// Files the author can pick. The picked image is cropped and shrunk in the browser before it is sent, so it may be a
// large phone photo; the API receives a JPEG of at most COVER_UPLOAD_MAX_WIDTH px (well under its 5 MB limit).
export const COVER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const COVER_IMAGE_ACCEPT = COVER_IMAGE_TYPES.join(",");
export const COVER_INPUT_MAX_BYTES = 25 * 1024 * 1024;

/** Smallest crop the API accepts (NovelCovers.MinUploadWidth x MinUploadHeight). */
export const COVER_MIN_WIDTH = 300;
export const COVER_MIN_HEIGHT = 450;
/** Below this the cover still uploads, but the author is told it may look soft. */
export const COVER_RECOMMENDED_WIDTH = 960;
/** Width of the JPEG sent to the API (it keeps up to 960 px; a little extra lets it resample cleanly). */
export const COVER_UPLOAD_MAX_WIDTH = 1200;

const STANDARD_COVER = /\/novel-covers\/[0-9a-fA-F-]{36}\/[0-9a-f]{32}\/([1-9][0-9]{1,3})\.webp$/;

// Invisible direction marks and zero-width characters that sometimes end up in pasted titles (and so in legacy keys).
const INVISIBLE = /[\u200B-\u200D\u202A-\u202E\u2066-\u2069\uFEFF]/g;

// Returns the i18n key of the problem with a picked file, or null when it can be cropped.
export const getCoverImageError = (file) => {
  if (!COVER_IMAGE_TYPES.includes(file.type)) return "cover.errors.type";
  if (file.size > COVER_INPUT_MAX_BYTES) return "cover.errors.inputTooLarge";
  return null;
};

/**
 * A URL that browsers load exactly as stored. Legacy cover keys contain spaces (sometimes trailing), Arabic and
 * brackets; a raw trailing space is dropped by the browser's URL parser, which asked the bucket for another key
 * (13 of 75 covers were broken that way). Every path segment is percent-encoded instead.
 */
export const encodeImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const cleaned = url.replace(INVISIBLE, "");
  const match = cleaned.match(/^(https?:\/\/[^/?#]+)([^?#]*)(.*)$/i);
  if (!match) return cleaned.trim() || null;
  const [, origin, path, rest] = match;
  const encodedPath = path
    .split("/")
    .map((segment) => {
      let decoded = segment;
      try {
        decoded = decodeURIComponent(segment);
      } catch {
        // A lone "%" in a legacy key: encode it as it is.
      }
      return encodeURIComponent(decoded);
    })
    .join("/");
  return `${origin}${encodedPath}${rest}`;
};

/** True for a cover stored in the standard (with 320/640/... siblings). */
export const isStandardCover = (url) => typeof url === "string" && STANDARD_COVER.test(url);

/**
 * `src`/`srcSet` for a cover. Standard covers get every stored width (the browser picks by `sizes`); legacy covers
 * get their single file. `preferredWidth` is the `src` fallback for browsers that ignore srcset.
 */
export const coverSources = (url, preferredWidth = 640) => {
  if (!url || typeof url !== "string") return null;
  const match = url.match(STANDARD_COVER);
  if (!match) {
    const src = encodeImageUrl(url);
    return src ? { src, srcSet: undefined } : null;
  }
  const full = Number(match[1]);
  const base = url.slice(0, url.lastIndexOf("/") + 1);
  const widths = [...COVER_WIDTHS.filter((w) => w < full), full];
  const fallback = widths.find((w) => w >= preferredWidth) ?? full;
  return {
    src: `${base}${fallback}.webp`,
    srcSet: widths.map((w) => `${base}${w}.webp ${w}w`).join(", "),
  };
};

/** The smallest stored version of a cover, for blurred backgrounds and tiny thumbnails. */
export const coverThumbnailUrl = (url) => {
  if (!url) return null;
  const match = url.match(STANDARD_COVER);
  if (!match) return encodeImageUrl(url);
  const full = Number(match[1]);
  return `${url.slice(0, url.lastIndexOf("/") + 1)}${Math.min(COVER_WIDTHS[0], full)}.webp`;
};

/** The 1200x630 share image of a standard cover, or null for a legacy cover. */
export const coverShareImageUrl = (url) =>
  isStandardCover(url) ? `${url.slice(0, url.lastIndexOf("/") + 1)}og.jpg` : null;

/** Maps an API cover error code (CoverErrorCodes in the backend) to its i18n key. */
export const coverErrorKey = (code) =>
  ({
    cover_unsupported_format: "cover.errors.type",
    cover_unreadable: "cover.errors.unreadable",
    cover_too_small: "cover.errors.tooSmall",
    cover_too_many_pixels: "cover.errors.tooManyPixels",
    cover_file_too_large: "cover.errors.fileTooLarge",
  })[code] ?? null;
