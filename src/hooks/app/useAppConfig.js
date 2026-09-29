import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

// GET /api/app/config: anonymous, and cached by the API for five minutes. The mobile apps read their versions and the
// maintenance flag from it; the web reads what gifts accept (#31).
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
