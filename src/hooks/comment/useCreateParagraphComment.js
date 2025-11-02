import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";
import { useGetLoggedInUser } from "../user/useGetLoggedInUser";

/**
 * Hook to create a paragraph comment or reply
 */
export const useCreateParagraphComment = () => {
  const queryClient = useQueryClient();
  const { data: currentUser } = useGetLoggedInUser();

  return useMutation({
    mutationFn: async ({ paragraphId, content, attachedImage, parentCommentId }) => {
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
        `${BASE_URL}/api/comment/paragraph/${paragraphId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create comment");
      }

      // Backend returns 201 Created with no body
      return { success: true };
    },
    onMutate: async ({ paragraphId, content, attachedImage, parentCommentId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(["paragraphComments", paragraphId]);

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(["paragraphComments", paragraphId, "recent"]);

      // Optimistically update
      queryClient.setQueryData(["paragraphComments", paragraphId, "recent"], (old) => {
        if (!old || !currentUser) return old;

        const tempComment = {
          id: `temp-${Date.now()}`,
          content,
          attachedImageUrl: attachedImage ? URL.createObjectURL(attachedImage) : null,
          user: {
            id: currentUser.id,
            userName: currentUser.userName,
            displayName: currentUser.displayName,
            profilePhoto: currentUser.profilePhoto,
          },
          likesCount: 0,
          isLikedByCurrentUser: false,
          totalRepliesCount: 0,
          hasMoreReplies: false,
          createdAt: new Date().toISOString(),
        };

        const newPages = [...old.pages];
        if (newPages.length > 0) {
          if (parentCommentId) {
            // It's a reply - backend will handle it
            return old;
          } else {
            // It's a new comment - add to top
            newPages[0] = {
              ...newPages[0],
              items: [tempComment, ...newPages[0].items],
              totalItemsCount: (newPages[0].totalItemsCount || 0) + 1,
            };
          }
        }

        return {
          ...old,
          pages: newPages,
        };
      });

      return { previousComments };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(
          ["paragraphComments", variables.paragraphId, "recent"],
          context.previousComments
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to get the real data from server
      queryClient.invalidateQueries(["paragraphComments", variables.paragraphId]);
    },
  });
};
