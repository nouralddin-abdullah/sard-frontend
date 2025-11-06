import { useQuery } from "@tanstack/react-query";
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
export const useGetReadingHistory = (pageNumber = 1, pageSize = 20) => {
  const token = Cookies.get(TOKEN_KEY);

  return useQuery({
    queryKey: ["readingHistory", pageNumber, pageSize],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE_URL}/api/library/reading-progress`,
        {
          params: { pageNumber, pageSize },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: Boolean(token), // Only fetch if user is authenticated
  });
};
