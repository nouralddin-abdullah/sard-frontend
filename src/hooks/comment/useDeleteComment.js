import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to delete a comment
 */
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const token = Cookies.get(TOKEN_KEY);
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(
        `${BASE_URL}/api/comment/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // API returns plain text error messages
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete comment");
      }

      return commentId;
    },
    onMutate: async (commentId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chapterComments"] });
      await queryClient.cancelQueries({ queryKey: ["postComments"] });
      await queryClient.cancelQueries({ queryKey: ["commentReplies"] });

      // Snapshot previous values
      const previousChapterComments = queryClient.getQueriesData({ queryKey: ["chapterComments"] });
      const previousPostComments = queryClient.getQueriesData({ queryKey: ["postComments"] });
      const previousReplies = queryClient.getQueriesData({ queryKey: ["commentReplies"] });

      // Optimistically remove from chapter comments
      queryClient.setQueriesData({ queryKey: ["chapterComments"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((comment) => comment.id !== commentId),
            totalItemsCount: Math.max(0, page.totalItemsCount - 1),
          })),
        };
      });

      // Optimistically remove from post comments
      queryClient.setQueriesData({ queryKey: ["postComments"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((comment) => comment.id !== commentId),
            totalItemsCount: Math.max(0, page.totalItemsCount - 1),
          })),
        };
      });

      // Optimistically remove from replies
      queryClient.setQueriesData({ queryKey: ["commentReplies"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((reply) => reply.id !== commentId),
            totalItemsCount: Math.max(0, page.totalItemsCount - 1),
          })),
        };
      });

      return { previousChapterComments, previousPostComments, previousReplies };
    },
    onError: (err, commentId, context) => {
      // Rollback on error
      context?.previousChapterComments?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousPostComments?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      context?.previousReplies?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({
        queryKey: ["chapterComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["postComments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["commentReplies"],
      });
      
      // Invalidate chapter data to update commentsCount
      queryClient.invalidateQueries({
        queryKey: ["chapter"],
      });
    },
  });
};
