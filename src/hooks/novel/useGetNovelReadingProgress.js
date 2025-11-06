import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

/**
 * Hook to fetch reading progress for a specific novel
 * 
 * API: GET /api/library/novel/{novelId}/progress
 * 
 * Response:
 * {
 *   hasProgress: boolean,
 *   progress: {
 *     novelId: "uuid",
 *     lastReadChapterId: "uuid",
 *     lastReadChapterNumber: number,
 *     progressPercentage: number,
 *     lastReadAt: "datetime"
 *   } | null
 * }
 * 
 * This helps show which chapters the user has read on the novel page
 */
export const useGetNovelReadingProgress = (novelId) => {
  const token = Cookies.get(TOKEN_KEY);

  return useQuery({
    queryKey: ["novelReadingProgress", novelId],
    queryFn: async () => {
      const { data } = await axios.get(
        `${BASE_URL}/api/library/novel/${novelId}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: Boolean(token && novelId), // Only fetch if user is authenticated and novelId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
