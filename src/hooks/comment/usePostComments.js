import { useInfiniteQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to fetch paginated post comments
 * @param {string} postId - Post ID
 * @param {string} sorting - Sort order: 'recent', 'oldest', 'popular'
 * @param {object} options - Additional options (e.g., enabled)
 */
export const usePostComments = (postId, sorting = "recent", options = {}) => {
  return useInfiniteQuery({
    queryKey: ["postComments", postId, sorting],
    queryFn: async ({ pageParam = 1 }) => {
      const token = Cookies.get(TOKEN_KEY);
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${BASE_URL}/api/comment/post/${postId}?pageNumber=${pageParam}&pageSize=20&sorting=${sorting}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }

      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!postId && (options.enabled !== false),
    ...options,
  });
};
