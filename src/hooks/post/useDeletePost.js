import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId) => {
      const accessToken = Cookies.get(TOKEN_KEY);

      if (!accessToken) {
        throw new Error("No access token found");
      }

      const response = await fetch(`${BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete post");
      }

      return postId;
    },
    onSuccess: (postId) => {
      // Refresh the profile post lists (key used by useGetUserPosts) so the post disappears without a reload.
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      queryClient.removeQueries({ queryKey: ["post", postId] });
      queryClient.removeQueries({ queryKey: ["postComments", postId] });
    },
    // Success/error toasts are shown by the caller (AboutMePost); showing them here too doubled them.
    onError: (error) => {
      console.error("Error deleting post:", error);
    },
  });
};
