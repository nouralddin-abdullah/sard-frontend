import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to create a comment or reply
 */
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ chapterId, content, attachedImage, parentCommentId }) => {
      const token = Cookies.get(TOKEN_KEY);
      
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();
      formData.append("content", content);
      
      if (attachedImage) {
        formData.append("attachedImage", attachedImage);
      }
      
      if (parentCommentId) {
        formData.append("parentCommentId", parentCommentId);
      }

      const response = await fetch(
        `${BASE_URL}/api/comment/chapter/${chapterId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create comment");
      }

      // API returns 201 Created with no body
      return { success: true };
    },
    onMutate: async ({ chapterId, content, attachedImage, parentCommentId, currentUser }) => {
      // Cancel outgoing refetches
      if (!parentCommentId) {
        await queryClient.cancelQueries({ queryKey: ["chapterComments", chapterId] });
      } else {
        await queryClient.cancelQueries({ queryKey: ["commentReplies", parentCommentId] });
      }

      // Create optimistic comment
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        user: {
          id: currentUser?.id || "temp-user",
          userName: currentUser?.userName || "أنت",
          displayName: currentUser?.displayName || "أنت",
          profilePhoto: currentUser?.profilePhoto || null,
        },
        content: content,
        attachedImageUrl: attachedImage ? URL.createObjectURL(attachedImage) : null,
        parentCommentId: parentCommentId || null,
        likesCount: 0,
        isLikedByCurrentUser: false,
        createdAt: new Date().toISOString(),
        totalRepliesCount: 0,
        hasMoreReplies: false,
      };

      // Snapshot the previous value
      const previousData = parentCommentId
        ? queryClient.getQueryData(["commentReplies", parentCommentId])
        : queryClient.getQueryData(["chapterComments", chapterId]);

      // Optimistically update
      if (!parentCommentId) {
        // Add to chapter comments
        queryClient.setQueryData(["chapterComments", chapterId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === 0) {
                return {
                  ...page,
                  items: [optimisticComment, ...page.items],
                  totalItemsCount: page.totalItemsCount + 1,
                };
              }
              return page;
            }),
          };
        });
      } else {
        // Add to replies
        queryClient.setQueryData(["commentReplies", parentCommentId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) => {
              if (index === old.pages.length - 1) {
                return {
                  ...page,
                  items: [...page.items, optimisticComment],
                  totalItemsCount: page.totalItemsCount + 1,
                };
              }
              return page;
            }),
          };
        });
      }

      return { previousData, parentCommentId, chapterId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.parentCommentId) {
        queryClient.setQueryData(["commentReplies", context.parentCommentId], context.previousData);
      } else {
        queryClient.setQueryData(["chapterComments", context.chapterId], context.previousData);
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure data consistency
      if (!variables.parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: ["chapterComments", variables.chapterId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["commentReplies", variables.parentCommentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["chapterComments", variables.chapterId],
        });
      }
      
      // Invalidate chapter data to update commentsCount
      queryClient.invalidateQueries({
        queryKey: ["chapter"],
      });
    },
  });
};
