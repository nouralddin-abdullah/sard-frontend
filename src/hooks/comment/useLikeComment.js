import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to like a comment
 */
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const token = Cookies.get(TOKEN_KEY);
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${BASE_URL}/api/comment/${commentId}/like`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // API returns plain text error messages
        const errorText = await response.text();
        throw new Error(errorText || "Failed to like comment");
      }

      // Try to parse JSON, fallback to success message
      try {
        return await response.json();
      } catch {
        return { success: true };
      }
    },
    onMutate: async (commentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chapterComments"] });
      await queryClient.cancelQueries({ queryKey: ["commentReplies"] });

      // Snapshot previous values
      const previousChapterComments = queryClient.getQueriesData({ queryKey: ["chapterComments"] });
      const previousReplies = queryClient.getQueriesData({ queryKey: ["commentReplies"] });

      // Optimistically update comments
      queryClient.setQueriesData({ queryKey: ["chapterComments"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLikedByCurrentUser: true,
                    likesCount: comment.likesCount + 1,
                  }
                : comment
            ),
          })),
        };
      });

      // Optimistically update replies
      queryClient.setQueriesData({ queryKey: ["commentReplies"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLikedByCurrentUser: true,
                    likesCount: reply.likesCount + 1,
                  }
                : reply
            ),
          })),
        };
      });

      return { previousChapterComments, previousReplies };
    },
    onError: (err, commentId, context) => {
      // Rollback on error
      context?.previousChapterComments.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousReplies.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["chapterComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["commentReplies"],
      });
    },
  });
};
