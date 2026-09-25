// Novel cover uploads. Must match the API's ImageValidationUtils (JPEG, PNG or WebP, at most 5 MB).
export const COVER_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const COVER_IMAGE_ACCEPT = COVER_IMAGE_TYPES.join(",");
export const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// Returns the i18n key of the problem with the file, or null when it can be uploaded.
export const getCoverImageError = (file) => {
  if (!COVER_IMAGE_TYPES.includes(file.type)) return "workPage.create.validation.invalidImage";
  if (file.size > COVER_IMAGE_MAX_BYTES) return "workPage.create.validation.maxSize";
  return null;
};
