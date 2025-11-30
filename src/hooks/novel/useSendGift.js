import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const sendGift = async ({ giftId, novelId, count }) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/gift/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      giftId,
      novelId,
      count,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to send gift");
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
      if (variables?.novelId) {
        queryClient.invalidateQueries({ queryKey: ["novel", variables.novelId] });
        // Refresh latest gifts list
        queryClient.invalidateQueries({ queryKey: ["recent-gifts", variables.novelId] });
      }
    },
  });
};
