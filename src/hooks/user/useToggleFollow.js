import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const toggleFollow = async (paramsObj) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  const { isFollowed, userId } = paramsObj;
  console.log(isFollowed);

  const conditionalBody = isFollowed
    ? {
        userToUnFollowId: userId,
      }
    : {
        userIdToFollow: userId,
      };

  try {
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

    if (!response.ok)
      throw new Error(
        `Failed to ${isFollowed ? "Unfollow" : "Follow"}, try again`
      );

    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
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
