import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { readApiError } from "../../utils/api-error";

// What a refused cancel says, by the API's code, when the API gave no Arabic message of its own.
const MESSAGES_BY_CODE = {
  RequestNotFound: "طلب السحب غير موجود",
  AlreadyProcessed: "عولج طلب السحب هذا من قبل، فلا يمكن إلغاؤه.",
};

const SIGNED_OUT = "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى.";
const OFFLINE = "حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.";
const FAILED = "تعذّر إلغاء طلب السحب، حاول مرة أخرى.";

// DELETE /api/wallet/withdraw/{id}: the member cancels their own pending withdrawal request. 204, also when it was
// cancelled already; 404 RequestNotFound; 409 AlreadyProcessed once an admin approved or rejected it (the Arabic
// message says which). Throws an Error with the Arabic message to show, and the code and status.
const cancelWithdrawal = async (requestId) => {
  let response;
  try {
    response = await fetch(`${BASE_URL}/api/wallet/withdraw/${encodeURIComponent(requestId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${Cookies.get(TOKEN_KEY)}` },
    });
  } catch {
    throw new Error(OFFLINE);
  }
  if (response.ok) {
    return;
  }

  const { code, message } = await readApiError(response);
  const error = new Error(message || MESSAGES_BY_CODE[code] || (response.status === 401 ? SIGNED_OUT : FAILED));
  error.code = code;
  error.status = response.status;
  throw error;
};

export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["cancel-withdrawal"],
    mutationFn: cancelWithdrawal,
    // Cancelled, or decided by an admin meanwhile: either way the history and what can be withdrawn changed.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawHistory"] });
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
};
