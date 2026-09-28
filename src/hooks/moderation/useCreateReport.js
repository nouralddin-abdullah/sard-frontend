import { useMutation } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { apiError } from "../../utils/api-error";

// Values are the API's names (POST /api/reports): never translate or rename them. Target types are Comment (replies
// too), Review, Post, User, Novel and ReadingList.
export const REPORT_REASONS = [
  { value: "Spam", label: "محتوى مزعج أو إعلاني" },
  { value: "Harassment", label: "إساءة أو تحرّش" },
  { value: "Sexual", label: "محتوى جنسي" },
  { value: "Violence", label: "عنف" },
  { value: "HateSpeech", label: "خطاب كراهية" },
  { value: "Spoiler", label: "حرق للأحداث" },
  { value: "Other", label: "سبب آخر" },
];

export const REPORT_DETAILS_MAX_LENGTH = 1000;

// Resolves to {created}: false when the reporter already had an open report on the same thing (the API answers 200
// with that report and saves nothing new).
const createReport = async ({ targetType, targetId, reason, details }) => {
  const token = Cookies.get(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}/api/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ targetType, targetId, reason, details: details?.trim() || null }),
  });

  if (!response.ok) {
    const fallback =
      response.status === 429
        ? "أرسلت بلاغات كثيرة خلال وقت قصير، حاول مرة أخرى لاحقاً"
        : response.status === 401
          ? "سجّل الدخول لإرسال البلاغ"
          : "تعذّر إرسال البلاغ، حاول مرة أخرى";
    throw await apiError(response, fallback);
  }

  return { created: response.status === 201 };
};

export const useCreateReport = () =>
  useMutation({
    mutationKey: ["create-report"],
    mutationFn: createReport,
  });
