import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { readApiError } from "../../utils/api-error";
import { invalidateNovelDetails } from "./invalidateNovelDetails";

const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";
const SIGNED_OUT = "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى.";
const FAILED = "تعذّر إرسال الهدية، حاول مرة أخرى.";

// What a refused gift says, by the API's code. A refused message (#31) costs nothing, and the gift can go without it.
const refusalMessage = (code, apiMessage, status) => {
  switch (code) {
    case "GiftMessageTooLong":
      // The API's message names its limit: «الرسالة طويلة: الحد الأقصى 200 حرف.»
      return apiMessage || "الرسالة طويلة، اختصرها ثم أعد الإرسال.";
    case "Blocked":
      return "لا يمكنك إرسال رسالة إلى هذا الكاتب. يمكنك إرسال الهدية دون رسالة.";
    default:
      return apiMessage || (status === 401 ? SIGNED_OUT : FAILED);
  }
};

// POST /api/gift/send. message is optional, sent only when there is one (the API trims it, and refuses a longer one than
// /api/app/config's gifts.messageMaxLength with 400 GiftMessageTooLong, or 403 Blocked when the author blocked the
// sender). Throws an Error with the Arabic text to show, and the code and status.
const sendGift = async ({ giftId, novelId, count, message }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  let response;
  try {
    response = await fetch(`${BASE_URL}/api/gift/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        giftId,
        novelId,
        count,
        ...(message ? { message } : {}),
      }),
    });
  } catch {
    throw new Error(OFFLINE);
  }

  if (!response.ok) {
    const { code, message: apiMessage } = await readApiError(response);
    const error = new Error(refusalMessage(code, apiMessage, response.status));
    error.code = code;
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const useSendGift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["send-gift"],
    mutationFn: sendGift,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after sending a gift
      // The gift was paid from the sender's wallet
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
      if (variables?.novelId) {
        invalidateNovelDetails(queryClient, variables.novelId);
        // Refresh latest gifts list
        queryClient.invalidateQueries({ queryKey: ["recent-gifts", variables.novelId] });
        queryClient.invalidateQueries({ queryKey: ["top-supporters", variables.novelId] });
      }
    },
  });
};
