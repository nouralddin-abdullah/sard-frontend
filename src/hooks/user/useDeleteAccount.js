import { useMutation, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { apiError } from "../../utils/api-error";

// The account a token belongs to (GET /api/User/my-profile), read fresh for that very token: the page shows it as the
// account being deleted, so it must never be a cached profile of someone who signed in before on this tab.
export const useAccountToDelete = (token) =>
  useQuery({
    queryKey: ["account-to-delete", token],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/api/User/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw await apiError(response, "تعذّر تحميل حسابك");
      }
      return response.json();
    },
    enabled: Boolean(token),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });

// DELETE /api/User/me: deletes the account of the token for good (204); pass the token whose account the page shows.
// The body confirms it's the member: { password } for an account with a password; nothing for one that signs in with
// Google only, whose token must then come from a sign-in in the last 10 minutes. Errors carry the API's code
// (ReauthenticationFailed, ReauthenticationRequired, AdminCannotDeleteAccount, TooManyDeletionAttempts) and its Arabic
// message.
const deleteAccount = async ({ token = Cookies.get(TOKEN_KEY), password } = {}) => {
  const body = password ? JSON.stringify({ password }) : undefined;
  const response = await fetch(`${BASE_URL}/api/User/me`, {
    method: "DELETE",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  if (!response.ok) {
    const fallback =
      response.status === 401
        ? "انتهت جلستك، سجّل الدخول مرة أخرى ثم أعد المحاولة"
        : response.status === 429
          ? "حاولت حذف حسابك مرات كثيرة، حاول مرة أخرى بعد ساعة"
          : "تعذّر حذف الحساب، حاول مرة أخرى";
    throw await apiError(response, fallback);
  }
};

export const useDeleteAccount = () =>
  useMutation({
    mutationKey: ["delete-account"],
    mutationFn: deleteAccount,
  });
