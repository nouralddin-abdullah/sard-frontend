import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to fetch user's reading progress/library
 * API: GET /api/library/reading-progress
 * 
 * Response Schema:
 * {
 *   items: [
 *     {
 *       novelId: "uuid",
 *       title: "string",
 *       slug: "string",
 *       coverImageUrl: "string",
 *       totalChapters: number,
 *       totalAverageScore: number,
 *       totalViews: number,
 *       lastReadChapterId: "uuid",
 *       lastReadChapterNumber: number,
 *       lastReadChapterTitle: "string",
 *       progressPercentage: number (0-100),
 *       lastReadAt: "datetime",
 *       author: {
 *         userName: "string",
 *         displayName: "string",
 *         profilePhoto: "string"
 *       }
 *     }
 *   ],
 *   totalPages: number,
 *   totalItemsCount: number,
 *   itemsFrom: number,
 *   itemsTo: number
 * }
 */
const fetchReadingHistory = async (pageNumber, pageSize) => {
  const token = Cookies.get(TOKEN_KEY);
  const { data } = await axios.get(
    `${BASE_URL}/api/library/reading-progress`,
    {
      params: { pageNumber, pageSize },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return data;
};

export const useGetReadingHistory = (pageNumber = 1, pageSize = 20) => {
  const token = Cookies.get(TOKEN_KEY);

  return useQuery({
    queryKey: ["readingHistory", pageNumber, pageSize],
    queryFn: () => fetchReadingHistory(pageNumber, pageSize),
    enabled: Boolean(token), // Only fetch if user is authenticated
  });
};

/**
 * The whole library page by page ("load more"), newest reads first.
 * Shares the "readingHistory" key prefix, so tracking progress refreshes it too.
 */
export const useGetReadingHistoryPages = (pageSize = 20) => {
  const token = Cookies.get(TOKEN_KEY);

  return useInfiniteQuery({
    queryKey: ["readingHistory", "pages", pageSize],
    queryFn: ({ pageParam }) => fetchReadingHistory(pageParam, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      allPages.length < (lastPage?.totalPages ?? 0) ? allPages.length + 1 : undefined,
    enabled: Boolean(token), // Only fetch if user is authenticated
  });
};
