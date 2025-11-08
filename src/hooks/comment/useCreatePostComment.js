import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to create a post comment or reply
 */
export const useCreatePostComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content, attachedImage, parentCommentId }) => {
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
        `${BASE_URL}/api/comment/post/${postId}`,
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

      return { success: true };
    },
    onMutate: async ({ postId, content, attachedImage, parentCommentId, currentUser }) => {
      // Cancel outgoing refetches
      if (!parentCommentId) {
        await queryClient.cancelQueries({ queryKey: ["postComments", postId] });
      } else {
        await queryClient.cancelQueries({ queryKey: ["commentReplies", parentCommentId] });
      }

      // Create optimistic comment
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        user: {
          id: currentUser?.id || "",
          displayName: currentUser?.displayName || "أنت",
          userName: currentUser?.userName || "",
          profilePhoto: currentUser?.profilePhoto || null,
        },
        content,
        attachedImageUrl: attachedImage ? URL.createObjectURL(attachedImage) : null,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        isLikedByCurrentUser: false,
        totalRepliesCount: 0,
        hasMoreReplies: false,
      };

      // Snapshot previous value
      const previousData = parentCommentId
        ? queryClient.getQueryData(["commentReplies", parentCommentId])
        : queryClient.getQueryData(["postComments", postId]);

      // Optimistically update
      if (!parentCommentId) {
        // Add to post comments
        queryClient.setQueryData(["postComments", postId], (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    items: [optimisticComment, ...page.items],
                    totalItemsCount: page.totalItemsCount + 1,
                  }
                : page
            ),
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

      return { previousData, parentCommentId, postId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.parentCommentId) {
        queryClient.setQueryData(["commentReplies", context.parentCommentId], context.previousData);
      } else if (context?.previousData) {
        queryClient.setQueryData(["postComments", context.postId], context.previousData);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      if (!variables.parentCommentId) {
        // Invalidate post comments
        queryClient.invalidateQueries({ queryKey: ["postComments", variables.postId] });
        // Also invalidate the user posts to update comment count
        queryClient.invalidateQueries({ queryKey: ["userPosts"] });
      } else {
        // Invalidate replies
        queryClient.invalidateQueries({ queryKey: ["commentReplies", variables.parentCommentId] });
        // Also invalidate post comments to update reply count
        queryClient.invalidateQueries({ queryKey: ["postComments", variables.postId] });
      }
    },
  });
};
