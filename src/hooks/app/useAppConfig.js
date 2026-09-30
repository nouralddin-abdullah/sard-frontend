import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

// GET /api/app/config: anonymous, and cached by the API for five minutes. The mobile apps read their versions and the
// maintenance flag from it; the web reads what gifts (#31) and posts (#43) accept.
const fetchAppConfig = async () => {
  const response = await fetch(`${BASE_URL}/api/app/config`);
  if (!response.ok) {
    throw new Error("تعذّر تحميل إعدادات سرد");
  }
  return response.json();
};

export const useAppConfig = (enabled = true) =>
  useQuery({
    queryKey: ["app-config"],
    queryFn: fetchAppConfig,
    enabled,
    staleTime: 1000 * 60 * 5,
  });

// The longest message a gift can carry, in user-perceived characters, or null while unknown or when the API doesn't
// accept messages: an older API has no gifts.messageMaxLength and would drop a message without a word, and the web can
// go live before the API does. So no message box without it.
export const useGiftMessageMaxLength = (enabled = true) => {
  const { data } = useAppConfig(enabled);
  const maxLength = data?.gifts?.messageMaxLength;
  return Number.isInteger(maxLength) && maxLength > 0 ? maxLength : null;
};

// What a new post accepts (#43): the longest text in user-perceived characters, the largest picture in bytes (5 MB) and
// the picture types. The API checks the same numbers; these are used until /api/app/config answers, and against an API
// that doesn't announce them.
export const POST_LIMITS = Object.freeze({
  contentMaxLength: 5000,
  imageMaxBytes: 5 * 1024 * 1024,
  imageTypes: Object.freeze(["image/jpeg", "image/png", "image/webp"]),
});

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

// The limits GET /api/app/config gives as posts, each checked, or POST_LIMITS'.
export const usePostLimits = (enabled = true) => {
  const { data } = useAppConfig(enabled);
  const posts = data?.posts;
  const imageTypes = posts?.imageTypes;
  return {
    contentMaxLength: isPositiveInteger(posts?.contentMaxLength) ? posts.contentMaxLength : POST_LIMITS.contentMaxLength,
    imageMaxBytes: isPositiveInteger(posts?.imageMaxBytes) ? posts.imageMaxBytes : POST_LIMITS.imageMaxBytes,
    imageTypes:
      Array.isArray(imageTypes) && imageTypes.length > 0 && imageTypes.every((type) => typeof type === "string")
        ? imageTypes
        : POST_LIMITS.imageTypes,
  };
};
