import { useInfiniteQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to fetch paginated comment replies
 * @param {string} parentCommentId - Parent comment ID
 * @param {string} sorting - Sort order: 'recent', 'oldest', 'mostliked'
 */
export const useCommentReplies = (parentCommentId, sorting = "oldest") => {
  return useInfiniteQuery({
    queryKey: ["commentReplies", parentCommentId, sorting],
    queryFn: async ({ pageParam = 1 }) => {
      const token = Cookies.get(TOKEN_KEY);
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${BASE_URL}/api/comment/chapter/comments/${parentCommentId}?pageNumber=${pageParam}&pageSize=20&sorting=${sorting}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch replies");
      }

      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!parentCommentId,
  });
};
