import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import { toast } from "sonner";

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
      // Invalidate user posts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["user-posts"] });
      toast.success("تم حذف المنشور بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("فشل حذف المنشور. يرجى المحاولة مرة أخرى");
    },
  });
};
