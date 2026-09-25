/**
 * An error from a cover upload, carrying the API's cover error code (e.g. "cover_too_small") when there is one, so
 * the form can show a translated message (utils/cover-image.js: coverErrorKey).
 */
export class CoverUploadError extends Error {
  constructor(message, code = null, status = 0) {
    super(message);
    this.name = "CoverUploadError";
    this.code = code;
    this.status = status;
  }
}

/** Reads a failed response: `{ errorCode, message }` from the handlers, or FluentValidation's `{ errors }`. */
export const coverUploadErrorFrom = async (response, fallbackMessage) => {
  let body = null;
  try {
    body = await response.json();
  } catch {
    // Not JSON (e.g. a proxy error page).
  }
  const firstValidationMessage = body?.errors ? Object.values(body.errors).flat()[0] : null;
  return new CoverUploadError(
    body?.message || firstValidationMessage || fallbackMessage,
    body?.errorCode ?? null,
    response.status
  );
};
