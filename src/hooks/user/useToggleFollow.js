import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { apiError } from "../../utils/api-error";

const toggleFollow = async (paramsObj) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  const { isFollowed, userId } = paramsObj;

  const conditionalBody = isFollowed
    ? {
        userToUnFollowId: userId,
      }
    : {
        userIdToFollow: userId,
      };

  const response = await fetch(
    `${BASE_URL}/api/User/${isFollowed ? "unfollow" : "follow"}`,
    {
      method: isFollowed ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(conditionalBody),
    }
  );

  // A refusal (blocked, not signed in...) reaches the caller, which undoes its optimistic toggle.
  if (!response.ok) {
    throw await apiError(response, isFollowed ? "تعذّر إلغاء المتابعة، حاول مرة أخرى" : "تعذّرت المتابعة، حاول مرة أخرى");
  }

  // 204: already following (or already not), which is what was asked.
  return response.status === 204 ? { success: true } : response.json();
};

export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["follow-user"],
    mutationFn: toggleFollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      // User search results carry isFollowing; refetch so they don't show a stale follow button.
      queryClient.invalidateQueries({ queryKey: ["searchUsers"] });
    },
  });
};
